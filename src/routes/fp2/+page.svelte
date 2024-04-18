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
    import { fetchRentData, fetchCommuteData } from '$lib/index';
    

    let rentValue = 1500;
    let selectedRent = 3000;
    let commuteValue=20;
    let selectedCommute = 1000;

    var rentState = {}; // dictionary to keep track of which neighborhoods have valid rent
    var commuteState = {}; // dictionary to keep track of which neighborhoods have valid commute
    
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
    let commuteLayerId;
    let commuteLineLayerId;
    let mbtaLayerId;
    let minRent, maxRent;
    let minCommute, maxCommute;
    let clickedNeighborhood = null;
    let workingNeighborhood = null;


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

        // ADD RENT LAYER
        map.addSource("Boston_Cambridge_Rent", {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/geographic/Boston_Cambridge_rent_ids.geojson',
            generateId: false
        });
        
        fillLayerId = 'boston_cambridge_rent';
        lineLayerId = 'boston_cambridge_rent_outline';
        map.addLayer({
            'id': 'boston_cambridge_rent',
            'source': 'Boston_Cambridge_Rent',
            'type': 'fill',
            'paint': {
                'fill-color': 'hsla(135, 100%, 45%, 0.38)'
            },
            'layout': {'visibility': 'visible'},
        });
        map.addLayer({
            'id': 'boston_cambridge_rent_outline',
            'source': 'Boston_Cambridge_Rent',
            'type': 'line',
            'paint': {
                'line-color': "hsla(0, 100%, 0%, 0.5)",
                'line-opacity': 0.95
            },
            'layout': {'visibility': 'visible'},
        });

        // ADD COMMUTE LAYER
        map.addSource("Boston_Cambridge_Commute", {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/transportation/mbta/Boston_Cambridge_commute.geojson',
            generateId: false
        });
        commuteLayerId = 'boston_cambridge_commute';
        commuteLineLayerId = 'boston_cambridge_commute_outline';
        map.addLayer({
            'id': 'boston_cambridge_commute',
            'source': 'Boston_Cambridge_Commute',
            'type': 'fill',
            'paint': {
                'fill-color': 'hsla(400, 100%, 45%, 0.38)'
            },
            'layout': {'visibility': 'none'},
        });
        map.addLayer({
            'id': 'boston_cambridge_commute_outline',
            'source': 'Boston_Cambridge_Commute',
            'type': 'line',
            'paint': {
                'line-color': "hsla(0, 100%, 0%, 0.5)",
                'line-opacity': 0.95
            },
            'layout': {'visibility': 'none'},
        });
        
        // ADD MBTA ROUTE LINES
        map.addSource("MBTA_Routes", {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/transportation/mbta/routes.geojson',
            generateId: false
        });
        mbtaLayerId = 'mbta_routes'
        map.addLayer({
            'id': 'mbta_routes',
            'source': 'MBTA_Routes',
            'type': 'line',
            'paint': {
                'line-color': [
                    'case',
                    ['==', ['get', 'id'], "blue"], 'blue', 
                    ['==', ['get', 'id'], "red-a"], 'red',  
                    ['==', ['get', 'id'], "red-b"], 'red', 
                    ['==', ['get', 'id'], "orange"], 'orange',  
                    ['==', ['get', 'id'], "sl1"], 'gray',    
                    ['==', ['get', 'id'], "sl2"], 'gray',  
                    ['==', ['get', 'id'], "sl4"], 'gray',    
                    ['==', ['get', 'id'], "sl5"], 'gray',  
                    ['==', ['get', 'id'], "green-e"], 'green',  
                    ['==', ['get', 'id'], "green-d"], 'green', 
                    ['==', ['get', 'id'], "green-c"], 'green', 
                    ['==', ['get', 'id'], "green-b"], 'green', 
                    'black'                       
                ],
                'line-opacity': 0.95,
                'line-width':2,
            },
            'layout': {'visibility': 'none'},
        });

        map.on('click', 'boston_cambridge_rent', (e) => {
            if (e.features.length > 0 && rentSlider == null) {
                const feature = e.features[0];
                if (rentState[feature.id]){
                    clickedNeighborhood = feature.properties.neighborhood;
                    commuteSlider = true;

                    // change from rent layers visible to commute layers visible
                    // make MBTA lines visible
                    rentColor = false;
                    commuteColor = true;
                    map.setLayoutProperty(fillLayerId, 'visibility', 'none');
                    map.setLayoutProperty(lineLayerId, 'visibility', 'none');
                    map.setLayoutProperty(commuteLayerId, 'visibility', 'visible');
                    map.setLayoutProperty(commuteLineLayerId, 'visibility', 'visible');
                    map.setLayoutProperty(mbtaLayerId, 'visibility', 'visible');
                } else {
                    console.log("you can't click that neighborhood")
                }
                    
                
            }
        });

        map.on('click', 'boston_cambridge_commute', (e) => {
            if (e.features.length > 0 && commuteSlider == null) {
                const feature = e.features[0];
                if (commuteState[feature.id]){
                    workingNeighborhood = feature.properties.neighborhood;
                    commuteSlider = null;
                    console.log(workingNeighborhood)
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

    $: {
        if (map && commuteLayerId && commuteColor) {
            (async () => {
                try {
                    const commutes = await fetchCommuteData(clickedNeighborhood);
                    minCommute = commutes.minCommute;
                    maxCommute = commutes.maxCommute;

                    map.setPaintProperty(commuteLayerId, 'fill-color', [
                        'case',
                        ['==', ['get', clickedNeighborhood], 180],
                        'hsla(0, 80%, 100%, 0.4)', // Placeholder for NaN, no commute time data so greyed out
                        ['case', 
                        ['>', ['get', clickedNeighborhood], selectedCommute],
                        'hsla(0, 80%, 100%, 0.4)', [
                            'interpolate',
                            ['linear'],
                            ['get', clickedNeighborhood],
                            minCommute, 'hsla(200, 100%, 100%, 0.8)', 
                            maxCommute, 'hsla(200, 100%, 20%, 0.8)' 
                        ]]
                    ]);

                    var features = map.querySourceFeatures('Boston_Cambridge_Commute');
                    features.forEach(function(feature) {
                        var isCommuteBelowSelected = feature.properties[clickedNeighborhood] <= selectedCommute;
                        if (feature.id !== undefined) {
                            map.setFeatureState({
                            source: 'Boston_Cambridge_Commute',
                            id: feature.id,
                            }, {'valid_commute':isCommuteBelowSelected});
                            commuteState[feature.id] = isCommuteBelowSelected;
                            }
                    });
                } catch (error) {
                    console.error('Error processing commute data:', error);
                }
            })();
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

{#if rentColor}
    <div class="container">
        <ColorLegend color1='hsla(135, 100%, 90%, 1)'
                    color2='hsla(135, 100%, 20%, 1)'
                    title='Average Rent per Bedroom'/>
    </div>
{/if}

<div class="slider-container">
    {#if commuteSlider}
        <Slider bind:Value={commuteValue} label='Maximum commute time (min):' min={minCommute} max={maxCommute}/>
        <button on:click={handleCommuteEnter}>Enter</button>
    {/if}
</div>

{#if commuteColor}
    <div class="container">
        <ColorLegend color1='hsla(200, 100%, 100%, 1)'
                    color2='hsla(200, 100%, 20%, 1)'
                    title='Average Commute Time from {clickedNeighborhood} (minutes)'/>
    </div>
{/if}

<!-- POP UPS -->

{#if rentSlider == null && clickedNeighborhood == null}
    <div class='popUp'>
        <p>Shown are the neighborhoods in your price range. Please select one of them.</p>
    </div>
{/if}


{#if clickedNeighborhood && commuteSlider}
    <div class='popUp'>
        <p>You've selected to live in <span class="neighborhood-name" style="font-weight: bold; color: hsl(135, 50%, 50%)">{clickedNeighborhood}</span>!</p>
    </div>
{/if}

{#if clickedNeighborhood && commuteSlider == null && workingNeighborhood == null}
    <div class='popUp'>
        <p>Shown are the neighborhoods in your commute range. Please select one of them.</p>
    </div>
{/if}

{#if workingNeighborhood}
    <div class='popUp'>
        <p>You've selected to live in <span class="neighborhood-name" style="font-weight: bold; color: hsl(135, 50%, 50%)">{clickedNeighborhood}</span> and to
            work in <span class="neighborhood-name" style="font-weight: bold; color: hsl(200, 50%, 50%)">{workingNeighborhood}</span>!</p>
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
