import { isHTMLElement } from './predicate';

export function focusFirstElement(node: HTMLElement) {
	const internalElements: HTMLElement[] = [];
	useInternalElements(node, internalElements);

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

function useInternalElements(node: HTMLElement, arr: HTMLElement[]) {
	if (!node.hasChildNodes()) return arr.push(node), void 0;
	Array.from(node.children).forEach((child) => {
		if (isHTMLElement(child)) {
			arr.push(child), useInternalElements(child, arr);
		}
	});
}

function usePreventBrowserFocus(
	node: HTMLElement,
	internalElements: HTMLElement[],
	fallback?: HTMLElement | Element | null
) {
	const numberOfElements = internalElements.length;

	function handleFocus(event: KeyboardEvent, target?: HTMLElement | Element | null) {
		event.preventDefault();
		if (isHTMLElement(target)) target.focus();
	}

	return function (event: KeyboardEvent) {
		const { key, shiftKey } = event;
		const activeElement = document.activeElement;

		const firstElement = internalElements.find((element) => element.tabIndex >= 0);
		const lastElement = internalElements.at(-1);

		if (key === 'Tab') {
			if (numberOfElements === 0) return handleFocus(event, fallback);
			if (numberOfElements === 1) return handleFocus(event, firstElement);

			if (node === activeElement) return event.preventDefault();
			if (activeElement === firstElement) {
				if (shiftKey) handleFocus(event, lastElement);
			} else if (activeElement === lastElement) {
				if (!shiftKey) handleFocus(event, firstElement);
			}
		}
	};
}

export function useFocusTrap(node: HTMLElement, fallback?: HTMLElement | Element | null) {
	const [internal, external] = useElements(node);
	const ORIGINAL_INDEXES = external.map((element) => {
		const originalIndex = element.tabIndex;
		element.tabIndex = -1;
		return originalIndex;
	});

	const preventBrowserFocus = usePreventBrowserFocus(node, internal, fallback);
	window.addEventListener('keydown', preventBrowserFocus);
	return () => {
		window.removeEventListener('keydown', preventBrowserFocus);
		ORIGINAL_INDEXES.forEach((tabIndex, index) => {
			const element = external[index];
			element.tabIndex = tabIndex;
		});
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
