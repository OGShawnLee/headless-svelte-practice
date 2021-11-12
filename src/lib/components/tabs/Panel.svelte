<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte';
	import { isTabsContext, TABS_CONTEXT_KEY } from './Group.svelte';

	const TabsContext = getContext(TABS_CONTEXT_KEY);
	if (!isTabsContext(TabsContext)) throw Error('Invalid Tabs Context');

	const { Index, panel } = TabsContext;

	let registeredIndex: number = 0;
	onMount(() => {
		registeredIndex = panel.register();
	});

	onDestroy(() => {
		panel.unregister(registeredIndex);
	});
</script>

{#if $Index === registeredIndex}
	<slot>{registeredIndex}</slot>
{/if}
