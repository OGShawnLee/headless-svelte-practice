import type { Component } from '$lib/types';
import { writable } from 'svelte/store';

export function component<E extends Element = HTMLElement>(): Component<E> {
	const { subscribe, set } = writable<E | undefined>();
	let element: E | undefined;
	let elementId: string | undefined;
	return {
		node: element,
		subscribe(callback) {
			return subscribe((node) => callback(node, elementId));
		},
		exists() {
			return [Boolean(element), element] as [exists: boolean, element: E | undefined];
		},
		appear(node, id) {
			node.id = elementId = id;
			set((this.node = element = node));
		},
		disappear() {
			set((this.node = element = undefined));
		},
	};
}
