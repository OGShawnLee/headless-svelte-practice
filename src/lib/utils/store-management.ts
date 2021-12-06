import type { Readable, Writable, Unsubscriber } from 'svelte/store';
import { derived, readable } from 'svelte/store';
import { isStore } from './predicate';

export function useSubscribers(
	...Unsubscribers: (Unsubscriber | undefined)[]
): Unsubscriber {
	return function () {
		Unsubscribers.forEach((Unsubscribe) => Unsubscribe?.());
	};
}

export function toStore<T>(
	Store: Readable<T> | undefined | T,
	defaultValue: T,
	type: (value: T) => Readable<T> | Writable<T> = readable
) {
	return isStore(Store) ? Store : Store ? type(Store) : type(defaultValue);
}

export function useValidator<T>(
	Main: Readable<T>,
	Validator: Readable<boolean>,
	useNegative = false
) {
	const MainLoop = derived(
		[Main, Validator],
		([$Main, $Validator]) => [$Main, $Validator] as [main: T, validator: boolean]
	);
	return function (callback: (main: T) => void) {
		return MainLoop.subscribe(([main, validator]) => {
			if (useNegative) !validator && callback(main);
			else validator && callback(main);
		});
	};
}
