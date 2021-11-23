<script lang="ts">
	import { getContext } from 'svelte';
	import { isTabsContext, TABS_CONTEXT_KEY } from './Group.svelte';

	let className = '';
	export { className as class };

	const TabsContext = getContext(TABS_CONTEXT_KEY);
	if (!isTabsContext(TabsContext)) throw new Error('Invalid Tabs Context');

	const { tablist } = TabsContext;
</script>

<div class={className} use:tablist>
	<slot />
</div>
