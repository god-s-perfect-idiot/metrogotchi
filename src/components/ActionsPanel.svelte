<script>
  import Icon from "@iconify/svelte";
  
  export let pet;
  export let feed;
  export let play;
  export let clean;
  export let sleep;
</script>

<div class="flex flex-col gap-1 mt-4">
  <span class="text-xl font-[300] text-green-600">actions</span>
  <div class="flex flex-wrap gap-3 mt-2">
    {#each [{ action: feed, icon: "mdi:food", label: "Feed", bgColor: "bg-red-700", disabled: pet.hunger === 0 || pet.status !== "present" }, { action: play, icon: "mdi:gamepad-variant", label: "Play", bgColor: "bg-blue-700", disabled: pet.energy < 20 || pet.status !== "present" }, { action: clean, icon: "mdi:spray", label: "Clean", bgColor: "bg-yellow-500", disabled: pet.cleanliness === 100 || pet.status !== "present" }, { action: sleep, icon: "mdi:sleep", label: "Sleep", bgColor: "bg-purple-700", disabled: pet.status !== "present" }, { action: () => window.dispatchEvent(new CustomEvent("open-setup")), icon: "mdi:cog", label: "Configure", bgColor: "bg-green-700", disabled: false }] as actionBtn, i}
      <button 
        class="action-btn-slide flex relative flex-col items-center justify-center gap-2 w-28 h-28 {actionBtn.bgColor} rounded-none border-none text-white font-[300] text-sm transition-all duration-150 {actionBtn.disabled
          ? 'cursor-not-allowed'
          : 'active:bg-[#646464]'}"
        style="animation-delay: {300 + i * 30}ms;"
        on:click={actionBtn.action}
        disabled={actionBtn.disabled}
      >
        <Icon
          icon={actionBtn.icon}
          width="44"
          height="44"
          class="action-icon-slide"
          style="animation-delay: {300 + i * 30}ms;"
        />
        <span
          class="font-medium absolute bottom-2 left-2 action-label-slide"
          style="animation-delay: {300 + i * 30}ms;">{actionBtn.label}</span
        >
      </button>
    {/each}
  </div>
</div>

<style>
  button:disabled {
    pointer-events: none;
    opacity: 0.4 !important;
  }

  .action-btn-slide {
    animation: slideInFromRight 0.3s ease-out forwards;
    transform: translateX(100%);
    opacity: 0;
  }

  .action-btn-slide:disabled {
    opacity: 0.4 !important;
  }

  .action-icon-slide {
    animation: slideInFromRight 0.3s ease-out forwards;
    transform: translateX(100%);
    opacity: 0;
  }

  .action-label-slide {
    animation: slideInFromRight 0.3s ease-out forwards;
    transform: translateX(100%);
    opacity: 0;
  }

  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>


