// Configure SIMProv
let configuration = {
    'userInterface': false,
    'username': 'TestUser',
    'realtime': false,
    'onReload': false,
    'checkpointInterval': 2,
    'checkpointCallback': dcCheckPointHarvester,
    'databaseName': 'simprov'
};

let resetTrigger = false;
let globalReset = false;

// Create SIMProv instance
let simprov = new Simprov(configuration);

// Get chart instances
let allDCCharts = simprov.dcRegistry();
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

simprov.initialize();

function dcCheckPointHarvester() {
    let checkPointData = [];
    for (let [key, value] of chartMap) {
        let tempCheckPointData = {};
        tempCheckPointData.chartID = value.registry.chartID();
        if (value.type === 'clickChart') {
            let tempFilters = Array.from(value.registry.filters());
            if (tempFilters.length > 0) {
                tempCheckPointData.data = tempFilters;
            }
            else {
                tempCheckPointData.data = null;
            }
        }
        if (value.type === 'brushChart') {
            let brushFilter = value.registry.filters();
            if (brushFilter.length > 0) {
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
// console.log(dcCheckPointHarvester());

function dcStateSower(seed) {
    dc.filterAll();
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

function helperAddRemoveAction(chart, filter) {
    if (!globalReset) {
        let actionData = {};
        actionData.chartID = chart.chartID();
        actionData.name = chartMap.get(chart.chartID()).name;
        actionData.forwardData = filter;
        actionData.inverseData = filter;
        if (!resetTrigger) {
            if (chart.hasFilter(filter)) {
                actionData.type = 'Add';
            }
            else {
                actionData.type = 'Remove';
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
    let actionData = {};
    globalReset = true;
    actionData.forwardData = null;
    actionData.inverseData = null;
    actionData.type = 'GlobalReset';
    setTimeout(() => {
        globalReset = false;
    });
    simprov.acquire(actionData);
}


function actionAdd() {

}

function actionRemove() {

}

function actionReset() {

}

function actionBrush() {

}

function actionGlobalReset() {

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

