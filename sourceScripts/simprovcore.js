import Database from './database';
import VendorHooks from './vendorhooks';
import Backup from './backup';
import Tree from './tree';
import Thumbnail from './thumbnail';
import {mixin} from 'es6-mixin';
import cuid from 'cuid';


export default class SimprovCore {
    constructor(configuration) {
        this.userName = configuration.username || 'SIMProvUser';
        this.verbose = configuration.verbose || false;
        this.checkpointInterval = configuration.checkpointInterval;
        this.checkpointCounter = 0;
        this.thumbnailOptions = configuration.thumbnailOptions;
        this.checkpointLoad = configuration.checkpointGet;
        this.userCUID = cuid();
        this.uploadedJsonData = [];
        this.replayTrigger = false;
        this.replayTriggerDelay = 0;
        this.dbExists = false;
        mixin(this, Database, configuration.databaseName);
        mixin(this, VendorHooks, configuration.verbose);
        mixin(this, Backup);
        mixin(this, Tree);
        mixin(this, Thumbnail);
    }

    async acquire(provenanceData) {
        // console.log(provenanceData);
        let isInvertible = 'inverseAction' in provenanceData;
        this.checkpointCounter = ++this.checkpointCounter;
        let hasCheckpoint = false;
        if (this.checkpointInterval === 0) {
            hasCheckpoint = false;
        }
        if (this.checkpointInterval === 1) {
            hasCheckpoint = true;
        }
        if (this.checkpointInterval > 1) {
            hasCheckpoint = this.checkpointCounter % this.checkpointInterval === 0;
        }
        let tempObject = await this.objectWrapper(provenanceData, hasCheckpoint);
        let tempNode = await this.nodeMaker(tempObject.actionCUID, hasCheckpoint, isInvertible);
        await this.addNode(tempNode);
        await this.updateObject(1, {
            checkpointCounter: this.checkpointCounter,
            tree: await this.getTree(),
            currentNode: await this.getCurrentNode()
        }, 'cache');
        let dbCUID = await this.addData(tempObject);
        await this.createThumbnail(dbCUID);
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

    async initialize() {
        this.dbExists = await this.existsDB();
        if (this.dbExists) {
            await this.initializeDB();
            let cachedInformation = await this.getObject(1, 'cache');
            this.userName = cachedInformation.username;
            this.userCUID = cachedInformation.userCUID;
            this.checkpointCounter = cachedInformation.checkpointCounter;
            let tempSimprovTree = cachedInformation.tree;
            let tempCurrentNode = cachedInformation.currentNode;
            await this.addTree(tempSimprovTree, tempCurrentNode);
        }
        else {
            let tempProvenanceData = {type: 'Initial'};
            let tempObject = await this.objectWrapper(tempProvenanceData, true);
            let tempNode = await this.nodeMaker(tempObject.actionCUID, true, false);
            await this.addRoot(tempNode);
            let tempCache = {
                username: this.userName,
                userCUID: this.userCUID,
                checkpointCounter: this.checkpointCounter,
                tree: await this.getTree(),
                currentNode: await this.getCurrentNode()
            };
            await this.initializeDB();
            await this.addData(tempCache, 'cache');
            let dbCUID = await this.addData(tempObject);
            await this.createThumbnail(dbCUID);
        }
    }

    createThumbnail(dbCUID) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                let base64Image = await this.thumbnailMaker(this.thumbnailOptions);
                await this.updateObject(dbCUID, {thumbnail: base64Image});
                resolve();
            }, this.thumbnailOptions.captureTimeout);
        });
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

    objectWrapper(provenanceData, captureCheckpoint) {
        return new Promise((resolve) => {
            let wrappedObject = {};
            wrappedObject.actionCUID = cuid();
            wrappedObject.timeStamp = Date.now();
            wrappedObject.username = this.userName;
            wrappedObject.userCUID = this.userCUID;
            wrappedObject.thumbnail = '';
            if (captureCheckpoint) {
                wrappedObject.checkpoint = this.checkpointLoad();
            }
            else {
                wrappedObject.checkpoint = null;
            }
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