<script context="module" lang="ts">
	import type { Toggleable } from '$lib/types';
	import type { Readable } from 'svelte/store';
	import { derived } from 'svelte/store';
	import { registrable, toggleable } from '$lib/stores';
	import { propsIn } from '$lib/utils/predicate';
	import { clickOn, clickOutside, escapeKey } from '$lib/utils/definedListeners';
	import Portal, { portal } from 'svelte-portal/src/Portal.svelte';
	import { isHTMLElement } from '$lib/utils/predicate';
	import { DOMController, FocusManager } from '$lib/utils';

	const DIALOGS = registrable<number>([]);
	export const DIALOG_CONTEXT_KEY = 'svelte-headless-dialog';

	function createNamer(name: string, id: number) {
		return function (subComponent: string) {
			return `svelte-headless-${name}-${subComponent}-${id}`;
		};
	}

	function initDialog({ Toggleable, id }: DialogSettings) {
		const { defineElements, usePanel } = Toggleable;
		const nameSubcomponent = createNamer('dialog', id);
		const modalID = nameSubcomponent('modal');
		const titleID = nameSubcomponent('title');
		const descriptionID = nameSubcomponent('description');
		const overlayID = nameSubcomponent('overlay');

		return {
			overlay: (node: HTMLElement, tailwind?: boolean) => {
				node.id = overlayID;

				const { func: closeInside } = clickOn(() => {
					Toggleable.set(false);
				}, node);

				if (tailwind) node.classList.add('fixed', 'inset-0');
				else {
					node.style.position = 'fixed';
					node.style.inset = '0 0 0 0';
				}

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

				portal(node, `#${overlayID}`);
				setTimeout(() => {
					// for some reason modal id is undefined after using portal
					node.id = modalID;
				}, 150);

				node.ariaModal = 'true';
				node.setAttribute('role', 'dialog');
				node.setAttribute('aria-labelledby', titleID);
				node.setAttribute('aria-describedby', descriptionID);

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
				node.id = titleID;
			},
			description: (node: HTMLElement) => {
				node.id = descriptionID;
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
		id: number;
	}
</script>

<script lang="ts">
	import { onDestroy, setContext } from 'svelte';

	const id = DIALOGS.register();
	onDestroy(() => DIALOGS.unregister(id));

	export let open = false;
	const Toggleable = toggleable(open, (bool) => (open = bool));
	const Open = derived(Toggleable, ($Open) => $Open);

	$: Toggleable.set(open);

	const DialogState = initDialog({ Toggleable, id });
	const { overlay, modal, title, description } = DialogState;
	setContext(DIALOG_CONTEXT_KEY, { Open, ...DialogState });
</script>

<Portal>
	{#if open}
		<slot {open} {overlay} {modal} {title} {description} close={Toggleable.close} />
		<slot name="modal" />
	{/if}
</Portal>
