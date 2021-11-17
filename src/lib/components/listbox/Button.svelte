<script>
	import { getContext } from 'svelte';
	import { isListboxContext, LISTBOX_CONTEXT_KEY } from './Listbox.svelte';

	const ListboxContext = getContext(LISTBOX_CONTEXT_KEY);
	if (!isListboxContext(ListboxContext)) throw Error('Invalid Listbox Context');

	let className = '';
	export { className as class };

	const { button } = ListboxContext;
</script>

<button class={className} use:button>
	<slot />
</button>
