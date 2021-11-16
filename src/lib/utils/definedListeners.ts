import { isHTMLElement } from './predicate';
import type { DefinedListenerBuilder, EventListenerRemover } from '$lib/types';

export function defineListener<E extends Event>(
	type: string,
	func: (callback: (event: E) => void, node: HTMLElement) => (e: E) => void,
	bubble = false
) {
	return function (callback: (e: E) => void, node: HTMLElement) {
		return {
			type,
			func: func(callback, node),
			bubble,
		};
	};
}

export function useListeners(target: HTMLElement | Window | Document) {
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

export const clickOn = defineListener<MouseEvent>('click', (callback, node) => {
	return function (event) {
		if (!isHTMLElement(event.target)) return;
		if (event.target === node) callback(event);
	};
});

export const escapeKey = defineListener<KeyboardEvent>('keydown', (callback) => {
	return function (event) {
		if (event.key === 'Escape') callback(event);
	};
});

export const clickOutside = defineListener<MouseEvent>('click', (callback, node) => {
	return function (event) {
		if (!isHTMLElement(event.target)) return;
		if (!node.contains(event.target)) callback(event);
	};
});

export const focusLeave = defineListener<FocusEvent>(
	'focusin',
	(callback, node) => {
		return function (event) {
			if (!isHTMLElement(event.target)) return;
			if (event.target === document.body) return;
			if (!node.contains(event.target)) callback(event);
		};
	},
	true
);
