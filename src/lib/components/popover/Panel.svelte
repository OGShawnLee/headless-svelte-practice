<script lang="ts">
	import { getContext } from 'svelte';
	import { isPopoverContext, POPOVER_CONTEXT_KEY } from './Popover.svelte';

	let className = '';
	export { className as class };

	const PopoverContext = getContext(POPOVER_CONTEXT_KEY);
	if (!isPopoverContext(PopoverContext)) throw new Error('Invalid Popover Context');

	const { Open, panel } = PopoverContext;
</script>

{#if $Open}
	<div class={className} use:panel>
		<slot />
	</div>
{/if}
