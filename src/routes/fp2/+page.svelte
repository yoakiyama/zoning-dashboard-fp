<svelte:head>
	<title>FP2</title>
	<meta name="description" content="FP2 interactive map" />
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;700&display=swap" rel="stylesheet">
</svelte:head>

<script>
    import Slider from './rent_slider.svelte';
    import ColorLegend from './color_legend.svelte';
    import { fetchRentData, fetchCommuteData, Dashboard } from '$lib/index';
    import Dropdown from './dropdown.svelte';


    let rentValue = 1500;
    let selectedRent = Infinity;
    let commuteValue=20;
    let selectedCommute = 1000;
    let selectedOption = 'commute';

    var rentState = {}; // dictionary to keep track of which neighborhoods have valid rent
    var commuteState = {}; // dictionary to keep track of which neighborhoods have valid commute

    // what to color the neighborhoods by
    let rentColor = true;
    let commuteColor = false;
    let rentVar = 'avg_per_bed';
    // let rentVarOptions = [{ value: 'avg_per_bed', label: 'Average Per Bedroom' }, { value: '0BR', label: 'Studio' },
    //                      { value: '1BR', label: '1 bedroom' }, { value: '2BR', label: '2 bedrooms' }, { value: '3BR', label: '3 bedrooms' },
    //                      { value: '4BR', label: '4 bedrooms' }, { value: '5BR', label: '5 bedrooms' }, { value: '6BR', label: '6 bedrooms' },
    //                      { value: '7BR', label: '7 bedrooms' }, { value: '8BR', label: '8 bedrooms' }, ];

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

    function toggleTransitVisibility(event) {
        const visible = event.target.checked ? 'visible' : 'none';
        for (const layerId of transitLayers) {
            map.setLayoutProperty(layerId, 'visibility', visible);
        }
    }

    function closePopup() {
        showPopup = false;
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
    let mbtaOutlineLayerId;
    let commuterRailLayerId;
    let commuterRailOutlineLayerId;
    let transitStopsLayerId;

    let transitLayers;
    $: {
        transitLayers = [
            mbtaLayerId,
            mbtaOutlineLayerId,
            commuterRailLayerId,
            commuterRailOutlineLayerId,
        ];
    }



    let minRent, maxRent;
    let minCommute, maxCommute;
    let clickedNeighborhood = null;
    let workingNeighborhood = null;

    let dashboard = false;
    let showPopup = true;


    onMount(async () => {
        const initialState = { lng: lng, lat: lat, zoom: zoom };
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
            data: 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/transportation/mbta/map_layers/Boston_Cambridge_commute.geojson',
            generateId: false
        });
        commuteLayerId = 'boston_cambridge_commute';
        commuteLineLayerId = 'boston_cambridge_commute_outline';
        map.addLayer({
            'id': 'boston_cambridge_commute',
            'source': 'Boston_Cambridge_Commute',
            'type': 'fill',
            'paint': {
                'fill-color': 'hsla(200, 100%, 100%, 0.8)'
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
            data: 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/transportation/mbta/map_layers/routes.geojson',
            generateId: false
        });

        map.addSource("Commuter_Rail_Routes", {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/transportation/mbta/map_layers/MBTA_Commuter_Rail_lines_w_hoods_collapsed.geojson',
            generateId: false
        });

        map.addSource("transit_stops", {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/transportation/mbta/map_layers/mbta_stops.geojson',
            generateId: false
        });

        // white outline of MBTA for emphasis
        mbtaOutlineLayerId = 'mbta_routes_outline'
        map.addLayer({
            'id': 'mbta_routes_outline',
            'source': 'MBTA_Routes',
            'type': 'line',
            'paint': {
                'line-color': 'white',
                'line-opacity': 0,
                'line-width': 4 //
            },
            'layout': {
                'visibility': 'none' //
            },
        });
        mbtaLayerId = 'mbta_routes'
        map.addLayer({
            'id': 'mbta_routes',
            'source': 'MBTA_Routes',
            'type': 'line',
            'paint': {
                'line-color': [
                    'case',
                    ['==', ['get', 'id'], "blue"], '#003DA5',
                    ['==', ['get', 'id'], "red-a"], '#DA291C',
                    ['==', ['get', 'id'], "red-b"], '#DA291C',
                    ['==', ['get', 'id'], "orange"], '#ED8B00',
                    ['==', ['get', 'id'], "sl1"], '#7C878E',
                    ['==', ['get', 'id'], "sl2"], '#7C878E',
                    ['==', ['get', 'id'], "sl4"], '#7C878E',
                    ['==', ['get', 'id'], "sl5"], '#7C878E',
                    ['==', ['get', 'id'], "green-e"], '#00843D',
                    ['==', ['get', 'id'], "green-d"], '#00843D',
                    ['==', ['get', 'id'], "green-c"], '#00843D',
                    ['==', ['get', 'id'], "green-b"], '#00843D',
                    'black'
                ],
                'line-opacity': 0.3,
                'line-width': 2,
            },
            'layout': {'visibility': 'none'},
        });

        // Same as above but for commuter rail lines
        commuterRailOutlineLayerId = "cr_routes_outline"
        map.addLayer({
            'id': commuterRailOutlineLayerId,
            'source': 'Commuter_Rail_Routes',
            'type': 'line',
            'paint': {
                'line-color': 'white',
                'line-opacity': 0,
                'line-width': 4 //
            },
            'layout': {
                'visibility': 'none' //
            },
        });
        commuterRailLayerId = "commuter_rail_routes";
        map.addLayer({
            'id': commuterRailLayerId,
            'source': 'Commuter_Rail_Routes',
            'type': 'line',
            'paint': {
                'line-color': "purple",
                'line-opacity': 0.3,
                'line-width': 2,
            },
            'layout': {'visibility': 'none'},
        });

        transitStopsLayerId = "transit_stops";
        map.addLayer({
            'id': transitStopsLayerId,
            'source': 'transit_stops',
            'type': 'circle',
            'paint': {
                'circle-color': 'white',
                'circle-opacity': 0.3,
                'circle-radius': 5 ,
                'circle-stroke-color': 'black',
                'circle-stroke-width': 1,
                'circle-stroke-opacity': 0.3,
            },
            'layout': {'visibility': 'none'},
        });


        // When clicking on map colored by rent
        map.on('click', 'boston_cambridge_rent', (e) => {
            if (e.features.length > 0 && rentSlider == null && !dashboard) {
                const feature = e.features[0];
                if (rentState[feature.id]){
                    clickedNeighborhood = feature.properties.neighborhood;
                    commuteSlider = true;

                    // change from rent layers visible to commute layers visible
                    // make MBTA lines visible
                    rentColor = false;
                    commuteColor = true;
                    colorbyCommute()
                } else {
                    console.log("you can't click that neighborhood")
                }
                console.log(clickedNeighborhood)


            }
        });

        // When clicking on map colored by commute
        map.on('click', 'boston_cambridge_commute', (e) => {
            // NARRATIVE MODE
            if (e.features.length > 0 && commuteSlider == null && !dashboard) {
                const feature = e.features[0];
                if (commuteState[feature.id]){
                    workingNeighborhood = feature.properties.neighborhood;
                    commuteSlider = null;
                    console.log(workingNeighborhood);
                    selectedRent = Infinity;
                    selectedCommute = 200;
                    dashboard = true;
                } else {
                    console.log("you can't click that neighborhood")
                }
            } else if (e.features.length > 0 && dashboard) { // DASHBOARD MODE
                const feature = e.features[0];
                if (commuteState[feature.id]){
                    clickedNeighborhood = feature.properties.neighborhood
                }
            }
        });
    });

    // DASHBOARD FEATURE: user selects feature to color by
    function updateMapColoring(event) {
        const option = event.detail.selectedOption;
        console.log(option)
        if (map) {
            if (option === 'rent') {
                console.log(selectedRent);
                colorbyRent();
                commuteColor=false;
                rentColor=true;
            } else if (option === 'commute') {
                console.log(selectedCommute);
                colorbyCommute();
                commuteColor=true;
                rentColor=false;
            }
        }
    }

    // DASHBOARD FEATURE: user chooses rent var
    function updateRentVar(event) {
        const option = event.detail.selectedOption;
        rentVar = option;
        console.log(rentVar)
    }

    function colorbyRent() {
        map.setLayoutProperty(fillLayerId, 'visibility', 'visible');
        map.setLayoutProperty(lineLayerId, 'visibility', 'visible');
        map.setLayoutProperty(commuteLayerId, 'visibility', 'none');
        map.setLayoutProperty(commuteLineLayerId, 'visibility', 'none');
        for (const layerId of transitLayers) {
            map.setLayoutProperty(layerId, 'visibility', 'none');
        }
        map.setLayoutProperty(transitStopsLayerId, 'visibility', 'none');

    }

    function colorbyCommute() {
        map.setLayoutProperty(fillLayerId, 'visibility', 'none');
        map.setLayoutProperty(lineLayerId, 'visibility', 'none');
        map.setLayoutProperty(commuteLayerId, 'visibility', 'visible');
        map.setLayoutProperty(commuteLineLayerId, 'visibility', 'visible');
        for (const layerId of transitLayers) {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        }
        map.setLayoutProperty(transitStopsLayerId, 'visibility', 'visible');
    }


    // Coloring of neighborhoods by rent after selecting rent
    $: {
        if (map && fillLayerId && rentColor) {
                    map.setPaintProperty(fillLayerId, 'fill-color', [
                        'case',
                        ['>', ['get', rentVar], selectedRent],
                        'hsla(0, 80%, 100%, 0.4)',
                        [
                            'interpolate',
                            ['linear'],
                            ['get', rentVar],
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

    // Coloring of neighborhoods by commute conditional on clicked neighborhood and selected commute time
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
                    for (const layerId of transitLayers) {
                        map.setPaintProperty(layerId, 'line-opacity', [
                            'case',
                            ['in', clickedNeighborhood, ['get', 'neighborhoods']], 0.8,  // High opacity if clickedNeighborhood is in the list
                            0.3
                        ]);
                    }
                    map.setPaintProperty(transitStopsLayerId, 'circle-opacity', [
                            'case',
                            ['==', clickedNeighborhood, ['get', 'neighborhood']], 0.8,  // High opacity if clickedNeighborhood is in the list
                            0.3
                    ]);
                    map.setPaintProperty(transitStopsLayerId, 'circle-stroke-opacity', [
                            'case',
                            ['==', clickedNeighborhood, ['get', 'neighborhood']], 0.8,  // High opacity if clickedNeighborhood is in the list
                            0.3
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

<h1> Minimal Viable Product </h1>
<p> </p>

<div class="map-wrap">
    <div class="map" bind:this={mapContainer} />
</div>

<!-- Sliders and Color Bars -->
{#if rentSlider}
    <div class="slider-container">
            <Slider bind:Value={rentValue} sliderColor='hsl(135, 40%, 50%)'/>
            <button on:click={handleRentEnter}>Enter</button>
    </div>
{/if}

{#if rentColor}
    <div class="container">
        <ColorLegend color1='hsla(135, 100%, 90%, 1)'
                    color2='hsla(135, 100%, 20%, 1)'
                    title='Average Rent per Bedroom'/>
    </div>
{/if}

{#if commuteSlider}
    <div class="slider-container">
            <Slider bind:Value={commuteValue} label='Maximum commute time (min):' min={minCommute} max={maxCommute} sliderColor='hsl(200, 50%, 50%)'/>
            <button on:click={handleCommuteEnter}>Enter</button>
    </div>
{/if}

{#if commuteColor}
    <div class="container">
        <ColorLegend color1='hsla(200, 100%, 100%, 1)'
                    color2='hsla(200, 100%, 20%, 1)'
                    title='Average Commute Time from {clickedNeighborhood} (minutes)'/>
    </div>
{/if}

<!-- Map Display Options -->
{#if commuteColor || dashboard}
    <div class="wrapper">
        {#if dashboard}
            <div class="dropdownContainer">
                <Dropdown bind:selected={selectedOption} on:change={updateMapColoring} />
            </div>
        {/if}
        <!--
        {#if dashboard && rentColor}
            <div class="dropdownContainer">
                <Dropdown bind:selected={selectedOption} on:change={updateRentVar} options={rentVarOptions} labelText='Rent Variable:'/>
            </div>
        {/if} -->
        {#if commuteColor}
            <div class="checkboxContainer">
                <label style="color: white">
                    <input type="checkbox" id="MBTAtoggle" checked on:change={toggleTransitVisibility}>
                    Show/Hide MBTA Routes
                </label>
            </div>
        {/if}
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
        <p>You've selected to live in <span class="neighborhood-name" style="font-weight: bold; color: hsl(135, 40%, 50%)">{clickedNeighborhood}</span>!</p>
    </div>
{/if}

{#if clickedNeighborhood && commuteSlider == null && workingNeighborhood == null}
    <div class='popUp'>
        <p>Shown are the neighborhoods in your commute range. Please select one of them.</p>
    </div>
{/if}

{#if workingNeighborhood}
    <div class='popUp'>
        <p style="position:relative;">You've selected to live in <span class="neighborhood-name" style="font-weight: bold; color: hsl(135, 40%, 50%)">{clickedNeighborhood}</span> and to
            work in <span class="neighborhood-name" style="font-weight: bold; color: hsl(200, 50%, 50%)">{workingNeighborhood}</span>!</p>
    </div>
{/if}

{#if dashboard && showPopup}
    <div class='instruction'>
        <button class="closeButton" on:click={closePopup}>X</button>
        <p>
            <span class="neighborhood-name" style="font-weight: bold;">Welcome to the dashboard!</span> You can now explore all the rent and commute data on your own by selecting what to color the map by.
            When colored by commute time, <span style="text-decoration: underline; font-style: italic;">click</span> on different neighborhoods to get commute time <span style="text-decoration: underline; font-style: italic;">from</span> that neighborhood.
        </p>
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
    .instruction {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        padding: 20px;
        background-color: rgba(255, 255, 255, 0.95); /* Less transparent white background */
        border-radius: 8px;
        max-width: 400px;
        width: 90%; /* Maximum width or percentage-based width */
        box-sizing: border-box;
        text-align: left;
    }

    .closeButton {
        position: absolute;
        top: 5px; /* Adjust as needed */
        left: 5px; /* Adjust as needed */
        background-color: transparent; /* Transparent background */
        padding: 0.5em; /* Space around the 'X' */
        cursor: pointer;
        color: #333; /* Color for the 'X', can be adjusted */
        display: flex;
        border: none;
        font-size: 20px;
        width: 30px; /* Width of the button */
        height: 30px; /* Height of the button */
        transition: background-color 0.2s, color 0.2s; /* Transition for hover effect */
    }

    .closeButton:hover,
    .closeButton:focus {
        font-weight: bold;
        color: #d9534f;
        outline: none;
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
    .checkboxContainer {
        position: relative; /* or 'absolute' if needed */
        z-index: 1000; /* higher than the map's z-index */
    }

    input[type='checkbox'] {
        accent-color: hsl(200, 50%, 50%);
    }

    .wrapper {
        position: fixed;
        top: 5rem;
        left: 0.3rem;
        margin: 0px;
        width: 300px;
        text-align: left;
        margin-top: 15px;
        padding-left: 15px;
    }

    .checkboxContainer, .dropdownContainer {
        margin-bottom: 5px; /* Adds space between the checkbox and dropdown */
        width: 100%; /* Ensures children stretch to match the wrapper's width */
    }

</style>
