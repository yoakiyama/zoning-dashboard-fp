<script>
	export let color1 = 'hsla(135, 100%, 80%, 1)';
	export let color2 = 'hsla(135, 100%, 20%, 1)';
	export let degString = '90deg';
    export let title = 'Average Rent per Bedroom';
</script>

<div class="container">
    <p class="text-label">{title}</p>
    <div class="colorbar-container"
        style="
            --deg: {degString};
            --gradient-1: {color1};
            --gradient-2: {color2};
        "
    ></div>
</div>

<style>
	.container {
        /* position: fixed;
        top: 5rem;
        right: 0.3rem; */
        margin: 5px;
        width: 200px;
        text-align: center;
    }

    .colorbar-container {
		/* position: relative; */
		width: 100%;
		height: 30px;
		background: linear-gradient(var(--deg), var(--gradient-1), var(--gradient-2));
	}

	.text-label {
		font-size: 16px;
		color: white;
	}
</style>
