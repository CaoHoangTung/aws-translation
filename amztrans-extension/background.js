browser.contextMenus.create({
    id: "translate-page",
    title: "Translate this page"
  });
  
  browser.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "translate-page") {
      browser.tabs.executeScript({
        file: "translate.js"
      });
    }
  });