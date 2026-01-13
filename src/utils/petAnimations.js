// Pet animation data structure and utilities

// Animation definitions for preset pets
export const presetPetAnimations = {
  metrocon: {
    normal: [":)"],
    idle: [],
    hungry: [":P"],
    sleeping: ["zZz"],
    dirty: [":("],
    sad: [":("],
    away: [":|"],
    awayHungry: [":P"],
    fallAsleep: ["zZz"],
    feed: [":)"],
    clean: [":)"],
    play: [":)"],
  },
  tweety: {
    normal: [":D"],
    idle: [],
    hungry: [":P"],
    sleeping: ["zZz"],
    dirty: [":("],
    sad: [":("],
    away: [":|"],
    awayHungry: [":P"],
    fallAsleep: ["zZz"],
    feed: [":D"],
    clean: [":D"],
    play: [":D"],
  },
  meowth: {
    normal: [":3"],
    idle: [],
    hungry: [":P"],
    sleeping: ["zZz"],
    dirty: [":("],
    sad: [":("],
    away: [":|"],
    awayHungry: [":P"],
    fallAsleep: ["zZz"],
    feed: [":3"],
    clean: [":3"],
    play: [":3"],
  },
  Pakkun: {
    normal: [":P"],
    idle: [],
    hungry: [":P"],
    sleeping: ["zZz"],
    dirty: [":("],
    sad: [":("],
    away: [":|"],
    awayHungry: [":P"],
    fallAsleep: ["zZz"],
    feed: [":P"],
    clean: [":P"],
    play: [":P"],
  },
  Bugs: {
    normal: [":o"],
    idle: [],
    hungry: [":P"],
    sleeping: ["zZz"],
    dirty: [":("],
    sad: [":("],
    away: [":|"],
    awayHungry: [":P"],
    fallAsleep: ["zZz"],
    feed: [":o"],
    clean: [":o"],
    play: [":o"],
  },
  Kowalski: {
    normal: [":|"],
    idle: [],
    hungry: [":P"],
    sleeping: ["zZz"],
    dirty: [":("],
    sad: [":("],
    away: [":|"],
    awayHungry: [":P"],
    fallAsleep: ["zZz"],
    feed: [":|"],
    clean: [":|"],
    play: [":|"],
  },
};

// Default animation structure for custom pets
export function getDefaultCustomPetAnimations() {
  return {
    normal: [""],
    idle: [],
    hungry: [""],
    sleeping: [""],
    dirty: [""],
    sad: [""],
    away: [""],
    awayHungry: [""],
    fallAsleep: [""],
    feed: [""],
    clean: [""],
    play: [""],
  };
}

// Get current animation frame based on pet state
export function getCurrentAnimation(petType, animations, mood, status, eventType = null, actionType = null) {
  // Handle action-based animations (temporary, triggered by user actions)
  if (actionType === "feed") {
    return animations?.feed || animations?.normal || [":)"];
  }
  if (actionType === "clean") {
    return animations?.clean || animations?.normal || [":)"];
  }
  if (actionType === "play") {
    return animations?.play || animations?.normal || [":)"];
  }

  // Handle events (temporary animations)
  if (eventType === "pee") {
    return animations?.wet || animations?.normal || [":o"];
  }

  // Handle status-based animations
  if (status === "sleeping") {
    return animations?.sleeping || animations?.normal || [":|"];
  }

  if (status === "away") {
    // Determine which "away" animation to use
    if (mood === "hungry") {
      return animations?.awayHungry || animations?.away || animations?.normal || [":|"];
    }
    return animations?.away || animations?.normal || [":|"];
  }

  // Handle mood-based animations
  if (mood === "sleeping") {
    return animations?.fallAsleep || animations?.sleeping || animations?.normal || ["zZz"];
  }
  if (mood === "hungry") {
    return animations?.hungry || animations?.normal || [":P"];
  }
  if (mood === "dirty") {
    return animations?.dirty || animations?.normal || [":("];
  }
  if (mood === "sad") {
    return animations?.sad || animations?.normal || [":("];
  }

  // Default to normal/happy
  return animations?.normal || [":)"];
}

// Get idle animation (cycles through idle animations)
export function getIdleAnimation(animations, idleIndex = 0) {
  if (!animations?.idle || animations.idle.length === 0) {
    return animations?.normal || [":)"];
  }
  const animationIndex = idleIndex % animations.idle.length;
  return animations.idle[animationIndex] || animations.normal || [":)"];
}

