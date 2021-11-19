import type { Writable, Readable, Unsubscriber } from 'svelte/store';

export interface Activable extends Readable<boolean> {
	set: Writable<boolean>['set'];
	toggle: () => void;
}

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

export interface Hashable<K, V> extends Readable<Map<K, V>> {
	Entries: Readable<[K, V][]>;
	Keys: Readable<K[]>;
	Values: Readable<V[]>;
	register: (key: K, value: V, onRegister?: (key: K) => void) => number;
	unregister: (key: K) => void;
	update: (key: K, value: V) => void;
	listenNewItem: (callback: (newItem: [K, V]) => void) => Unsubscriber;
}

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

export interface Selectable<T> extends Readable<T> {
	SelectedIndex: Writable<number>;
	selectIndex: Writable<number>['set'];
	selectIndexEvent: (index: number) => () => void;
	set: Writable<T>['set'];
	finishWaiting: () => void;
	Keys: Hashable<HTMLElement, T>['Keys'];
	Values: Hashable<HTMLElement, V>['Values'];
	listenSelection: () => Unsubscriber;
	listenNewItem: Hashable<HTMLElement, V>['listenNewItem'];
	initOption: (optionSettings: {
		initialValue: T;
		initialIsSelected: boolean;
		Selected: Notifiable<boolean>;
	}) => {
		set: Writable<T>['set'];
		Id: Readable<number>;
		registerOption: (key: HTMLElement, onRegister?: (key: HTMLElement) => void) => number;
		unregisterOption: (key: HTMLElement) => void;
		listenOption: (
			key: HTMLElement,
			registeredIndex: number,
			isSelectedCallback?: (isSelected: boolean) => void
		) => Unsubscriber;
	};
	Waiting: Readable<boolean>;
}

export type SelectableOption<T> = ReturnType<Selectable<T>['initOption']>;

export interface SelectedStyles {
	if?: string;
	else?: string;
}

export interface StaticHash<K, V> {
	value: Map<K, V>;
	values: () => V[];
	keys: () => K[];
	entries: () => [K, V][];
	register: (key: K, val: V) => number;
	unregister: (key: k) => void;
	updateItem: (
		key: K,
		callback: (val: V | undefined, state?: Map<K, V>) => V | undefined
	) => void;
	update: (key: K, val: V) => void;
}

export interface Toggleable extends Readable<boolean> {
	set: (val: boolean) => void;
	close: (ref?: HTMLElement | Event) => void;
	defineElements: (elements: { button?: HTMLElement; panel?: HTMLElement }) => void;
	open: () => void;
	toggle: () => void;
	useButton: (node: HTMLElement, ...openKeys: string[]) => EventListenerRemover;
	usePanel: (settings: {
		panelElement: HTMLElement;
		listenersBuilders?: DefinedListenerBuilder[];
		beforeClose?: (event?: Event) => void;
	}) => EventListenerRemover;
	configureAria: (settings: { id: number; name: string; hasPopup: boolean }) => void;
}
