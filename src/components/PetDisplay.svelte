<script>
  import AnimatedPetDisplay from "./AnimatedPetDisplay.svelte";

  export let pet;
  export let eventAnimation;
  export let ageDisplay;
  export let actionType = null;
</script>

<div class="flex flex-col gap-4 mt-4 items-start w-full">
  <div class="flex flex-col items-start gap-4 py-2 w-full">
    <div
      class="relative flex flex-col self-center w-full items-center justify-center"
    >
      <AnimatedPetDisplay {pet} eventType={eventAnimation === 'pee' ? 'pee' : null} {actionType} />
    </div>
    <div class="flex flex-col items-start gap-1">
      <span class="text-sm font-[300] text-[#a1a1a1] capitalize">
        {pet.status === "away"
          ? "away"
          : pet.status === "sleeping"
            ? "sleeping"
            : pet.mood}
      </span>
      <span class="text-sm font-[300] text-[#a1a1a1]"
        >Age: {ageDisplay}</span
      >
    </div>
  </div>
</div>



