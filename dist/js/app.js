// The App function is separate from the ViewModal to organize code better.
// It handles API requests as well as call initialization code.
var App = function() {

  // Client services to access the Foursquare API
  let CLIENT_ID = '2SYJIYT3OKJD4KNMXRBQ0RZBM30PNNRZ3QRGPJB2LJKOYT21';
  let CLIENT_SECRET = 'WJ0VZI2TE4AKYWPYQ11OASI0N3TXYYY52CZVEH12SX3EXX5X';

  // Variables to make a search request to the Foursquare API
  let location = 'San Francisco, CA';
  let query = 'trails'
  let url = 'https://api.foursquare.com/v2/venues/explore?near=' + location +
      '&query=' + query + '&venuePhotos=1';

  // This function will load the map, setup the sidebar, and make a request
  // to the Foursquare API
  this.init = function() {
    initSidebar();
    makeRequest();
  }

  // This function will add noUiSlider to the HTML as part of the app's initialization,
  // per noUiSlider's documentation.
  function initSidebar() {
    // Initialize range slider for sidebar using noUiSlider
    var range = document.getElementById('filter-range');

    range.style.width = '100%';
    range.style.margin = 'auto 0 30px';

    var miles = wNumb({
      decimals: 0,
      postfix: ' mi'
    });

    noUiSlider.create(range, {
      start: [ -1, 10],  // Create two handles
      step: 1,
      connect: true,  // Display a colored bar between handles
      range: {
        'min': 0,
        'max': 9
      },
      margin: 1,
      tooltips: true,
      format: miles,
      pips: {
        mode: 'count',
        values: 10,
        density: 10
      }
    });
  }

  // This function will make a request to the Foursquare API and call
  // parseResults in the ViewModal instance.
  function makeRequest() {
    $.ajax({
      method: 'GET',
      url: url,
      data: {
        v: 20170101,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }
    })
      .done(function( msg ) {
        // console.log(msg);
        viewModal.parseResults(msg.response);
        viewModal.sortByRating();
        setMarkers();   // From map.js, initialize the markers after data loaded
      });
  }
};

// The Result functional object takes in a json object from
// Foursquare's API and parses it for the app to use.
var Result = function(data) {
  this.id = ko.observable(0);
  this.title = data.venue.name;
  this.address = data.venue.location.address || 'No address';
  this.city = data.venue.location.city;
  this.rating = data.venue.rating;
  this.checkins = data.venue.stats.checkinsCount;
  this.checkinsFormat = checkinFormat.to(this.checkins) + ' checkins';
  this.url = data.tips[0].canonicalUrl;
  this.imgSrc = data.venue.featuredPhotos.items[0].prefix + 'original'+
  data.venue.featuredPhotos.items[0].suffix;
  this.trailLength = 0;
  this.location = {
    lat: data.venue.location.lat,
    lng: data.venue.location.lng
  };
}

var ViewModel = function() {
  var self = this;

  // Our array to hold all the parsed results
  this.resultList = ko.observableArray([]);
  this.filter = ko.observable("");

  // This function will parse the json data object into result objects,
  // updating the resultList array as it goes.
  this.parseResults = function(data) {
    console.log(data);
    let results = data.groups[0].items;
    // Do we need to clear self.resultList first?
    results.forEach(function(resultData) {
      self.resultList.push(new Result(resultData));
    });
    console.log(self.resultList()[0]);  // For debugging
  };

  // Filter functions: they will sort by a criteria and update
  // the result IDs and set the CSS on buttons.
  this.sortByRating = function() {
    setBtnClasses('#ratingsBtn');
    self.resultList.sort(function(a, b) {
      return (a.rating === b.rating) ? 0 : (a.rating > b.rating ? -1 : 1);
    });
    updateResultID();
    setMarkers();
  }

  this.sortByCheckins = function() {
    setBtnClasses('#checkinsBtn');
    $('#checkinsBtn').addClass('filter-btn-selected');
    self.resultList.sort(function(a,b) {
      return (a.checkins === b.checkins) ? 0 : (a.checkins > b.checkins ? -1 : 1);
    });
    updateResultID();
    setMarkers();
  }

  // This function will update our filteredItems list everytime the filter
  // observable changes. It is based on resultList, but doesn't modify it
  // directly. Thus our markers will be present, however the sidebar will be
  // updated with the filtered results.
  this.filteredItems = ko.computed(function() {
    var filter = this.filter().toLowerCase();
    // If our filter box is empty, return the original list
    if (!filter) {
      return self.resultList();
    }
    // Otherwise filter our array
    else {
      return ko.utils.arrayFilter(self.resultList(), function(result) {
        return result.title.toLowerCase().includes(filter);
      });
    }
  }, this);

  this.clearFilter = function() {
    self.filter("");
  }

  // This function will display the marker given a result index.
  // Triggered by clicking a result in the sidebar.
  this.showMarker = function(result) {
    var index = result.id() - 1;
    populateInfoWindow(markers[index], largeInfowindow, 'closeclick');
  }

  // This function will update the result IDs based off of their
  // position in the array. Called by the sorting functions.
  function updateResultID() {
    for (var i = 0; i < self.resultList().length; i++) {
      self.resultList()[i].id(i + 1);
    }
  }
}

// Helper function to format numbers with commas. (10000 -> 10,000)
var checkinFormat = wNumb({
  thousand: ','
});

// Helper function removes selected class from buttons and adds it
// to the button id passed in.
function setBtnClasses(selectedBtn) {
  $('#ratingsBtn').removeClass('filter-btn-selected');
  $('#checkinsBtn').removeClass('filter-btn-selected');
  $('#trailLengthBtn').removeClass('filter-btn-selected');
  $(selectedBtn).addClass('filter-btn-selected');
}

// Setup and start our App and ViewModal instances.
var app = new App();
var viewModal = new ViewModel();
app.init();
ko.applyBindings(viewModal);
