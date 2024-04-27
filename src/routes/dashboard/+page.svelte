
<svelte:head>
	<title>FP2</title>
	<meta name="description" content="FP2 interactive map" />
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdn.plot.ly/plotly-latest.min.js" type="text/javascript"></script>
</svelte:head>

<script>
    import DashboardTab from "./Dashboard.svelte"
    import Methodology from "./Methodology.svelte"
    import Tabs from "./Tabs.svelte";

      let items = [
    { label: "Dashboard",
		 value: 1,
		 component: DashboardTab
		},
    { label: "Methodology",
        value: 2,
        component: Methodology
    }
  ];
</script>

<h1> Minimal Viable Product </h1>
<p> </p>
<Tabs {items} />

<!-- Map Display Options -->

<style>
    @import url("$lib/global.css");
    .closeButton:hover,
    .closeButton:focus {
        font-weight: bold;
        color: #d9534f;
        outline: none;
    }

    .popUp {
        position: absolute;   /* Absolute positioning relative to the nearest positioned ancestor */
        bottom: 0;            /* Aligns the container to the bottom */
        left: 0;              /* Aligns the container to the left */
        margin: 20px;         /* Adds some space from the corner edges */
        padding: 5px;        /* Padding inside the container */
        z-index: 1000;
        background-color: rgba(255, 255, 255, 0.9); /* Semi-transparent white background */
        border-radius: 8px;   /* Rounded corners for aesthetics */
        font-size: 16px;      /* Adequate font size for visibility */
        box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Subtle shadow for better readability */
        max-width: 400px;     /* Maximum width to avoid overly wide text block */
    }
    .checkboxContainer {
        position: relative; /* or 'absolute' if needed */
        z-index: 1000; /* higher than the map's z-index */
    }

    input[type='checkbox'] {
        accent-color: hsl(200, 50%, 50%);
    }

    .wrapper {
        position: absolute;
        margin: 20px;
        width: 300px;
        z-index: 1000;
        text-align: left;
        margin-top: 15px;
        font-size: 16px;
    }

    .checkboxContainer, .dropdownContainer {
        margin-bottom: 5px; /* Adds space between the checkbox and dropdown */
        width: 100%; /* Ensures children stretch to match the wrapper's width */
    }


</style>
