<script context="module" lang="ts">
	import type { Writable } from 'svelte/store';
	import { propsIn } from '$lib/utils/predicate';

	export const RADIO_GROUP_OPTION_CONTEXT_KEY = 'svelte-headless-radio-group-option';

	export interface RadioGroupOptionContext {
		isUsingLabel: Writable<boolean>;
		isUsingDescription: Writable<boolean>;
		OptionName: Writable<string>;
		OptionLabelName: Writable<string>;
		OptionDescriptionName: Writable<string>;
	}

	const keys = ['OptionName', 'OptionLabelName', 'OptionDescriptionName'];
	export const isRadioOptionContext = (val: unknown): val is RadioGroupOptionContext =>
		propsIn(val, 'isUsingLabel', 'isUsingDescription', ...keys);
</script>

<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import { derived, writable } from 'svelte/store';
	import { isRadioGroupContext, RADIO_GROUP_CONTEXT_KEY } from './Group.svelte';
	import { notifiable } from '$lib/stores';

	let className = '';
	export { className as class };
	export let value: any = '';
	export let selected = false;
	export let activeClass = '';

	let checked = false;
	const Selected = notifiable(selected, (bool) => (checked = bool));

	$: finalClassName = `${className} ${checked ? activeClass : ''}`;

	const RadioGroupContext = getContext(RADIO_GROUP_CONTEXT_KEY);
	if (!isRadioGroupContext(RadioGroupContext))
		throw new Error('Invalid Radio Group Context');

	const { initRadioOption, GroupName, option } = RadioGroupContext;
	const SelectableOption = initRadioOption({
		initialValue: value,
		initialIsSelected: selected,
		Selected,
	});

	const Id = SelectableOption.Id;
	const isUsingLabel = writable(false);
	const isUsingDescription = writable(false);

	const OptionName = derived([GroupName, Id], ([$GroupName, $Id]) => {
		return `${$GroupName}-option-${$Id}`;
	});
	const OptionLabelName = derived(OptionName, ($OptionName) => `${$OptionName}-label`);
	const OptionDescriptionName = derived(OptionName, ($OptionName) => {
		return `${$OptionName}-description`;
	});

	$: optionLabelledby = $isUsingLabel ? $OptionLabelName : undefined;
	$: optionDescribedby = $isUsingDescription ? $OptionDescriptionName : undefined;

	setContext(RADIO_GROUP_OPTION_CONTEXT_KEY, {
		OptionName,
		OptionLabelName,
		OptionDescriptionName,
		isUsingLabel,
		isUsingDescription,
	});
</script>

<div
	aria-labelledby={optionLabelledby}
	aria-describedby={optionDescribedby}
	class={finalClassName}
	id={$OptionName}
	use:option={SelectableOption}
>
	<slot {checked} />
</div>
