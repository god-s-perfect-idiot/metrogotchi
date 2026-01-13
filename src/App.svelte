<script>
  import { onMount } from "svelte";
  import PetPage from "./pages/PetPage.svelte";
  import SetupPage from "./pages/SetupPage.svelte";
  import CustomPetPage from "./pages/CustomPetPage.svelte";
  import { App as CapacitorApp } from "@capacitor/app";

  let mounted = false;
  let showSetup = false;
  let showCustomPet = false;
  let isExiting = false;

  function checkPetConfigured() {
    const petName = localStorage.getItem('pet_name');
    const petType = localStorage.getItem('pet_type');
    showSetup = !petName || !petType;
  }

  onMount(() => {
    mounted = true;
    checkPetConfigured();
    
    // Listen for pet configuration event
    window.addEventListener('pet-configured', () => {
      isExiting = true;
      setTimeout(() => {
        checkPetConfigured();
        isExiting = false;
        // Trigger flip-in for new page
        mounted = false;
        setTimeout(() => {
          mounted = true;
        }, 50);
      }, 300); // Match flip-out animation duration
    });

    // Listen for configure button click
    window.addEventListener('open-setup', () => {
      isExiting = true;
      setTimeout(() => {
        showSetup = true;
        isExiting = false;
        mounted = false;
        setTimeout(() => {
          mounted = true;
        }, 50);
      }, 300); // Match flip-out animation duration
    });

    // Listen for custom pet page navigation
    window.addEventListener('open-custom-pet', () => {
      isExiting = true;
      setTimeout(() => {
        showSetup = false;
        showCustomPet = true;
        isExiting = false;
        mounted = false;
        setTimeout(() => {
          mounted = true;
        }, 50);
      }, 300);
    });

    // Listen for close custom pet page
    window.addEventListener('close-custom-pet', () => {
      isExiting = true;
      setTimeout(() => {
        showCustomPet = false;
        showSetup = true;
        isExiting = false;
        mounted = false;
        setTimeout(() => {
          mounted = true;
        }, 50);
      }, 300);
    });
    
    // Initialize Capacitor plugins
    async function initCapacitor() {
      try {
        CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            CapacitorApp.exitApp();
          } else {
            window.history.back();
          }
        });
      } catch (error) {
        console.log('Capacitor not available (running in browser)', error);
      }
    }
    
    initCapacitor();
  });
</script>

<main class="w-full h-full relative">
  <div class="page-holder">
    <div class="page" class:flip-in={mounted && !isExiting} class:flip-out={isExiting}>
      {#if showCustomPet}
        <CustomPetPage />
      {:else if showSetup}
        <SetupPage />
      {:else}
        <PetPage />
      {/if}
    </div>
  </div>
</main>

<style>
  .page-holder {
    perspective: 1000px;
    perspective-origin: center center;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }
  
  .page {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transform-origin: left center;
    transform: rotateY(90deg);
    opacity: 0;
  }
  
  .page.flip-in {
    animation: flipIn 0.3s ease-out forwards;
  }

  .page.flip-out {
    animation: flipOut 0.3s ease-in forwards;
  }
  
  @keyframes flipIn {
    from {
      transform: rotateY(90deg);
      opacity: 0;
    }
    to {
      transform: rotateY(0deg);
      opacity: 1;
    }
  }

  @keyframes flipOut {
    from {
      transform: rotateY(0deg);
      opacity: 1;
    }
    to {
      transform: rotateY(-90deg);
      opacity: 0;
    }
  }
</style>
