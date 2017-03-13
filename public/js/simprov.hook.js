// Configure SIMProv
let configuration = {
    'userInterface': false,
    'username': 'TestUser',
    'realtime': false,
    'onReload': false
};

let globalReset = false;
let resetTrigger = false;
let userAction = '';

// Create SIMProv instance
let simprov = new Simprov(configuration);

// Get chart instances
let allDCCharts = simprov.dcRegistry();
let [chart1, chart2, chart3] = allDCCharts;

// Initialize SIMProv // Capture Initial State
simprov.initialize().then(() => {
    dcReaperHelper('Initial State');
});

function dcReaper() {
    let chartFilters = [];
    for (let chart of allDCCharts) {
        let tempFilter = chart.filters();
        if (chart.chartID() == 2) {
            if (chart.filters().length > 0) {
                chartFilters.push([chart.filters()[0][0], chart.filters()[0][1]]);
            }
            else {
                chartFilters.push(tempFilter);
            }
        }
        else {
            chartFilters.push(tempFilter);
        }
    }
    // console.log(chartFilters);
    return chartFilters;
}

function dcReaperHelper(implicitUserAction) {
    if (implicitUserAction !== undefined) {
        simprov.acquire(dcReaper(), implicitUserAction);
    }
    else {
        simprov.acquire(dcReaper(), userAction);
    }
}

function dcImplanter(chartFilters) {
    dc.filterAll();
    chartFilters.forEach((item, index) => {
        if (index === 0) {
            if (item.length === 0) {
                return;
            }
            else {
                chart1.filter([item]);
            }
        }
        else if (index === 1) {
            if (item.length === 0) {
                return;
            }
            else {
                let tempFilter = dc.filters.RangedFilter(item[0], item[1]);
                chart2.filter(tempFilter);
            }
        }
        else {
            if (item.length === 0) {
                return;
            }
            else {
                chart3.filter([item]);
            }
        }
    });
    dc.redrawAll();
}

function informationHarvester(chart, filter) {
    if (resetTrigger) {
        if (!globalReset) {
            userAction = `Reset Chart-${chart.chartID()}`;
            dcReaperHelper();
            // console.log(userAction);
        }
    }
    else {
        if (chart.hasFilter(filter)) {
            userAction = `Applied Filter ${filter} on Chart-${chart.chartID()}`;
            dcReaperHelper();
            // console.log(userAction);
        }
        else {
            userAction = `Removed Filter ${filter} on Chart-${chart.chartID()}`;
            dcReaperHelper();
            // console.log(userAction);
        }
    }
    if (!globalReset) {
        resetTrigger = false;
    }
    userAction = '';
}

// Attach dc.js filtered event handler
chart1.on('filtered', (chart, filter) => {
    informationHarvester(chart, filter);
});

// Attach jquery.js click event handler
$("#yearRingChartReset").click(() => {
    resetTrigger = true;
});

// Attach d3.js brush event handler
chart2.brush().on("brushend.monitor", () => {
    // Post execution to next cycle
    setTimeout(() => {
        userAction = `Applied Range ${chart2.filters()[0].join(' to ')} on Chart-${chart2.chartID()}`;
        dcReaperHelper();
        // console.log(userAction);
        userAction = '';
    }, 0);
});

// Attach jquery.js click event handler
$("#spendHistChartReset").click(() => {
    // Post execution to next cycle
    setTimeout(() => {
        userAction = `Reset Chart-${chart2.chartID()}`;
        dcReaperHelper();
        // console.log(userAction);
        userAction = '';
    }, 0);
});

// Attach dc.js filtered event handler
chart3.on('filtered', (chart, filter) => {
    informationHarvester(chart, filter);
});

// Attach jquery.js click event handler
$("#spenderRowChartReset").click(() => {
    resetTrigger = true;
});

// Attach jquery.js click event handler
$("#allChartsReset").click(() => {
    globalReset = true;
    resetTrigger = true;
    // Post execution to next cycle
    setTimeout(() => {
        userAction = 'Reset All';
        dcReaperHelper();
        // console.log(userAction);
        userAction = '';
        globalReset = false;
        resetTrigger = false;
    }, 0);
});

// Listen to simprov add event
window.addEventListener('simprovAdded', e => {
    // console.log(e.detail);
    addRow(e.detail.stateCUID);
});

// Listen to simprov replay event
window.addEventListener('simprovReplay', e => {
    // console.log(e.detail);
    dcImplanter(e.detail.provenanceData);
});

// Listen to simprov reload event
window.addEventListener('simprovReloaded', e => {
    // console.log(e.detail);
    deleteRows();
    for (let cuid of e.detail) {
        addRow(cuid);
    }
});

function addRow(stateCUID) {
    let table = document.getElementById("stateTable");
    let rowCount = table.rows.length;
    let row = table.insertRow(rowCount);
    row.insertCell(0).innerHTML = `<input type='button' id='${stateCUID}' value ='${stateCUID}' onClick='simprov.actionReplay(this.id)'>`;
}

function deleteRows() {
    let table = document.getElementById("stateTable");
    let rowCount = table.rows.length;
    for (let i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }
}

