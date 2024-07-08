<script lang="ts">
  import { onMount } from "svelte";
  import browser from "webextension-polyfill";
  import { writable } from "svelte/store";

  let storageItem = writable<Record<string, any>>({});

  let thisMonth = new Date().toLocaleString("default", { month: "long" });

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

  $: sortedKeys = Object.keys(filteredStorageItem).sort((a, b) => {
    return filteredStorageItem[b] - filteredStorageItem[a];
  });

  function formatDuration(duration: number): string {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));

    const daysDisplay = days > 0 ? days + (days == 1 ? " d, " : " d, ") : "";
    const hoursDisplay =
      hours > 0 ? hours + (hours == 1 ? " h, " : " h, ") : "";
    const minutesDisplay =
      minutes > 0 ? minutes + (minutes == 1 ? " m, " : " m, ") : "";
    const secondsDisplay =
      seconds > 0 ? seconds + (seconds == 1 ? " s" : " s") : "";

    return (
      daysDisplay + hoursDisplay + minutesDisplay + secondsDisplay ||
      duration.toString() + "s"
    );
  }

  function extractDomain(url: string): string {
    try {
      return url.replace(/^\d+(www\.)?/, "");
    } catch (e) {
      return url + "fail";
    }
  }
</script>

<div
  class="flex flex-col bg-neutral-700 text-zinc-300 min-h-[400px] min-w-[400px] p-12"
>
  <h1 class="font-semibold uppercase text-center">
    {thisMonth}
  </h1>
  {#each sortedKeys as item}
    <div
      class="flex flex-row justify-between items-center hover:bg-neutral-600 rounded-md px-2 py-2"
    >
      <h1 class="text-center">
        {extractDomain(item)}
      </h1>

      <h1 class="text-center">{formatDuration(filteredStorageItem[item])}</h1>
    </div>
  {/each}
</div>
<a
  href="https://github.com/f0rc/grada"
  class="absolute text-xs bottom-0 right-0 text-zinc-500 p-2"
  ><div class="flex gap-1 items-center justify-center">
    <h1>URL Timer</h1>
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-3"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25"
        />
      </svg>
    </div>
  </div>
</a>
