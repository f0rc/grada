import browser from "webextension-polyfill";

console.log("Hello from the background!");

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
});

const upsertStorageKey = async (url: string) => {
  const date = new Date();
  const hostname = new URL(url).host;
  const key = date.getMonth() + date.getFullYear() + hostname;

  let storageKey = await browser.storage.local.get(key);

  if (!storageKey[key]) {
    console.log("no key");
    storageKey = { [key]: 0 };
    await browser.storage.local.set(storageKey);
  }

  return key;
};

const logSessionDuration = async (url: string, startTime: number) => {
  const key = await upsertStorageKey(url);
  console.log("logging session", url);
  const endTime = Date.now();
  const sessionDuration = endTime - startTime;

  const storageData = await browser.storage.local.get(key);
  const totalDuration = storageData[key] + sessionDuration;

  await browser.storage.local.set({ [key]: totalDuration });

  console.log(
    `Session ended for ${url}. Session duration: ${
      sessionDuration / 1000
    } seconds. Total duration: ${totalDuration / 1000} seconds.`
  );
};

const startNewSession = async (url: string) => {
  await browser.storage.local.set({
    currURL: url,
    sessionStartTime: Date.now(),
  });

  console.log("Session started for url: ", url);
};

browser.tabs.onActivated.addListener(async (activeInfo) => {
  // get url from tab

  const url = (await browser.tabs.get(activeInfo.tabId)).url;
  const store = await browser.storage.local.get([
    "currURL",
    "sessionStartTime",
  ]);

  const currURL = store.currURL as string;
  const sessionStartTime = store.sessionStartTime as number;

  if (url) {
    const hostname = new URL(url).host;
    if (url !== currURL) {
      // new url deactivate old url and start new session
      console.log("activated new tab new curr url");
      await logSessionDuration(currURL, sessionStartTime);
      startNewSession(hostname);
    }

    // current url is still undefined
    if (!currURL) {
      console.log("activated new tab no curr url");
      startNewSession(hostname);
    }
  }
});

browser.tabs.onUpdated.addListener(async (_tabId, _changeInfo, tab) => {
  const url = tab.url;

  const store = await browser.storage.local.get([
    "currURL",
    "sessionStartTime",
  ]);

  const currURL = store.currURL as string;
  const sessionStartTime = store.sessionStartTime as number;

  if (url) {
    const hostname = new URL(url).host;
    if (sessionStartTime && currURL && url !== currURL) {
      // new url deactivate old url and start new session
      await logSessionDuration(currURL, sessionStartTime);
      console.log("updated", crypto.randomUUID());
      startNewSession(hostname);
    }

    // current url is still undefined
    if (!currURL) {
      console.log("updated no curr url");
      startNewSession(hostname);
    }
  }
});

browser.windows.onRemoved.addListener(async (_windowId) => {
  const store = await browser.storage.local.get([
    "currURL",
    "sessionStartTime",
  ]);

  const currURL = store.currURL as string;
  const sessionStartTime = store.sessionStartTime as number;
  if (currURL && sessionStartTime) {
    await logSessionDuration(currURL, sessionStartTime);
  }
});

browser.runtime.onSuspend.addListener(async () => {
  const store = await browser.storage.local.get([
    "currURL",
    "sessionStartTime",
  ]);

  const currURL = store.currURL as string;
  const sessionStartTime = store.sessionStartTime as number;
  if (currURL && sessionStartTime) {
    await logSessionDuration(currURL, sessionStartTime);
  }
});
