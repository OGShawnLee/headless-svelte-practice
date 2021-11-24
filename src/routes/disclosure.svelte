<script lang="ts">
	import Disclosure, {
		DisclosureButton,
		DisclosurePanel,
	} from '$lib/components/disclosure';
	let ref: HTMLElement;

	let show = false;
	let destroy = () => (show = !show);
</script>

<button bind:this={ref}>External</button>

<Disclosure let:button let:panel let:open>
	<button use:button> Toggle {open}</button>
	<div slot="panel" use:panel>This is an amazing disclosure</div>
</Disclosure>

<Disclosure let:button let:panel let:open let:close>
	<button use:button> Toggle {open}</button>
	<div slot="panel" use:panel>
		This is an amazing disclosure
		<button on:click={close}>Close this</button>
	</div>
</Disclosure>

<Disclosure let:button let:panel let:open let:close>
	<button use:button> Toggle {open}</button>
	<div slot="panel" use:panel>
		This is an amazing disclosure
		<button on:click={() => close(ref)}>Use Ref</button>
	</div>
</Disclosure>

<Disclosure let:open let:close>
	<DisclosureButton>Toggle {open}</DisclosureButton>
	<DisclosurePanel>
		This is an amazing disclosure
		<button on:click={() => close(ref)}>Use Ref</button>
	</DisclosurePanel>
</Disclosure>

<Disclosure open let:open let:close>
	<DisclosureButton>Toggle {open}</DisclosureButton>
	<DisclosurePanel>
		This is an amazing disclosure
		<button on:click={() => close(ref)}>Use Ref</button>
	</DisclosurePanel>
</Disclosure>

<br />
<button on:click={destroy}>Test Destroy and Mount</button>
{#if show}
	<Disclosure open let:open let:close>
		<DisclosureButton>Toggle {open}</DisclosureButton>
		<DisclosurePanel>
			This is an amazing disclosure
			<button on:click={() => close(ref)}>Use Ref</button>
		</DisclosurePanel>
	</Disclosure>
{/if}
