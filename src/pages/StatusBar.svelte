<script>
  import { onMount, onDestroy, tick } from "svelte";

  let currentTime = "";
  let timeInterval;
  let clockAnimated = false;

  // Format time
  function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const displayHours = (hours % 12 || 12).toString().padStart(2, "0");
    const displayMinutes = minutes.toString().padStart(2, "0");
    currentTime = `${displayHours}:${displayMinutes}`;
  }

  // Status bar background color
  onMount(() => {
    // Update time immediately and set interval
    updateTime();
    timeInterval = setInterval(updateTime, 1000);

    // Trigger animation on initial mount
    setTimeout(() => {
      clockAnimated = true;
    }, 200);
  });

  onDestroy(() => {
    if (timeInterval) {
      clearInterval(timeInterval);
    }
  });

  // Trigger status bar animation
  async function triggerClockAnimation() {
    // Reset animation
    clockAnimated = false;
    await tick();

    // Clock animation
    setTimeout(() => {
      clockAnimated = true;
    }, 200);
  }
</script>

<div class="status-bar">
  <div class="status-left"></div>

  <div class="status-right">
    <span
      class="font-[200] text-sm clock {clockAnimated ? 'clock-animated' : ''}"
      >{currentTime}</span
    >
  </div>
</div>

<style>
  .status-bar {
    position: fixed;
    top: 0.25rem;
    left: 0;
    right: 0;
    z-index: 99999;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    font-weight: 500;
    padding: 0.5rem 0;
    user-select: none;
    -webkit-user-select: none;
    margin: 0;
    width: 100%;
    box-sizing: border-box;
    height: 2rem; /* Standard Android status bar height */
    background-color: #000000;
  }

  .status-left {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 1rem;
  }

  .status-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-right: 1rem;
  }

  .clock {
    opacity: 0;
    transform: translateY(-20px);
    transition: none;
  }

  .clock-animated {
    animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  }

  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }
    60% {
      opacity: 1;
      transform: translateY(2px);
    }
    80% {
      transform: translateY(-2px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
