<script lang="ts">
	import { getContext } from 'svelte';
	import { isTabsContext, TABS_CONTEXT_KEY } from './Group.svelte';

	let className = '';
	export { className as class };
	export let activeClass = '';

	let [selected, notifySelected] = [false, (bool: boolean) => (selected = bool)];
	$: finalClass = `${className} ${selected ? activeClass : ''}`;

	const TabsContext = getContext(TABS_CONTEXT_KEY);
	if (!isTabsContext(TabsContext)) throw Error('Invalid Tabs Context');
	const { tab } = TabsContext;
</script>

<button class={finalClass} use:tab={notifySelected}>
	<slot {selected} />
</button>
