import Database from "./database";
import VendorHooks from "./vendorhooks";
import Backup from "./backup";
import {mixin} from "es6-mixin";
import cuid from "cuid";


export default class SimprovCore {
    constructor(configuration) {
        this.userName = configuration.username || 'SIMProvUser';
        this.onReload = configuration.onReload || false;
        this.userCUID = cuid();
        this.dbToggle = false;
        this.dbExists = false;
        this.simprovStates = [];
        this.undoCUID = '';
        this.redoCUID = '';
        this.undoTriggered = false;
        this.uploadedJsonData = [];
        this.replayTrigger = false;
        this.replayTriggerDelay = 0;
        mixin(this, Database);
        mixin(this, VendorHooks);
        mixin(this, Backup);
    }

    actionReplay(stateCUID) {
        return this.getObject(stateCUID).then(receivedData => {
            this.replayTrigger = true;
            setTimeout(() => {
                this.replayTrigger = false;
            }, this.replayTriggerDelay);
            return this.createCustomEvent(receivedData, 'simprovReplay');
        }).then(() => {
            console.log('Simprov:> Action Replay Completed');
            return Promise.resolve();
        });
    }

    acquire(chartFilters, userAction) {
        if (!this.replayTrigger) {
            if (!this.dbToggle) {
                let provenanceData = {};
                provenanceData.stateData = chartFilters;
                provenanceData.stateInfo = userAction;
                return this.objectWrapper(provenanceData).then((addData) => {
                    return this.addData(addData);
                }).then(dbCUID => {
                    this.simprovStates.push(dbCUID);
                    if (this.simprovStates.length > 1) {
                        this.undoCUID = this.simprovStates[this.simprovStates.length - 2];
                        this.redoCUID = this.simprovStates[this.simprovStates.length - 1];
                    }
                    return Promise.resolve(dbCUID);
                }).then((dbCUID) => {
                    return this.getObject(dbCUID);
                }).then((addedObject) => {
                    return this.createCustomEvent(addedObject);
                }).then(() => {
                    return this.localStorageSet(this.simprovStates)
                }).then(() => {
                    console.log('Simprov:> Add Operation Completed');
                    return Promise.resolve();
                }); //Todo Handle DB error
            }
            else {
                this.dbToggle = false;
                return Promise.resolve();
            }
        }
        else {
            return Promise.resolve();
        }
    }

    createCustomEvent(eventData, eventType = 'simprovAdded') {
        let customEvent = new CustomEvent(eventType, {detail: eventData});
        window.dispatchEvent(customEvent);
        return Promise.resolve();
    }

    exportProvenance(exportType = 'json') {
        return this.fetchAll().then((receivedData) => {
            let tempObject = {
                simprovStates: this.simprovStates, simprovUser: {
                    username: this.userName,
                    userCUID: this.userCUID
                }
            };
            receivedData.unshift(tempObject);
            if (exportType === 'json') {
                this.downloadJson(receivedData).then(() => {
                    console.log('Simprov:> Download Json Completed');
                    return Promise.resolve();
                });
            }
            else {
                this.publishGist(receivedData).then((receivedData) => {
                    console.log(`Simprov:> Github URL: ${receivedData[0]}\nSimprov:> Gist ID: ${receivedData[1]}`);
                    console.log('Simprov:> Gist Publish Completed');
                    return Promise.resolve(receivedData);
                }); //Todo Handle gist error
            }
        });
    }

    importProvenance(importType = 'json', gistID) {
        return this.clearTable().then(() => {
            if (importType === 'json') {
                return Promise.resolve(this.uploadedJsonData);
            }
            else {
                return this.retriveGist(gistID);
            }
        }).then(receivedData => {
            let tempObject = receivedData.shift(); //Todo Extract Thumbnails data
            this.simprovStates = tempObject.simprovStates;
            if (this.simprovStates.length > 1) {
                this.undoCUID = this.simprovStates[this.simprovStates.length - 2];
                this.redoCUID = this.simprovStates[this.simprovStates.length - 1];
            }
            let userDecision = confirm('Do you want to use the username and CUID from the uploaded file?');
            if (userDecision) {
                this.userName = tempObject.simprovUser.username;
                this.userCUID = tempObject.simprovUser.userCUID;
            }
            return this.bulkAddData(receivedData);
        }).then((lastCUID) => {
            return this.localStorageSet(this.simprovStates);
        }).then(() => {
            return this.localStorageSet({
                username: this.userName,
                userCUID: this.userCUID
            }, 'simprovUser');
        }).then(() => {
            return this.tableCount();
        }).then((itemCount) => {
            console.log(`Simprov:> ${itemCount} Items Added`);
            return Promise.resolve();
        }).then(() => {
            return this.createCustomEvent(this.simprovStates, 'simprovReloaded'); //Todo Send Thumbnails data also
        }).then(() => {
            console.log('Simprov:> Import Operation Completed');
            this.uploadedJsonData = [];
            return Promise.resolve();
        }); //Todo Handle DB error
    }

