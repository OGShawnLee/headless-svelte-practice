<script context="module" lang="ts">
	import type { Readable } from 'svelte/store';
	import type { Notifiable, Notifier } from '$lib/types';
	import { navigableLite, useManualBlur } from '$lib/stores/navigable-lite';
	import { hashable, notifiable, staticRegistrable } from '$lib/stores';
	import { useNamer, useStoreListeners, useSubscribers, use_id } from '$lib/utils';
	import { makeFocusable, removeFocusable } from '$lib/utils/focus-management';
	import { propsIn } from '$lib/utils/predicate';

	export const TABS_CONTEXT_KEY = 'SVELTE-HEADLESS-TABS';
	const generate_id = use_id();

	function initTabs({ Index, Manual, Vertical }: TabsSettings) {
		const { value: items, ...Tabs } = staticRegistrable<HTMLElement>([]);
		const Panels = hashable<number, string | undefined>();
		const Navigable = navigableLite({ items, Index, Manual, Vertical });

		const id = generate_id.next().value as number;
		const [baptize, tabsName] = useNamer('tabs', id);
		return {
			tablist: (node: HTMLElement) => {
				const { Index, ManualIndex } = Navigable;
				Tabs.useItems((tab) => (tab.ariaSelected = String(false)));

				const STOP_SUBSCRIBERS = useSubscribers(
					Navigable.listenSelected((selected, previous) => {
						makeFocusable(selected);
						selected.ariaSelected = String(true);
						if (previous) {
							removeFocusable(previous);
							previous.ariaSelected = String(false);
						}
					}),
					Vertical.subscribe((isVertical) => {
						node.ariaOrientation = isVertical ? 'vertical' : 'horizontal';
					})
				);

				const STOP_LISTENERS = useStoreListeners(
					Navigable.useNavigation(node),
					useManualBlur(node, items, Index, ManualIndex)
				);

				node.id = tabsName;
				node.setAttribute('role', 'tablist');
				return {
					destroy: () => {
						STOP_SUBSCRIBERS(), STOP_LISTENERS();
					},
				};
			},
			tab: (node: HTMLElement, notifySelected: Notifier<boolean>) => {
				const index = Tabs.register(node, removeFocusable);
				const selectTab = Navigable.handleSelection(index);
				const tabName = baptize('tab', index);

				const stopSubscribers = useSubscribers(
					Navigable.isSelected(index, notifySelected),
					Panels.listenItem(index, (panelName) => {
						if (panelName) node.setAttribute('aria-controls', panelName);
						else node.removeAttribute('aria-controls');
					})
				);

				node.id = tabName;
				node.setAttribute('role', 'tab');
				node.addEventListener('click', selectTab);
				return {
					destroy: () => {
						Tabs.unregister(index), stopSubscribers();
						node.removeEventListener('click', selectTab);
					},
				};
			},
			usePanel: {
				register: () => Panels.preRegister(undefined),
				panel: (node: HTMLElement, index: number) => {
					const [tabName, panelName] = [baptize('tab', index), baptize('panel', index)];
					Panels.update(index, panelName);

					node.tabIndex = 0;
					node.id = panelName;
					node.setAttribute('role', 'tabpanel');
					node.setAttribute('aria-labelledby', tabName);
					return {
						destroy: () => {
							Panels.unregister(index);
						},
					};
				},
			},
		};
	}

	export const isTabsContext = (val: unknown): val is TabsContext =>
		propsIn(val, 'Index', 'tab', 'tablist', 'usePanel');

	interface TabsSettings {
		Index: Notifiable<number>;
		Manual: Readable<boolean>;
		Vertical: Readable<boolean>;
	}

	interface TabsContext extends ReturnType<typeof initTabs> {
		Index: Readable<number>;
	}
</script>

<script lang="ts">
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';

	export let index = 0;
	export let manual = false;
	export let vertical = false;
	export let onChange: (index: number) => void = () => void 0;

	const Index = notifiable(index, (num) => (index = num));
	const Manual = writable(manual);
	const Vertical = writable(vertical);

	$: Index.set(index);
	$: Manual.set(manual);
	$: Vertical.set(vertical);
	$: onChange(index);

	const TabsState = initTabs({ Index, Manual, Vertical });
	setContext(TABS_CONTEXT_KEY, { Index, ...TabsState });

	const { tablist } = TabsState;
</script>

<slot {index} {tablist} />
