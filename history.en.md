# History

 - master/HEAD
 - 2.0.2016021001
   * Open "Load this bookmark in the sidebar" checked bookmarks correctly.
 - 2.0.2016012102
   * Made implementation more safer for Firefox 38.
 - 2.0.2016012101
   * Isolated from `eval` hack.
 - 1.0.2016012102
   * Open tabs from middle click of a bookmark folder correctly. (regression)
 - 1.0.2016012101
   * Verified on Nightly 46.0a1.
   * Drop support for Firefox 37 and older.
   * Works correctly even after the initial browser window is closed.
   * Opens new tab from "History" panel UI popup also.
   * Modified: "jar" archive is no longer included.
 - 0.1.2012122901
   * Works on Nightly 20.0a1.
 - 0.1.2012112401
   * Fixed: Reuse "about:newtab" tabs as blank tabs.
 - 0.1.2011120101
   * Improved: Menu items in the "History" menu are treated like bookmark items. They are opened in new tabs by this addon.
   * Improved: Bookmarks can be opened in background tab or new window. To configure this behavior, you have to change the secret preference "extensions.openbookmarkintab.place". 1 = new tab, 257 = new background tab, 2 = new window.
 - 0.1.2010043001
   * Works on Minefield 3.7a5pre.
 - 0.1.2009100801
   * Improved: No new tab is opened when the current tab is blank. (If you set  `extensions.openbookmarkintab.reuseBlankTab`  to  `false` , bookmarks are always loaded into new tabs.)
 - 0.1.2009090201
   * "Open in new tab" feature is ignroed for Web Panels (bookmarks should be loaded into the sidebar) correctly.
 - 0.1.2009082401
   * Fixed: Bookmarklets are loaded in the current tab instead of new tabs.
   * Hungarian locale is available, translated by Mikes Kaszmán István.
 - 0.1.2009081902
   * Fixed: Encoding of "ja" locale becomes UTF-8.
 - 0.1.2009081901
   * Released.
