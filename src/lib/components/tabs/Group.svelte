<script context="module" lang="ts">
	import type { Readable, Writable } from 'svelte/store';
	import type { Notifier } from '$lib/types';
	import { hashable, notifiable, registrable } from '$lib/stores';
	import { navigable, useManualBlur } from '$lib/stores/navigable';
	import { useId, useNamer, useSubscribers } from '$lib/utils';
	import { makeFocusable, removeFocusable } from '$lib/utils/focus-management';
	import { propsIn } from '$lib/utils/predicate';

	export const TABS_CONTEXT_KEY = 'SVELTE-HEADLESS-TABS';
	const generateId = useId();

	function initTabs({ Index, Manual, Vertical }: TabsSettings) {
		const Tabs = registrable<HTMLElement>([]);
		const Panels = hashable<number, string | undefined>();
		const Navigable = navigable({ Items: Tabs, Index, Manual, Vertical });

		const id = generateId.next().value as number;
		const [baptize, tabsName] = useNamer('tabs', id);
		return {
			tablist: (node: HTMLElement) => {
				const STOP_SUBSCRIBERS = useSubscribers(
					Navigable.useNavigation(node),
					Navigable.usePlugins(node, useManualBlur),
					Navigable.listenSelected((selected, previous) => {
						makeFocusable(selected);
						selected.ariaSelected = 'true';
						if (previous) {
							removeFocusable(previous);
							previous.ariaSelected = 'false';
						}
					}),
					Vertical.subscribe((isVertical) => {
						node.ariaOrientation = isVertical ? 'vertical' : 'horizontal';
					})
				);

				node.id = tabsName;
				node.setAttribute('role', 'tablist');
				return {
					destroy: () => {
						STOP_SUBSCRIBERS();
					},
				};
			},
			tab: (node: HTMLElement, notifySelected: Notifier<boolean>) => {
				const index = Tabs.register(node, removeFocusable);
				const tabName = baptize('tab', index);

				const stopSubscribers = useSubscribers(
					Navigable.isSelected(index, notifySelected),
					Panels.listenItem(index, (panelName) => {
						if (panelName) node.setAttribute('aria-controls', panelName);
						else node.removeAttribute('aria-controls');
					})
				);

				const handleSelection = Navigable.handleSelection(index);

				node.id = tabName;
				node.setAttribute('role', 'tab');
				node.addEventListener('mousedown', handleSelection);
				node.addEventListener('keydown', handleSelection);
				return {
					destroy: () => {
						Tabs.unregister(node, index), stopSubscribers();
						node.removeEventListener('mousedown', handleSelection);
						node.removeEventListener('keydown', handleSelection);
					},
				};
			},
			usePanel: {
				register: () => Panels.preRegister(undefined),
				unregister: Panels.unregister,
				panel: (node: HTMLElement, index: number) => {
					const [tabName, panelName] = [baptize('tab', index), baptize('panel', index)];
					Panels.update(index, panelName);

					node.tabIndex = 0;
					node.id = panelName;
					node.ariaSelected = 'false';
					node.setAttribute('role', 'tabpanel');
					node.setAttribute('aria-labelledby', tabName);
					return {
						destroy: () => {
							if (Panels.value.has(index)) {
								Panels.modify(index, () => undefined);
							}
						},
					};
				},
			},
		};
	}

	export const isTabsContext = (val: unknown): val is TabsContext =>
		propsIn(val, 'Index', 'tab', 'tablist', 'usePanel');

	interface TabsSettings {
		Index: Writable<number>;
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
