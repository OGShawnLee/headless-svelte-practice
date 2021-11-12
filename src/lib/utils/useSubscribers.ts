import type { Unsubscriber } from 'svelte/store';

export function useSubscribers(...Unsubscribers: Unsubscriber[]): Unsubscriber {
	return function () {
		Unsubscribers.forEach((Unsubscribe) => Unsubscribe());
	};
}
