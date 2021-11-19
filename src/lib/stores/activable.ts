import type { Notifier } from '$lib/types';
import { notifiable } from '$lib/stores';

export function activable(isActive: boolean, notifier: Notifier<boolean>) {
	const Active = notifiable(isActive, notifier);
	return {
		subscribe: Active.subscribe,
		set: Active.set,
		toggle: () => {
			Active.update((val) => !val);
		},
	};
}
