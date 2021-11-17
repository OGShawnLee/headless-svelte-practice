<script>
	import { getContext } from 'svelte';
	import { isListboxContext, LISTBOX_CONTEXT_KEY } from './Listbox.svelte';

	const ListboxContext = getContext(LISTBOX_CONTEXT_KEY);
	if (!isListboxContext(ListboxContext)) throw Error('Invalid Listbox Context');

	let className = '';
	export { className as class };

	const { Open, options } = ListboxContext;
</script>

{#if $Open}
	<div class={className} use:options>
		<slot />
	</div>
{/if}
