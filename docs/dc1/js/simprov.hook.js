let simprov = {};

async function initializeSimprov() {
// Configure SIMProv
   let configuration = {
        uiNeeded: true,
        realtime: false,
        collaboration: false,
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
        databaseName: 'simprovdc1'
    };

    //----------------------------------------------------------------------------------------------------------------//

    if (!configuration.uiNeeded) {
        let noUIContainerContent = `<br>
    <input type='button' value="Undo" onclick='simprov.undoAction();'>
    <input type='button' value="Redo" onclick='simprov.redoAction();'>
    <input type='button' value="ExportProvenanceJson" onclick='simprov.exportProvenance("json");'>
    <input type='button' value="ExportProvenanceGist" onclick='simprov.exportProvenance("gist");'>
    <input type='button' value="ImportProvenanceJson" onclick='simprov.importProvenance("json");'>
    <input type='button' value="ImportProvenanceGist" onclick='simprov.importProvenance("gist");'>
    <input type='button' value="ActionSummary" onclick='simprov.showSummary();'>
    <input type='button' value="ProvenanceSize" onclick='simprov.showProvenanceSize();'>
    <input type='button' value="ConsoleTree" onclick='simprov.printTree();'>
    <input type='button' value="ClearStorage" onclick='simprov.resetAll();'>
    <br>
    <table id="actionTable" cellpadding="5" style="margin-left:auto; margin-right:auto">
        <tr>
            <th><b>Replay</b></th>
        </tr>
    </table>`;
        $('#noUIContainer').append(noUIContainerContent);
    }
    else {
        $('#noUIContainer').remove();
    }

    //----------------------------------------------------------------------------------------------------------------//

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

    //----------------------------------------------------------------------------------------------------------------//

    if (!configuration.uiNeeded) {
        function addRow(actionCUID, actionType) {
            return new Promise((resolve) => {
                let table = document.getElementById("actionTable");
                let rowCount = table.rows.length;
                let row = table.insertRow(rowCount);
                row.insertCell(0).innerHTML = `<input type='button' id='${actionCUID}-AuxReplay' value ='${actionType} ( ${actionCUID.substr(actionCUID.length - 8, 8)} )' onClick='simprov.actionReplay((this.id).split("-")[0])'>&nbsp;<input type='button' id='${actionCUID}-AuxAnnotate' value ='Annotate' onClick='simprov.addAnnotation((this.id).split("-")[0])'>`;
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
            await addRow(simprovData.actionCUID, simprovData.actionData.type);
        });

        await simprov.onEvent('simprov.reloaded', async (simprovData) => {
            for (let tempObject of simprovData) {
                await addRow(tempObject.actionCUID, tempObject.actionData.type);
            }
        });

        await simprov.onEvent('simprov.importedProvenance', async (simprovData) => {
            await deleteRows();
            for (let tempObject of simprovData) {
                await addRow(tempObject.actionCUID, tempObject.actionData.type);
            }
        });
    }

    //----------------------------------------------------------------------------------------------------------------//

    await simprov.initialize();

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

    let resetTrigger = false;
    let globalReset = false;

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
                actionData.forwardData = [chart.filters()[0][0], chart.filters()[0][1]];
                actionData.type = 'Brush';
                actionData.information = `Brushed range ( ${chart.filters()[0][0].toFixed(2)} - ${chart.filters()[0][1].toFixed(2)} ) on ${actionData.name}`;
            }
            else {
                actionData.forwardData = null;
                actionData.type = 'Reset';
                actionData.information = `Cleared brushed range on ${actionData.name}`;
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
        actionData.information = 'Cleared all filters on all charts';
        setTimeout(() => {
            simprov.acquire(actionData);
            globalReset = false;
        });
    }

    function actionAdd(seed, actionContent, isState) {
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
            helperAddRemoveActions(actionContent);
        }
    }

    function actionRemove(seed, actionContent, isState) {
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
            helperAddRemoveActions(actionContent);
        }
    }

    function helperAddRemoveActions(actionContent) {
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

