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

var EXPORTED_SYMBOLS = ['OpenBookmarksInNewTabUtils'];

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

Cu.import('resource://gre/modules/XPCOMUtils.jsm');
Cu.import('resource://gre/modules/Services.jsm');

XPCOMUtils.defineLazyModuleGetter(this, 'PlacesUIUtils', 'resource:///modules/PlacesUIUtils.jsm');
XPCOMUtils.defineLazyModuleGetter(this, 'PlacesUtils', 'resource://gre/modules/PlacesUtils.jsm');

var OpenBookmarksInNewTabUtils = {
	kPLACE_CURRENT    : 0,
	kPLACE_NEW_TAB    : 1,
	kPLACE_NEW_WINDOW : 2,
	kPLACE_IN_BACKGROUND : 256,
	get place()
	{
		var place = Services.prefs.getIntPref('extensions.openbookmarkintab.place');

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
		PlacesUIUtils.OpenBookmarksInNewTabUtils = this;

		eval('PlacesUIUtils.openNodeWithEvent = '+
			PlacesUIUtils.openNodeWithEvent.toSource().replace(
				/(([^\s]*)(?:window\.)whereToOpenLink\(aEvent[^\)]*\))/,
				'$2this.OpenBookmarksInNewTabUtils.convertWhereToOpenLink(window, $1, null, aNode)'
			)
		);

		eval('PlacesUIUtils._openTabset = '+
			PlacesUIUtils._openTabset.toSource().replace(
				'if (where == "window") {',
				'where = browserWindow ? this.OpenBookmarksInNewTabUtils.convertWhereToOpenLink(browserWindow, where, aEvent) : where ;\n' +
				'$&'
			)
		);
	},

	initWindow : function(aWindow)
	{
		aWindow.document.getElementById('placesContext_open').removeAttribute('default');
		aWindow.document.getElementById('placesContext_open:newtab').setAttribute('default', true);
	},

	convertWhereToOpenLink : function(aWindow, aWhere, aEvent, aNode, aURI)
	{
		var target = aEvent && aEvent.target;
		var originalTarget = aEvent && aEvent.originalTarget;
		var currentTarget = aEvent && aEvent.currentTarget;

		if ( // clicking on folder
				aEvent &&
				(
					( // tree
						target &&
						target.localName == 'treechildren' &&
						currentTarget &&
						currentTarget.selectedNode &&
						!PlacesUtils.nodeIsURI(currentTarget.selectedNode) &&
						PlacesUtils.nodeIsContainer(currentTarget.selectedNode)
					) ||
					( // toolbar, menu
						originalTarget &&
						originalTarget.node &&
						PlacesUtils.nodeIsContainer(originalTarget.node)
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
				Services.wm.getMostRecentWindow('navigator:browser')
			)
			)
			return aWhere;

		var browserWindow = aWindow.getTopWin();
		var currentURI = browserWindow && browserWindow.gBrowser.currentURI.spec;
		if (
			!browserWindow ||
			(
				Services.prefs.getBoolPref('extensions.openbookmarkintab.reuseBlankTab') &&
				(browserWindow.isBlankPageURL ? browserWindow.isBlankPageURL(currentURI) : (currentURI == 'about:blank')) &&
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
				return !Services.prefs.getBoolPref('extensions.openbookmarkintab.reverseBehaviorForMiddleClick') ?
						aWhere :
						'current' ;
			default:
				return aWhere;
		}
	}
};

OpenBookmarksInNewTabUtils.init();