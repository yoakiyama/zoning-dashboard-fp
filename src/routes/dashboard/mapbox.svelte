<script>
    import mapboxgl from 'mapbox-gl';
    const accessToken = 'pk.eyJ1IjoiZXB0eXNpbmdlciIsImEiOiJjbHVoanlneWIycm14MmxvZTh2Y3VhYXFkIn0.lkhHKBe-C2_I9v2J-jJ2hg'; // Replace with your token
  
    onMount(() => {
      mapboxgl.accessToken = accessToken;
      map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/examples/cjfioozof002u2sr5k7t14dim', // Replace with your desired map style
        center: [-74.50, 40.7], // Replace with your initial center coordinates
        zoom: 9 // Set the initial zoom level
      });
    });
  </script>