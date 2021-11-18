<script>
	import RadioGroup, {
		RadioGroupOption,
		RadioGroupLabel,
		RadioGroupDescription,
	} from '$lib/components/radio-group';
	let value = 'The Wock';
</script>

<h2>Horizontal Radio Group</h2>
<strong>Value : {value}</strong>
<p>
	Navigating with the keyboard or clicking on an option should update the value The active
	class should only be applied if the option is checked. If an option is marked as
	selected it must be selected.
</p>
<RadioGroup class="group" horizontal bind:value>
	<RadioGroupLabel class="jet-mono">Choose a Warrior</RadioGroupLabel>
	<RadioGroupOption class="option" activeClass="active" value="Ricardo Milos">
		<RadioGroupLabel class="jet-mono">The Ultimate Chad</RadioGroupLabel>
		<RadioGroupDescription class="jet-mono">
			A Powerful Brazilian Dancer
		</RadioGroupDescription>
		Ricardo Milos
	</RadioGroupOption>
	<RadioGroupOption class="option" activeClass="active" value="The Wock">
		<RadioGroupLabel>Social Credit Grinder</RadioGroupLabel>
		The Wock
	</RadioGroupOption>
	<RadioGroupOption class="option" activeClass="active" selected value="John Xina">
		<RadioGroupLabel>China Invisible Westler</RadioGroupLabel>
		John Xina
	</RadioGroupOption>
</RadioGroup>

<h2>Automatic Selection</h2>
<p>If the initialValue matches one of the options it should be automatically selected</p>
<RadioGroup value="Xiaomi MI 20" let:value>
	{value}
	<RadioGroupOption value="Samsung Galaxy S20" activeClass="active">
		Samsung Galaxy S20
	</RadioGroupOption>
	<RadioGroupOption value="iPhone 12" activeClass="active">iPhone 12</RadioGroupOption>
	<RadioGroupOption value="Xiaomi MI 20" activeClass="active">
		Xiaomi MI 20
	</RadioGroupOption>
</RadioGroup>

<style>
	:global(.jet-mono) {
		font-family: 'Jet Brains Mono', Quicksand, sans-serif;
	}

	:global(.group) {
		display: flex;
		gap: 2.5rem;
	}

	:global(.option) {
		padding: 1.25rem;
		border-radius: 0.75rem;
		box-shadow: 2.5px 2.5px 5px rgba(0, 0, 0, 0.15);
	}

	:global(.active) {
		color: green;
	}
</style>
