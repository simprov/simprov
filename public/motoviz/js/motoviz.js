var circuitMap = dc.geoChoroplethChart("#circuit")
                   .height(575)
                   .width(700),
    bcDriver = dc.barChart("#driver")
                   .height(200)
                   .width(200),
    bcLap = dc.barChart("#lap")
                   .height(200)
                   .width(400),
    bcSpeed = dc.lineChart("#speed")
                   .height(150)
                   .width(600)
                   .renderArea(true),
    bcAcc = dc.lineChart("#accel")
                   .height(150)
                   .width(600)
                   .renderArea(true),
    bcRad = dc.lineChart("#radius")
                   .height(150)
                   .width(600)
                   .renderArea(true),
    decformat = d3.format(".2f"),

    ndx,

    groups = {},

    dimensions = {},

    dataRanges = {
      speed: [0, 0],
      acc: [0, 0],
      bank: [0, 0]
    },

    margins = {
      top: 20,
      right: 20,
      bottom: 0,
      left: 20
    };

function changeValueAccessor(chart, attribute) {
  var redraw = (attribute && attribute.hasOwnProperty('redraw') ?
    attribute.redraw : true);
  console.log("changeValueAccessor", attribute, redraw);
  // if (_.isArray(attribute.colorScale)) {
  //   chart.colors(
  //     d3.scale
  //       .quantize()
  //       .range(attribute.colorScale)
  //   );
  // } else {
  //   chart.colors(
  //     d3.scale
  //       .quantize()
  //       .range(colorbrewer.RdYlBu[11].reverse())
  //   );

  // }

  // console.log(
  //   "color domain:",
  //   d3.extent(
  //     groups.data.all(),
  //     function (d) {
  //       // console.log(d, d.value[attribute.name]);
  //       return d.value[attribute.name];
  //     }
  //   )
  // );

  chart.valueAccessor(
    function (d) {
      return d.value[attribute.name];
    }
  ).colorDomain(
    dataRanges[attribute.name]
  ).title(
    function (d) {
      // console.log(d);
      return "Fragment: " + d.key + "\n " + attribute.label +": " + decformat(d.value) +' '+ attribute.units;
    }
  );

  if (redraw) {
    $('[rel="metric"').html(attribute.label);
    var chartFilter = chart.filter();
    chart.filter(null)
         .filter(chartFilter);
    dc.redrawAll();

    // var dataFilter = chart.filters();
    // chart.filter(null);
    // ndx.remove();
    // chart.filter(dataFilter);
  }
}

