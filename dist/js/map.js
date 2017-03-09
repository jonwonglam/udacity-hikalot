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

  for (var i = 0; i < viewModal.resultList().length; i++) {
    var position = viewModal.resultList()[i].location;
    var title = viewModal.resultList()[i].title;

    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.Drop,
      id: i
    });

    markers.push(marker);
    bounds.extend(markers[i].position);
  }
  // Extend the boundaries of the map for each marker
  map.fitBounds(bounds);
}