    initialize() {
        return this.existsDB().then(value => {
            this.dbExists = value;
            if (this.dbExists) {
                Promise.all([this.localStorageGet(), this.localStorageGet('simprovUser')]).then(values => {
                    this.simprovStates = values[0];
                    if (this.simprovStates.length > 1) {
                        this.undoCUID = this.simprovStates[this.simprovStates.length - 2];
                        this.redoCUID = this.simprovStates[this.simprovStates.length - 1];
                    }
                    this.userName = values[1].username;
                    this.userCUID = values[1].userCUID;
                    return Promise.resolve();
                });
            }
            else {
                Promise.all([this.localStorageSet(this.simprovStates), this.localStorageSet({
                    username: this.userName,
                    userCUID: this.userCUID
                }, 'simprovUser')]).then(values => {
                    return Promise.resolve();
                });
            }
        }).then(() => {
            if (!this.onReload) {
                this.dbToggle = this.dbExists;
                this.initializeDB();
                return Promise.resolve();
            }
            else {
                this.initializeDB();
                return Promise.resolve();
            }
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

    localStorageSet(storageData, toWhere = 'simprovStates') {
        if (toWhere === 'simprovStates') {
            localStorage.setItem(toWhere, JSON.stringify(storageData));
            return Promise.resolve();
        }
        else {
            localStorage.setItem(toWhere, JSON.stringify(storageData));
            return Promise.resolve();
        }
    }

    localStorageGet(fromWhere = 'simprovStates') {
        if (fromWhere === 'simprovStates') {
            return Promise.resolve(JSON.parse(localStorage.getItem(fromWhere)));
        } else {
            return Promise.resolve(JSON.parse(localStorage.getItem(fromWhere)));
        }
    }

    objectWrapper(provenanceData) {
        let wrappedObject = {};
        wrappedObject.stateCUID = cuid();
        wrappedObject.provenanceData = provenanceData.stateData;
        wrappedObject.timeStamp = Date.now();
        wrappedObject.username = this.userName;
        wrappedObject.userCUID = this.userCUID;
        wrappedObject.thumbnail = '';
        wrappedObject.stateInfo = provenanceData.stateInfo;
        wrappedObject.annotation = '';
        return Promise.resolve(wrappedObject);
    }

    undoAction() {
        if (this.undoCUID !== '') {
            this.undoTriggered = true;
            this.getObject(this.undoCUID).then(receivedObject => {
                this.replayTrigger = true;
                setTimeout(() => {
                    this.replayTrigger = false;
                }, this.replayTriggerDelay);
                return this.createCustomEvent(receivedObject, 'simprovReplay');
            }).then(() => {
                if (this.simprovStates.indexOf(this.undoCUID) > 0) {
                    this.redoCUID = this.undoCUID;
                    this.undoCUID = this.simprovStates[this.simprovStates.indexOf(this.undoCUID) - 1];
                }
                else {
                    this.undoCUID = '';
                    this.redoCUID = this.simprovStates[1];
                }
                console.log('Simprov:> Undo Operation Completed');
                return Promise.resolve();
            }); //Todo Handle DB error
        }
        else {
            console.log('Simprov:> Nothing to Undo');
            return Promise.resolve();
        }
    }

    redoAction() {
        if (this.redoCUID !== '') {
            if (this.redoCUID === this.simprovStates[this.simprovStates.length - 1]) {
                if (this.undoTriggered) {
                    this.redoActionHelper().then(() => {
                        this.undoTriggered = false;
                        return Promise.resolve();
                    });
                } else {
                    console.log('Simprov:> Nothing to Redo');
                    return Promise.resolve();
                }
            } else {
                return this.redoActionHelper();
            }
        }
        else {
            console.log('Simprov:> Nothing to Redo');
            return Promise.resolve();
        }
    }

    redoActionHelper() {
        return this.getObject(this.redoCUID).then(receivedObject => {
            this.replayTrigger = true;
            setTimeout(() => {
                this.replayTrigger = false;
            }, this.replayTriggerDelay);
            return this.createCustomEvent(receivedObject, 'simprovReplay');
        }).then(() => {
            if (this.simprovStates.indexOf(this.redoCUID) < this.simprovStates.length - 1) {
                this.undoCUID = this.redoCUID;
                this.redoCUID = this.simprovStates[this.simprovStates.indexOf(this.redoCUID) + 1];
            }
            else {
                this.redoCUID = '';
            }
            console.log('Simprov:> Redo Operation Completed');
            return Promise.resolve();
        }); //Todo Handle DB error
    }

    classSimprovCoreInformation() {
        console.log('Simprov:> This is Class SimprovCore');
    }

}