<script>
  import { onMount } from 'svelte'
  import { fetchPhotos, fetchLegacyPhotos, cameraDisplayName } from './lib/api.js'
  import RoverSelector from './components/RoverSelector.svelte'
  import SolSlider from './components/SolSlider.svelte'
  import CameraSelector from './components/CameraSelector.svelte'
  import PhotoViewer from './components/PhotoViewer.svelte'

  let rover = 'perseverance'
  let sol = null
  let camera = ''
  let photos = []
  let cameras = []
  let loading = false
  let error = ''
  let page = 1
  let total = 0
  const perPage = 25

  $: isPerseverance = rover === 'perseverance'
  $: totalPages = Math.ceil(total / perPage) || 1

  onMount(() => load())

  async function load() {
    error = ''
    loading = true
    try {
      if (isPerseverance) {
        const result = await fetchPhotos({
          sol: sol ?? undefined,
          camera: camera || undefined,
          page,
        })
        photos = result.photos
        total = result.total
        if (!camera) {
          cameras = [...new Set(photos.map(p => p.camera.id))]
        }
        if (sol === null && photos.length > 0) {
          sol = photos[0].sol
        }
      } else {
        const result = await fetchLegacyPhotos({ rover, page })
        photos = result.photos
        total = result.total
      }
    } catch (e) {
      error = e.message
      photos = []
    }
    loading = false
  }

  function handleRover(e) {
    rover = e.detail
    sol = null
    camera = ''
    cameras = []
    page = 1
    load()
  }

  function handleSol(e) {
    sol = e.detail
    camera = ''
    page = 1
    load()
  }

  function handleCamera(e) {
    const name = e.detail
    if (name === 'All') {
      camera = ''
    } else {
      camera = cameras.find(c => cameraDisplayName(c) === name) || ''
    }
    page = 1
    load()
  }

  function prevPage() {
    if (page > 1) { page--; load() }
  }

  function nextPage() {
    if (page < totalPages) { page++; load() }
  }
</script>

<div class="app">
  <div class="viewer-area">
    <PhotoViewer {photos} {loading} />
  </div>

  <div class="controls">
    {#if error}
      <div class="error">{error}</div>
    {/if}

    <RoverSelector selected={rover} on:select={handleRover} />

    {#if isPerseverance}
      <SolSlider value={sol ?? 0} on:change={handleSol} />

      <CameraSelector
        cameras={['All', ...cameras.map(c => cameraDisplayName(c))]}
        selected={camera ? cameraDisplayName(camera) : 'All'}
        on:select={handleCamera}
      />
    {/if}

    {#if total > perPage}
      <div class="pagination">
        <button disabled={page <= 1} on:click={prevPage}>Prev</button>
        <span class="page-info">Page {page} of {totalPages} ({total} photos)</span>
        <button disabled={page >= totalPages} on:click={nextPage}>Next</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    width: 100vw;
    overflow: hidden;
  }

  .viewer-area {
    flex: 1;
    min-height: 0;
    padding: 12px 16px 0;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--bg-surface);
    border-top: 1px solid var(--bg-control);
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .pagination button {
    background: var(--bg-control);
    color: var(--text);
    border: none;
    padding: 6px 14px;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 13px;
  }

  .pagination button:hover:not(:disabled) {
    background: var(--accent);
  }

  .pagination button:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .page-info {
    font-size: 13px;
    color: var(--text-dim);
  }

  .error {
    background: #3a1010;
    color: #ff6b6b;
    padding: 8px 12px;
    border-radius: var(--radius);
    font-size: 13px;
  }
</style>
