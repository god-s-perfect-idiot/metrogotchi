<script>
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import Input from "../components/Input.svelte";
  import Button from "../components/Button.svelte";

  let petName = "";
  let selectedPetType = null;
  let petExists = false;

  const metroColors = [
    "#212121", // Dark gray
    "#2e7d32", // Dark green
    "#1565c0", // Dark blue
    "#e65100", // Dark orange
    "#6a1b9a", // Dark purple
    "#c62828", // Dark red
    "#00838f", // Dark cyan
    "#f57f17", // Dark yellow/amber
    "#5d4037", // Dark brown
    "#455a64", // Dark blue gray
  ];

  // Shuffle colors to ensure unique assignment
  const shuffledColors = [...metroColors].sort(() => Math.random() - 0.5);

  const petTypes = [
    {
      id: "metrocon",
      name: "Metrocon",
      emoji: ":)",
      color: "#c62828",
      bgImage: "url('metrocon.jpg')",
    },
    {
      id: "tweety",
      name: "Tweety",
      emoji: ":D",
      color: "#2e7d32",
      bgImage: "url('/tweety.webp')",
    },
    {
      id: "meowth",
      name: "Meowth",
      emoji: ":3",
      color: "#1565c0",
      bgImage: "url('/meowth.avif')",
    },
    {
      id: "Pakkun",
      name: "Pakkun",
      emoji: ":P",
      color: "#e65100",
      bgImage: "url('/pakkun.webp')",
    },
    {
      id: "Bugs",
      name: "Bugs",
      emoji: ":o",
      color: "#f57f17",
      bgImage: "url('/bugs.jpg')",
    },
    {
      id: "Kowalski",
      name: "Kowalski",
      emoji: ":|",
      color: "#6a1b9a",
      bgImage: "url('/kowalski.webp')",
    },
  ];

  onMount(() => {
    // Load saved configuration if exists
    const savedName = localStorage.getItem("pet_name");
    const savedPetType = localStorage.getItem("pet_type");
    const existingTimestamp = localStorage.getItem("pet_created_at");
    const savedCustomPet = localStorage.getItem("custom_pet_data");

    if (savedName) {
      petName = savedName;
    }
    if (savedPetType) {
      selectedPetType = savedPetType;
    }

    // Check if pet already exists
    petExists = !!existingTimestamp;
  });

  function selectPetType(petTypeId) {
    selectedPetType = petTypeId;
  }

  function handleSave() {
    if (!petName.trim()) {
      return;
    }
    if (!selectedPetType) {
      return;
    }


    // Check if pet already exists
    const existingTimestamp = localStorage.getItem("pet_created_at");
    const isNewPet = !existingTimestamp;

    // Save to localStorage
    localStorage.setItem("pet_name", petName.trim());
    localStorage.setItem("pet_type", selectedPetType);


    // Save creation timestamp only if this is a new pet
    if (isNewPet) {
      localStorage.setItem("pet_created_at", Date.now().toString());
    }

    // Dispatch event to parent to switch to pet page
    // The App component will handle the flip-out animation
    window.dispatchEvent(
      new CustomEvent("pet-configured", {
        detail: {
          name: petName.trim(),
          type: selectedPetType,
        },
      })
    );
  }

  function resetPet() {
    // Clear all pet-related data from localStorage
    localStorage.removeItem("pet_name");
    localStorage.removeItem("pet_type");
    localStorage.removeItem("pet_created_at");
    localStorage.removeItem("pet_stats");
    localStorage.removeItem("pet_events");
    localStorage.removeItem("last_seen_event_time");
    localStorage.removeItem("custom_pet_data");

    // Reset form
    petName = "";
    selectedPetType = null;
    petExists = false;
  }

  $: canSave = petName.trim().length > 0 && selectedPetType !== null;
</script>

