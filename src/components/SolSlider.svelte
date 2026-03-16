<script>
  import { createEventDispatcher, onDestroy } from 'svelte'

  export let min = 0
  export let max = 1850
  export let value = 0

  const dispatch = createEventDispatcher()
  let timer = null
  let localValue = value
  let prevValue = value

  $: if (value !== prevValue) {
    prevValue = value
    localValue = value
  }

  function handleInput(e) {
    localValue = parseInt(e.target.value)
    clearTimeout(timer)
    timer = setTimeout(() => {
      dispatch('change', localValue)
    }, 300)
  }

  function handleNumber(e) {
    let v = parseInt(e.target.value)
    if (isNaN(v)) return
    v = Math.max(min, v)
    localValue = v
    clearTimeout(timer)
    timer = setTimeout(() => {
      dispatch('change', localValue)
    }, 300)
  }

  onDestroy(() => clearTimeout(timer))
</script>

<div class="sol-slider">
  <label>
    <span class="label-text" title="A sol is one Martian day (~24h 37m)">Sol (Mars day)</span>
    <input
      type="range"
      {min}
      {max}
      value={localValue}
      on:input={handleInput}
    />
    <input
      type="number"
      {min}
      value={localValue}
      on:input={handleNumber}
    />
  </label>
</div>

<style>
  .sol-slider {
    width: 100%;
  }

  label {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .label-text {
    font-weight: 600;
    font-size: 14px;
    min-width: 80px;
  }

  input[type="range"] {
    flex: 1;
  }
</style>
