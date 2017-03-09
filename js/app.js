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
    viewModal.sortByRating();
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
      });
  }
};

// The Result functional object takes in a json object from
// Foursquare's API and parses it for the app to use.
var Result = function(data) {
  this.title = data.venue.name;
  this.address = data.venue.location.address || 'No address';
  this.city = data.venue.location.city;
  this.rating = data.venue.rating;
  this.checkins = data.venue.stats.checkinsCount;
  this.checkinsFormat = checkinFormat.to(this.checkins) + ' checkins';
  this.imgSrc = data.venue.featuredPhotos.items[0].prefix + 'original'+
    data.venue.featuredPhotos.items[0].suffix;
  this.url = data.tips[0].canonicalUrl;
  this.trailLength = 0;

  console.log(this);
}

var ViewModel = function() {
  var self = this;

  this.resultList = ko.observableArray([]);

  // This function will parse the json data object into result objects,
  // updating the resultList array.
  this.parseResults = function(data) {
    console.log(data);
    let results = data.groups[0].items;
    // Do we need to clear self.resultList first?
    results.forEach(function(resultData) {
      self.resultList.push(new Result(resultData));
    });
  };

  // Filter function
  this.sortByRating = function() {
    clearBtnClasses();
    $('#ratingsBtn').addClass('filter-btn-selected');
    self.resultList.sort(function(a, b) {
      return (a.rating === b.rating) ? 0 : (a.rating > b.rating ? -1 : 1);
    });
  }

  this.sortByCheckins = function() {
    clearBtnClasses();
    $('#checkinsBtn').addClass('filter-btn-selected');
    self.resultList.sort(function(a,b) {
      return (a.checkins === b.checkins) ? 0 : (a.checkins > b.checkins ? -1 : 1);
    });
  }
}

// Helper function to format numbers with commas.
var checkinFormat = wNumb({
  thousand: ','
});

var clearBtnClasses = function() {
  $('#ratingsBtn').removeClass('filter-btn-selected');
  $('#checkinsBtn').removeClass('filter-btn-selected');
  $('#trailLengthBtn').removeClass('filter-btn-selected');
}

// We setup our App and ViewModal instances.
var app = new App();
var viewModal = new ViewModel();
app.init();
ko.applyBindings(viewModal);
