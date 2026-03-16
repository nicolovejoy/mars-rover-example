<script>
  import { createEventDispatcher } from 'svelte'

  export let cameras = []
  export let selected = ''

  const dispatch = createEventDispatcher()

  function select(name) {
    dispatch('select', name)
  }
</script>

{#if cameras.length > 0}
  <div class="camera-selector">
    <span class="label-text">Camera</span>
    <div class="buttons">
      {#each cameras as cam}
        <button
          class:active={selected === cam}
          on:click={() => select(cam)}
          title={cam}
        >
          {cam}
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .camera-selector {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .label-text {
    font-weight: 600;
    font-size: 14px;
    min-width: 56px;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  button {
    padding: 4px 10px;
    background: var(--bg-control);
    color: var(--text-dim);
    border: 1px solid var(--text-dim);
    border-radius: var(--radius);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
  }

  button:hover {
    background: var(--bg-surface);
    color: var(--text);
  }

  button.active {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }
</style>
