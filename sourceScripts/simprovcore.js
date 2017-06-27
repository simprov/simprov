import Database from './database';
import VendorHooks from './vendorhooks';
import Utilities from './utilities';
import Backup from './backup';
import Tree from './tree';
import Thumbnail from './thumbnail';
import {mixin} from 'es6-mixin';
import cuid from 'cuid';
import sortKeys from 'sort-keys';
import PubNub from 'pubnub';

export default class Core {
    constructor(configuration) {
        this.userName = configuration.username || 'SIMProvUser';
        this.verboseC = configuration.verbose || false;
        this.realtime = configuration.realtime || false;
        this.collaboration = configuration.collaboration || false;
        this.databaseName = configuration.databaseName || 'simprov';
        this.startTimeFrame = configuration.startTimeFrame || Date.now();
        this.persistent = true;
        this.checkpointInterval = configuration.checkpointInterval;
        this.configuredActions = configuration.actions;
        this.checkpointCounter = 0;
        this.thumbnailOptions = configuration.thumbnailOptions;
        this.checkpointLoad = configuration.checkpointGet;
        this.checkpointEmit = configuration.checkpointSet;
        this.userCUID = configuration.cuid || cuid();
        this.replayTrigger = false;
        this.redoSequence = [];
        this.actionSummary = this.summaryObjectMaker(configuration.actions);
        this.ifSynchronized = false;
        this.slaveInstance = false;
        this.masterInstance = false;
        this.ifControlled = false;
        this.instantiationTime = Date.now() * 10000;
        this.cipherKey = configuration.cipherKey || cuid();
        this.dataChannel = configuration.dataChannel || 'SIMProv';
        this.storeInHistory = configuration.storeInHistory || true;
        this.ttl = configuration.ttl || 1;
        this.instanceKey = configuration.instanceKey || cuid();
        this.userState = {};
        this.collaborationKey = '';
        this.allHistory = [];
        this.historyCount = 100;
        this.historyMax = configuration.historyMax || 'all';
        this.retrieveHistory = configuration.history || true;
        this.stream = {};
        this.streamInitialized = false;
        this.subscribeKey = configuration.subscribeKey || 'sub-c-d5d9a28e-76e3-11e6-918c-02ee2ddab7fe';
        this.publishKey = configuration.publishKey || 'pub-c-9cf26b57-c409-4320-9847-f282da65c396';
        this.logVerbosity = configuration.logVerbosity || false;
        this.ssl = configuration.ssl || false;
        this.presenceTimeout = configuration.presenceTimeout || 120;
        this.heartbeatInterval = configuration.heartbeatInterval || 30;
        this.dataChannelControl = configuration.dataChannelControl || 'SIMProvControl';
        this.subscribeKeyControl = configuration.subscribeKeyControl || 'sub-c-98857900-57aa-11e7-8043-02ee2ddab7fe';
        this.streamControl = new PubNub({
            subscribeKey: this.subscribeKeyControl,
            cipherKey: this.dataChannelControl,
            logVerbosity: this.logVerbosity,
            uuid: this.userCUID,
            ssl: this.ssl,
            presenceTimeout: this.presenceTimeout,
            heartbeatInterval: this.heartbeatInterval
        });
        mixin(this, Database, this.databaseName);
        mixin(this, VendorHooks, this.verboseSC);
        mixin(this, Utilities);
        mixin(this, Backup);
        mixin(this, Tree);
        mixin(this, Thumbnail);
    }

    async actionReplay(actionCUID, internalOperation = false, userInfo = this.userName) {
        this.replayTrigger = true;
        let tempCurrentNodeID = await this.getCurrentNodeID();
        if (internalOperation) {
            let tempCurrentNode = await this.findNode(actionCUID);
            if (!tempCurrentNode.isRoot() || this.collaboration || this.realtime) {
                await this.actionReplayHelper(actionCUID, internalOperation, false, userInfo);
            }
        }
        else if (actionCUID !== tempCurrentNodeID) {
            await this.actionReplayHelper(actionCUID, internalOperation, true, userInfo);
            if (this.ifSynchronized && !this.ifControlled) {
                await this.publishHandler({type: 'replay', data: actionCUID}, 'control', false);
            }
        }
        else {
            await this.consoleOutput('Nothing to replay');
            await this.toastrAlert('Nothing to replay', 'warning');
        }
        this.replayTrigger = false;
    }

