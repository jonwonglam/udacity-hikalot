var map;

var markers = [];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.7749, lng: -122.4194},
    zoom: 12,
    zoomControl: true,
      zoomControlOptions: {
          position: google.maps.ControlPosition.TOP_LEFT
      },
  });

  setMarkers();
}

function setMarkers() {
  var bounds = new google.maps.LatLngBounds();
  var largeInfowindow = new google.maps.InfoWindow();
  var hoverInfowindow = new google.maps.InfoWindow();

  var locationIcon = {
        path: 'M10,2A5,5,0,0,0,5,7c0,4.77,5,11,5,11s5-6.23,5-11A5,5,0,0,0,10,2Z',
        fillColor: '#000',
        fillOpacity: 0.8,
        scale: 2.5,
        strokeColor: '#484e56',
        strokeWeight: 1,
        labelOrigin: new google.maps.Point(10, 8)
      };

  var result;

  for (var i = 0; i < viewModal.resultList().length; i++) {
    // Create a local copy for easy access
    result = viewModal.resultList()[i];
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
      checkins: result.checkins,
      rating: result.rating,
      url: result.url,
      icon: locationIcon,
      // animation: google.maps.Animation.Drop,
    });

    // Add marker to the list
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {

    });
    marker.addListener('mouseover', function() {
      populateInfoWindow(this, hoverInfowindow, 'mouseout');
    });
    bounds.extend(markers[i].position);
  }
  // Extend the boundaries of the map for each marker
  map.fitBounds(bounds);
}

function populateInfoWindow(marker, infoWindow, onCloseEvent) {
  if (infoWindow.marker == null) {
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
      '<div class="result-link">' + '<a href="' + marker.url + '">See on Foursquare</a>' + '</div>'
    );
    infoWindow.open(map, marker);

    marker.addListener('mouseout', function() {
      // infoWindow.close();
      infoWindow.marker = null;
    });
  }
}
