<script>
  export let label;
  export let value;
  export let color;
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center justify-between">
    <span class="text-sm font-[300] text-[#a1a1a1]">{label}</span>
    <span class="text-sm font-[300]">{Math.round(value)}%</span>
  </div>
  <div class="w-full h-2 bg-[#2e2e2e] overflow-hidden">
    <div 
      class="h-full transition-all duration-300"
      style="width: {value}%; background-color: {color};"
    ></div>
  </div>
</div>


