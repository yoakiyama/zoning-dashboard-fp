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

    const rentData = [1549.7500881834214, 1932.3635802469137, 1833.3455820105821, 1657.121693121693, 1255.2674603174603, 1255.2674603174603, 1525.3431216931217, 1318.555687830688, 1416.9650793650794, 1255.2674603174603, 1318.555687830688, 1258.7166666666665, 1663.3708994708995, 1311.8887566137566, 1319.8109788359789]

    const neighborhoodNames = ["Allston/Brighton", "Back Bay/Beacon Hill", "Central Boston", "Charlestown", "Dorchester", "East Boston", "Fenway/Kenmore", "Hyde Park", "Jamaica Plain", "Mattapan", "Roslindale", "Roxbury", "South Boston", "South End", "West Roxbury"]

    const salaryData = [71.60039899786582, 149.3132226685017, 154.62586454469306, 78.91006001263423, 59.683840847913864, 59.68693009118541, 79.74541571022148, 55.42134944612286, 69.7178024833959, 43.01632438125329, 46.62062546537602, 68.19744733200062, 154.15502975758454, 68.2045719844358, 46.774375352244974]

    const data = [{
        x: rentData,
        y: salaryData,
        mode: "markers",
        type: "scatter",
        text: neighborhoodNames,
        showlegend: false,
        name: "",
        hoverinfo: "text"
    }];

    const regressionY = regressionLine(rentData, salaryData);

    let salaryRegression = {
        x: rentData,
        y: regressionY,
        mode: "lines",
        type: "scatter",
        name: "",
        showlegend: false,
        hoverinfo: "none"
    };

    let salaryLayout = {
        xaxis: { range: [1250, 1950], title: "Average 1 Bedroom Apartment Rent" },
        yaxis: { range: [0, 200], title: "Average Salary (in thousands of dollars per year)" },
        title: "Average Salary vs. Average 1 Bedroom Apartment Rent by Neighborhood"
    };

     // Create the Plotly plot once the component is mounted
    import { onMount } from 'svelte';

    onMount(() => {
        Plotly.newPlot("salaryPlot", [...data, salaryRegression], salaryLayout);
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

    <h3>Quantitatively exploring the affordability vs commute time trade-off</h3>

    <p>
        But just how large is the trade-off between rent and commute time? Our analyses find that in the Boston area, 
        a <b>$100 increase in rent</b> per bedroom is about equivalent to a <b>1 minute and 45 second decrease in commute</b> time. 
        We also find complementary evidence that neighborhoods with high rent prices tend to have more businesses and job opportunities 
        (normalized by population) and offer higher salaries. The following plot shows the average salary for workers in a given neighborhood 
        regressed against the average 1 bedroom apartment rent (with data for both Boston and Cambridge area neighborhoods).
    </p>

    <div id="salaryPlot"></div>

    <h3>In-depth exploration via the Boston/Cambridge rent vs commute time dashboard</h3>
    <p>In the following dashboard, you’ll get to explore how the variables of rent, commute time, and salary interact with each other by seeing how 
        high rent prices can reduce your housing options, then visualizing how existing transportation options can limit the areas you’re able to work in 
        (depending on how long you would be willing to commute).</p>

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