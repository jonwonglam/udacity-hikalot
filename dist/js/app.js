var app = function() {
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
}();
