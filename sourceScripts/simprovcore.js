import Database from './database';
import VendorHooks from './vendorhooks';
import Utilities from './utilities';
import Backup from './backup';
import Tree from './tree';
import Thumbnail from './thumbnail';
import UserInterface from './userinterface';
import {mixin} from 'es6-mixin';
import cuid from 'cuid';
import sortKeys from 'sort-keys';
import PubNub from 'pubnub';
import randomColor from 'random-color';
import moment from 'moment';
import './Treant';

export default class Core {
    constructor(configuration) {
        this.userName = configuration.username || 'SIMProvUser';
        this.userInterface = configuration.uiNeeded || false;
        this.selectedUIElementID = '';
        this.verboseC = configuration.verbose || false;
        this.realtime = configuration.realtime || false;
        this.collaboration = configuration.collaboration || false;
        this.databaseName = configuration.databaseName || 'simprov';
        this.startTimeFrame = configuration.startTimeFrame || Date.now();
        this.persistent = true;
        this.dataLockPMode = false;
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
        this.treeNodeColor = randomColor().hexString();
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
        this.overlayAlpha = 0.75;
        this.isUITreeInitialized = false;
        this.shouldUITreeUpdate = false;
        this.uiTree = {};
        this.shouldAPanelUpdate = false;
        this.isGalleryOpen = false;
        this.isAPanelOpen = false;
        mixin(this, Database, this.databaseName);
        mixin(this, VendorHooks, this.verboseSC);
        mixin(this, Utilities);
        mixin(this, Backup);
        mixin(this, Tree);
        mixin(this, Thumbnail, this.userInterface);
        mixin(this, UserInterface);
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
            if (this.userInterface) {
                this.shouldUITreeUpdate = true;
                this.shouldAPanelUpdate = true;
                await this.updateUISelections(actionCUID);
            }
            if (this.ifSynchronized && !this.ifControlled) {
                await this.publishHandler({type: 'replay', data: actionCUID}, 'control', false);
            }
        }
        else {
            await this.consoleOutput('Already in the required state');
            await this.toastrAlert('Already in the required state', 'warning');
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
            let tempNode = await this.nodeMaker(tempObject.actionCUID, hasCheckpoint, isInvertible, tempObject.actionData, this.treeNodeColor);
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
            if (this.userInterface) {
                await this.updateUI(tempDataObject);
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
                    this.treeNodeColor = cachedInformation.treeNodeColor;
                }
                else {
                    cachedInformation.username = this.userName;
                    cachedInformation.userCUID = this.userCUID;
                    let modifyRecordsDecision = await this.modifyRecordsDecision();
                    if (modifyRecordsDecision) {
                        this.treeNodeColor = cachedInformation.treeNodeColor;
                        for (let tempObject of tempArray) {
                            tempObject.username = this.userName;
                            tempObject.userCUID = this.userCUID;
                        }
                    }
                    else {
                        cachedInformation.treeNodeColor = this.treeNodeColor;
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
                let tempDataArray = await this.fetchAll();
                if (this.userInterface) {
                    if (this.realtime) {
                        if (this.persistent) {
                            if ($('#simprovPersistenceFalseIcon').hasClass('simprov-active-icon-selection')) {
                                $('#simprovPersistenceFalseIcon').removeClass('simprov-active-icon-selection');
                                $('#simprovPersistenceTrueIcon').addClass('simprov-active-icon-selection');
                            }
                        }
                        else if (!this.persistent) {
                            if ($('#simprovPersistenceTrueIcon').hasClass('simprov-active-icon-selection')) {
                                $('#simprovPersistenceTrueIcon').removeClass('simprov-active-icon-selection');
                                $('#simprovPersistenceFalseIcon').addClass('simprov-active-icon-selection');
                            }
                        }
                        await this.disableStreamImportUIButtons();
                    }
                    $('#simprovThumbnailContent').empty();
                    $('#simprovTableContent').empty();
                    for (let tempObject of tempDataArray) {
                        await this.updateUI(tempObject, false);
                    }
                    await this.updateUISelections(tempCurrentNodeID, false);
                }
                await this.createCustomEvent(tempDataArray, 'simprov.importedProvenance');
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
        if (this.userInterface) {
            await this.initializeUI();
        }
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
            this.treeNodeColor = cachedInformation.treeNodeColor;
            await this.consoleOutput('Loaded from database');
            await this.toastrAlert('Loaded from database', 'success');
            let tempDataArray = await this.fetchAll();
            if (this.userInterface) {
                if (this.realtime) {
                    if (!this.persistent) {
                        $('#simprovPersistenceTrueIcon').removeClass('simprov-active-icon-selection');
                        $('#simprovPersistenceFalseIcon').addClass('simprov-active-icon-selection');
                    }
                    await this.disableStreamImportUIButtons();
                }
                for (let tempObject of tempDataArray) {
                    await this.updateUI(tempObject, false);
                }
                await this.updateUISelections(tempCurrentNodeID, false);
            }
            await this.createCustomEvent(tempDataArray, 'simprov.reloaded');
            await this.delayActionReplay(tempCurrentNodeID, true);
        }
        else {
            let tempProvenanceData = {type: 'Initial', information: 'Initial state'};
            let tempObject = await this.objectWrapper(tempProvenanceData, true);
            let tempNode = await this.nodeMaker(tempObject.actionCUID, true, false, tempObject.actionData, this.treeNodeColor);
            await this.addRoot(tempNode);
            let tempCache = {
                username: this.userName,
                userCUID: this.userCUID,
                checkpointCounter: this.checkpointCounter,
                tree: await this.getTree(),
                currentNodeID: await this.getCurrentNodeID(),
                persistent: this.persistent,
                actionSummary: this.actionSummary,
                treeNodeColor: this.treeNodeColor
            };
            await this.initializeDB();
            await this.putData(tempCache, 'cache', 1);
            let dbCUID = await this.addData(tempObject);
            await this.createThumbnail(dbCUID);
            let tempDataObject = await this.getObject(dbCUID);
            if (this.userInterface) {
                await this.updateUI(tempDataObject);
            }
            await this.createCustomEvent(tempDataObject, 'simprov.added');
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

    async addAnnotation(requiredID) {
        let tempDataObject = await this.getObject(requiredID);
        let currentAnnotation = tempDataObject.annotation;
        let updatedAnnotation = await this.annotationInput(tempDataObject);
        if (currentAnnotation !== updatedAnnotation) {
            await this.updateObject(requiredID, {annotation: updatedAnnotation});
            if (this.userInterface) {
                this.shouldAPanelUpdate = true;
            }
            if (this.ifSynchronized) {
                await this.publishHandler({
                    type: 'annotation',
                    data: updatedAnnotation, addToID: requiredID
                }, 'control', false);
                await this.consoleOutput('Annotation published');
                await this.toastrAlert('Annotation published', 'success');
            }
            if (!currentAnnotation.length) {
                await this.consoleOutput(`Annotation [${updatedAnnotation}] added`);
                await this.toastrAlert('Annotated', 'info');
            }
            else {
                await this.consoleOutput(`Annotation updated from [${currentAnnotation}] to [${updatedAnnotation}]`);
                await this.toastrAlert('Annotation updated', 'info');
            }
        }
    }

    async updateAnnotation(requiredID, annotationData, userInfo) {
        await this.updateObject(requiredID, {annotation: annotationData});
        await this.consoleOutput(`Added annotation [${annotationData}]`, true, userInfo);
        await this.toastrAlert('Annotated', 'info');
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
            wrappedObject.treeNodeColor = this.treeNodeColor;
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
            if (this.userInterface) {
                await this.updateUISelections(tempCurrentNode.parent.model.id, true, true);
            }
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
                this.dataLockPMode = false;
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
                if (this.userInterface) {
                    if (this.persistent) {
                        if ($('#simprovPersistenceFalseIcon').hasClass('simprov-active-icon-selection')) {
                            $('#simprovPersistenceFalseIcon').removeClass('simprov-active-icon-selection');
                            $('#simprovPersistenceTrueIcon').addClass('simprov-active-icon-selection');
                        }
                    }
                    else if (!this.persistent) {
                        if ($('#simprovPersistenceTrueIcon').hasClass('simprov-active-icon-selection')) {
                            $('#simprovPersistenceTrueIcon').removeClass('simprov-active-icon-selection');
                            $('#simprovPersistenceFalseIcon').addClass('simprov-active-icon-selection');
                        }
                    }
                }
            }
            else {
                await this.consoleOutput(`Already in persistent mode ${this.persistent}`);
                await this.toastrAlert(`Already in persistent mode ${this.persistent}`, 'warning');
                if (this.persistent) {
                    if (this.dataLockPMode) {
                        this.dataLockPMode = false;
                        await this.consoleOutput('Unlocked Persistent Mode data', true);
                        await this.toastrAlert('Unlocked Persistent Mode data', 'info');
                    }
                    else if (!this.dataLockPMode) {
                        this.dataLockPMode = true;
                        await this.consoleOutput('Locked Persistent Mode data', true);
                        await this.toastrAlert('Locked Persistent Mode data', 'info');
                    }
                }
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
            if (this.userInterface) {
                await this.updateUISelections(tempNodeID, true, true);
            }
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
        if (this.realtime && !this.dataLockPMode) {
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
        await this.showSize(jsonSize, 'Provenance Size');
    }

    async showStreamSize() {
        let tempExportArray = await this.fetchAll('stream');
        let jsonSize = await this.computeJsonSize(tempExportArray);
        await this.consoleOutput(`Stream size ${jsonSize}`);
        await this.showSize(jsonSize, 'Stream Size');
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
            if (this.userInterface) {
                $('#simprovCollaborate').off('click');
                $('#simprovCollaborate').addClass('simprov-disabled');
            }
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
                        if (this.userInterface && this.isGalleryOpen) {
                            $('#simprovOverlayCloseIcon').click();
                            $('#simprovOverlay').click();
                        }
                    } else if (controlString === 'redo') {
                        await this.redoAction(messageUsername);
                        if (this.userInterface && this.isGalleryOpen) {
                            $('#simprovOverlayCloseIcon').click();
                            $('#simprovOverlay').click();
                        }
                    }
                    else if (controlString === 'replay') {
                        await this.actionReplay(messagePayload.data, false, messageUsername);
                        if (this.userInterface && this.isGalleryOpen) {
                            $('#simprovOverlayCloseIcon').click();
                            $('#simprovOverlay').click();
                        }
                    }
                    else if (controlString === 'annotation') {
                        await this.updateAnnotation(messagePayload.addToID, messagePayload.data, messageUsername);
                        if (this.userInterface && this.isAPanelOpen) {
                            $('#simprovAnnotationOverlayCloseIcon').click();
                            $('#simprovAnnotationPanel').click();
                        }
                    }
                    this.ifControlled = false;
                }
                else if (messageType === 'provenance' && this.ifSynchronized) {
                    this.instantiationTime = publishTime.toString();
                    await this.consoleOutput(`Received provenance from ${messageUsername}, published ${await this.timeStampMaker(publishTime)}`);
                    await this.toastrAlert(`Received from ${messageUsername}`, 'info');
                    await this.addProvenance(messagePayload, messageUsername);
                    if (this.userInterface && this.isGalleryOpen) {
                        $('#simprovOverlayCloseIcon').click();
                        $('#simprovOverlay').click();
                    }
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
        cachedInformation.treeNodeColor = this.treeNodeColor;
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
        let tempDataArray = await this.fetchAll();
        if (this.userInterface) {
            if (this.realtime) {
                if (this.persistent) {
                    if ($('#simprovPersistenceFalseIcon').hasClass('simprov-active-icon-selection')) {
                        $('#simprovPersistenceFalseIcon').removeClass('simprov-active-icon-selection');
                        $('#simprovPersistenceTrueIcon').addClass('simprov-active-icon-selection');
                    }
                }
                else if (!this.persistent) {
                    if ($('#simprovPersistenceTrueIcon').hasClass('simprov-active-icon-selection')) {
                        $('#simprovPersistenceTrueIcon').removeClass('simprov-active-icon-selection');
                        $('#simprovPersistenceFalseIcon').addClass('simprov-active-icon-selection');
                    }
                }
            }
            $('#simprovThumbnailContent').empty();
            $('#simprovTableContent').empty();
            for (let tempObject of tempDataArray) {
                await this.updateUI(tempObject, false);
            }
            await this.updateUISelections(tempCurrentNodeID, false);
            $('#simprovCollaborate').off('click');
            $('#simprovCollaborate').addClass('simprov-disabled');
        }
        await this.createCustomEvent(tempDataArray, 'simprov.syncProvenance');
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
        if (this.userInterface) {
            await this.updateUI(requiredData.provenanceData);
        }
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
                    await this.consoleOutput('Disconnected from collaboration network');
                    await this.toastrAlert('Disconnected from collaboration network', 'error');
                }
            }
        });
        this.streamControl.subscribe({
            channels: [this.dataChannelControl]
        });
    }

    async initializeUI() {
        await this.addUserInterface();
        $('#simprovThumbnail').click((event) => {
            event.preventDefault();
            if ($('#simprovImportExportIcon').hasClass('simprov-active-icon-selection')) {
                $('.simprov-vertical-bar-submenu-import-export').fadeToggle();
                $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
            }
            if ($('#simprovRealtimeIcon').hasClass('simprov-active-icon-selection')) {
                $('.simprov-vertical-bar-submenu-realtime').fadeToggle();
                $('#simprovRealtimeIcon').toggleClass('simprov-active-icon-selection');
            }
            if ($('#simprovCollaborationIcon').hasClass('simprov-active-icon-selection')) {
                $('.simprov-vertical-bar-submenu-collaboration').fadeToggle();
                $('#simprovCollaborationIcon').toggleClass('simprov-active-icon-selection');
            }
            $('.simprov-thumbnail-scroll-content').fadeToggle();
            $('#simprovThumbnailIcon').toggleClass('simprov-active-icon-selection');
            let thumbnailPosition = $(`#${this.selectedUIElementID}-thumbnailDiv`).position();
            $('#simprovThumbnailContent').animate({scrollLeft: thumbnailPosition.left}, 1000);
            $('#simprovThumbnailContent').perfectScrollbar('update');
        });
        $('#simprovUndo').click(async (event) => {
            event.preventDefault();
            await this.undoAction();
        });
        $('#simprovRedo').click(async (event) => {
            event.preventDefault();
            await this.redoAction();
        });
        $('#simprovOverlay').click(async (event) => {
            event.preventDefault();
            if ($('#simprovThumbnailIcon').hasClass('simprov-active-icon-selection')) {
                $('.simprov-thumbnail-scroll-content').fadeToggle();
                $('#simprovThumbnailIcon').toggleClass('simprov-active-icon-selection');
            }
            if ($('#simprovImportExportIcon').hasClass('simprov-active-icon-selection')) {
                $('.simprov-vertical-bar-submenu-import-export').fadeToggle();
                $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
            }
            if ($('#simprovRealtimeIcon').hasClass('simprov-active-icon-selection')) {
                $('.simprov-vertical-bar-submenu-realtime').fadeToggle();
                $('#simprovRealtimeIcon').toggleClass('simprov-active-icon-selection');
            }
            if ($('#simprovCollaborationIcon').hasClass('simprov-active-icon-selection')) {
                $('.simprov-vertical-bar-submenu-collaboration').fadeToggle();
                $('#simprovCollaborationIcon').toggleClass('simprov-active-icon-selection');
            }
            $('#simprovUserInterface').fadeToggle(0);
            $('.simprov-overlay').fadeToggle(0);
            $('#simprovOverlayIcon').toggleClass('simprov-active-icon-selection');
            await this.showUITree();
            await this.updateUITreeSelection();
            let rowPosition = $(`#${this.selectedUIElementID}-tableTR`).position();
            $('#simprovTable').animate({scrollTop: rowPosition.top}, 1000);
            $('#simprovTable').perfectScrollbar('update');
            this.isGalleryOpen = true;
        });
        $('#simprovOverlayCloseIcon').click((event) => {
            event.preventDefault();
            $('.simprov-overlay').fadeToggle(0);
            $('#simprovOverlayIcon').toggleClass('simprov-active-icon-selection');
            $('#simprovUserInterface').fadeToggle(0);
            this.isGalleryOpen = false;
        });
        $('#simprovImportExport').click((event) => {
            event.preventDefault();
            if ($('#simprovThumbnailIcon').hasClass('simprov-active-icon-selection')) {
                $('.simprov-thumbnail-scroll-content').fadeToggle();
                $('#simprovThumbnailIcon').toggleClass('simprov-active-icon-selection');
            }
            if ($('#simprovRealtimeIcon').hasClass('simprov-active-icon-selection')) {
                $('.simprov-vertical-bar-submenu-realtime').fadeToggle();
                $('#simprovRealtimeIcon').toggleClass('simprov-active-icon-selection');
            }
            if ($('#simprovCollaborationIcon').hasClass('simprov-active-icon-selection')) {
                $('.simprov-vertical-bar-submenu-collaboration').fadeToggle();
                $('#simprovCollaborationIcon').toggleClass('simprov-active-icon-selection');
            }
            $('.simprov-vertical-bar-submenu-import-export').fadeToggle();
            $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
        });
        $('#simprovImportJson').click(async (event) => {
            event.preventDefault();
            $('.simprov-vertical-bar-submenu-import-export').fadeToggle();
            $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
            await this.importProvenance('json');
        });
        $('#simprovImportGist').click(async (event) => {
            event.preventDefault();
            $('.simprov-vertical-bar-submenu-import-export').fadeToggle();
            $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
            await this.importProvenance('gist');
        });
        $('#simprovProvenanceSize').click(async (event) => {
            event.preventDefault();
            $('.simprov-vertical-bar-submenu-import-export').fadeToggle();
            $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
            await this.showProvenanceSize();
        });
        $('#simprovSummary').click(async (event) => {
            event.preventDefault();
            $('.simprov-vertical-bar-submenu-import-export').fadeToggle();
            $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
            await this.showSummary();
        });
        $('#simprovExportJson').click(async (event) => {
            event.preventDefault();
            $('.simprov-vertical-bar-submenu-import-export').fadeToggle();
            $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
            await this.exportProvenance('json');
        });
        $('#simprovExportGist').click(async (event) => {
            event.preventDefault();
            $('.simprov-vertical-bar-submenu-import-export').fadeToggle();
            $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
            await this.exportProvenance('gist');
        });
        $('#simprovAnnotationPanel').click(async () => {
            $('.simprov-vertical-bar-submenu-import-export').fadeToggle(0);
            $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
            $('#simprovUserInterface').fadeToggle(0);
            $('.simprov-annotation-overlay').fadeToggle(0);
            await this.showAnnotationPanel();
            this.isAPanelOpen = true;
        });
        $('#simprovAnnotationOverlayCloseIcon').click(() => {
            $('.simprov-annotation-overlay').fadeToggle(0);
            $('#simprovUserInterface').fadeToggle(0);
            this.isAPanelOpen = false;
        });
        $('#simprovDeleteData').click(async (event) => {
            event.preventDefault();
            $('.simprov-vertical-bar-submenu-import-export').fadeToggle();
            $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
            await this.resetAll();
        });
        if (this.realtime) {
            $('#simprovRealtime').click((event) => {
                event.preventDefault();
                if ($('#simprovThumbnailIcon').hasClass('simprov-active-icon-selection')) {
                    $('.simprov-thumbnail-scroll-content').fadeToggle();
                    $('#simprovThumbnailIcon').toggleClass('simprov-active-icon-selection');
                }
                if ($('#simprovImportExportIcon').hasClass('simprov-active-icon-selection')) {
                    $('.simprov-vertical-bar-submenu-import-export').fadeToggle();
                    $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
                }
                if ($('#simprovCollaborationIcon').hasClass('simprov-active-icon-selection')) {
                    $('.simprov-vertical-bar-submenu-collaboration').fadeToggle();
                    $('#simprovCollaborationIcon').toggleClass('simprov-active-icon-selection');
                }
                $('.simprov-vertical-bar-submenu-realtime').fadeToggle();
                $('#simprovRealtimeIcon').toggleClass('simprov-active-icon-selection');
            });
            $('#simprovPersistenceTrueIcon').addClass('simprov-active-icon-selection');
            $('#simprovImportStreamJson').click(async (event) => {
                event.preventDefault();
                $('.simprov-vertical-bar-submenu-realtime').fadeToggle();
                $('#simprovRealtimeIcon').toggleClass('simprov-active-icon-selection');
                await this.importStream('json');
            });
            $('#simprovImportStreamGist').click(async (event) => {
                event.preventDefault();
                $('.simprov-vertical-bar-submenu-realtime').fadeToggle();
                $('#simprovRealtimeIcon').toggleClass('simprov-active-icon-selection');
                await this.importStream('gist');
            });
            $('#simprovStreamSize').click(async (event) => {
                event.preventDefault();
                $('.simprov-vertical-bar-submenu-realtime').fadeToggle();
                $('#simprovRealtimeIcon').toggleClass('simprov-active-icon-selection');
                await this.showStreamSize();
            });
            $('#simprovPersistenceTrue').click(async (event) => {
                event.preventDefault();
                await this.persistentMode(true);
            });
            $('#simprovPersistenceFalse').click(async (event) => {
                event.preventDefault();
                await this.persistentMode(false);
            });
            $('#simprovExportStreamJson').click(async (event) => {
                event.preventDefault();
                $('.simprov-vertical-bar-submenu-realtime').fadeToggle();
                $('#simprovRealtimeIcon').toggleClass('simprov-active-icon-selection');
                await this.exportStream('json');
            });
            $('#simprovExportStreamGist').click(async (event) => {
                event.preventDefault();
                $('.simprov-vertical-bar-submenu-realtime').fadeToggle();
                $('#simprovRealtimeIcon').toggleClass('simprov-active-icon-selection');
                await this.exportStream('gist');
            });
        }
        else {
            $('#simprovRealtime').addClass('simprov-disabled');
        }
        if (this.collaboration) {
            $('#simprovCollaboration').click((event) => {
                event.preventDefault();
                if ($('#simprovThumbnailIcon').hasClass('simprov-active-icon-selection')) {
                    $('.simprov-thumbnail-scroll-content').fadeToggle();
                    $('#simprovThumbnailIcon').toggleClass('simprov-active-icon-selection');
                }
                if ($('#simprovImportExportIcon').hasClass('simprov-active-icon-selection')) {
                    $('.simprov-vertical-bar-submenu-import-export').fadeToggle();
                    $('#simprovImportExportIcon').toggleClass('simprov-active-icon-selection');
                }
                if ($('#simprovRealtimeIcon').hasClass('simprov-active-icon-selection')) {
                    $('.simprov-vertical-bar-submenu-realtime').fadeToggle();
                    $('#simprovRealtimeIcon').toggleClass('simprov-active-icon-selection');
                }
                $('.simprov-vertical-bar-submenu-collaboration').fadeToggle();
                $('#simprovCollaborationIcon').toggleClass('simprov-active-icon-selection');
            });
            $('#simprovCollaborate').click(async (event) => {
                event.preventDefault();
                $('.simprov-vertical-bar-submenu-collaboration').fadeToggle();
                $('#simprovCollaborationIcon').toggleClass('simprov-active-icon-selection');
                await this.collaborate();
            });
            $('#simprovCollaborationKey').click(async (event) => {
                event.preventDefault();
                $('.simprov-vertical-bar-submenu-collaboration').fadeToggle();
                $('#simprovCollaborationIcon').toggleClass('simprov-active-icon-selection');
                await this.displayCollaborationKey();
            });
        }
        else {
            $('#simprovCollaboration').addClass('simprov-disabled');
        }
        $(document).keydown(async (event) => {
            if (event.altKey && event.shiftKey && event.keyCode === 79) {
                let tempOverlayAlpha = this.overlayAlpha;
                this.overlayAlpha += 0.25;
                if (this.overlayAlpha > 1) {
                    this.overlayAlpha = 0.25;
                }
                $('.simprov-overlay, .simprov-annotation-overlay').animate({
                    backgroundColor: `rgba(217, 214, 207, ${this.overlayAlpha})`
                }, 500);
                if (tempOverlayAlpha > this.overlayAlpha) {
                    await this.consoleOutput(`Made overlays translucent with ${this.overlayAlpha} opacity`);
                    await this.toastrAlert('Made overlays translucent', 'info');
                } else {
                    await this.consoleOutput(`Made overlays opaque with ${this.overlayAlpha} opacity`);
                    await this.toastrAlert('Increased overlays opacity', 'info');
                }
            }
        });
        $(document).tooltip({
            items: '[data-simprovTimestamp], [title]',
            content: function () {
                let element = $(this);
                if (element.is('[data-simprovTimestamp]')) {
                    let titleText = element.attr('title');
                    let titleTimestamp = element.attr('data-simprovTimestamp');
                    titleText = `Created ${moment(parseInt(titleTimestamp, 10)).fromNow()} ${titleText}`;
                    return titleText;
                }
                else if (element.is('[title]')) {
                    return element.attr('title');
                }
            },
            track: true
        });

        $('.simprov-overlay-table-container').perfectScrollbar({suppressScrollX: true});
        $('.simprov-thumbnail-scroll-content').perfectScrollbar();
        $('.simprov-overlay-tree-container').perfectScrollbar();
        $('.simprov-annotation-overlay-table-container').perfectScrollbar();
    }

    updateUI(requiredData, shouldUpdate = true) {
        return new Promise((resolve) => {
            let thumbnailDivID = `${requiredData.actionCUID}-thumbnailDiv`;
            let thumbnailLinkID = `${requiredData.actionCUID}-thumbnailLink`;
            let thumbnailAnnotateID = `${requiredData.actionCUID}-thumbnailAnnotate`;
            let thumbnailDivContent = `<div id="${thumbnailDivID}" class="simprov-thumbnail-scroll-content-thumbnail"><a id="${thumbnailLinkID}" href="#" title="by ${requiredData.username}<br>${requiredData.actionData.information}<br>( ${requiredData.actionCUID.substr(requiredData.actionCUID.length - 8, 8)} )" data-simprovTimestamp="${requiredData.timeStamp}"><img src="${requiredData.thumbnail}"></a><a id="${thumbnailAnnotateID}" class="simprov-thumbnail-scroll-content-thumbnail-annotation" href="#" title="Annotate"><i class="fa fa-commenting"></i></a></div>`;
            $('#simprovThumbnailContent').append(thumbnailDivContent);
            $(`#${thumbnailLinkID}`).click(async (event) => {
                event.preventDefault();
                let requiredID = (event.currentTarget.id).split('-')[0];
                await this.actionReplay(requiredID, false);
            });
            $(`#${thumbnailAnnotateID}`).click(async (event) => {
                event.preventDefault();
                let requiredID = (event.currentTarget.id).split('-')[0];
                await this.addAnnotation(requiredID);
            });

            let tableTRID = `${requiredData.actionCUID}-tableTR`;
            let tableLinkID = `${requiredData.actionCUID}-tableLink`;
            let tableAnnotateID = `${requiredData.actionCUID}-tableAnnotate`;
            let tableLocateID = `${requiredData.actionCUID}-tableLocate`;
            let tableTRContent = `<tr id="${tableTRID}"><td><a id="${tableLinkID}" class="simprov-table-link" href="#"><img class="simprov-table-image" src="${requiredData.thumbnail}"></a></td>
                    <td><span class="simprov-captured-span">${requiredData.actionCUID.substr(requiredData.actionCUID.length - 8, 8)}</span></td>
                    <td>At<br><span class="simprov-captured-span">${moment(requiredData.timeStamp).format('MMMM-DD-YYYY')}</span><br>On<br><span class="simprov-captured-span">${moment(requiredData.timeStamp).format('HH:mm:ss')}</span><br>By<br><span class="simprov-captured-span">${requiredData.username}</span></td>
                    <td><a id="${tableAnnotateID}" class="simprov-table-icons" href="#" title="Annotate"><i class="fa fa-commenting"></i></a><a id="${tableLocateID}" class="simprov-table-icons" href="#" title="Locate on tree"><i class="fa fa-map-marker"></i></a></td></tr>`;
            $('#simprovTableContent').append(tableTRContent);

            $(`#${tableLinkID}`).click(async (event) => {
                event.preventDefault();
                let requiredID = (event.currentTarget.id).split('-')[0];
                let previousNode = this.selectedUIElementID;
                await this.actionReplay(requiredID, false);
                if (this.shouldUITreeUpdate) {
                    await this.updateUITreeSelection(previousNode);
                    this.shouldUITreeUpdate = false;
                }
            });
            $(`#${tableAnnotateID}`).click(async (event) => {
                event.preventDefault();
                let requiredID = (event.currentTarget.id).split('-')[0];
                await this.addAnnotation(requiredID);
            });
            $(`#${tableLocateID}`).click(async (event) => {
                event.preventDefault();
                let requiredID = (event.currentTarget.id).split('-')[0];
                await this.locateUIOnTree(requiredID);
            });

            if (shouldUpdate) {
                if (this.selectedUIElementID.length) {
                    $(`#${this.selectedUIElementID}-thumbnailDiv`).css({'border-color': '', 'box-shadow': ''});
                    $(`#${this.selectedUIElementID}-tableLink`).css({'border-color': '', 'box-shadow': ''});
                    $(`#${this.selectedUIElementID}-tableTR`).css('background-color', '');
                    $(`#${this.selectedUIElementID}-tableTR`).removeClass('simprov-row-selection');
                }
                $(`#${thumbnailDivID}`).css({
                    'border-color': 'rgb(255, 153, 102)',
                    'box-shadow': '0 0 1px 0 rgba(255, 153, 102, 0.70)'
                });
                $(`#${tableLinkID}`).css({
                    'border-color': 'rgb(255, 153, 102)',
                    'box-shadow': '0 0 1px 0 rgba(255, 153, 102, 0.70)'
                });
                $(`#${tableTRID}`).css('background-color', 'rgba(255, 153, 102, 0.1)');
                $(`#${tableTRID}`).addClass('simprov-row-selection');
                this.selectedUIElementID = requiredData.actionCUID;
                let thumbnailPosition = $(`#${thumbnailDivID}`).position();
                $('#simprovThumbnailContent').animate({scrollLeft: thumbnailPosition.left}, 1000);
                $('#simprovThumbnailContent').perfectScrollbar('update');
            }
            resolve();
        });
    }

    updateUISelections(requiredID, shouldUpdate = true, shouldScroll = false) {
        return new Promise((resolve) => {
            if (shouldUpdate) {
                $(`#${this.selectedUIElementID}-thumbnailDiv`).css({'border-color': '', 'box-shadow': ''});
                $(`#${this.selectedUIElementID}-tableLink`).css({'border-color': '', 'box-shadow': ''});
                $(`#${this.selectedUIElementID}-tableTR`).css('background-color', '');
                $(`#${this.selectedUIElementID}-tableTR`).removeClass('simprov-row-selection');
            }
            $(`#${requiredID}-thumbnailDiv`).css({
                'border-color': 'rgb(255, 153, 102)',
                'box-shadow': '0 0 1px 0 rgba(255, 153, 102, 0.70)'
            });
            $(`#${requiredID}-tableLink`).css({
                'border-color': 'rgb(255, 153, 102)',
                'box-shadow': '0 0 1px 0 rgba(255, 153, 102, 0.70)'
            });
            $(`#${requiredID}-tableTR`).css('background-color', 'rgba(255, 153, 102, 0.1)');
            $(`#${requiredID}-tableTR`).addClass('simprov-row-selection');
            this.selectedUIElementID = requiredID;
            if (shouldScroll) {
                let thumbnailPosition = $(`#${requiredID}-thumbnailDiv`).position();
                $('#simprovThumbnailContent').animate({scrollLeft: thumbnailPosition.left}, 1000);
                $('#simprovThumbnailContent').perfectScrollbar('update');
            }
            resolve();
        });
    }

    async locateUIOnTree(requiredID) {
        let tempObject = await this.getObject(requiredID);
        let nodeColor = tempObject.treeNodeColor;
        let uiTreeNodeID = `#${requiredID}-${nodeColor.replace('#', '')}-tree`;
        let nodePositionLeft = $(uiTreeNodeID).css('left').replace(/[^0-9]/g, '');
        let nodePositionTop = $(uiTreeNodeID).css('top').replace(/[^0-9]/g, '');
        $('#simprovTree').animate({scrollLeft: nodePositionLeft - 20, scrollTop: nodePositionTop - 20}, 1000);
        $('#simprovTree').perfectScrollbar('update');
        $(uiTreeNodeID).css({
            'border-color': '#9ACD32',
            'box-shadow': '0 0 1px 0 rgba(255, 204, 51, 0.70)'
        });
        setTimeout(() => {
            if (requiredID === this.selectedUIElementID) {
                $(uiTreeNodeID).css({
                    'border-color': 'rgb(255, 153, 102)',
                    'box-shadow': '0 0 1px rgba(255, 153, 102, 0.70)'
                });
            }
            else {
                $(uiTreeNodeID).css({'border-color': nodeColor, 'box-shadow': ''});
            }
        }, 4000);
    }

    onAfterPositionNode(treeNode) {
        let requiredArray = (treeNode.nodeHTMLid).split('-');
        let nodeColor = `#${requiredArray[1]}`;
        $(`#${treeNode.nodeHTMLid}`).css({'border-color': nodeColor});
        $(`#${treeNode.nodeHTMLid}`).click((event) => {
            event.preventDefault();
            let nodeID = (event.currentTarget.id).split('-')[0];
            let rowPosition = $(`#${nodeID}-tableTR`).position();
            $('#simprovTable').animate({scrollTop: rowPosition.top}, 1000);
            $('#simprovTable').perfectScrollbar('update');
            $(`#${nodeID}-tableLink`).css({
                'border-color': '#9ACD32',
                'box-shadow': '0 0 1px 0 rgba(255, 204, 51, 0.70)'
            });
            $(`#${nodeID}-tableTR`).css('background-color', 'rgba(154, 205, 50, 0.2)');
            setTimeout(() => {
                if ($(`#${nodeID}-tableTR`).hasClass('simprov-row-selection')) {
                    $(`#${nodeID}-tableLink`).css({
                        'border-color': 'rgb(255, 153, 102)',
                        'box-shadow': '0 0 1px 0 rgba(255, 153, 102, 0.70)'
                    });
                    $(`#${nodeID}-tableTR`).css('background-color', 'rgba(255, 153, 102, 0.1)');
                }
                else {
                    $(`#${nodeID}-tableLink`).css({'border-color': '', 'box-shadow': ''});
                    $(`#${nodeID}-tableTR`).css('background-color', '');
                }
            }, 4000);
        });
    }

    async showUITree() {
        let treeStructure = await this.getTree();
        let uiTreeConfiguration = {
            chart: {
                container: '#simprovTree',
                callback: {
                    onAfterPositionNode: this.onAfterPositionNode
                },
                connectors: {
                    type: "step",
                    style: {
                        'stroke': '#FFA500',
                        'arrow-end': 'oval-wide-long',
                        "stroke-width": 2
                    }
                },
            },
            nodeStructure: treeStructure
        };
        if (!this.isUITreeInitialized) {
            this.uiTree = new Treant(uiTreeConfiguration, null, $);
            this.isUITreeInitialized = true;
        } else {
            this.uiTree.destroy();
            this.uiTree = new Treant(uiTreeConfiguration, null, $);
        }
    }

    async updateUITreeSelection(previousNode) {
        if (previousNode !== undefined) {
            let auxObject = await this.getObject(previousNode);
            let auxNodeColor = auxObject.treeNodeColor;
            let auxUITreeNodeID = `#${previousNode}-${auxNodeColor.replace('#', '')}-tree`;
            $(auxUITreeNodeID).css({'border-color': auxNodeColor, 'box-shadow': ''});
        }
        let tempObject = await this.getObject(this.selectedUIElementID);
        let nodeColor = tempObject.treeNodeColor;
        let uiTreeNodeID = `#${this.selectedUIElementID}-${nodeColor.replace('#', '')}-tree`;
        $(uiTreeNodeID).css({
            'border-color': 'rgb(255, 153, 102)',
            'box-shadow': '0 0 1px rgba(255, 153, 102, 0.70)'
        });
        let nodePositionLeft = $(uiTreeNodeID).css('left').replace(/[^0-9]/g, '');
        let nodePositionTop = $(uiTreeNodeID).css('top').replace(/[^0-9]/g, '');
        $('#simprovTree').animate({scrollLeft: nodePositionLeft - 20, scrollTop: nodePositionTop - 20}, 1000);
        $('#simprovTree').perfectScrollbar('update');
    }

    async showAnnotationPanel() {
        let tempArray = await this.fetchAll();
        let allAnnotations = [];
        for (let tempObject of tempArray) {
            if (tempObject.annotation.length) {
                let annotationObject = {};
                annotationObject.annotation = tempObject.annotation;
                annotationObject.actionCUID = tempObject.actionCUID;
                allAnnotations.push(annotationObject);
            }
        }
        $('#simprovAnnotationTableContent').empty();
        if (allAnnotations.length) {
            for (let tempObject of allAnnotations) {
                let tableTRID = `${tempObject.actionCUID}-aTableTR`;
                let tableLinkID = `${tempObject.actionCUID}-aTableLink`;
                let tableAnnotateID = `${tempObject.actionCUID}-aTableAnnotate`;
                let tableTRContent = `<tr id="${tableTRID}"><td><a id="${tableLinkID}" class="simprov-annotation-captured-span" href="#" title="${tempObject.annotation}">${tempObject.actionCUID.substr(tempObject.actionCUID.length - 8, 8)}</a></td>
                    <td><a id="${tableAnnotateID}" class="simprov-annotation-table-icons" href="#" title="Annotate"><i class="fa fa-commenting"></i></a></td></tr>`;
                $('#simprovAnnotationTableContent').append(tableTRContent);
                $(`#${tableLinkID}`).click(async (event) => {
                    event.preventDefault();
                    let requiredID = (event.currentTarget.id).split('-')[0];
                    await this.actionReplay(requiredID, false);
                    if (this.shouldAPanelUpdate) {
                        await this.showAnnotationPanel();
                    }
                });
                $(`#${tableAnnotateID}`).click(async (event) => {
                    event.preventDefault();
                    let requiredID = (event.currentTarget.id).split('-')[0];
                    await this.addAnnotation(requiredID);
                    if (this.shouldAPanelUpdate) {
                        await this.showAnnotationPanel();
                    }
                });
            }
            let containsCheck = allAnnotations.find((item) => item.actionCUID === this.selectedUIElementID);
            if (containsCheck) {
                $(`#${this.selectedUIElementID}-aTableLink`).css({
                    'color': 'rgb(255, 153, 102)',
                    'text-shadow': '0 0 1px 0 rgba(255, 153, 102, 0.20)'
                });
                $(`#${this.selectedUIElementID}-aTableTR`).css('background-color', 'rgba(255, 153, 102, 0.1)');
                let rowPosition = $(`#${this.selectedUIElementID}-aTableTR`).position();
                $('#simprovAnnotationTable').animate({scrollTop: rowPosition.top}, 1000);
                $('#simprovAnnotationTable').perfectScrollbar('update');
            }
            this.shouldAPanelUpdate = false;
        }
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