    async actionReplayHelper(actionCUID, internalOperation, infoRequired, userInfo) {
        await this.replayHelper(actionCUID);
        this.redoSequence = [];
        if (!internalOperation) {
            await this.consoleOutput('Replayed', infoRequired, userInfo);
            await this.toastrAlert('Replayed', 'success');
        }
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
            await this.consoleOutput('Stream added');
            await this.toastrAlert('Stream added', 'success');
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
            let nodeToAdd = await this.getCurrentNodeID();
            await this.addNode(tempNode);
            await this.updateObject(1, {
                checkpointCounter: this.checkpointCounter,
                tree: await this.getTree(),
                currentNodeID: await this.getCurrentNodeID(),
                actionSummary: this.actionSummary
            }, 'cache');
            let dbCUID = await this.addData(tempObject);
            await this.createThumbnail(dbCUID);
            let tempDataObject = await this.getObject(dbCUID);
            await this.createCustomEvent(tempDataObject, 'simprov.added');
            this.redoSequence = [];
            await this.consoleOutput('Provenance added', true);
            await this.toastrAlert('Provenance added', 'success');
            if (this.ifSynchronized) {
                await this.publishHandler({
                    provenanceData: tempDataObject,
                    nodeToAdd: nodeToAdd,
                    nodeData: tempNode
                }, 'provenance');
                await this.consoleOutput('Provenance published');
                await this.toastrAlert('Provenance published', 'success');
            }
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
            await this.consoleOutput('simprov.json downloaded');
            await this.jsonConfirmation('Provenance Exported', 'simprov.json downloaded');
        }
        else {
            let gitResponse = await this.publishGist(tempExportArray, 'simprov.json', 'Simprov Provenance Data');
            await this.consoleOutput(`Github URL: ${gitResponse[0]}`);
            await this.consoleOutput(`Gist ID: ${gitResponse[1]}`);
            await this.consoleOutput('Gist Published');
            await this.gistConfirmation(gitResponse, 'Provenance Exported');
        }
    }

    async exportStream(exportType) {
        let tempExportArray = await this.fetchAll('stream');
        if (tempExportArray.length) {
            tempExportArray.push({fileIntegrity: await this.hashComputor(tempExportArray)});
            if (exportType === 'json') {
                await this.downloadJson(tempExportArray, 'stream.json');
                await this.consoleOutput('stream.json downloaded');
                await this.jsonConfirmation('Stream Exported', 'stream.json downloaded');
            }
            else {
                let gitResponse = await this.publishGist(tempExportArray, 'stream.json', 'Simprov Stream Data');
                await this.consoleOutput(`Github URL: ${gitResponse[0]}`);
                await this.consoleOutput(`Gist ID: ${gitResponse[1]}`);
                await this.consoleOutput('Gist Published');
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
                this.actionSummary = cachedInformation.actionSummary;
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
                await this.consoleOutput(`Imported from ${importType}`);
                await this.toastrAlert(`Imported from ${importType}`, 'success');
                await this.consoleOutput(`${addCount} record(s) added to provenance database`);
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
                await this.consoleOutput(`Imported from ${importType}`);
                await this.toastrAlert(`Imported from ${importType}`, 'success');
                await this.consoleOutput(`${addCount} record(s) added to stream database`);
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
            this.actionSummary = cachedInformation.actionSummary;
            await this.consoleOutput('Loaded from database');
            await this.toastrAlert('Loaded from database', 'success');
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
                persistent: this.persistent,
                actionSummary: this.actionSummary
            };
            await this.initializeDB();
            await this.putData(tempCache, 'cache', 1);
            let dbCUID = await this.addData(tempObject);
            await this.createThumbnail(dbCUID);
            await this.createCustomEvent(await this.getObject(tempObject.actionCUID), 'simprov.added');
            await this.consoleOutput('Initialized');
            await this.toastrAlert('Initialized', 'success');
        }
    }

    createThumbnail(dbCUID) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                let base64Image = await this.thumbnailMaker(this.thumbnailOptions);
                await this.updateObject(dbCUID, {thumbnail: base64Image});
                resolve();
            }, this.thumbnailOptions.captureTimeout * 1000);
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
            if (provenanceData.type !== 'Initial') {
                this.actionSummary[provenanceData.type] = ++this.actionSummary[provenanceData.type];
            }
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

    async undoAction(userInfo = this.userName) {
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
            await this.consoleOutput('Undid', true, userInfo);
            await this.toastrAlert('Undone', 'success');
            if (this.ifSynchronized && !this.ifControlled) {
                await this.publishHandler({type: 'undo', data: null}, 'control', false);
            }
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

    async redoAction(userInfo = this.userName) {
        this.replayTrigger = true;
        if (this.redoSequence.length) {
            let tempNodeID = this.redoSequence.shift();
            await this.replayHelper(tempNodeID);
            await this.consoleOutput('Redid', true, userInfo);
            await this.toastrAlert('Redone', 'success');
            if (this.ifSynchronized && !this.ifControlled) {
                await this.publishHandler({type: 'redo', data: null}, 'control', false);
            }
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
            if (this.streamInitialized) {
                this.stream.unsubscribeAll();
                this.stream.stop();
                this.streamControl.unsubscribeAll();
                this.streamControl.stop();
            }
            console.clear();
            setTimeout(() => {
                location.reload(true);
            }, 2000);
        }
    }

    async consoleOutput(consoleMessage, infoRequired = false, userInfo = this.userName) {
        if (this.verboseC) {
            let timeStamp = await this.timeStampMaker();
            if (infoRequired) {
                let tempConsoleMessage = `%cSimprov%c@%c${userInfo}%c:%c[${timeStamp}]%c>> %c${consoleMessage}`;
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

    getUserCUID() {
        return Promise.resolve(this.userCUID);
    }

    async printTree() {
        await this.printTreeHelper(await this.timeStampMaker());
        await this.toastrAlert('Open console to view tree', 'info');
    }

    summaryObjectMaker(requiredObject) {
        let tempObject = {};
        Object.getOwnPropertyNames(requiredObject).forEach((item) => {
            tempObject[item] = 0;
        });
        tempObject = sortKeys(tempObject);
        return tempObject;
    }

    async showSummary() {
        let tempString = '';
        for (let key in this.actionSummary) {
            tempString += `| ${key}: ${this.actionSummary[key]} `;
        }
        tempString = tempString.replace('|', '');
        await this.consoleOutput(tempString.trim());
        await this.showSummaryHelper(this.actionSummary);
    }

    async showProvenanceSize() {
        let tempExportArray = await this.fetchAll();
        let tempCache = await this.getObject(1, 'cache');
        tempExportArray.push(tempCache);
        tempExportArray.push({fileIntegrity: await this.hashComputor(tempExportArray)});
        let jsonSize = await this.computeJsonSize(tempExportArray);
        await this.consoleOutput(`Provenance size ${jsonSize}`);
        await this.provenanceSize(jsonSize);
    }

    initializeCollaboration() {
        return new Promise((resolve) => {
            this.stream = new PubNub({
                subscribeKey: this.subscribeKey,
                publishKey: this.publishKey,
                cipherKey: this.cipherKey,
                logVerbosity: this.logVerbosity,
                uuid: this.userCUID,
                ssl: this.ssl,
                presenceTimeout: this.presenceTimeout,
                heartbeatInterval: this.heartbeatInterval
            });
            resolve();
        });
    }

    async collaborate() {
        let generateDecision = await this.generateDecision();
        if (generateDecision) {
            this.masterInstance = true;
            await this.initializeCollaboration();
            await this.subscriptionHandler();
            await this.streamControlHandler();
            this.collaborationKey = this.instanceKey + this.cipherKey;
            await this.consoleOutput(`Collaboration Key ${this.collaborationKey}`);
            await this.displayKey(this.collaborationKey);
        }
        else {
            let collaborationKeyInput = await this.collaborationKeyInput();
            if (collaborationKeyInput) {
                this.collaborationKey = collaborationKeyInput;
                let keyArray = collaborationKeyInput.match(/.{1,25}/g);
                this.instanceKey = keyArray[0];
                this.cipherKey = keyArray[1];
                await this.initializeCollaboration();
                await this.subscriptionHandler();
                await this.streamControlHandler();
                this.slaveInstance = true;
                await this.publishHandler(null, 'syncawait', false);
            }
        }
    }

    async publishHandler(payload, controlString, historyRequired = this.storeInHistory) {
        let publishResponse = await this.stream.publish({
            message: {
                streamPayload: payload,
                instanceKey: this.instanceKey,
                username: this.userName,
                usercuid: this.userCUID,
                controlString: controlString
            },
            channel: this.dataChannel,
            sendByPost: false,
            storeInHistory: historyRequired,
            ttl: this.ttl,
            meta: {"instanceKey": this.instanceKey, "usercuid": this.userCUID}
        });
        if (controlString === 'provenance') {
            await this.consoleOutput(`Provenance published ${await this.timeStampMaker(publishResponse.timetoken)}`);
            await this.toastrAlert('Provenance published', 'success');
        }
        else {
            await this.consoleOutput(`Control message ${controlString} published ${await this.timeStampMaker(publishResponse.timetoken)}`);
        }
    }

    async subscriptionHandler() {
        let locationInfo = await this.retrieveLocation();
        let subscriberIp = 'unresolved';
        let subscriberCity = 'unresolved';
        let subscriberState = 'unresolved';
        let subscriberCountry = 'unresolved';
        let subscriberCoordinates = 'unresolved';
        if (locationInfo.ip) {
            subscriberIp = locationInfo.ip;
        }
        if (locationInfo.city) {
            subscriberCity = locationInfo.city;
        }
        if (locationInfo.region) {
            subscriberState = locationInfo.region;
        }
        if (locationInfo.country) {
            subscriberCountry = locationInfo.country;
        }
        if (locationInfo.loc) {
            subscriberCoordinates = locationInfo.loc;
        }
        let subscriberStateInformation = {
            'username': this.userName,
            'ip': subscriberIp,
            'city': subscriberCity,
            'state': subscriberState,
            'country': subscriberCountry,
            'location': subscriberCoordinates
        };
        this.userState = subscriberStateInformation;
        await this.stream.setState({
            state: subscriberStateInformation,
            channels: [this.dataChannel]
        });
        this.stream.addListener({
            message: async (m) => {
                let channelName = m.channel;
                let publishTime = m.timetoken;
                let messagePayload = m.message.streamPayload;
                let messageUsername = m.message.username;
                let messageUserCUID = m.message.usercuid;
                let messageType = m.message.controlString;
                if (messageType === 'syncawait' && this.masterInstance) {
                    await this.consoleOutput(`${messageUsername} requested sync, please pause your work till synchronization is complete`);
                    await this.toastrAlert(`${messageUsername} requested sync, please pause your work till synchronization is complete`, 'info');
                    await this.publishHandler(`${messageUsername} requested sync, please pause your work till synchronization is complete`, 'flood', false);
                    let tempExportArray = await this.fetchAll();
                    let tempCache = await this.getObject(1, 'cache');
                    tempExportArray.push(tempCache);
                    let jsonLength = JSON.stringify(tempExportArray).length;
                    if (jsonLength < 25000) {
                        await this.publishHandler(tempExportArray, 'fromChannel', false);
                    }
                    else {
                        let gitResponse = await this.publishGist(tempExportArray, 'simprov.json', 'Simprov Provenance Data');
                        await this.publishHandler(gitResponse[1], 'fromGist', false);
                    }
                }
                else if (messageType === 'fromChannel' && this.slaveInstance) {
                    this.slaveInstance = false;
                    this.instantiationTime = publishTime.toString();
                    await this.collaborationImport(messagePayload, {
                        username: messageUsername,
                        userID: messageUserCUID
                    });
                    await this.consoleOutput(`Synced with ${messageUsername}`);
                    await this.toastrAlert(`Synced with ${messageUsername}`, 'success');
                }
                else if (messageType === 'fromGist' && this.slaveInstance) {
                    this.slaveInstance = false;
                    this.instantiationTime = publishTime.toString();
                    let dataArray = await this.retriveGist(messagePayload, 'simprov.json');
                    await this.collaborationImport(dataArray, {username: messageUsername, userID: messageUserCUID});
                    await this.consoleOutput(`Synced with ${messageUsername}`);
                    await this.toastrAlert(`Synced with ${messageUsername}`, 'success');
                }
                else if (messageType === 'syncack' && this.masterInstance) {
                    this.ifSynchronized = true;
                    await this.consoleOutput(`Synced with ${messageUsername}, please resume`);
                    await this.toastrAlert(`Synced with ${messageUsername}, please resume`, 'success');
                    await this.publishHandler(`${messageUsername} joined the session, please resume`, 'flood', false);
                    await this.createCustomEvent({
                        instanceType: 'master',
                        userInfo: {username: messageUsername, userID: messageUserCUID}
                    }, 'simprov.subscriberSync');
                    let presenceResponse = await this.channelPresence();
                    await this.consoleOutput(`Total members in session ${presenceResponse.totalOccupancy}`);
                    await this.toastrAlert(`Total members in session ${presenceResponse.totalOccupancy}`, 'info');
                    await this.publishHandler(`Total members in session ${presenceResponse.totalOccupancy}`, 'flood', false);
                }
                else if (messageType === 'flood') {
                    if (messagePayload.includes(this.userName)) {
                        messagePayload = messagePayload.replace(this.userName, 'You');
                    }
                    await this.consoleOutput(messagePayload);
                    await this.toastrAlert(messagePayload, 'info');
                }
                else if (messageType === 'control' && this.ifSynchronized) {
                    let controlString = messagePayload.type;
                    await this.consoleOutput(`${controlString.charAt(0).toUpperCase() + controlString.slice(1)} by ${messageUsername}`);
                    await this.toastrAlert(`${controlString.charAt(0).toUpperCase() + controlString.slice(1)} by ${messageUsername}`, 'info');
                    this.ifControlled = true;
                    if (controlString === 'undo') {
                        await this.undoAction(messageUsername);
                    } else if (controlString === 'redo') {
                        await this.redoAction(messageUsername);
                    }
                    else if (controlString === 'replay') {
                        await this.actionReplay(messagePayload.data, false, messageUsername);
                    }
                    this.ifControlled = false;
                }
                else if (messageType === 'provenance' && this.ifSynchronized) {
                    this.instantiationTime = publishTime.toString();
                    await this.consoleOutput(`Received provenance from ${messageUsername}, published ${await this.timeStampMaker(publishTime)}`);
                    await this.toastrAlert(`Received from ${messageUsername}`, 'info');
                    await this.addProvenance(messagePayload, messageUsername);
                }
            },
            status: async (s) => {
                if (s.category === 'PNNetworkUpCategory') {
                    await this.consoleOutput('Network is online');
                    await this.toastrAlert('Network is online', 'success');
                }
                else if (s.category === 'PNNetworkDownCategory') {
                    await this.consoleOutput('Network is down');
                    await this.toastrAlert('Network is down', 'error');
                }
                else if (s.category === 'PNNetworkIssuesCategory') {
                    await this.consoleOutput('Subscribe event experienced an exception when running');
                    await this.toastrAlert('Subscribe event experienced an exception when running', 'error');
                }
                else if (s.category === 'PNReconnectedCategory') {
                    await this.consoleOutput('Reconnected to streaming network');
                    await this.toastrAlert('Reconnected to streaming network', 'info');
                }
                else if (s.category === 'PNMalformedResponseCategory') {
                    await this.consoleOutput('JSON parsing crashed');
                    await this.toastrAlert('JSON parsing crashed', 'error');
                }
                else if (s.category === 'PNBadRequestCategory') {
                    await this.consoleOutput('Server rejected the request');
                    await this.toastrAlert('Server rejected the request', 'error');
                }
                else if (s.category === 'PNDecryptionErrorCategory') {
                    await this.consoleOutput('Decryption failed');
                    await this.toastrAlert('Decryption failed', 'error');
                }
                else if (s.category === 'PNTimeoutCategory') {
                    await this.consoleOutput('Failure to establish connection due to timeout');
                    await this.toastrAlert('Failure to establish connection due to timeout', 'error');
                }
                else if (s.category === 'PNConnectedCategory') {
                    await this.consoleOutput('Connected to streaming network');
                    await this.toastrAlert('Connected to streaming network', 'success');
                }
                else {
                    // await this.consoleOutput('Please reload the application');
                    // await this.toastrAlert('Please reload the application', 'error');
                }
            }
        });
        this.stream.setFilterExpression(`instanceKey == '${this.instanceKey}' && usercuid != '${this.userCUID}'`);
        this.stream.subscribe({
            channels: [this.dataChannel]
        });
        this.streamInitialized = true;
    }

    async channelPresence() {
        let presenceResponse = await this.stream.hereNow({
            channels: [this.dataChannel],
            includeUUIDs: true,
            includeState: true
        });
        return presenceResponse;
    }

    async collaborationImport(requiredData, userInfo) {
        let cachedInformation = requiredData.pop();
        this.persistent = cachedInformation.persistent;
        this.actionSummary = cachedInformation.actionSummary;
        cachedInformation.username = this.userName;
        cachedInformation.userCUID = this.userCUID;
        this.checkpointCounter = cachedInformation.checkpointCounter;
        let tempSimprovTree = cachedInformation.tree;
        let tempCurrentNodeID = cachedInformation.currentNodeID;
        await this.addTree(tempSimprovTree, tempCurrentNodeID);
        await this.clearTable('cache');
        await this.putData(cachedInformation, 'cache', 1);
        await this.clearTable();
        await this.bulkAddData(requiredData);
        if (this.retrieveHistory) {
            await this.fetchHistory(this.instantiationTime);
            let tempHistoryArray = [];
            for (let item of this.allHistory) {
                if (item.entry.instanceKey === this.instanceKey) {
                    this.instantiationTime = item.timetoken;
                    tempHistoryArray.push(item.entry.streamPayload);
                }
            }
            this.allHistory = tempHistoryArray;
        }
        if (this.allHistory.length) {
            for (let item of this.allHistory) {
                this.checkpointCounter = ++this.checkpointCounter;
                this.actionSummary[item.provenanceData.actionData.type] = ++this.actionSummary[item.provenanceData.actionData.type];
                await this.setCurrentNode(item.nodeToAdd);
                await this.addNode(item.nodeData);
                await this.updateObject(1, {
                    checkpointCounter: this.checkpointCounter,
                    tree: await this.getTree(),
                    currentNodeID: await this.getCurrentNodeID(),
                    actionSummary: this.actionSummary
                }, 'cache');
                await this.addData(item.provenanceData);
                tempCurrentNodeID = this.getCurrentNodeID();
            }
        }
        let addCount = await this.tableCount();
        await this.consoleOutput(`${addCount} record(s) added to provenance database`);
        await this.importConfirmation(addCount);
        await this.createCustomEvent(await this.fetchAll(), 'simprov.syncProvenance');
        await this.delayActionReplay(tempCurrentNodeID, true, 0);
        await this.publishHandler(null, 'syncack', false);
        await this.createCustomEvent({instanceType: 'slave', userInfo: userInfo}, 'simprov.subscriberSync');
        this.ifSynchronized = true;
    }

    async addProvenance(requiredData, userInfo) {
        this.checkpointCounter = ++this.checkpointCounter;
        this.actionSummary[requiredData.provenanceData.actionData.type] = ++this.actionSummary[requiredData.provenanceData.actionData.type];
        await this.setCurrentNode(requiredData.nodeToAdd);
        await this.addNode(requiredData.nodeData);
        await this.updateObject(1, {
            checkpointCounter: this.checkpointCounter,
            tree: await this.getTree(),
            currentNodeID: await this.getCurrentNodeID(),
            actionSummary: this.actionSummary
        }, 'cache');
        await this.addData(requiredData.provenanceData);
        await this.createCustomEvent(requiredData.provenanceData, 'simprov.added');
        this.redoSequence = [];
        await this.consoleOutput('Provenance added', true, userInfo);
        await this.toastrAlert('Provenance added', 'success');
        this.replayTrigger = true;
        let actionSequence = await this.actionSequencer(await this.getCurrentNodeID());
        if (Array.isArray(actionSequence)) {
            let integratedObject = await this.stateIntegrator(actionSequence);
            this.checkpointEmit(integratedObject.seed, integratedObject.streamData);
        }
        else {
            let tempObject = await this.getObject(actionSequence);
            this.checkpointEmit(tempObject.checkpoint, await this.streamDataFetcher(tempObject.timeStamp));
        }
        this.replayTrigger = false;
    }

    async fetchHistoryHelper(requiredTimetoken) {
        let responseHistory = await this.stream.history({
            channel: this.dataChannel,
            reverse: true,
            count: this.historyCount,
            stringifiedTimeToken: true,
            start: requiredTimetoken
        });
        return responseHistory;
    }

    async fetchHistory(requiredTimeToken) {
        let retrievedHistory = await this.fetchHistoryHelper(requiredTimeToken);
        let endTimeToken = retrievedHistory.endTimeToken;
        let transmittedMessages = retrievedHistory.messages;
        if (this.allHistory.length > 0) {
            this.allHistory = this.allHistory.concat(transmittedMessages);
        }
        else {
            this.allHistory = transmittedMessages;
        }
        if (this.historyMax !== 'all') {
            if (this.allHistory.length > this.historyMax) {
                this.allHistory.splice(this.historyMax);
            }
            if (transmittedMessages.length === this.historyCount && this.allHistory.length < this.historyMax) {
                await this.fetchHistory(endTimeToken);
            }
        } else {
            if (transmittedMessages.length === this.historyCount) {
                await this.fetchHistory(endTimeToken);
            }
        }
    }

    async displayCollaborationKey() {
        if (this.collaborationKey.length) {
            await this.consoleOutput(`Collaboration Key ${this.collaborationKey}`);
            await this.displayKey(this.collaborationKey);
        }
        else {
            await this.consoleOutput('No key exists');
            await this.toastrAlert('No key exists', 'warning');
        }
    }

    async streamControlHandler() {
        await this.streamControl.setState({
            state: this.userState,
            channels: [this.dataChannelControl]
        });

        this.streamControl.addListener({
            message: async (m) => {
                let publishTime = m.timetoken;
                let messagePayload = m.message.controlPayload;
                if (messagePayload === 'CloseConnection') {
                    await this.consoleOutput(`Connection close announced ${await this.timeStampMaker(publishTime)}`);
                    await this.toastrAlert('Connection close announced', 'warning');
                    this.stream.unsubscribeAll();
                    this.stream.stop();
                    this.streamControl.unsubscribeAll();
                    this.streamControl.stop();
                    await this.consoleOutput('Disconnected from network');
                    await this.toastrAlert('Disconnected from network', 'error');
                }
            }
        });
        this.streamControl.subscribe({
            channels: [this.dataChannelControl]
        });
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