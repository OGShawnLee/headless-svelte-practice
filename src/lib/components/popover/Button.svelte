<script lang="ts">
	import { getContext } from 'svelte';
	import { isPopoverContext, POPOVERS_CONTEXT_KEY } from './Popover.svelte';

	let className = '';
	export { className as class };

	const PopoverContext = getContext(POPOVERS_CONTEXT_KEY);
	if (!isPopoverContext(PopoverContext)) throw new Error('Invalid Popover Context');

	const { button } = PopoverContext;
</script>

<button class={className} use:button>
	<slot />
</button>
