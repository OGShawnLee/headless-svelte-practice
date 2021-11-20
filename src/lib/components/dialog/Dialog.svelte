<script context="module" lang="ts">
	import type { Toggleable } from '$lib/types';
	import type { Readable } from 'svelte/store';
	import { derived } from 'svelte/store';
	import { toggleable } from '$lib/stores';
	import { propsIn } from '$lib/utils/predicate';
	import { clickOutside, escapeKey } from '$lib/utils/definedListeners';
	import Portal, { portal } from 'svelte-portal/src/Portal.svelte';
	import { isHTMLElement } from '$lib/utils/predicate';
	import { DOMController, FocusManager, use_id, useNamer } from '$lib/utils';

	export const DIALOG_CONTEXT_KEY = 'svelte-headless-dialog';
	const generate_id = use_id();

	function initDialog({ Toggleable }: DialogSettings) {
		const { defineElements, usePanel } = Toggleable;
		const id = generate_id.next().value as number;
		const [nameSubcomponent, modal_id] = useNamer('dialog', id);

		const title_id = nameSubcomponent('title');
		const description_id = nameSubcomponent('description');
		const overlay_id = nameSubcomponent('overlay');
		return {
			overlay: (node: HTMLElement) => {
				const closeInside = (event: MouseEvent) =>
					event.target === node ? Toggleable.set(false) : void 0;

				node.id = overlay_id;
				node.addEventListener('click', closeInside);
				return {
					destroy: () => {
						node.removeEventListener('click', closeInside);
					},
				};
			},
			modal: (node: HTMLElement) => {
				const togglerButton = document.activeElement;
				if (!isHTMLElement(togglerButton)) throw Error('Invalid Modal Toggler');
				defineElements({ button: togglerButton });

				portal(node, `#${overlay_id}`);
				setTimeout(() => {
					// for some reason modal id is undefined after using portal
					node.id = modal_id;
				}, 150);

				node.ariaModal = 'true';
				node.setAttribute('role', 'dialog');
				node.setAttribute('aria-labelledby', title_id);
				node.setAttribute('aria-describedby', description_id);

				const modalFocus = new FocusManager(node);
				const restoreFocus = modalFocus.trapFocus(togglerButton);
				FocusManager.focusFirstElement(node);
				const showScrollbar = DOMController.hideScrollbar();

				const disposeModal = usePanel({
					panelElement: node,
					beforeClose: restoreFocus,
					listenersBuilders: [escapeKey, clickOutside],
				});
				return {
					destroy: () => {
						disposeModal(), restoreFocus(), showScrollbar();
					},
				};
			},
			title: (node: HTMLElement) => {
				node.id = title_id;
			},
			description: (node: HTMLElement) => {
				node.id = description_id;
			},
		};
	}

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
	}
</script>

<script lang="ts">
	import { setContext } from 'svelte';

	export let open = false;
	export let initialFocus: HTMLElement | undefined = undefined;

	const Toggleable = toggleable(open, (bool) => (open = bool));
	const Open = derived(Toggleable, ($Open) => $Open);

	$: Toggleable.set(open);
	$: initialFocus?.focus();

	const DialogState = initDialog({ Toggleable });
	const { overlay, modal, title, description } = DialogState;
	setContext(DIALOG_CONTEXT_KEY, { Open, ...DialogState });
</script>

<Portal>
	{#if open}
		<slot {open} {overlay} {modal} {title} {description} close={Toggleable.close} />
		<slot name="modal" />
	{/if}
</Portal>
