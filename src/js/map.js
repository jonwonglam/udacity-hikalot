var map;

var markers = [];
var largeInfowindow, hoverInfowindow;
var autocomplete, geocoder;
var bounds;

// Function is called when the maps API script is loaded
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  // Starting center is San Francisco :)
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.7749, lng: -122.4194},
    zoom: 12,
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
    },
    mapTypeControlOptions: {
         position: google.maps.ControlPosition.TOP_RIGHT
    },
  });
  bounds = new google.maps.LatLngBounds();
  google.maps.event.addDomListener(window, 'resize', function() {
    if (bounds) {map.fitBounds(bounds)};
  });
  // InfoWindow that is shown on sidebar click events
  largeInfowindow = new google.maps.InfoWindow();
  // Setup autocomplete in the location searchbar
  initSearch()
}

// Function that gets called as an html attribute if the api is unable
// to be reached.
function loadError() {
  alert("Google maps was unable to be loaded!");
}

function initSearch() {
  var input = document.getElementById('location-input');
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);
  geocoder = new google.maps.Geocoder();
}

function searchPlace(val) {
  // Close the any infowindos that are open
  largeInfowindow.close();

  // Lookup address and get lat lng
  geocodeAddress(val, geocoder, map, app);
}

function geocodeAddress(address, geocoder, resultsMap, app) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      app.location = results[0].formatted_address;
      app.url = 'https://api.foursquare.com/v2/venues/explore?near=' + app.location +
          '&query=' + app.query + '&venuePhotos=1';
      app.makeRequest();
    } else {
      alert("Sorry, Google couldn't find that location.");
    }
  });
}

// Reset and populate marker list, pulling data from resultList in
// the ViewModal. Accessing it globally to save time copying it over.
function setMarkers(list) {
  // Our custom marker icon
  var locationIcon = {
        anchor: new google.maps.Point(11,17),
        path: 'M10,2A5,5,0,0,0,5,7c0,4.77,5,11,5,11s5-6.23,5-11A5,5,0,0,0,10,2Z',
        fillColor: '#4bc470',
        fillOpacity: 0.9,
        scale: 2.5,
        strokeColor: '#38a659',
        strokeWeight: 1,
        labelOrigin: new google.maps.Point(10, 8)
      };
  // Reset bounds variable
  bounds = new google.maps.LatLngBounds();
  // Clear the markers array before repopulating it
  deleteMarkers();
  // Use results from resultList to populate marker information.
  var result;
  for (var i = 0; i < list.length; i++) {
    // Create a local copy for easy access
    result = list[i];
    // Create a new marker for each result
    var marker = new google.maps.Marker({
      map: map,
      position: result.location,
      label: {
        text: result.id() + '',
        color: 'white',
        fontSize: '12px',
        fontWeight: '500'
      },
      name: result.title,
      imgSrc: result.imgSrc,
      address: result.address,
      city: result.city,
      checkins: result.checkinsFormat,
      rating: result.rating,
      url: result.url,
      icon: locationIcon,
    });
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      animateMarker(-1, this);
      populateInfoWindow(this, largeInfowindow, 'closeclick');
    });
    // Show the hoverInfoWindow when a mouseover happens on the marker.
    marker.addListener('mouseover', function() {
      // populateInfoWindow(this, hoverInfowindow, 'mouseout');
    });
    bounds.extend(markers[i].position);
  }
  // Extend the boundaries of the map for each marker if zoom option is set
  map.fitBounds(bounds);
}

// This function will show the infoWindow for a given marker. We also
// specify the close event here.
function populateInfoWindow(marker, infoWindow, onCloseEvent) {
  // Always close the existing infowindow first
  largeInfowindow.close();
  // Set the infoWindow on the marker
  infoWindow.marker = marker;
  infoWindow.setContent(
    '<div class=" d-flex">' +
      '<img class="result-img" src="' + marker.imgSrc + '">' +
      '<div class="result-text-container">' +
        '<h3 class="result-title">' + marker.label.text + '. ' + marker.name + '</h3>' +
        '<h4 class="result-subtitle">' + marker.address + '</h4>' +
        '<h4 class="result-subtitle">' + marker.city + '</h4>' +
        '<div class="result-details d-flex align-items-center">' +
          '<span class="result-icon"><i class="fa fa-star" aria-hidden="true"></i></span>' +
          '<h5>' + marker.checkins + '</h5>' +
          '<span class="result-icon"><i class="fa fa-blind" aria-hidden="true"></i></span>' +
          '<h5>' + '6.2 miles round trip' + '</h5>' +
        '</div>' +
      '<div>' +
      '<div class="rating">' + marker.rating + '</div>' +
    '</div>' + '</div>' + '</div>' +
    '<div class="result-link">' + '<a target="_blank" href="https://foursquare.com/v/' + marker.url + '">See on Foursquare</a>' + '</div>'
  );
  // Display the infowindow
  infoWindow.open(map, marker);

  marker.addListener(onCloseEvent, function() {
    infoWindow.marker = null;
  });

  infoWindow.addListener(onCloseEvent, function() {
    // We only set the marker to null, we don't close it.
    // This is so the user can click on the link. A better way to allow
    // the user to click on the link would be to have an mouseover event
    // attached to the infowindow as well.
    infoWindow.marker = null;
  })
}

// Can pass in an index or a marker.
function animateMarker(index, marker) {
  var marker = markers[index] || marker;
  if (marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE)
    window.setTimeout(function() {
      marker.setAnimation(null);
    }, 500);
  }
}

// Hides markers that aren't found in the passed in array
function hideMarkers(array) {
  var validMarker = false;
  for (var i = 0; i < markers.length; i++) {
    for (var j = 0; j < array.length; j++) {
      if (markers[i].name === array[j].title) {
        validMarker = true;
        break;
      }
    }
    validMarker ? markers[i].setVisible(true) : markers[i].setVisible(false);
    validMarker = false;
  }
}

// Sets the map on all markers in the array.
function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}
