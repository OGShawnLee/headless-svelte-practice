<script lang="ts">
	import { getContext } from 'svelte';
	import { isMenuContext, MENU_CONTEXT_KEY } from './Menu.svelte';

	let className = '';
	export { className as class };

	const MenuContext = getContext(MENU_CONTEXT_KEY);
	if (!isMenuContext(MenuContext)) throw Error('Invalid Menu Context');

	const { Open, menu } = MenuContext;
</script>

{#if $Open}
	<div class={className} use:menu>
		<slot />
	</div>
{/if}
