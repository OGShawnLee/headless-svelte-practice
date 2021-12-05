import type { Unsubscriber } from 'svelte/store';

export function useSubscribers(
	...Unsubscribers: (Unsubscriber | undefined)[]
): Unsubscriber {
	return function () {
		Unsubscribers.forEach((Unsubscribe) => Unsubscribe?.());
	};
}
