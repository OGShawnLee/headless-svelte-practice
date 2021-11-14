<script context="module" lang="ts">
	import type { Readable } from 'svelte/store';
	import type { SelectedStyles, Toggleable } from '$lib/types';
	import { propsIn } from '$lib/utils/predicate';

	export const isMenuContext = (val: unknown): val is MenuContext =>
		propsIn(val, 'Open', 'close', 'menu', 'item', 'button');

	interface MenuContext extends Pick<Toggleable, 'close'> {
		Open: Readable<boolean>;
		items: (node: HTMLElement, styles?: SelectedStyles) => void;
		item: (node: HTMLElement) => void;
		button: (node: HTMLElement) => void;
	}

	export const MENU_CONTEXT_KEY = 'svelte-headless-menu';
</script>
