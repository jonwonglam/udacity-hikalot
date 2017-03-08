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
        vm.parseResults(msg.response);
      });
  }
};

var Result = function(data) {
  this.title = ko.observable(data.venue.name);
  this.address = ko.observable(data.venue.location.address || 'No address');
  this.city = ko.observable(data.venue.location.city);
  this.rating = ko.observable(data.venue.rating);
  this.checkins = ko.observable(checkinFormat.to(data.venue.stats.checkinsCount) + ' checkins');
  this.imgSrc = ko.observable(data.venue.featuredPhotos.items[0].prefix + 'original' +
    data.venue.featuredPhotos.items[0].suffix);
  this.url = ko.observable(data.tips[0].canonicalUrl);
  this.trailLength = ko.observable(0);

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

}

// Helper function to format numbers with commas.
var checkinFormat = wNumb({
  thousand: ','
});

// We setup our App and ViewModal instances.
var app = new App();
var vm = new ViewModel();
app.init();
ko.applyBindings(vm);
