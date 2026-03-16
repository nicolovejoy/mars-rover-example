<script>
  import { createEventDispatcher } from 'svelte'

  export let selected = 'perseverance'

  const dispatch = createEventDispatcher()

  const rovers = [
    { id: 'perseverance', label: 'Perseverance' },
    { id: 'curiosity', label: 'Curiosity' },
    { id: 'opportunity', label: 'Opportunity' },
    { id: 'spirit', label: 'Spirit' },
  ]
</script>

<div class="rover-selector">
  {#each rovers as rover}
    <button
      class:active={selected === rover.id}
      on:click={() => dispatch('select', rover.id)}
    >
      {rover.label}
    </button>
  {/each}
</div>

<style>
  .rover-selector {
    display: flex;
    gap: 0;
  }

  button {
    flex: 1;
    padding: 8px 12px;
    background: var(--bg-control);
    color: var(--text-dim);
    border: 1px solid var(--bg-surface);
    cursor: pointer;
    font-size: 13px;
    transition: background 0.15s, color 0.15s;
  }

  button:first-child {
    border-radius: var(--radius) 0 0 var(--radius);
  }

  button:last-child {
    border-radius: 0 var(--radius) var(--radius) 0;
  }

  button.active {
    background: var(--accent);
    color: white;
  }

  button:hover:not(.active) {
    background: var(--bg-surface);
    color: var(--text);
  }
</style>
