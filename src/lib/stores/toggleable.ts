import type { Notifier, Toggleable } from '$lib/types';
import { notifiable } from '$lib/stores';
import { isHTMLElement } from '$lib/utils/predicate';
import { isFocusable } from '$lib/utils/focus-management';
import { isWithin } from '$lib/utils/dom-management';
import { writable } from 'svelte/store';
import { tick } from 'svelte';

export function toggleable(
	isOpen: boolean,
	notifier: Notifier<boolean>,
	hasFocusWithin = false
): Toggleable {
	const Open = notifiable(isOpen, notifier);

	let button: HTMLElement | undefined;
	let panel: HTMLElement | undefined;

	const Button = writable<HTMLElement | undefined>();
	const Panel = writable<HTMLElement | undefined>();

	let handleBeforeClose: Function | undefined;

	const Methods = {
		open() {
			Open.set(true);
		},
		toggle(event: Event) {
			Open.update((isOpen) => {
				if (isOpen && handleBeforeClose) handleBeforeClose();
				if (!isOpen && hasFocusWithin) event.preventDefault();

				return !isOpen;
			});
		},
		async close(ref?: HTMLElement | Event) {
			if (!button) throw new Error('Button Not Defined');
			if (handleBeforeClose) handleBeforeClose();

			await tick();
			Open.set(false);

			if (!ref) return button.focus();

			if (ref instanceof HTMLElement) {
				if (isWithin(panel, ref)) button.focus();
				else ref.focus();
			}

			if (ref instanceof Event) {
				const { target } = ref;
				if (!isHTMLElement(target) || isWithin(panel, target)) return button.focus();

				if (isFocusable(target)) target.focus();
				else ref.preventDefault(), button.focus();
			}
		},
	};

	function onClickOutside(event: MouseEvent) {
		const { target } = event;
		if (!isHTMLElement(target)) return;

		if (target === button) return;
		if (!isWithin(panel, target)) Methods.close(event);
	}

	function onEscapeKey(event: KeyboardEvent) {
		if (event.code === 'Escape') Methods.close(event);
	}

	function onFocusLeave(event: FocusEvent) {
		const { target } = event;
		if (target === document.body || target === button) return;
		if (isHTMLElement(target) && !isWithin(panel, target)) Methods.close(event);
	}

	return {
		Button,
		Panel,
		Methods,
		...Methods,
		set: Open.set,
		subscribe: Open.subscribe,
		defineButton(node, id) {
			if (id) node.id = id;
			Button.set((button = node));
		},
		useButton(node, { useDefaultKeys, keysReducer } = {}) {
			Button.set((button = node));
			const isButton = node.tagName === 'BUTTON';

			function handleKeys(event: KeyboardEvent) {
				const { code } = event;
				if (keysReducer) return keysReducer(event, Methods);
				if ((code === 'Enter' || code === 'Space') && useDefaultKeys) {
					event.preventDefault(), Methods.toggle(event);
				}
			}

			node.tabIndex = 0;
			node.setAttribute('role', 'button');
			if (isButton) node.setAttribute('type', 'button');
			node.addEventListener('mousedown', Methods.toggle);
			node.addEventListener('keydown', handleKeys);
			return function () {
				node.removeEventListener('mousedown', Methods.toggle);
				node.removeEventListener('keydown', handleKeys);
			};
		},
		definePanel(node, id) {
			if (id) node.id = id;

			Panel.set((panel = node));
		},
		usePanel(node, { beforeClose, listeners } = {}) {
			Panel.set((panel = node));
			handleBeforeClose = beforeClose;

			const uniqueListeners = new Set(listeners);
			uniqueListeners.forEach((listener) => {
				switch (listener) {
					case 'FOCUS_LEAVE':
						return window.addEventListener('focusin', onFocusLeave);
					case 'CLICK_OUTSIDE':
						return window.addEventListener('mousedown', onClickOutside);
					case 'ESCAPE_KEY':
						return window.addEventListener('keydown', onEscapeKey);
				}
			});
			return function () {
				Panel.set(undefined);
				window.removeEventListener('focusin', onFocusLeave);
				window.removeEventListener('mousedown', onClickOutside);
				window.removeEventListener('keydown', onEscapeKey);
			};
		},
		unregisterPanel() {
			Panel.set(undefined);
		},
	};
}
