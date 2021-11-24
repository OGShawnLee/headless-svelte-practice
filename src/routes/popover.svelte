<script lang="ts">
	import Popover, {
		PopoverGroup,
		PopoverButton,
		PopoverPanel,
	} from '$lib/components/popover';

	let ref: HTMLElement;
	let [expanded, toggleExpanded] = [false, () => (expanded = !expanded)];
</script>

<button bind:this={ref}>External</button>

<Popover let:open let:button let:panel let:close>
	<button use:button>Toggler {open}</button>
	<div slot="panel" use:panel>
		This is an amazing popover!
		<button on:click={close}>Close this</button>
	</div>
</Popover>
<Popover let:open let:button let:panel let:close>
	<button use:button>Toggler {open}</button>
	<div slot="panel" use:panel>
		This is an amazing popover!
		<button on:click={() => close(ref)}>Use Ref</button>
	</div>
</Popover>

<br />

<svelte:window on:keydown={({ key }) => key === 't' && toggleExpanded()} />

<button class:active={expanded} on:click={toggleExpanded}>Toggle Expanded</button>
<PopoverGroup {expanded}>
	<Popover let:open let:button let:panel let:close>
		<button use:button>Toggler {open}</button>
		<div slot="panel" use:panel>
			This is an amazing popover!
			<button on:click={close}>Close this</button>
		</div>
	</Popover>
	<Popover let:open let:button let:panel let:close>
		<button use:button>Toggler {open}</button>
		<div slot="panel" use:panel>
			This is an amazing popover!
			<button on:click={() => close(ref)}>Use Ref</button>
		</div>
	</Popover>
	<Popover let:open let:button let:panel let:close>
		<button use:button>Toggler {open}</button>
		<div slot="panel" use:panel>
			This is an amazing popover!
			<button on:click={() => close(ref)}>Use Ref</button>
		</div>
	</Popover>
</PopoverGroup>

<br />

<Popover let:close let:open>
	<PopoverButton>Toggle {open}</PopoverButton>
	<PopoverPanel>
		This is an amazing popover!
		<button on:click={close}>Close this</button>
	</PopoverPanel>
</Popover>

<Popover let:close let:open>
	<PopoverButton>Toggle {open}</PopoverButton>
	<PopoverPanel>
		This is an amazing popover!
		<button on:click={() => close(ref)}>Use ref</button>
	</PopoverPanel>
</Popover>

<br />

<PopoverGroup {expanded}>
	<Popover let:open let:close>
		<PopoverButton>Toggler {open}</PopoverButton>
		<PopoverPanel>
			This is an amazing popover!
			<button on:click={close}>Close this</button>
		</PopoverPanel>
	</Popover>
	<Popover let:open let:close>
		<PopoverButton>Toggler {open}</PopoverButton>
		<PopoverPanel>
			This is an amazing popover!
			<button on:click={() => close(ref)}>Use Ref</button>
		</PopoverPanel>
	</Popover>
	<Popover let:open let:close>
		<PopoverButton>Toggler {open}</PopoverButton>
		<PopoverPanel>
			This is an amazing popover!
			<button on:click={() => close(ref)}>Use Ref</button>
		</PopoverPanel>
	</Popover>
</PopoverGroup>

<style>
	.active {
		color: green;
	}
</style>
