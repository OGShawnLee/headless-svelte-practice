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
