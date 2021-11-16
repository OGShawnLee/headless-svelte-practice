<script context="module" lang="ts">
	import type { Toggleable } from '$lib/types';
	import type { Readable } from 'svelte/store';
	import { propsIn } from '$lib/utils/predicate';

	export const DIALOG_CONTEXT_KEY = 'svelte-headless-dialog';

	interface DialogContext {
		Open: Readable<boolean>;
		overlay: (node: HTMLElement, tailwind?: boolean) => void;
		modal: (node: HTMLElement) => void;
		title: (node: HTMLElement) => void;
		description: (node: HTMLElement) => void;
	}

	export const isDialogContext = (val: unknown): val is DialogContext =>
		propsIn(val, 'Open', 'overlay', 'modal', 'title', 'description');

	interface DialogSettings {
		Toggleable: Toggleable;
		id: number;
	}
</script>
