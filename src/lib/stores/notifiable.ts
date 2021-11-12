import type { Notifier } from '$lib/types';
import { writable } from 'svelte/store';

export function notifiable<T>(val: T, notifier: Notifier<T>) {
	const Stored = writable(val);
	return {
		subscribe: Stored.subscribe,
		set: (val: T) => Stored.set(notifier(val)),
		update: (callback: Notifier<T>) => Stored.update((val) => notifier(callback(val))),
		notify: notifier,
	};
}
