import { writable } from 'svelte/store';

export function unstoppable(value: string) {
	const { set, ...rest } = writable(value);
	let current = 0;
	return {
		...rest,
		set: (val: string) => {
			set((value = val + current++));
		},
		resolve: () => value.replace(/[0-9]/g, ''),
	};
}
