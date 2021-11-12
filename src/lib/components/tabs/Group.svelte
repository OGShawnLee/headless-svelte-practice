<script context="module" lang="ts">
	import type { Readable } from 'svelte/store';
	import type { Notifiable, Notifier } from '$lib/types';
	import { navigable, notifiable, registrable } from '$lib/stores';
	import { useSubscribers } from '$lib/utils';

	function initTabs({ Index, Manual, Vertical }: TabsSettings) {
		const Tabs = registrable<HTMLElement>([]);
		const Panels = registrable<number>([]);
		const config = { Items: Tabs, Index, Manual, Vertical };
		const { handlers, watchers, ...Navigable } = navigable(config);

		return {
			tabs: (node: HTMLElement) => {
				const { handleKeyboard } = handlers;
				const { watchNavigation, watchSelected } = watchers;

				const DisposeSubscribers = useSubscribers(
					watchNavigation(),
					watchSelected((selected, previous) => {
						if (previous) previous.style.color = 'red';
						selected.style.color = 'green';
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
				const registeredIndex = Tabs.register(node, (button) => {
					button.tabIndex = -1;
				});

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
</script>

<script lang="ts">
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
</script>
