<script>
  import { onMount, onDestroy } from "svelte";
  import { getCurrentAnimation, presetPetAnimations } from "../utils/petAnimations.js";

  export let pet;
  export let eventType = null;
  export let actionType = null;

  let currentFrameIndex = 0;
  let animationInterval = null;
  let animations = null;

  // Load animations - reactive
  $: {
    if (pet.type === "custom") {
      const saved = localStorage.getItem("custom_pet_data");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          animations = data.animations || null;
        } catch (e) {
          console.error("Error loading custom pet animations:", e);
          animations = null;
        }
      } else {
        animations = null;
      }
    } else {
      // Use preset animations directly (no need to save/load from localStorage)
      animations = presetPetAnimations[pet.type] || null;
    }
  }

  // Get current animation frames based on pet state
  $: animationFrames = (() => {
    if (!animations) return [":)"];
    
    return getCurrentAnimation(
      pet.type,
      animations,
      pet.mood,
      pet.status,
      eventType,
      actionType
    );
  })();

  // Update displayed frame
  $: currentFrame = animationFrames[currentFrameIndex % animationFrames.length] || animationFrames[0] || "";

  // Cycle through frames if animation has multiple frames
  function startAnimation() {
    if (animationInterval) clearInterval(animationInterval);
    
    if (animationFrames && animationFrames.length > 1) {
      animationInterval = setInterval(() => {
        currentFrameIndex = (currentFrameIndex + 1) % animationFrames.length;
      }, 500); // 500ms per frame
    } else {
      currentFrameIndex = 0;
    }
  }

  // Restart animation when frames change
  $: {
    if (animationFrames) {
      currentFrameIndex = 0;
      startAnimation();
    }
  }

  onMount(() => {
    if (animationFrames) {
      startAnimation();
    }
  });

  onDestroy(() => {
    if (animationInterval) clearInterval(animationInterval);
  });
</script>

<div class="pet-display custom-pet items-center justify-center bg-transparent border-none p-0 relative z-10">
  <pre class="custom-pet-art">{currentFrame}</pre>
</div>

<style>
  .custom-pet {
    font-size: 1.5rem;
    line-height: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custom-pet-art {
    margin: 0;
    font-size: 6rem;
    text-align: center;
    white-space: pre;
    font-family: monospace;
  }
</style>

