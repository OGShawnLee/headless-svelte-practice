import { isHTMLElement } from './predicate';

export function focusFirstElement(node: HTMLElement) {
	const internalElements = useDOMTraversal(node);

	const firstElement = internalElements.find((element) => element.tabIndex >= 0);
	return firstElement?.focus(), Boolean(firstElement);
}

export function isFocusable(node: HTMLElement) {
	return node.tabIndex >= 0;
}

export function makeFocusable(node: HTMLElement, tabIndex = 0) {
	return (node.tabIndex = tabIndex), node;
}

export function removeFocusable(node: HTMLElement) {
	const originalTabIndex = node.tabIndex;
	node.tabIndex = -1;
	return () => makeFocusable(node, originalTabIndex);
}

function useElements(node: HTMLElement) {
	const internalElements = new Set<HTMLElement>();
	const externalElements = new Set<HTMLElement>();

	for (let index = 0; index < FOCUSABLE_ELEMENTS.length; index++) {
		const selector = FOCUSABLE_ELEMENTS[index];
		const selectedElements = document.querySelectorAll(selector);

		for (let counter = 0; counter < selectedElements.length; counter++) {
			const element = selectedElements[counter];

			if (!isHTMLElement(element)) continue;
			if (node.contains(element)) internalElements.add(element);
			else externalElements.add(element);
		}
	}

	let arrInternal = Array.from(internalElements);
	let arrExternal = Array.from(externalElements);
	return [arrInternal, arrExternal] as [internal: HTMLElement[], external: HTMLElement[]];
}

function useDOMTraversal(node: HTMLElement) {
	const items: HTMLElement[] = [];

	function useTraversal(node: HTMLElement) {
		if (!node.hasChildNodes()) return items.push(node);
		const children = Array.from(node.children).filter(isHTMLElement);
		children.forEach((child) => (items.push(child), useTraversal(child)));
	}

	return useTraversal(node), items;
}

export function useFocusTrap(node: HTMLElement, fallback?: HTMLElement | Element | null) {
	const items = useDOMTraversal(node).filter(isFocusable);
	const numberOfElements = items.length;

	fallback = document.activeElement;

	function handleKeyboard(event: KeyboardEvent) {
		const { code, shiftKey } = event;
		if (code !== 'Tab') return;

		const activeElement = document.activeElement;
		const firstElement = items[0];
		const lastElement = items.at(-1);

		if (numberOfElements === 0) return handleFocus(event, fallback);
		if (numberOfElements === 1) return event.preventDefault();

		if (node === activeElement) return event.preventDefault();
		if (activeElement === firstElement) {
			if (shiftKey) handleFocus(event, lastElement);
		} else if (activeElement === lastElement) {
			if (!shiftKey) handleFocus(event, firstElement);
		}
	}

	function handleFocus(event: Event, target?: HTMLElement | Element | null) {
		event.preventDefault();
		if (isHTMLElement(target)) target.focus();
	}

	window.addEventListener('keydown', handleKeyboard);
	return function () {
		window.removeEventListener('keydown', handleKeyboard);
	};
}

export function preventTabbing(event: KeyboardEvent) {
	if (event.key === 'Tab') event.preventDefault();
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
