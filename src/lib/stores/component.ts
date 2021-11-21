import type { Component } from '$lib/types';
import { writable } from 'svelte/store';

export function component(): Component {
	const Exists = writable(false);
	let component_id: string | undefined;
	return {
		subscribe(callback) {
			return Exists.subscribe((exists) => {
				if (component_id) callback(exists, component_id);
			});
		},
		appear(node, id) {
			(node.id = id), (component_id = id);
			Exists.set(true);
		},
		disappear() {
			Exists.set(false);
		},
	};
}
