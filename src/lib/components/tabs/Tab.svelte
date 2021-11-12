<script context="module">
	export { default as TabGroup } from './Group.svelte';
	export { default as TabPanel } from './Panel.svelte';
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { isTabsContext, TABS_CONTEXT_KEY } from './Group.svelte';

	let [selected, notifySelected] = [false, (bool: boolean) => (selected = bool)];

	const TabsContext = getContext(TABS_CONTEXT_KEY);
	if (!isTabsContext(TabsContext)) throw Error('Invalid Tabs Context');

	const { tab } = TabsContext;
</script>

<button use:tab={notifySelected}>
	<slot {selected} />
</button>
