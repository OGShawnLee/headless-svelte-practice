<script lang="ts">
	import type { Unsubscriber } from 'svelte/store';
	import { getContext, hasContext, onDestroy } from 'svelte';
	import { isRadioGroupContext, RADIO_GROUP_CONTEXT_KEY } from './Group.svelte';
	import { isRadioOptionContext, RADIO_GROUP_OPTION_CONTEXT_KEY } from './Option.svelte';

	const hasGroupContext = hasContext(RADIO_GROUP_CONTEXT_KEY);
	const hasOptionContext = hasContext(RADIO_GROUP_OPTION_CONTEXT_KEY);

	let descriptionName: string | undefined;
	let stopGroupName: Unsubscriber | undefined;

	if (hasGroupContext && !hasOptionContext) {
		const GroupContext = getContext(RADIO_GROUP_CONTEXT_KEY);
		if (!isRadioGroupContext(GroupContext))
			throw new Error('Invalid Radio Group Context');

		const { isUsingLabel, GroupName } = GroupContext;
		isUsingLabel.set(true);
		stopGroupName = GroupName.subscribe((value) => {
			descriptionName = `${value}-description`;
		});
	}

	let stopDescriptionName: Unsubscriber | undefined;
	if (hasOptionContext) {
		const OptionContext = getContext(RADIO_GROUP_OPTION_CONTEXT_KEY);
		if (!isRadioOptionContext(OptionContext))
			throw new Error('Invalid Radio Group Option Context');

		const { isUsingDescription, OptionDescriptionName } = OptionContext;
		isUsingDescription.set(true);
		stopDescriptionName = OptionDescriptionName.subscribe((name) => {
			descriptionName = name;
		});
	}

	onDestroy(() => {
		if (stopGroupName) stopGroupName();
		if (stopDescriptionName) stopDescriptionName();
	});
</script>

<div id={descriptionName}>
	<slot />
</div>
