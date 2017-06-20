import Database from './database';
import VendorHooks from './vendorhooks';
import Utilities from './utilities';
import Backup from './backup';
import Tree from './tree';
import Thumbnail from './thumbnail';
import {mixin} from 'es6-mixin';
import cuid from 'cuid';

export default class Core {
    constructor(configuration) {
        this.userName = configuration.username || 'SIMProvUser';
        this.verboseSC = configuration.verbose || false;
        this.realtime = configuration.realtime || false;
        this.databaseName = configuration.databaseName || 'simprov';
        this.startTimeFrame = configuration.startTimeFrame || Date.now();
        this.persistent = true;
        this.checkpointInterval = configuration.checkpointInterval;
        this.configuredActions = configuration.actions;
        this.checkpointCounter = 0;
        this.thumbnailOptions = configuration.thumbnailOptions;
        this.checkpointLoad = configuration.checkpointGet;
        this.checkpointEmit = configuration.checkpointSet;
        this.userCUID = cuid();
        this.replayTrigger = false;
        this.redoSequence = [];
        mixin(this, Database, this.databaseName);
        mixin(this, VendorHooks, this.verboseSC);
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
                await this.consoleOutput('Nothing to replay');
                await this.toastrAlert('Nothing to replay', 'warning');
            }
        }
        else if (actionCUID !== tempCurrentNodeID) {
            await this.actionReplayHelper(actionCUID, true);
        }
        else {
            await this.consoleOutput('Nothing to replay');
            await this.toastrAlert('Nothing to replay', 'warning');
        }
        this.replayTrigger = false;
    }

    async actionReplayHelper(actionCUID, infoRequired) {
        await this.replayHelper(actionCUID);
        this.redoSequence = [];
        await this.consoleOutput('Replay operation completed', infoRequired);
        await this.toastrAlert('Replay operation completed', 'success');
    }

    async delayActionReplay(actionCUID, internalOperation = false, delayInterval = 1000) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                await this.actionReplay(actionCUID, internalOperation);
                resolve();
            }, delayInterval);
        });
    }

    async addToStream(streamData) {
        if (streamData.length) {
            if (streamData.length === 1) {
                await this.addData(streamData[0], 'stream');
            }
            else {
                await this.bulkAddData(streamData, 'stream');
            }
            await this.consoleOutput('Stream add operation completed');
            await this.toastrAlert('Stream add operation completed', 'success');
        }
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
            await this.consoleOutput('Provenance add operation completed', true);
            await this.toastrAlert('Provenance add operation completed', 'success');
        }
    }

    createCustomEvent(eventData, eventType) {
        return new Promise((resolve) => {
            let customEvent = new CustomEvent(eventType, {detail: eventData});
            window.dispatchEvent(customEvent);
            resolve();
        });
    }

    onEvent(eventType, eventFunction) {
        return new Promise((resolve) => {
            window.addEventListener(eventType, (e) => {
                eventFunction(e.detail);
            });
            resolve();
        });
    }

    async exportProvenance(exportType) {
        let tempExportArray = await this.fetchAll();
        let tempCache = await this.getObject(1, 'cache');
        tempExportArray.push(tempCache);
        tempExportArray.push({fileIntegrity: await this.hashComputor(tempExportArray)});
        if (exportType === 'json') {
            await this.downloadJson(tempExportArray, 'simprov.json');
            await this.consoleOutput('simprov.json download completed');
            await this.jsonConfirmation('Provenance Exported', 'simprov.json downloaded');
        }
        else {
            let gitResponse = await this.publishGist(tempExportArray, 'simprov.json', 'Simprov Provenance Data');
            await this.consoleOutput(`Github URL: ${gitResponse[0]}`);
            await this.consoleOutput(`Gist ID: ${gitResponse[1]}`);
            await this.consoleOutput('Gist Publish Completed');
            await this.gistConfirmation(gitResponse, 'Provenance Exported');
        }
    }

    async exportStream(exportType) {
        let tempExportArray = await this.fetchAll('stream');
        if (tempExportArray.length) {
            tempExportArray.push({fileIntegrity: await this.hashComputor(tempExportArray)});
            if (exportType === 'json') {
                await this.downloadJson(tempExportArray, 'stream.json');
                await this.consoleOutput('stream.json download completed');
                await this.jsonConfirmation('Stream Exported', 'stream.json downloaded');
            }
            else {
                let gitResponse = await this.publishGist(tempExportArray, 'stream.json', 'Simprov Stream Data');
                await this.consoleOutput(`Github URL: ${gitResponse[0]}`);
                await this.consoleOutput(`Gist ID: ${gitResponse[1]}`);
                await this.consoleOutput('Gist Publish Completed');
                await this.gistConfirmation(gitResponse, 'Stream Exported');
            }
        }
        else {
            await this.consoleOutput('Nothing in stream to export');
            await this.toastrAlert('Nothing in stream to export', 'warning');
        }
    }

    async importProvenance(importType) {
        let tempArray = [];
        if (importType === 'json') {
            tempArray = await this.loadJson('Import Provenance');
        }
        else {
            let gistID = await this.gistInput('Import Provenance');
            if (gistID) {
                tempArray = await this.retriveGist(gistID, 'simprov.json');
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
                this.persistent = cachedInformation.persistent;
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
                await this.consoleOutput(`Import from ${importType} completed`);
                await this.toastrAlert(`Import from ${importType} completed`, 'success');
                await this.consoleOutput(`${addCount} records added to provenance database`);
                await this.importConfirmation(addCount);
                await this.createCustomEvent(await this.fetchAll(), 'simprov.importedProvenance');
                await this.delayActionReplay(tempCurrentNodeID, true, 0);
            }
            else {
                await this.consoleOutput('Corrupt file imported');
                await this.corruptConfirmation();
            }
        }
    }

    async importStream(importType) {
        let tempArray = [];
        if (importType === 'json') {
            tempArray = await this.loadJson('Import Stream');
        }
        else {
            let gistID = await this.gistInput('Import Stream');
            if (gistID) {
                tempArray = await this.retriveGist(gistID, 'stream.json');
            }
            else {
                tempArray = null;
            }
        }
        if (tempArray) {
            let tempIntegrity = tempArray.pop().fileIntegrity;
            let tempHash = await this.hashComputor(tempArray);
            if (tempIntegrity === tempHash) {
                await this.clearTable('stream');
                await this.bulkAddData(tempArray, 'stream');
                let addCount = await this.tableCount('stream');
                await this.consoleOutput(`Import from ${importType} completed`);
                await this.toastrAlert(`Import from ${importType} completed`, 'success');
                await this.consoleOutput(`${addCount} records added to stream database`);
                await this.importConfirmation(addCount);
                await this.createCustomEvent(await this.fetchAll('stream'), 'simprov.importedStream');
            }
            else {
                await this.consoleOutput('Corrupt file imported');
                await this.corruptConfirmation();
            }
        }
    }

    async initialize() {
        let dbExists = await Simprov.existsDB(this.databaseName);
        if (dbExists) {
            await this.initializeDB();
            let cachedInformation = await this.getObject(1, 'cache');
            this.userName = cachedInformation.username;
            this.userCUID = cachedInformation.userCUID;
            this.checkpointCounter = cachedInformation.checkpointCounter;
            let tempSimprovTree = cachedInformation.tree;
            let tempCurrentNodeID = cachedInformation.currentNodeID;
            await this.addTree(tempSimprovTree, tempCurrentNodeID);
            this.persistent = cachedInformation.persistent;
            await this.consoleOutput('Load from database operation completed');
            await this.toastrAlert('Load from database operation completed', 'success');
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
                currentNodeID: await this.getCurrentNodeID(),
                persistent: this.persistent
            };
            await this.initializeDB();
            await this.putData(tempCache, 'cache', 1);
            let dbCUID = await this.addData(tempObject);
            await this.createThumbnail(dbCUID);
            await this.createCustomEvent(await this.getObject(tempObject.actionCUID), 'simprov.added');
            await this.consoleOutput('Initialization operation completed');
            await this.toastrAlert('Initialization operation completed', 'success');
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
                let parentObject = await this.getObject(tempCurrentNode.parent.model.id);
                this.configuredActions[tempAction](null, tempObject, false, await this.streamDataFetcher(parentObject.timeStamp));
            }
            else {
                let actionSequence = await this.actionSequencer(tempCurrentNode.parent.model.id);
                if (Array.isArray(actionSequence)) {
                    let integratedObject = await this.stateIntegrator(actionSequence);
                    this.checkpointEmit(integratedObject.seed, integratedObject.streamData);
                }
                else {
                    let tempObject = await this.getObject(actionSequence);
                    this.checkpointEmit(tempObject.checkpoint, await this.streamDataFetcher(tempObject.timeStamp));
                }
            }
            await this.setCurrentNode(tempCurrentNode.parent.model.id);
            await this.updateObject(1, {currentNodeID: await this.getCurrentNodeID()}, 'cache');
            this.redoSequence.unshift(tempCurrentID);
            await this.consoleOutput('Undo operation completed', true);
            await this.toastrAlert('Undo operation completed', 'success');
        }
        else {
            await this.consoleOutput('Nothing to undo');
            await this.toastrAlert('Nothing to undo', 'warning');
        }
        this.replayTrigger = false;
    }

    async persistentMode(modeBoolean) {
        if (modeBoolean !== undefined) {
            if (modeBoolean !== this.persistent) {
                this.persistent = modeBoolean;
                await this.updateObject(1, {
                    persistent: this.persistent
                }, 'cache');
                let tempCurrentID = await this.getCurrentNodeID();
                let tempObject = await this.getObject(tempCurrentID);
                let tempstreamData = await this.streamDataFetcher(tempObject.timeStamp);
                await this.createCustomEvent({
                    streamData: tempstreamData,
                    persistent: this.persistent
                }, 'simprov.persistent');
                await this.consoleOutput(`Changed persistent mode to ${this.persistent}`, true);
                await this.toastrAlert(`Changed persistent mode to ${this.persistent}`, 'info');
            }
            else {
                await this.consoleOutput(`Already in persistent mode ${this.persistent}`);
                await this.toastrAlert(`Already in persistent mode ${this.persistent}`, 'warning');
            }
        }
        else {
            return this.persistent;
        }
    }

    async redoAction() {
        this.replayTrigger = true;
        if (this.redoSequence.length) {
            let tempNodeID = this.redoSequence.shift();
            await this.replayHelper(tempNodeID);
            await this.consoleOutput('Redo operation completed', true);
            await this.toastrAlert('Redo operation completed', 'success');
        }
        else {
            await this.consoleOutput('Nothing to redo');
            await this.toastrAlert('Nothing to redo', 'warning');
        }
        this.replayTrigger = false;
    }

    async replayHelper(nodeID) {
        let actionSequence = await this.actionSequencer(nodeID);
        if (Array.isArray(actionSequence)) {
            let integratedObject = await this.stateIntegrator(actionSequence);
            this.checkpointEmit(integratedObject.seed, integratedObject.streamData);
        }
        else {
            let tempObject = await this.getObject(actionSequence);
            this.checkpointEmit(tempObject.checkpoint, await this.streamDataFetcher(tempObject.timeStamp));
        }
        await this.setCurrentNode(nodeID);
        await this.updateObject(1, {currentNodeID: await this.getCurrentNodeID()}, 'cache');
    }

    async stateIntegrator(actionSequence) {
        let tempSeed = [];
        let sequenceLength = actionSequence.length;
        let integratedObject = {};
        integratedObject.streamData = null;
        for (let [key, value] of actionSequence.entries()) {
            if (key === 0) {
                let tempObject = await this.getObject(value);
                tempSeed = tempObject.checkpoint;
            }
            else {
                let tempObject = await this.getObject(value);
                let tempAction = tempObject.actionData.type;
                tempSeed = this.configuredActions[tempAction](tempSeed, tempObject, true);
                if (this.realtime && key === sequenceLength - 1) {
                    integratedObject.streamData = await this.streamDataFetcher(tempObject.timeStamp);
                }
            }
        }
        integratedObject.seed = tempSeed;
        return integratedObject;
    }

    async streamDataFetcher(requiredTimestamp) {
        let streamData = [];
        if (this.realtime) {
            if (this.persistent) {
                streamData = await this.fetchAll('stream');
            }
            else {
                streamData = await this.streamFetcher(this.startTimeFrame, requiredTimestamp);
            }
        }
        if (!streamData.length) {
            streamData = null;
        }
        return streamData;
    }

    async resetAll() {
        let deleteDecision = await this.deleteConfirmation();
        if (deleteDecision) {
            await this.deleteDB();
            console.clear();
            setTimeout(() => {
                location.reload(true);
            }, 2000);
        }
    }

    async consoleOutput(consoleMessage, infoRequired = false) {
        if (this.verboseSC) {
            let timeStamp = await this.timeStampMaker();
            if (infoRequired) {
                let tempConsoleMessage = `%cSimprov%c@%c${this.userName}%c:%c[${timeStamp}]%c>> %c${consoleMessage}`;
                console.log(tempConsoleMessage, 'color:#FF4500', 'color:#9ACD32', 'color:#1E90FF', 'color:#FF6347', 'color:#DAA520', 'color:#FF6347', 'color:#32CD32');
            }
            else {
                let tempConsoleMessage = `%cSimprov%c:%c[${timeStamp}]%c>> %c${consoleMessage}`;
                console.log(tempConsoleMessage, 'color:#FF4500', 'color:#FF6347', 'color:#DAA520', 'color:#FF6347', 'color:#32CD32');
            }
        }
    }

    getUserName() {
        return Promise.resolve(this.userName);
    }

    async printTree() {
        await this.printTreeHelper(await this.timeStampMaker());
        await this.toastrAlert('Open console to view tree', 'info');
    }

    static async usernameInput() {
        return await Utilities.usernameInputHelper();
    }

    static async existsDB(dbName) {
        return await Database.existsDBHelper(dbName);
    }

    classSimprovCoreInformation() {
        console.log('This is Class SimprovCore');
    }

}