import browser from "webextension-polyfill";

console.log("Hello from the background!");

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
});

const urlSessionMap: {
  [key: string]: { startTime: number; isActive: boolean };
} = {};

const logSessionDuration = (url: string, startTime: number) => {
  const sessionDuration = (Date.now() - startTime) / 1000;
  console.log(
    `Session ended for ${url}. Session duration: ${sessionDuration} seconds.`
  );
};

browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await browser.tabs.get(activeInfo.tabId);
  const url = tab.url || "";

  if (urlSessionMap[url] && urlSessionMap[url].isActive) {
    const { startTime } = urlSessionMap[url];

    logSessionDuration(url, startTime);
  }

  urlSessionMap[url] = { startTime: Date.now(), isActive: true };
  console.log("Session started for tab:", activeInfo.tabId);
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const url = changeInfo.url;
    const tab = await browser.tabs.get(tabId);
    const currentUrl = tab.url || "";

    if (urlSessionMap[currentUrl]) {
      const { startTime } = urlSessionMap[currentUrl];
      logSessionDuration(currentUrl, startTime);
    }

    urlSessionMap[currentUrl] = { startTime: Date.now(), isActive: true };
    console.log("Session started for tab:", tabId);
  }
});
