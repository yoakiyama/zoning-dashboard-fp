<script>
	// Parameters for the slider
	export let rentValue = 1500;
    export let maxRent = 2000;
    export let minRent = 0;

</script>

<div class="slider-container">
	<label for="rent-slider">Maximum spending on rent: </label>
	<input type=range bind:value={rentValue} min={minRent} max={maxRent} name='rent-slider'>
	<span>{ rentValue }</span>
</div>

<style>
	.slider-container {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 20%;
		background-color: white;
		padding: 20px;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
	}
	input[type="range"]{
		width: 100%;
	}
	span {
		display: inline-block;
		padding: 0 .4em;
		border-radius: .3em;
		background: oklch(95% 2% 200);
	}
</style>