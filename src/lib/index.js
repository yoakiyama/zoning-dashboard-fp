// place files you want to import through the `$lib` alias in this folder.

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

export function Dashboard() {
    let selectedRent = 3000;
    let selectedCommute = 200;
    let dashboard = true;
    let neighborhood = 'Area 2/MIT';
    return {selectedRent, dashboard}
    return {selectedRent, selectedCommute, dashboard, neighborhood}
}



