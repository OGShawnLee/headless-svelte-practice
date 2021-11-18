<script context="module" lang="ts">
	import type { Readable, Writable } from 'svelte/store';
	import type { Selectable, SelectableOption, SelectedStyles } from '$lib/types';
	import { navigable } from '$lib/stores';
	import { FocusManager, handleSelectedStyles, useSubscribers } from '$lib/utils';
	import { propsIn } from '$lib/utils/predicate';

	export const RADIO_GROUP_CONTEXT_KEY = 'svelte-headless-radio-group';

	function initRadioGroup<T>({ Selectable, Vertical }: RadioGroupSettings<T>) {
		const { Keys: Buttons, SelectedIndex: Index } = Selectable;
		const { watchers, handlers } = navigable({ Items: Buttons, Index, Vertical });

		return {
			options: (node: HTMLElement, selectedStyles?: SelectedStyles) => {
				const { handleKeyboard } = handlers;
				const { watchNavigation, watchSelected } = watchers;

				const stylesHandler = handleSelectedStyles(selectedStyles);
				const stopSubcribers = useSubscribers(
					Selectable.listenNewItem(([newItem]) => {
						stylesHandler({ unselected: newItem });
					}),
					Selectable.listenSelection(),
					watchNavigation(),
					watchSelected((selected, previous) => {
						FocusManager.makeFocusable(selected);
						stylesHandler({ selected, unselected: previous });
						if (previous) FocusManager.removeFocusable(previous);
					})
				);

				node.setAttribute('role', 'radiogroup');
				node.addEventListener('keydown', handleKeyboard);
				return {
					destroy: () => {
						stopSubcribers();
						node.removeEventListener('keydown', handleKeyboard);
					},
				};
			},
		};
	}

	export const isRadioGroupContext = (val: unknown): val is RadioGroupContext =>
		propsIn(
			val,
			'option',
			'initRadioOption',
			'GroupName',
			'isUsingLabel',
			'isUsingDescription'
		);

	interface RadioGroupContext {
		option: (node: HTMLElement, Option: SelectableOption<any>) => void;
		initRadioOption: Selectable<any>['initOption'];
		GroupName: Writable<string>;
		isUsingLabel: Writable<boolean>;
		isUsingDescription: Writable<boolean>;
	}

	interface RadioGroupSettings<T> {
		Selectable: Selectable<T>;
		Vertical: Readable<boolean>;
	}
</script>
