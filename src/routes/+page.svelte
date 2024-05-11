<svelte:head>
	<title>Commute Time Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdn.plot.ly/plotly-latest.min.js" type="text/javascript"></script>
</svelte:head>



<script>
    function goToDashboard(){
        window.location.href = './dashboard';
        return false;
    }
     // Calculate regression line
 const regressionLine = (xArr, yArr) => {
        const xMean = xArr.reduce((acc, val) => acc + val, 0) / xArr.length;
        const yMean = yArr.reduce((acc, val) => acc + val, 0) / yArr.length;

        const numerator = xArr.reduce((acc, x, i) => acc + (x - xMean) * (yArr[i] - yMean), 0);
        const denominator = xArr.reduce((acc, x) => acc + (x - xMean) ** 2, 0);

        const slope = numerator / denominator;
        const intercept = yMean - slope * xMean;

        return xArr.map(x => slope * x + intercept);
    };

    const rentData = [2607.0, 3539.0, 3718.0, 3633.0, 3518.0, 2750.0, 3633.0, 3539.0, 3140.0, 3250.0, 2377.0, 3749.0, 2377.0, 3151.0, 2607.0, 2497.0, 2680.0, 2607.0, 2377.0, 3539.0, 2397.0, 3213.0, 3213.0, 3046.0, 3539.0, 2497.0, 2481.0, 2730.0, 3570.0, 2481.0, 3633.0, 3539.0, 3151.0, 3633.0, 3046.0, 2499.0]

    const rentNeighborhoodNames = ["Allston", "Area 2/MIT", "Back Bay", "Baldwin", "Beacon Hill", "Brighton", "Cambridge Highlands","Cambridgeport", "Charlestown", "Chinatown", "Dorchester", "Downtown", "East Boston","East Cambridge","Fenway", "Hyde Park","Jamaica Plain","Longwood", "Mattapan", "Mid-Cambridge","Mission Hill","Neighborhood Nine","North Cambridge","North End","Riverside", "Roslindale", "Roxbury", "South Boston","South Boston Waterfront","South End","Strawberry Hill","The Port","Wellington-Harrington","West Cambridge","West End","West Roxbury"]

    const salaryData = [71.83164739884393, 175.4480640393143, 147.05532554953237, 77.08398116226142, 112.21782230147907, 71.33450183064579, 77.08398116226142, 175.4480640393143, 78.91006001263423, 128.85338481959695, 59.683840847913864, 188.8833296001792, 59.68693009118541, 129.98903006318127, 81.23144565599719, 55.42134944612286, 69.7178024833959, 78.51204242827254, 43.01632438125329, 175.4480640393143, 57.423773287850956, 119.74381474710542, 119.74381474710542, 50.297506925207756, 175.4480640393143, 46.62062546537602, 72.66275149537792, 81.42493396724775, 165.73921750105174, 68.2045719844358, 77.08398116226142, 175.4480640393143, 129.98903006318127, 77.08398116226142, 109.57901280044203, 46.774375352244974]

    const data = [{
        x: rentData,
        y: salaryData,
        mode: "markers",
        type: "scatter",
        text: rentNeighborhoodNames,
        showlegend: false,
        name: "",
        hoverinfo: "text"
    }];

    const regressionY = regressionLine(rentData, salaryData);

    let regressionTrace = {
        x: rentData,
        y: regressionY,
        mode: "lines",
        type: "scatter",
        name: "",
        showlegend: false,
        hoverinfo: "none"
    };

    let layout = {
        xaxis: { range: [2300, 3800], title: "Average 1 Bedroom Apartment Rent" },
        yaxis: { range: [0, 200], title: "Average Salary (in thousands of dollars per year)" },
        title: "Average Salary vs. Average Rent by Neighborhood"
    };

     // Create the Plotly plot once the component is mounted
    import { onMount } from 'svelte';

    onMount(() => {
        Plotly.newPlot("salaryPlot", [...data, regressionTrace], layout);
    });
</script>

<div class="intro-container">
    <h2>How transportation options and rent prices are limiting your access to high-paying jobs</h2>
    <p>As rent prices climb in the Boston area, many tenants are being driven farther away from the center of the 
        city<sup><a href="https://www.cbsnews.com/boston/news/boston-high-rent-city-workers-city-council-residence-requirement/">1</a>, <a href="https://www.forbes.com/sites/andrewdepietro/2023/01/24/the-average-rent-in-boston-now-rivals-bay-area-cities/?sh=7e5080d9434b">2</a></sup>. 
        Unfortunately, this displacement often means living farther away from areas that are dense with high-paying job opportunities.
    </p>
    <h3>Effects on mental and physical health</h3>
    <p>
        The trade off between affordability and commute time carries dire implications to overall health. According to the Metropolitan Area Planning Council (MAPC), 
        a record <b>51% of Greater Boston renters are considered rent burdened</b>, spending more than the recommended maximum 30% of their monthly income on housing. 
        Several longitudinal studies have documented how stress related to housing affordability and housing cost burden is significantly associated with 
        declines in mental health and emotional well-being<sup><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8435361/">3</a></sup>. 
        While many resort to long daily commutes, studies have also found that increased commute times are associated with reduced work 
        and life satisfaction and decreased physical health<sup><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9819363/">4</a></sup>.
    </p>

    <p>
        But just how large is the trade-off between rent and commute time? Our analyses find that in the Boston area, 
        a <b>$100 increase in rent</b> per bedroom is about equivalent to a <b>1 minute and 45 second decrease in commute</b> time. 
        We also find complementary evidence that neighborhoods with high rent prices tend to have more businesses and job opportunities 
        (normalized by population) and offer higher salaries. The following plot shows the average salary for workers in a given neighborhood 
        regressed against the average 1 bedroom apartment rent (with data for both Boston and Cambridge area neighborhoods).
    </p>

    <div id="salaryPlot"></div>

    <p>In the following dashboard, you’ll get to explore how the variables of rent, commute time, and salary interact with each other by seeing how high rent prices can reduce your housing options, then visualizing how existing transportation options can limit the areas you’re able to work in (depending on how long you would be willing to commute).</p>

    <button on:click={goToDashboard}>Enter</button>
</div>

<style>
    @import url("$lib/global.css");

    .intro-container {
        margin: auto;
        width: 50%;
        line-height: 2;
    }

</style>