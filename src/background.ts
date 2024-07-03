import browser from "webextension-polyfill";

console.log("Hello from the background!");

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    console.log("Tab updated:", tab.url);
  }
});
