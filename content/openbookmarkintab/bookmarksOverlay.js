/* ***** BEGIN LICENSE BLOCK ***** 
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Open Bookmarks in New Tab.
 *
 * The Initial Developer of the Original Code is YUKI "Piro" Hiroshi.
 * Portions created by the Initial Developer are Copyright (C) 2009-2016
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): YUKI "Piro" Hiroshi <piro.outsider.reflex@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ******/

var OpenBookmarksInNewTab = {
	get utils()
	{
		delete this.utils;
		var { OpenBookmarksInNewTabUtils } = Components.utils.import('resource://openbookmarkintab-modules/utils.js', {});
		return this.utils = OpenBookmarksInNewTabUtils;
	},

	get CustomizableUI()
	{
		delete this.CustomizableUI;
		var { CustomizableUI } = Components.utils.import('resource:///modules/CustomizableWidgets.jsm', {});
		return this.CustomizableUI = CustomizableUI;
	},

	get panelUIHistoryItems()
	{
		return document.getElementById('PanelUI-historyItems');
	},

	init : function()
	{
		if (!('PlacesUIUtils' in window))
			return;

		this.utils.initWindow(window);

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

		this.panelUIHistoryItems.addEventListener('click', this, true);
	},

	openUILink : function(aURI, aEvent, aIgnoreButton, aIgnoreAlt, aAllowKeywordFixup, aPostData, aReferrer)
	{
		var where = whereToOpenLink(aEvent, aIgnoreButton, aIgnoreAlt);
		where = this.utils.convertWhereToOpenLink(window, where, aEvent, null, aURI);
		return openUILinkIn(aURI, where, aAllowKeywordFixup, aPostData, aReferrer);
	},

	handleEvent : function(aEvent)
	{
		switch (aEvent.type)
		{
			case 'load':
				window.removeEventListener('load', this, false);
				window.addEventListener('unload', this, false);
				this.init();
				return;

			case 'unload':
				window.removeEventListener('unload', this, false);
				this.panelUIHistoryItems.removeEventListener('click', this, true);
				return;

			case 'click':
				var item = aEvent.target;
				var uri = item.getAttribute('targetURI');
				if (!uri)
					return true;
				this.openUILink(uri, aEvent);
				this.CustomizableUI.hidePanelForNode(item);
				aEvent.stopPropagation();
				aEvent.preventDefault();
				return false;
		}
	}
};

window.addEventListener('load', OpenBookmarksInNewTab, false);
