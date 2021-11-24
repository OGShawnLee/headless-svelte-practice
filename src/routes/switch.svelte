<script>
	import Switch, {
		SwitchGroup,
		SwitchLabel,
		SwitchDescription,
	} from '$lib/components/switch/';

	let [passive, togglePassive] = [false, () => (passive = !passive)];
	let show = false;
	let destroy = () => (show = !show);
</script>

<svelte:head>
	<link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet" />
</svelte:head>

<button on:click={destroy}>Test Destroy and Mount</button>
{#if show}
	<Switch let:checked class="switch" activeClass="switch--active">
		<span class:translate-x-6={checked} class="switch__thumb transform translate-x-1" />
		<SwitchLabel class="sr-only">Change App Theme</SwitchLabel>
	</Switch>
{/if}

<br />

<button on:click={togglePassive} class:text-blue-500={passive}>Toggle Passive</button>
<SwitchGroup let:checked>
	<Switch class="switch" activeClass="switch--active">
		<span class:translate-x-6={checked} class="switch__thumb transform translate-x-1" />
		<SwitchLabel class="sr-only">Delete Account?</SwitchLabel>
	</Switch>
	<SwitchLabel {passive} class={checked ? 'text-blue-500' : ''}>
		Toggle Notifications
	</SwitchLabel>
	<SwitchDescription class="font-medium">
		We will send notifications about our new games every weekeend
	</SwitchDescription>
</SwitchGroup>

<style>
	:global(.switch) {
		position: relative;
		display: inline-flex;
		align-items: center;
		width: 2.75rem;
		height: 1.5rem;
		background-color: #bbb;
		border-radius: 2ex;
	}

	:global(.switch--active) {
		background-color: #0099ff;
	}
	:global(.switch__thumb) {
		display: inline-block;
		width: 1rem;
		height: 1rem;
		background-color: white;
		border-radius: 100%;
	}
</style>
