<script lang="ts">
	import { getContext } from 'svelte';
	import { DISCLOSURE_CONTEXT_KEY, isDisclosureContext } from './Disclosure.svelte';

	let className = '';
	export { className as class };

	const DisclosureContext = getContext(DISCLOSURE_CONTEXT_KEY);
	if (!isDisclosureContext(DisclosureContext))
		throw new Error('Invalid Disclosure Context');

	const { button } = DisclosureContext;
</script>

<button use:button type="button" class={className}>
	<slot />
</button>
