<script lang="ts">
	import Menu, { MenuButton, MenuItem, MenuItems } from '$lib/components/menu/';
	import { fade } from 'svelte/transition';

	let numOOptions = 5;
	$: options = [...Array(numOOptions).keys()];

	function moreOOptions({ key }: KeyboardEvent) {
		if (key === 'r') numOOptions < 20 && numOOptions++;
	}
</script>

<svelte:body on:keydown={moreOOptions} />

<button> External </button>
<button> More </button>

<Menu>
	<MenuButton>Open</MenuButton>
	<MenuItems active="active" unactive="unactive">
		{#each options as idx}
			<MenuItem let:selected>MenuItem {idx} {selected}</MenuItem>
		{/each}
	</MenuItems>
</Menu>

<h2>Using Transitions</h2>
<Menu let:button let:menu let:open>
	<button use:button>Toggle</button>
	<div slot="menu" use:menu transition:fade>
		<MenuItem let:selected>{selected}Edit</MenuItem>
		<MenuItem let:selected>{selected} Add</MenuItem>
		<MenuItem let:selected>{selected} Something</MenuItem>
	</div>
</Menu>

<style>
	:global(.active) {
		color: green;
	}

	:global(.unactive) {
		color: red;
	}

	button:focus {
		background: black;
	}
</style>
