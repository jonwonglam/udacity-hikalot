'use-strict';

// The App function is separate from the ViewModal to organize code better.
// It handles API requests as well as call initialization code.
var App = function() {
  // Client services to access the Foursquare API
  var CLIENT_ID = '2SYJIYT3OKJD4KNMXRBQ0RZBM30PNNRZ3QRGPJB2LJKOYT21';
  var CLIENT_SECRET = 'WJ0VZI2TE4AKYWPYQ11OASI0N3TXYYY52CZVEH12SX3EXX5X';

  // Variables to make a search request to the Foursquare API
  this.location = 'San Francisco, CA';
  this.query = 'trails'
  this.url = 'https://api.foursquare.com/v2/venues/explore?near=' + this.location +
      '&query=' + this.query + '&venuePhotos=1';

  // This function will load the map, setup the sidebar, and make a request
  // to the Foursquare API
  this.init = function() {
    this.makeRequest();
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
  this.makeRequest = function() {
    // Create our AJAX request
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      alert("Sorry, can't connect to the Foursquare server");
      return false;
    }
    // Setup the function to execute on result as well as error handling
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState == XMLHttpRequest.DONE) {
        if (httpRequest.status == 200) {
          var response = JSON.parse(httpRequest.responseText);
          viewModal.parseResults(response["response"]);
          viewModal.sortByRating();
          setMarkers(viewModal.resultList());   // From map.js, initialize the markers after data loaded
        } else if (httpRequest.status == 400) {
          alert('There was an error 400');
        } else {
          alert('Error, something other than 200 was returned');
        }
      }
    };
    // Once it's all setup, make the request
    httpRequest.open('GET', this.url + '&v=20170101' + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET);
    httpRequest.send();
  }
};

// The Result functional object takes in a json object from
// Foursquare's API and parses it for the app to use.
var Result = function(data) {
  this.id = ko.observable(0);
  this.title = data.venue.name;
  this.address = data.venue.location.address || 'No address';
  this.city = data.venue.location.city;
  this.rating = data.venue.rating || 0.0;
  this.checkins = data.venue.stats.checkinsCount;
  this.checkinsFormat = checkinFormat.to(this.checkins) + ' checkins';
  this.url = data.venue.id;
  if (data.venue.featuredPhotos) {
      this.imgSrc = data.venue.featuredPhotos.items[0].prefix + '100x100'+
    data.venue.featuredPhotos.items[0].suffix;
  } else {
    this.imgSrc = 'https://ss3.4sqi.net/img/categories_v2/parks_outdoors/hikingtrail_512.png';
  }
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
  this.userLocation = ko.observable('');
  this.filter = ko.observable('');

  // This function will parse the json data object into result objects,
  // updating the resultList array as it goes.
  this.parseResults = function(data) {
    console.log(data);
    // Set the results to the data we received in json form
    var results = data.groups[0].items;
    // Remove the previous items in resultList when doing a fresh search
    self.resultList.removeAll();
    // Populate the results
    results.forEach(function(resultData) {
      self.resultList.push(new Result(resultData));
    });
    console.log(self.resultList()[0]);  // For debugging
  };

  // Filter functions: they will sort by a criteria and update
  // the result IDs and set the CSS on buttons.
  this.sortByRating = function() {
    setBtnClasses('ratingsBtn');
    self.resultList.sort(function(a, b) {
      return (a.rating === b.rating) ? 0 : (a.rating > b.rating ? -1 : 1);
    });
    updateResultID();
    setMarkers(self.resultList());
  }

  this.sortByCheckins = function() {
    setBtnClasses('checkinsBtn');
    self.resultList.sort(function(a,b) {
      return (a.checkins === b.checkins) ? 0 : (a.checkins > b.checkins ? -1 : 1);
    });
    updateResultID();
    setMarkers(self.resultList());
  }

  // This function will intercept the filteredItems.computed and pass it on
  // to the google maps marker's list
  ko.extenders.notifyMarkers = function(target) {
    target.subscribe(function(array) {
      hideMarkers(array);
    });
    return target;
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
  }, this)
    // Add our subscriber and limit the function to run once every 50ms
    .extend({notifyMarkers: '', rateLimit: 50});

  // Helper function that sets the filter input box value to ""
  this.clearFilter = function() {
    self.filter('');
  }

  this.search = function() {
    searchPlace(this.userLocation());
  }

  // This function will display the marker given a result index.
  // Triggered by clicking a result in the sidebar.
  this.showMarker = function(result) {
    var index = result.id() - 1;
    animateMarker(index);
    populateInfoWindow(markers[index], largeInfowindow, 'closeclick');
    scrollToTop();
  }

  // This function will toggle the slide-in animation for the filter module
  // which happens on a small screen.
  this.toggleFilters = function() {
    document.getElementById('filters').classList.toggle('slide-in');
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
  document.getElementById('ratingsBtn').classList.remove('filter-btn-selected');
  document.getElementById('checkinsBtn').classList.remove('filter-btn-selected');
  document.getElementById('trailLengthBtn').classList.remove('filter-btn-selected');
  document.getElementById(selectedBtn).classList.add('filter-btn-selected');
}

function scrollToTop() {
  if (window.innerWidth < 780) {
    window.scrollTo(0, 0);
  }
}

// Setup and start our App and ViewModal instances.
var app = new App();
var viewModal = new ViewModel();
app.init();
ko.applyBindings(viewModal);
