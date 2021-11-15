import type { Writable, Readable, Unsubscriber } from 'svelte/store';

type DefinedListenerBuilder = (
	callback: (event: Event) => void,
	node: HTMLElement
) => DefinedListener;

interface DefinedListener<E extends Event> {
	type: string;
	func: (event: E) => void;
	bubble?: boolean;
}

export type EventListenerRemover = () => void;

export interface Navigable {
	handlers: {
		handleSelection: (index: number) => () => void;
		handleKeyboard: (event: KeyboardEvent) => void;
		handleKeyMatch: (event: KeyboardEvent) => void;
		createManualBlurHandler: (node: HTMLElement) => {
			handleManualBlur: (event: FocusEvent) => void;
			removeInternal: EventListenerRemover;
		};
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
		watchIsSelected: (
			index: number,
			callback: (isSelected: boolean) => void
		) => Unsubscriber;
	};
	onDestroy: (
		callback: (state: {
			Index: Writable<number>;
			ManualIndex: Writable<number>;
			Waiting: Writable<boolean>;
			VerticalWaiting: Writable<boolean>;
		}) => void
	) => void;
}

export interface Notifiable<T> extends Writable<T> {
	notify: Notifier<T>;
}

export type Notifier<T> = (val: T) => T;

export interface Registrable<T> extends Readable<T[]> {
	register: (val?: T, onRegister?: (val: T) => void) => number;
	unregister: (val: T) => void;
	useItems: (callback: (item: T) => void) => void;
	watchers: {
		watchNewItem: (callback: (newItem: T) => void) => Unsubscriber;
	};
}

export interface SelectedStyles {
	if?: string;
	else?: string;
}

export interface Toggleable extends Readable<boolean> {
	set: (val: boolean) => void;
	close: (ref?: HTMLElement | Event) => void;
	open: () => void;
	toggle: () => void;
	useButton: (node: HTMLElement, ...openKeys: string[]) => EventListenerRemover;
	usePanel: (settings: {
		panelElement: HTMLElement;
		listenersBuilders: DefinedListenerBuilder[];
		beforeClose?: (event?: Event) => void;
	}) => EventListenerRemover;
}
