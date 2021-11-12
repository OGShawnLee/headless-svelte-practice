<script lang="ts">
	import { getContext } from 'svelte';
	import { isTabsContext, TABS_CONTEXT_KEY } from './Group.svelte';

	let className = '';

	export { className as class };
	export let active = '';
	export let unactive = '';

	const TabsContext = getContext(TABS_CONTEXT_KEY);
	if (!isTabsContext(TabsContext)) throw new Error('Invalid Tabs Context');

	const { tabs } = TabsContext;
</script>

<div class={className} use:tabs={{ if: active, else: unactive }}>
	<slot />
</div>
