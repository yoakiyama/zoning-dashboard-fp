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



