<script context="module" lang="ts">
	import type { Toggleable } from '$lib/types';
	import type { Readable, Unsubscriber } from 'svelte/store';
	import Portal, { portal } from 'svelte-portal/src/Portal.svelte';
	import { clickOutside, escapeKey } from '$lib/utils/definedListeners';
	import { useNamer, useSubscribers, use_id } from '$lib/utils';
	import { focusFirstElement, useFocusTrap } from '$lib/utils/focus';
	import { hideScrollbar } from '$lib/utils/dom-management';
	import { isHTMLElement, propsIn } from '$lib/utils/predicate';
	import { component, toggleable } from '$lib/stores';

	export const DIALOG_CONTEXT_KEY = 'svelte-headless-dialog';
	const generate_id = use_id();

	function initDialog({ Toggleable, InitialFocus }: DialogSettings) {
		const { defineElements, usePanel } = Toggleable;
		const id = generate_id.next().value as number;
		const [baptize, modalName] = useNamer('dialog', id);

		const Title = component();
		const Description = component();

		let usingOverlay = false;
		const overlayName = baptize('overlay');
		const titleName = baptize('title');
		const descriptionName = baptize('description');
		return {
			overlay: (node: HTMLElement) => {
				usingOverlay = true;
				const closeInside = (event: MouseEvent) =>
					event.target === node ? Toggleable.set(false) : void 0;

				node.id = overlayName;
				node.addEventListener('click', closeInside);
				return {
					destroy: () => {
						node.removeEventListener('click', closeInside);
					},
				};
			},
			modal: (node: HTMLElement) => {
				const togglerButton = document.activeElement;
				if (isHTMLElement(togglerButton)) defineElements({ button: togglerButton });

				let destroyPortal = usingOverlay
					? portal(node, `#${overlayName}`).destroy
					: undefined;

				const restoreFocus = useFocusTrap(node, togglerButton);
				const showScrollbar = hideScrollbar();

				const disposePanel = usePanel({
					panelElement: node,
					beforeClose: restoreFocus,
					listenersBuilders: [clickOutside, escapeKey],
				});

				let stopSubscribers: Unsubscriber;
				tick().then(() => {
					focusFirstElement(node);
					stopSubscribers = useSubscribers(
						InitialFocus.subscribe((element) => element?.focus()),
						Title.subscribe((exists, id) => {
							if (exists) node.setAttribute('aria-labelledby', id);
							else node.removeAttribute('aria-labelledby');
						}),
						Description.subscribe((exists, id) => {
							if (exists) node.setAttribute('aria-describedby', id);
							else node.removeAttribute('aria-describedby');
						})
					);
				});

				node.id = modalName;
				node.ariaModal = String(true);
				node.setAttribute('role', 'dialog');
				return {
					destroy: () => {
						if (destroyPortal) destroyPortal();
						if (stopSubscribers) stopSubscribers();
						disposePanel(), showScrollbar(), restoreFocus();
					},
				};
			},
			title: (node: HTMLElement) => {
				Title.appear(node, titleName);
				return {
					destroy: () => {
						Title.disappear();
					},
				};
			},
			description: (node: HTMLElement) => {
				Description.appear(node, descriptionName);
				return {
					destroy: () => {
						Description.disappear();
					},
				};
			},
		};
	}

	export const isDialogContext = (val: unknown): val is DialogContext =>
		propsIn(val, 'overlay', 'modal', 'title', 'description');

	interface DialogContext {
		overlay: (node: HTMLElement) => void;
		modal: (node: HTMLElement) => void;
		title: (node: HTMLElement) => void;
		description: (node: HTMLElement) => void;
	}

	interface DialogSettings {
		Toggleable: Toggleable;
		InitialFocus: Readable<HTMLElement | undefined>;
	}
</script>

<script lang="ts">
	import { writable } from 'svelte/store';
	import { setContext, tick } from 'svelte';

	export let open = false;
	export let initialFocus: HTMLElement | undefined = undefined;

	const Toggleable = toggleable(open, (bool) => (open = bool));
	const InitialFocus = writable<HTMLElement | undefined>(initialFocus);
	$: InitialFocus.set(initialFocus);

	const DialogState = initDialog({ Toggleable, InitialFocus });
	const { modal, overlay, title, description } = DialogState;

	setContext(DIALOG_CONTEXT_KEY, DialogState);
</script>

{#if open}
	<Portal>
		<slot {modal} {overlay} {title} {description} close={Toggleable.close} />
	</Portal>
{/if}
