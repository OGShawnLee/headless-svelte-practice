<script>
	import Popover, {
		PopoverGroup,
		PopoverButton,
		PopoverPanel,
	} from '$lib/components/popover';
	import { fade } from 'svelte/transition';
</script>

<h1>Popover</h1>
<h2>Individual Popover</h2>
<p>
	Button automatically toggles the popover. Pressing Escape, clicking away or losing focus
	will close the popover. Upon closing focus returns to the the popover button
</p>
<Popover let:open let:button let:panel let:close>
	{open}
	<button use:button> Toggle Popover </button>
	<div slot="panel" use:panel>
		<p>What a wonderful day</p>
		<button on:click={close}>Close this</button>
	</div>
</Popover>

<h2>Popover Group</h2>
<p>
	Clicking or focusing elements inside the group wont close any Popover inside the group.
	Clicking away, focusing out of the group or pressing Escape will close all popovers.
	Since there are many Popover Buttons, upon closing the focus stays wherever it was.
</p>
<PopoverGroup>
	<Popover let:open let:button let:panel let:close>
		{open}
		<button use:button> Toggle Popover </button>
		<div slot="panel" use:panel>
			<p>What a wonderful day</p>
			<button on:click={close}>Close this</button>
		</div>
	</Popover>

	<Popover let:open let:button let:panel let:close>
		{open}
		<button use:button> Toggle Popover </button>
		<div slot="panel" use:panel>
			<p>What a wonderful day</p>
			<button on:click={close}>Close this</button>
		</div>
	</Popover>

	<Popover let:open let:button let:panel let:close>
		{open}
		<button use:button> Toggle Popover </button>
		<div slot="panel" use:panel>
			<p>What a wonderful day</p>
			<button on:click={close}>Close this</button>
		</div>
	</Popover>
</PopoverGroup>

<h2>Compound Popover</h2>
<p>
	Popover creted with Popover subcomponent. Drawback is that the panel can't have a
	transition directly on it. User has to wrap the inner content within a normal DOM
	element with a transition directive
</p>
<Popover let:close>
	<PopoverButton>Toggle</PopoverButton>
	<PopoverPanel>
		<div transition:fade>
			This is a beautiful popover
			<button on:click={close}>Close popover</button>
		</div>
	</PopoverPanel>
</Popover>
