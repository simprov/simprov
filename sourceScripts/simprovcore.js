import Database from './database';
import VendorHooks from './vendorhooks';
import Utilities from './utilities';
import Backup from './backup';
import Tree from './tree';
import Thumbnail from './thumbnail';
import {mixin} from 'es6-mixin';
import cuid from 'cuid';


export default class SimprovCore {
    constructor(configuration) {
        this.userName = configuration.username || 'SIMProvUser';
        this.verboseSC = configuration.verbose || false;
        this.checkpointInterval = configuration.checkpointInterval;
        this.configuredActions = configuration.actions;
        this.checkpointCounter = 0;
        this.thumbnailOptions = configuration.thumbnailOptions;
        this.checkpointLoad = configuration.checkpointGet;
        this.checkpointEmit = configuration.checkpointSet;
        this.userCUID = cuid();
        this.replayTrigger = false;
        this.redoSequence = [];
        mixin(this, Database, configuration.databaseName);
        mixin(this, VendorHooks, configuration.verbose);
        mixin(this, Utilities);
        mixin(this, Backup);
        mixin(this, Tree);
        mixin(this, Thumbnail);
    }

    async actionReplay(actionCUID, internalOperation = false) {
        this.replayTrigger = true;
        let tempCurrentNodeID = await this.getCurrentNodeID();
        if (internalOperation) {
            let tempCurrentNode = await this.findNode(actionCUID);
            if (!tempCurrentNode.isRoot()) {
                await this.actionReplayHelper(actionCUID, false);
            }
            else {
                await this.consoleOutput('Nothing to replay', false);
            }
        }
        else if (actionCUID !== tempCurrentNodeID) {
            await this.actionReplayHelper(actionCUID, true);
        }
        else {
            await this.consoleOutput('Nothing to replay', false);
        }
        this.replayTrigger = false;
    }

    async actionReplayHelper(actionCUID, infoRequired) {
        await this.replayHelper(actionCUID);
        this.redoSequence = [];
        await this.consoleOutput('Replay operation completed', infoRequired);
    }

