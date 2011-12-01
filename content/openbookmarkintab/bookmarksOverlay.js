var OpenBookmarksInNewTab = {
	kPLACE_CURRENT    : 0,
	kPLACE_NEW_TAB    : 1,
	kPLACE_NEW_WINDOW : 2,
	kPLACE_IN_BACKGROUND : 256,
	get place()
	{
		var pref = Components
					.classes['@mozilla.org/preferences;1']
					.getService(Components.interfaces.nsIPrefBranch);
		var place = pref.getIntPref('extensions.openbookmarkintab.place');

		if (place & this.kPLACE_NEW_TAB) {
			return place & this.kPLACE_IN_BACKGROUND ? 'tabshifted' : 'tab' ;
		}

		if (place & this.kPLACE_NEW_WINDOW) {
			return 'window';
		}

		return 'current';
	},

	init : function()
	{
		if (!('PlacesUIUtils' in window))
			return;

		if (!PlacesUIUtils.__openbookmarkintab__done) {
			eval('PlacesUIUtils.openNodeWithEvent = '+
				PlacesUIUtils.openNodeWithEvent.toSource().replace(
					/(([^\s]*)whereToOpenLink\(aEvent\))/,
					'$2OpenBookmarksInNewTab.convertWhereToOpenLink($1, null, aNode)'
				)
			);

			eval('PlacesUIUtils._openTabset = '+
				PlacesUIUtils._openTabset.toSource().replace(
					'if (where == "window") {',
					<![CDATA[
						where = browserWindow.OpenBookmarksInNewTab.convertWhereToOpenLink(where, aEvent);
						$&
					]]>
				)
			);

			PlacesUIUtils.__openbookmarkintab__done = true;
		}

		if ('HistoryMenu' in window &&
			HistoryMenu.prototype._onCommand) {
			let source = HistoryMenu.prototype._onCommand.toSource();
			if (source.indexOf('OpenBookmarksInNewTab') < 0) {
				eval('HistoryMenu.prototype._onCommand = '+source.replace(
					/openUILink\(/g,
					'OpenBookmarksInNewTab.openUILink('
				));
			}
		}

		document.getElementById('placesContext_open').removeAttribute('default');
		document.getElementById('placesContext_open:newtab').setAttribute('default', true);
	},

	openUILink : function(aURI, aEvent, aIgnoreButton, aIgnoreAlt, aAllowKeywordFixup, aPostData, aReferrer)
	{
		var where = whereToOpenLink(aEvent, aIgnoreButton, aIgnoreAlt);
		where = this.convertWhereToOpenLink(where, aEvent, null, aURI);
		return openUILinkIn(aURI, where, aAllowKeywordFixup, aPostData, aReferrer);
	},

	convertWhereToOpenLink : function(aWhere, aEvent, aNode, aURI)
	{
		var pref = Components
					.classes['@mozilla.org/preferences;1']
					.getService(Components.interfaces.nsIPrefBranch);

		if ( // clicking on folder
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
			)
			return aWhere;

		var uri = aURI ? aURI :
					aNode ? (aNode.uri || ''):
					'';
		if (uri.indexOf('javascript:') == 0) // bookmarklets
			return aWhere;

		if (
			aNode &&
			PlacesUtils.nodeIsURI(aNode) &&
			PlacesUIUtils.checkURLSecurity(aNode) &&
			PlacesUtils.nodeIsBookmark(aNode) &&
			( // web panels
				PlacesUtils.annotations.itemHasAnnotation(
					aNode.itemId,
					'bookmarkProperties/loadInSidebar'
				) &&
				Components
					.classes['@mozilla.org/appshell/window-mediator;1']
					.getService(Components.interfaces.nsIWindowMediator)
					.getMostRecentWindow('navigator:browser')
			)
			)
			return aWhere;

		var browserWindow = getTopWin();
		if (
			!browserWindow ||
			(
				pref.getBoolPref('extensions.openbookmarkintab.reuseBlankTab') &&
				browserWindow.gBrowser.currentURI.spec == 'about:blank' &&
				browserWindow.gBrowser.selectedTab.getAttribute('busy') != 'true'
			)
			)
			return aWhere;

		switch (aWhere)
		{
			case 'current':
				return this.place;
			case 'tab':
			case 'tabshifted':
				return !pref.getBoolPref('extensions.openbookmarkintab.reverseBehaviorForMiddleClick') ?
						aWhere :
						'current' ;
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
