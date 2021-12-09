<script lang="ts">
	import { getContext } from 'svelte';
	import { isMenuContext, MENU_CONTEXT_KEY } from './Menu.svelte';

	let className = '';
	export { className as class };
	export let activeClass = '';

	$: finalClass = `${className} ${selected ? activeClass : ''}`;

	const MenuContext = getContext(MENU_CONTEXT_KEY);
	if (!isMenuContext(MenuContext)) throw Error('Invalid Menu Context');

	let [selected, notifySelected] = [false, (bool: boolean) => (selected = bool)];

	const { item } = MenuContext;
</script>

<button class={finalClass} use:item={notifySelected} on:click>
	<slot {selected} />
</button>
