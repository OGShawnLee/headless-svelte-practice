import type { Writable, Readable, Unsubscriber } from 'svelte/store';

export type Action<P> = (node: HTMLElement, param: P) => void;
export type SoftAction = (node: HTMLElement) => void;

export interface Activable extends Readable<boolean> {
	set: Writable<boolean>['set'];
	toggle: () => void;
}

export interface Component {
	subscribe: (callback: (exists: boolean, id: string) => void) => Unsubscriber;
	appear: (node: HTMLElement, id: string) => void;
	disappear: () => void;
}

export type EventListenerRemover = () => void;

export interface Hashable<K, V> extends Readable<Map<K, V>> {
	value: Map<K, V>;
	Entries: Readable<[K, V][]>;
	Keys: Readable<K[]>;
	Values: Readable<V[]>;
	preRegister: (val: V) => number;
	register: (key: K, value: V, onRegister?: (key: K) => void) => number;
	unregister: (key: K) => void;
	update: (key: K, value: V) => void;
	modify: (key: K, callback: (val: V) => V) => void;
	listenNewItem: (callback: (newItem?: [K, V]) => void) => Unsubscriber;
	listenItem: (key: K, cb: (item?: V) => void) => Unsubscriber;
}

export interface Navigable {
	handleSelection: (index: number) => () => void;
	handleKeyboard: (event: KeyboardEvent) => void;
	handleKeyMatch: (event: KeyboardEvent) => void;
	useManualBlur: (node: HTMLElement) => {
		handleManualBlur: (event: FocusEvent) => void;
		removeInternal: EventListenerRemover;
	};
	startNavigation: (callback?: {
		indexCb?: (index: number) => void;
		manualIndexCb?: (index: number) => void;
	}) => Unsubscriber;
	listenSelected: (
		callback: (selected: HTMLElement, previous?: HTMLElement) => void
	) => Unsubscriber;
	listenActive: (
		callback: (active: HTMLElement, previous?: HTMLElement) => void
	) => Unsubscriber;
	isSelected: (index: number, callback: (isSelected: boolean) => void) => Unsubscriber;
	onDestroy: (
		callback: (state: {
			Index: Writable<number>;
			ManualIndex: Writable<number>;
			Waiting: Writable<boolean>;
			VerticalWaiting: Writable<boolean>;
		}) => void
	) => void;
}

export interface NavigableLite
	extends Omit<
		Navigable,
		| 'onDestroy'
		| 'listenActive'
		| 'startNavigation'
		| 'handleKeyMatch'
		| 'handleKeyboard'
		| 'useManualBlur'
	> {
	Index: Writable<number>;
	ManualIndex: Writable<number>;
	set: (index: number) => void;
	useNavigation: (node: HTMLElement, callback?: (index: number) => void) => Unsubscriber;
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

export interface Toggleable extends Readable<boolean> {
	set: Writable<boolean>['set'];
	open: Function;
	toggle: Function;
	close: (ref?: HTMLElement | Event) => void;
	defineButton: (node: HTMLElement) => void;
	definePanel: (node: HTMLElement) => void;
	Panel: Readable<HTMLElement | undefined>;
	useButton: (node: HTMLElement) => EventListenerRemover;
	usePanel: (settings: {
		beforeClose?: (event?: Event) => void;
		panelElement: HTMLElement;
		listeners: DefinedListenerBuilder[];
	}) => EventListenerRemover;
	unregisterPanel: () => void;
}
