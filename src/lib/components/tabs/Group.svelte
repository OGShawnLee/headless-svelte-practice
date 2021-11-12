<script context="module" lang="ts">
	import type { Readable } from 'svelte/store';
	import type { Notifiable, Notifier, SelectedStyles } from '$lib/types';
	import { navigable, notifiable, registrable } from '$lib/stores';
	import { useSubscribers, handleSelectedStyles } from '$lib/utils';
	import { isObject } from '$lib/utils/predicate';
	import { DOMController } from '$lib/utils/DOMController';

	function initTabs({ Index, Manual, Vertical }: TabsSettings) {
		const Tabs = registrable<HTMLElement>([]);
		const Panels = registrable<number>([]);
		const config = { Items: Tabs, Index, Manual, Vertical };
		const { handlers, watchers, ...Navigable } = navigable(config);

		return {
			tabs: (node: HTMLElement, styles?: SelectedStyles) => {
				const { handleKeyboard } = handlers;
				const { watchNavigation, watchSelected } = watchers;
				const { makeFocusable, removeFocusable } = DOMController;

				const stylesHandler = handleSelectedStyles(styles);
				const DisposeSubscribers = useSubscribers(
					watchNavigation(),
					watchSelected((selected, previous) => {
						stylesHandler(selected, previous);
						if (previous) removeFocusable(previous);
						makeFocusable(selected);
					})
				);

				node.addEventListener('keydown', handleKeyboard);
				return {
					destroy: () => {
						DisposeSubscribers;
						node.removeEventListener('keydown', handleKeyboard);
					},
				};
			},
			tab: (node: HTMLElement, notifySelected: Notifier<boolean>) => {
				const { removeFocusable } = DOMController;
				const registeredIndex = Tabs.register(node, removeFocusable);

				const IsSelected = Navigable.status.IsSelected(registeredIndex);
				const StopSelected = IsSelected.subscribe(notifySelected);

				const selectTab = handlers.handleSelection(registeredIndex);
				node.addEventListener('click', selectTab);
				return {
					destroy: () => {
						Tabs.unregister(node), StopSelected();
						node.removeEventListener('click', selectTab);
					},
				};
			},
			panel: {
				register: Panels.register,
				unregister: Panels.unregister,
			},
		};
	}

	interface TabsSettings {
		Index: Notifiable<number>;
		Manual: Readable<boolean>;
		Vertical: Readable<boolean>;
	}

	export function isTabsContext(val: unknown): val is TabsContext {
		if (!isObject(val)) return false;
		if (!('Index' in val)) return false;
		if (!('panel' in val)) return false;
		return 'tabs' in val && 'tab' in val;
	}

	interface TabsContext extends ReturnType<typeof initTabs> {
		Index: Notifiable<number>;
	}

	export const TABS_CONTEXT_KEY = 'SVELTE_HEADLESS-TABS-CONTEXT';
</script>

<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	export let current = 0;
	export let manual = false;
	export let vertical = false;
	export let onChange: (index: number) => void = () => void 0;

	const Index = notifiable(current, (num) => (current = num));
	const Manual = writable(manual);
	const Vertical = writable(vertical);

	$: Index.set(current);
	$: Vertical.set(vertical);
	$: Manual.set(manual);

	$: if (onChange) onChange(current);

	const { tabs, tab, panel } = initTabs({ Index, Vertical, Manual });
	setContext(TABS_CONTEXT_KEY, { Index, tabs, tab, panel });
</script>

<slot {current} {tabs} />
