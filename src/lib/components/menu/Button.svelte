<script lang="ts">
	import { getContext } from 'svelte';
	import { isMenuContext, MENU_CONTEXT_KEY } from './Menu.svelte';

	let className = '';
	export { className as class };

	const MenuContext = getContext(MENU_CONTEXT_KEY);
	if (!isMenuContext(MenuContext)) throw Error('Invalid Menu Context');

	const { button } = MenuContext;
</script>

<button class={className} use:button>
	<slot />
</button>
