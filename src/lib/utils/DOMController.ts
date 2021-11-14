import type { DefinedListenerBuilder, EventListenerRemover } from '$lib/types';
import { isHTMLElement } from './predicate';

export class DOMController {
	readonly node: HTMLElement;
	readonly InternalElements: Set<HTMLElement>;
	readonly ExternalElements: Set<HTMLElement>;

	constructor(node: HTMLElement) {
		this.node = node;
		this.InternalElements = new Set();
		this.ExternalElements = new Set();

		for (let index = 0; index < FOCUSABLE_ELEMENTS.length; index++) {
			const selector = FOCUSABLE_ELEMENTS[index];
			const selectedElements = document.querySelectorAll(selector);

			for (let counter = 0; counter < selectedElements.length; counter++) {
				const element = selectedElements[counter];

				if (!isHTMLElement(element)) continue;
				if (node.contains(element)) this.InternalElements.add(element);
				else this.ExternalElements.add(element);
			}
		}
	}

	static useListeners(target: HTMLElement | Window | Document) {
		return function (callback: <E extends Event>(event: E) => void, node: HTMLElement) {
			return function (...listenerBuilders: DefinedListenerBuilder[]) {
				const builtListeners = listenerBuilders.map((listener) => {
					return listener(callback, node);
				});

				builtListeners.forEach(({ type, func, bubble = false }) => {
					target.addEventListener(type, func, bubble);
				});

				return function () {
					builtListeners.forEach(({ type, func, bubble = false }) => {
						target.removeEventListener(type, func, bubble);
					});
				} as EventListenerRemover;
			};
		};
	}

	static makeFocusable(node: HTMLElement, tabIndex = 0) {
		return (node.tabIndex = tabIndex), node;
	}

	static removeFocusable(node: HTMLElement) {
		const originalTabIndex = node.tabIndex;
		node.tabIndex = -1;
		return () => this.makeFocusable(node, originalTabIndex);
	}

	static isFocusable(node: HTMLElement) {
		return node.tabIndex >= 0;
	}
}

// https://github.com/Duder-onomy/svelte-focus-trap/blob/master/src/utils.js
const FOCUSABLE_ELEMENTS = [
	'a[href]',
	'area[href]',
	'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
	'select:not([disabled]):not([aria-hidden])',
	'textarea:not([disabled]):not([aria-hidden])',
	'button:not([disabled]):not([aria-hidden])',
	'iframe',
	'object',
	'embed',
	'[contenteditable]',
	'[tabindex]:not([tabindex^="-"])',
];
