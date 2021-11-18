<script context="module" lang="ts">
	import type { Readable, Writable } from 'svelte/store';
	import type { Selectable, SelectableOption, SelectedStyles } from '$lib/types';
	import { navigable, registrable, selectable } from '$lib/stores';
	import { FocusManager, handleSelectedStyles, useSubscribers } from '$lib/utils';
	import { propsIn } from '$lib/utils/predicate';

	const RADIO_GROUPS = registrable<number>([]);
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
			option: (node: HTMLElement, Option: SelectableOption<T>) => {
				const { registerOption, unregisterOption, listenOption } = Option;
				const registeredIndex = registerOption(node, FocusManager.removeFocusable);

				const stopOption = listenOption(node, registeredIndex, (isSelected) => {
					node.ariaChecked = String(isSelected);
				});

				node.setAttribute('role', 'radio');
				const selectOption = handlers.handleSelection(registeredIndex);
				node.addEventListener('click', selectOption);
				return {
					destroy: () => {
						unregisterOption(node), stopOption();
						node.removeEventListener('click', selectOption);
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

<script lang="ts">
	import { onDestroy, onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';

	let className = '';
	export { className as class };
	export let value: any = '';
	export let horizontal = false;

	const Selectable = selectable(value, (val) => (value = val));
	const Vertical = writable(!horizontal);
	const { options, option } = initRadioGroup({ Selectable, Vertical });

	let id: number;
	onMount(() => (id = RADIO_GROUPS.register()));
	onDestroy(() => RADIO_GROUPS.unregister(id));

	$: BASENAME = `${RADIO_GROUP_CONTEXT_KEY}-${id}`;

	const GroupName = writable('');
	const isUsingLabel = writable(false);
	const isUsingDescription = writable(false);

	$: GroupName.set(BASENAME);
	$: Selectable.set(value);
	$: Vertical.set(!horizontal);

	$: groupLabelledby = $isUsingLabel ? `${BASENAME}-label` : undefined;
	$: groupDescribedby = $isUsingDescription ? `${BASENAME}-description` : undefined;

	setContext(RADIO_GROUP_CONTEXT_KEY, {
		initRadioOption: Selectable.initOption,
		option,
		GroupName,
		isUsingLabel,
		isUsingDescription,
	});
</script>

<div
	id={$GroupName}
	aria-labelledby={groupLabelledby}
	aria-describedby={groupDescribedby}
	class={className}
	use:options
>
	<slot {options} {value} />
</div>
