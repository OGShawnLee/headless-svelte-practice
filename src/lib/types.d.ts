import type { Writable, Readable, Unsubscriber } from 'svelte/store';

export type Action<P> = (node: HTMLElement, param: P) => void;
export type SoftAction = (node: HTMLElement) => void;

export interface Activable extends Readable<boolean> {
	set: Writable<boolean>['set'];
	toggle: () => void;
}

interface Component<E extends Element = HTMLElement> {
	node?: E;
	subscribe: (callback: (node?: E, id?: string) => void) => Unsubscriber;
	exists: () => [boolean, E | undefined];
	appear: (node: E, id: string) => void;
	disappear: () => void;
}

export type EventListenerRemover = () => void;

export interface Hashable<K, V> extends Readable<Map<K, V>> {
	value: Map<K, V>;
	Entries: Readable<[K, V][]>;
	Keys: Readable<K[]>;
	Values: Readable<V[]>;
	preRegister: (val: V) => number;
	register: (key: K, value: V, onRegister?: (key: K, val: V) => void) => number;
	unregister: (key: K) => void;
	update: (key: K, value: V) => void;
	modify: (key: K, callback: (val: V) => V) => void;
	listenItem: (key: K, callback: (item?: V) => void) => Unsubscriber;
	listenNewItem: (callback: (newItem: [K, V]) => void) => Unsubscriber;
}

export type Keys =
	| 'ArrowUp'
	| 'ArrowDown'
	| 'ArrowRight'
	| 'ArrowLeft'
	| 'Enter'
	| 'Space';

interface Navigable extends NavigableStores, NavigableMethods {
	subscribe: Readable<number>['subscribe'];
	Data: NavigableData;
	Stores: NavigableStores;
	Methods: NavigableMethods;
	handleSelection: (index: number) => (event: MouseEvent | KeyboardEvent) => void;
	useDynamicOpen: (
		node: HTMLElement,
		startWithFunction: (Data: NavigableData) => NavigableStartWith
	) => Promise<void>;
	useNavigation: (node: HTMLElement) => EventListenerRemover;
	usePlugins: (node: HTMLElement, ...pluginFn: NavigablePluginFunction[]) => Unsubscriber;
	listenSelected: (
		callback: (selected: HTMLElement, previous?: HTMLElement) => void
	) => Unsubscriber;
	isSelected: (index: number, callback: (isSelected: boolean) => void) => Unsubscriber;
	onDestroy: (cb: (Stores: NavigableStores) => void) => void;
}

interface NavigableData {
	items: HTMLElement[];
	isVertical: boolean;
	isManual: boolean;
	isWaiting: boolean;
	selectedItem?: HTMLElement;
	TargetIndex: Writable<number>;
}

interface NavigableMethods {
	set: (index: number) => void;
	interact: (action: number | ((index: number) => number), setWaiting?: boolean) => void;
	navigate: (
		direction: 'ASCENDING' | 'DESCENDING',
		cb: (index: number, isOverflowed: boolean) => number
	) => void;
	goNext: (ctrlKey: boolean) => void;
	goBack: (ctrlKey: boolean) => void;
	useFirst: () => void;
	useLast: () => void;
	useSelected: () => void;
}

interface NavigableStores {
	Items: Readable<HTMLElement[]> | HTMLElement[];
	Index: Writable<number>;
	ManualIndex: Writable<number>;
	SelectedItem: Readable<HTMLElement | undefined>;
	Manual: Readable<boolean>;
	Vertical: Readable<boolean>;
	Wait: Readable<boolean>;
	Waiting: Writable<boolean>;
}

type NavigablePluginFunction = (
	node: HTMLElement,
	NavigableAPI: {
		Data: NavigableData;
		Methods: NavigableMethods;
		Stores: NavigableStores;
	}
) => EventListenerRemover;

type NavigableStartWith = 'FIRST' | 'LAST' | 'AUTO' | number;

export interface Notifiable<T> extends Writable<T> {
	notify: Notifier<T>;
}

export type Notifier<T> = (val: T) => T;

export interface Registrable<T> extends Readable<T[]> {
	value: T[];
	NewItem: Readable<T | undefined>;
	emptyRegister: () => number;
	register: (val: T, onRegister?: (val: T) => void) => number;
	unregister: (val: T, index?: number) => void;
	exists: (val: T) => boolean;
	useItems: (callback: (item: T) => void) => void;
	listenNewItem: (callback: (newItem: T) => void) => Unsubscriber;
}

interface Selectable<K, V> extends Readable<V> {
	Options: Hashable<K, V>['subscribe'];
	Keys: Readable<K[]>;
	Values: Readable<V[]>;
	SelectedIndex: Writable<number>;
	Waiting: Readable<boolean>;
	select: (index: number) => void;
	useInitialValueMatch: () => [hasMatch: boolean, matchIndex: number];
	useSelection: () => Unsubscriber;
	register: (key: K, value: V, isSelected: boolean) => number;
	update: Hashable<K, V>['update'];
	unregister: Hashable<K, V>['unregister'];
}

export type SelectableOption<T> = ReturnType<Selectable<T>['initOption']>;

export interface SelectedStyles {
	if?: string;
	else?: string;
}

export interface Toggleable extends ToggleableMethods, Readable<boolean> {
	set: Writable<boolean>['set'];
	Button: Readable<HTMLElement | undefined>;
	Panel: Readable<HTMLElement | undefined>;
	Methods: ToggleableMethods;
	defineButton: (node: HTMLElement, id?: string) => void;
	useButton: (
		node: HTMLElement,
		Settings?: {
			useDefaultKeys?: boolean;
			keysReducer?: (event: KeyboardEvent, Methods: ToggleableMethods) => void;
		}
	) => EventListenerRemover;
	definePanel: (node: HTMLElement, id?: string) => void;
	usePanel: (
		node: HTMLElement,
		Settings?: {
			beforeClose?: Function;
			listeners?: ('FOCUS_LEAVE' | 'ESCAPE_KEY' | 'CLICK_OUTSIDE')[];
		}
	) => EventListenerRemover;
	unregisterPanel: () => void;
}

interface ToggleableMethods {
	open: Function;
	toggle: (event: Event) => void;
	close: (ref?: Event | HTMLElement) => void;
}
