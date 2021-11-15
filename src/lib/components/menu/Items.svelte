<script lang="ts">
	import { getContext } from 'svelte';
	import { isMenuContext, MENU_CONTEXT_KEY } from './Menu.svelte';

	let className = '';
	export { className as class };
	export let active = '';
	export let unactive = '';

	const MenuContext = getContext(MENU_CONTEXT_KEY);
	if (!isMenuContext(MenuContext)) throw Error('Invalid Menu Context');

	const { Open, menu } = MenuContext;
</script>

{#if $Open}
	<div class={className} use:menu={{ if: active, else: unactive }}>
		<slot />
	</div>
{/if}
