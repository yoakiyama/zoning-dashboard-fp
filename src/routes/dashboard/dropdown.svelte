<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    // Exports 'options' as a prop and sets a default value if not provided
    export let options = [{ value: 'commute', label: 'Commute Time' }, { value: 'rent', label: 'Rent' }, {value: 'salary', label: 'Salary'}];

    // Reactive variable to hold the selected value
    export let selectedOption = options[0].value;

    export let labelText = 'Color by'

    function handleChange(event) {
        selectedOption = event.target.value;
        dispatch('change', { selectedOption });
    }
</script>

<div class='container'>
    <label for="options">{labelText}</label>
    <select name="options" bind:value={selectedOption} on:change={handleChange}>
        {#each options as option}
            <option value={option.value}>{option.label}</option>
        {/each}
    </select>
</div>

<style>
    .container {
        display: flex;
        align-items: center; /* Aligns the label and select box vertically */
        position: relative;
        z-index: 2000;
        padding-left: 3px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: white;   
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        width: fit-content;
    }

    select {
        padding: 3px;
        margin-left: 4px; /* Provides a small space between the label and the select box */
        height: auto;
        border: 1px solid #ccc;  
        border-radius: 4px;  
        background-color: #fff; 
    }

    label {
        margin-right: 10px; /* Space between the label and the select dropdown */
        color: #333;
    }
</style>