<div class="flex flex-col w-full font-[400] h-screen page overflow-x-hidden">
  <span class="text-base font-[500] h-fit px-4 uppercase mt-2">metrogotchi</span
  >
  <span class="text-6xl font-[200] h-auto py-1 px-4">setup</span>

  <div
    class="flex flex-col gap-4 mt-4 overflow-y-auto overflow-x-hidden px-4 h-full w-full pb-4"
  >
    <!-- Name Section -->
    <div class="flex flex-col gap-1 mt-4">
      <span class="text-xl font-[300] text-green-600 mb-2">name</span>
      <Input
        bind:content={petName}
        label=""
        placeholder="Enter pet name"
        maxlength="20"
      />
    </div>

    <!-- Pet Type Section -->
    <div class="flex flex-col gap-1 mt-4">
      <span class="text-xl font-[300] text-green-600 mb-2">pet</span>
      <div class="flex flex-wrap gap-3 mt-2">
        {#each petTypes as petType, i}
          <div
            class="flex items-center justify-center {selectedPetType === petType.id
              ? 'border-2 border-white'
              : 'border-2 border-transparent'}"
          >
            <button
              class="pet-tile-slide tile flex relative flex-col bg-auto bg-center items-center justify-center gap-2 w-28 h-28 rounded-none text-white font-[300] text-sm transition-colors duration-150"
              style="background-image: {petType.bgImage}; background-repeat: no-repeat; background-color: {petType.color}; animation-delay: {i * 30}ms;"
              on:click={() => selectPetType(petType.id)}
            >
              <span
                class="text-4xl pet-emoji-slide"
                style="animation-delay: {i * 30}ms;">{petType.emoji}</span
              >
              <span
                class="absolute bottom-2 left-2 font-medium text-sm pet-label-slide"
                style="animation-delay: {i * 30}ms;">{petType.name}</span
              >
            </button>
          </div>
        {/each}
      </div>
      <Button text="community pets" onClick={() => {}} className="mt-6" />
    </div>


    <span class="text-xl font-[300] text-green-600 mt-4">actions</span>
    <!-- Buttons Section -->
    <div class="flex flex-row flex-wrap w-full gap-3 justify-start">
      <button
        on:click={() => window.dispatchEvent(new CustomEvent("open-custom-pet"))}
        class="action-btn-slide bg-blue-600 w-32 h-32 relative flex items-center justify-center text-white"
        style="animation-delay: {petTypes.length * 30 + 200}ms;"
        disabled={false}
      >
        <Icon
          icon="material-symbols-light:dashboard-customize"
          width="48"
          height="48"
          class="action-icon-slide"
          style="animation-delay: {petTypes.length * 30 + 200}ms;"
        />
        <span
          class="text-base font-medium absolute bottom-2 left-2 action-label-slide"
          style="animation-delay: {petTypes.length * 30 + 200}ms;"
          >custom pet</span
        >
      </button>
      <button
        on:click={handleSave}
        class="action-btn-slide bg-green-600 w-32 h-32 relative flex items-center justify-center text-white"
        style="animation-delay: {petTypes.length * 30 + 200 + 30}ms;"
        disabled={!canSave}
      >
        <Icon
          icon="mdi:play"
          width="48"
          height="48"
          class="action-icon-slide"
          style="animation-delay: {petTypes.length * 30 + 200 + 30}ms;"
        />
        <span
          class="text-base font-medium absolute bottom-2 left-2 action-label-slide"
          style="animation-delay: {petTypes.length * 30 + 200 + 30}ms;"
          >start pet</span
        >
      </button>
      {#if petExists}
        <button
          on:click={resetPet}
          class="action-btn-slide bg-red-600 w-32 h-32 relative flex items-center justify-center text-white"
          style="animation-delay: {petTypes.length * 30 + 200 + 60}ms;"
          disabled={false}
        >
          <Icon
            icon="mdi:restart"
            width="48"
            height="48"
            class="action-icon-slide"
            style="animation-delay: {petTypes.length * 30 + 200 + 60}ms;"
          />
          <span
            class="text-base font-medium absolute bottom-2 left-2 action-label-slide"
            style="animation-delay: {petTypes.length * 30 + 200 + 60}ms;"
            >reset pet</span
          >
        </button>
      {/if}
      <button
        on:click={resetPet}
        class="action-btn-slide bg-purple-500 w-32 h-32 relative flex items-center justify-center text-white"
        style="animation-delay: {petTypes.length * 30 +
          200 +
          (petExists ? 90 : 60)}ms;"
        disabled={false}
      >
        <Icon
          icon="mdi:share"
          width="48"
          height="48"
          class="action-icon-slide"
          style="animation-delay: {petTypes.length * 30 +
            200 +
            (petExists ? 90 : 60)}ms;"
        />
        <span
          class="text-base font-medium absolute bottom-2 left-2 action-label-slide"
          style="animation-delay: {petTypes.length * 30 +
            200 +
            (petExists ? 90 : 60)}ms;">share pet</span
        >
      </button>
    </div>
  </div>
</div>

<style>
  .pet-tile-slide {
    animation: slideInFromRight 0.3s ease-out forwards;
    transform: translateX(100%);
    opacity: 0;
    position: relative;
  }

  .tile::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    z-index: 1;
    pointer-events: none;
  }

  .tile > * {
    z-index: 2;
  }

  .pet-emoji-slide {
    animation: slideInFromRight 0.3s ease-out forwards;
    transform: translateX(100%);
    opacity: 0;
  }

  .pet-label-slide {
    animation: slideInFromRight 0.3s ease-out forwards;
    transform: translateX(100%);
    opacity: 0;
  }

  .action-btn-slide {
    animation: slideInFromRight 0.3s ease-out forwards;
    transform: translateX(100%);
    opacity: 0;
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
