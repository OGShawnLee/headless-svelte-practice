<script context="module" lang="ts">
	import { derived, Readable } from 'svelte/store';
	import type { Selectable, SelectableOption, Toggleable } from '$lib/types';
	import { navigable, registrable, selectable, toggleable } from '$lib/stores';
	import { useSubscribers } from '$lib/utils';
	import { clickOutside, escapeKey } from '$lib/utils/definedListeners';
	import { propsIn } from '$lib/utils/predicate';

	const LISTBOXES = registrable<number>([]);
	export const LISTBOX_CONTEXT_KEY = 'SVELTE-HEADLESS-LISTBOX';

	function initListbox<T>({ Toggleable, Selectable }: ListboxSettings<T>) {
		const { Keys: Buttons, SelectedIndex, Waiting, finishWaiting } = Selectable;
		const { watchers, handlers, ...Navigation } = navigable({
			Items: Buttons,
			Index: SelectedIndex,
			Vertical: true,
			Manual: true,
			Wait: Waiting,
			VerticalWait: true,
			onChange: finishWaiting,
			// focus: true,
		});

		const { useButton, usePanel } = Toggleable;

		let button: HTMLElement | undefined;
		return {
			button: (node: HTMLElement) => {
				button = node;
				const disposeButton = useButton(node, 'ArrowUp', 'ArrowDown', 'Enter');
				return {
					destroy: () => {
						disposeButton();
					},
				};
			},
			options: (node: HTMLElement) => {
				const { watchNavigation, watchSelected } = watchers;
				const { handleKeyboard, handleKeyMatch } = handlers;
				const { selectIndex } = Selectable;

				makeFocusable(node).focus();
				const restoreFocus = useFocusTrap(node, button);

				const disposePanel = usePanel({
					panelElement: node,
					beforeClose: restoreFocus,
					listenersBuilders: [escapeKey, clickOutside],
				});

				const stopSubcribers = useSubscribers(
					Selectable.listenNewItem(([button]) => {
						button.style.color = 'red';
					}),
					watchNavigation({ indexCb: selectIndex }),
					watchSelected((selected, previous) => {
						selected.style.color = 'green';
						selected.focus();
						makeFocusable(selected);
						if (previous) {
							previous.style.color = 'red';
							removeFocusable(previous);
						}
					}),
					Selectable.listenSelection()
				);

				window.addEventListener('keydown', handleKeyboard);
				node.addEventListener('keydown', handleKeyMatch);
				node.addEventListener('keydown', useSimpleFocusTrap);
				return {
					destroy: () => {
						disposePanel(), stopSubcribers(), restoreFocus();
						window.addEventListener('keydown', handleKeyboard);
						node.removeEventListener('keydown', handleKeyMatch);
						node.removeEventListener('keydown', useSimpleFocusTrap);
						Navigation.onDestroy(({ VerticalWaiting }) => {
							VerticalWaiting.set(true); // ? fixes a bug #index-out-of-sync
						});
					},
				};
			},
			option: (node: HTMLElement, Option: SelectableOption<T>) => {
				const { registerOption, unregisterOption } = Option;
				const registeredIndex = registerOption(node, removeFocusable);

				const stopOption = Option.listenOption(node, registeredIndex);
				const selectOption = handlers.handleSelection(registeredIndex);

				node.addEventListener('click', selectOption);
				return {
					destroy: () => {
						stopOption(), unregisterOption(node);
						node.removeEventListener('click', selectOption);
					},
				};
			},
		};
	}

	interface ListboxSettings<T> {
		Toggleable: Toggleable;
		Selectable: Selectable<T>;
		id: number;
	}

	export const isListboxContext = (val: unknown): val is ListboxContext =>
		propsIn(val, 'Open', 'initOption', 'button', 'options', 'option');

	interface ListboxContext {
		Open: Readable<boolean>;
		initOption: Selectable<any>['initOption'];
		button: (node: HTMLElement) => void;
		options: (node: HTMLElement) => void;
		option: (node: HTMLElement, Option: SelectableOption<any>) => void;
	}
</script>

<script lang="ts">
	import { setContext, onDestroy } from 'svelte';
	import {
		makeFocusable,
		removeFocusable,
		useFocusTrap,
		useSimpleFocusTrap,
	} from '$lib/utils/focus-management';

	export let value: any = '';
	let open = false;

	const Selectable = selectable(value, (val) => (value = val));
	const Toggleable = toggleable(open, (bool) => (open = bool));

	$: Selectable.set(value);

	const id = LISTBOXES.register();
	onDestroy(() => LISTBOXES.unregister(id));

	const ListboxState = initListbox({ Selectable, Toggleable, id });
	const { button, options } = ListboxState;
	const Open = derived(Toggleable, ($Open) => $Open);

	const { initOption } = Selectable;
	setContext(LISTBOX_CONTEXT_KEY, { Open, initOption, ...ListboxState });
</script>

<slot {open} {value} {button} {options} />
{#if open}
	<slot name="list" />
{/if}
