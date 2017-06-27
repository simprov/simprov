let simprov = {};
let dataStreamerLink = {};

async function initializeSimprov() {
    // Configure SIMProv
    let configuration = {
        userInterface: false,
        realtime: true,
        collaboration: true,
        startTimeFrame: 1497294672108,
        verbose: true,
        thumbnailOptions: {
            cropLeftOffset: 0,
            cropTopOffset: 0,
            thumbnailWidth: 900,
            thumbnailHeight: 340,
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
        databaseName: 'simprovdc1rc2',
        cuid: 'cj4dkgoes00033d61aawza0ui' // Lock ID for demo
    };
    let dbExists = await Simprov.existsDB(configuration.databaseName);
    if (!dbExists) {
        configuration.username = await Simprov.usernameInput();
    }

    // Create SIMProv instance
    simprov = new Simprov(configuration);

    // Get chart instances
    let allDCCharts = await simprov.dcRegistry();
    let [chart1, chart2, chart3] = allDCCharts;

    let chartMap = new Map();
    chartMap.set(chart1.chartID(), {
        registry: chart1,
        type: 'clickChart',
        name: 'PieChart',
        resetID: '#yearRingChartReset'
    });
    chartMap.set(chart2.chartID(), {
        registry: chart2,
        type: 'brushChart',
        name: 'RangeChart',
        resetID: '#spendHistChartReset'
    });
    chartMap.set(chart3.chartID(), {
        registry: chart3,
        type: 'clickChart',
        name: 'RowChart',
        resetID: '#spenderRowChartReset'
    });

    let eventTrigger = false;

    //----------------------------------------------------------------------------------------------------------------//

    function addRow(actionCUID) {
        return new Promise((resolve) => {
            let table = document.getElementById("actionTable");
            let rowCount = table.rows.length;
            let row = table.insertRow(rowCount);
            row.insertCell(0).innerHTML = `<input type='button' id='${actionCUID}' value ='${actionCUID}' onClick='simprov.actionReplay(this.id)'>`;
            resolve();
        });
    }

    function deleteRows() {
        return new Promise((resolve) => {
            let table = document.getElementById("actionTable");
            let rowCount = table.rows.length;
            for (let i = rowCount - 1; i > 0; i--) {
                table.deleteRow(i);
            }
            resolve();
        });
    }

    await simprov.onEvent('simprov.added', async (simprovData) => {
        await addRow(simprovData.actionCUID);
    });

    await simprov.onEvent('simprov.reloaded', async (simprovData) => {
        for (let tempObject of simprovData) {
            await addRow(tempObject.actionCUID);
        }
        $('#importStreamJson').prop('disabled', true);
        $('#importStreamGist').prop('disabled', true);
    });

    await simprov.onEvent('simprov.importedProvenance', async (simprovData) => {
        await deleteRows();
        for (let tempObject of simprovData) {
            await addRow(tempObject.actionCUID);
        }
        $('#importStreamJson').prop('disabled', true);
        $('#importStreamGist').prop('disabled', true);
    });

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

    await simprov.onEvent('simprov.syncProvenance', async (simprovData) => {
        await deleteRows();
        for (let tempObject of simprovData) {
            await addRow(tempObject.actionCUID);
        }
    });

    await simprov.onEvent('simprov.subscriberSync', (simprovData) => {
        $('#collaborate').prop('disabled', true);
        $('#importStreamJson').prop('disabled', true);
        $('#importStreamGist').prop('disabled', true);
    });

    //----------------------------------------------------------------------------------------------------------------//

    await simprov.initialize();

    if (!dbExists) {
        let initialStream = [{
            timestamp: configuration.startTimeFrame,
            payload: {
                streamData: [{Name: 'Mr A', Spent: 10, Year: 2011},
                    {Name: 'Mr B', Spent: 20, Year: 2011},
                    {Name: 'Mr C', Spent: 30, Year: 2011},
                    {Name: 'Mr D', Spent: 10, Year: 2011}]
            }
        }];
        await simprov.addToStream(initialStream);
    }

    function streamDataFacilitator(requiredData) {
        ndx.remove();
        for (let item of requiredData) {
            ndx.add(item.payload.streamData);
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
                    tempCheckPointData.data = [brushFilter[0][0], brushFilter[0][1]];
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
                    let brushFilter = dc.filters.RangedFilter(filterValue[0], filterValue[1]);
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
                }
                else {
                    actionData.type = 'Remove';
                    actionData.inverseAction = 'Add';
                }
            }
            else {
                actionData.type = 'Reset';
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
                actionData.forwardData = [chart.filters()[0][0], chart.filters()[0][1]];
                actionData.type = 'Brush';
            }
            else {
                actionData.forwardData = null;
                actionData.type = 'Reset';
            }
            actionData.inverseData = null;
            simprov.acquire(actionData);
        });
    }

    function helperGlobalReset() {
        globalReset = true;
        let actionData = {};
        actionData.forwardData = null;
        actionData.inverseData = null;
        actionData.type = 'GlobalReset';
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
        let chartYearRing = yearRingChart.filters();
        let chartSpendHist = spendHistChart.filters();
        let chartSpenderRow = spenderRowChart.filters();
        dc.filterAll();
        streamDataFacilitator(streamData);
        if (chartYearRing.length) {
            yearRingChart.filter([chartYearRing]);
        }
        if (chartSpendHist.length) {
            spendHistChart.filter(chartSpendHist[0]);
        }
        if (chartSpenderRow.length) {
            spenderRowChart.filter([chartSpenderRow]);
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
    let updateInterval = 4;
    let dsConfiguration = {};
    dsConfiguration.cuid = await simprov.getUserCUID(); // Lock ID for demo
    dsConfiguration.username = await simprov.getUserName();
    dsConfiguration.dsKey = 'cj4foe0ka00013d8epi9apgrfcj4foe0k900003d8ezs0qe7ye14985742045686024';
    dataStreamerLink = new DataStreamerLink(dsConfiguration);
    await dataStreamerLink.initialize();
    await dataStreamerLink.onEvent('DataStreamerLink.received', async (payloadData) => {
        await simprov.addToStream(payloadData);
        ++streamCounter;
        if (await simprov.persistentMode()) {
            for (let item of payloadData) {
                ndx.add(item.payload.streamData);
            }
            if (streamCounter % updateInterval === 0) {
                dc.redrawAll();
            }
        }
    });
    $('#connectToStream').prop('disabled', true);
    $('#importStreamJson').prop('disabled', true);
    $('#importStreamGist').prop('disabled', true);
}




