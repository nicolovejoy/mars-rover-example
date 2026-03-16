<script>
  import { createEventDispatcher, beforeUpdate } from 'svelte'

  export let photos = []
  export let loading = false

  const dispatch = createEventDispatcher()

  let index = 0

  // Staggered loading messages
  const loadingMessages = [
    'Connecting to NASA\'s image archive...',
    'Searching Perseverance rover photos...',
    'The rover has been exploring Mars since February 2021.',
    'Almost there...',
  ]
  let visibleMessages = 0
  let messageTimer = null
  let prevLoading = false

  beforeUpdate(() => {
    if (loading && !prevLoading) {
      visibleMessages = 1
      clearInterval(messageTimer)
      messageTimer = setInterval(() => {
        visibleMessages = visibleMessages + 1
        if (visibleMessages >= loadingMessages.length) clearInterval(messageTimer)
      }, 1500)
    } else if (!loading && prevLoading) {
      clearInterval(messageTimer)
    }
    prevLoading = loading
  })
  let slotA = { src: '', opacity: 1 }
  let slotB = { src: '', opacity: 0 }
  let activeSlot = 'A'

  $: photo = photos[index] || null
  $: total = photos.length

  // Reset index when photo array changes
  $: if (photos) {
    index = 0
  }

  // Load new image into the inactive slot
  $: if (photo) {
    loadPhoto(photo.img_src)
  }

  function loadPhoto(src) {
    if (!src) return
    const img = new Image()
    img.onload = () => {
      if (activeSlot === 'A') {
        slotB = { src, opacity: 1 }
        slotA = { ...slotA, opacity: 0 }
        activeSlot = 'B'
      } else {
        slotA = { src, opacity: 1 }
        slotB = { ...slotB, opacity: 0 }
        activeSlot = 'A'
      }
    }
    img.src = src
  }

  function handleIndex(e) {
    const v = parseInt(e.target.value)
    if (!isNaN(v) && v >= 1 && v <= total) {
      index = v - 1
    }
  }

  function handleRange(e) {
    index = parseInt(e.target.value)
  }
</script>

<div class="photo-viewer">
  {#if loading}
    <div class="crossfade-container">
      <div class="loading-messages">
        {#each loadingMessages.slice(0, visibleMessages) as msg, i}
          <p class="loading-msg" class:dim={i < visibleMessages - 1}>{msg}</p>
        {/each}
      </div>
    </div>
  {:else if total === 0}
    <div class="crossfade-container">
      <div class="empty-state">No photos on this sol. Try sliding to a nearby day.</div>
    </div>
  {:else}
    <div class="crossfade-container">
      <img
        src={slotA.src}
        alt="Mars rover — slot A"
        style="opacity: {slotA.opacity}"
      />
      <img
        src={slotB.src}
        alt="Mars rover — slot B"
        style="opacity: {slotB.opacity}"
      />
    </div>
  {/if}

  {#if photo}
    <div class="metadata">
      {#if photo.sol != null}<span>Sol {photo.sol}</span>{/if}
      <span>{photo.earth_date}</span>
      <span class="photo-title">{photo.camera.full_name}</span>
      <span class="photo-id">ID {photo.id}</span>
    </div>
  {/if}

  {#if total > 1}
    <div class="index-controls">
      <label>
        <span class="label-text">Photo</span>
        <input
          type="range"
          min={0}
          max={total - 1}
          value={index}
          on:input={handleRange}
        />
        <input
          type="number"
          min={1}
          max={total}
          value={index + 1}
          on:input={handleIndex}
        />
        <span class="count">of {total}</span>
      </label>
    </div>
  {/if}
</div>

<style>
  .photo-viewer {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 8px;
  }

  .crossfade-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-messages {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .loading-msg {
    margin: 0;
    font-size: 14px;
    color: var(--accent);
    animation: fadeIn 0.4s ease;
  }

  .loading-msg.dim {
    color: var(--text-dim);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .empty-state {
    color: var(--text-dim);
    font-size: 1.1rem;
  }

  .metadata {
    display: flex;
    gap: 16px;
    justify-content: center;
    font-size: 13px;
    color: var(--text-dim);
    padding: 4px 0;
  }

  .photo-id {
    color: var(--text-dim);
    opacity: 0.6;
  }

  .index-controls label {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .label-text {
    font-weight: 600;
    font-size: 14px;
    min-width: 42px;
  }

  input[type="range"] {
    flex: 1;
  }

  .count {
    font-size: 13px;
    color: var(--text-dim);
    min-width: 50px;
  }
</style>
