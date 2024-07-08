import browser from "webextension-polyfill";

console.log("Hello from the background!");

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
});

browser.tabs.onActivated.addListener(async (activeInfo) => {
  const url = (await browser.tabs.get(activeInfo.tabId)).url;

  if (url) {
    await updateTimer(url);
  }
});

browser.tabs.onUpdated.addListener(async (_tabId, _changeInfo, tab) => {
  const url = tab.url;
  if (url) {
    await updateTimer(url);
  }
});

browser.windows.onRemoved.addListener(async (_windowId) => {
  await endLastSession();
});

browser.runtime.onSuspend.addListener(async () => {
  await endLastSession();
});

const upsertStorageKey = async (hostname: string) => {
  const date = new Date();
  console.log(date.getMonth(), date.getFullYear());
  const key =
    date.getMonth().toString() + date.getFullYear().toString() + hostname;

  let storageKey = await browser.storage.local.get(key);

  if (!storageKey[key]) {
    storageKey = { [key]: 0 };
    await browser.storage.local.set(storageKey);
  }

  return key;
};

const logSessionDuration = async (url: string, startTime: number) => {
  const key = await upsertStorageKey(url);
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
};

async function updateTimer(rawURL: string) {
  const url = new URL(rawURL).hostname;

  const store = await browser.storage.local.get([
    "currURL",
    "sessionStartTime",
  ]);

  const currURL: string = store.currURL;
  const sessionStartTime: number = store.sessionStartTime;

  if (!currURL) {
    startNewSession(url);
  } else {
    if (url !== currURL) {
      // new url deactivate old url and start new session
      await logSessionDuration(currURL, sessionStartTime);
      startNewSession(url);
    }
  }
}

async function endLastSession() {
  const store = await browser.storage.local.get([
    "currURL",
    "sessionStartTime",
  ]);

  const currURL: string = store.currURL;
  const sessionStartTime: number = store.sessionStartTime;

  if (currURL) {
    await logSessionDuration(currURL, sessionStartTime);
  }
}
