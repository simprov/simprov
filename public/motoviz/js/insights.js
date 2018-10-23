
function bankingDifferences() {
  changeValueAccessor(
    circuitMap,
    {
      name: 'bank',
      label: 'Banking angle',
      units: 'deg'
    }
  );
  bcDriver.filterAll().filter(1);
  dc.redrawAll();
  $("#insightExplain").html(
    '<h4>Racer is more regular and fast on banking</h4>' +
    '<p>' +
      'The colors on the track are more regular in the case of the racer, ' +
      'meaning that <strong>the racer is more stable on the banking direction</strong>, ' +
      'while the journalist tends to correct his banking along the track. ' +
    '</p>' +
    '<p>' +
      'Although this, banking itself doesn\'t seem to provide a good insight, except for the fact that ' +
      'both racers seem to have a &quot;diferent understanding&quot; on how to deal with the circuit track.' +
    '</p>'
  );
  $("#insightExplain").show();
}

function accelerationPatterns() {
  changeValueAccessor(
    circuitMap,
    {
      name: 'acc',
      label: 'Average acceleration',
      units: 'm/s\xb2;'/*,
      colorScale: _(colorbrewer.RdYlBu[11]).sortBy(function (item, idx) { return -idx;}),
      redraw: false*/
    }
  );
  bcDriver.filterAll().filter(1);
  dc.redrawAll();
  $("#insightExplain").html(
    '<h4>Smoother brake/acceleration patterns</h4>' +
    '<p>' +
      'The colors on acceleration/brake are more regular (less hot-cold colors switches in short intervals), ' +
      'which leads to a smoother stable driving outcome.' +
      'The behavior of the racer on every curve is more regular regarding on the maneuver: the ' +
      'brake-entry-exit-accelerate pattern is more clear. Also, the acceleration is higher in racer\'s case.' +
    '</p>' +
    '<p>' +
      'At the end, it leads to losing top speed on the rects' +
    '</p>'
  );
  $("#insightExplain").show();
}

function speedPatterns() {
  changeValueAccessor(
    circuitMap,
    {
      name: 'speed',
      label: 'Average speed',
      units: 'm/s'/*,
      colorScale: colorbrewer.RdYlBu[11],
      redraw: false*/
    }
  );
  $("#insightExplain").html(
    '<h3>More profit from rects, banking right on time</h3>' +
    '<p>' +
      'The driver gets more speed from the main rect.' +
      'Also, he uses better the intermediate rects between sharp curves, and delays the brake until ' +
      'The curve is quite near. ' +
    '</p>' +
    '<p>' +
      'Beased on (at least) the best lap\'s records, the journalist seems to go into the curves a bit too much fast, ' +
      'which forces him to bank too much, and exit from the curve with more slowly.' +
    '</p>'
  );
  $("#insightExplain").show();
}

function switchDriver() {
  var filters = bcDriver.filters(),
      currentDriver;
  if (filters.length === 0 || filters.length == 2) {
    currentDriver = 1;
  } else {
    currentDriver = (filters[0] % 2) + 1;
  }
  bcDriver
    .filterAll()
    .filter(currentDriver);

  dc.redrawAll();
}

function switchCentralLaps() {
  var currentLapSet,
      filters = bcLap.filters();
  console.log(filters);
  if (filters.length === 0 || filters.length > 3) {
    currentLapSet = [3, 4, 5];
  } else {
    currentLapSet = [];
  }
  bcLap.filterAll();

  _(currentLapSet).each(
    function (item, idx) {
      bcLap.filter(item);
    }
  );

  dc.redrawAll();
}

function switchDriverBest() {
  var bestLaps = [3, 7],
      filters = bcDriver.filters(),
      currentDriver,
      currentLap;
  if (filters.length === 0 || filters.length == 2) {
    currentDriver = 1;
  } else {
    currentDriver = (filters[0] % 2) + 1;
  }
  currentLap = bestLaps[currentDriver - 1];
  bcDriver
    .filterAll()
    .filter(currentDriver);

  bcLap
    .filterAll()
    .filter(currentLap);

  dc.redrawAll();
}

function showAcceleration() {
  changeValueAccessor(
    circuitMap,
    {
      name: 'acc',
      label: 'Mean acceleration',
      units: 'm/s2;',
      colorScale: _(colorbrewer.RdYlBu[11]).sortBy(function (item, idx) { return -idx;}),
      redraw: false
    }
  );

  dc.redrawAll();
}
