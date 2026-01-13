<script>
  import { onMount, onDestroy } from "svelte";
  import PetDisplay from "../components/PetDisplay.svelte";
  import StatsDisplay from "../components/StatsDisplay.svelte";
  import ActionsPanel from "../components/ActionsPanel.svelte";

  // Pet state
  let pet = {
    name: "Metro Pet",
    type: "tweety",
    age: 0, // in minutes
    happiness: 50,
    hunger: 50,
    energy: 50,
    cleanliness: 50,
    mood: "happy", // happy, sad, hungry, tired, sleepy, away, sleeping, wet
    status: "present", // present, away, sleeping
  };
  

  let lastUpdateTime = Date.now();
  let updateInterval;
  let awayUntil = null; // timestamp when pet will return
  let lastInteractionTime = Date.now(); // track when user last interacted

  // Event system
  let currentEvent = null; // current event animation being displayed
  let eventQueue = []; // queue of events to show
  let lastSeenEventTime = null; // last event timestamp user has seen
  let eventAnimation = null; // current event animation type
  let configLoaded = false; // track if pet config has been loaded from localStorage

  // Event types and animations
  const eventTypes = {
    leaveCompany: {
      emoticon: ":|",
      duration: 2500,
      animation: "leave",
    },
    leaveFood: {
      emoticon: ":P",
      duration: 2500,
      animation: "leave",
    },
    fallAsleep: {
      emoticon: "zZz",
      duration: 2500,
      animation: "sleep",
    },
    pee: {
      emoticon: ":o",
      duration: 2000,
      animation: "pee",
    },
  };

  // Record a life event
  function recordEvent(type, timestamp = Date.now()) {
    const event = {
      type,
      timestamp,
      id: `${type}-${timestamp}`,
    };

    // Save to localStorage
    const savedEvents = localStorage.getItem("pet_events");
    let events = savedEvents ? JSON.parse(savedEvents) : [];
    events.push(event);
    // Keep only last 50 events
    if (events.length > 50) {
      events = events.slice(-50);
    }
    localStorage.setItem("pet_events", JSON.stringify(events));

    // If app is open, show immediately
    if (document.visibilityState === "visible") {
      showEvent(type);
    }
  }

  // Show an event animation on pet display
  function showEvent(type) {
    if (!eventTypes[type]) return;

    const eventData = eventTypes[type];
    eventAnimation = eventData.animation;
    currentEvent = eventData.emoticon;

    setTimeout(() => {
      eventAnimation = null;
      currentEvent = null;
      // Process next event in queue
      if (eventQueue.length > 0) {
        const nextEvent = eventQueue.shift();
        setTimeout(() => showEvent(nextEvent), 500);
      }
    }, eventData.duration);
  }

  // Check for missed events since last visit
  function checkMissedEvents() {
    const savedEvents = localStorage.getItem("pet_events");
    const lastSeen = localStorage.getItem("last_seen_event_time");
    const lastSeenTime = lastSeen ? parseInt(lastSeen, 10) : 0;

    let missedEvents = [];

    if (savedEvents) {
      const events = JSON.parse(savedEvents);
      // Filter events that happened after last seen
      missedEvents = events.filter((event) => event.timestamp > lastSeenTime);

      // Update last seen time
      if (events.length > 0) {
        const latestEvent = events[events.length - 1];
        localStorage.setItem(
          "last_seen_event_time",
          latestEvent.timestamp.toString()
        );
      }
    }

    // Also check for events that should have happened based on current state
    const savedStats = localStorage.getItem("pet_stats");
    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats);
        const lastSaved = stats.lastSaved || Date.now();
        const now = Date.now();
        const timeSinceSave = (now - lastSaved) / 1000; // seconds

        // Check if pet should have left for food while away
        if (
          stats.hunger >= 100 &&
          stats.status === "away" &&
          lastSaved > lastSeenTime
        ) {
          // Pet left for food while app was closed
          const leaveTime = lastSaved;
          if (
            !missedEvents.find(
              (e) =>
                e.type === "leaveFood" &&
                Math.abs(e.timestamp - leaveTime) < 60000
            )
          ) {
            recordEvent("leaveFood", leaveTime);
            missedEvents.push({ type: "leaveFood", timestamp: leaveTime });
          }
        }

        // Check if pet should have fallen asleep while app was closed
        if (
          stats.energy <= 0 &&
          stats.status === "sleeping" &&
          lastSaved > lastSeenTime
        ) {
          const sleepTime = lastSaved;
          if (
            !missedEvents.find(
              (e) =>
                e.type === "fallAsleep" &&
                Math.abs(e.timestamp - sleepTime) < 60000
            )
          ) {
            recordEvent("fallAsleep", sleepTime);
            missedEvents.push({ type: "fallAsleep", timestamp: sleepTime });
          }
        }
      } catch (e) {
        console.error("Error checking missed events:", e);
      }
    }

    if (missedEvents.length > 0) {
      // Sort by timestamp
      missedEvents.sort((a, b) => a.timestamp - b.timestamp);
      // Add to queue and show them
      eventQueue = missedEvents.map((e) => e.type);
      if (eventQueue.length > 0) {
        setTimeout(() => {
          showEvent(eventQueue.shift());
        }, 1000); // Small delay to let page load
      }
    }
  }

  // Load pet configuration and state from localStorage
  function loadPetConfig() {
    const savedName = localStorage.getItem("pet_name");
    const savedType = localStorage.getItem("pet_type");
    const createdAt = localStorage.getItem("pet_created_at");
    
    if (savedName) {
      pet.name = savedName;
    }
    if (savedType) {
      pet.type = savedType;
    } else if (!pet.type) {
      // Default to tweety if no type is saved and not already set
      pet.type = "tweety";
    }

    // Ensure pet type is always set
    if (!pet.type) {
      pet.type = "tweety";
    }
    

    // Calculate age from creation timestamp
    if (createdAt) {
      const createdTimestamp = parseInt(createdAt, 10);
      const now = Date.now();
      const ageInMinutes = (now - createdTimestamp) / (1000 * 60);
      pet.age = Math.max(0, ageInMinutes); // Ensure age is never negative
    } else {
      // No creation timestamp - new pet, age is 0
      pet.age = 0;
    }

    // Load saved pet stats if they exist
    const savedStats = localStorage.getItem("pet_stats");
    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats);
        const savedTimestamp = stats.lastSaved || Date.now();
        const now = Date.now();
        const timeSinceSave = (now - savedTimestamp) / 1000; // seconds

        pet.mood = stats.mood || "happy";
        pet.status = stats.status || "present";
        // Restore pet type if saved in stats (prioritize stats over localStorage)
        if (stats.type) {
          pet.type = stats.type;
        }
        // Ensure pet type is set (fallback to localStorage or default)
        if (!pet.type) {
          const savedType = localStorage.getItem("pet_type");
          pet.type = savedType || "tweety";
        }

        // Restore stats
        pet.happiness = Math.max(0, Math.min(100, stats.happiness || 50));
        pet.hunger = Math.max(0, Math.min(100, stats.hunger || 50));
        pet.energy = Math.max(0, Math.min(100, stats.energy || 50));
        pet.cleanliness = Math.max(0, Math.min(100, stats.cleanliness || 50));

        // Update stats based on time passed since last save
        if (pet.status === "present") {
          pet.hunger = Math.min(100, pet.hunger + timeSinceSave * 0.05);
          pet.happiness = Math.max(0, pet.happiness - timeSinceSave * 0.02);
          pet.energy = Math.max(0, pet.energy - timeSinceSave * 0.03);
          pet.cleanliness = Math.max(
            0,
            pet.cleanliness - timeSinceSave * 0.01
          );
        } else if (pet.status === "sleeping") {
          pet.energy = Math.min(100, pet.energy + timeSinceSave * 0.1);
        }

        // Check if pet should have returned from being away
        if (stats.awayUntil) {
          const awayUntilTimestamp = parseInt(stats.awayUntil, 10);
          if (now >= awayUntilTimestamp) {
            pet.status = "present";
            if (pet.mood === "away") {
              pet.mood = "happy";
              if (pet.happiness >= 100) {
                pet.happiness = Math.max(0, pet.happiness - 20);
              }
              if (pet.hunger >= 100) {
                pet.hunger = Math.max(0, pet.hunger - 30);
              }
            } else if (pet.mood === "sleeping") {
              pet.mood = "happy";
              pet.energy = Math.min(100, pet.energy + 30);
            }
          } else {
            awayUntil = awayUntilTimestamp;
          }
        }

        updateMood();
      } catch (e) {
        console.error("Error loading pet stats:", e);
      }
    } else {
      // No saved stats - new pet with default stats
      pet.happiness = 50;
      pet.hunger = 50;
      pet.energy = 50;
      pet.cleanliness = 50;
    }
    
    // Mark config as loaded
    configLoaded = true;
    
    // Force reactivity by reassigning pet object
    pet = { ...pet };
  }

  // Save pet stats to localStorage
  function savePetStats() {
    const statsToSave = {
      happiness: pet.happiness,
      hunger: pet.hunger,
      energy: pet.energy,
      cleanliness: pet.cleanliness,
      mood: pet.mood,
      status: pet.status,
      type: pet.type,
      lastSaved: Date.now(),
      awayUntil: awayUntil ? awayUntil.toString() : null,
    };
    localStorage.setItem("pet_stats", JSON.stringify(statsToSave));
  }

  // Update pet stats over time
  function updatePetStats() {
    // Don't update stats until config is loaded
    if (!configLoaded) {
      return;
    }
    
    const now = Date.now();
    const deltaTime = (now - lastUpdateTime) / 1000; // seconds
    lastUpdateTime = now;

    // Check if pet is away or sleeping
    if (awayUntil && now >= awayUntil) {
      const wasAway = pet.status === "away";
      const wasSleeping = pet.status === "sleeping";

      pet.status = "present";
      awayUntil = null;

      if (wasAway) {
        pet.mood = "happy";
        // Adjust stats based on why pet left
        if (pet.happiness >= 100) {
          pet.happiness = Math.max(0, pet.happiness - 20); // decrease happiness after looking for company
        }
        if (pet.hunger >= 100) {
          pet.hunger = Math.max(0, pet.hunger - 30); // decrease hunger after looking for food
        }
      } else if (wasSleeping) {
        pet.mood = "happy";
        pet.energy = Math.min(100, pet.energy + 30); // restore some energy after sleep
      }

      savePetStats();
    }

    // If pet is sleeping, only restore energy
    if (pet.status === "sleeping") {
      pet.energy = Math.min(100, pet.energy + deltaTime * 0.1);
      return;
    }

    // If pet is away, don't update stats
    if (pet.status === "away") {
      return;
    }

    // All metrics change over time
    pet.hunger = Math.min(100, pet.hunger + deltaTime * 0.05); // hunger increases
    pet.happiness = Math.max(0, pet.happiness - deltaTime * 0.02); // happiness decreases slowly
    pet.energy = Math.max(0, pet.energy - deltaTime * 0.03); // energy decreases
    pet.cleanliness = Math.max(0, pet.cleanliness - deltaTime * 0.01); // cleanliness decreases slowly

    // Special behaviors
    const timeSinceInteraction = (now - lastInteractionTime) / 1000; // seconds since last interaction

    // When fully happy and left unattended for 30 seconds, pet leaves to look for company
    if (
      pet.happiness >= 100 &&
      timeSinceInteraction > 30 &&
      pet.status === "present"
    ) {
      pet.status = "away";
      pet.mood = "away";
      awayUntil = now + 2 * 60 * 1000; // away for 2 minutes
      recordEvent("leaveCompany");
      savePetStats();
    }

    // When fully hungry, pet leaves to look for food
    if (pet.hunger >= 100 && pet.status === "present") {
      pet.status = "away";
      pet.mood = "away";
      awayUntil = now + 2 * 60 * 1000; // away for 2 minutes
      recordEvent("leaveFood");
      savePetStats();
    }

    // When cleanliness is full, pet wets the floor
    if (
      pet.cleanliness >= 100 &&
      pet.status === "present"
    ) {
      pet.mood = "wet";
      pet.cleanliness = 0; // reset cleanliness
      recordEvent("pee");
      savePetStats();
      // Mood returns to normal after a few seconds
      setTimeout(() => {
        if (pet.mood === "wet") {
          updateMood();
          savePetStats();
        }
      }, 5000);
    }

    // When out of energy, pet sleeps
    if (pet.energy <= 0 && pet.status === "present") {
      pet.status = "sleeping";
      pet.mood = "sleeping";
      awayUntil = now + 2 * 60 * 1000; // sleep for 2 minutes
      recordEvent("fallAsleep");
      savePetStats();
    }

    // Update mood based on stats
    updateMood();

    // Age progression - calculate from creation timestamp
    const createdAt = localStorage.getItem("pet_created_at");
    if (createdAt) {
      const createdTimestamp = parseInt(createdAt, 10);
      pet.age = (now - createdTimestamp) / (1000 * 60); // age in minutes
    } else {
      pet.age += deltaTime / 60; // fallback if no timestamp
    }

    // Save stats periodically
    savePetStats();
  }

  function updateMood() {
    // Don't override special moods
    if (pet.mood === "away" || pet.mood === "sleeping" || pet.mood === "wet") {
      return;
    }

    if (pet.hunger > 70) {
      pet.mood = "hungry";
    } else if (pet.energy < 20) {
      pet.mood = "tired";
    } else if (pet.cleanliness < 30) {
      pet.mood = "dirty";
    } else if (pet.happiness < 40) {
      pet.mood = "sad";
    } else if (pet.energy < 50) {
      pet.mood = "sleepy";
    } else {
      pet.mood = "happy";
    }
  }

  // Actions
  function feed() {
    if (pet.status !== "present") return;
    lastInteractionTime = Date.now();
    if (pet.hunger > 0) {
      pet.hunger = Math.max(0, pet.hunger - 30);
      pet.happiness = Math.min(100, pet.happiness + 5);
      updateMood();
      savePetStats();
    }
  }

  function play() {
    if (pet.status !== "present") return;
    lastInteractionTime = Date.now();
    if (pet.energy > 20) {
      pet.happiness = Math.min(100, pet.happiness + 15);
      pet.energy = Math.max(0, pet.energy - 15);
      updateMood();
      savePetStats();
    }
  }

  function clean() {
    if (pet.status !== "present") return;
    lastInteractionTime = Date.now();
    pet.cleanliness = Math.min(100, pet.cleanliness + 40);
    pet.happiness = Math.min(100, pet.happiness + 5);
    updateMood();
    savePetStats();
  }

  function sleep() {
    if (pet.status !== "present") return;
    lastInteractionTime = Date.now();
    pet.status = "sleeping";
    pet.mood = "sleeping";
    awayUntil = Date.now() + 2 * 60 * 1000; // sleep for 2 minutes
    savePetStats();
  }

  // Lifecycle
  onMount(() => {
    loadPetConfig();
    lastUpdateTime = Date.now();
    lastInteractionTime = Date.now();

    // Check for missed events
    checkMissedEvents();

    updateInterval = setInterval(updatePetStats, 1000);

    // Listen for visibility changes to check for missed events
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        checkMissedEvents();
      }
    });
  });

  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });

  // Format age
  $: ageDisplay =
    pet.age < 60
    ? `${Math.floor(pet.age)}m`
    : pet.age < 1440
    ? `${Math.floor(pet.age / 60)}h ${Math.floor(pet.age % 60)}m`
    : `${Math.floor(pet.age / 1440)}d ${Math.floor((pet.age % 1440) / 60)}h`;

</script>

<div class="flex flex-col w-full font-[400] h-screen page overflow-x-hidden">
  <span class="text-base font-[500] h-fit px-4 uppercase mt-2">metrogotchi</span
  >
  <span class="text-6xl font-[200] h-auto py-1 px-4">{pet.name}</span>
  
  <div
    class="flex flex-col gap-4 mt-4 overflow-y-auto overflow-x-hidden px-4 h-full"
  >
    <PetDisplay 
      {pet} 
      eventAnimation={eventAnimation}
      {ageDisplay}
    />

    <StatsDisplay {pet} />

    <ActionsPanel 
      {pet} 
      {feed} 
      {play} 
      {clean} 
      {sleep} 
    />
  </div>
</div>
