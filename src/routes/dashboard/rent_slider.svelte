<script>
    import { onMount } from 'svelte';

    // Parameters for the slider
    export let Value = 1500;
    export let max = 2000;
    export let min = 0;
    export let step = 10;
    export let label = 'Maximum spending on rent (per bedroom):';
	export let sliderColor = 'hsl(260, 40%, 50%)'

    onMount(() => {
        document.documentElement.style.setProperty('--sliderColor', sliderColor);
    });
</script>


<div class="slider-container">
	<label for="rent-slider">{label}</label>
	<input type=range bind:value={Value} min={min} max={max} step={step} name='rent-slider' class='slider'>
	<span>{ Value }</span>
</div>

<style>
	.slider-container {
		/* position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 20%; */
		background-color: rgba(255, 255, 255, 0.9);
		padding: 20px;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		font-size: 18px;
	}
	input[type="range"]{
		width: 100%;
		cursor: pointer;
	}

	.slider {
	-webkit-appearance: none;
	appearance: none;
	width: 100%;
	cursor: pointer;
	outline: none;
	/*  slider progress trick  */
	overflow: hidden;
	border-radius: 16px;
	}

	/* Track: webkit browsers */
	.slider::-webkit-slider-runnable-track {
	height: 12px;
	background: oklch(90% 2% 200);
	border-radius: 16px;
	}

	/* Track: Mozilla Firefox */
	.slider::-moz-range-track {
	height: 12px;
	background: oklch(90% 2% 200);
	border-radius: 16px;
	}

	/* Thumb: webkit */
	.slider::-webkit-slider-thumb {
	/* removing default appearance */
	-webkit-appearance: none;
	appearance: none;
	/* creating a custom design */
	height: 12px;
	width: 12px;
	background-color: #fff;
	border-radius: 50%;
	border: 2px solid var(--sliderColor);
	/*  slider progress trick  */
	box-shadow: -407px 0 0 400px var(--sliderColor);
	}


	/* Thumb: Firefox */
	.slider::-moz-range-thumb {
	height: 15px;
	width: 15px;
	background-color: #fff;
	border-radius: 50%;
	border: 1px solid var(--sliderColor);
	/*  slider progress trick  */
	box-shadow: -407px 0 0 400px var(--sliderColor);
	}


	span {
		display: inline-block;
		padding: 0 .4em;
		border-radius: .3em;
		background: oklch(90% 2% 200);
	}
</style>