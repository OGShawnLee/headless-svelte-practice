<script>
	import Listbox, {
		ListboxButton,
		ListboxOption,
		ListboxOptions,
	} from '$lib/components/listbox/';
	let value = 'Select your Warrior';
</script>

<h1>Listbox</h1>
<h2>Bound Value</h2>
<strong>Value: {value}</strong>
<p>
	Selecting a button has to change the value. While there is no selected value clicking
	arrow up or arrow down should focus the first item or last ite, otherwise the selected
	button must receive focus.
</p>
<Listbox bind:value let:button let:options>
	<button use:button>{value}</button>
	<div slot="list" use:options>
		<ListboxOption let:checked value="Ricardo Milos">
			{checked} Ricardo Milos
		</ListboxOption>
		<ListboxOption let:checked value="John Xina">
			{checked} John Xina
		</ListboxOption>
		<ListboxOption let:checked value="The Wock">
			{checked} The Wock
		</ListboxOption>
	</div>
</Listbox>

<h2>Initial Value</h2>
<p>
	If the initial value matches one of the options values. This option must be selected
</p>
<Listbox value="John Xina" let:value let:button let:options>
	<button use:button>{value}</button>
	<div slot="list" use:options>
		<ListboxOption let:checked value="Ricardo Milos">Ricardo Milos</ListboxOption>
		<ListboxOption let:checked value="John Xina">John Xina</ListboxOption>
		<ListboxOption let:checked value="The Wock">The Wock</ListboxOption>
	</div>
</Listbox>

<h2>Overriding the Initial Value</h2>
<p>
	If the initial value matches one of the options values, but another option receives the
	boolean prop "selected". That option must be selected and value updated.
</p>
<h3>Issues</h3>
<ol>
	<li>The value is not updated until the list panel is rendered!</li>
</ol>
<Listbox value="John Xina" let:value>
	<ListboxButton>{value}</ListboxButton>
	<ListboxOptions>
		<ListboxOption let:checked value="Ricardo Milos">
			{checked} Ricardo Milos
		</ListboxOption>
		<ListboxOption let:checked value="John Xina">
			{checked} John Xina
		</ListboxOption>
		<ListboxOption let:checked selected value="The Wock">
			{checked} The Wock
		</ListboxOption>
	</ListboxOptions>
</Listbox>
