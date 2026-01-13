<script>
  import { onMount } from "svelte";
  import { getDefaultCustomPetAnimations } from "../utils/petAnimations.js";

  export let customPet;

  // Initialize animations if not present
  $: if (!customPet.animations) {
    customPet.animations = getDefaultCustomPetAnimations();
  }

  // Animation types
  const animationTypes = [
    { key: "normal", label: "Normal Face", required: true },
    { key: "hungry", label: "Hungry", required: false },
    { key: "sleeping", label: "Sleeping", required: false },
    { key: "dirty", label: "Dirty", required: false },
    { key: "sad", label: "Sad", required: false },
    { key: "away", label: "Away (Depressed/Gone Out to Play)", required: false },
    { key: "awayHungry", label: "Away Hungry (Gone Hunting)", required: false },
    { key: "fallAsleep", label: "Fall Asleep (Tired)", required: false },
    { key: "feed", label: "Feed", required: false },
    { key: "clean", label: "Clean", required: false },
    { key: "play", label: "Play", required: false },
  ];

  // Preview for current animation type
  let selectedAnimationType = "normal";
  let previewFrameIndex = 0;

  // Get current animation frames
  $: currentAnimation = customPet.animations?.[selectedAnimationType] || [];
  $: previewFrame = currentAnimation[previewFrameIndex] || "";

  function addFrame(animationKey) {
    if (!customPet.animations[animationKey]) {
      customPet.animations[animationKey] = [];
    }
    customPet.animations[animationKey].push("");
    customPet.animations = { ...customPet.animations }; // Force reactivity
  }

  function removeFrame(animationKey, frameIndex) {
    if (customPet.animations[animationKey]) {
      customPet.animations[animationKey].splice(frameIndex, 1);
      customPet.animations = { ...customPet.animations }; // Force reactivity
      if (previewFrameIndex >= customPet.animations[animationKey].length) {
        previewFrameIndex = Math.max(0, customPet.animations[animationKey].length - 1);
      }
    }
  }

  function addIdleAnimation() {
    if (!customPet.animations.idle) {
      customPet.animations.idle = [];
    }
    customPet.animations.idle.push([""]);
    customPet.animations = { ...customPet.animations }; // Force reactivity
  }

  function removeIdleAnimation(animationIndex) {
    if (customPet.animations.idle) {
      customPet.animations.idle.splice(animationIndex, 1);
      customPet.animations = { ...customPet.animations }; // Force reactivity
    }
  }

  function addIdleFrame(animationIndex) {
    if (customPet.animations.idle[animationIndex]) {
      customPet.animations.idle[animationIndex].push("");
      customPet.animations = { ...customPet.animations }; // Force reactivity
    }
  }

  function removeIdleFrame(animationIndex, frameIndex) {
    if (customPet.animations.idle[animationIndex]) {
      customPet.animations.idle[animationIndex].splice(frameIndex, 1);
      customPet.animations = { ...customPet.animations }; // Force reactivity
    }
  }

  // Cycle through frames for preview
  let previewInterval = null;
  $: if (currentAnimation.length > 1 && selectedAnimationType !== "idle") {
    if (previewInterval) clearInterval(previewInterval);
    previewInterval = setInterval(() => {
      previewFrameIndex = (previewFrameIndex + 1) % currentAnimation.length;
    }, 500);
  } else {
    if (previewInterval) clearInterval(previewInterval);
    previewFrameIndex = 0;
  }

  onMount(() => {
    return () => {
      if (previewInterval) clearInterval(previewInterval);
    };
  });
</script>

<div class="flex flex-col gap-4">
  <!-- Preview Section -->
  <div class="flex flex-col gap-2 mt-4">
    <span class="text-xl font-[300] text-green-600 mb-2">preview</span>
    <div class="w-full min-h-[120px] bg-[#2e2e2e] p-4 rounded flex items-center justify-center">
      <pre class="text-white text-center font-mono whitespace-pre">{previewFrame || "Enter animation frames to see preview"}</pre>
    </div>
  </div>

  <!-- Animation Type Selector -->
  <div class="flex flex-col gap-2">
    <span class="text-sm font-[300] text-[#a1a1a1]">Animation Type</span>
    <select
      bind:value={selectedAnimationType}
      class="w-full bg-[#2e2e2e] text-white p-3 rounded font-mono text-sm"
    >
      {#each animationTypes as animType}
        <option value={animType.key}>{animType.label}</option>
      {/each}
      <option value="idle">Idle Animations</option>
    </select>
  </div>

  <!-- Normal Animations (single animation with multiple frames) -->
  {#if selectedAnimationType !== "idle"}
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-[300] text-[#a1a1a1]">{animationTypes.find(a => a.key === selectedAnimationType)?.label || selectedAnimationType} Frames</span>
        <button
          on:click={() => addFrame(selectedAnimationType)}
          class="px-3 py-1 bg-green-600 text-white rounded text-sm"
        >
          + Add Frame
        </button>
      </div>

      {#each (customPet.animations[selectedAnimationType] || []) as frame, frameIndex}
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-[300] text-[#a1a1a1]">Frame {frameIndex + 1}</span>
            <button
              on:click={() => removeFrame(selectedAnimationType, frameIndex)}
              class="px-2 py-1 bg-red-600 text-white rounded text-xs"
              disabled={customPet.animations[selectedAnimationType].length === 1 && animationTypes.find(a => a.key === selectedAnimationType)?.required}
            >
              Remove
            </button>
          </div>
          <textarea
            bind:value={customPet.animations[selectedAnimationType][frameIndex]}
            placeholder="Enter ASCII art frame"
            class="w-full bg-[#2e2e2e] text-white p-3 rounded font-mono text-sm resize-none"
            rows="4"
          ></textarea>
        </div>
      {/each}
    </div>
  {:else}
    <!-- Idle Animations (multiple animations, each with multiple frames) -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-[300] text-[#a1a1a1]">Idle Animations</span>
        <button
          on:click={addIdleAnimation}
          class="px-3 py-1 bg-green-600 text-white rounded text-sm"
        >
          + Add Animation
        </button>
      </div>

      {#each (customPet.animations.idle || []) as animation, animIndex}
        <div class="border border-[#444] p-4 rounded">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-[300] text-white">Animation {animIndex + 1}</span>
            <div class="flex gap-2">
              <button
                on:click={() => addIdleFrame(animIndex)}
                class="px-2 py-1 bg-blue-600 text-white rounded text-xs"
              >
                + Frame
              </button>
              <button
                on:click={() => removeIdleAnimation(animIndex)}
                class="px-2 py-1 bg-red-600 text-white rounded text-xs"
              >
                Remove
              </button>
            </div>
          </div>

          {#each animation as frame, frameIndex}
            <div class="flex flex-col gap-2 mb-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-[300] text-[#a1a1a1]">Frame {frameIndex + 1}</span>
                <button
                  on:click={() => removeIdleFrame(animIndex, frameIndex)}
                  class="px-2 py-1 bg-red-600 text-white rounded text-xs"
                  disabled={animation.length === 1}
                >
                  Remove
                </button>
              </div>
              <textarea
                bind:value={customPet.animations.idle[animIndex][frameIndex]}
                placeholder="Enter ASCII art frame"
                class="w-full bg-[#2e2e2e] text-white p-3 rounded font-mono text-sm resize-none"
                rows="4"
              ></textarea>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>
