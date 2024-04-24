<script>
function goToDashboard(){
    window.location.href = '/zoning-dashboard-fp/dashboard';
    return false;
}
</script>

<div class="intro-container">
    <h2>How are transportation options and rent prices limiting your access to high-paying jobs?</h2>
    <p>As rent prices climb in the Boston area, many tenants are being driven farther away from the center of the city<sup><a href="https://www.cbsnews.com/boston/news/boston-high-rent-city-workers-city-council-residence-requirement/">1</a>, <a href="https://www.forbes.com/sites/andrewdepietro/2023/01/24/the-average-rent-in-boston-now-rivals-bay-area-cities/?sh=7e5080d9434b">2</a></sup>. Unfortunately, this displacement often means living farther away from areas that are dense with high-paying job opportunities. Our analyses found that in the Boston area, a <b>$100 decrease in rent</b> per bedroom is about equivalent to a <b>1 min 45 second increase in commute</b> time. But in addition to the time spent commuting every day, studies have also found that increased commute times are associated with reduced work and life satisfaction and decreased physical health<sup><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9819363/">3</a></sup>.</p>

    <p>In this visualization, you’ll explore how high rent prices reduce your housing options, then see how existing transportation options can limit the areas you’re able to work in, depending on how long you would be willing to commute.</p>
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