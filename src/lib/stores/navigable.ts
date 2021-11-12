import type { Readable } from 'svelte/store';
import type { Notifiable } from '$lib/types';

interface NavigableSettings {
	Items: Readable<HTMLElement[]>;
	Index?: Notifiable<number>;
	Manual?: Readable<boolean> | boolean;
	Vertical?: Readable<boolean> | boolean;
	Wait?: Readable<boolean> | boolean;
	VerticalWait?: Readable<boolean> | boolean;
	onChange?: (index: number) => void;
}
