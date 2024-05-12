
<svelte:head>
	<title>Commute Time Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdn.plot.ly/plotly-latest.min.js" type="text/javascript"></script>
</svelte:head>

<script>
    import Dashboard from "./Dashboard.svelte";
    import DashboardTab from "./Dashboard.svelte"
    import Methodology from "./Methodology.svelte"
    import Resources from "./Resources.svelte"
    import Tabs from "./Tabs.svelte";

    let items = [
        { label: "Dashboard",
            value: 1,
            component: DashboardTab
        },
        { label: "Methodology",
            value: 2,
            component: Methodology
        },
        { label: "What's next?",
            value: 3,
            component: Resources
        }
    ];
    let activeTabValue = 1;
    const handleClick = tabValue => () => (activeTabValue = tabValue);

    let narrativeComplete;
    let dashboard;

    $: {
        if (narrativeComplete) {
            activeTabValue = 3;
            narrativeComplete = false;
            dashboard = true;
        }
        console.log("narrative: ", narrativeComplete);
        console.log("dashboard: ", dashboard);
    }
</script>

<ul>
{#each items as item}
    <li class={activeTabValue === item.value ? 'active' : ''}>
        <span on:click={handleClick(item.value)}>{item.label}</span>
    </li>
{/each}
</ul>

<div class="box" style:display={activeTabValue == 1 ? null : 'none'}>
    <Dashboard bind:narrativeComplete={narrativeComplete} bind:dashboard={dashboard}/>
</div>
<div class="box" style:display={activeTabValue == 2 ? null : 'none'}>
    <Methodology/>
</div>
<div class="box" style:display={activeTabValue == 3 ? null : 'none'}>
    <Resources/>
</div>

<!-- Map Display Options -->

<style>
    @import url("$lib/global.css");

    .box {
		margin-bottom: 10px;
		padding: 10px;
		border: 1px solid #dee2e6;
    border-top: 0;
    border-bottom: 0;
    border-left: 0;
    border-right: 0;
	}
  ul {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
    border-bottom: 1px solid #dee2e6;
  }
	li {
		margin-bottom: -1px;
	}

  span {
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  span:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
  }

  li.active > span {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }
</style>
