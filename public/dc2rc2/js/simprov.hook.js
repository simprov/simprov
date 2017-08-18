let simprov = {};
let dataStreamerLink = {};

async function initializeSimprov() {
// Configure SIMProv
    let configuration = {
        uiNeeded: true,
        realtime: true,
        collaboration: true,
        startTimeFrame: 1499979830922,
        verbose: true,
        thumbnailOptions: {
            cropLeftOffset: 0,
            cropTopOffset: 130,
            thumbnailWidth: 980,
            thumbnailHeight: 720,
            thumbnailFormat: 'jpeg',
            thumbnailQuality: 0.8,
            captureTimeout: 1
        },
        actions: {
            Add: actionAdd,
            Remove: actionRemove,
            Brush: actionBrush,
            Reset: actionReset,
            GlobalReset: actionGlobalReset
        },
        checkpointInterval: 2,
        checkpointGet: dcCheckPointHarvester,
        checkpointSet: dcStateSower,
        databaseName: 'simprovdc2rc2',
        cuid: 'cj51x34kj00033f67cb6cmna2' // Lock ID for demo
    };

    let dbExists = await Simprov.existsDB(configuration.databaseName);
    if (!dbExists) {
        configuration.username = await Simprov.usernameInput();
    }

// Create SIMProv instance
    simprov = new Simprov(configuration);

// Get chart instances
    let allDCCharts = await simprov.dcRegistry(5, 8, 9);
    let [chart1, chart2, chart3, chart4, chart6, chart7] = allDCCharts;

    let chartMap = new Map();
    chartMap.set(chart1.chartID(), {
        registry: chart1,
        type: 'clickChart',
        name: 'GainOrLossChart',
        resetID: '#gainOrLossChartReset'
    });
    chartMap.set(chart2.chartID(), {
        registry: chart2,
        type: 'brushChart',
        name: 'FluctuationChart',
        resetID: '#fluctuationChartReset'
    });
    chartMap.set(chart3.chartID(), {
        registry: chart3,
        type: 'clickChart',
        name: 'QuartersChart',
        resetID: '#quartersChartReset'
    });
    chartMap.set(chart4.chartID(), {
        registry: chart4,
        type: 'clickChart',
        name: 'DayOfWeekChart',
        resetID: '#dayOfWeekChartReset'
    });
    chartMap.set(chart6.chartID(), {
        registry: chart6,
        type: 'brushChart',
        name: 'VolumeChart',
        resetID: '#volumeChartReset'
    });
    chartMap.set(chart7.chartID(), {
        registry: chart7,
        type: 'clickChart',
        name: 'YearlyBubbleChart',
        resetID: '#yearlyBubbleChartReset'
    });

    let eventTrigger = false;

    //----------------------------------------------------------------------------------------------------------------//

    await simprov.onEvent('simprov.importedStream', (simprovData) => {
        streamDataReplacer(simprovData);
        dc.redrawAll();
    });

    await simprov.onEvent('simprov.persistent', (simprovData) => {
        if (simprovData.streamData) {
            streamDataReplacer(simprovData.streamData);
            dc.redrawAll();
        }
    });

    //----------------------------------------------------------------------------------------------------------------//

    await simprov.initialize();

    if (!dbExists) {
        let initialStream = [{
            timestamp: configuration.startTimeFrame,
            payload: {streamData: onLoadData}
        }];
        await simprov.addToStream(initialStream);
    }

    function streamDataFacilitator(requiredData) {
        ndx.remove();
        for (let [key, value] of requiredData.entries()) {
            let tempData = value.payload.streamData;
            tempData.forEach((data) => {
                data.dd = dateFormat.parse(data.date);
                data.month = d3.time.month(data.dd);
                data.close = parseInt(data.close, 10);
                data.open = parseInt(data.open, 10);
            });
            if (key === requiredData.length - 1) {
                let tempDate = tempData[tempData.length - 1].date;
                let dateArray = tempDate.split('/');
                let requiredMonth = parseInt(dateArray[0], 10) - 1;
                let daysInRequiredMonth = moment(tempDate, 'MM/DD/YYYY').daysInMonth();
                let requiredYear = parseInt(dateArray[2], 10);
                moveChart.x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(requiredYear, requiredMonth, daysInRequiredMonth)]));
                volumeChart.x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(requiredYear, requiredMonth, daysInRequiredMonth)]));
            }
            ndx.add(tempData);
        }
    }

    function dcCheckPointHarvester() {
        let checkPointData = [];
        for (let [key, value] of chartMap) {
            let tempCheckPointData = {};
            tempCheckPointData.chartID = value.registry.chartID();
            if (value.type === 'clickChart') {
                let tempFilters = Array.from(value.registry.filters());
                if (tempFilters.length) {
                    tempCheckPointData.data = tempFilters;
                }
                else {
                    tempCheckPointData.data = null;
                }
            }
            if (value.type === 'brushChart') {
                let brushFilter = value.registry.filters();
                if (brushFilter.length) {
                    if (value.registry.chartID() === 2) {
                        tempCheckPointData.data = [brushFilter[0][0], brushFilter[0][1]];
                    }
                    else {
                        tempCheckPointData.data = [moment(brushFilter[0][0]).format('MM/DD/YYYY'), moment(brushFilter[0][1]).format('MM/DD/YYYY')];
                    }
                }
                else {
                    tempCheckPointData.data = null;
                }
            }
            checkPointData.push(tempCheckPointData);
        }
        return checkPointData;
    }

    function dcStateSower(seed, streamData) {
        dc.filterAll();
        if (streamData) {
            streamDataFacilitator(streamData);
        }
        for (let [key, value] of chartMap) {
            let filterValue = seed.find((item) => item.chartID === value.registry.chartID()).data;
            if (value.type === 'clickChart') {
                if (filterValue) {
                    value.registry.filter([filterValue]);
                }
                else {
                    value.registry.filter(filterValue);
                }
            }
            if (value.type === 'brushChart') {
                if (filterValue) {
                    let brushFilter = [];
                    if (value.registry.chartID() === 2) {
                        brushFilter = dc.filters.RangedFilter(filterValue[0], filterValue[1]);
                    }
                    else {
                        brushFilter = dc.filters.RangedFilter(dateFormat.parse(filterValue[0]), dateFormat.parse(filterValue[1]));
                    }
                    value.registry.filter(brushFilter);
                }
                else {
                    value.registry.filter(filterValue);
                }
            }
        }
        dc.redrawAll();
    }

    let resetTrigger = false;
    let globalReset = false;

    function helperAddRemoveAction(chart, filter) {
        if (!globalReset && !eventTrigger) {
            let actionData = {};
            actionData.chartID = chart.chartID();
            actionData.name = chartMap.get(chart.chartID()).name;
            actionData.forwardData = filter;
            actionData.inverseData = filter;
            if (!resetTrigger) {
                if (chart.hasFilter(filter)) {
                    actionData.type = 'Add';
                    actionData.inverseAction = 'Remove';
                    actionData.information = `Added filter ( ${filter} ) on ${actionData.name}`;
                }
                else {
                    actionData.type = 'Remove';
                    actionData.inverseAction = 'Add';
                    actionData.information = `Removed filter ( ${filter} ) on ${actionData.name}`;
                }
            }
            else {
                actionData.type = 'Reset';
                actionData.information = `Cleared all filters on ${actionData.name}`;
                resetTrigger = false;
            }
            simprov.acquire(actionData);
        }
    }

    function helperBrushAction(chart, reset) {
        setTimeout(() => {
            let actionData = {};
            actionData.chartID = chart.chartID();
            actionData.name = chartMap.get(chart.chartID()).name;
            if (!reset) {
                actionData.type = 'Brush';
                if (chart.chartID() === 2) {
                    actionData.forwardData = [chart.filters()[0][0], chart.filters()[0][1]];
                    actionData.information = `Brushed range ( ${chart.filters()[0][0].toFixed(2)} - ${chart.filters()[0][1].toFixed(2)} ) on ${actionData.name}`;
                }
                else {
                    actionData.forwardData = [moment(chart.filters()[0][0]).format('MM/DD/YYYY'), moment(chart.filters()[0][1]).format('MM/DD/YYYY')];
                    actionData.information = `Brushed range ( ${moment(chart.filters()[0][0]).format('MM/DD/YYYY')} - ${moment(chart.filters()[0][1]).format('MM/DD/YYYY')} ) on ${actionData.name}`;
                }
            }
            else {
                actionData.forwardData = null;
                actionData.type = 'Reset';
                actionData.information = `Cleared brushed range on ${actionData.name}`;
            }
            actionData.inverseData = null;
            simprov.acquire(actionData);
        }, 500);
    }

    function helperGlobalReset() {
        globalReset = true;
        let actionData = {};
        actionData.forwardData = null;
        actionData.inverseData = null;
        actionData.type = 'GlobalReset';
        actionData.information = 'Cleared all filters on all charts';
        setTimeout(() => {
            simprov.acquire(actionData);
            globalReset = false;
        });
    }

    function actionAdd(seed, actionContent, isState, streamData) {
        if (isState) {
            for (let item of seed) {
                if (item.chartID === actionContent.actionData.chartID) {
                    let tempData = actionContent.actionData.forwardData;
                    if (!item.data) {
                        item.data = [];
                    }
                    item.data.push(tempData);
                    break;
                }
            }
            return seed;
        }
        else {
            helperAddRemoveActions(actionContent, streamData);
        }
    }

    function actionRemove(seed, actionContent, isState, streamData) {
        if (isState) {
            for (let item of seed) {
                if (item.chartID === actionContent.actionData.chartID) {
                    let tempData = actionContent.actionData.forwardData;
                    item.data.splice(item.data.indexOf(tempData), 1);
                    if (!item.data.length) {
                        item.data = null;
                    }
                    break;
                }
            }
            return seed;
        }
        else {
            helperAddRemoveActions(actionContent, streamData);
        }
    }

    function streamDataReplacer(streamData) {
        eventTrigger = true;
        let chartBase = [];
        for (let [key, value] of chartMap) {
            let tempObject = {};
            tempObject.filters = Array.from(value.registry.filters());
            tempObject.type = value.type;
            tempObject.registry = value.registry;
            chartBase.push(tempObject);
        }
        dc.filterAll();
        streamDataFacilitator(streamData);
        for (let item of chartBase) {
            if (item.filters.length) {
                if (item.type === 'clickChart') {
                    item.registry.filter([item.filters]);
                }
                else if (item.type === 'brushChart') {
                    item.registry.filter(item.filters[0]);
                }
            }
        }
        eventTrigger = false;
    }

    function helperAddRemoveActions(actionContent, streamData) {
        if (streamData) {
            streamDataReplacer(streamData);
        }
        let tempActionData = actionContent.actionData;
        let tempChart = chartMap.get(tempActionData.chartID);
        tempChart.registry.filter(tempActionData.inverseData);
        dc.redrawAll();
    }

    function actionReset(seed, actionContent) {
        return helperBrushResetActions(seed, actionContent);
    }

    function actionBrush(seed, actionContent) {
        return helperBrushResetActions(seed, actionContent);
    }

    function helperBrushResetActions(seed, actionContent) {
        for (let item of seed) {
            if (item.chartID === actionContent.actionData.chartID) {
                item.data = actionContent.actionData.forwardData;
                break;
            }
        }
        return seed;
    }

    function actionGlobalReset(seed, actionContent) {
        for (let item of seed) {
            item.data = actionContent.actionData.forwardData;
        }
        return seed;
    }

    for (let [key, value] of chartMap) {
        if (value.type === 'clickChart') {
            value.registry.on('filtered', (chart, filter) => {
                helperAddRemoveAction(chart, filter);
            });
            $(value.resetID).click(() => {
                resetTrigger = true;
            });
        }
        if (value.type === 'brushChart') {
            value.registry.brush().on("brushend.monitor", () => {
                helperBrushAction(value.registry, false);
            });
            $(value.resetID).click(() => {
                helperBrushAction(value.registry, true);
            });
        }
    }

    $("#allChartsReset").click(helperGlobalReset); //Todo add document.ready

}

