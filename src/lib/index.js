// place files you want to import through the `$lib` alias in this folder.

export async function fetchRentData() {
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
        const rent = feature.properties.avg_per_bed;
        if (rent < minRent) minRent = rent;
        if (rent > maxRent) maxRent = rent;
    });

    return { minRent, maxRent };
}
