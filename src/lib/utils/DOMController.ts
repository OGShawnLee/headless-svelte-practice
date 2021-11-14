export class DOMController {
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