initializeSimprov();

async function connectToStream() {
    let streamCounter = 0;
    let updateInterval = 5;
    let dsConfiguration = {};
    dsConfiguration.cuid = await simprov.getUserCUID(); // Lock ID for demo
    dsConfiguration.username = await simprov.getUserName();
    dsConfiguration.dsKey = await DataStreamerLink.dsKeyInput();
    dataStreamerLink = new DataStreamerLink(dsConfiguration);
    await dataStreamerLink.initialize();
    await dataStreamerLink.onEvent('DataStreamerLink.received', async (payloadData) => {
        await simprov.addToStream(payloadData);
        ++streamCounter;
        if (await simprov.persistentMode()) {
            for (let [key, value] of payloadData.entries()) {
                let tempData = value.payload.streamData;
                tempData.forEach((data) => {
                    data.dd = dateFormat.parse(data.date);
                    data.month = d3.time.month(data.dd);
                    data.close = parseInt(data.close, 10);
                    data.open = parseInt(data.open, 10);
                });
                if (key === payloadData.length - 1) {
                    let tempDate = tempData[tempData.length - 1].date;
                    let dateArray = tempDate.split('/');
                    let requiredMonth = parseInt(dateArray[0], 10) - 1;
                    let daysInRequiredMonth = moment(tempDate, 'MM/DD/YYYY').daysInMonth();
                    let requiredYear = parseInt(dateArray[2], 10);
                    moveChart.x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(requiredYear, requiredMonth, daysInRequiredMonth)]));
                    volumeChart.x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(requiredYear, requiredMonth, daysInRequiredMonth)]));
                }
                ndx.add(tempData);
            }
            if (streamCounter % updateInterval === 0) {
                dc.redrawAll();
            }
        }
    });
    $('#connectToStream').prop('disabled', true);
    await simprov.disableStreamImportUIButtons();
}

