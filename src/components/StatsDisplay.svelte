<script>
  import StatBar from './StatBar.svelte';
  
  export let pet;
</script>

<div class="flex flex-col gap-1">
  <div class="flex flex-col gap-4 mt-2">
    <!-- Happiness -->
    <StatBar 
      label="Happiness" 
      value={pet.happiness} 
      color={pet.happiness > 50 ? '#ffeb3b' : '#ff9800'} 
    />

    <!-- Hunger -->
    <StatBar 
      label="Hunger" 
      value={pet.hunger} 
      color={pet.hunger < 50 ? '#8bc34a' : pet.hunger < 80 ? '#ff9800' : '#f44336'} 
    />

    <!-- Energy -->
    <StatBar 
      label="Energy" 
      value={pet.energy} 
      color={pet.energy > 50 ? '#2196f3' : '#ff9800'} 
    />

    <!-- Cleanliness -->
    <StatBar 
      label="Cleanliness" 
      value={pet.cleanliness} 
      color={pet.cleanliness > 50 ? '#00bcd4' : '#9e9e9e'} 
    />
  </div>
</div>

