<script>
  export let onClick;
  export let text;
  export let className = "";
  export let style = "";
  export let disabled = false;
</script>

<button
  class={`text-base py-1 border-2 border-white w-fit px-4 ${className} font-[300] bg-transparent hover:bg-green-600`}
  on:click={onClick}
  {style}
  disabled={disabled}
  class:opacity-50={disabled}
>
  {text}
</button>
