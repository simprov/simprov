window.addEventListener('simprov.added', e => {
    addRow(e.detail.actionCUID);
});

window.addEventListener('simprov.reloaded', e => {
    for (let tempObject of e.detail) {
        addRow(tempObject.actionCUID);
    }
});

window.addEventListener('simprov.imported', e => {
    deleteRows();
    for (let tempObject of e.detail) {
        addRow(tempObject.actionCUID);
    }
});

function addRow(actionCUID) {
    let table = document.getElementById("actionTable");
    let rowCount = table.rows.length;
    let row = table.insertRow(rowCount);
    row.insertCell(0).innerHTML = `<input type='button' id='${actionCUID}' value ='${actionCUID}' onClick='simprov.actionReplay(this.id)'>`;
}

function deleteRows() {
    let table = document.getElementById("actionTable");
    let rowCount = table.rows.length;
    for (let i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }
}