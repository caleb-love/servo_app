let spots = [
    {name: "General Assembly", location: {lat: -33.8712, lng: 151.2046}},
    {name: "Sydney Harbour Bridge", location: {lat: -33.8523, lng: 151.2108}},
    {name: "Queen Victoria Building", location: {lat: -33.8717, lng: 151.2067}},
    {name: "Central Station", location: {lat: -33.8832, lng: 151.2070}},
    {name: "Chinatown", location: {lat: -33.8790, lng: 151.2043}},
    {name: "Sydney Opera House", location: {lat: -33.8568, lng: 151.2153}},
    {name: "Sea Life Sydney Aquarium", location: {lat: -33.8696, lng: 151.2021}}
  ]
  
  function initMap() {
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: spots[0].location,
      });
      const infoWindow = new google.maps.InfoWindow({
        content: "",
        disableAutoPan: true,
      });
      // Create an array of alphabetical characters used to label the markers.
      const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      // Add some markers to the map.
      const markers = locations.map((position, i) => {
        const label = labels[i % labels.length];
        const marker = new google.maps.Marker({
          position,
          label,
        });
    
        // markers can only be keyboard focusable when they have click listeners
        // open info window when marker is clicked
        marker.addListener("click", () => {
          infoWindow.setContent(spots[i].name);
          infoWindow.open(map, marker);
        });
        return marker;
      });
    
      // Add a marker clusterer to manage the markers.
      new markerClusterer.MarkerClusterer({ markers, map }); // using cdn 
      // markerCluster
    }
    
    const locations = spots.map(spot => spot.location)
    
    window.initMap = initMap;
