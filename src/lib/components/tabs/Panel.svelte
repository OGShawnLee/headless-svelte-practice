<script lang="ts">
	import { getContext } from 'svelte';
	import { isTabsContext, TABS_CONTEXT_KEY } from './Group.svelte';

	let className = '';
	export { className as class };

	const TabsContext = getContext(TABS_CONTEXT_KEY);
	if (!isTabsContext(TabsContext)) throw Error('Invalid Tabs Context');

	const { Index, usePanel } = TabsContext;
	const { register, panel } = usePanel;

	let index = register();
</script>

{#if $Index === index}
	<div class={className} use:panel={index}>
		<slot />
	</div>
{/if}