    async delayActionReplay(actionCUID, internalOperation = false, delayInterval = 1000) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                await this.actionReplay(actionCUID, internalOperation);
                resolve();
            }, delayInterval);
        });
    }

    async acquire(provenanceData) {
        if (!this.replayTrigger) {
            let isInvertible = 'inverseAction' in provenanceData;
            this.checkpointCounter = ++this.checkpointCounter;
            let hasCheckpoint = false;
            if (this.checkpointInterval === 0 || this.checkpointInterval === 1) {
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
                currentNodeID: await this.getCurrentNodeID()
            }, 'cache');
            let dbCUID = await this.addData(tempObject);
            await this.createThumbnail(dbCUID);
            await this.createCustomEvent(await this.getObject(dbCUID), 'simprov.added');
            this.redoSequence = [];
            await this.consoleOutput('Add operation completed', true);
        }
    }

    createCustomEvent(eventData, eventType) {
        return new Promise((resolve) => {
            let customEvent = new CustomEvent(eventType, {detail: eventData});
            window.dispatchEvent(customEvent);
            resolve();
        });
    }

    async exportProvenance(exportType) {
        let tempExportArray = await this.fetchAll();
        let tempCache = await this.getObject(1, 'cache');
        tempExportArray.push(tempCache);
        tempExportArray.push({fileIntegrity: await this.hashComputor(tempExportArray)});
        if (exportType === 'json') {
            await this.downloadJson(tempExportArray);
            await this.consoleOutput('simprov.json download completed', false);
            await this.jsonConfirmation();
        }
        else {
            let gitResponse = await this.publishGist(tempExportArray);
            await this.consoleOutput(`Github URL: ${gitResponse[0]}`, false);
            await this.consoleOutput(`Gist ID: ${gitResponse[1]}`, false);
            await this.consoleOutput('Gist Publish Completed', false);
            await this.gistConfirmation(gitResponse);
        }
    }

    async importProvenance(importType) {
        let tempArray = [];
        if (importType === 'json') {
            tempArray = await this.loadJson();
        }
        else {
            let gistID = await this.gistInput();
            if (gistID) {
                tempArray = await this.retriveGist(gistID);
            }
            else {
                tempArray = null;
            }
        }
        if (tempArray) {
            let tempIntegrity = tempArray.pop().fileIntegrity;
            let tempHash = await this.hashComputor(tempArray);
            if (tempIntegrity === tempHash) {
                let cachedInformation = tempArray.pop();
                let userCredentialDecision = await this.userCredentialDecision();
                if (userCredentialDecision) {
                    this.userName = cachedInformation.username;
                    this.userCUID = cachedInformation.userCUID;
                }
                else {
                    cachedInformation.username = this.userName;
                    cachedInformation.userCUID = this.userCUID;
                    let modifyRecordsDecision = await this.modifyRecordsDecision();
                    if (modifyRecordsDecision) {
                        for (let tempObject of tempArray) {
                            tempObject.username = this.userName;
                            tempObject.userCUID = this.userCUID;
                        }
                    }
                }
                this.checkpointCounter = cachedInformation.checkpointCounter;
                let tempSimprovTree = cachedInformation.tree;
                let tempCurrentNodeID = cachedInformation.currentNodeID;
                await this.addTree(tempSimprovTree, tempCurrentNodeID);
                await this.clearTable('cache');
                await this.putData(cachedInformation, 'cache', 1);
                await this.clearTable();
                await this.bulkAddData(tempArray);
                let addCount = await this.tableCount();
                await this.consoleOutput(`Import from ${importType} completed`, false);
                await this.consoleOutput(`${addCount} records added to database`, false);
                await this.importConfirmation(addCount);
                await this.createCustomEvent(await this.fetchAll(), 'simprov.imported');
                await this.delayActionReplay(tempCurrentNodeID, true, 0);
            }
            else {
                await this.consoleOutput('Corrupt file imported', false);
                await this.corruptConfirmation();
            }
        }
    }

    async initialize() {
        let dbExists = await this.existsDB();
        if (dbExists) {
            await this.initializeDB();
            let cachedInformation = await this.getObject(1, 'cache');
            this.userName = cachedInformation.username;
            this.userCUID = cachedInformation.userCUID;
            this.checkpointCounter = cachedInformation.checkpointCounter;
            let tempSimprovTree = cachedInformation.tree;
            let tempCurrentNodeID = cachedInformation.currentNodeID;
            await this.addTree(tempSimprovTree, tempCurrentNodeID);
            await this.consoleOutput('Load from database operation completed', false);
            await this.createCustomEvent(await this.fetchAll(), 'simprov.reloaded');
            await this.delayActionReplay(tempCurrentNodeID, true);
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
                currentNodeID: await this.getCurrentNodeID()
            };
            await this.initializeDB();
            await this.putData(tempCache, 'cache', 1);
            let dbCUID = await this.addData(tempObject);
            await this.createThumbnail(dbCUID);
            await this.createCustomEvent(await this.getObject(tempObject.actionCUID), 'simprov.added');
            await this.consoleOutput('Initialization operation completed', false);
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

    async undoAction() {
        this.replayTrigger = true;
        let tempCurrentID = await this.getCurrentNodeID();
        let tempCurrentNode = await this.findNode(tempCurrentID);
        if (!tempCurrentNode.isRoot()) {
            if (tempCurrentNode.model.inverse) {
                let tempObject = await this.getObject(tempCurrentID);
                let tempAction = tempObject.actionData.inverseAction;
                this.configuredActions[tempAction](null, tempObject, false);
            }
            else {
                let actionSequence = await this.actionSequencer(tempCurrentNode.parent.model.id);
                if (Array.isArray(actionSequence)) {
                    let tempSeed = await this.stateIntegrator(actionSequence);
                    this.checkpointEmit(tempSeed);
                }
                else {
                    let tempObject = await this.getObject(actionSequence);
                    this.checkpointEmit(tempObject.checkpoint);
                }
            }
            await this.setCurrentNode(tempCurrentNode.parent.model.id);
            await this.updateObject(1, {currentNodeID: await this.getCurrentNodeID()}, 'cache');
            this.redoSequence.unshift(tempCurrentID);
            await this.consoleOutput('Undo operation completed', true);
        }
        else {
            await this.consoleOutput('Nothing to undo', false);
        }
        this.replayTrigger = false;
    }

    async redoAction() {
        this.replayTrigger = true;
        if (this.redoSequence.length) {
            let tempNodeID = this.redoSequence.shift();
            await this.replayHelper(tempNodeID);
            await this.consoleOutput('Redo operation completed', true);
        }
        else {
            await this.consoleOutput('Nothing to redo', false);
        }
        this.replayTrigger = false;
    }

    async replayHelper(nodeID) {
        let actionSequence = await this.actionSequencer(nodeID);
        if (Array.isArray(actionSequence)) {
            let tempSeed = await this.stateIntegrator(actionSequence);
            this.checkpointEmit(tempSeed);
        }
        else {
            let tempObject = await this.getObject(actionSequence);
            this.checkpointEmit(tempObject.checkpoint);
        }
        await this.setCurrentNode(nodeID);
        await this.updateObject(1, {currentNodeID: await this.getCurrentNodeID()}, 'cache');
    }

    async stateIntegrator(actionSequence) {
        let tempSeed = [];
        for (let [key, value] of actionSequence.entries()) {
            if (key === 0) {
                let tempObject = await this.getObject(value);
                tempSeed = tempObject.checkpoint;
            }
            else {
                let tempObject = await this.getObject(value);
                let tempAction = tempObject.actionData.type;
                tempSeed = this.configuredActions[tempAction](tempSeed, tempObject, true);
            }
        }
        return (tempSeed);
    }

    async resetAll() {
        let deleteDecision = await this.deleteConfirmation();
        if (deleteDecision) {
            await this.deleteDB();
            console.clear();
            location.reload(true);
        }
    }

    async consoleOutput(consoleMessage, infoRequired) {
        if (this.verboseSC) {
            if (infoRequired) {
                let timeStamp = await this.timeStampMaker();
                let tempConsoleMessage = `%cSimprov%c@%c${this.userName}%c:%c[${timeStamp}]%c>> %c${consoleMessage}`;
                console.log(tempConsoleMessage, 'color:#FFD700', 'color:#F0FFFF', 'color:#9ACD32', 'color:#FF4500', 'color:#AFEEEE', 'color:#FF4500', 'color:#BADA55');
            }
            else {
                let tempConsoleMessage = `%cSimprov%c:>> %c${consoleMessage}`;
                console.log(tempConsoleMessage, 'color:#FFD700', 'color:#FF4500', 'color:#bada55');
            }
        }
    }

    classSimprovCoreInformation() {
        console.log('This is Class SimprovCore');
    }

}