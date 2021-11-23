<script lang="ts">
	import Tab, { TabList, TabPanel, TabGroup, TabPanels } from '$lib/components/tabs';

	let numOTabs = 5;
	$: tabs = [...Array(numOTabs).keys()];

	let [manual, toggleManual] = [false, () => (manual = !manual)];
	let [vertical, toggleVertical] = [false, () => (vertical = !vertical)];

	let [showing, toggleShowing] = [true, () => (showing = !showing)];

	let index = 4;
</script>

<button class:active={manual} on:click={toggleManual}>Manual</button>
<button class:active={vertical} on:click={toggleVertical}>Vertical</button>

<input type="number" min="0" max="6" bind:value={numOTabs} />

<button on:click={toggleShowing}> Show </button>
{#if showing}
	<TabGroup {manual} {vertical}>
		<TabList>
			{#each tabs as idx}
				<Tab activeClass="active" let:selected>Tab {idx} {selected}</Tab>
			{/each}
		</TabList>
		<TabPanels>
			{#each tabs as idx}
				<TabPanel>Panel {idx}</TabPanel>
			{/each}
		</TabPanels>
	</TabGroup>
{/if}

<h2>Binding to Index Value</h2>
{index}
<input type="number" min="0" max="5" bind:value={index} />
<TabGroup bind:index {manual} {vertical} onChange={console.log}>
	<TabList>
		{#each tabs as idx}
			<Tab activeClass="active">Tab {idx}</Tab>
		{/each}
	</TabList>
	<TabPanels>
		{#each tabs as idx}
			<TabPanel>Panel {idx}</TabPanel>
		{/each}
	</TabPanels>
</TabGroup>

<button>External</button>

<style>
	:global(.active) {
		color: green;
	}

	:global(.unactive) {
		color: red;
	}
</style>
