<script lang="ts">
	import { getContext, onDestroy } from 'svelte';
	import { isTabsContext, TABS_CONTEXT_KEY } from './Group.svelte';

	let className = '';
	export { className as class };

	const TabsContext = getContext(TABS_CONTEXT_KEY);
	if (!isTabsContext(TabsContext)) throw Error('Invalid Tabs Context');

	const { Index, usePanel } = TabsContext;
	const { register, panel, unregister } = usePanel;

	let index = register();
	onDestroy(() => unregister(index));
</script>

{#if $Index === index}
	<div class={className} use:panel={index}>
		<slot />
	</div>
{/if}
