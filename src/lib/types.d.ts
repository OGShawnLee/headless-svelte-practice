import type { Writable, Readable, Unsubscriber } from 'svelte/store';

export interface Navigable {
	handlers: {
		handleSelection: (index: number) => () => void;
		handleKeyboard: (event: KeyboardEvent) => void;
		handleKeyMatch: (event: KeyboardEvent) => void;
	};
	watchers: {
		watchNavigation: (callback?: {
			indexCb?: (index: number) => void;
			manualIndexCb?: (index: number) => void;
		}) => Unsubscriber;
		watchSelected: (
			callback: (selected: HTMLElement, previous?: HTMLElement) => void
		) => Unsubscriber;
		watchActive: (
			callback: (active: HTMLElement, previous?: HTMLElement) => void
		) => Unsubscriber;
	};
	status: {
		IsSelected: (index: number) => Readable<boolean>;
	};
	lifecycle: {
		onDestroy: (
			callback: (state: {
				Index: Writable<number>;
				ManualIndex: Writable<number>;
				Waiting: Writable<boolean>;
				VerticalWaiting: Writable<boolean>;
			}) => void
		) => void;
	};
}

export interface Notifiable<T> extends Writable<T> {
	notify: Notifier<T>;
}

export type Notifier<T> = (val: T) => T;

export interface Registrable<T> extends Readable<T[]> {
	register: (val?: T, onRegister?: (val: T) => void) => number;
	unregister: (val: T) => void;
	watchers: {
		watchNewItem: (callback: (newItem: T) => void) => Unsubscriber;
	};
}
