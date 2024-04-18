<h1> Minimal Viable Product </h1>
<p> </p>

<svelte:head>
	<title>FP2</title>
	<meta name="description" content="FP2 interactive map" />
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;700&display=swap" rel="stylesheet">
</svelte:head>

<script>
    import Slider from './rent_slider.svelte';
    import ColorLegend from './color_legend.svelte';
    import { fetchRentData } from '$lib/index';
    

    let rentValue = 1500;
    let selectedRent = 3000;
    let commuteValue=20;
    let selectedCommute = 1000;

    var rentState = {}; // dictionary to keep track of which neighborhoods have valid rent
    
    // what to color the neighborhoods by
    let rentColor = true;
    let commuteColor = false;

    // slider states
    let rentSlider = true;
    let commuteSlider = null;

    function handleRentEnter() {
        // Store the current value of the rent slider
        selectedRent = rentValue;
        // Make rent slider disappear
        rentSlider = null;
        console.log(selectedRent, rentValue)
    }

    function handleCommuteEnter() {
        // Store the current value of the rent slider
        selectedCommute = commuteValue;
        // Make rent slider disappear
        commuteSlider = null;
        console.log(selectedCommute, commuteValue)
    }


    import '../../../node_modules/mapbox-gl/dist/mapbox-gl.css';
    
    import mapboxgl from 'mapbox-gl';
    // import { Map } from "mapbox-gl";
    import { onMount } from "svelte";
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXB0eXNpbmdlciIsImEiOiJjbHVoanlneWIycm14MmxvZTh2Y3VhYXFkIn0.lkhHKBe-C2_I9v2J-jJ2hg';
    const accessToken = 'pk.eyJ1IjoiZXB0eXNpbmdlciIsImEiOiJjbHVoanlneWIycm14MmxvZTh2Y3VhYXFkIn0.lkhHKBe-C2_I9v2J-jJ2hg';
    let map;
    let mapContainer;
    let lng, lat, zoom;
    lng = -71.06;
    lat = 42.315;
    zoom = 10.5;
    // Define layerId as a reactive variable
    let fillLayerId;
    let lineLayerId;
    let minRent, maxRent;
    let clickedNeighborhood = null;


    onMount(async () => {
        const initialState = { lng: lng, lat: lat, zoom: zoom };

        // get min and max of rent data
        const rents = await fetchRentData();
        minRent = rents.minRent
        maxRent = rents.maxRent
        console.log(minRent)
        console.log(maxRent)

        map = new mapboxgl.Map({
            container: mapContainer,
            accessToken: accessToken,
            style: 'mapbox://styles/mapbox/dark-v10',
            center: [initialState.lng, initialState.lat],
            zoom: initialState.zoom,
        });
        await new Promise(resolve => map.on("load", resolve));

        map.addSource("Boston_Cambridge_Rent", {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/geographic/Boston_Cambridge_rent_ids.geojson',
            generateId: false
        });

        map.addSource("Boston_Cambridge_Commute", {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/transportation/mbta/Boston_Cambridge_commute.geojson',
            generateId: false
        });
        
        fillLayerId = 'boston_cambridge_rent';
        lineLayerId = 'ineligible_region';
        map.addLayer({
            'id': 'boston_cambridge_rent',
            'source': 'Boston_Cambridge_Rent',
            'type': 'fill',
            'paint': {
                'fill-color': 'hsla(135, 100%, 45%, 0.38)'
            },
            'layout': {},
        });
        map.addLayer({
            'id': 'boston_cambridge_rent_outline',
            'source': 'Boston_Cambridge_Rent',
            'type': 'line',
            'paint': {
                'line-color': "hsla(0, 100%, 0%, 0.5)",
                'line-opacity': 0.95
            },
            'layout': {},
        });
        map.on('click', 'boston_cambridge_rent', (e) => {
            if (e.features.length > 0 && rentSlider == null) {
                const feature = e.features[0];
                if (rentState[feature.id]){
                    clickedNeighborhood = feature.properties.neighborhood;
                    commuteSlider = true;
                } else {
                    console.log("you can't click that neighborhood")
                }
                    
                
            }
        });
    });
    

    $: {
        if (map && fillLayerId && rentColor) {
            map.setPaintProperty(fillLayerId, 'fill-color', [
                'case',
                ['>', ['get', 'avg_per_bed'], selectedRent],
                'hsla(0, 80%, 100%, 0.4)',
                [
                    'interpolate',
                    ['linear'],
                    ['get', 'avg_per_bed'],
                    minRent, 'hsla(135, 100%, 90%, 0.8)', // Start of your gradient (e.g., $0)
                    maxRent, 'hsla(135, 100%, 20%, 0.8)' // End of your gradient (e.g., $3000)
                ]
            ]);

            var features = map.querySourceFeatures('Boston_Cambridge_Rent');
            features.forEach(function(feature) {
                var isRentBelowSelected = feature.properties.avg_per_bed < selectedRent;
                if (feature.id !== undefined) {
                    map.setFeatureState({
                    source: 'Boston_Cambridge_Rent',
                    id: feature.id,
                    }, {'valid_rent':isRentBelowSelected});
                    rentState[feature.id] = isRentBelowSelected;
                    }
            });
            
        }
    }


</script>

<div class="map-wrap">
    <div class="map" bind:this={mapContainer} />
</div>

<!-- Sliders and Color Bars -->

<div class="slider-container">
    {#if rentSlider}
        <Slider bind:Value={rentValue} />
        <button on:click={handleRentEnter}>Enter</button>
    {/if}
</div>

<div class="container">
    <ColorLegend color1='hsla(135, 100%, 90%, 1)'
                 color2='hsla(135, 100%, 20%, 1)'
                 title='Average Rent per Bedroom'/>
</div>

<div class="slider-container">
    {#if commuteSlider}
        <Slider bind:Value={commuteValue} label='Maximum commute time (min):' min=0 max=90/>
        <button on:click={handleCommuteEnter}>Enter</button>
    {/if}
</div>

<!-- Pop Ups -->

{#if rentSlider == null && clickedNeighborhood == null}
    <div class='popUp'>
        <p>Shown are the neighborhoods in your price range. Please select one of them.</p>
    </div>
{/if}


{#if clickedNeighborhood}
    <div class='popUp'>
        <p>You've selected to live in <span class="neighborhood-name" style="font-weight: bold; color: hsl(135, 50%, 50%)">{clickedNeighborhood}</span>!</p>
    </div>
{/if}


<style>
    @import url("$lib/global.css"); 

    

    .map {
        position: absolute;
        width: 99%;
        height: 75%;
    }

    .slider-container {
        position: absolute;
        bottom: 20px;
        left: 65%;
        z-index: 1000;
    }

    .popUp {
        position: fixed;   /* Absolute positioning relative to the nearest positioned ancestor */
        bottom: 0;            /* Aligns the container to the bottom */
        left: 0;              /* Aligns the container to the left */
        margin: 20px;         /* Adds some space from the corner edges */
        padding: 5px;        /* Padding inside the container */
        background-color: rgba(255, 255, 255, 0.8); /* Semi-transparent white background */
        border-radius: 8px;   /* Rounded corners for aesthetics */
        font-size: 16px;      /* Adequate font size for visibility */
        box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Subtle shadow for better readability */
        max-width: 400px;     /* Maximum width to avoid overly wide text block */
    }
</style>
