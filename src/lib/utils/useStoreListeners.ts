import type { Unsubscriber } from 'svelte/store';

export function useStoreListeners(...listeners: Unsubscriber[]) {
	return () => listeners.forEach((stopListener) => stopListener());
}
