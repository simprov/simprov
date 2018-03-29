# motoviz
A data visualization performed with DC.js see https://marioalberich.com/motoviz/

## What's that

This is the result of my participation in a data visualization contest to analyze the result of two motorcycle racers.  After processing the data, which included sensors-generated records, geographic coordinates and time-based records, I decided to split the race circuit in 600 data slots in order to make it visualizable and analyze the multiple dimensions that could be handled.

In order to make the most interactive possible the visualization, I used the DC.js library, which allows to interact over the charts by filtering data.

The data visualization is provided as is in the hope that it'll be useful, but no liability is provided by any change in the data. Any further modification of the data structure and the charts will need some skills on Javascript, DC.js and/or D3.js.

## How to use it for your own purposes

First of all, you'll need to create a CSV file like the one being used at https://marioalberich.com/motoviz/data/lap_fragment_rows.csv, which contains the columns:

* empty title -> id: containig the unique identifier of the data record
* fragment: identifying the circuit data slot
* driver: either 1 or 2
* lap: lap number
* speed: in meters/second
* acceleration: meters/second^2
* bank: is the banking angle (the inclination of the motorcycle)

On the other side, there's the geojson file containing the coordinates of the circuit. Those are the actual gps coordinates, and thus you'll need to position your specific map into the corresponding bounding box.

The GEOJSON file also contains each geographic slot being identified in order to ease the integration with the data changes.

As told before, the geojson file is provided in the repository for demostration purposes but you'll need to generate your own, and also change the coordinate orientation in the geographic chart (circuitMap variable in the motoviz.js file, handling the dc.geoChoroplethChart instance that renders the circuit map).

# Credits and acknowledgements

The repository already includes all the required dependencies, which is how they were used in the original contenst. Although this makes it easier the starting point, the best practice would be to move those dependencies to a package manager.  You're more than welcome on doing so and sharing it with the rest of the community by performing a pull request.

The following is a list of the libraries and tools being used:

* jQuery
* Twitter &trademark; Bootstrap
* D3.js
* Crossfilter
* DC.js
* Font-awesome
* Color brewer.
* UnderscoreJS
