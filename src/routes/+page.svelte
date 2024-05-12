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

    const dashboardGIF = "https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/images/dashboard.gif"
    const dashboard1 = "https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/images/dashboard_step1.png"
    const dashboard3 = "https://raw.githubusercontent.com/yoakiyama/zoning-dashboard-fp/main/images/dashboard_step3.png"

    const rentData = [1549.7500881834214, 1932.3635802469137, 1833.3455820105821, 1657.121693121693, 1255.2674603174603, 1255.2674603174603, 1525.3431216931217, 1318.555687830688, 1416.9650793650794, 1255.2674603174603, 1318.555687830688, 1258.7166666666665, 1663.3708994708995, 1311.8887566137566, 1319.8109788359789]

    const neighborhoodNames = ["Allston/Brighton", "Back Bay/Beacon Hill", "Central Boston", "Charlestown", "Dorchester", "East Boston", "Fenway/Kenmore", "Hyde Park", "Jamaica Plain", "Mattapan", "Roslindale", "Roxbury", "South Boston", "South End", "West Roxbury"]

    const salaryData = [71.60039899786582, 149.3132226685017, 154.62586454469306, 78.91006001263423, 59.683840847913864, 59.68693009118541, 79.74541571022148, 55.42134944612286, 69.7178024833959, 43.01632438125329, 46.62062546537602, 68.19744733200062, 154.15502975758454, 68.2045719844358, 46.774375352244974]

    const commuteData = [34.39917824173928, 26.044504577120158, 24.317708803611737, 31.863385464581416, 36.20528355271251, 36.10821016073015, 25.010931003877236, 39.122020692832905, 33.827945050809184, 41.76362605953085, 37.19913902253735, 33.63867321698502, 30.37513130252101, 29.185083930231286, 36.87379439464428]

    const rentBurdenData = [
        {category: "Single parent w/children", percentage: 72},
        {category: "Living alone", percentage: 61},
        {category: "Couple w/children", percentage: 42},
        {category: "Family w/o children", percentage: 38},
        {category: "Non-family roommates", percentage: 34}
    ];
    rentBurdenData.reverse();

    const bostonRentTimeSeries = [2211, 2241, 2272, 2288, 2297, 2309, 2309, 2304, 2289, 2274, 2272, 2281, 2308, 2342, 2365, 2381, 2385, 2393, 2392, 2386, 2367, 2348, 2329, 2344, 2384, 2433, 2458, 2464, 2466, 2467, 2467, 2458, 2432, 2404, 2403, 2439, 2482, 2510, 2522, 2532, 2543, 2547, 2545, 2528, 2507, 2498, 2502, 2529, 2555, 2581, 2594, 2602, 2617, 2627, 2637, 2627, 2615, 2596, 2593, 2611, 2639, 2670, 2686, 2682, 2666, 2641, 2609, null, null, 2399, 2366, 2370, 2420, 2475, 2522, 2544, 2572, 2602, 2631, 2648, 2656, 2665, 2687, 2710, 2747, 2759, 2784, 2808, 2849, 2881, 2910, 2932, 2969, 2973, 2985, 2981, 2993, 3009, 3027, 3062, 3087, 3111, 3124, 3126, 3116, 3113, 3146, 3168, 3191, 3196, 3211, 3226]
    const cambridgeRentTimeSeries = [2450, 2474, 2526, 2578, 2618, 2640, 2645, 2641, 2611, 2573, 2529, 2518, 2518, 2576, 2592, 2662, 2684, 2733, 2734, 2737, 2750, 2660, 2595, 2539, 2606, 2668, 2740, 2783, 2812, 2810, 2798, 2767, 2737, 2687, 2680, 2679, 2704, 2740, 2790, 2831, 2856, 2877, 2884, 2872, 2843, 2809, 2763, 2751, 2752, 2805, 2852, 2917, 2944, 2953, 2956, 2943, 2916, 2885, 2887, 2911, 2926, 2945, 2970, 2992, 2982, 2949, 2911, 2839, 2732, 2645, 2595, 2572, 2545, 2573, 2641, 2754, 2841, 2921, 2966, 2973, 2983, 2974, 2996, 3008, 3008, 3030, 3051, 3116, 3167, 3228, 3267, 3286, 3302, 3284, 3270, 3230, 3228, 3256, 3299, 3348, 3388, 3406, 3424, 3398, 3417, 3409, 3410, 3380, 3387, 3425, 3461, 3487]
    const rentTimeSets = {
        Boston: bostonRentTimeSeries,
        Cambridge: cambridgeRentTimeSeries
    }
    let selectedRentTime = {};
    const rentDates = ["1/2015", "2/2015", "3/2015", "4/2015", "5/2015", "6/2015", "7/2015", "8/2015", "9/2015", "10/2015", "11/2015", "12/2015", "1/2016", "2/2016", "3/2016", "4/2016", "5/2016", "6/2016", "7/2016", "8/2016", "9/2016", "10/2016", "11/2016", "12/2016", "1/2017", "2/2017", "3/2017", "4/2017", "5/2017", "6/2017", "7/2017", "8/2017", "9/2017", "10/2017", "11/2017", "12/2017", "1/2018", "2/2018", "3/2018", "4/2018", "5/2018", "6/2018", "7/2018", "8/2018", "9/2018", "10/2018", "11/2018", "12/2018", "1/2019", "2/2019", "3/2019", "4/2019", "5/2019", "6/2019", "7/2019", "8/2019", "9/2019", "10/2019", "11/2019", "12/2019", "1/2020", "2/2020", "3/2020", "4/2020", "5/2020", "6/2020", "7/2020", "8/2020", "9/2020", "10/2020", "11/2020", "12/2020", "1/2021", "2/2021", "3/2021", "4/2021", "5/2021", "6/2021", "7/2021", "8/2021", "9/2021", "10/2021", "11/2021", "12/2021", "1/2022", "2/2022", "3/2022", "4/2022", "5/2022", "6/2022", "7/2022", "8/2022", "9/2022", "10/2022", "11/2022", "12/2022", "1/2023", "2/2023", "3/2023", "4/2023", "5/2023", "6/2023", "7/2023", "8/2023", "9/2023", "10/2023", "11/2023", "12/2023", "1/2024", "2/2024", "3/2024", "4/2024"]

    const plotBurdenData = {
        type: 'bar',
        x: rentBurdenData.map(d => d.percentage),
        y: rentBurdenData.map(d => d.category),
        orientation: 'h', 
        text: rentBurdenData.map(d => `${d.percentage}%`), 
        textposition: 'auto',
        marker: {
            line: {
                width: 1.5
            }
        }
    };
    const rentBurdenLayout = {
        title: 'Percentage of household types that are rent burdened',
        xaxis: {
            title: 'Percentage',
            tickformat: ',.0%'  // Format the x-axis ticks as percentages
        },
        yaxis: {
            title: '',
            automargin: true
        },
        margin: {b: 120, l:150},
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            xanchor: 'center',
            y: -0.4,
            yanchor: 'top',
            text: 'Data from boston.gov, Amelia Najjar (https://www.boston.gov/sites/default/files/file/2022/05/Presentation.pdf)',
            showarrow: false,
            font: {
                family: 'Arial',
                size: 12,
                color: 'grey'
            }
        }]
    };

    const plotCommuteData = [{
        x: rentData,
        y: commuteData,
        mode: "markers",
        type: "scatter",
        text: neighborhoodNames,
        showlegend: false,
        name: "",
        hoverinfo: "text"
    }];

    const commuteRegressionY = regressionLine(rentData, commuteData);

    let commuteRegression = {
        x: rentData,
        y: commuteRegressionY,
        mode: "lines",
        type: "scatter",
        name: "",
        showlegend: false,
        hoverinfo: "none"
    };

    let commuteLayout = {
        xaxis: { range: [1250, 1950], title: "Average Rent Per Bedroom" },
        yaxis: { range: [20, 45], title: "Average Commute Time (in minutes)" },
        title: "Average Resident's Commute Time vs. Average Rent Per Bedroom"
    };

    const plotRentData = [{
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
        xaxis: { range: [1250, 1950], title: "Average Rent Per Bedroom" },
        yaxis: { range: [0, 200], title: "Average Salary (in thousands of dollars per year)" },
        title: "Average Salary vs. Average Rent Per Bedroom"
    };

    function updateRentTimePlot() {
        let rentTimeData = [];
        Object.keys(selectedRentTime).forEach(key => {
            if (selectedRentTime[key]) {
                rentTimeData.push({
                    x: rentDates,
                    y: rentTimeSets[key],
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: `${key}`,
                    marker: { size: 8 },
                    connectgaps: true  // Ensure the line connects across gaps
                });
            }
        });

        const updateLayout = {
            title: 'Increases in rent since 2015',
            xaxis: { title: 'Date' },
            yaxis: { title: 'Rent ($)' },
            showlegend: true,
            margin: {b: 120},
            annotations: [{
                xref: 'paper',
                yref: 'paper',
                x: 0.5,
                xanchor: 'center',
                y: -0.4,
                yanchor: 'top',
                text: 'Values represent the Zillow Observed Rent Index (ZORI), which measures the typical observed market rate rent',
                showarrow: false,
                font: {
                    family: 'Arial',
                    size: 12,
                    color: 'grey'
                }
            }]
        };

        Plotly.react('rentTimePlot', rentTimeData, updateLayout);
    }

     // Create the Plotly plot once the component is mounted
    import { onMount } from 'svelte';

    onMount(() => {
        Object.keys(rentTimeSets).forEach(key => {
            selectedRentTime[key] = true;
        });

        setTimeout(() =>{
            if (typeof Plotly !== 'undefined') {
                Plotly.newPlot("commutePlot", [...plotCommuteData, commuteRegression], commuteLayout);
                Plotly.newPlot("salaryPlot", [...plotRentData, salaryRegression], salaryLayout);
                updateRentTimePlot();
                Plotly.newPlot('rentBurdenPlot', [plotBurdenData], rentBurdenLayout);
            } else {
                console.error("plotly is still not defined after waiting");
            }
        }, 500);
    });
    function handleCheckboxChange() {
        updateRentTimePlot();
    }

</script>

<div class="intro-container">
    <h1>How are transportation options and rent prices limiting your access to high-paying jobs?</h1>
    <p>As rent prices climb in the Boston area, many tenants are being driven farther away from the center of the 
        city<sup><a href="https://www.cbsnews.com/boston/news/boston-high-rent-city-workers-city-council-residence-requirement/">1</a>, <a href="https://www.forbes.com/sites/andrewdepietro/2023/01/24/the-average-rent-in-boston-now-rivals-bay-area-cities/?sh=7e5080d9434b">2</a></sup>. 
        Unfortunately, this displacement often means living farther away from areas that are dense with high-paying job opportunities.
    </p>
    <div id="rentTimePlot"></div>


	<h2>The trade-off between rent, commute time, and salary</h2>
    <p>But just how large is the trade-off between rent and commute time? Our analyses find that in the Boston area, 
        a <b>$100 increase in rent</b> per bedroom is about equivalent to a <b>1 minute and 45 second decrease in commute</b> time.</p>
    
    <div id="commutePlot"></div>

    <p>We also find complementary evidence that neighborhoods with high rent prices tend to have more businesses and job opportunities (normalized by population) and offer higher salaries. The following plot shows the average salary for workers in a given neighborhood regressed against the average rent per bedroom.</p>

    <div id="salaryPlot"></div>

    <h2>Negative impacts on mental and physical health</h2>
    <p>
        The trade off between affordability and commute time carries dire implications to overall health. According to the Metropolitan Area Planning Council (MAPC), 
        a record <b>51% of Greater Boston renters are considered rent burdened</b>, spending more than the recommended maximum 30% of their monthly income on housing. 
        Several longitudinal studies have documented how stress related to housing affordability and housing cost burden is significantly associated with 
        declines in mental health and emotional well-being<sup><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8435361/">3</a></sup>. 
        While many resort to long daily commutes, studies have also found that increased commute times are associated with reduced work 
        and life satisfaction and decreased physical health<sup><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9819363/">4</a></sup>. 
        Crucially, a recent study found that rent burden and housing instability significantly increase risk of maternal depression in the postpartum 
        year<sup><a href="https://www.sciencedirect.com/science/article/pii/S2666560323000075">5</a></sup>
    </p>
    <div id="rentBurdenPlot" style="width: 75%; height: auto;"></div>

    <h2>Personalized exploration via the dashboard</h2>
    <p>In the following dashboard, you will explore how the variables of rent, commute time, and salary interact with each other by seeing how high rent prices 
        may limit your housing options and how existing public transportation options may limit the areas where you are able to work. After completing this 
        personalized journey, the dashboard allows you to further investigate the crucial tradeoffs between rent and commute time budgets 
        and learn more about the current legislative proposals relevant to this issue. We list the process below:
    </p>
    <ol>
        <li>Enter the maximum amount you are willing to pay for rent (we recommend setting this to <b>at most</b> 30% of your pre-tax income)</li>
        <div>
            <img src={dashboard1} alt="Enter rent"/>
        </div>
        <li>Select a neighborhood to live in from the eligible options</li>
        <li>Enter the maximum amount of time you are willing to commute to work</li>
        <div>
            <img src={dashboard3} alt="Enter commute time"/>
        </div>
        <li>Select a neighborhood to work in from the eligible options</li>
        <li>Read through your personalized summary and learn more about current legislative proposals</li>
        <li>Return to the dashboard for an in-depth exploration of rent, commute time, and salary</li>
        <div>
            <img src={dashboardGIF} alt="Interactive exploration"/>
        </div>
    </ol>

    <button class="enter-dashboard-button" on:click={goToDashboard}>Enter the dashboard</button>
</div>

<style>
    @import url("$lib/global.css");

    .intro-container {
        margin: auto;
        width: 50%;
        line-height: 2;
    }

    .enter-dashboard-button {
        font-size: 20px;       /* Larger text inside the button */
        padding: 15px 30px;    /* Larger padding for bigger button size */
        background-color: #e0e0e0; /* Optional: background color */
        color: black;          /* Text color */
        border: none;          /* No border (customize as needed) */
        border-radius: 8px;    /* Rounded corners */
        cursor: pointer;       /* Cursor indicates clickable */
        transition: background-color 0.3s; /* Smooth transition for hover effect */
    }
    
    img {
        width: 80%;
        height: auto;
        max-width: 80%;
    }

</style>
