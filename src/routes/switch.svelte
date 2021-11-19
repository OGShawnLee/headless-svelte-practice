<script>
	import Switch, {
		SwitchGroup,
		SwitchLabel,
		SwitchDescription,
	} from '$lib/components/switch/';
	let [passive, togglePassive] = [false, () => (passive = !passive)];
</script>

<svelte:head>
	<link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet" />
</svelte:head>

<h1>Switch</h1>
<h2>Individual Switch</h2>
<p>Switch Label and Switch must be connected via aria-labelledby</p>
<Switch let:checked class="switch" activeClass="switch--active">
	<span class:translate-x-6={checked} class="switch__thumb transform translate-x-1" />
	<SwitchLabel class="sr-only">Change App Theme</SwitchLabel>
</Switch>

<h2>Group Switch</h2>
<p>
	For more flexible layouts use SwitchGroup. The Label and Description must have an unique
	ID. Switch must be able to refer to multiple labels and descriptions as well. If a label
	or description is destroyed, the Switch must stop refering to them. The checked value
	must be accesible from the SwitchGroup so that it can be used throughout the component.
	The label must react to passive prop.
</p>
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
