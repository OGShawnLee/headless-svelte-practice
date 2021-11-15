<script lang="ts">
	import Disclosure, {
		DisclosureButton,
		DisclosurePanel,
	} from '$lib/components/disclosure';

	let [open, toggle] = [false, () => (open = !open)];
	let specialElement: HTMLElement;

	import { fade } from 'svelte/transition';
</script>

<button bind:this={specialElement}>I am special</button>

{open}
<h2>Bound Disclosures</h2>
<Disclosure bind:open let:close>
	<DisclosureButton>Toggle</DisclosureButton>
	<DisclosurePanel>
		<span> This is an amazing disclosure </span>
		<button on:click={() => close(specialElement)}>Begone</button>
	</DisclosurePanel>
</Disclosure>

<Disclosure bind:open let:close>
	<DisclosureButton>Toggle</DisclosureButton>
	<DisclosurePanel>
		<span> This is an amazing disclosure </span>
		<button on:click={() => close(specialElement)}>Begone</button>
	</DisclosurePanel>
</Disclosure>

<Disclosure bind:open let:close>
	<DisclosureButton>Toggle</DisclosureButton>
	<DisclosurePanel>
		<span> This is an amazing disclosure </span>
		<button on:click={() => close(specialElement)}>Begone</button>
	</DisclosurePanel>
</Disclosure>

<h2>Individual Disclosure</h2>
<Disclosure let:close>
	<DisclosureButton>Toggle</DisclosureButton>
	<DisclosurePanel>
		<span> This is an amazing disclosure </span>
		<button on:click={() => close(specialElement)}>Begone</button>
	</DisclosurePanel>
</Disclosure>

<h2>Custom div elements using Actions, and built-in transitions</h2>
<Disclosure let:button let:panel>
	<li use:button>Toggle</li>
	<button slot="panel" use:panel transition:fade={{ duration: 150 }}>
		This is another disclosure
	</button>
</Disclosure>

{#if open}
	<Disclosure let:button let:panel>
		<li use:button>Toggle</li>
		<button slot="panel" use:panel transition:fade={{ duration: 150 }}>
			This is another disclosure
		</button>
	</Disclosure>
{/if}
