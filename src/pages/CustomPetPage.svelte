<script>
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import CustomPetEditor from "../components/CustomPetEditor.svelte";
  import Button from "../components/Button.svelte";

  import { getDefaultCustomPetAnimations } from "../utils/petAnimations.js";

  let customPet = {
    animations: getDefaultCustomPetAnimations(),
  };

  onMount(() => {
    // Load saved custom pet data if exists
    const savedCustomPet = localStorage.getItem("custom_pet_data");
    if (savedCustomPet) {
      try {
        const loaded = JSON.parse(savedCustomPet);
        // Migrate old format to new format if needed
        if (loaded.eye || loaded.mouth || loaded.limb) {
          // Old format - migrate to new
          customPet.animations = getDefaultCustomPetAnimations();
          // Set normal animation from old data if available
          const parts = [];
          if (loaded.eye) parts.push(`${loaded.eye} ${loaded.eye}`);
          if (loaded.mouth) parts.push(loaded.mouth);
          if (loaded.limb) parts.push(`${loaded.limb} ${loaded.limb}`);
          customPet.animations.normal = [parts.join('\n')];
        } else {
          customPet = loaded;
          // Ensure animations structure exists
          if (!customPet.animations) {
            customPet.animations = getDefaultCustomPetAnimations();
          }
        }
      } catch (e) {
        console.error("Error loading custom pet data:", e);
        customPet.animations = getDefaultCustomPetAnimations();
      }
    }
  });

  function handleSave() {
    // Validate that at least normal animation has at least one frame
    if (!customPet.animations?.normal || customPet.animations.normal.length === 0 || 
        !customPet.animations.normal[0] || !customPet.animations.normal[0].trim()) {
      return;
    }

    // Save custom pet data
    localStorage.setItem("custom_pet_data", JSON.stringify(customPet));
    localStorage.setItem("pet_type", "custom");

    // Navigate back to setup page
    window.dispatchEvent(new CustomEvent("close-custom-pet"));
  }

  function handleBack() {
    window.dispatchEvent(new CustomEvent("close-custom-pet"));
  }

  $: canSave = customPet.animations?.normal && 
               customPet.animations.normal.length > 0 && 
               customPet.animations.normal[0]?.trim();
</script>

<div class="flex flex-col w-full font-[400] h-screen page overflow-x-hidden">
  <span class="text-base font-[500] h-fit px-4 uppercase mt-2">metrogotchi</span>
  <span class="text-6xl font-[200] h-auto py-1 px-4">custom pet</span>

  <div
    class="flex flex-col gap-4 mt-4 overflow-y-auto overflow-x-hidden px-4 h-full pb-4"
  >
    <CustomPetEditor bind:customPet />

    <!-- Buttons Section -->
    <div class="flex flex-col gap-1 mt-8">
      <Button
        text="save custom pet"
        onClick={handleSave}
        className="mt-2"
        disabled={!canSave}
      />
      <Button
        text="back"
        onClick={handleBack}
        className="mt-4"
        disabled={false}
      />
    </div>
  </div>
</div>

