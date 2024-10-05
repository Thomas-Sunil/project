// Global scope
let map;
let markers = [];
let locations = [];

// Initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 }, // Default center
        zoom: 8
    });

    // Add a click event listener on the map
    map.addListener('click', (event) => {
        addMarker(event.latLng);
        locations.push({ lat: event.latLng.lat(), lng: event.latLng.lng() });

        if (locations.length === 2) {
            fetchStreetViewImages(locations);
        }
    });
}

// Add a marker on the map
function addMarker(location) {
    const marker = new google.maps.Marker({
        position: location,
        map: map
    });
    markers.push(marker);
}

// Fetch Street View images based on selected locations
function fetchStreetViewImages(locations) {
    const imageUrls = locations.map(location => {
        return `https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${location.lat},${location.lng}&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg`;
    });

    // Update the fetch URL to point to your server
    fetch('http://localhost:3000/save-images', { // Use the correct protocol and domain
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrls })
    })
    .then(response => response.text())
    .then(data => {
        console.log('Success:', data);
        alert('Images saved successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving images');
    });
}

