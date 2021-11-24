import type { Notifier, Toggleable } from '$lib/types';
import { notifiable } from '$lib/stores';
import { isHTMLElement } from '$lib/utils/predicate';
import { useListeners } from '$lib/utils/definedListeners';
import { isFocusable } from '$lib/utils/focus-management';
import { derived, writable } from 'svelte/store';

export function toggleable(isOpen: boolean, notifier: Notifier<boolean>): Toggleable {
	const Open = notifiable(isOpen, notifier);
	let button: HTMLElement | undefined;
	let panel: HTMLElement | undefined;
	const Button = writable<HTMLElement | undefined>();
	const Panel = writable<HTMLElement | undefined>();

	let handleBeforeClose: Function | undefined;

	function open() {
		Open.set(true);
	}

	function toggle() {
		Open.update((value) => !value);
	}

	function handleTarget(target?: HTMLElement) {
		if (handleBeforeClose) handleBeforeClose();
		Open.set(false), target?.focus({ preventScroll: true });
	}

	function close(ref?: HTMLElement | Event) {
		if (!ref) return handleTarget(button);
		if (isHTMLElement(ref)) return handleTarget(ref);

		if (ref instanceof Event) {
			const target = ref.target;

			if (ref instanceof FocusEvent && target === button) return;
			if (ref instanceof MouseEvent && target === button) return;

			if (isHTMLElement(target)) {
				if (target !== button && isFocusable(target) && !panel?.contains(target))
					handleTarget(target);
				else handleTarget(button);
			} else handleTarget(button);
		}
	}

	return {
		open,
		close,
		toggle,
		subscribe: Open.subscribe,
		set: Open.set,
		Panel: derived(Panel, ($Panel) => $Panel),
		defineButton(node) {
			Button.set((button = node));
		},
		definePanel(node) {
			Panel.set((panel = node));
		},
		useButton(node: HTMLElement) {
			Button.set((button = node));
			const isButton = node.tagName === 'BUTTON';

			const handleKeys = ({ key, code }: KeyboardEvent) =>
				!isButton && (key === 'Enter' || code === 'Space') && toggle();

			node.tabIndex = 0;
			node.setAttribute('role', 'button');
			node.addEventListener('click', toggle);
			node.addEventListener('keydown', handleKeys);
			return function () {
				node.removeEventListener('click', toggle);
				node.removeEventListener('keydown', handleKeys);
			};
		},
		usePanel({ panelElement, beforeClose, listeners = [] }) {
			Panel.set((panel = panelElement));
			handleBeforeClose = beforeClose;

			const STOP_LISTENERS = useListeners(window)(close, panelElement)(...listeners);
			return function () {
				Panel.set(undefined), STOP_LISTENERS();
			};
		},
		unregisterPanel() {
			Panel.set((panel = undefined));
		},
	};
}
