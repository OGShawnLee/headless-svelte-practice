import { isHTMLElement } from './predicate';

class DOMController {
	protected hideScrollbar() {
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return function () {
			document.body.style.overflow = originalOverflow;
		};
	}
}

export class FocusManager extends DOMController {
	node: HTMLElement;
	internalElements: Set<HTMLElement>;
	externalElements: Set<HTMLElement>;

	constructor(node: HTMLElement) {
		super();
		this.node = node;
		this.internalElements = new Set();
		this.externalElements = new Set();

		for (let index = 0; index < FOCUSABLE_ELEMENTS.length; index++) {
			const selector = FOCUSABLE_ELEMENTS[index];
			const selectedElements = document.querySelectorAll(selector);

			for (let counter = 0; counter < selectedElements.length; counter++) {
				const element = selectedElements[counter];

				if (!isHTMLElement(element)) continue;
				if (node.contains(element)) this.internalElements.add(element);
				else this.externalElements.add(element);
			}
		}
	}

	private createFocusOnBrowserHandler(internalElements: HTMLElement[]) {
		return function (event: KeyboardEvent) {
			const { key, shiftKey } = event;
			const firstElement = internalElements.find((element) => element.tabIndex >= 0);
			const lastElement = internalElements.at(-1);

			const currentTarget = event.currentTarget;
			const activeElement = document.activeElement;

			if (activeElement === currentTarget) {
				if (key === 'Tab') {
					if (shiftKey) activeElement === firstElement && lastElement?.focus();
					else activeElement === lastElement && firstElement?.focus();
					event.preventDefault();
				}
			}
		};
	}

	static getInternalElements(node: HTMLElement, arr: HTMLElement[]) {
		if (!node.hasChildNodes()) return arr.push(node), void 0;
		Array.from(node.children).forEach((child) => {
			if (isHTMLElement(child)) {
				arr.push(child), this.getInternalElements(child, arr);
			}
		});
	}

	static focusFirstElement(node: HTMLElement) {
		const internalElements: HTMLElement[] = [];
		this.getInternalElements(node, internalElements);

		const firstElement = internalElements.find((element) => element.tabIndex >= 0);
		return firstElement?.focus(), Boolean(firstElement);
	}

	public trapFocus() {
		const ORIGINAL_INDEXES: number[] = [];
		this.externalElements.forEach((element) => {
			ORIGINAL_INDEXES.push(element.tabIndex);
			element.tabIndex = -1;
		});

		const arrElements = Array.from(this.internalElements.values());
		const preventFocusOnBrowser = this.createFocusOnBrowserHandler(arrElements);
		this.node.addEventListener('keydown', preventFocusOnBrowser);

		return () => {
			Array.from(this.externalElements).forEach((element, index) => {
				const tabIndex = ORIGINAL_INDEXES[index];
				element.tabIndex = tabIndex;
			});

			this.node.removeEventListener('keydown', preventFocusOnBrowser);
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
