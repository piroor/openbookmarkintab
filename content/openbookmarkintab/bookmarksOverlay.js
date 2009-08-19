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
					where = OpenBookmarksInNewTab.convertWhereToOpenLink(where);
					$&
				]]>
			)
		);

	},

	convertWhereToOpenLink : function(aWhere)
	{
		switch (aWhere)
		{
			case 'current':
				return 'tab';
			case 'tab':
			case 'tabshifted':
				return 'current';
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
