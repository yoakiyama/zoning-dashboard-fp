<div class="text-container">

<p>
    The code we used for data processing and transformation is available on
    <a href="https://github.com/yoakiyama/zoning-dashboard-fp">GitHub</a>.
    This project was developed by Emma Tysinger, Megan Le, Robert Calef, and Yo Akiyama, with guidance and feedback from the
    <a href="https://www.mapc.org/">Metropolitan Area Planning Commission (MAPC)</a>
    as well as Professors Catherine D'Ignazio and Arvind Satyanarayan.
</p>

<h2>Rent Data</h2>
<p>The rent price data represents the <a href="https://www.bostonhousing.org/BHA/media/Documents/Leased%20Housing/SAFMRs/2024-Payment-Standards-All-BR.pdf">Boston Housing Authority's (BHA) 2024 Payment Standards</a> across neighborhoods. These prices establish the maximum BHA subsidy for a unit, which are they are based on  <a href="https://www.huduser.gov/portal/datasets/fmr.html">U.S. Department of Housing and Urban Development (HUD) Metropolitan Area Fair Market Rents</a>
    and <a href="https://www.huduser.gov/portal/datasets/fmr.html">HUD Small Area Fair Market Rents</a>. These rents represent the 40th percentile rents in specific neighborhoods.</p>

<h2>Commute Time Data</h2>
<p>
    To calculate representative commute times between neighborhoods, we first calculated average travel times
    between MBTA stations from the
    <a href="https://mbta-massdot.opendata.arcgis.com/datasets/b08854b18ad942e4bc471c8c20e80792/about">2023 MBTA ridership data</a>.
    We then assigned MBTA stations to neighborhoods based on their geographic location using QGIS.
    Average commute times between neighborhoods was then calculated as the average of the minimum and maximum times between
    two stations in the respective neighborhoods.
</p>

<p>
    In our initial exploratory data analysis, we also analyzed responses from the 2017-2021
    <a href="https://www.bostonplans.org/getattachment/e8629081-b656-4c43-b38a-b0cb5e7e3b4b">American Community Survey</a>
    by looking at the relationship between commute times and other factors such as rent.
</p>

<h2>Employment Opportunities Data</h2>
<p>We obtained data from the <a href="https://www.census.gov/data/developers/data-sets/cbp-zbp/zbp-api.html">U.S. Census Bureau Zip Codes Business Patterns API</a>, which provided information about number of business establishments by industry, total employees, and total payroll. We then aggregated the zipcode-level data into Boston-area neighborhoods. To estimate average salary by neighborhood, we divided the total payroll by the number of employees. In our exploratory data analysis, we used normalized values (calculated by dividing by the neighborhood's population) to examine the relationship between these values and other variables such as rent.</p>
</div>
<style>
    @import url("$lib/global.css");
    .text-container {
        margin: auto;
        width: 100%;
        line-height: 2;
    }
</style>