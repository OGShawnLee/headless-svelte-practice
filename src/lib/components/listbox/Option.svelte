<script lang="ts">
	import { getContext } from 'svelte';
	import { notifiable } from '$lib/stores';
	import { isListboxContext, LISTBOX_CONTEXT_KEY } from './Listbox.svelte';

	let className = '';
	export { className as class };
	export let value: any = '';
	export let selected = false;

	let checked = false;
	const Selected = notifiable(selected, (bool) => (checked = bool));

	const ListboxContext = getContext(LISTBOX_CONTEXT_KEY);
	if (!isListboxContext(ListboxContext)) throw new Error('Invalid Listbox Context');

	const { initOption, option } = ListboxContext;

	const SelectableOption = initOption({
		initialValue: value,
		initialIsSelected: selected,
		Selected,
	});

	$: SelectableOption.set(value);
	$: Selected.set(selected);
</script>

<button class={className} use:option={SelectableOption}>
	<slot {checked} />
</button>
