<script>
  import { onMount } from 'svelte'
  import { fetchPhotos } from './lib/api.js'
  import SolSlider from './components/SolSlider.svelte'
  import CameraSelector from './components/CameraSelector.svelte'
  import PhotoViewer from './components/PhotoViewer.svelte'

  let sol = null
  let camera = ''
  let photos = []
  let cameras = []
  let loading = false
  let error = ''

  onMount(() => loadPhotos())

  async function loadPhotos() {
    error = ''
    loading = true
    try {
      const result = await fetchPhotos({
        sol: sol ?? undefined,
        camera: camera || undefined,
      })
      photos = result.photos
      // Derive available cameras from results (only when showing all)
      if (!camera) {
        cameras = [...new Set(photos.map(p => p.camera.full_name))]
      }
      // If we fetched "latest", read the actual sol from results
      if (sol === null && photos.length > 0) {
        sol = photos[0].sol
      }
    } catch (e) {
      error = e.message
      photos = []
    }
    loading = false
  }

  function handleSol(e) {
    sol = e.detail
    camera = ''
    loadPhotos()
  }

  function handleCamera(e) {
    camera = e.detail === 'All' ? '' : e.detail
    loadPhotos()
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

    <SolSlider value={sol ?? 0} on:change={handleSol} />

    <CameraSelector
      cameras={['All', ...cameras]}
      selected={camera || 'All'}
      on:select={handleCamera}
    />
  </div>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
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

  .error {
    background: #3a1010;
    color: #ff6b6b;
    padding: 8px 12px;
    border-radius: var(--radius);
    font-size: 13px;
  }
</style>
