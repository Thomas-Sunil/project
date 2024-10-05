let map;
let markers = [];
let directionsService;
let directionsRenderer;

function initMap() {
    // Initialize the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 7
    });

    // Create DirectionsService and DirectionsRenderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Initialize Autocomplete only after the map is ready
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');

    // Check if elements exist
    if (originInput && destinationInput) {
        new google.maps.places.Autocomplete(originInput);
        new google.maps.places.Autocomplete(destinationInput);
    }

    // Add event listener for fetching images
    const fetchImagesButton = document.getElementById('fetch-images');
    if (fetchImagesButton) {
        fetchImagesButton.addEventListener('click', fetchStreetViewImages);
    }

    // Add click listener to the map to add markers
    map.addListener('click', (event) => {
        if (markers.length < 2) {
            const marker = new google.maps.Marker({
                position: event.latLng,
                map: map,
            });
            markers.push(marker);
        }
    });
}

function fetchStreetViewImages() {
    if (markers.length < 2) {
        alert('Please select two locations on the map.');
        return;
    }

    const origin = markers[0].getPosition();
    const destination = markers[1].getPosition();

    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);
                const route = response.routes[0].legs[0];
                const waypoints = route.steps.map(step => step.start_location);

                // Now fetch street view images along the waypoints
                saveStreetViewImages(waypoints);
            } else {
                console.error('Directions request failed due to ' + status);
            }
        }
    );
}

function saveStreetViewImages(waypoints) {
    const imageUrls = waypoints.map(location => {
        return `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${location.lat()},${location.lng()}&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg`;
    });

    // Make POST request to save images
    fetch('http://localhost:3000/save-images', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrls }),
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
