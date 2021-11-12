import type { Readable } from 'svelte/store';
import type { Navigable, Notifiable } from '$lib/types';
import { derived, get, readable, writable } from 'svelte/store';
import { isBoolean } from '$lib/utils/predicate';

export function navigable({ Items, ...Optional }: NavigableSettings): Navigable {
	let {
		Index = writable(0),
		Manual = readable(false),
		Vertical = readable(false),
		Wait = readable(false),
		VerticalWait = readable(false),
		onChange = () => void 0,
	} = Optional;

	if (isBoolean(Manual)) Manual = readable(Manual);
	if (isBoolean(Vertical)) Vertical = readable(Vertical);
	if (isBoolean(Wait)) Wait = readable(Wait);
	if (isBoolean(VerticalWait)) VerticalWait = readable(VerticalWait);

	const ManualIndex = writable(get(Index));
	const Waiting = writable(get(Wait));
	const VerticalWaiting = writable(get(VerticalWait));
	const Selected = derived([Items, Index, Waiting], ([$Items, $Index, $Waiting]) => {
		return $Waiting ? undefined : $Items[$Index];
	});
	const Active = derived([Items, ManualIndex], ([$Items, $ManualIndex]) => {
		return $Items[$ManualIndex];
	});

	function isOverflowed(
		index: number,
		direction: 'ASCENDING' | 'DESCENDING',
		length: number
	) {
		if (direction === 'ASCENDING') return index + 1 === length;
		if (direction === 'DESCENDING') return index - 1 === -1;
	}
}

interface NavigableSettings {
	Items: Readable<HTMLElement[]>;
	Index?: Notifiable<number>;
	Manual?: Readable<boolean> | boolean;
	Vertical?: Readable<boolean> | boolean;
	Wait?: Readable<boolean> | boolean;
	VerticalWait?: Readable<boolean> | boolean;
	onChange?: (index: number) => void;
}
