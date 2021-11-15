import type { Notifier, Toggleable } from '$lib/types';
import { FocusManager } from '$lib/utils/';
import { notifiable } from '$lib/stores';
import { isHTMLElement } from '$lib/utils/predicate';
import { useListeners } from '$lib/utils/definedListeners';

export function toggleable(isOpen: boolean, notifier: Notifier<boolean>): Toggleable {
	const Open = notifiable(isOpen, notifier);
	let button: HTMLElement, panel: HTMLElement;
	let buttonName: string;
	let panelName: string;
	let toggleableHasPopup: boolean;

	function open() {
		Open.set(true);
	}

	function toggle() {
		Open.update((isNotOpen) => {
			return !isNotOpen;
		});
	}

	function internalClose(beforeClose?: (event?: Event) => void) {
		return function (event: Event) {
			if (event instanceof MouseEvent && event.target === button) return;
			if (beforeClose) beforeClose(event);
			close(event);
		};
	}

	function close(ref?: HTMLElement | Event) {
		function handleClose(target: HTMLElement) {
			Open.set(false), target.focus({ preventScroll: true });
		}

		if (!ref) handleClose(button);
		else if (isHTMLElement(ref)) handleClose(ref);
		else {
			const target = ref.target;
			if (ref instanceof KeyboardEvent && ref.key === 'Escape')
				return handleClose(button);

			if (isHTMLElement(target) && FocusManager.isFocusable(target))
				return handleClose(target);

			handleClose(button);
		}
	}

	function createOpenKeysHandler(keys: string[]) {
		return function (event: KeyboardEvent) {
			if (keys.includes(event.key)) open();
		};
	}

	return {
		subscribe: Open.subscribe,
		toggle,
		open,
		close,
		useButton: (node, ...openKeys) => {
			button = node;

			button.id = buttonName;
			if (button.tagName !== 'BUTTON') button.setAttribute('role', 'button');
			if (toggleableHasPopup) button.ariaHasPopup = 'true';
			const StopOpen = Open.subscribe((isOpen) => {
				button.ariaExpanded = String(isOpen);
				if (isOpen) button.setAttribute('aria-controls', panelName);
				else button.removeAttribute('aria-controls');
			});

			let handleOpenKeys: ((e: KeyboardEvent) => void) | undefined;
			if (openKeys.length) {
				handleOpenKeys = createOpenKeysHandler(openKeys);
				node.addEventListener('keydown', handleOpenKeys);
			}

			node.addEventListener('click', toggle);
			return function () {
				StopOpen();
				node.removeEventListener('click', toggle);
				if (handleOpenKeys) node.removeEventListener('keydown', handleOpenKeys);
			};
		},
		usePanel: ({ panelElement, beforeClose, listenersBuilders = [] }) => {
			panel = panelElement;
			panelElement.id = panelName;

			const close = internalClose(beforeClose);
			return useListeners(window)(close, panelElement)(...listenersBuilders);
		},
		configureAria: ({ id, name, hasPopup }) => {
			buttonName = `${name}-button-${id}`;
			panelName = `${name}-panel-${id}`;
			toggleableHasPopup = hasPopup;
		},
	};
}
