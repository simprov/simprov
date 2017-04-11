import Database from "./database";
import VendorHooks from "./vendorhooks";
import Backup from "./backup";
import Tree from "./tree";
import {mixin} from "es6-mixin";
import cuid from "cuid";


export default class SimprovCore {
    constructor(configuration) {
        this.userName = configuration.username || 'SIMProvUser';
        this.onReload = configuration.onReload || false;
        this.checkpointInterval = configuration.checkpointInterval;
        this.checkpointLoad = configuration.checkpointCallback;
        this.userCUID = cuid();
        this.uploadedJsonData = [];
        this.replayTrigger = false;
        this.replayTriggerDelay = 0;
        this.dbExists = false;
        mixin(this, Database, configuration.databaseName);
        mixin(this, VendorHooks);
        mixin(this, Backup);
        mixin(this, Tree);
    }

    acquire(provenanceData) {

        return this.objectWrapper(provenanceData).then((addData) => {
            return this.addData(addData);
        }).then((dbCUID) => {
            return this.getObject(dbCUID);
        }).then((addedObject) => {
            return this.createCustomEvent(addedObject, 'simprov.added');
        });
    }

    createCustomEvent(eventData, eventType) {
        return new Promise((resolve) => {
            let customEvent = new CustomEvent(eventType, {detail: eventData});
            window.dispatchEvent(customEvent);
            resolve();
        });
    }

    exportProvenance(exportType) {

    }

    importProvenance(importType, gistID) {

    }

    inspector(provenanceData) {
        return new Promise((resolve) => {
            if (provenanceData.inverseData === null) {
                resolve(true);
            }
            else
                resolve(false);
        });
    }

    initialize() {
        this.initializeDB();
    }

    loadJson() { //Todo json validation
        let documentBody = document.body;
        let input = document.createElement("input");
        input.type = "file";
        input.style.display = 'none';
        let receivedText = (event) => {
            this.uploadedJsonData = JSON.parse(event.target.result);
            documentBody.removeChild(input);
            this.importProvenance();
        };
        let handleFileSelect = (event) => {
            let file = event.target.files[0];
            let fr = new FileReader();
            fr.onload = receivedText;
            fr.readAsText(file);
        };
        input.addEventListener('change', handleFileSelect, true);
        documentBody.appendChild(input);
        input.click();
    }

    localStorageSet(storageData, toWhere) {
        return new Promise((resolve) => {
            localStorage.setItem(toWhere, JSON.stringify(storageData));
            resolve();
        });
    }

    localStorageGet(fromWhere) {
        return new Promise((resolve) => {
            resolve(JSON.parse(localStorage.getItem(fromWhere)));
        });
    }

    objectWrapper(provenanceData) {
        return new Promise((resolve) => {
            let wrappedObject = {};
            wrappedObject.actionCUID = cuid();
            wrappedObject.timeStamp = Date.now();
            wrappedObject.username = this.userName;
            wrappedObject.userCUID = this.userCUID;
            wrappedObject.thumbnail = '';
            wrappedObject.checkpoint = null;
            wrappedObject.annotation = '';
            wrappedObject.actionData = provenanceData;
            resolve(wrappedObject);
        });
    }

    undoAction() {

    }

    redoAction() {

    }

    classSimprovCoreInformation() {
        console.log('Simprov:> This is Class SimprovCore');
    }

}