d3.csv('data/lap_fragments_rows.csv')
  .get(
    function (err, data) {
      data = _(data)
        .chain()
        .filter(
          function (item, idx) {
            return (item.speed * 3.6 < 350);
          }
        )
        .map(
          function (item, idx) {
            var k,
                itemKeys = Object.keys(item);
            for (k in itemKeys) {
              item[itemKeys[k]] = +item[itemKeys[k]];
            }
            return item;
          }
        ).value();

      ndx = crossfilter(data);

      var all = ndx.groupAll(),

        addWeightedMean = function (prevValue, newValue, count) {
          return ((prevValue * (count - 1)) + newValue) / count;
        },

        rmWeightedMean = function (prevValue, oldValue, count) {
          if (count === 0) {
            return 0;
          } else {
            return ((prevValue * (count + 1)) - oldValue) / count;
          }
        };

      dimensions.data = ndx.dimension(
        function (d) {
          return d.fragment;
        }
      );

      groups.data = dimensions.data
        .group()
        .reduce(
          function reduceAdd(p, v) {
            p.count       += 1;
            p.t            = addWeightedMean(p.t, v.t, p.count);
            p.dist         = addWeightedMean(p.dist, v.dist, p.count);
            p.speed        = addWeightedMean(p.speed, v.speed, p.count);
            p.quad_speed  += Math.pow(v.speed, 2);
            p.speed_std    = (p.count > 1 ? Math.sqrt(Math.pow(p.speed, 2) - (p.quad_speed / p.count)) : 0);
            p.acc          = addWeightedMean(p.acc, v.acc, p.count);
            p.course       = addWeightedMean(p.course, v.course, p.count);
            p.bank         = addWeightedMean(p.bank, v.bank, p.count);
            p.abs_bank_diff    = addWeightedMean(p.abs_bank_diff, v.abs_bank_diff, p.count);
            p.radius       = addWeightedMean(p.radius, v.radius, p.count);
            p.radius_group = addWeightedMean(p.radius_group, v.radius_group, p.count);

            return p;
          },
          function reduceRemove(p, v) {
            // console.log(p, v);

            p.count       -= 1;
            p.t            = rmWeightedMean(p.t, v.t, p.count);
            p.dist         = rmWeightedMean(p.dist, v.dist, p.count);
            p.speed        = rmWeightedMean(p.speed, v.speed, p.count);
            p.quad_speed  -= Math.pow(v.speed, 2);
            p.speed_std    = (p.count > 1 ? Math.sqrt(Math.pow(p.speed, 2) - (p.quad_speed / p.count)) : 0);
            p.acc          = rmWeightedMean(p.acc, v.acc, p.count);
            p.course       = rmWeightedMean(p.course, v.course, p.count);
            p.bank         = rmWeightedMean(p.bank, v.bank, p.count);
            p.abs_bank_diff    = rmWeightedMean(p.abs_bank_diff, v.abs_bank_diff, p.count);
            p.radius       = rmWeightedMean(p.radius, v.radius, p.count);
            p.radius_group = rmWeightedMean(p.radius_group, v.radius_group, p.count);

            return p;
          },
          function reduceInit() {
            return {
              count: 0,
              t: 0,
              dist: 0,
              speed: 0,
              quad_speed: 0,
              speed_std: 0,
              acc: 0,
              course: 0,
              bank: 0,
              abs_bank_diff: 0,
              radius: 0,
              radius_group: 0
            };
          }
        );


    dimensions.driver = ndx.dimension(
      function (d) {
        return d.driver;
      }
    );

    groups.driver = dimensions.driver.group();

    dimensions.bank = ndx.dimension(
      function (d) {
        return Math.floor(d.bank / 5) * 5;
      }
    );

    groups.bank = dimensions.bank.group();

    dimensions.speed = ndx.dimension(
      function (d) {
        return Math.floor(d.speed * 3.6 / 10) * 10;
      }
    );

    dataRanges.bank = d3.extent(
      groups.data.all(),
      function (d) {
        return d.value.bank;
      }
    );

    groups.speed = dimensions.speed.group();

    dataRanges.speed = d3.extent(
      groups.data.all(),
      function (d) {
        return d.value.speed;
      }
    );

    dimensions.acc = ndx.dimension(
      function (d) {
        return Math.floor(d.acc * 3.6 / 10) * 10;
      }
    );

    groups.acc = dimensions.acc.group();

    dataRanges.acc = d3.extent(
      groups.data.all(),
      function (d) {
        return d.value.acc;
      }
    );

    console.log(dataRanges);

    dimensions.lap = ndx.dimension(
      function (d) {
        return d.lap || 0;
      }
    );

    groups.lap = dimensions.lap.group();

    bcLap
      .dimension(dimensions.lap)
      .group(groups.lap)
      .keyAccessor(
        function (d) {
          return d.key;
        }
      )
      .valueAccessor(
        function (d) {
          return d.value;
        }
      )
      .margins(margins)
      .x(
        d3.scale
          .ordinal()
          .domain([2, 3, 4, 5, 6, 7])
      )
      .y(
        d3.scale
          .linear()
          .domain(
            d3.extent(
              groups.lap.all(),
              function (d) {
                return d.value;
              }
            )
          )
      )
      .elasticX(true)
      .elasticY(true)
      .xAxisLabel('# Lap')
      .yAxisLabel('data points')
      .gap(5)
      .xUnits(dc.units.ordinal);

    bcLap
      .xAxis()
      .tickFormat(
        function (v) {
          return parseInt(v, 10);
        }
      );

    bcDriver
      .dimension(dimensions.driver)
      .group(groups.driver)
      .margins(margins)
      .x(
        d3.scale
          .ordinal()
          .range([1, 2])
      )
      .y(
        d3.scale
          .linear()
          .domain(
            d3.extent(
              groups.driver.all(),
              function (d) {
                return d.value;
              }
            )
          )
      )
      .elasticX(true)
      .elasticY(true)
      .xAxisLabel('Driver')
      //.gap(10)
      .yAxisLabel('data points')
      .xUnits(dc.units.ordinal);

    bcDriver
      .xAxis()
      .tickValues(['Racer', 'Journalist']);


    bcRad
      .dimension(dimensions.bank)
      .group(groups.bank)
      .margins(margins)
      .x(
        d3.scale
          .linear()
          .range([0, 18])
          .domain([0, 70])
      )
      .label(function (d) {
        return d * 5;
      })
      .y(
        d3.scale
          .linear()
          .domain(
            d3.extent(
              groups.bank.all(),
              function (d) {
                return d.value;
              }
            )
          )
      )
      .elasticX(true)
      .elasticY(true)
      .xAxisLabel('Banking angle (degrees)')
      .yAxisLabel('data points');

    bcSpeed
      .dimension(dimensions.speed)
      .group(groups.speed)
      .margins(margins)
      .x(
        d3.scale
          .linear()
          .domain(
            d3.extent(
              groups.speed.all(),
              function (d) {
                return d.key;
              }
            )
          )
      )
      .y(
        d3.scale
          .linear()
          .domain(
            d3.extent(
              groups.speed.all(),
              function (d) {
                return d.value;
              }
            )
          )
      )
      .xAxisLabel('Speed (km/h)')
      .yAxisLabel('data points')
      .elasticX(true)
      .elasticY(true);

    bcAcc
      .dimension(dimensions.acc)
      .group(groups.acc)
      .margins(margins)
      .x(
        d3.scale
          .linear()
          .domain(
            d3.extent(
              groups.acc.all(),
              function (d) {
                return d.key;
              }
            )
          )
      )
      .y(
        d3.scale
          .linear()
          .domain(
            d3.extent(
              groups.acc.all(),
              function (d) {
                return d.value;
              }
            )
          )
      )
      .xAxisLabel('Accelleration (m/s\xb2)')
      .yAxisLabel('data points')
      .elasticX(true)
      .elasticY(true);

    d3.json(
      "data/circuit.geojson",
      function (err, fragmentsJson) {
        $("#loading").hide();
        circuitMap
          .dimension(dimensions.data)
          .group(groups.data)
          .keyAccessor(
            function (d) {
              // console.log(d);
              return "f" + d.key;
            })
            .on(
            'renderlet',
            function (chart) {
                changeValueAccessor(
                    chart,
                    {
                        name: 'speed',
                        label: 'Average speed',
                        units: 'm/s',
                        redraw: false
                    }
                );
                console.log("DOMAIN:", chart.colorDomain());
                const quantiles = d3.scale.quantile().domain(chart.colorDomain()).range(colorbrewer.RdYlBu[10]).quantiles();
                console.log(quantiles);
                chart.colors(d3.scale.threshold().domain([1e-5,...quantiles]).range(['gray',...colorbrewer.RdYlBu[10].slice().reverse()]));
              chart
                .selectAll("g.fragment > path")
                .attr("stroke-width", "9px")
                .each(
                  function (d, i) {
                    d3.select(this)
                      .attr(
                        'stroke',
                        d3.select(this)
                          .attr('fill')
                      );
                  }
                );
              chart
                .selectAll(".fragment > path")
                .on(
                  "click",
                  function(d){
                    chart.filter(null);
                  }
                );
            }
          ).projection(
            d3.geo
              .mercator()
              .translate([351, 285])
              .center([-6.57258, 37.3607])
              .scale(3300000)

          ).overlayGeoJson(
            fragmentsJson.features,
            "fragment",
            function (d) {
              return 'f' + d.properties.name.substr(9);
            }
          ).title(
            function (d) {
              return "Fragment: " + d.key + "\n Value: " + decformat(d.value) + " m/s";
            }
          );

        changeValueAccessor(
          circuitMap,
          {
            name: 'speed',
            label: 'Average speed',
            units: 'm/s',
            redraw: false
          }
        );

        dc.renderAll();
      }
    );
  }
);