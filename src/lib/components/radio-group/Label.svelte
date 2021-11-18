<script lang="ts">
	import type { Unsubscriber } from 'svelte/store';
	import { getContext, hasContext, onDestroy } from 'svelte';
	import { isRadioGroupContext, RADIO_GROUP_CONTEXT_KEY } from './Group.svelte';
	import { isRadioOptionContext, RADIO_GROUP_OPTION_CONTEXT_KEY } from './Option.svelte';
	import { useSubscribers } from '$lib/utils';

	const hasGroupContext = hasContext(RADIO_GROUP_CONTEXT_KEY);
	const hasOptionContext = hasContext(RADIO_GROUP_OPTION_CONTEXT_KEY);

	let optionName: string | undefined;
	let labelName: string | undefined;
	let stopGroupName: Unsubscriber | undefined;

	if (hasGroupContext && !hasOptionContext) {
		const GroupContext = getContext(RADIO_GROUP_CONTEXT_KEY);
		if (!isRadioGroupContext(GroupContext))
			throw new Error('Invalid Radio Group Context');

		const { isUsingLabel, GroupName } = GroupContext;
		isUsingLabel.set(true);
		stopGroupName = GroupName.subscribe((value) => {
			optionName = value;
			labelName = `${value}-label`;
		});
	}

	let stopOptionName: Unsubscriber | undefined;
	if (hasOptionContext) {
		const OptionContext = getContext(RADIO_GROUP_OPTION_CONTEXT_KEY);
		if (!isRadioOptionContext(OptionContext))
			throw new Error('Invalid Radio Group Option Context');

		const { isUsingLabel, OptionName, OptionLabelName } = OptionContext;
		isUsingLabel.set(true);
		stopOptionName = useSubscribers(
			OptionName.subscribe((name) => (optionName = name)),
			OptionLabelName.subscribe((name) => {
				labelName = name;
			})
		);
	}

	onDestroy(() => {
		if (stopGroupName) stopGroupName();
		if (stopOptionName) stopOptionName();
	});
</script>

<label id={labelName} for={optionName}>
	<slot />
</label>
