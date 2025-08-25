// This function creates the right-click context menu item.
const createContextMenu = () => {
  // Use chrome.contextMenus.create, and remove any old ones first for clean reloads.
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "scan-link-with-linkguard",
      title: "Scan with LinkGuard",
      contexts: ["link"] // This menu item will only appear when right-clicking a link
    });
  });
};

// When the extension is first installed or updated, create the context menu.
chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

// This listener function runs when the user clicks our context menu item.
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "scan-link-with-linkguard" && info.linkUrl) {
    const urlToScan = info.linkUrl;

    // Save the URL to be scanned in chrome's local storage.
    // Our React app will read this value when it opens.
    await chrome.storage.local.set({ urlToScan: urlToScan });

    // Open the popup window.
    chrome.action.openPopup();
  }
});