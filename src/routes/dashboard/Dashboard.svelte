
<svelte:head>
	<title>FP2</title>
	<meta name="description" content="FP2 interactive map" />
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdn.plot.ly/plotly-latest.min.js" type="text/javascript"></script>
</svelte:head>

<script>
    import Slider from './rent_slider.svelte';
    import ColorLegend from './color_legend.svelte';
    import { legend, fetchRentData, fetchCommuteData, fetchRentByBedData, Dashboard } from '$lib/index';
    import Dropdown from './dropdown.svelte';
    // import { Plotly } from 'plotly.js-dist';

    import * as d3 from "d3";
    import '../../../node_modules/mapbox-gl/dist/mapbox-gl.css';

    import mapboxgl from 'mapbox-gl';
    import { onMount } from "svelte";

    mapboxgl.accessToken = 'pk.eyJ1IjoiZXB0eXNpbmdlciIsImEiOiJjbHVoanlneWIycm14MmxvZTh2Y3VhYXFkIn0.lkhHKBe-C2_I9v2J-jJ2hg';
    const accessToken = 'pk.eyJ1IjoiZXB0eXNpbmdlciIsImEiOiJjbHVoanlneWIycm14MmxvZTh2Y3VhYXFkIn0.lkhHKBe-C2_I9v2J-jJ2hg';
    let map;
    let mapContainer;
    let lng, lat, zoom;
    lng = -71.06;
    lat = 42.315;
    zoom = 10.5;

    let rentSourceId = "boston_cambridge_rent";
    let rentLoaded = false;
    let rentData = [];
    let numRentDataPoints;

    let salaryData = [];
    let salaryPlotElement = null;
    let colorLegendElement = null;
    let colorLegendTitleElement = null;

    // Layer IDs
    let rentFillLayerId;
    let rentOutlineLayerId;
    let commuteLayerId;
    let commuteLineLayerId;
    let salaryLayerId;
    let salaryLineLayerId;
    let salarySourceId = "boston_cambridge_salary";

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

    // State variables
    let minRent, maxRent;
    let minCommute, maxCommute;
    let clickedNeighborhood = null;
    let workingNeighborhood = null;
    let maxRentAll = 9500
    let minRentAll = 0;
    let minSalary, maxSalary;

    let dashboard = false;
    let showPopup = true;
    let showSidePanel = false;

    let rentByBed = null;

    let rentValue = 1500;
    let selectedRent = 6000;
    let commuteValue = 20;
    let selectedCommute = 1000;
    let selectedOption = 'commute';
    let selectedSalary = 50

    var rentState = {}; // dictionary to keep track of which neighborhoods have valid rent
    var commuteState = {}; // dictionary to keep track of which neighborhoods have valid commute
    var salaryState = {};
    for (var i = 1; i <= 36; i++) {
        salaryState[i.toString()] = true;
    }

    // what to color the neighborhoods by
    let rentColor = true;
    let commuteColor = false;
    let salaryColor = false;
    let rentVar = 'avg_per_bed';

    // slider states
    let rentSlider = true;
    let commuteSlider = null;

    let mapWidth = "100%";
    let sidebarWidth = "0%";
    let rentBarPlotWidth = "25%";

    // Color values
    // let rentMinColor = 'hsla(135, 100%, 90%, 0.8)';
    // let rentMaxColor = 'hsla(135, 100%, 20%, 0.8)';
    let rentMinColor = 'hsla(260, 100%, 90%, 0.8)';
    let rentMaxColor = 'hsla(260, 100%, 20%, 0.8)';
    let commuteMinColor = 'hsla(200, 100%, 100%, 0.8)';
    let commuteMaxColor = 'hsla(200, 100%, 20%, 0.8)';
    let salaryMinColor = 'hsla(30, 100%, 90%, 0.8)';
    let salaryMaxColor = 'hsla(30, 100%, 30%, 0.8)';
    let defaultOutlineColor = "hsla(0, 100%, 0%, 0.5)";
    let workingOutlineColor = "hsla(200, 900%, 30%, 0.7)";
    let livingOutlineColor = 'hsla(260, 90%, 30%, 0.7)'; //"hsla(25, 100%, 50%, 0.5)";
    let unavailableColor =  'hsla(0, 80%, 100%, 0.4)'; // Color for unavailable regions given current selections

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
        map.setLayoutProperty(transitStopsLayerId, 'visibility', visible);
    }

    function closePopup() {
        showPopup = false;
    }


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
        map.addSource(rentSourceId, {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/geographic/Boston_Cambridge_rent_ids.geojson',
            generateId: false
        });
        // Update this if the datasource changes, seems to be only easy way to
        // verify the entire dataset is loaded.
        numRentDataPoints = 103;

        rentFillLayerId = 'boston_cambridge_rent';
        rentOutlineLayerId = 'boston_cambridge_rent_outline';
        map.addLayer({
            'id': rentFillLayerId,
            'source': rentSourceId,
            'type': 'fill',
            'paint': {
                // 'fill-color': 'hsla(135, 100%, 45%, 0.38)'
                'fill-color': 'hsla(260, 100%, 45%, 0.38)'
            },
            'layout': {'visibility': 'visible'},
        });
        map.addLayer({
            'id': rentOutlineLayerId,
            'source': rentSourceId,
            'type': 'line',
            'paint': {
                'line-color': defaultOutlineColor,
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
            'id': commuteLayerId,
            'source': 'Boston_Cambridge_Commute',
            'type': 'fill',
            'paint': {
                'fill-color': 'hsla(200, 100%, 100%, 0.8)'
            },
            'layout': {'visibility': 'none'},
        });
        map.addLayer({
            'id': commuteLineLayerId,
            'source': 'Boston_Cambridge_Commute',
            'type': 'line',
            'paint': {
                'line-color': defaultOutlineColor,
                'line-opacity': 0.95
            },
            'layout': {'visibility': 'none'},
        });

        // ADD MBTA ROUTE LINES

        map.addSource("MBTA_Routes", {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/transportation/mbta/map_layers/MBTA_Systemwide_GTFS_Map.with_hoods.dissolved.geojson',
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
            'id': mbtaOutlineLayerId,
            'source': 'MBTA_Routes',
            'type': 'line',
            'filter': [
                '!', ['in', ['get', 'id'], ['literal', ["sl1", "sl2", "sl4", "sl5"]]],
            ],
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
            'id': mbtaLayerId,
            'source': 'MBTA_Routes',
            'type': 'line',
            'paint': {
                'line-color': [
                    'case',
                    ['==', ['get', 'route_id'], "Blue"], '#003DA5',
                    ['==', ['get', 'route_id'], "Red"], '#DA291C',
                    ['==', ['get', 'route_id'], "Mattapan"], '#DA291C',
                    ['==', ['get', 'route_id'], "Orange"], '#ED8B00',
                    ['==', ['get', 'route_id'], "Green-B"], '#00843D',
                    ['==', ['get', 'route_id'], "Green-C"], '#00843D',
                    ['==', ['get', 'route_id'], "Green-D"], '#00843D',
                    ['==', ['get', 'route_id'], "Green-E"], '#00843D',
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
                'circle-radius': 3 ,
                'circle-stroke-color': 'black',
                'circle-stroke-width': 1,
                'circle-stroke-opacity': 0.3,
            },
            'layout': {'visibility': 'none'},
        });

        // ADD SALARY LAYER
        map.addSource(salarySourceId, {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/employment_opportunities/Boston_Cambridge_salary.geojson',
            generateId: false
        });
        // Update this if the datasource changes, seems to be only easy way to
        // verify the entire dataset is loaded.
        numRentDataPoints = 103;

        salaryLayerId = 'boston_cambridge_salary';
        salaryLineLayerId = 'boston_cambridge_salary_outline';
        map.addLayer({
            'id': salaryLayerId,
            'source': salarySourceId,
            'type': 'fill',
            'paint': {
                'fill-color': 'hsla(30, 100%, 45%, 0.38)'
            },
            'layout': {'visibility': 'none'},
        });
        map.addLayer({
            'id': salaryLineLayerId,
            'source': salarySourceId,
            'type': 'line',
            'paint': {
                'line-color': defaultOutlineColor,
                'line-opacity': 0.95
            },
            'layout': {'visibility': 'none'},
        });



        // When clicking on map colored by rent
        map.on('click', rentFillLayerId, (e) => {
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
            } else if (e.features.length > 0 && dashboard) { // DASHBOARD MODE
                const feature = e.features[0];
                if (rentState[feature.id]){
                    clickedNeighborhood = feature.properties.neighborhood
                }
            }
        });

        // When clicking on map colored by commute
        map.on('click', commuteLayerId, (e) => {
            // NARRATIVE MODE
            if (e.features.length > 0 && commuteSlider == null && !dashboard) {
                const feature = e.features[0];
                if (commuteState[feature.id]){
                    workingNeighborhood = feature.properties.neighborhood;
                    commuteSlider = null;
                    selectedRent = 2000;
                    selectedCommute = 60;
                    dashboard = true;
                    showSidePanel = true;
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

        map.on('click', salaryLayerId, (e) => {
            if (e.features.length > 0 && dashboard) { // DASHBOARD MODE
                const feature = e.features[0];
                if (salaryState[feature.id]){
                    workingNeighborhood = feature.properties.neighborhood
                }
            }
        });

        map.on('data', (e) => {
            if (e.sourceId === rentSourceId) {
                const features = map.querySourceFeatures(rentSourceId);
                if (features.length == numRentDataPoints) {
                    rentLoaded = true;
                    rentData = features;
                }
            }
        });

        const salaryUrl = 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/employment_opportunities/parsed_employment_data.txt';
        salaryData = await d3.tsv(salaryUrl, (d) => {
            return {
                neighborhood: d.NEIGHBORHOOD,
                avg_salary: +d.ANN_PAY_DIV_EMP,
            };
        });
    });

    // DASHBOARD FEATURE: user selects feature to color by
    function updateMapColoring(event) {
        const option = event.detail.selectedOption;
        console.log("coloring option:", option)
        if (map) {
            if (option === 'rent') {
                console.log(selectedRent);
                colorbyRent();
                commuteColor=false;
                rentColor=true;
                salaryColor=false;
            } else if (option === 'commute') {
                console.log(selectedCommute);
                colorbyCommute();
                commuteColor=true;
                rentColor=false;
                salaryColor=false;
            } else if (option == 'salary') {
                colorbySalary();
                commuteColor=false;
                rentColor=false;
                salaryColor=true;
                selectedSalary=50;
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
        map.setLayoutProperty(rentFillLayerId, 'visibility', 'visible');
        map.setLayoutProperty(rentOutlineLayerId, 'visibility', 'visible');
        map.setLayoutProperty(commuteLayerId, 'visibility', 'none');
        map.setLayoutProperty(commuteLineLayerId, 'visibility', 'none');
        for (const layerId of transitLayers) {
            map.setLayoutProperty(layerId, 'visibility', 'none');
        }
        map.setLayoutProperty(transitStopsLayerId, 'visibility', 'none');
        map.setLayoutProperty(salaryLayerId, 'visibility', 'none');
        map.setLayoutProperty(salaryLineLayerId, 'visibility', 'none');

    }

    function colorbyCommute() {
        map.setLayoutProperty(rentFillLayerId, 'visibility', 'none');
        map.setLayoutProperty(rentOutlineLayerId, 'visibility', 'none');
        map.setLayoutProperty(commuteLayerId, 'visibility', 'visible');
        map.setLayoutProperty(commuteLineLayerId, 'visibility', 'visible');
        for (const layerId of transitLayers) {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        }
        map.setLayoutProperty(transitStopsLayerId, 'visibility', 'visible');
        map.setLayoutProperty(salaryLayerId, 'visibility', 'none');
        map.setLayoutProperty(salaryLineLayerId, 'visibility', 'none');
    }

    function colorbySalary() {
        map.setLayoutProperty(rentFillLayerId, 'visibility', 'none');
        map.setLayoutProperty(rentOutlineLayerId, 'visibility', 'none');
        map.setLayoutProperty(commuteLayerId, 'visibility', 'none');
        map.setLayoutProperty(commuteLineLayerId, 'visibility', 'none');
        for (const layerId of transitLayers) {
            map.setLayoutProperty(layerId, 'visibility', 'none');
        }
        map.setLayoutProperty(transitStopsLayerId, 'visibility', 'none');
        map.setLayoutProperty(salaryLayerId, 'visibility', 'visible');
        map.setLayoutProperty(salaryLineLayerId, 'visibility', 'visible');
    }

    function plotRentBar(rentByBed, neighborhood) {
        // Delete old plot if it exists
        const chartExists = document.getElementById('rentBarPlot');
        if (chartExists) {
            Plotly.purge('rentBarPlot');
        }

        let rent_xlabels = ['SRO', '0 BR', '1BR', '2BR', '3BR', '4BR', '5BR', '6BR', '7BR', '8BR'];
        let plotData = [{
            x: rent_xlabels,
            y: rentByBed.rentData,
            type: 'bar',
            orientation: 'v'
        }];
        let layout = {
            title: 'Average rent prices per bedroom<br>in '+neighborhood,
            xaxis: {
                title: "Unit type"
            },
            yaxis: {
                title: "Average rent",
                range: [minRentAll, maxRentAll]
            }
        };
        Plotly.newPlot('rentBarPlot', plotData, layout,  {responsive: true});
    }

    function plotSalaryBarPlot(targetNode, livingNeighborhood, workingNeighborhood) {
        console.log(targetNode);
        if (targetNode === null) {
            return
        }
        // Delete old plot if it exists
        Plotly.purge(targetNode);

        let sortedSalaryData = salaryData.toSorted((a, b) => a.avg_salary - b.avg_salary);
        let xlabels = sortedSalaryData.map((v) => v.neighborhood);
        let yvals = sortedSalaryData.map(v => v.avg_salary);
        let ymax = d3.max(yvals) * 1.1;
        let colors = [];
        for (const hood of xlabels) {
            switch(hood) {
            case livingNeighborhood:
                colors.push(livingOutlineColor);
                break;
            case workingNeighborhood:
                colors.push(workingOutlineColor);
                break;
            default:
                colors.push(defaultOutlineColor);
                break;
            };
        };
        let plotData = [{
            x: xlabels,
            y: yvals,
            type: 'bar',
            orientation: 'v',
            marker: {
                color: colors,
            },
        }];
        let layout = {
            title: 'Average salaries by neighborhood',
            xaxis: {
                title: "Neighborhood",
                automargin: true,
            },
            yaxis: {
                title: "Average salary",
                range: [0, ymax]
            },
        };
        Plotly.newPlot(targetNode, plotData, layout, {responsive: true});
    }

    function addColorLegend(
        legendElement,
        legendTitle,
        minVal,
        maxVal,
        minColor,
        maxColor,
    ) {
        console.log(legendTitle);
        colorLegendTitleElement.innerText = legendTitle;
        let colorBarNode = legend({
            color: d3.scaleSequential([minVal, maxVal], d3.interpolateHsl(minColor, maxColor)),
            title: null,
            elemId: "#colorBar",
            width: 200,
            ticks: 4,
        });
        legendElement.appendChild(colorBarNode);
    }


    // Coloring of neighborhoods by rent after selecting rent
    $: {
        if (map && rentFillLayerId && rentColor && rentLoaded) {
            let rentVals = rentData.map(v => +(v.properties[rentVar]));
            let filteredRentVals = rentVals.filter(v => v < selectedRent);
            [minRent, maxRent] = d3.extent(filteredRentVals);
            minRent = Math.ceil(minRent / 10) * 10;
            maxRent = Math.max(Math.ceil(maxRent / 10) * 10, minRent + 10);

            if (dashboard) {
                minRent = 1200;
                maxRent = 2000;
            }

            if (!dashboard) {
                map.setPaintProperty(rentFillLayerId, 'fill-color', [
                    'case',
                    ['>', ['get', rentVar], selectedRent],
                    unavailableColor,
                    [
                        'interpolate',
                        ['linear'],
                        ['get', rentVar],
                        minRent, rentMinColor, // Start of your gradient (e.g., $0)
                        maxRent, rentMaxColor, // End of your gradient (e.g., $3000)
                    ]
                ]);

                rentData.forEach(function(feature) {
                    var isRentBelowSelected = feature.properties.avg_per_bed < selectedRent;
                    rentState[feature.id] = isRentBelowSelected;
                });
            } else {
                map.setPaintProperty(rentFillLayerId, 'fill-color', [
                    'case',
                    ['>', ['get', 'avg_salary'], selectedSalary],  // New condition for average salary
                    unavailableColor,
                    ['>', ['get', rentVar], selectedRent],
                    unavailableColor,
                    [
                        'interpolate',
                        ['linear'],
                        ['get', rentVar],
                        minRent, rentMinColor, // Start of your gradient (e.g., $0)
                        maxRent, rentMaxColor, // End of your gradient (e.g., $3000)
                    ]
                ]);

                rentData.forEach(function(feature) {
                    var isRentBelowSelected = feature.properties.avg_per_bed < selectedRent;
                    rentState[feature.id] = isRentBelowSelected;
                });
            }
            addColorLegend(colorLegendElement, "Average rent per bedroom", minRent, maxRent, rentMinColor, rentMaxColor);
        }
    }

    // Coloring of neighborhoods by salary
    $: {
        if (map && salaryLayerId && salaryColor) {
            minSalary = 40;
            maxSalary = 180;

            map.setPaintProperty(salaryLayerId, 'fill-color', [
                'case',
                ['<', ['get', 'avg_salary'], selectedSalary],
                unavailableColor,
                [
                    'interpolate',
                    ['linear'],
                    ['get', 'avg_salary'],
                    minSalary, salaryMinColor, // Start of your gradient (e.g., $0)
                    maxSalary, salaryMaxColor, // End of your gradient (e.g., $3000)
                ]
            ]);

            var features = map.querySourceFeatures(salarySourceId);
            features.forEach(function(feature) {
                var isSalaryBelowSelected = feature.properties['avg_salary'] <= selectedSalary;
                salaryState[feature.id] = isSalaryBelowSelected;
            });
            addColorLegend(colorLegendElement, "Average salary ($/hour)", minSalary, maxSalary, salaryMinColor, salaryMaxColor);
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
                         unavailableColor, // Placeholder for NaN, no commute time data so greyed out
                        ['case',
                        ['>', ['get', clickedNeighborhood], selectedCommute],
                        unavailableColor,
                        [
                            'interpolate',
                            ['linear'],
                            ['get', clickedNeighborhood],
                            minCommute, commuteMinColor,
                            maxCommute, commuteMaxColor,
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
                            0.15
                    ]);
                    map.setPaintProperty(transitStopsLayerId, 'circle-stroke-opacity', [
                            'case',
                            ['==', clickedNeighborhood, ['get', 'neighborhood']], 0.8,  // High opacity if clickedNeighborhood is in the list
                            0.15
                    ]);

                    var features = map.querySourceFeatures('Boston_Cambridge_Commute');
                    features.forEach(function(feature) {
                        var isCommuteBelowSelected = feature.properties[clickedNeighborhood] <= selectedCommute;
                        commuteState[feature.id] = isCommuteBelowSelected;
                        if (feature.id !== undefined) {
                            map.setFeatureState({
                                source: 'Boston_Cambridge_Commute',
                                id: feature.id,
                            }, {'valid_commute':isCommuteBelowSelected});
                            }
                    });
                } catch (error) {
                    console.error('Error processing commute data:', error);
                }
                addColorLegend(
                    colorLegendElement,
                    "Average commute time from " + clickedNeighborhood + " (minutes)",
                    minCommute,
                    maxCommute,
                    commuteMinColor,
                    commuteMaxColor,
                );
            })();
        }
    }

    // Outlining of selected neighborhoods to live or work.
    $ :{
        if (clickedNeighborhood !== null || workingNeighborhood !== null) {
            const layers = [
                { id: rentOutlineLayerId},
                { id: commuteLineLayerId},
                { id: salaryLineLayerId},
            ];
            for (const layer of layers) {
                map.setPaintProperty(layer.id, 'line-width', [
                    'case',
                    ['in', ['get', "neighborhood"], ["literal", [clickedNeighborhood, workingNeighborhood]]],
                    5,
                    1,
                ]);
                map.setPaintProperty(layer.id, 'line-color', [
                    'case',
                    ['==', ['get', "neighborhood"], clickedNeighborhood],
                    livingOutlineColor,
                    ['==', ['get', "neighborhood"], workingNeighborhood],
                    workingOutlineColor,
                    defaultOutlineColor,
                ]);
            };
        }
    }

    // Shrink map width if side panel is active
    $: {
        if (showSidePanel) {
            mapWidth = "70%";
            sidebarWidth = "26%";
        } else {
            mapWidth = "100%";
            sidebarWidth = "0%";
        }
    }

    // Add side panel plots
    $: {
        if (showSidePanel){
            (async () => {
                try {
                    // Get min and max rent by bedroom
                    // const [minRentAll, maxRentAll] = fetchMinMaxAllRentData()
                    // rentByBed = fetchRentByBedData(clickedNeighborhood);
                    let rentByBed = await fetchRentByBedData(clickedNeighborhood);
                    plotRentBar(rentByBed, clickedNeighborhood)
                } catch (error) {
                    console.error('Error processing rent by bedroom:', error);
                }
            })();
            plotSalaryBarPlot(salaryPlotElement, clickedNeighborhood, workingNeighborhood);
        }
    }
</script>
<div class="map-wrap">
    <div class="map" bind:this={mapContainer} style="--width:{mapWidth}">
        <!-- Sliders and Color Bars (contained within map)-->
        {#if rentSlider}
        <div class="outer-slider-container">
            <Slider bind:Value={rentValue}
                    sliderColor='hsl(260, 40%, 50%)'
                    class="slider-slider"
                    min={minRent}
                    max={maxRent}
                    step=10/>
            <button on:click={handleRentEnter} class="slider-button">Enter</button>
        </div>
        {/if}

        {#if rentColor || commuteColor || salaryColor}
        <div class="color-legend" bind:this={colorLegendElement}>
            <p id="colorBarTitle" bind:this={colorLegendTitleElement}></p>
            <svg id="colorBar"></svg>
        </div>
        {/if}

        {#if commuteSlider}
        <div class="outer-slider-container">
                <Slider bind:Value={commuteValue}
                        label='Maximum commute time (min):'
                        min={minCommute}
                        max={maxCommute}
                        sliderColor='hsl(200, 50%, 50%)'
                        step=5/>
                <button on:click={handleCommuteEnter}>Enter</button>
        </div>
        {/if}

        {#if dashboard}
        <div class="outer-slider-container" style="left:0; grid-template-rows: repeat(3, 1fr); grid-template-columns: 1fr;">
            <Slider bind:Value={selectedRent}
                    sliderColor='hsl(260, 40%, 50%)'
                    label='Filter by Max Avg. Rent per Bedroom:'
                    class="slider-slider"
                    min=0
                    max=2000
                    step=10/>
            <Slider bind:Value={selectedCommute}
                    sliderColor='hsl(200, 50%, 50%)'
                    label='Filter by Max Commute Time:'
                    class="slider-slider"
                    min=0
                    max=80
                    step=1/>
            <Slider bind:Value={selectedSalary}
                    sliderColor='hsl(30, 100%, 50%)'
                    label='Filter by Min Avg. Salary ($/hr)'
                    class="slider-slider"
                    min=0
                    max=200
                    step=5
                    fillRight=true/>
        </div>
        {/if}
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
            <p>You've selected to live in <span class="neighborhood-name" style="font-weight: bold; color: hsl(260, 90%, 30%)">{clickedNeighborhood}</span>!</p>
        </div>
        {/if}

        {#if clickedNeighborhood && commuteSlider == null && workingNeighborhood == null}
        <div class='popUp'>
            <p>Shown are the neighborhoods in your commute range. Please select one of them.</p>
        </div>
        {/if}

        {#if workingNeighborhood && !dashboard}
        <div class='popUp'>
            <p style="position:relative;">You've selected to live in <span class="neighborhood-name" style="font-weight: bold; color: hsl(260, 90%, 30%)">{clickedNeighborhood}</span> and to
                work in <span class="neighborhood-name" style="font-weight: bold; color: hsl(200, 900%, 30%)">{workingNeighborhood}</span>!</p>
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
    </div>
    {#if showSidePanel}
    <div class="sidebar" style="--width:{sidebarWidth}; --map-width:{mapWidth}">
        <p id="sidebarText">
            Given a max rent of ${rentValue} and max commute time of {commuteValue} minutes, you've
            chosen to live in {clickedNeighborhood} and work in {workingNeighborhood}.
        </p>
        <div id="rentBarPlot"/>
        <div id="salaryBarPlot" bind:this={salaryPlotElement}/>
    </div>
    {/if}

</div>

<!-- Map Display Options -->

<style>
    @import url("$lib/global.css");
    .map-wrap {
        position: absolute;
        width: 95%;
        height: 90%;
    }

    .sidebar {
        position: absolute;
        width: var(--width);
        height: 100%;
        transition: 300ms;
        left: calc(var(--map-width) + 2%);
        display: grid;
        /* grid-template-columns: 1fr;
        grid-template-rows: repeat(1fr, 2); */
        grid-template-rows: auto; /* Automatically size rows based on content */
        align-content: start;
        overflow-y: auto;
        overflow-x: clip;

        #sidebarText {
            transition: 300ms;
        }

        #rentBarPlot {
            transition: 300ms;
            width: 100%;
        }
        #salaryBarPlot {
            transition: 300ms;
            width: 100%;
        }
    }


    .map {
        position: absolute;
        width: var(--width);
        height: 100%;
        transition: 300ms;
    }
    .color-legend {
        position: absolute;
        top: 1%;
        right: 2%;
        width: 200px;
        z-index: 10;
    }

    .outer-slider-container {
        position: absolute;
        bottom: 0;
        left: 37%;
        margin: 20px;
        z-index: 1000;
        width: 26%;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.9);
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        padding-right: 15px;
    }


    .instruction {
        position: absolute;
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
        font-size: 16px;
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
        position: absolute;   /* Absolute positioning relative to the nearest positioned ancestor */
        bottom: 0;            /* Aligns the container to the bottom */
        left: 0;              /* Aligns the container to the left */
        margin: 20px;         /* Adds some space from the corner edges */
        padding: 5px;        /* Padding inside the container */
        z-index: 1000;
        background-color: rgba(255, 255, 255, 0.9); /* Semi-transparent white background */
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
        position: absolute;
        margin: 20px;
        width: 300px;
        z-index: 1000;
        text-align: left;
        margin-top: 15px;
        font-size: 16px;
    }

    .checkboxContainer, .dropdownContainer {
        margin-bottom: 5px; /* Adds space between the checkbox and dropdown */
        width: 100%; /* Ensures children stretch to match the wrapper's width */
    }
    #colorBar {
        color: white;
    }
    #colorBarTitle {
        margin-bottom: 0px;
        color: white;
        font-size: 16px;
    }
</style>
