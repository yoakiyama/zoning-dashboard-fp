// place files you want to import through the `$lib` alias in this folder.
import * as d3 from 'd3';

export async function fetchRentData(columnName) {
    const url = 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/geographic/Boston_Cambridge_rent.geojson';

    // Fetch the GeoJSON data
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    const geojson = await response.json();

    // Assume 'features' is an array of GeoJSON features
    let minRent = Infinity;
    let maxRent = -Infinity;

    // Loop through each feature in the GeoJSON
    geojson.features.forEach(feature => {
        const rent = feature.properties[columnName];
        if (rent < minRent) minRent = rent;
        if (rent > maxRent) maxRent = rent;
    });

    return { minRent, maxRent };
}

export async function fetchCommuteData(columnName) {
    const url = 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/transportation/mbta/map_layers/Boston_Cambridge_commute.geojson';

    // Fetch the GeoJSON data
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    const geojson = await response.json();

    // Assume 'features' is an array of GeoJSON features
    let minCommute = 0;
    let maxCommute = -Infinity;

    // Loop through each feature in the GeoJSON
    geojson.features.forEach(feature => {
        const time = feature.properties[columnName];
        if (time < minCommute) minCommute = time;
        if (time > maxCommute && time !== 180) maxCommute = time;
    });

    return { minCommute, maxCommute };
}

// export async function fetchMinMaxAllRentData() {
//     const url = 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/rent_data/Boston_Cambridge_collapsed_rent.csv';
//     const data = await d3.csv(url);
//     const values = data.map(d => parseFloat(d.value));
//     let minRent = Math.min(...values);
//     let maxRent = Math.max(...values);
//     return { minRent, maxRent }
// }

export async function fetchRentByBedData(neighborhood) {
    const url = 'https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/data/rent_data/Boston_Cambridge_collapsed_rent.csv';
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    const data = await response.text();

    // Parse data
    let rows = data.split('\n');
    let headers = rows[0].split(',');

    // Find index of Neighborhood column (Should be first column)
    let neighborhoodIndex = headers.indexOf('Neighborhood')

    // Find indices of other columns
    let columnIndices = {
        'SRO': headers.indexOf('SRO'),
        '0BR': headers.indexOf('0BR'),
        '1BR': headers.indexOf('1BR'),
        '2BR': headers.indexOf('2BR'),
        '3BR': headers.indexOf('3BR'),
        '4BR': headers.indexOf('4BR'),
        '5BR': headers.indexOf('5BR'),
        '6BR': headers.indexOf('6BR'),
        '7BR': headers.indexOf('7BR'),
        '8BR': headers.indexOf('8BR')
    };

    // Iterate through rows to get data for neighborhood
    let rentData = [];
    for (let i=1; i < rows.length; i++) {
        // Get row
        let row = rows[i].split(',');
        // Check if row for desired neighborhood
        if (row[neighborhoodIndex].trim() == neighborhood) {
            // Get rent data from row
            let rentValues = Object.keys(columnIndices).map(column => parseFloat(row[columnIndices[column]]));
            // console.log("Getting rent by bed for "+neighborhood)
            rentData.push(...rentValues);
            break;
        }
    }
    return { rentData };
}

export function Dashboard() {
    let selectedRent = 3000;
    let selectedCommute = 200;
    let dashboard = true;
    let neighborhood = 'Area 2/MIT';
    return {selectedRent, dashboard}
    return {selectedRent, selectedCommute, dashboard, neighborhood}
}

// Copied from:
// Copyright 2021, Observable Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/color-legend
export function legend({
    color,
    title,
    elemId,
    tickSize = 6,
    width = 320,
    height = 44 + tickSize,
    marginTop = 18,
    marginRight = 0,
    marginBottom = 16 + tickSize,
    marginLeft = 0,
    ticks = width / 64,
    fontSize = "16px",
    tickFormat,
    tickValues,
} = {}) {
    const svg = d3.select(elemId)
    svg.selectAll("*").remove();
    svg
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("overflow", "visible")
        .style("display", "block");
    console.log("got: ", svg);

    let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
    let x;

    // Continuous
    if (color.interpolate) {
        const n = Math.min(color.domain().length, color.range().length);

        x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

        svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
    }

    // Sequential
    else if (color.interpolator) {
        x = Object.assign(color.copy()
        .interpolator(d3.interpolateRound(marginLeft, width - marginRight)), {
            range() {
            return [marginLeft, width - marginRight];
            }
        });

        svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.interpolator()).toDataURL());

        // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
        if (!x.ticks) {
        if (tickValues === undefined) {
            const n = Math.round(ticks + 1);
            tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
        }
        if (typeof tickFormat !== "function") {
            tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
        }
        }
    }

    // Threshold
    else if (color.invertExtent) {
        const thresholds = color.thresholds ? color.thresholds() // scaleQuantize
        :
        color.quantiles ? color.quantiles() // scaleQuantile
        :
        color.domain(); // scaleThreshold

        const thresholdFormat = tickFormat === undefined ? d => d :
        typeof tickFormat === "string" ? d3.format(tickFormat) :
        tickFormat;

        x = d3.scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);

        svg.append("g")
        .selectAll("rect")
        .data(color.range())
        .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);

        tickValues = d3.range(thresholds.length);
        tickFormat = i => thresholdFormat(thresholds[i], i);
    }

    // Ordinal
    else {
        x = d3.scaleBand()
        .domain(color.domain())
        .rangeRound([marginLeft, width - marginRight]);

        svg.append("g")
        .selectAll("rect")
        .data(color.domain())
        .join("rect")
        .attr("x", x)
        .attr("y", marginTop)
        .attr("width", Math.max(0, x.bandwidth() - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", color);

        tickAdjust = () => {};
    }

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues))
        .call(tickAdjust)
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start"));

    console.log("ret: ", svg);

    return svg.node();
}

function ramp(color, n = 256) {
    var canvas = document.createElement('canvas');
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
        context.fillStyle = color(i / (n - 1));
        context.fillRect(i, 0, 1, 1);
    }
    return canvas;
}
