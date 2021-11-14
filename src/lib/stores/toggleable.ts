import type { Notifier, Toggleable } from '$lib/types';
import { FocusManager } from '$lib/utils/';
import { notifiable } from '$lib/stores';
import { isHTMLElement } from '$lib/utils/predicate';
import { useListeners } from '$lib/utils/definedListeners';

export function toggleable(isOpen: boolean, notifier: Notifier<boolean>): Toggleable {
	const Open = notifiable(isOpen, notifier);
	let button: HTMLElement;

	const open = () => Open.set(true);
	const toggle = () => Open.update((val) => !val);

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

			let handleOpenKeys: ((e: KeyboardEvent) => void) | undefined;
			if (openKeys.length) {
				handleOpenKeys = createOpenKeysHandler(openKeys);
				node.addEventListener('keydown', handleOpenKeys);
			}

			node.addEventListener('click', toggle);
			return function () {
				node.removeEventListener('click', toggle);
				if (handleOpenKeys) node.removeEventListener('keydown', handleOpenKeys);
			};
		},
		usePanel: ({ panelElement, beforeClose, listenersBuilders }) => {
			const close = internalClose(beforeClose);
			return useListeners(window)(close, panelElement)(...listenersBuilders);
		},
	};
}
