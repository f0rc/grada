<script lang="ts">
  import { onMount } from "svelte";
  import browser from "webextension-polyfill";
  import { writable } from "svelte/store";

  let storageItem = writable<Record<string, any>>({});

  browser.storage.onChanged.addListener(async (changes) => {
    console.log(changes);
    const newStorageItem = await browser.storage.local.get();
    storageItem.set(newStorageItem);
  });

  onMount(async () => {
    const initialStorageItem = await browser.storage.local.get();
    console.log(initialStorageItem);
    storageItem.set(initialStorageItem);
  });

  $: filteredStorageItem = (() => {
    const item = $storageItem;
    const { currURL, sessionStartTime, ...filtered } = item;

    return filtered;
  })();

  $: sortedKeys = Object.keys(filteredStorageItem).sort(
    (a, b) => filteredStorageItem[b] - filteredStorageItem[a]
  );

  function formatDuration(duration: number): string {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));

    const daysDisplay =
      days > 0 ? days + (days == 1 ? " day, " : " days, ") : "";
    const hoursDisplay =
      hours > 0 ? hours + (hours == 1 ? " hour, " : " hours, ") : "";
    const minutesDisplay =
      minutes > 0 ? minutes + (minutes == 1 ? " minute, " : " minutes, ") : "";
    const secondsDisplay =
      seconds > 0 ? seconds + (seconds == 1 ? " second" : " seconds") : "";

    return daysDisplay + hoursDisplay + minutesDisplay + secondsDisplay;
  }

  function extractDomain(url: string): string {
    try {
      return url.replace(/[0-9]+www./, "");
    } catch (e) {
      return url + "fail";
    }
  }
</script>

<div
  class="flex flex-col bg-neutral-700 text-zinc-300 min-h-[400px] min-w-[400px] items-center justify-center"
>
  {#each sortedKeys as item}
    <div>
      <h1>
        {extractDomain(item)}
        : {formatDuration(filteredStorageItem[item])}
      </h1>
    </div>
  {/each}
</div>
