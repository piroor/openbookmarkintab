var OpenBookmarksInNewTab = {
	init : function()
	{
		if (!('PlacesUIUtils' in window)) return;

		eval('PlacesUIUtils.openNodeWithEvent = '+
			PlacesUIUtils.openNodeWithEvent.toSource().replace(
				'whereToOpenLink(aEvent)',
				'OpenBookmarksInNewTab.convertWhereToOpenLink($&)'
			)
		);

		eval('PlacesUIUtils._openTabset = '+
			PlacesUIUtils._openTabset.toSource().replace(
				'if (where == "window") {',
				<![CDATA[
					where = OpenBookmarksInNewTab.convertWhereToOpenLink(where, aEvent);
					$&
				]]>
			)
		);

		document.getElementById('placesContext_open').removeAttribute('default');
		document.getElementById('placesContext_open:newtab').setAttribute('default', true);
	},

	convertWhereToOpenLink : function(aWhere, aEvent)
	{
		var isFiredOnFolderItem = (
				aEvent &&
				(
					( // tree
						aEvent.target.localName == 'treechildren' &&
						aEvent.currentTarget.selectedNode &&
						!PlacesUtils.nodeIsURI(aEvent.currentTarget.selectedNode) &&
						PlacesUtils.nodeIsContainer(aEvent.currentTarget.selectedNode)
					) ||
					( // toolbar, menu
						aEvent.originalTarget &&
						aEvent.originalTarget.node &&
						PlacesUtils.nodeIsContainer(aEvent.originalTarget.node)
					)
				)
			);
		switch (aWhere)
		{
			case 'current':
				return isFiredOnFolderItem ? aWhere : 'tab' ;
			case 'tab':
			case 'tabshifted':
				var shouldReverse = Components
						.classes['@mozilla.org/preferences;1']
						.getService(Components.interfaces.nsIPrefBranch)
						.getBoolPref('extensions.openbookmarkintab.reverseBehaviorForMiddleClick');
				return isFiredOnFolderItem || !shouldReverse ? aWhere : 'current' ;
			default:
				return aWhere;
		}
	},

	handleEvent : function(aEvent)
	{
		switch (aEvent.type)
		{
			case 'load':
				window.removeEventListener('load', this, false);
				this.init();
				return;
		}
	}
};

window.addEventListener('load', OpenBookmarksInNewTab, false);
