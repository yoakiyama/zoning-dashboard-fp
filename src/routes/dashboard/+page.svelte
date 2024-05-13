
<svelte:head>
	<title>Commute Time Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdn.plot.ly/plotly-latest.min.js" type="text/javascript"></script>
</svelte:head>

<script>
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
</script>

<Tabs {items} />

<!-- Map Display Options -->

<style>
    @import url("$lib/global.css");
</style>
