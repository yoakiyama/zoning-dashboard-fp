<p>The code we used for data processing and transformation is available on <a href="https://github.com/yoakiyama/zoning-dashboard-fp">GitHub</a>. This project was developed with guidance and feedback from the <a href="https://www.mapc.org/">Metropolitan Area Planning Commission (MAPC)</a>.</p>

<h2>Rent Data</h2>
<p>We used rental data from <a href="https://www.zillow.com/research/data/">Zillow</a> to calculate average rent by neighborhood. We divided the rent by number of bedrooms when comparing values across neighborhoods. We also tracked average price by unit type (i.e., number of bedrooms) per neighborhood.</p>

<h2>Commute Time Data</h2>
<p>To calculate representative commute times between neighborhoods, we first calculated average travel times between MBTA stations from the <a href="https://mbta-massdot.opendata.arcgis.com/datasets/b08854b18ad942e4bc471c8c20e80792/about">MBTA ridership data</a>. For each neighborhood, we then computed []. In our initial exploratory data analysis, we also analyzed responses from the 2017-2021 <a href="https://www.bostonplans.org/getattachment/e8629081-b656-4c43-b38a-b0cb5e7e3b4b">American Community Survey</a> by looking at the relationship between commute times and other factors such as rent.</p>

<h2>Employment Opportunities Data</h2>
<p>We obtained data from the <a href="https://www.census.gov/data/developers/data-sets/cbp-zbp/zbp-api.html">U.S. Census Bureau Zip Codes Business Patterns API</a>, which provided information about number of business establishments by industry, total employees, and total payroll. We then aggregated the zipcode-level data into Boston-area neighborhoods. To estimate average salary by neighborhood, we divided the total payroll by the number of employees. In our exploratory data analysis, we used normalized values (calculated by dividing by the neighborhood's population) to examine the relationship between these values and other variables such as rent.</p>

<style>
    @import url("$lib/global.css");
</style>