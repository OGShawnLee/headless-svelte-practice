<script context="module" lang="ts">
	import type { Readable, Writable } from 'svelte/store';
	import type { Selectable, SelectableOption } from '$lib/types';
	import { propsIn } from '$lib/utils/predicate';

	export const RADIO_GROUP_CONTEXT_KEY = 'svelte-headless-radio-group';

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
