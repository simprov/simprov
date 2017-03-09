/*! SIMProv v0.0.1 Development Build */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Simprov"] = factory();
	else
		root["Simprov"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/* unknown exports provided */
/* all exports used */
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 1 */
/* unknown exports provided */
/* all exports used */
/*!**************************************!*\
  !*** ./sourceScripts/simprovcore.js ***!
  \**************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _database = __webpack_require__(/*! ./database */ 3);

var _database2 = _interopRequireDefault(_database);

var _vendorhooks = __webpack_require__(/*! ./vendorhooks */ 4);

var _vendorhooks2 = _interopRequireDefault(_vendorhooks);

var _backup = __webpack_require__(/*! ./backup */ 2);

var _backup2 = _interopRequireDefault(_backup);

var _es6Mixin = __webpack_require__(/*! es6-mixin */ 7);

var _cuid = __webpack_require__(/*! cuid */ 5);

var _cuid2 = _interopRequireDefault(_cuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SimprovCore {
    constructor(configuration) {
        this.userName = configuration.username || 'SIMProvUser';
        this.onReload = configuration.onReload || false;
        this.userCUID = (0, _cuid2.default)();
        this.dbToggle = false;
        this.dbExists = false;
        this.simprovStates = [];
        this.undoCUID = '';
        this.redoCUID = '';
        this.undoTriggered = false;
        this.uploadedJsonData = [];
        this.replayTrigger = false;
        this.replayTriggerDelay = 0;
        (0, _es6Mixin.mixin)(this, _database2.default);
        (0, _es6Mixin.mixin)(this, _vendorhooks2.default);
        (0, _es6Mixin.mixin)(this, _backup2.default);
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
                return this.objectWrapper(provenanceData).then(addData => {
                    return this.addData(addData);
                }).then(dbCUID => {
                    this.simprovStates.push(dbCUID);
                    if (this.simprovStates.length > 1) {
                        this.undoCUID = this.simprovStates[this.simprovStates.length - 2];
                        this.redoCUID = this.simprovStates[this.simprovStates.length - 1];
                    }
                    return Promise.resolve(dbCUID);
                }).then(dbCUID => {
                    return this.getObject(dbCUID);
                }).then(addedObject => {
                    return this.createCustomEvent(addedObject);
                }).then(() => {
                    return this.localStorageSet(this.simprovStates);
                }).then(() => {
                    console.log('Simprov:> Add Operation Completed');
                    return Promise.resolve();
                }); //Todo Handle DB error
            } else {
                this.dbToggle = false;
                return Promise.resolve();
            }
        } else {
            return Promise.resolve();
        }
    }

    createCustomEvent(eventData, eventType = 'simprovAdded') {
        let customEvent = new CustomEvent(eventType, { detail: eventData });
        window.dispatchEvent(customEvent);
        return Promise.resolve();
    }

    exportProvenance(exportType = 'json') {
        return this.fetchAll().then(receivedData => {
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
            } else {
                this.publishGist(receivedData).then(receivedData => {
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
            } else {
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
        }).then(lastCUID => {
            return this.localStorageSet(this.simprovStates);
        }).then(() => {
            return this.localStorageSet({
                username: this.userName,
                userCUID: this.userCUID
            }, 'simprovUser');
        }).then(() => {
            return this.tableCount();
        }).then(itemCount => {
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
            } else {
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
            } else {
                this.initializeDB();
                return Promise.resolve();
            }
        });
    }

    loadJson() {
        //Todo json validation
        let documentBody = document.body;
        let input = document.createElement("input");
        input.type = "file";
        input.style.display = 'none';
        let receivedText = event => {
            this.uploadedJsonData = JSON.parse(event.target.result);
            documentBody.removeChild(input);
            this.importProvenance();
        };
        let handleFileSelect = event => {
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
        } else {
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
        wrappedObject.stateCUID = (0, _cuid2.default)();
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
                } else {
                    this.undoCUID = '';
                    this.redoCUID = this.simprovStates[1];
                }
                console.log('Simprov:> Undo Operation Completed');
                return Promise.resolve();
            }); //Todo Handle DB error
        } else {
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
        } else {
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
            } else {
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
exports.default = SimprovCore;

/***/ }),
/* 2 */
/* unknown exports provided */
/* all exports used */
/*!*********************************!*\
  !*** ./sourceScripts/backup.js ***!
  \*********************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
class Backup {
    constructor() {}

    publishGist(gistData) {
        let postContent = {
            description: 'Simprov Provenance Data',
            public: true,
            files: {
                'simprov.json': {
                    content: JSON.stringify(gistData)
                }
            }
        };
        return fetch('https://api.github.com/gists', {
            method: 'post',
            body: JSON.stringify(postContent)
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            return Promise.resolve([data.html_url, data.id]);
        });
    }

    retriveGist(gistID) {
        //Todo handle invalid ID
        let fetchFrom = `https://api.github.com/gists/${gistID}`;
        return fetch(fetchFrom, {
            method: 'get'
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            return Promise.resolve(JSON.parse(data.files['simprov.json'].content));
        });
    }

    downloadJson(jsonData) {
        let data = `text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonData))}`;
        let link = document.createElement('a');
        link.href = `data:${data}`;
        link.download = 'simprov.json';
        let documentBody = document.body;
        documentBody.appendChild(link);
        link.click();
        documentBody.removeChild(link);
        return Promise.resolve();
    }

    classBackupInformation() {
        console.log('Simprov:> This is Class Backup');
    }

}
exports.default = Backup;

/***/ }),
/* 3 */
/* unknown exports provided */
/* all exports used */
/*!***********************************!*\
  !*** ./sourceScripts/database.js ***!
  \***********************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _dexie = __webpack_require__(/*! dexie */ 6);

var _dexie2 = _interopRequireDefault(_dexie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Database {
    constructor() {
        this.db = new _dexie2.default("simprov");
    }

    addData(data, storeName = 'provenance') {
        return this.db[storeName].add(data);
    }

    bulkAddData(bulkData, storeName = 'provenance') {
        return this.db[storeName].bulkAdd(bulkData);
    }

    clearTable(storeName = 'provenance') {
        //Todo check table exists
        return this.db[storeName].clear();
    }

    // deleteTableContentByPrimaryKey
    deleteObject(primaryKey, storeName = 'provenance') {
        return this.db[storeName].delete(primaryKey); //Todo check table exists
    }

    deleteDB(dbName) {
        //Todo check DB exists
        this.db.close();
        return _dexie2.default.delete(dbName);
    }

    existsDB(dbName = 'simprov') {
        return _dexie2.default.exists(dbName);
    }

    fetchAll(storeName = 'provenance') {
        return this.db[storeName].toArray();
    }

    getObject(primaryKey, storeName = 'provenance') {
        //Todo check table exists
        return this.db[storeName].get(primaryKey);
    }

    initializeDB() {
        this.db.version(1).stores({
            provenance: "stateCUID"
        });
    }

    listAllDB() {
        return _dexie2.default.getDatabaseNames();
    }

    tableCount(storeName = 'provenance') {
        return this.db[storeName].count();
    }

    updateObject(primaryKey, update, storeName = 'provenance') {
        return this.db[storeName].update(primaryKey, update);
    }

    classDatabaseInformation() {
        console.log('Simprov:> This is Class Database');
    }
}
exports.default = Database;

/***/ }),
/* 4 */
/* unknown exports provided */
/* all exports used */
/*!**************************************!*\
  !*** ./sourceScripts/vendorhooks.js ***!
  \**************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
class VendorHooks {
    constructor() {}

    isDCInitialized() {
        if (typeof window.dc === 'undefined') {
            throw '> dc.js is not initialized';
        } else console.log('Simprov:> dc.js is initialized');
        return true;
    }

    dcRegistry(...exclude) {
        this.isDCInitialized();
        let tempChartRegistry = [...dc.chartRegistry.list()];
        if (exclude !== undefined) {
            exclude.sort((a, b) => {
                return a - b;
            });
            exclude.forEach((item, index, array) => {
                array[index] = item - 1;
            });
            while (exclude.length) {
                tempChartRegistry.splice(exclude.pop(), 1);
            }
            return tempChartRegistry;
        } else {
            return tempChartRegistry;
        }
    }

    classVendorHookseInformation() {
        console.log('Simprov:> This is Class VendorHooks');
    }
}
exports.default = VendorHooks;

/***/ }),
/* 5 */
/* unknown exports provided */
/* all exports used */
/*!*************************************!*\
  !*** ./~/cuid/dist/browser-cuid.js ***!
  \*************************************/
/***/ (function(module, exports, __webpack_require__) {

/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

/*global window, navigator, document, require, process, module */
(function (app) {
  'use strict';
  var namespace = 'cuid',
    c = 0,
    blockSize = 4,
    base = 36,
    discreteValues = Math.pow(base, blockSize),

    pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    },

    randomBlock = function randomBlock() {
      return pad((Math.random() *
            discreteValues << 0)
            .toString(base), blockSize);
    },

    safeCounter = function () {
      c = (c < discreteValues) ? c : 0;
      c++; // this is not subliminal
      return c - 1;
    },

    api = function cuid() {
      // Starting with a lowercase letter makes
      // it HTML element ID friendly.
      var letter = 'c', // hard-coded allows for sequential access

        // timestamp
        // warning: this exposes the exact date and time
        // that the uid was created.
        timestamp = (new Date().getTime()).toString(base),

        // Prevent same-machine collisions.
        counter,

        // A few chars to generate distinct ids for different
        // clients (so different computers are far less
        // likely to generate the same id)
        fingerprint = api.fingerprint(),

        // Grab some more chars from Math.random()
        random = randomBlock() + randomBlock();

        counter = pad(safeCounter().toString(base), blockSize);

      return  (letter + timestamp + counter + fingerprint + random);
    };

  api.slug = function slug() {
    var date = new Date().getTime().toString(36),
      counter,
      print = api.fingerprint().slice(0,1) +
        api.fingerprint().slice(-1),
      random = randomBlock().slice(-2);

      counter = safeCounter().toString(36).slice(-4);

    return date.slice(-2) +
      counter + print + random;
  };

  api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
        var i,
          count = 0;

        for (i in window) {
          count++;
        }

        return count;
      }());

    api.globalCount = function () { return cache; };
    return cache;
  };

  api.fingerprint = function browserPrint() {
    return pad((navigator.mimeTypes.length +
      navigator.userAgent.length).toString(36) +
      api.globalCount().toString(36), 4);
  };

  // don't change anything from here down.
  if (app.register) {
    app.register(namespace, api);
  } else if (true) {
    module.exports = api;
  } else {
    app[namespace] = api;
  }

}(this.applitude || this));


/***/ }),
/* 6 */
/* unknown exports provided */
/* all exports used */
/*!*******************************!*\
  !*** ./~/dexie/dist/dexie.js ***!
  \*******************************/
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, setImmediate) {(function (global, factory) {
    true ? module.exports = factory() :
   typeof define === 'function' && define.amd ? define(factory) :
   (global.Dexie = factory());
}(this, (function () { 'use strict';

/*
* Dexie.js - a minimalistic wrapper for IndexedDB
* ===============================================
*
* By David Fahlander, david.fahlander@gmail.com
*
* Version 1.5.1, Tue Nov 01 2016
* www.dexie.com
* Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
*/
var keys = Object.keys;
var isArray = Array.isArray;
var _global = typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : global;

function extend(obj, extension) {
    if (typeof extension !== 'object') return obj;
    keys(extension).forEach(function (key) {
        obj[key] = extension[key];
    });
    return obj;
}

var getProto = Object.getPrototypeOf;
var _hasOwn = {}.hasOwnProperty;
function hasOwn(obj, prop) {
    return _hasOwn.call(obj, prop);
}

function props(proto, extension) {
    if (typeof extension === 'function') extension = extension(getProto(proto));
    keys(extension).forEach(function (key) {
        setProp(proto, key, extension[key]);
    });
}

function setProp(obj, prop, functionOrGetSet, options) {
    Object.defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ? { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } : { value: functionOrGetSet, configurable: true, writable: true }, options));
}

function derive(Child) {
    return {
        from: function (Parent) {
            Child.prototype = Object.create(Parent.prototype);
            setProp(Child.prototype, "constructor", Child);
            return {
                extend: props.bind(null, Child.prototype)
            };
        }
    };
}

var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

function getPropertyDescriptor(obj, prop) {
    var pd = getOwnPropertyDescriptor(obj, prop),
        proto;
    return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
}

var _slice = [].slice;
function slice(args, start, end) {
    return _slice.call(args, start, end);
}

function override(origFunc, overridedFactory) {
    return overridedFactory(origFunc);
}

function doFakeAutoComplete(fn) {
    var to = setTimeout(fn, 1000);
    clearTimeout(to);
}

function assert(b) {
    if (!b) throw new Error("Assertion Failed");
}

function asap(fn) {
    if (_global.setImmediate) setImmediate(fn);else setTimeout(fn, 0);
}



/** Generate an object (hash map) based on given array.
 * @param extractor Function taking an array item and its index and returning an array of 2 items ([key, value]) to
 *        instert on the resulting object for each item in the array. If this function returns a falsy value, the
 *        current item wont affect the resulting object.
 */
function arrayToObject(array, extractor) {
    return array.reduce(function (result, item, i) {
        var nameAndValue = extractor(item, i);
        if (nameAndValue) result[nameAndValue[0]] = nameAndValue[1];
        return result;
    }, {});
}

function trycatcher(fn, reject) {
    return function () {
        try {
            fn.apply(this, arguments);
        } catch (e) {
            reject(e);
        }
    };
}

function tryCatch(fn, onerror, args) {
    try {
        fn.apply(null, args);
    } catch (ex) {
        onerror && onerror(ex);
    }
}

function getByKeyPath(obj, keyPath) {
    // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
    if (hasOwn(obj, keyPath)) return obj[keyPath]; // This line is moved from last to first for optimization purpose.
    if (!keyPath) return obj;
    if (typeof keyPath !== 'string') {
        var rv = [];
        for (var i = 0, l = keyPath.length; i < l; ++i) {
            var val = getByKeyPath(obj, keyPath[i]);
            rv.push(val);
        }
        return rv;
    }
    var period = keyPath.indexOf('.');
    if (period !== -1) {
        var innerObj = obj[keyPath.substr(0, period)];
        return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
    }
    return undefined;
}

function setByKeyPath(obj, keyPath, value) {
    if (!obj || keyPath === undefined) return;
    if ('isFrozen' in Object && Object.isFrozen(obj)) return;
    if (typeof keyPath !== 'string' && 'length' in keyPath) {
        assert(typeof value !== 'string' && 'length' in value);
        for (var i = 0, l = keyPath.length; i < l; ++i) {
            setByKeyPath(obj, keyPath[i], value[i]);
        }
    } else {
        var period = keyPath.indexOf('.');
        if (period !== -1) {
            var currentKeyPath = keyPath.substr(0, period);
            var remainingKeyPath = keyPath.substr(period + 1);
            if (remainingKeyPath === "") {
                if (value === undefined) delete obj[currentKeyPath];else obj[currentKeyPath] = value;
            } else {
                var innerObj = obj[currentKeyPath];
                if (!innerObj) innerObj = obj[currentKeyPath] = {};
                setByKeyPath(innerObj, remainingKeyPath, value);
            }
        } else {
            if (value === undefined) delete obj[keyPath];else obj[keyPath] = value;
        }
    }
}

function delByKeyPath(obj, keyPath) {
    if (typeof keyPath === 'string') setByKeyPath(obj, keyPath, undefined);else if ('length' in keyPath) [].map.call(keyPath, function (kp) {
        setByKeyPath(obj, kp, undefined);
    });
}

function shallowClone(obj) {
    var rv = {};
    for (var m in obj) {
        if (hasOwn(obj, m)) rv[m] = obj[m];
    }
    return rv;
}

function deepClone(any) {
    if (!any || typeof any !== 'object') return any;
    var rv;
    if (isArray(any)) {
        rv = [];
        for (var i = 0, l = any.length; i < l; ++i) {
            rv.push(deepClone(any[i]));
        }
    } else if (any instanceof Date) {
        rv = new Date();
        rv.setTime(any.getTime());
    } else {
        rv = any.constructor ? Object.create(any.constructor.prototype) : {};
        for (var prop in any) {
            if (hasOwn(any, prop)) {
                rv[prop] = deepClone(any[prop]);
            }
        }
    }
    return rv;
}

function getObjectDiff(a, b, rv, prfx) {
    // Compares objects a and b and produces a diff object.
    rv = rv || {};
    prfx = prfx || '';
    keys(a).forEach(function (prop) {
        if (!hasOwn(b, prop)) rv[prfx + prop] = undefined; // Property removed
        else {
                var ap = a[prop],
                    bp = b[prop];
                if (typeof ap === 'object' && typeof bp === 'object' && ap && bp && ap.constructor === bp.constructor)
                    // Same type of object but its properties may have changed
                    getObjectDiff(ap, bp, rv, prfx + prop + ".");else if (ap !== bp) rv[prfx + prop] = b[prop]; // Primitive value changed
            }
    });
    keys(b).forEach(function (prop) {
        if (!hasOwn(a, prop)) {
            rv[prfx + prop] = b[prop]; // Property added
        }
    });
    return rv;
}

// If first argument is iterable or array-like, return it as an array
var iteratorSymbol = typeof Symbol !== 'undefined' && Symbol.iterator;
var getIteratorOf = iteratorSymbol ? function (x) {
    var i;
    return x != null && (i = x[iteratorSymbol]) && i.apply(x);
} : function () {
    return null;
};

var NO_CHAR_ARRAY = {};
// Takes one or several arguments and returns an array based on the following criteras:
// * If several arguments provided, return arguments converted to an array in a way that
//   still allows javascript engine to optimize the code.
// * If single argument is an array, return a clone of it.
// * If this-pointer equals NO_CHAR_ARRAY, don't accept strings as valid iterables as a special
//   case to the two bullets below.
// * If single argument is an iterable, convert it to an array and return the resulting array.
// * If single argument is array-like (has length of type number), convert it to an array.
function getArrayOf(arrayLike) {
    var i, a, x, it;
    if (arguments.length === 1) {
        if (isArray(arrayLike)) return arrayLike.slice();
        if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string') return [arrayLike];
        if (it = getIteratorOf(arrayLike)) {
            a = [];
            while (x = it.next(), !x.done) {
                a.push(x.value);
            }return a;
        }
        if (arrayLike == null) return [arrayLike];
        i = arrayLike.length;
        if (typeof i === 'number') {
            a = new Array(i);
            while (i--) {
                a[i] = arrayLike[i];
            }return a;
        }
        return [arrayLike];
    }
    i = arguments.length;
    a = new Array(i);
    while (i--) {
        a[i] = arguments[i];
    }return a;
}

var concat = [].concat;
function flatten(a) {
    return concat.apply([], a);
}

function nop() {}
function mirror(val) {
    return val;
}
function pureFunctionChain(f1, f2) {
    // Enables chained events that takes ONE argument and returns it to the next function in chain.
    // This pattern is used in the hook("reading") event.
    if (f1 == null || f1 === mirror) return f2;
    return function (val) {
        return f2(f1(val));
    };
}

function callBoth(on1, on2) {
    return function () {
        on1.apply(this, arguments);
        on2.apply(this, arguments);
    };
}

function hookCreatingChain(f1, f2) {
    // Enables chained events that takes several arguments and may modify first argument by making a modification and then returning the same instance.
    // This pattern is used in the hook("creating") event.
    if (f1 === nop) return f2;
    return function () {
        var res = f1.apply(this, arguments);
        if (res !== undefined) arguments[0] = res;
        var onsuccess = this.onsuccess,
            // In case event listener has set this.onsuccess
        onerror = this.onerror; // In case event listener has set this.onerror
        this.onsuccess = null;
        this.onerror = null;
        var res2 = f2.apply(this, arguments);
        if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        return res2 !== undefined ? res2 : res;
    };
}

function hookDeletingChain(f1, f2) {
    if (f1 === nop) return f2;
    return function () {
        f1.apply(this, arguments);
        var onsuccess = this.onsuccess,
            // In case event listener has set this.onsuccess
        onerror = this.onerror; // In case event listener has set this.onerror
        this.onsuccess = this.onerror = null;
        f2.apply(this, arguments);
        if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
    };
}

function hookUpdatingChain(f1, f2) {
    if (f1 === nop) return f2;
    return function (modifications) {
        var res = f1.apply(this, arguments);
        extend(modifications, res); // If f1 returns new modifications, extend caller's modifications with the result before calling next in chain.
        var onsuccess = this.onsuccess,
            // In case event listener has set this.onsuccess
        onerror = this.onerror; // In case event listener has set this.onerror
        this.onsuccess = null;
        this.onerror = null;
        var res2 = f2.apply(this, arguments);
        if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        return res === undefined ? res2 === undefined ? undefined : res2 : extend(res, res2);
    };
}

function reverseStoppableEventChain(f1, f2) {
    if (f1 === nop) return f2;
    return function () {
        if (f2.apply(this, arguments) === false) return false;
        return f1.apply(this, arguments);
    };
}



function promisableChain(f1, f2) {
    if (f1 === nop) return f2;
    return function () {
        var res = f1.apply(this, arguments);
        if (res && typeof res.then === 'function') {
            var thiz = this,
                i = arguments.length,
                args = new Array(i);
            while (i--) {
                args[i] = arguments[i];
            }return res.then(function () {
                return f2.apply(thiz, args);
            });
        }
        return f2.apply(this, arguments);
    };
}

// By default, debug will be true only if platform is a web platform and its page is served from localhost.
// When debug = true, error's stacks will contain asyncronic long stacks.
var debug = typeof location !== 'undefined' &&
// By default, use debug mode if served from localhost.
/^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);

function setDebug(value, filter) {
    debug = value;
    libraryFilter = filter;
}

var libraryFilter = function () {
    return true;
};

var NEEDS_THROW_FOR_STACK = !new Error("").stack;

function getErrorWithStack() {
    "use strict";

    if (NEEDS_THROW_FOR_STACK) try {
        // Doing something naughty in strict mode here to trigger a specific error
        // that can be explicitely ignored in debugger's exception settings.
        // If we'd just throw new Error() here, IE's debugger's exception settings
        // will just consider it as "exception thrown by javascript code" which is
        // something you wouldn't want it to ignore.
        getErrorWithStack.arguments;
        throw new Error(); // Fallback if above line don't throw.
    } catch (e) {
        return e;
    }
    return new Error();
}

function prettyStack(exception, numIgnoredFrames) {
    var stack = exception.stack;
    if (!stack) return "";
    numIgnoredFrames = numIgnoredFrames || 0;
    if (stack.indexOf(exception.name) === 0) numIgnoredFrames += (exception.name + exception.message).split('\n').length;
    return stack.split('\n').slice(numIgnoredFrames).filter(libraryFilter).map(function (frame) {
        return "\n" + frame;
    }).join('');
}

function deprecated(what, fn) {
    return function () {
        console.warn(what + " is deprecated. See https://github.com/dfahlander/Dexie.js/wiki/Deprecations. " + prettyStack(getErrorWithStack(), 1));
        return fn.apply(this, arguments);
    };
}

var dexieErrorNames = ['Modify', 'Bulk', 'OpenFailed', 'VersionChange', 'Schema', 'Upgrade', 'InvalidTable', 'MissingAPI', 'NoSuchDatabase', 'InvalidArgument', 'SubTransaction', 'Unsupported', 'Internal', 'DatabaseClosed', 'IncompatiblePromise'];

var idbDomErrorNames = ['Unknown', 'Constraint', 'Data', 'TransactionInactive', 'ReadOnly', 'Version', 'NotFound', 'InvalidState', 'InvalidAccess', 'Abort', 'Timeout', 'QuotaExceeded', 'Syntax', 'DataClone'];

var errorList = dexieErrorNames.concat(idbDomErrorNames);

var defaultTexts = {
    VersionChanged: "Database version changed by other database connection",
    DatabaseClosed: "Database has been closed",
    Abort: "Transaction aborted",
    TransactionInactive: "Transaction has already completed or failed"
};

//
// DexieError - base class of all out exceptions.
//
function DexieError(name, msg) {
    // Reason we don't use ES6 classes is because:
    // 1. It bloats transpiled code and increases size of minified code.
    // 2. It doesn't give us much in this case.
    // 3. It would require sub classes to call super(), which
    //    is not needed when deriving from Error.
    this._e = getErrorWithStack();
    this.name = name;
    this.message = msg;
}

derive(DexieError).from(Error).extend({
    stack: {
        get: function () {
            return this._stack || (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
        }
    },
    toString: function () {
        return this.name + ": " + this.message;
    }
});

function getMultiErrorMessage(msg, failures) {
    return msg + ". Errors: " + failures.map(function (f) {
        return f.toString();
    }).filter(function (v, i, s) {
        return s.indexOf(v) === i;
    }) // Only unique error strings
    .join('\n');
}

//
// ModifyError - thrown in WriteableCollection.modify()
// Specific constructor because it contains members failures and failedKeys.
//
function ModifyError(msg, failures, successCount, failedKeys) {
    this._e = getErrorWithStack();
    this.failures = failures;
    this.failedKeys = failedKeys;
    this.successCount = successCount;
}
derive(ModifyError).from(DexieError);

function BulkError(msg, failures) {
    this._e = getErrorWithStack();
    this.name = "BulkError";
    this.failures = failures;
    this.message = getMultiErrorMessage(msg, failures);
}
derive(BulkError).from(DexieError);

//
//
// Dynamically generate error names and exception classes based
// on the names in errorList.
//
//

// Map of {ErrorName -> ErrorName + "Error"}
var errnames = errorList.reduce(function (obj, name) {
    return obj[name] = name + "Error", obj;
}, {});

// Need an alias for DexieError because we're gonna create subclasses with the same name.
var BaseException = DexieError;
// Map of {ErrorName -> exception constructor}
var exceptions = errorList.reduce(function (obj, name) {
    // Let the name be "DexieError" because this name may
    // be shown in call stack and when debugging. DexieError is
    // the most true name because it derives from DexieError,
    // and we cannot change Function.name programatically without
    // dynamically create a Function object, which would be considered
    // 'eval-evil'.
    var fullName = name + "Error";
    function DexieError(msgOrInner, inner) {
        this._e = getErrorWithStack();
        this.name = fullName;
        if (!msgOrInner) {
            this.message = defaultTexts[name] || fullName;
            this.inner = null;
        } else if (typeof msgOrInner === 'string') {
            this.message = msgOrInner;
            this.inner = inner || null;
        } else if (typeof msgOrInner === 'object') {
            this.message = msgOrInner.name + ' ' + msgOrInner.message;
            this.inner = msgOrInner;
        }
    }
    derive(DexieError).from(BaseException);
    obj[name] = DexieError;
    return obj;
}, {});

// Use ECMASCRIPT standard exceptions where applicable:
exceptions.Syntax = SyntaxError;
exceptions.Type = TypeError;
exceptions.Range = RangeError;

var exceptionMap = idbDomErrorNames.reduce(function (obj, name) {
    obj[name + "Error"] = exceptions[name];
    return obj;
}, {});

function mapError(domError, message) {
    if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name]) return domError;
    var rv = new exceptionMap[domError.name](message || domError.message, domError);
    if ("stack" in domError) {
        // Derive stack from inner exception if it has a stack
        setProp(rv, "stack", { get: function () {
                return this.inner.stack;
            } });
    }
    return rv;
}

var fullNameExceptions = errorList.reduce(function (obj, name) {
    if (["Syntax", "Type", "Range"].indexOf(name) === -1) obj[name + "Error"] = exceptions[name];
    return obj;
}, {});

fullNameExceptions.ModifyError = ModifyError;
fullNameExceptions.DexieError = DexieError;
fullNameExceptions.BulkError = BulkError;

function Events(ctx) {
    var evs = {};
    var rv = function (eventName, subscriber) {
        if (subscriber) {
            // Subscribe. If additional arguments than just the subscriber was provided, forward them as well.
            var i = arguments.length,
                args = new Array(i - 1);
            while (--i) {
                args[i - 1] = arguments[i];
            }evs[eventName].subscribe.apply(null, args);
            return ctx;
        } else if (typeof eventName === 'string') {
            // Return interface allowing to fire or unsubscribe from event
            return evs[eventName];
        }
    };
    rv.addEventType = add;

    for (var i = 1, l = arguments.length; i < l; ++i) {
        add(arguments[i]);
    }

    return rv;

    function add(eventName, chainFunction, defaultFunction) {
        if (typeof eventName === 'object') return addConfiguredEvents(eventName);
        if (!chainFunction) chainFunction = reverseStoppableEventChain;
        if (!defaultFunction) defaultFunction = nop;

        var context = {
            subscribers: [],
            fire: defaultFunction,
            subscribe: function (cb) {
                if (context.subscribers.indexOf(cb) === -1) {
                    context.subscribers.push(cb);
                    context.fire = chainFunction(context.fire, cb);
                }
            },
            unsubscribe: function (cb) {
                context.subscribers = context.subscribers.filter(function (fn) {
                    return fn !== cb;
                });
                context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
            }
        };
        evs[eventName] = rv[eventName] = context;
        return context;
    }

    function addConfiguredEvents(cfg) {
        // events(this, {reading: [functionChain, nop]});
        keys(cfg).forEach(function (eventName) {
            var args = cfg[eventName];
            if (isArray(args)) {
                add(eventName, cfg[eventName][0], cfg[eventName][1]);
            } else if (args === 'asap') {
                // Rather than approaching event subscription using a functional approach, we here do it in a for-loop where subscriber is executed in its own stack
                // enabling that any exception that occur wont disturb the initiator and also not nescessary be catched and forgotten.
                var context = add(eventName, mirror, function fire() {
                    // Optimazation-safe cloning of arguments into args.
                    var i = arguments.length,
                        args = new Array(i);
                    while (i--) {
                        args[i] = arguments[i];
                    } // All each subscriber:
                    context.subscribers.forEach(function (fn) {
                        asap(function fireEvent() {
                            fn.apply(null, args);
                        });
                    });
                });
            } else throw new exceptions.InvalidArgument("Invalid event config");
        });
    }
}

//
// Promise Class for Dexie library
//
// I started out writing this Promise class by copying promise-light (https://github.com/taylorhakes/promise-light) by
// https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
//
// Modifications needed to be done to support indexedDB because it wont accept setTimeout()
// (See discussion: https://github.com/promises-aplus/promises-spec/issues/45) .
// This topic was also discussed in the following thread: https://github.com/promises-aplus/promises-spec/issues/45
//
// This implementation will not use setTimeout or setImmediate when it's not needed. The behavior is 100% Promise/A+ compliant since
// the caller of new Promise() can be certain that the promise wont be triggered the lines after constructing the promise.
//
// In previous versions this was fixed by not calling setTimeout when knowing that the resolve() or reject() came from another
// tick. In Dexie v1.4.0, I've rewritten the Promise class entirely. Just some fragments of promise-light is left. I use
// another strategy now that simplifies everything a lot: to always execute callbacks in a new tick, but have an own microTick
// engine that is used instead of setImmediate() or setTimeout().
// Promise class has also been optimized a lot with inspiration from bluebird - to avoid closures as much as possible.
// Also with inspiration from bluebird, asyncronic stacks in debug mode.
//
// Specific non-standard features of this Promise class:
// * Async static context support (Promise.PSD)
// * Promise.follow() method built upon PSD, that allows user to track all promises created from current stack frame
//   and below + all promises that those promises creates or awaits.
// * Detect any unhandled promise in a PSD-scope (PSD.onunhandled). 
//
// David Fahlander, https://github.com/dfahlander
//

// Just a pointer that only this module knows about.
// Used in Promise constructor to emulate a private constructor.
var INTERNAL = {};

// Async stacks (long stacks) must not grow infinitely.
var LONG_STACKS_CLIP_LIMIT = 100;
var MAX_LONG_STACKS = 20;
var stack_being_generated = false;

/* The default "nextTick" function used only for the very first promise in a promise chain.
   As soon as then promise is resolved or rejected, all next tasks will be executed in micro ticks
   emulated in this module. For indexedDB compatibility, this means that every method needs to 
   execute at least one promise before doing an indexedDB operation. Dexie will always call 
   db.ready().then() for every operation to make sure the indexedDB event is started in an
   emulated micro tick.
*/
var schedulePhysicalTick = _global.setImmediate ?
// setImmediate supported. Those modern platforms also supports Function.bind().
setImmediate.bind(null, physicalTick) : _global.MutationObserver ?
// MutationObserver supported
function () {
    var hiddenDiv = document.createElement("div");
    new MutationObserver(function () {
        physicalTick();
        hiddenDiv = null;
    }).observe(hiddenDiv, { attributes: true });
    hiddenDiv.setAttribute('i', '1');
} :
// No support for setImmediate or MutationObserver. No worry, setTimeout is only called
// once time. Every tick that follows will be our emulated micro tick.
// Could have uses setTimeout.bind(null, 0, physicalTick) if it wasnt for that FF13 and below has a bug 
function () {
    setTimeout(physicalTick, 0);
};

// Confifurable through Promise.scheduler.
// Don't export because it would be unsafe to let unknown
// code call it unless they do try..catch within their callback.
// This function can be retrieved through getter of Promise.scheduler though,
// but users must not do Promise.scheduler (myFuncThatThrows exception)!
var asap$1 = function (callback, args) {
    microtickQueue.push([callback, args]);
    if (needsNewPhysicalTick) {
        schedulePhysicalTick();
        needsNewPhysicalTick = false;
    }
};

var isOutsideMicroTick = true;
var needsNewPhysicalTick = true;
var unhandledErrors = [];
var rejectingErrors = [];
var currentFulfiller = null;
var rejectionMapper = mirror; // Remove in next major when removing error mapping of DOMErrors and DOMExceptions

var globalPSD = {
    global: true,
    ref: 0,
    unhandleds: [],
    onunhandled: globalError,
    //env: null, // Will be set whenever leaving a scope using wrappers.snapshot()
    finalize: function () {
        this.unhandleds.forEach(function (uh) {
            try {
                globalError(uh[0], uh[1]);
            } catch (e) {}
        });
    }
};

var PSD = globalPSD;

var microtickQueue = []; // Callbacks to call in this or next physical tick.
var numScheduledCalls = 0; // Number of listener-calls left to do in this physical tick.
var tickFinalizers = []; // Finalizers to call when there are no more async calls scheduled within current physical tick.

// Wrappers are not being used yet. Their framework is functioning and can be used
// to replace environment during a PSD scope (a.k.a. 'zone').
/* **KEEP** export var wrappers = (() => {
    var wrappers = [];

    return {
        snapshot: () => {
            var i = wrappers.length,
                result = new Array(i);
            while (i--) result[i] = wrappers[i].snapshot();
            return result;
        },
        restore: values => {
            var i = wrappers.length;
            while (i--) wrappers[i].restore(values[i]);
        },
        wrap: () => wrappers.map(w => w.wrap()),
        add: wrapper => {
            wrappers.push(wrapper);
        }
    };
})();
*/

function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    this._listeners = [];
    this.onuncatched = nop; // Deprecate in next major. Not needed. Better to use global error handler.

    // A library may set `promise._lib = true;` after promise is created to make resolve() or reject()
    // execute the microtask engine implicitely within the call to resolve() or reject().
    // To remain A+ compliant, a library must only set `_lib=true` if it can guarantee that the stack
    // only contains library code when calling resolve() or reject().
    // RULE OF THUMB: ONLY set _lib = true for promises explicitely resolving/rejecting directly from
    // global scope (event handler, timer etc)!
    this._lib = false;
    // Current async scope
    var psd = this._PSD = PSD;

    if (debug) {
        this._stackHolder = getErrorWithStack();
        this._prev = null;
        this._numPrev = 0; // Number of previous promises (for long stacks)
        linkToPreviousPromise(this, currentFulfiller);
    }

    if (typeof fn !== 'function') {
        if (fn !== INTERNAL) throw new TypeError('Not a function');
        // Private constructor (INTERNAL, state, value).
        // Used internally by Promise.resolve() and Promise.reject().
        this._state = arguments[1];
        this._value = arguments[2];
        if (this._state === false) handleRejection(this, this._value); // Map error, set stack and addPossiblyUnhandledError().
        return;
    }

    this._state = null; // null (=pending), false (=rejected) or true (=resolved)
    this._value = null; // error or result
    ++psd.ref; // Refcounting current scope
    executePromiseTask(this, fn);
}

props(Promise.prototype, {

    then: function (onFulfilled, onRejected) {
        var _this = this;

        var rv = new Promise(function (resolve, reject) {
            propagateToListener(_this, new Listener(onFulfilled, onRejected, resolve, reject));
        });
        debug && (!this._prev || this._state === null) && linkToPreviousPromise(rv, this);
        return rv;
    },

    _then: function (onFulfilled, onRejected) {
        // A little tinier version of then() that don't have to create a resulting promise.
        propagateToListener(this, new Listener(null, null, onFulfilled, onRejected));
    },

    catch: function (onRejected) {
        if (arguments.length === 1) return this.then(null, onRejected);
        // First argument is the Error type to catch
        var type = arguments[0],
            handler = arguments[1];
        return typeof type === 'function' ? this.then(null, function (err) {
            return (
                // Catching errors by its constructor type (similar to java / c++ / c#)
                // Sample: promise.catch(TypeError, function (e) { ... });
                err instanceof type ? handler(err) : PromiseReject(err)
            );
        }) : this.then(null, function (err) {
            return (
                // Catching errors by the error.name property. Makes sense for indexedDB where error type
                // is always DOMError but where e.name tells the actual error type.
                // Sample: promise.catch('ConstraintError', function (e) { ... });
                err && err.name === type ? handler(err) : PromiseReject(err)
            );
        });
    },

    finally: function (onFinally) {
        return this.then(function (value) {
            onFinally();
            return value;
        }, function (err) {
            onFinally();
            return PromiseReject(err);
        });
    },

    // Deprecate in next major. Needed only for db.on.error.
    uncaught: function (uncaughtHandler) {
        var _this2 = this;

        // Be backward compatible and use "onuncatched" as the event name on this.
        // Handle multiple subscribers through reverseStoppableEventChain(). If a handler returns `false`, bubbling stops.
        this.onuncatched = reverseStoppableEventChain(this.onuncatched, uncaughtHandler);
        // In case caller does this on an already rejected promise, assume caller wants to point out the error to this promise and not
        // a previous promise. Reason: the prevous promise may lack onuncatched handler. 
        if (this._state === false && unhandledErrors.indexOf(this) === -1) {
            // Replace unhandled error's destinaion promise with this one!
            unhandledErrors.some(function (p, i, l) {
                return p._value === _this2._value && (l[i] = _this2);
            });
            // Actually we do this shit because we need to support db.on.error() correctly during db.open(). If we deprecate db.on.error, we could
            // take away this piece of code as well as the onuncatched and uncaught() method.
        }
        return this;
    },

    stack: {
        get: function () {
            if (this._stack) return this._stack;
            try {
                stack_being_generated = true;
                var stacks = getStack(this, [], MAX_LONG_STACKS);
                var stack = stacks.join("\nFrom previous: ");
                if (this._state !== null) this._stack = stack; // Stack may be updated on reject.
                return stack;
            } finally {
                stack_being_generated = false;
            }
        }
    }
});

function Listener(onFulfilled, onRejected, resolve, reject) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
    this.psd = PSD;
}

// Promise Static Properties
props(Promise, {
    all: function () {
        var values = getArrayOf.apply(null, arguments); // Supports iterables, implicit arguments and array-like.
        return new Promise(function (resolve, reject) {
            if (values.length === 0) resolve([]);
            var remaining = values.length;
            values.forEach(function (a, i) {
                return Promise.resolve(a).then(function (x) {
                    values[i] = x;
                    if (! --remaining) resolve(values);
                }, reject);
            });
        });
    },

    resolve: function (value) {
        if (value instanceof Promise) return value;
        if (value && typeof value.then === 'function') return new Promise(function (resolve, reject) {
            value.then(resolve, reject);
        });
        return new Promise(INTERNAL, true, value);
    },

    reject: PromiseReject,

    race: function () {
        var values = getArrayOf.apply(null, arguments);
        return new Promise(function (resolve, reject) {
            values.map(function (value) {
                return Promise.resolve(value).then(resolve, reject);
            });
        });
    },

    PSD: {
        get: function () {
            return PSD;
        },
        set: function (value) {
            return PSD = value;
        }
    },

    newPSD: newScope,

    usePSD: usePSD,

    scheduler: {
        get: function () {
            return asap$1;
        },
        set: function (value) {
            asap$1 = value;
        }
    },

    rejectionMapper: {
        get: function () {
            return rejectionMapper;
        },
        set: function (value) {
            rejectionMapper = value;
        } // Map reject failures
    },

    follow: function (fn) {
        return new Promise(function (resolve, reject) {
            return newScope(function (resolve, reject) {
                var psd = PSD;
                psd.unhandleds = []; // For unhandled standard- or 3rd party Promises. Checked at psd.finalize()
                psd.onunhandled = reject; // Triggered directly on unhandled promises of this library.
                psd.finalize = callBoth(function () {
                    var _this3 = this;

                    // Unhandled standard or 3rd part promises are put in PSD.unhandleds and
                    // examined upon scope completion while unhandled rejections in this Promise
                    // will trigger directly through psd.onunhandled
                    run_at_end_of_this_or_next_physical_tick(function () {
                        _this3.unhandleds.length === 0 ? resolve() : reject(_this3.unhandleds[0]);
                    });
                }, psd.finalize);
                fn();
            }, resolve, reject);
        });
    },

    on: Events(null, { "error": [reverseStoppableEventChain, defaultErrorHandler] // Default to defaultErrorHandler
    })

});

var PromiseOnError = Promise.on.error;
PromiseOnError.subscribe = deprecated("Promise.on('error')", PromiseOnError.subscribe);
PromiseOnError.unsubscribe = deprecated("Promise.on('error').unsubscribe", PromiseOnError.unsubscribe);

/**
* Take a potentially misbehaving resolver function and make sure
* onFulfilled and onRejected are only called once.
*
* Makes no guarantees about asynchrony.
*/
function executePromiseTask(promise, fn) {
    // Promise Resolution Procedure:
    // https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    try {
        fn(function (value) {
            if (promise._state !== null) return;
            if (value === promise) throw new TypeError('A promise cannot be resolved with itself.');
            var shouldExecuteTick = promise._lib && beginMicroTickScope();
            if (value && typeof value.then === 'function') {
                executePromiseTask(promise, function (resolve, reject) {
                    value instanceof Promise ? value._then(resolve, reject) : value.then(resolve, reject);
                });
            } else {
                promise._state = true;
                promise._value = value;
                propagateAllListeners(promise);
            }
            if (shouldExecuteTick) endMicroTickScope();
        }, handleRejection.bind(null, promise)); // If Function.bind is not supported. Exception is handled in catch below
    } catch (ex) {
        handleRejection(promise, ex);
    }
}

function handleRejection(promise, reason) {
    rejectingErrors.push(reason);
    if (promise._state !== null) return;
    var shouldExecuteTick = promise._lib && beginMicroTickScope();
    reason = rejectionMapper(reason);
    promise._state = false;
    promise._value = reason;
    debug && reason !== null && typeof reason === 'object' && !reason._promise && tryCatch(function () {
        var origProp = getPropertyDescriptor(reason, "stack");
        reason._promise = promise;
        setProp(reason, "stack", {
            get: function () {
                return stack_being_generated ? origProp && (origProp.get ? origProp.get.apply(reason) : origProp.value) : promise.stack;
            }
        });
    });
    // Add the failure to a list of possibly uncaught errors
    addPossiblyUnhandledError(promise);
    propagateAllListeners(promise);
    if (shouldExecuteTick) endMicroTickScope();
}

function propagateAllListeners(promise) {
    //debug && linkToPreviousPromise(promise);
    var listeners = promise._listeners;
    promise._listeners = [];
    for (var i = 0, len = listeners.length; i < len; ++i) {
        propagateToListener(promise, listeners[i]);
    }
    var psd = promise._PSD;
    --psd.ref || psd.finalize(); // if psd.ref reaches zero, call psd.finalize();
    if (numScheduledCalls === 0) {
        // If numScheduledCalls is 0, it means that our stack is not in a callback of a scheduled call,
        // and that no deferreds where listening to this rejection or success.
        // Since there is a risk that our stack can contain application code that may
        // do stuff after this code is finished that may generate new calls, we cannot
        // call finalizers here.
        ++numScheduledCalls;
        asap$1(function () {
            if (--numScheduledCalls === 0) finalizePhysicalTick(); // Will detect unhandled errors
        }, []);
    }
}

function propagateToListener(promise, listener) {
    if (promise._state === null) {
        promise._listeners.push(listener);
        return;
    }

    var cb = promise._state ? listener.onFulfilled : listener.onRejected;
    if (cb === null) {
        // This Listener doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
        return (promise._state ? listener.resolve : listener.reject)(promise._value);
    }
    var psd = listener.psd;
    ++psd.ref;
    ++numScheduledCalls;
    asap$1(callListener, [cb, promise, listener]);
}

function callListener(cb, promise, listener) {
    var outerScope = PSD;
    var psd = listener.psd;
    try {
        if (psd !== outerScope) {
            // **KEEP** outerScope.env = wrappers.snapshot(); // Snapshot outerScope's environment.
            PSD = psd;
            // **KEEP** wrappers.restore(psd.env); // Restore PSD's environment.
        }

        // Set static variable currentFulfiller to the promise that is being fullfilled,
        // so that we connect the chain of promises (for long stacks support)
        currentFulfiller = promise;

        // Call callback and resolve our listener with it's return value.
        var value = promise._value,
            ret;
        if (promise._state) {
            ret = cb(value);
        } else {
            if (rejectingErrors.length) rejectingErrors = [];
            ret = cb(value);
            if (rejectingErrors.indexOf(value) === -1) markErrorAsHandled(promise); // Callback didnt do Promise.reject(err) nor reject(err) onto another promise.
        }
        listener.resolve(ret);
    } catch (e) {
        // Exception thrown in callback. Reject our listener.
        listener.reject(e);
    } finally {
        // Restore PSD, env and currentFulfiller.
        if (psd !== outerScope) {
            PSD = outerScope;
            // **KEEP** wrappers.restore(outerScope.env); // Restore outerScope's environment
        }
        currentFulfiller = null;
        if (--numScheduledCalls === 0) finalizePhysicalTick();
        --psd.ref || psd.finalize();
    }
}

function getStack(promise, stacks, limit) {
    if (stacks.length === limit) return stacks;
    var stack = "";
    if (promise._state === false) {
        var failure = promise._value,
            errorName,
            message;

        if (failure != null) {
            errorName = failure.name || "Error";
            message = failure.message || failure;
            stack = prettyStack(failure, 0);
        } else {
            errorName = failure; // If error is undefined or null, show that.
            message = "";
        }
        stacks.push(errorName + (message ? ": " + message : "") + stack);
    }
    if (debug) {
        stack = prettyStack(promise._stackHolder, 2);
        if (stack && stacks.indexOf(stack) === -1) stacks.push(stack);
        if (promise._prev) getStack(promise._prev, stacks, limit);
    }
    return stacks;
}

function linkToPreviousPromise(promise, prev) {
    // Support long stacks by linking to previous completed promise.
    var numPrev = prev ? prev._numPrev + 1 : 0;
    if (numPrev < LONG_STACKS_CLIP_LIMIT) {
        // Prohibit infinite Promise loops to get an infinite long memory consuming "tail".
        promise._prev = prev;
        promise._numPrev = numPrev;
    }
}

/* The callback to schedule with setImmediate() or setTimeout().
   It runs a virtual microtick and executes any callback registered in microtickQueue.
 */
function physicalTick() {
    beginMicroTickScope() && endMicroTickScope();
}

function beginMicroTickScope() {
    var wasRootExec = isOutsideMicroTick;
    isOutsideMicroTick = false;
    needsNewPhysicalTick = false;
    return wasRootExec;
}

/* Executes micro-ticks without doing try..catch.
   This can be possible because we only use this internally and
   the registered functions are exception-safe (they do try..catch
   internally before calling any external method). If registering
   functions in the microtickQueue that are not exception-safe, this
   would destroy the framework and make it instable. So we don't export
   our asap method.
*/
function endMicroTickScope() {
    var callbacks, i, l;
    do {
        while (microtickQueue.length > 0) {
            callbacks = microtickQueue;
            microtickQueue = [];
            l = callbacks.length;
            for (i = 0; i < l; ++i) {
                var item = callbacks[i];
                item[0].apply(null, item[1]);
            }
        }
    } while (microtickQueue.length > 0);
    isOutsideMicroTick = true;
    needsNewPhysicalTick = true;
}

function finalizePhysicalTick() {
    var unhandledErrs = unhandledErrors;
    unhandledErrors = [];
    unhandledErrs.forEach(function (p) {
        p._PSD.onunhandled.call(null, p._value, p);
    });
    var finalizers = tickFinalizers.slice(0); // Clone first because finalizer may remove itself from list.
    var i = finalizers.length;
    while (i) {
        finalizers[--i]();
    }
}

function run_at_end_of_this_or_next_physical_tick(fn) {
    function finalizer() {
        fn();
        tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
    }
    tickFinalizers.push(finalizer);
    ++numScheduledCalls;
    asap$1(function () {
        if (--numScheduledCalls === 0) finalizePhysicalTick();
    }, []);
}

function addPossiblyUnhandledError(promise) {
    // Only add to unhandledErrors if not already there. The first one to add to this list
    // will be upon the first rejection so that the root cause (first promise in the
    // rejection chain) is the one listed.
    if (!unhandledErrors.some(function (p) {
        return p._value === promise._value;
    })) unhandledErrors.push(promise);
}

function markErrorAsHandled(promise) {
    // Called when a reject handled is actually being called.
    // Search in unhandledErrors for any promise whos _value is this promise_value (list
    // contains only rejected promises, and only one item per error)
    var i = unhandledErrors.length;
    while (i) {
        if (unhandledErrors[--i]._value === promise._value) {
            // Found a promise that failed with this same error object pointer,
            // Remove that since there is a listener that actually takes care of it.
            unhandledErrors.splice(i, 1);
            return;
        }
    }
}

// By default, log uncaught errors to the console
function defaultErrorHandler(e) {
    console.warn('Unhandled rejection: ' + (e.stack || e));
}

function PromiseReject(reason) {
    return new Promise(INTERNAL, false, reason);
}

function wrap(fn, errorCatcher) {
    var psd = PSD;
    return function () {
        var wasRootExec = beginMicroTickScope(),
            outerScope = PSD;

        try {
            if (outerScope !== psd) {
                // **KEEP** outerScope.env = wrappers.snapshot(); // Snapshot outerScope's environment
                PSD = psd;
                // **KEEP** wrappers.restore(psd.env); // Restore PSD's environment.
            }
            return fn.apply(this, arguments);
        } catch (e) {
            errorCatcher && errorCatcher(e);
        } finally {
            if (outerScope !== psd) {
                PSD = outerScope;
                // **KEEP** wrappers.restore(outerScope.env); // Restore outerScope's environment
            }
            if (wasRootExec) endMicroTickScope();
        }
    };
}

function newScope(fn, a1, a2, a3) {
    var parent = PSD,
        psd = Object.create(parent);
    psd.parent = parent;
    psd.ref = 0;
    psd.global = false;
    // **KEEP** psd.env = wrappers.wrap(psd);

    // unhandleds and onunhandled should not be specifically set here.
    // Leave them on parent prototype.
    // unhandleds.push(err) will push to parent's prototype
    // onunhandled() will call parents onunhandled (with this scope's this-pointer though!)
    ++parent.ref;
    psd.finalize = function () {
        --this.parent.ref || this.parent.finalize();
    };
    var rv = usePSD(psd, fn, a1, a2, a3);
    if (psd.ref === 0) psd.finalize();
    return rv;
}

function usePSD(psd, fn, a1, a2, a3) {
    var outerScope = PSD;
    try {
        if (psd !== outerScope) {
            // **KEEP** outerScope.env = wrappers.snapshot(); // snapshot outerScope's environment.
            PSD = psd;
            // **KEEP** wrappers.restore(psd.env); // Restore PSD's environment.
        }
        return fn(a1, a2, a3);
    } finally {
        if (psd !== outerScope) {
            PSD = outerScope;
            // **KEEP** wrappers.restore(outerScope.env); // Restore outerScope's environment.
        }
    }
}

var UNHANDLEDREJECTION = "unhandledrejection";

function globalError(err, promise) {
    var rv;
    try {
        rv = promise.onuncatched(err);
    } catch (e) {}
    if (rv !== false) try {
        var event,
            eventData = { promise: promise, reason: err };
        if (_global.document && document.createEvent) {
            event = document.createEvent('Event');
            event.initEvent(UNHANDLEDREJECTION, true, true);
            extend(event, eventData);
        } else if (_global.CustomEvent) {
            event = new CustomEvent(UNHANDLEDREJECTION, { detail: eventData });
            extend(event, eventData);
        }
        if (event && _global.dispatchEvent) {
            dispatchEvent(event);
            if (!_global.PromiseRejectionEvent && _global.onunhandledrejection)
                // No native support for PromiseRejectionEvent but user has set window.onunhandledrejection. Manually call it.
                try {
                    _global.onunhandledrejection(event);
                } catch (_) {}
        }
        if (!event.defaultPrevented) {
            // Backward compatibility: fire to events registered at Promise.on.error
            Promise.on.error.fire(err, promise);
        }
    } catch (e) {}
}

/* **KEEP** 

export function wrapPromise(PromiseClass) {
    var proto = PromiseClass.prototype;
    var origThen = proto.then;
    
    wrappers.add({
        snapshot: () => proto.then,
        restore: value => {proto.then = value;},
        wrap: () => patchedThen
    });

    function patchedThen (onFulfilled, onRejected) {
        var promise = this;
        var onFulfilledProxy = wrap(function(value){
            var rv = value;
            if (onFulfilled) {
                rv = onFulfilled(rv);
                if (rv && typeof rv.then === 'function') rv.then(); // Intercept that promise as well.
            }
            --PSD.ref || PSD.finalize();
            return rv;
        });
        var onRejectedProxy = wrap(function(err){
            promise._$err = err;
            var unhandleds = PSD.unhandleds;
            var idx = unhandleds.length,
                rv;
            while (idx--) if (unhandleds[idx]._$err === err) break;
            if (onRejected) {
                if (idx !== -1) unhandleds.splice(idx, 1); // Mark as handled.
                rv = onRejected(err);
                if (rv && typeof rv.then === 'function') rv.then(); // Intercept that promise as well.
            } else {
                if (idx === -1) unhandleds.push(promise);
                rv = PromiseClass.reject(err);
                rv._$nointercept = true; // Prohibit eternal loop.
            }
            --PSD.ref || PSD.finalize();
            return rv;
        });
        
        if (this._$nointercept) return origThen.apply(this, arguments);
        ++PSD.ref;
        return origThen.call(this, onFulfilledProxy, onRejectedProxy);
    }
}

// Global Promise wrapper
if (_global.Promise) wrapPromise(_global.Promise);

*/

doFakeAutoComplete(function () {
    // Simplify the job for VS Intellisense. This piece of code is one of the keys to the new marvellous intellisense support in Dexie.
    asap$1 = function (fn, args) {
        setTimeout(function () {
            fn.apply(null, args);
        }, 0);
    };
});

function rejection(err, uncaughtHandler) {
    // Get the call stack and return a rejected promise.
    var rv = Promise.reject(err);
    return uncaughtHandler ? rv.uncaught(uncaughtHandler) : rv;
}

/*
 * Dexie.js - a minimalistic wrapper for IndexedDB
 * ===============================================
 *
 * By David Fahlander, david.fahlander@gmail.com
 *
 * Version 1.5.1, Tue Nov 01 2016
 *
 * http://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 */

var DEXIE_VERSION = '1.5.1';
var maxString = String.fromCharCode(65535);
var maxKey = function () {
    try {
        IDBKeyRange.only([[]]);return [[]];
    } catch (e) {
        return maxString;
    }
}();
var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
var STRING_EXPECTED = "String expected.";
var connections = [];
var isIEOrEdge = typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
var hasIEDeleteObjectStoreBug = isIEOrEdge;
var hangsOnDeleteLargeKeyRange = isIEOrEdge;
var dexieStackFrameFilter = function (frame) {
    return !/(dexie\.js|dexie\.min\.js)/.test(frame);
};

setDebug(debug, dexieStackFrameFilter);

function Dexie(dbName, options) {
    /// <param name="options" type="Object" optional="true">Specify only if you wich to control which addons that should run on this instance</param>
    var deps = Dexie.dependencies;
    var opts = extend({
        // Default Options
        addons: Dexie.addons, // Pick statically registered addons by default
        autoOpen: true, // Don't require db.open() explicitely.
        indexedDB: deps.indexedDB, // Backend IndexedDB api. Default to IDBShim or browser env.
        IDBKeyRange: deps.IDBKeyRange // Backend IDBKeyRange api. Default to IDBShim or browser env.
    }, options);
    var addons = opts.addons,
        autoOpen = opts.autoOpen,
        indexedDB = opts.indexedDB,
        IDBKeyRange = opts.IDBKeyRange;

    var globalSchema = this._dbSchema = {};
    var versions = [];
    var dbStoreNames = [];
    var allTables = {};
    ///<var type="IDBDatabase" />
    var idbdb = null; // Instance of IDBDatabase
    var dbOpenError = null;
    var isBeingOpened = false;
    var openComplete = false;
    var READONLY = "readonly",
        READWRITE = "readwrite";
    var db = this;
    var dbReadyResolve,
        dbReadyPromise = new Promise(function (resolve) {
        dbReadyResolve = resolve;
    }),
        cancelOpen,
        openCanceller = new Promise(function (_, reject) {
        cancelOpen = reject;
    });
    var autoSchema = true;
    var hasNativeGetDatabaseNames = !!getNativeGetDatabaseNamesFn(indexedDB),
        hasGetAll;

    function init() {
        // Default subscribers to "versionchange" and "blocked".
        // Can be overridden by custom handlers. If custom handlers return false, these default
        // behaviours will be prevented.
        db.on("versionchange", function (ev) {
            // Default behavior for versionchange event is to close database connection.
            // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
            // Let's not block the other window from making it's delete() or open() call.
            // NOTE! This event is never fired in IE,Edge or Safari.
            if (ev.newVersion > 0) console.warn('Another connection wants to upgrade database \'' + db.name + '\'. Closing db now to resume the upgrade.');else console.warn('Another connection wants to delete database \'' + db.name + '\'. Closing db now to resume the delete request.');
            db.close();
            // In many web applications, it would be recommended to force window.reload()
            // when this event occurs. To do that, subscribe to the versionchange event
            // and call window.location.reload(true) if ev.newVersion > 0 (not a deletion)
            // The reason for this is that your current web app obviously has old schema code that needs
            // to be updated. Another window got a newer version of the app and needs to upgrade DB but
            // your window is blocking it unless we close it here.
        });
        db.on("blocked", function (ev) {
            if (!ev.newVersion || ev.newVersion < ev.oldVersion) console.warn('Dexie.delete(\'' + db.name + '\') was blocked');else console.warn('Upgrade \'' + db.name + '\' blocked by other connection holding version ' + ev.oldVersion / 10);
        });
    }

    //
    //
    //
    // ------------------------- Versioning Framework---------------------------
    //
    //
    //

    this.version = function (versionNumber) {
        /// <param name="versionNumber" type="Number"></param>
        /// <returns type="Version"></returns>
        if (idbdb || isBeingOpened) throw new exceptions.Schema("Cannot add version when database is open");
        this.verno = Math.max(this.verno, versionNumber);
        var versionInstance = versions.filter(function (v) {
            return v._cfg.version === versionNumber;
        })[0];
        if (versionInstance) return versionInstance;
        versionInstance = new Version(versionNumber);
        versions.push(versionInstance);
        versions.sort(lowerVersionFirst);
        return versionInstance;
    };

    function Version(versionNumber) {
        this._cfg = {
            version: versionNumber,
            storesSource: null,
            dbschema: {},
            tables: {},
            contentUpgrade: null
        };
        this.stores({}); // Derive earlier schemas by default.
    }

    extend(Version.prototype, {
        stores: function (stores) {
            /// <summary>
            ///   Defines the schema for a particular version
            /// </summary>
            /// <param name="stores" type="Object">
            /// Example: <br/>
            ///   {users: "id++,first,last,&amp;username,*email", <br/>
            ///   passwords: "id++,&amp;username"}<br/>
            /// <br/>
            /// Syntax: {Table: "[primaryKey][++],[&amp;][*]index1,[&amp;][*]index2,..."}<br/><br/>
            /// Special characters:<br/>
            ///  "&amp;"  means unique key, <br/>
            ///  "*"  means value is multiEntry, <br/>
            ///  "++" means auto-increment and only applicable for primary key <br/>
            /// </param>
            this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;

            // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
            var storesSpec = {};
            versions.forEach(function (version) {
                // 'versions' is always sorted by lowest version first.
                extend(storesSpec, version._cfg.storesSource);
            });

            var dbschema = this._cfg.dbschema = {};
            this._parseStoresSpec(storesSpec, dbschema);
            // Update the latest schema to this version
            // Update API
            globalSchema = db._dbSchema = dbschema;
            removeTablesApi([allTables, db, Transaction.prototype]);
            setApiOnPlace([allTables, db, Transaction.prototype, this._cfg.tables], keys(dbschema), READWRITE, dbschema);
            dbStoreNames = keys(dbschema);
            return this;
        },
        upgrade: function (upgradeFunction) {
            /// <param name="upgradeFunction" optional="true">Function that performs upgrading actions.</param>
            var self = this;
            fakeAutoComplete(function () {
                upgradeFunction(db._createTransaction(READWRITE, keys(self._cfg.dbschema), self._cfg.dbschema)); // BUGBUG: No code completion for prev version's tables wont appear.
            });
            this._cfg.contentUpgrade = upgradeFunction;
            return this;
        },
        _parseStoresSpec: function (stores, outSchema) {
            keys(stores).forEach(function (tableName) {
                if (stores[tableName] !== null) {
                    var instanceTemplate = {};
                    var indexes = parseIndexSyntax(stores[tableName]);
                    var primKey = indexes.shift();
                    if (primKey.multi) throw new exceptions.Schema("Primary key cannot be multi-valued");
                    if (primKey.keyPath) setByKeyPath(instanceTemplate, primKey.keyPath, primKey.auto ? 0 : primKey.keyPath);
                    indexes.forEach(function (idx) {
                        if (idx.auto) throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                        if (!idx.keyPath) throw new exceptions.Schema("Index must have a name and cannot be an empty string");
                        setByKeyPath(instanceTemplate, idx.keyPath, idx.compound ? idx.keyPath.map(function () {
                            return "";
                        }) : "");
                    });
                    outSchema[tableName] = new TableSchema(tableName, primKey, indexes, instanceTemplate);
                }
            });
        }
    });

    function runUpgraders(oldVersion, idbtrans, reject) {
        var trans = db._createTransaction(READWRITE, dbStoreNames, globalSchema);
        trans.create(idbtrans);
        trans._completion.catch(reject);
        var rejectTransaction = trans._reject.bind(trans);
        newScope(function () {
            PSD.trans = trans;
            if (oldVersion === 0) {
                // Create tables:
                keys(globalSchema).forEach(function (tableName) {
                    createTable(idbtrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
                });
                Promise.follow(function () {
                    return db.on.populate.fire(trans);
                }).catch(rejectTransaction);
            } else updateTablesAndIndexes(oldVersion, trans, idbtrans).catch(rejectTransaction);
        });
    }

    function updateTablesAndIndexes(oldVersion, trans, idbtrans) {
        // Upgrade version to version, step-by-step from oldest to newest version.
        // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
        var queue = [];
        var oldVersionStruct = versions.filter(function (version) {
            return version._cfg.version === oldVersion;
        })[0];
        if (!oldVersionStruct) throw new exceptions.Upgrade("Dexie specification of currently installed DB version is missing");
        globalSchema = db._dbSchema = oldVersionStruct._cfg.dbschema;
        var anyContentUpgraderHasRun = false;

        var versToRun = versions.filter(function (v) {
            return v._cfg.version > oldVersion;
        });
        versToRun.forEach(function (version) {
            /// <param name="version" type="Version"></param>
            queue.push(function () {
                var oldSchema = globalSchema;
                var newSchema = version._cfg.dbschema;
                adjustToExistingIndexNames(oldSchema, idbtrans);
                adjustToExistingIndexNames(newSchema, idbtrans);
                globalSchema = db._dbSchema = newSchema;
                var diff = getSchemaDiff(oldSchema, newSchema);
                // Add tables           
                diff.add.forEach(function (tuple) {
                    createTable(idbtrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
                });
                // Change tables
                diff.change.forEach(function (change) {
                    if (change.recreate) {
                        throw new exceptions.Upgrade("Not yet support for changing primary key");
                    } else {
                        var store = idbtrans.objectStore(change.name);
                        // Add indexes
                        change.add.forEach(function (idx) {
                            addIndex(store, idx);
                        });
                        // Update indexes
                        change.change.forEach(function (idx) {
                            store.deleteIndex(idx.name);
                            addIndex(store, idx);
                        });
                        // Delete indexes
                        change.del.forEach(function (idxName) {
                            store.deleteIndex(idxName);
                        });
                    }
                });
                if (version._cfg.contentUpgrade) {
                    anyContentUpgraderHasRun = true;
                    return Promise.follow(function () {
                        version._cfg.contentUpgrade(trans);
                    });
                }
            });
            queue.push(function (idbtrans) {
                if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug) {
                    // Dont delete old tables if ieBug is present and a content upgrader has run. Let tables be left in DB so far. This needs to be taken care of.
                    var newSchema = version._cfg.dbschema;
                    // Delete old tables
                    deleteRemovedTables(newSchema, idbtrans);
                }
            });
        });

        // Now, create a queue execution engine
        function runQueue() {
            return queue.length ? Promise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : Promise.resolve();
        }

        return runQueue().then(function () {
            createMissingTables(globalSchema, idbtrans); // At last, make sure to create any missing tables. (Needed by addons that add stores to DB without specifying version)
        });
    }

    function getSchemaDiff(oldSchema, newSchema) {
        var diff = {
            del: [], // Array of table names
            add: [], // Array of [tableName, newDefinition]
            change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}
        };
        for (var table in oldSchema) {
            if (!newSchema[table]) diff.del.push(table);
        }
        for (table in newSchema) {
            var oldDef = oldSchema[table],
                newDef = newSchema[table];
            if (!oldDef) {
                diff.add.push([table, newDef]);
            } else {
                var change = {
                    name: table,
                    def: newDef,
                    recreate: false,
                    del: [],
                    add: [],
                    change: []
                };
                if (oldDef.primKey.src !== newDef.primKey.src) {
                    // Primary key has changed. Remove and re-add table.
                    change.recreate = true;
                    diff.change.push(change);
                } else {
                    // Same primary key. Just find out what differs:
                    var oldIndexes = oldDef.idxByName;
                    var newIndexes = newDef.idxByName;
                    for (var idxName in oldIndexes) {
                        if (!newIndexes[idxName]) change.del.push(idxName);
                    }
                    for (idxName in newIndexes) {
                        var oldIdx = oldIndexes[idxName],
                            newIdx = newIndexes[idxName];
                        if (!oldIdx) change.add.push(newIdx);else if (oldIdx.src !== newIdx.src) change.change.push(newIdx);
                    }
                    if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                        diff.change.push(change);
                    }
                }
            }
        }
        return diff;
    }

    function createTable(idbtrans, tableName, primKey, indexes) {
        /// <param name="idbtrans" type="IDBTransaction"></param>
        var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
        indexes.forEach(function (idx) {
            addIndex(store, idx);
        });
        return store;
    }

    function createMissingTables(newSchema, idbtrans) {
        keys(newSchema).forEach(function (tableName) {
            if (!idbtrans.db.objectStoreNames.contains(tableName)) {
                createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
            }
        });
    }

    function deleteRemovedTables(newSchema, idbtrans) {
        for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
            var storeName = idbtrans.db.objectStoreNames[i];
            if (newSchema[storeName] == null) {
                idbtrans.db.deleteObjectStore(storeName);
            }
        }
    }

    function addIndex(store, idx) {
        store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
    }

    function dbUncaught(err) {
        return db.on.error.fire(err);
    }

    //
    //
    //      Dexie Protected API
    //
    //

    this._allTables = allTables;

    this._tableFactory = function createTable(mode, tableSchema) {
        /// <param name="tableSchema" type="TableSchema"></param>
        if (mode === READONLY) return new Table(tableSchema.name, tableSchema, Collection);else return new WriteableTable(tableSchema.name, tableSchema);
    };

    this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) {
        return new Transaction(mode, storeNames, dbschema, parentTransaction);
    };

    /* Generate a temporary transaction when db operations are done outside a transactino scope.
    */
    function tempTransaction(mode, storeNames, fn) {
        // Last argument is "writeLocked". But this doesnt apply to oneshot direct db operations, so we ignore it.
        if (!openComplete && !PSD.letThrough) {
            if (!isBeingOpened) {
                if (!autoOpen) return rejection(new exceptions.DatabaseClosed(), dbUncaught);
                db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
            }
            return dbReadyPromise.then(function () {
                return tempTransaction(mode, storeNames, fn);
            });
        } else {
            var trans = db._createTransaction(mode, storeNames, globalSchema);
            return trans._promise(mode, function (resolve, reject) {
                newScope(function () {
                    // OPTIMIZATION POSSIBLE? newScope() not needed because it's already done in _promise.
                    PSD.trans = trans;
                    fn(resolve, reject, trans);
                });
            }).then(function (result) {
                // Instead of resolving value directly, wait with resolving it until transaction has completed.
                // Otherwise the data would not be in the DB if requesting it in the then() operation.
                // Specifically, to ensure that the following expression will work:
                //
                //   db.friends.put({name: "Arne"}).then(function () {
                //       db.friends.where("name").equals("Arne").count(function(count) {
                //           assert (count === 1);
                //       });
                //   });
                //
                return trans._completion.then(function () {
                    return result;
                });
            }); /*.catch(err => { // Don't do this as of now. If would affect bulk- and modify methods in a way that could be more intuitive. But wait! Maybe change in next major.
                 trans._reject(err);
                 return rejection(err);
                });*/
        }
    }

    this._whenReady = function (fn) {
        return new Promise(fake || openComplete || PSD.letThrough ? fn : function (resolve, reject) {
            if (!isBeingOpened) {
                if (!autoOpen) {
                    reject(new exceptions.DatabaseClosed());
                    return;
                }
                db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
            }
            dbReadyPromise.then(function () {
                fn(resolve, reject);
            });
        }).uncaught(dbUncaught);
    };

    //
    //
    //
    //
    //      Dexie API
    //
    //
    //

    this.verno = 0;

    this.open = function () {
        if (isBeingOpened || idbdb) return dbReadyPromise.then(function () {
            return dbOpenError ? rejection(dbOpenError, dbUncaught) : db;
        });
        debug && (openCanceller._stackHolder = getErrorWithStack()); // Let stacks point to when open() was called rather than where new Dexie() was called.
        isBeingOpened = true;
        dbOpenError = null;
        openComplete = false;

        // Function pointers to call when the core opening process completes.
        var resolveDbReady = dbReadyResolve,

        // upgradeTransaction to abort on failure.
        upgradeTransaction = null;

        return Promise.race([openCanceller, new Promise(function (resolve, reject) {
            doFakeAutoComplete(function () {
                return resolve();
            });

            // Make sure caller has specified at least one version
            if (versions.length > 0) autoSchema = false;

            // Multiply db.verno with 10 will be needed to workaround upgrading bug in IE:
            // IE fails when deleting objectStore after reading from it.
            // A future version of Dexie.js will stopover an intermediate version to workaround this.
            // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.

            // If no API, throw!
            if (!indexedDB) throw new exceptions.MissingAPI("indexedDB API not found. If using IE10+, make sure to run your code on a server URL " + "(not locally). If using old Safari versions, make sure to include indexedDB polyfill.");

            var req = autoSchema ? indexedDB.open(dbName) : indexedDB.open(dbName, Math.round(db.verno * 10));
            if (!req) throw new exceptions.MissingAPI("IndexedDB API not available"); // May happen in Safari private mode, see https://github.com/dfahlander/Dexie.js/issues/134
            req.onerror = wrap(eventRejectHandler(reject));
            req.onblocked = wrap(fireOnBlocked);
            req.onupgradeneeded = wrap(function (e) {
                upgradeTransaction = req.transaction;
                if (autoSchema && !db._allowEmptyDB) {
                    // Unless an addon has specified db._allowEmptyDB, lets make the call fail.
                    // Caller did not specify a version or schema. Doing that is only acceptable for opening alread existing databases.
                    // If onupgradeneeded is called it means database did not exist. Reject the open() promise and make sure that we
                    // do not create a new database by accident here.
                    req.onerror = preventDefault; // Prohibit onabort error from firing before we're done!
                    upgradeTransaction.abort(); // Abort transaction (would hope that this would make DB disappear but it doesnt.)
                    // Close database and delete it.
                    req.result.close();
                    var delreq = indexedDB.deleteDatabase(dbName); // The upgrade transaction is atomic, and javascript is single threaded - meaning that there is no risk that we delete someone elses database here!
                    delreq.onsuccess = delreq.onerror = wrap(function () {
                        reject(new exceptions.NoSuchDatabase('Database ' + dbName + ' doesnt exist'));
                    });
                } else {
                    upgradeTransaction.onerror = wrap(eventRejectHandler(reject));
                    var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.
                    runUpgraders(oldVer / 10, upgradeTransaction, reject, req);
                }
            }, reject);

            req.onsuccess = wrap(function () {
                // Core opening procedure complete. Now let's just record some stuff.
                upgradeTransaction = null;
                idbdb = req.result;
                connections.push(db); // Used for emulating versionchange event on IE/Edge/Safari.

                if (autoSchema) readGlobalSchema();else if (idbdb.objectStoreNames.length > 0) {
                    try {
                        adjustToExistingIndexNames(globalSchema, idbdb.transaction(safariMultiStoreFix(idbdb.objectStoreNames), READONLY));
                    } catch (e) {
                        // Safari may bail out if > 1 store names. However, this shouldnt be a showstopper. Issue #120.
                    }
                }

                idbdb.onversionchange = wrap(function (ev) {
                    db._vcFired = true; // detect implementations that not support versionchange (IE/Edge/Safari)
                    db.on("versionchange").fire(ev);
                });

                if (!hasNativeGetDatabaseNames) {
                    // Update localStorage with list of database names
                    globalDatabaseList(function (databaseNames) {
                        if (databaseNames.indexOf(dbName) === -1) return databaseNames.push(dbName);
                    });
                }

                resolve();
            }, reject);
        })]).then(function () {
            // Before finally resolving the dbReadyPromise and this promise,
            // call and await all on('ready') subscribers:
            // Dexie.vip() makes subscribers able to use the database while being opened.
            // This is a must since these subscribers take part of the opening procedure.
            return Dexie.vip(db.on.ready.fire);
        }).then(function () {
            // Resolve the db.open() with the db instance.
            isBeingOpened = false;
            return db;
        }).catch(function (err) {
            try {
                // Did we fail within onupgradeneeded? Make sure to abort the upgrade transaction so it doesnt commit.
                upgradeTransaction && upgradeTransaction.abort();
            } catch (e) {}
            isBeingOpened = false; // Set before calling db.close() so that it doesnt reject openCanceller again (leads to unhandled rejection event).
            db.close(); // Closes and resets idbdb, removes connections, resets dbReadyPromise and openCanceller so that a later db.open() is fresh.
            // A call to db.close() may have made on-ready subscribers fail. Use dbOpenError if set, since err could be a follow-up error on that.
            dbOpenError = err; // Record the error. It will be used to reject further promises of db operations.
            return rejection(dbOpenError, dbUncaught); // dbUncaught will make sure any error that happened in any operation before will now bubble to db.on.error() thanks to the special handling in Promise.uncaught().
        }).finally(function () {
            openComplete = true;
            resolveDbReady(); // dbReadyPromise is resolved no matter if open() rejects or resolved. It's just to wake up waiters.
        });
    };

    this.close = function () {
        var idx = connections.indexOf(db);
        if (idx >= 0) connections.splice(idx, 1);
        if (idbdb) {
            try {
                idbdb.close();
            } catch (e) {}
            idbdb = null;
        }
        autoOpen = false;
        dbOpenError = new exceptions.DatabaseClosed();
        if (isBeingOpened) cancelOpen(dbOpenError);
        // Reset dbReadyPromise promise:
        dbReadyPromise = new Promise(function (resolve) {
            dbReadyResolve = resolve;
        });
        openCanceller = new Promise(function (_, reject) {
            cancelOpen = reject;
        });
    };

    this.delete = function () {
        var hasArguments = arguments.length > 0;
        return new Promise(function (resolve, reject) {
            if (hasArguments) throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
            if (isBeingOpened) {
                dbReadyPromise.then(doDelete);
            } else {
                doDelete();
            }
            function doDelete() {
                db.close();
                var req = indexedDB.deleteDatabase(dbName);
                req.onsuccess = wrap(function () {
                    if (!hasNativeGetDatabaseNames) {
                        globalDatabaseList(function (databaseNames) {
                            var pos = databaseNames.indexOf(dbName);
                            if (pos >= 0) return databaseNames.splice(pos, 1);
                        });
                    }
                    resolve();
                });
                req.onerror = wrap(eventRejectHandler(reject));
                req.onblocked = fireOnBlocked;
            }
        }).uncaught(dbUncaught);
    };

    this.backendDB = function () {
        return idbdb;
    };

    this.isOpen = function () {
        return idbdb !== null;
    };
    this.hasFailed = function () {
        return dbOpenError !== null;
    };
    this.dynamicallyOpened = function () {
        return autoSchema;
    };

    //
    // Properties
    //
    this.name = dbName;

    // db.tables - an array of all Table instances.
    setProp(this, "tables", {
        get: function () {
            /// <returns type="Array" elementType="WriteableTable" />
            return keys(allTables).map(function (name) {
                return allTables[name];
            });
        }
    });

    //
    // Events
    //
    this.on = Events(this, "error", "populate", "blocked", "versionchange", { ready: [promisableChain, nop] });
    this.on.error.subscribe = deprecated("Dexie.on.error", this.on.error.subscribe);
    this.on.error.unsubscribe = deprecated("Dexie.on.error.unsubscribe", this.on.error.unsubscribe);

    this.on.ready.subscribe = override(this.on.ready.subscribe, function (subscribe) {
        return function (subscriber, bSticky) {
            Dexie.vip(function () {
                if (openComplete) {
                    // Database already open. Call subscriber asap.
                    if (!dbOpenError) Promise.resolve().then(subscriber);
                    // bSticky: Also subscribe to future open sucesses (after close / reopen) 
                    if (bSticky) subscribe(subscriber);
                } else {
                    // Database not yet open. Subscribe to it.
                    subscribe(subscriber);
                    // If bSticky is falsy, make sure to unsubscribe subscriber when fired once.
                    if (!bSticky) subscribe(function unsubscribe() {
                        db.on.ready.unsubscribe(subscriber);
                        db.on.ready.unsubscribe(unsubscribe);
                    });
                }
            });
        };
    });

    fakeAutoComplete(function () {
        db.on("populate").fire(db._createTransaction(READWRITE, dbStoreNames, globalSchema));
        db.on("error").fire(new Error());
    });

    this.transaction = function (mode, tableInstances, scopeFunc) {
        /// <summary>
        ///
        /// </summary>
        /// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
        /// <param name="tableInstances">Table instance, Array of Table instances, String or String Array of object stores to include in the transaction</param>
        /// <param name="scopeFunc" type="Function">Function to execute with transaction</param>

        // Let table arguments be all arguments between mode and last argument.
        var i = arguments.length;
        if (i < 2) throw new exceptions.InvalidArgument("Too few arguments");
        // Prevent optimzation killer (https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments)
        // and clone arguments except the first one into local var 'args'.
        var args = new Array(i - 1);
        while (--i) {
            args[i - 1] = arguments[i];
        } // Let scopeFunc be the last argument and pop it so that args now only contain the table arguments.
        scopeFunc = args.pop();
        var tables = flatten(args); // Support using array as middle argument, or a mix of arrays and non-arrays.
        var parentTransaction = PSD.trans;
        // Check if parent transactions is bound to this db instance, and if caller wants to reuse it
        if (!parentTransaction || parentTransaction.db !== db || mode.indexOf('!') !== -1) parentTransaction = null;
        var onlyIfCompatible = mode.indexOf('?') !== -1;
        mode = mode.replace('!', '').replace('?', ''); // Ok. Will change arguments[0] as well but we wont touch arguments henceforth.

        try {
            //
            // Get storeNames from arguments. Either through given table instances, or through given table names.
            //
            var storeNames = tables.map(function (table) {
                var storeName = table instanceof Table ? table.name : table;
                if (typeof storeName !== 'string') throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
                return storeName;
            });

            //
            // Resolve mode. Allow shortcuts "r" and "rw".
            //
            if (mode == "r" || mode == READONLY) mode = READONLY;else if (mode == "rw" || mode == READWRITE) mode = READWRITE;else throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);

            if (parentTransaction) {
                // Basic checks
                if (parentTransaction.mode === READONLY && mode === READWRITE) {
                    if (onlyIfCompatible) {
                        // Spawn new transaction instead.
                        parentTransaction = null;
                    } else throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                }
                if (parentTransaction) {
                    storeNames.forEach(function (storeName) {
                        if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                            if (onlyIfCompatible) {
                                // Spawn new transaction instead.
                                parentTransaction = null;
                            } else throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
                        }
                    });
                }
            }
        } catch (e) {
            return parentTransaction ? parentTransaction._promise(null, function (_, reject) {
                reject(e);
            }) : rejection(e, dbUncaught);
        }
        // If this is a sub-transaction, lock the parent and then launch the sub-transaction.
        return parentTransaction ? parentTransaction._promise(mode, enterTransactionScope, "lock") : db._whenReady(enterTransactionScope);

        function enterTransactionScope(resolve) {
            var parentPSD = PSD;
            resolve(Promise.resolve().then(function () {
                return newScope(function () {
                    // Keep a pointer to last non-transactional PSD to use if someone calls Dexie.ignoreTransaction().
                    PSD.transless = PSD.transless || parentPSD;
                    // Our transaction.
                    //return new Promise((resolve, reject) => {
                    var trans = db._createTransaction(mode, storeNames, globalSchema, parentTransaction);
                    // Let the transaction instance be part of a Promise-specific data (PSD) value.
                    PSD.trans = trans;

                    if (parentTransaction) {
                        // Emulate transaction commit awareness for inner transaction (must 'commit' when the inner transaction has no more operations ongoing)
                        trans.idbtrans = parentTransaction.idbtrans;
                    } else {
                        trans.create(); // Create the backend transaction so that complete() or error() will trigger even if no operation is made upon it.
                    }

                    // Provide arguments to the scope function (for backward compatibility)
                    var tableArgs = storeNames.map(function (name) {
                        return allTables[name];
                    });
                    tableArgs.push(trans);

                    var returnValue;
                    return Promise.follow(function () {
                        // Finally, call the scope function with our table and transaction arguments.
                        returnValue = scopeFunc.apply(trans, tableArgs); // NOTE: returnValue is used in trans.on.complete() not as a returnValue to this func.
                        if (returnValue) {
                            if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
                                // scopeFunc returned an iterator with throw-support. Handle yield as await.
                                returnValue = awaitIterator(returnValue);
                            } else if (typeof returnValue.then === 'function' && !hasOwn(returnValue, '_PSD')) {
                                throw new exceptions.IncompatiblePromise("Incompatible Promise returned from transaction scope (read more at http://tinyurl.com/znyqjqc). Transaction scope: " + scopeFunc.toString());
                            }
                        }
                    }).uncaught(dbUncaught).then(function () {
                        if (parentTransaction) trans._resolve(); // sub transactions don't react to idbtrans.oncomplete. We must trigger a acompletion.
                        return trans._completion; // Even if WE believe everything is fine. Await IDBTransaction's oncomplete or onerror as well.
                    }).then(function () {
                        return returnValue;
                    }).catch(function (e) {
                        //reject(e);
                        trans._reject(e); // Yes, above then-handler were maybe not called because of an unhandled rejection in scopeFunc!
                        return rejection(e);
                    });
                    //});
                });
            }));
        }
    };

    this.table = function (tableName) {
        /// <returns type="WriteableTable"></returns>
        if (fake && autoSchema) return new WriteableTable(tableName);
        if (!hasOwn(allTables, tableName)) {
            throw new exceptions.InvalidTable('Table ' + tableName + ' does not exist');
        }
        return allTables[tableName];
    };

    //
    //
    //
    // Table Class
    //
    //
    //
    function Table(name, tableSchema, collClass) {
        /// <param name="name" type="String"></param>
        this.name = name;
        this.schema = tableSchema;
        this.hook = allTables[name] ? allTables[name].hook : Events(null, {
            "creating": [hookCreatingChain, nop],
            "reading": [pureFunctionChain, mirror],
            "updating": [hookUpdatingChain, nop],
            "deleting": [hookDeletingChain, nop]
        });
        this._collClass = collClass || Collection;
    }

    props(Table.prototype, {

        //
        // Table Protected Methods
        //

        _trans: function getTransaction(mode, fn, writeLocked) {
            var trans = PSD.trans;
            return trans && trans.db === db ? trans._promise(mode, fn, writeLocked) : tempTransaction(mode, [this.name], fn);
        },
        _idbstore: function getIDBObjectStore(mode, fn, writeLocked) {
            if (fake) return new Promise(fn); // Simplify the work for Intellisense/Code completion.
            var trans = PSD.trans,
                tableName = this.name;
            function supplyIdbStore(resolve, reject, trans) {
                fn(resolve, reject, trans.idbtrans.objectStore(tableName), trans);
            }
            return trans && trans.db === db ? trans._promise(mode, supplyIdbStore, writeLocked) : tempTransaction(mode, [this.name], supplyIdbStore);
        },

        //
        // Table Public Methods
        //
        get: function (key, cb) {
            var self = this;
            return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                fake && resolve(self.schema.instanceTemplate);
                var req = idbstore.get(key);
                req.onerror = eventRejectHandler(reject);
                req.onsuccess = wrap(function () {
                    resolve(self.hook.reading.fire(req.result));
                }, reject);
            }).then(cb);
        },
        where: function (indexName) {
            return new WhereClause(this, indexName);
        },
        count: function (cb) {
            return this.toCollection().count(cb);
        },
        offset: function (offset) {
            return this.toCollection().offset(offset);
        },
        limit: function (numRows) {
            return this.toCollection().limit(numRows);
        },
        reverse: function () {
            return this.toCollection().reverse();
        },
        filter: function (filterFunction) {
            return this.toCollection().and(filterFunction);
        },
        each: function (fn) {
            return this.toCollection().each(fn);
        },
        toArray: function (cb) {
            return this.toCollection().toArray(cb);
        },
        orderBy: function (index) {
            return new this._collClass(new WhereClause(this, index));
        },

        toCollection: function () {
            return new this._collClass(new WhereClause(this));
        },

        mapToClass: function (constructor, structure) {
            /// <summary>
            ///     Map table to a javascript constructor function. Objects returned from the database will be instances of this class, making
            ///     it possible to the instanceOf operator as well as extending the class using constructor.prototype.method = function(){...}.
            /// </summary>
            /// <param name="constructor">Constructor function representing the class.</param>
            /// <param name="structure" optional="true">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
            /// know what type each member has. Example: {name: String, emailAddresses: [String], password}</param>
            this.schema.mappedClass = constructor;
            var instanceTemplate = Object.create(constructor.prototype);
            if (structure) {
                // structure and instanceTemplate is for IDE code competion only while constructor.prototype is for actual inheritance.
                applyStructure(instanceTemplate, structure);
            }
            this.schema.instanceTemplate = instanceTemplate;

            // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
            // no matter which method to use for reading (Table.get() or Table.where(...)... )
            var readHook = function (obj) {
                if (!obj) return obj; // No valid object. (Value is null). Return as is.
                // Create a new object that derives from constructor:
                var res = Object.create(constructor.prototype);
                // Clone members:
                for (var m in obj) {
                    if (hasOwn(obj, m)) try {
                        res[m] = obj[m];
                    } catch (_) {}
                }return res;
            };

            if (this.schema.readHook) {
                this.hook.reading.unsubscribe(this.schema.readHook);
            }
            this.schema.readHook = readHook;
            this.hook("reading", readHook);
            return constructor;
        },
        defineClass: function (structure) {
            /// <summary>
            ///     Define all members of the class that represents the table. This will help code completion of when objects are read from the database
            ///     as well as making it possible to extend the prototype of the returned constructor function.
            /// </summary>
            /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
            /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>
            return this.mapToClass(Dexie.defineClass(structure), structure);
        }
    });

    //
    //
    //
    // WriteableTable Class (extends Table)
    //
    //
    //
    function WriteableTable(name, tableSchema, collClass) {
        Table.call(this, name, tableSchema, collClass || WriteableCollection);
    }

    function BulkErrorHandlerCatchAll(errorList, done, supportHooks) {
        return (supportHooks ? hookedEventRejectHandler : eventRejectHandler)(function (e) {
            errorList.push(e);
            done && done();
        });
    }

    function bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook) {
        // If hasDeleteHook, keysOrTuples must be an array of tuples: [[key1, value2],[key2,value2],...],
        // else keysOrTuples must be just an array of keys: [key1, key2, ...].
        return new Promise(function (resolve, reject) {
            var len = keysOrTuples.length,
                lastItem = len - 1;
            if (len === 0) return resolve();
            if (!hasDeleteHook) {
                for (var i = 0; i < len; ++i) {
                    var req = idbstore.delete(keysOrTuples[i]);
                    req.onerror = wrap(eventRejectHandler(reject));
                    if (i === lastItem) req.onsuccess = wrap(function () {
                        return resolve();
                    });
                }
            } else {
                var hookCtx,
                    errorHandler = hookedEventRejectHandler(reject),
                    successHandler = hookedEventSuccessHandler(null);
                tryCatch(function () {
                    for (var i = 0; i < len; ++i) {
                        hookCtx = { onsuccess: null, onerror: null };
                        var tuple = keysOrTuples[i];
                        deletingHook.call(hookCtx, tuple[0], tuple[1], trans);
                        var req = idbstore.delete(tuple[0]);
                        req._hookCtx = hookCtx;
                        req.onerror = errorHandler;
                        if (i === lastItem) req.onsuccess = hookedEventSuccessHandler(resolve);else req.onsuccess = successHandler;
                    }
                }, function (err) {
                    hookCtx.onerror && hookCtx.onerror(err);
                    throw err;
                });
            }
        }).uncaught(dbUncaught);
    }

    derive(WriteableTable).from(Table).extend({
        bulkDelete: function (keys$$1) {
            if (this.hook.deleting.fire === nop) {
                return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                    resolve(bulkDelete(idbstore, trans, keys$$1, false, nop));
                });
            } else {
                return this.where(':id').anyOf(keys$$1).delete().then(function () {}); // Resolve with undefined.
            }
        },
        bulkPut: function (objects, keys$$1) {
            var _this = this;

            return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                if (!idbstore.keyPath && !_this.schema.primKey.auto && !keys$$1) throw new exceptions.InvalidArgument("bulkPut() with non-inbound keys requires keys array in second argument");
                if (idbstore.keyPath && keys$$1) throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
                if (keys$$1 && keys$$1.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                if (objects.length === 0) return resolve(); // Caller provided empty list.
                var done = function (result) {
                    if (errorList.length === 0) resolve(result);else reject(new BulkError(_this.name + '.bulkPut(): ' + errorList.length + ' of ' + numObjs + ' operations failed', errorList));
                };
                var req,
                    errorList = [],
                    errorHandler,
                    numObjs = objects.length,
                    table = _this;
                if (_this.hook.creating.fire === nop && _this.hook.updating.fire === nop) {
                    //
                    // Standard Bulk (no 'creating' or 'updating' hooks to care about)
                    //
                    errorHandler = BulkErrorHandlerCatchAll(errorList);
                    for (var i = 0, l = objects.length; i < l; ++i) {
                        req = keys$$1 ? idbstore.put(objects[i], keys$$1[i]) : idbstore.put(objects[i]);
                        req.onerror = errorHandler;
                    }
                    // Only need to catch success or error on the last operation
                    // according to the IDB spec.
                    req.onerror = BulkErrorHandlerCatchAll(errorList, done);
                    req.onsuccess = eventSuccessHandler(done);
                } else {
                    var effectiveKeys = keys$$1 || idbstore.keyPath && objects.map(function (o) {
                        return getByKeyPath(o, idbstore.keyPath);
                    });
                    // Generate map of {[key]: object}
                    var objectLookup = effectiveKeys && arrayToObject(effectiveKeys, function (key, i) {
                        return key != null && [key, objects[i]];
                    });
                    var promise = !effectiveKeys ?

                    // Auto-incremented key-less objects only without any keys argument.
                    table.bulkAdd(objects) :

                    // Keys provided. Either as inbound in provided objects, or as a keys argument.
                    // Begin with updating those that exists in DB:
                    table.where(':id').anyOf(effectiveKeys.filter(function (key) {
                        return key != null;
                    })).modify(function () {
                        this.value = objectLookup[this.primKey];
                        objectLookup[this.primKey] = null; // Mark as "don't add this"
                    }).catch(ModifyError, function (e) {
                        errorList = e.failures; // No need to concat here. These are the first errors added.
                    }).then(function () {
                        // Now, let's examine which items didnt exist so we can add them:
                        var objsToAdd = [],
                            keysToAdd = keys$$1 && [];
                        // Iterate backwards. Why? Because if same key was used twice, just add the last one.
                        for (var i = effectiveKeys.length - 1; i >= 0; --i) {
                            var key = effectiveKeys[i];
                            if (key == null || objectLookup[key]) {
                                objsToAdd.push(objects[i]);
                                keys$$1 && keysToAdd.push(key);
                                if (key != null) objectLookup[key] = null; // Mark as "dont add again"
                            }
                        }
                        // The items are in reverse order so reverse them before adding.
                        // Could be important in order to get auto-incremented keys the way the caller
                        // would expect. Could have used unshift instead of push()/reverse(),
                        // but: http://jsperf.com/unshift-vs-reverse
                        objsToAdd.reverse();
                        keys$$1 && keysToAdd.reverse();
                        return table.bulkAdd(objsToAdd, keysToAdd);
                    }).then(function (lastAddedKey) {
                        // Resolve with key of the last object in given arguments to bulkPut():
                        var lastEffectiveKey = effectiveKeys[effectiveKeys.length - 1]; // Key was provided.
                        return lastEffectiveKey != null ? lastEffectiveKey : lastAddedKey;
                    });

                    promise.then(done).catch(BulkError, function (e) {
                        // Concat failure from ModifyError and reject using our 'done' method.
                        errorList = errorList.concat(e.failures);
                        done();
                    }).catch(reject);
                }
            }, "locked"); // If called from transaction scope, lock transaction til all steps are done.
        },
        bulkAdd: function (objects, keys$$1) {
            var self = this,
                creatingHook = this.hook.creating.fire;
            return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                if (!idbstore.keyPath && !self.schema.primKey.auto && !keys$$1) throw new exceptions.InvalidArgument("bulkAdd() with non-inbound keys requires keys array in second argument");
                if (idbstore.keyPath && keys$$1) throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
                if (keys$$1 && keys$$1.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                if (objects.length === 0) return resolve(); // Caller provided empty list.
                function done(result) {
                    if (errorList.length === 0) resolve(result);else reject(new BulkError(self.name + '.bulkAdd(): ' + errorList.length + ' of ' + numObjs + ' operations failed', errorList));
                }
                var req,
                    errorList = [],
                    errorHandler,
                    successHandler,
                    numObjs = objects.length;
                if (creatingHook !== nop) {
                    //
                    // There are subscribers to hook('creating')
                    // Must behave as documented.
                    //
                    var keyPath = idbstore.keyPath,
                        hookCtx;
                    errorHandler = BulkErrorHandlerCatchAll(errorList, null, true);
                    successHandler = hookedEventSuccessHandler(null);

                    tryCatch(function () {
                        for (var i = 0, l = objects.length; i < l; ++i) {
                            hookCtx = { onerror: null, onsuccess: null };
                            var key = keys$$1 && keys$$1[i];
                            var obj = objects[i],
                                effectiveKey = keys$$1 ? key : keyPath ? getByKeyPath(obj, keyPath) : undefined,
                                keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans);
                            if (effectiveKey == null && keyToUse != null) {
                                if (keyPath) {
                                    obj = deepClone(obj);
                                    setByKeyPath(obj, keyPath, keyToUse);
                                } else {
                                    key = keyToUse;
                                }
                            }
                            req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
                            req._hookCtx = hookCtx;
                            if (i < l - 1) {
                                req.onerror = errorHandler;
                                if (hookCtx.onsuccess) req.onsuccess = successHandler;
                            }
                        }
                    }, function (err) {
                        hookCtx.onerror && hookCtx.onerror(err);
                        throw err;
                    });

                    req.onerror = BulkErrorHandlerCatchAll(errorList, done, true);
                    req.onsuccess = hookedEventSuccessHandler(done);
                } else {
                    //
                    // Standard Bulk (no 'creating' hook to care about)
                    //
                    errorHandler = BulkErrorHandlerCatchAll(errorList);
                    for (var i = 0, l = objects.length; i < l; ++i) {
                        req = keys$$1 ? idbstore.add(objects[i], keys$$1[i]) : idbstore.add(objects[i]);
                        req.onerror = errorHandler;
                    }
                    // Only need to catch success or error on the last operation
                    // according to the IDB spec.
                    req.onerror = BulkErrorHandlerCatchAll(errorList, done);
                    req.onsuccess = eventSuccessHandler(done);
                }
            });
        },
        add: function (obj, key) {
            /// <summary>
            ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
            /// </summary>
            /// <param name="obj" type="Object">A javascript object to insert</param>
            /// <param name="key" optional="true">Primary key</param>
            var creatingHook = this.hook.creating.fire;
            return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                var hookCtx = { onsuccess: null, onerror: null };
                if (creatingHook !== nop) {
                    var effectiveKey = key != null ? key : idbstore.keyPath ? getByKeyPath(obj, idbstore.keyPath) : undefined;
                    var keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.
                    if (effectiveKey == null && keyToUse != null) {
                        // Using "==" and "!=" to check for either null or undefined!
                        if (idbstore.keyPath) setByKeyPath(obj, idbstore.keyPath, keyToUse);else key = keyToUse;
                    }
                }
                try {
                    var req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
                    req._hookCtx = hookCtx;
                    req.onerror = hookedEventRejectHandler(reject);
                    req.onsuccess = hookedEventSuccessHandler(function (result) {
                        // TODO: Remove these two lines in next major release (2.0?)
                        // It's no good practice to have side effects on provided parameters
                        var keyPath = idbstore.keyPath;
                        if (keyPath) setByKeyPath(obj, keyPath, result);
                        resolve(result);
                    });
                } catch (e) {
                    if (hookCtx.onerror) hookCtx.onerror(e);
                    throw e;
                }
            });
        },

        put: function (obj, key) {
            /// <summary>
            ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
            /// </summary>
            /// <param name="obj" type="Object">A javascript object to insert or update</param>
            /// <param name="key" optional="true">Primary key</param>
            var self = this,
                creatingHook = this.hook.creating.fire,
                updatingHook = this.hook.updating.fire;
            if (creatingHook !== nop || updatingHook !== nop) {
                //
                // People listens to when("creating") or when("updating") events!
                // We must know whether the put operation results in an CREATE or UPDATE.
                //
                return this._trans(READWRITE, function (resolve, reject, trans) {
                    // Since key is optional, make sure we get it from obj if not provided
                    var effectiveKey = key !== undefined ? key : self.schema.primKey.keyPath && getByKeyPath(obj, self.schema.primKey.keyPath);
                    if (effectiveKey == null) {
                        // "== null" means checking for either null or undefined.
                        // No primary key. Must use add().
                        self.add(obj).then(resolve, reject);
                    } else {
                        // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
                        trans._lock(); // Needed because operation is splitted into modify() and add().
                        // clone obj before this async call. If caller modifies obj the line after put(), the IDB spec requires that it should not affect operation.
                        obj = deepClone(obj);
                        self.where(":id").equals(effectiveKey).modify(function () {
                            // Replace extisting value with our object
                            // CRUD event firing handled in WriteableCollection.modify()
                            this.value = obj;
                        }).then(function (count) {
                            if (count === 0) {
                                // Object's key was not found. Add the object instead.
                                // CRUD event firing will be done in add()
                                return self.add(obj, key); // Resolving with another Promise. Returned Promise will then resolve with the new key.
                            } else {
                                return effectiveKey; // Resolve with the provided key.
                            }
                        }).finally(function () {
                            trans._unlock();
                        }).then(resolve, reject);
                    }
                });
            } else {
                // Use the standard IDB put() method.
                return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                    var req = key !== undefined ? idbstore.put(obj, key) : idbstore.put(obj);
                    req.onerror = eventRejectHandler(reject);
                    req.onsuccess = function (ev) {
                        var keyPath = idbstore.keyPath;
                        if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
                        resolve(req.result);
                    };
                });
            }
        },

        'delete': function (key) {
            /// <param name="key">Primary key of the object to delete</param>
            if (this.hook.deleting.subscribers.length) {
                // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
                // call the CRUD event. Only WriteableCollection.delete() will know whether an object was actually deleted.
                return this.where(":id").equals(key).delete();
            } else {
                // No one listens. Use standard IDB delete() method.
                return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                    var req = idbstore.delete(key);
                    req.onerror = eventRejectHandler(reject);
                    req.onsuccess = function () {
                        resolve(req.result);
                    };
                });
            }
        },

        clear: function () {
            if (this.hook.deleting.subscribers.length) {
                // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
                // call the CRUD event. Only WriteableCollection.delete() will knows which objects that are actually deleted.
                return this.toCollection().delete();
            } else {
                return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                    var req = idbstore.clear();
                    req.onerror = eventRejectHandler(reject);
                    req.onsuccess = function () {
                        resolve(req.result);
                    };
                });
            }
        },

        update: function (keyOrObject, modifications) {
            if (typeof modifications !== 'object' || isArray(modifications)) throw new exceptions.InvalidArgument("Modifications must be an object.");
            if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
                // object to modify. Also modify given object with the modifications:
                keys(modifications).forEach(function (keyPath) {
                    setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
                });
                var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
                if (key === undefined) return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"), dbUncaught);
                return this.where(":id").equals(key).modify(modifications);
            } else {
                // key to modify
                return this.where(":id").equals(keyOrObject).modify(modifications);
            }
        }
    });

    //
    //
    //
    // Transaction Class
    //
    //
    //
    function Transaction(mode, storeNames, dbschema, parent) {
        var _this2 = this;

        /// <summary>
        ///    Transaction class. Represents a database transaction. All operations on db goes through a Transaction.
        /// </summary>
        /// <param name="mode" type="String">Any of "readwrite" or "readonly"</param>
        /// <param name="storeNames" type="Array">Array of table names to operate on</param>
        this.db = db;
        this.mode = mode;
        this.storeNames = storeNames;
        this.idbtrans = null;
        this.on = Events(this, "complete", "error", "abort");
        this.parent = parent || null;
        this.active = true;
        this._tables = null;
        this._reculock = 0;
        this._blockedFuncs = [];
        this._psd = null;
        this._dbschema = dbschema;
        this._resolve = null;
        this._reject = null;
        this._completion = new Promise(function (resolve, reject) {
            _this2._resolve = resolve;
            _this2._reject = reject;
        }).uncaught(dbUncaught);

        this._completion.then(function () {
            _this2.on.complete.fire();
        }, function (e) {
            _this2.on.error.fire(e);
            _this2.parent ? _this2.parent._reject(e) : _this2.active && _this2.idbtrans && _this2.idbtrans.abort();
            _this2.active = false;
            return rejection(e); // Indicate we actually DO NOT catch this error.
        });
    }

    props(Transaction.prototype, {
        //
        // Transaction Protected Methods (not required by API users, but needed internally and eventually by dexie extensions)
        //
        _lock: function () {
            assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
            // Temporary set all requests into a pending queue if they are called before database is ready.
            ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)
            if (this._reculock === 1 && !PSD.global) PSD.lockOwnerFor = this;
            return this;
        },
        _unlock: function () {
            assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
            if (--this._reculock === 0) {
                if (!PSD.global) PSD.lockOwnerFor = null;
                while (this._blockedFuncs.length > 0 && !this._locked()) {
                    var fnAndPSD = this._blockedFuncs.shift();
                    try {
                        usePSD(fnAndPSD[1], fnAndPSD[0]);
                    } catch (e) {}
                }
            }
            return this;
        },
        _locked: function () {
            // Checks if any write-lock is applied on this transaction.
            // To simplify the Dexie API for extension implementations, we support recursive locks.
            // This is accomplished by using "Promise Specific Data" (PSD).
            // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
            // PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
            //         * callback given to the Promise() constructor  (function (resolve, reject){...})
            //         * callbacks given to then()/catch()/finally() methods (function (value){...})
            // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
            // Derivation is done so that the inner PSD __proto__ points to the outer PSD.
            // PSD.lockOwnerFor will point to current transaction object if the currently executing PSD scope owns the lock.
            return this._reculock && PSD.lockOwnerFor !== this;
        },
        create: function (idbtrans) {
            var _this3 = this;

            assert(!this.idbtrans);
            if (!idbtrans && !idbdb) {
                switch (dbOpenError && dbOpenError.name) {
                    case "DatabaseClosedError":
                        // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
                        throw new exceptions.DatabaseClosed(dbOpenError);
                    case "MissingAPIError":
                        // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
                        throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
                    default:
                        // Make it clear that the user operation was not what caused the error - the error had occurred earlier on db.open()!
                        throw new exceptions.OpenFailed(dbOpenError);
                }
            }
            if (!this.active) throw new exceptions.TransactionInactive();
            assert(this._completion._state === null);

            idbtrans = this.idbtrans = idbtrans || idbdb.transaction(safariMultiStoreFix(this.storeNames), this.mode);
            idbtrans.onerror = wrap(function (ev) {
                preventDefault(ev); // Prohibit default bubbling to window.error
                _this3._reject(idbtrans.error);
            });
            idbtrans.onabort = wrap(function (ev) {
                preventDefault(ev);
                _this3.active && _this3._reject(new exceptions.Abort());
                _this3.active = false;
                _this3.on("abort").fire(ev);
            });
            idbtrans.oncomplete = wrap(function () {
                _this3.active = false;
                _this3._resolve();
            });
            return this;
        },
        _promise: function (mode, fn, bWriteLock) {
            var self = this;
            var p = self._locked() ?
            // Read lock always. Transaction is write-locked. Wait for mutex.
            new Promise(function (resolve, reject) {
                self._blockedFuncs.push([function () {
                    self._promise(mode, fn, bWriteLock).then(resolve, reject);
                }, PSD]);
            }) : newScope(function () {
                var p_ = self.active ? new Promise(function (resolve, reject) {
                    if (mode === READWRITE && self.mode !== READWRITE) throw new exceptions.ReadOnly("Transaction is readonly");
                    if (!self.idbtrans && mode) self.create();
                    if (bWriteLock) self._lock(); // Write lock if write operation is requested
                    fn(resolve, reject, self);
                }) : rejection(new exceptions.TransactionInactive());
                if (self.active && bWriteLock) p_.finally(function () {
                    self._unlock();
                });
                return p_;
            });

            p._lib = true;
            return p.uncaught(dbUncaught);
        },

        //
        // Transaction Public Properties and Methods
        //
        abort: function () {
            this.active && this._reject(new exceptions.Abort());
            this.active = false;
        },

        tables: {
            get: deprecated("Transaction.tables", function () {
                return arrayToObject(this.storeNames, function (name) {
                    return [name, allTables[name]];
                });
            }, "Use db.tables()")
        },

        complete: deprecated("Transaction.complete()", function (cb) {
            return this.on("complete", cb);
        }),

        error: deprecated("Transaction.error()", function (cb) {
            return this.on("error", cb);
        }),

        table: deprecated("Transaction.table()", function (name) {
            if (this.storeNames.indexOf(name) === -1) throw new exceptions.InvalidTable("Table " + name + " not in transaction");
            return allTables[name];
        })

    });

    //
    //
    //
    // WhereClause
    //
    //
    //
    function WhereClause(table, index, orCollection) {
        /// <param name="table" type="Table"></param>
        /// <param name="index" type="String" optional="true"></param>
        /// <param name="orCollection" type="Collection" optional="true"></param>
        this._ctx = {
            table: table,
            index: index === ":id" ? null : index,
            collClass: table._collClass,
            or: orCollection
        };
    }

    props(WhereClause.prototype, function () {

        // WhereClause private methods

        function fail(collectionOrWhereClause, err, T) {
            var collection = collectionOrWhereClause instanceof WhereClause ? new collectionOrWhereClause._ctx.collClass(collectionOrWhereClause) : collectionOrWhereClause;

            collection._ctx.error = T ? new T(err) : new TypeError(err);
            return collection;
        }

        function emptyCollection(whereClause) {
            return new whereClause._ctx.collClass(whereClause, function () {
                return IDBKeyRange.only("");
            }).limit(0);
        }

        function upperFactory(dir) {
            return dir === "next" ? function (s) {
                return s.toUpperCase();
            } : function (s) {
                return s.toLowerCase();
            };
        }
        function lowerFactory(dir) {
            return dir === "next" ? function (s) {
                return s.toLowerCase();
            } : function (s) {
                return s.toUpperCase();
            };
        }
        function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
            var length = Math.min(key.length, lowerNeedle.length);
            var llp = -1;
            for (var i = 0; i < length; ++i) {
                var lwrKeyChar = lowerKey[i];
                if (lwrKeyChar !== lowerNeedle[i]) {
                    if (cmp(key[i], upperNeedle[i]) < 0) return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
                    if (cmp(key[i], lowerNeedle[i]) < 0) return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
                    if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
                    return null;
                }
                if (cmp(key[i], lwrKeyChar) < 0) llp = i;
            }
            if (length < lowerNeedle.length && dir === "next") return key + upperNeedle.substr(key.length);
            if (length < key.length && dir === "prev") return key.substr(0, upperNeedle.length);
            return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
        }

        function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
            /// <param name="needles" type="Array" elementType="String"></param>
            var upper,
                lower,
                compare,
                upperNeedles,
                lowerNeedles,
                direction,
                nextKeySuffix,
                needlesLen = needles.length;
            if (!needles.every(function (s) {
                return typeof s === 'string';
            })) {
                return fail(whereClause, STRING_EXPECTED);
            }
            function initDirection(dir) {
                upper = upperFactory(dir);
                lower = lowerFactory(dir);
                compare = dir === "next" ? simpleCompare : simpleCompareReverse;
                var needleBounds = needles.map(function (needle) {
                    return { lower: lower(needle), upper: upper(needle) };
                }).sort(function (a, b) {
                    return compare(a.lower, b.lower);
                });
                upperNeedles = needleBounds.map(function (nb) {
                    return nb.upper;
                });
                lowerNeedles = needleBounds.map(function (nb) {
                    return nb.lower;
                });
                direction = dir;
                nextKeySuffix = dir === "next" ? "" : suffix;
            }
            initDirection("next");

            var c = new whereClause._ctx.collClass(whereClause, function () {
                return IDBKeyRange.bound(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
            });

            c._ondirectionchange = function (direction) {
                // This event onlys occur before filter is called the first time.
                initDirection(direction);
            };

            var firstPossibleNeedle = 0;

            c._addAlgorithm(function (cursor, advance, resolve) {
                /// <param name="cursor" type="IDBCursor"></param>
                /// <param name="advance" type="Function"></param>
                /// <param name="resolve" type="Function"></param>
                var key = cursor.key;
                if (typeof key !== 'string') return false;
                var lowerKey = lower(key);
                if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
                    return true;
                } else {
                    var lowestPossibleCasing = null;
                    for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
                        var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
                        if (casing === null && lowestPossibleCasing === null) firstPossibleNeedle = i + 1;else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                            lowestPossibleCasing = casing;
                        }
                    }
                    if (lowestPossibleCasing !== null) {
                        advance(function () {
                            cursor.continue(lowestPossibleCasing + nextKeySuffix);
                        });
                    } else {
                        advance(resolve);
                    }
                    return false;
                }
            });
            return c;
        }

        //
        // WhereClause public methods
        //
        return {
            between: function (lower, upper, includeLower, includeUpper) {
                /// <summary>
                ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
                /// </summary>
                /// <param name="lower"></param>
                /// <param name="upper"></param>
                /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
                /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
                /// <returns type="Collection"></returns>
                includeLower = includeLower !== false; // Default to true
                includeUpper = includeUpper === true; // Default to false
                try {
                    if (cmp(lower, upper) > 0 || cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)) return emptyCollection(this); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.
                    return new this._ctx.collClass(this, function () {
                        return IDBKeyRange.bound(lower, upper, !includeLower, !includeUpper);
                    });
                } catch (e) {
                    return fail(this, INVALID_KEY_ARGUMENT);
                }
            },
            equals: function (value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.only(value);
                });
            },
            above: function (value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.lowerBound(value, true);
                });
            },
            aboveOrEqual: function (value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.lowerBound(value);
                });
            },
            below: function (value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.upperBound(value, true);
                });
            },
            belowOrEqual: function (value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.upperBound(value);
                });
            },
            startsWith: function (str) {
                /// <param name="str" type="String"></param>
                if (typeof str !== 'string') return fail(this, STRING_EXPECTED);
                return this.between(str, str + maxString, true, true);
            },
            startsWithIgnoreCase: function (str) {
                /// <param name="str" type="String"></param>
                if (str === "") return this.startsWith(str);
                return addIgnoreCaseAlgorithm(this, function (x, a) {
                    return x.indexOf(a[0]) === 0;
                }, [str], maxString);
            },
            equalsIgnoreCase: function (str) {
                /// <param name="str" type="String"></param>
                return addIgnoreCaseAlgorithm(this, function (x, a) {
                    return x === a[0];
                }, [str], "");
            },
            anyOfIgnoreCase: function () {
                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                if (set.length === 0) return emptyCollection(this);
                return addIgnoreCaseAlgorithm(this, function (x, a) {
                    return a.indexOf(x) !== -1;
                }, set, "");
            },
            startsWithAnyOfIgnoreCase: function () {
                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                if (set.length === 0) return emptyCollection(this);
                return addIgnoreCaseAlgorithm(this, function (x, a) {
                    return a.some(function (n) {
                        return x.indexOf(n) === 0;
                    });
                }, set, maxString);
            },
            anyOf: function () {
                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                var compare = ascending;
                try {
                    set.sort(compare);
                } catch (e) {
                    return fail(this, INVALID_KEY_ARGUMENT);
                }
                if (set.length === 0) return emptyCollection(this);
                var c = new this._ctx.collClass(this, function () {
                    return IDBKeyRange.bound(set[0], set[set.length - 1]);
                });

                c._ondirectionchange = function (direction) {
                    compare = direction === "next" ? ascending : descending;
                    set.sort(compare);
                };
                var i = 0;
                c._addAlgorithm(function (cursor, advance, resolve) {
                    var key = cursor.key;
                    while (compare(key, set[i]) > 0) {
                        // The cursor has passed beyond this key. Check next.
                        ++i;
                        if (i === set.length) {
                            // There is no next. Stop searching.
                            advance(resolve);
                            return false;
                        }
                    }
                    if (compare(key, set[i]) === 0) {
                        // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                        return true;
                    } else {
                        // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                        advance(function () {
                            cursor.continue(set[i]);
                        });
                        return false;
                    }
                });
                return c;
            },

            notEqual: function (value) {
                return this.inAnyRange([[-Infinity, value], [value, maxKey]], { includeLowers: false, includeUppers: false });
            },

            noneOf: function () {
                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                if (set.length === 0) return new this._ctx.collClass(this); // Return entire collection.
                try {
                    set.sort(ascending);
                } catch (e) {
                    return fail(this, INVALID_KEY_ARGUMENT);
                }
                // Transform ["a","b","c"] to a set of ranges for between/above/below: [[-Infinity,"a"], ["a","b"], ["b","c"], ["c",maxKey]]
                var ranges = set.reduce(function (res, val) {
                    return res ? res.concat([[res[res.length - 1][1], val]]) : [[-Infinity, val]];
                }, null);
                ranges.push([set[set.length - 1], maxKey]);
                return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
            },

            /** Filter out values withing given set of ranges.
            * Example, give children and elders a rebate of 50%:
            *
            *   db.friends.where('age').inAnyRange([[0,18],[65,Infinity]]).modify({Rebate: 1/2});
            *
            * @param {(string|number|Date|Array)[][]} ranges
            * @param {{includeLowers: boolean, includeUppers: boolean}} options
            */
            inAnyRange: function (ranges, options) {
                var ctx = this._ctx;
                if (ranges.length === 0) return emptyCollection(this);
                if (!ranges.every(function (range) {
                    return range[0] !== undefined && range[1] !== undefined && ascending(range[0], range[1]) <= 0;
                })) {
                    return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
                }
                var includeLowers = !options || options.includeLowers !== false; // Default to true
                var includeUppers = options && options.includeUppers === true; // Default to false

                function addRange(ranges, newRange) {
                    for (var i = 0, l = ranges.length; i < l; ++i) {
                        var range = ranges[i];
                        if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
                            range[0] = min(range[0], newRange[0]);
                            range[1] = max(range[1], newRange[1]);
                            break;
                        }
                    }
                    if (i === l) ranges.push(newRange);
                    return ranges;
                }

                var sortDirection = ascending;
                function rangeSorter(a, b) {
                    return sortDirection(a[0], b[0]);
                }

                // Join overlapping ranges
                var set;
                try {
                    set = ranges.reduce(addRange, []);
                    set.sort(rangeSorter);
                } catch (ex) {
                    return fail(this, INVALID_KEY_ARGUMENT);
                }

                var i = 0;
                var keyIsBeyondCurrentEntry = includeUppers ? function (key) {
                    return ascending(key, set[i][1]) > 0;
                } : function (key) {
                    return ascending(key, set[i][1]) >= 0;
                };

                var keyIsBeforeCurrentEntry = includeLowers ? function (key) {
                    return descending(key, set[i][0]) > 0;
                } : function (key) {
                    return descending(key, set[i][0]) >= 0;
                };

                function keyWithinCurrentRange(key) {
                    return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
                }

                var checkKey = keyIsBeyondCurrentEntry;

                var c = new ctx.collClass(this, function () {
                    return IDBKeyRange.bound(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
                });

                c._ondirectionchange = function (direction) {
                    if (direction === "next") {
                        checkKey = keyIsBeyondCurrentEntry;
                        sortDirection = ascending;
                    } else {
                        checkKey = keyIsBeforeCurrentEntry;
                        sortDirection = descending;
                    }
                    set.sort(rangeSorter);
                };

                c._addAlgorithm(function (cursor, advance, resolve) {
                    var key = cursor.key;
                    while (checkKey(key)) {
                        // The cursor has passed beyond this key. Check next.
                        ++i;
                        if (i === set.length) {
                            // There is no next. Stop searching.
                            advance(resolve);
                            return false;
                        }
                    }
                    if (keyWithinCurrentRange(key)) {
                        // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                        return true;
                    } else if (cmp(key, set[i][1]) === 0 || cmp(key, set[i][0]) === 0) {
                        // includeUpper or includeLower is false so keyWithinCurrentRange() returns false even though we are at range border.
                        // Continue to next key but don't include this one.
                        return false;
                    } else {
                        // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                        advance(function () {
                            if (sortDirection === ascending) cursor.continue(set[i][0]);else cursor.continue(set[i][1]);
                        });
                        return false;
                    }
                });
                return c;
            },
            startsWithAnyOf: function () {
                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);

                if (!set.every(function (s) {
                    return typeof s === 'string';
                })) {
                    return fail(this, "startsWithAnyOf() only works with strings");
                }
                if (set.length === 0) return emptyCollection(this);

                return this.inAnyRange(set.map(function (str) {
                    return [str, str + maxString];
                }));
            }
        };
    });

    //
    //
    //
    // Collection Class
    //
    //
    //
    function Collection(whereClause, keyRangeGenerator) {
        /// <summary>
        ///
        /// </summary>
        /// <param name="whereClause" type="WhereClause">Where clause instance</param>
        /// <param name="keyRangeGenerator" value="function(){ return IDBKeyRange.bound(0,1);}" optional="true"></param>
        var keyRange = null,
            error = null;
        if (keyRangeGenerator) try {
            keyRange = keyRangeGenerator();
        } catch (ex) {
            error = ex;
        }

        var whereCtx = whereClause._ctx,
            table = whereCtx.table;
        this._ctx = {
            table: table,
            index: whereCtx.index,
            isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
            range: keyRange,
            keysOnly: false,
            dir: "next",
            unique: "",
            algorithm: null,
            filter: null,
            replayFilter: null,
            justLimit: true, // True if a replayFilter is just a filter that performs a "limit" operation (or none at all)
            isMatch: null,
            offset: 0,
            limit: Infinity,
            error: error, // If set, any promise must be rejected with this error
            or: whereCtx.or,
            valueMapper: table.hook.reading.fire
        };
    }

    function isPlainKeyRange(ctx, ignoreLimitFilter) {
        return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
    }

    props(Collection.prototype, function () {

        //
        // Collection Private Functions
        //

        function addFilter(ctx, fn) {
            ctx.filter = combine(ctx.filter, fn);
        }

        function addReplayFilter(ctx, factory, isLimitFilter) {
            var curr = ctx.replayFilter;
            ctx.replayFilter = curr ? function () {
                return combine(curr(), factory());
            } : factory;
            ctx.justLimit = isLimitFilter && !curr;
        }

        function addMatchFilter(ctx, fn) {
            ctx.isMatch = combine(ctx.isMatch, fn);
        }

        /** @param ctx {
         *      isPrimKey: boolean,
         *      table: Table,
         *      index: string
         * }
         * @param store IDBObjectStore
         **/
        function getIndexOrStore(ctx, store) {
            if (ctx.isPrimKey) return store;
            var indexSpec = ctx.table.schema.idxByName[ctx.index];
            if (!indexSpec) throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + store.name + " is not indexed");
            return store.index(indexSpec.name);
        }

        /** @param ctx {
         *      isPrimKey: boolean,
         *      table: Table,
         *      index: string,
         *      keysOnly: boolean,
         *      range?: IDBKeyRange,
         *      dir: "next" | "prev"
         * }
         */
        function openCursor(ctx, store) {
            var idxOrStore = getIndexOrStore(ctx, store);
            return ctx.keysOnly && 'openKeyCursor' in idxOrStore ? idxOrStore.openKeyCursor(ctx.range || null, ctx.dir + ctx.unique) : idxOrStore.openCursor(ctx.range || null, ctx.dir + ctx.unique);
        }

        function iter(ctx, fn, resolve, reject, idbstore) {
            var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
            if (!ctx.or) {
                iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, filter), fn, resolve, reject, !ctx.keysOnly && ctx.valueMapper);
            } else (function () {
                var set = {};
                var resolved = 0;

                function resolveboth() {
                    if (++resolved === 2) resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
                }

                function union(item, cursor, advance) {
                    if (!filter || filter(cursor, advance, resolveboth, reject)) {
                        var key = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
                        if (!hasOwn(set, key)) {
                            set[key] = true;
                            fn(item, cursor, advance);
                        }
                    }
                }

                ctx.or._iterate(union, resolveboth, reject, idbstore);
                iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, !ctx.keysOnly && ctx.valueMapper);
            })();
        }
        function getInstanceTemplate(ctx) {
            return ctx.table.schema.instanceTemplate;
        }

        return {

            //
            // Collection Protected Functions
            //

            _read: function (fn, cb) {
                var ctx = this._ctx;
                if (ctx.error) return ctx.table._trans(null, function rejector(resolve, reject) {
                    reject(ctx.error);
                });else return ctx.table._idbstore(READONLY, fn).then(cb);
            },
            _write: function (fn) {
                var ctx = this._ctx;
                if (ctx.error) return ctx.table._trans(null, function rejector(resolve, reject) {
                    reject(ctx.error);
                });else return ctx.table._idbstore(READWRITE, fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
            },
            _addAlgorithm: function (fn) {
                var ctx = this._ctx;
                ctx.algorithm = combine(ctx.algorithm, fn);
            },

            _iterate: function (fn, resolve, reject, idbstore) {
                return iter(this._ctx, fn, resolve, reject, idbstore);
            },

            clone: function (props$$1) {
                var rv = Object.create(this.constructor.prototype),
                    ctx = Object.create(this._ctx);
                if (props$$1) extend(ctx, props$$1);
                rv._ctx = ctx;
                return rv;
            },

            raw: function () {
                this._ctx.valueMapper = null;
                return this;
            },

            //
            // Collection Public methods
            //

            each: function (fn) {
                var ctx = this._ctx;

                if (fake) {
                    var item = getInstanceTemplate(ctx),
                        primKeyPath = ctx.table.schema.primKey.keyPath,
                        key = getByKeyPath(item, ctx.index ? ctx.table.schema.idxByName[ctx.index].keyPath : primKeyPath),
                        primaryKey = getByKeyPath(item, primKeyPath);
                    fn(item, { key: key, primaryKey: primaryKey });
                }

                return this._read(function (resolve, reject, idbstore) {
                    iter(ctx, fn, resolve, reject, idbstore);
                });
            },

            count: function (cb) {
                if (fake) return Promise.resolve(0).then(cb);
                var ctx = this._ctx;

                if (isPlainKeyRange(ctx, true)) {
                    // This is a plain key range. We can use the count() method if the index.
                    return this._read(function (resolve, reject, idbstore) {
                        var idx = getIndexOrStore(ctx, idbstore);
                        var req = ctx.range ? idx.count(ctx.range) : idx.count();
                        req.onerror = eventRejectHandler(reject);
                        req.onsuccess = function (e) {
                            resolve(Math.min(e.target.result, ctx.limit));
                        };
                    }, cb);
                } else {
                    // Algorithms, filters or expressions are applied. Need to count manually.
                    var count = 0;
                    return this._read(function (resolve, reject, idbstore) {
                        iter(ctx, function () {
                            ++count;return false;
                        }, function () {
                            resolve(count);
                        }, reject, idbstore);
                    }, cb);
                }
            },

            sortBy: function (keyPath, cb) {
                /// <param name="keyPath" type="String"></param>
                var parts = keyPath.split('.').reverse(),
                    lastPart = parts[0],
                    lastIndex = parts.length - 1;
                function getval(obj, i) {
                    if (i) return getval(obj[parts[i]], i - 1);
                    return obj[lastPart];
                }
                var order = this._ctx.dir === "next" ? 1 : -1;

                function sorter(a, b) {
                    var aVal = getval(a, lastIndex),
                        bVal = getval(b, lastIndex);
                    return aVal < bVal ? -order : aVal > bVal ? order : 0;
                }
                return this.toArray(function (a) {
                    return a.sort(sorter);
                }).then(cb);
            },

            toArray: function (cb) {
                var ctx = this._ctx;
                return this._read(function (resolve, reject, idbstore) {
                    fake && resolve([getInstanceTemplate(ctx)]);
                    if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                        // Special optimation if we could use IDBObjectStore.getAll() or
                        // IDBKeyRange.getAll():
                        var readingHook = ctx.table.hook.reading.fire;
                        var idxOrStore = getIndexOrStore(ctx, idbstore);
                        var req = ctx.limit < Infinity ? idxOrStore.getAll(ctx.range, ctx.limit) : idxOrStore.getAll(ctx.range);
                        req.onerror = eventRejectHandler(reject);
                        req.onsuccess = readingHook === mirror ? eventSuccessHandler(resolve) : wrap(eventSuccessHandler(function (res) {
                            try {
                                resolve(res.map(readingHook));
                            } catch (e) {
                                reject(e);
                            }
                        }));
                    } else {
                        // Getting array through a cursor.
                        var a = [];
                        iter(ctx, function (item) {
                            a.push(item);
                        }, function arrayComplete() {
                            resolve(a);
                        }, reject, idbstore);
                    }
                }, cb);
            },

            offset: function (offset) {
                var ctx = this._ctx;
                if (offset <= 0) return this;
                ctx.offset += offset; // For count()
                if (isPlainKeyRange(ctx)) {
                    addReplayFilter(ctx, function () {
                        var offsetLeft = offset;
                        return function (cursor, advance) {
                            if (offsetLeft === 0) return true;
                            if (offsetLeft === 1) {
                                --offsetLeft;return false;
                            }
                            advance(function () {
                                cursor.advance(offsetLeft);
                                offsetLeft = 0;
                            });
                            return false;
                        };
                    });
                } else {
                    addReplayFilter(ctx, function () {
                        var offsetLeft = offset;
                        return function () {
                            return --offsetLeft < 0;
                        };
                    });
                }
                return this;
            },

            limit: function (numRows) {
                this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()
                addReplayFilter(this._ctx, function () {
                    var rowsLeft = numRows;
                    return function (cursor, advance, resolve) {
                        if (--rowsLeft <= 0) advance(resolve); // Stop after this item has been included
                        return rowsLeft >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
                    };
                }, true);
                return this;
            },

            until: function (filterFunction, bIncludeStopEntry) {
                var ctx = this._ctx;
                fake && filterFunction(getInstanceTemplate(ctx));
                addFilter(this._ctx, function (cursor, advance, resolve) {
                    if (filterFunction(cursor.value)) {
                        advance(resolve);
                        return bIncludeStopEntry;
                    } else {
                        return true;
                    }
                });
                return this;
            },

            first: function (cb) {
                return this.limit(1).toArray(function (a) {
                    return a[0];
                }).then(cb);
            },

            last: function (cb) {
                return this.reverse().first(cb);
            },

            filter: function (filterFunction) {
                /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
                fake && filterFunction(getInstanceTemplate(this._ctx));
                addFilter(this._ctx, function (cursor) {
                    return filterFunction(cursor.value);
                });
                // match filters not used in Dexie.js but can be used by 3rd part libraries to test a
                // collection for a match without querying DB. Used by Dexie.Observable.
                addMatchFilter(this._ctx, filterFunction);
                return this;
            },

            and: function (filterFunction) {
                return this.filter(filterFunction);
            },

            or: function (indexName) {
                return new WhereClause(this._ctx.table, indexName, this);
            },

            reverse: function () {
                this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
                if (this._ondirectionchange) this._ondirectionchange(this._ctx.dir);
                return this;
            },

            desc: function () {
                return this.reverse();
            },

            eachKey: function (cb) {
                var ctx = this._ctx;
                ctx.keysOnly = !ctx.isMatch;
                return this.each(function (val, cursor) {
                    cb(cursor.key, cursor);
                });
            },

            eachUniqueKey: function (cb) {
                this._ctx.unique = "unique";
                return this.eachKey(cb);
            },

            eachPrimaryKey: function (cb) {
                var ctx = this._ctx;
                ctx.keysOnly = !ctx.isMatch;
                return this.each(function (val, cursor) {
                    cb(cursor.primaryKey, cursor);
                });
            },

            keys: function (cb) {
                var ctx = this._ctx;
                ctx.keysOnly = !ctx.isMatch;
                var a = [];
                return this.each(function (item, cursor) {
                    a.push(cursor.key);
                }).then(function () {
                    return a;
                }).then(cb);
            },

            primaryKeys: function (cb) {
                var ctx = this._ctx;
                if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                    // Special optimation if we could use IDBObjectStore.getAllKeys() or
                    // IDBKeyRange.getAllKeys():
                    return this._read(function (resolve, reject, idbstore) {
                        var idxOrStore = getIndexOrStore(ctx, idbstore);
                        var req = ctx.limit < Infinity ? idxOrStore.getAllKeys(ctx.range, ctx.limit) : idxOrStore.getAllKeys(ctx.range);
                        req.onerror = eventRejectHandler(reject);
                        req.onsuccess = eventSuccessHandler(resolve);
                    }).then(cb);
                }
                ctx.keysOnly = !ctx.isMatch;
                var a = [];
                return this.each(function (item, cursor) {
                    a.push(cursor.primaryKey);
                }).then(function () {
                    return a;
                }).then(cb);
            },

            uniqueKeys: function (cb) {
                this._ctx.unique = "unique";
                return this.keys(cb);
            },

            firstKey: function (cb) {
                return this.limit(1).keys(function (a) {
                    return a[0];
                }).then(cb);
            },

            lastKey: function (cb) {
                return this.reverse().firstKey(cb);
            },

            distinct: function () {
                var ctx = this._ctx,
                    idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
                if (!idx || !idx.multi) return this; // distinct() only makes differencies on multiEntry indexes.
                var set = {};
                addFilter(this._ctx, function (cursor) {
                    var strKey = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
                    var found = hasOwn(set, strKey);
                    set[strKey] = true;
                    return !found;
                });
                return this;
            }
        };
    });

    //
    //
    // WriteableCollection Class
    //
    //
    function WriteableCollection() {
        Collection.apply(this, arguments);
    }

    derive(WriteableCollection).from(Collection).extend({

        //
        // WriteableCollection Public Methods
        //

        modify: function (changes) {
            var self = this,
                ctx = this._ctx,
                hook = ctx.table.hook,
                updatingHook = hook.updating.fire,
                deletingHook = hook.deleting.fire;

            fake && typeof changes === 'function' && changes.call({ value: ctx.table.schema.instanceTemplate }, ctx.table.schema.instanceTemplate);

            return this._write(function (resolve, reject, idbstore, trans) {
                var modifyer;
                if (typeof changes === 'function') {
                    // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
                    if (updatingHook === nop && deletingHook === nop) {
                        // Noone cares about what is being changed. Just let the modifier function be the given argument as is.
                        modifyer = changes;
                    } else {
                        // People want to know exactly what is being modified or deleted.
                        // Let modifyer be a proxy function that finds out what changes the caller is actually doing
                        // and call the hooks accordingly!
                        modifyer = function (item) {
                            var origItem = deepClone(item); // Clone the item first so we can compare laters.
                            if (changes.call(this, item, this) === false) return false; // Call the real modifyer function (If it returns false explicitely, it means it dont want to modify anyting on this object)
                            if (!hasOwn(this, "value")) {
                                // The real modifyer function requests a deletion of the object. Inform the deletingHook that a deletion is taking place.
                                deletingHook.call(this, this.primKey, item, trans);
                            } else {
                                // No deletion. Check what was changed
                                var objectDiff = getObjectDiff(origItem, this.value);
                                var additionalChanges = updatingHook.call(this, objectDiff, this.primKey, origItem, trans);
                                if (additionalChanges) {
                                    // Hook want to apply additional modifications. Make sure to fullfill the will of the hook.
                                    item = this.value;
                                    keys(additionalChanges).forEach(function (keyPath) {
                                        setByKeyPath(item, keyPath, additionalChanges[keyPath]); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                    });
                                }
                            }
                        };
                    }
                } else if (updatingHook === nop) {
                    // changes is a set of {keyPath: value} and no one is listening to the updating hook.
                    var keyPaths = keys(changes);
                    var numKeys = keyPaths.length;
                    modifyer = function (item) {
                        var anythingModified = false;
                        for (var i = 0; i < numKeys; ++i) {
                            var keyPath = keyPaths[i],
                                val = changes[keyPath];
                            if (getByKeyPath(item, keyPath) !== val) {
                                setByKeyPath(item, keyPath, val); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                anythingModified = true;
                            }
                        }
                        return anythingModified;
                    };
                } else {
                    // changes is a set of {keyPath: value} and people are listening to the updating hook so we need to call it and
                    // allow it to add additional modifications to make.
                    var origChanges = changes;
                    changes = shallowClone(origChanges); // Let's work with a clone of the changes keyPath/value set so that we can restore it in case a hook extends it.
                    modifyer = function (item) {
                        var anythingModified = false;
                        var additionalChanges = updatingHook.call(this, changes, this.primKey, deepClone(item), trans);
                        if (additionalChanges) extend(changes, additionalChanges);
                        keys(changes).forEach(function (keyPath) {
                            var val = changes[keyPath];
                            if (getByKeyPath(item, keyPath) !== val) {
                                setByKeyPath(item, keyPath, val);
                                anythingModified = true;
                            }
                        });
                        if (additionalChanges) changes = shallowClone(origChanges); // Restore original changes for next iteration
                        return anythingModified;
                    };
                }

                var count = 0;
                var successCount = 0;
                var iterationComplete = false;
                var failures = [];
                var failKeys = [];
                var currentKey = null;

                function modifyItem(item, cursor) {
                    currentKey = cursor.primaryKey;
                    var thisContext = {
                        primKey: cursor.primaryKey,
                        value: item,
                        onsuccess: null,
                        onerror: null
                    };

                    function onerror(e) {
                        failures.push(e);
                        failKeys.push(thisContext.primKey);
                        checkFinished();
                        return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
                    }

                    if (modifyer.call(thisContext, item, thisContext) !== false) {
                        // If a callback explicitely returns false, do not perform the update!
                        var bDelete = !hasOwn(thisContext, "value");
                        ++count;
                        tryCatch(function () {
                            var req = bDelete ? cursor.delete() : cursor.update(thisContext.value);
                            req._hookCtx = thisContext;
                            req.onerror = hookedEventRejectHandler(onerror);
                            req.onsuccess = hookedEventSuccessHandler(function () {
                                ++successCount;
                                checkFinished();
                            });
                        }, onerror);
                    } else if (thisContext.onsuccess) {
                        // Hook will expect either onerror or onsuccess to always be called!
                        thisContext.onsuccess(thisContext.value);
                    }
                }

                function doReject(e) {
                    if (e) {
                        failures.push(e);
                        failKeys.push(currentKey);
                    }
                    return reject(new ModifyError("Error modifying one or more objects", failures, successCount, failKeys));
                }

                function checkFinished() {
                    if (iterationComplete && successCount + failures.length === count) {
                        if (failures.length > 0) doReject();else resolve(successCount);
                    }
                }
                self.clone().raw()._iterate(modifyItem, function () {
                    iterationComplete = true;
                    checkFinished();
                }, doReject, idbstore);
            });
        },

        'delete': function () {
            var _this4 = this;

            var ctx = this._ctx,
                range = ctx.range,
                deletingHook = ctx.table.hook.deleting.fire,
                hasDeleteHook = deletingHook !== nop;
            if (!hasDeleteHook && isPlainKeyRange(ctx) && (ctx.isPrimKey && !hangsOnDeleteLargeKeyRange || !range)) // if no range, we'll use clear().
                {
                    // May use IDBObjectStore.delete(IDBKeyRange) in this case (Issue #208)
                    // For chromium, this is the way most optimized version.
                    // For IE/Edge, this could hang the indexedDB engine and make operating system instable
                    // (https://gist.github.com/dfahlander/5a39328f029de18222cf2125d56c38f7)
                    return this._write(function (resolve, reject, idbstore) {
                        // Our API contract is to return a count of deleted items, so we have to count() before delete().
                        var onerror = eventRejectHandler(reject),
                            countReq = range ? idbstore.count(range) : idbstore.count();
                        countReq.onerror = onerror;
                        countReq.onsuccess = function () {
                            var count = countReq.result;
                            tryCatch(function () {
                                var delReq = range ? idbstore.delete(range) : idbstore.clear();
                                delReq.onerror = onerror;
                                delReq.onsuccess = function () {
                                    return resolve(count);
                                };
                            }, function (err) {
                                return reject(err);
                            });
                        };
                    });
                }

            // Default version to use when collection is not a vanilla IDBKeyRange on the primary key.
            // Divide into chunks to not starve RAM.
            // If has delete hook, we will have to collect not just keys but also objects, so it will use
            // more memory and need lower chunk size.
            var CHUNKSIZE = hasDeleteHook ? 2000 : 10000;

            return this._write(function (resolve, reject, idbstore, trans) {
                var totalCount = 0;
                // Clone collection and change its table and set a limit of CHUNKSIZE on the cloned Collection instance.
                var collection = _this4.clone({
                    keysOnly: !ctx.isMatch && !hasDeleteHook }) // load just keys (unless filter() or and() or deleteHook has subscribers)
                .distinct() // In case multiEntry is used, never delete same key twice because resulting count
                // would become larger than actual delete count.
                .limit(CHUNKSIZE).raw(); // Don't filter through reading-hooks (like mapped classes etc)

                var keysOrTuples = [];

                // We're gonna do things on as many chunks that are needed.
                // Use recursion of nextChunk function:
                var nextChunk = function () {
                    return collection.each(hasDeleteHook ? function (val, cursor) {
                        // Somebody subscribes to hook('deleting'). Collect all primary keys and their values,
                        // so that the hook can be called with its values in bulkDelete().
                        keysOrTuples.push([cursor.primaryKey, cursor.value]);
                    } : function (val, cursor) {
                        // No one subscribes to hook('deleting'). Collect only primary keys:
                        keysOrTuples.push(cursor.primaryKey);
                    }).then(function () {
                        // Chromium deletes faster when doing it in sort order.
                        hasDeleteHook ? keysOrTuples.sort(function (a, b) {
                            return ascending(a[0], b[0]);
                        }) : keysOrTuples.sort(ascending);
                        return bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook);
                    }).then(function () {
                        var count = keysOrTuples.length;
                        totalCount += count;
                        keysOrTuples = [];
                        return count < CHUNKSIZE ? totalCount : nextChunk();
                    });
                };

                resolve(nextChunk());
            });
        }
    });

    //
    //
    //
    // ------------------------- Help functions ---------------------------
    //
    //
    //

    function lowerVersionFirst(a, b) {
        return a._cfg.version - b._cfg.version;
    }

    function setApiOnPlace(objs, tableNames, mode, dbschema) {
        tableNames.forEach(function (tableName) {
            var tableInstance = db._tableFactory(mode, dbschema[tableName]);
            objs.forEach(function (obj) {
                tableName in obj || (obj[tableName] = tableInstance);
            });
        });
    }

    function removeTablesApi(objs) {
        objs.forEach(function (obj) {
            for (var key in obj) {
                if (obj[key] instanceof Table) delete obj[key];
            }
        });
    }

    function iterate(req, filter, fn, resolve, reject, valueMapper) {

        // Apply valueMapper (hook('reading') or mappped class)
        var mappedFn = valueMapper ? function (x, c, a) {
            return fn(valueMapper(x), c, a);
        } : fn;
        // Wrap fn with PSD and microtick stuff from Promise.
        var wrappedFn = wrap(mappedFn, reject);

        if (!req.onerror) req.onerror = eventRejectHandler(reject);
        if (filter) {
            req.onsuccess = trycatcher(function filter_record() {
                var cursor = req.result;
                if (cursor) {
                    var c = function () {
                        cursor.continue();
                    };
                    if (filter(cursor, function (advancer) {
                        c = advancer;
                    }, resolve, reject)) wrappedFn(cursor.value, cursor, function (advancer) {
                        c = advancer;
                    });
                    c();
                } else {
                    resolve();
                }
            }, reject);
        } else {
            req.onsuccess = trycatcher(function filter_record() {
                var cursor = req.result;
                if (cursor) {
                    var c = function () {
                        cursor.continue();
                    };
                    wrappedFn(cursor.value, cursor, function (advancer) {
                        c = advancer;
                    });
                    c();
                } else {
                    resolve();
                }
            }, reject);
        }
    }

    function parseIndexSyntax(indexes) {
        /// <param name="indexes" type="String"></param>
        /// <returns type="Array" elementType="IndexSpec"></returns>
        var rv = [];
        indexes.split(',').forEach(function (index) {
            index = index.trim();
            var name = index.replace(/([&*]|\+\+)/g, ""); // Remove "&", "++" and "*"
            // Let keyPath of "[a+b]" be ["a","b"]:
            var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;

            rv.push(new IndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), /\./.test(index)));
        });
        return rv;
    }

    function cmp(key1, key2) {
        return indexedDB.cmp(key1, key2);
    }

    function min(a, b) {
        return cmp(a, b) < 0 ? a : b;
    }

    function max(a, b) {
        return cmp(a, b) > 0 ? a : b;
    }

    function ascending(a, b) {
        return indexedDB.cmp(a, b);
    }

    function descending(a, b) {
        return indexedDB.cmp(b, a);
    }

    function simpleCompare(a, b) {
        return a < b ? -1 : a === b ? 0 : 1;
    }

    function simpleCompareReverse(a, b) {
        return a > b ? -1 : a === b ? 0 : 1;
    }

    function combine(filter1, filter2) {
        return filter1 ? filter2 ? function () {
            return filter1.apply(this, arguments) && filter2.apply(this, arguments);
        } : filter1 : filter2;
    }

    function readGlobalSchema() {
        db.verno = idbdb.version / 10;
        db._dbSchema = globalSchema = {};
        dbStoreNames = slice(idbdb.objectStoreNames, 0);
        if (dbStoreNames.length === 0) return; // Database contains no stores.
        var trans = idbdb.transaction(safariMultiStoreFix(dbStoreNames), 'readonly');
        dbStoreNames.forEach(function (storeName) {
            var store = trans.objectStore(storeName),
                keyPath = store.keyPath,
                dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
            var primKey = new IndexSpec(keyPath, keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== 'string', dotted);
            var indexes = [];
            for (var j = 0; j < store.indexNames.length; ++j) {
                var idbindex = store.index(store.indexNames[j]);
                keyPath = idbindex.keyPath;
                dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
                var index = new IndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== 'string', dotted);
                indexes.push(index);
            }
            globalSchema[storeName] = new TableSchema(storeName, primKey, indexes, {});
        });
        setApiOnPlace([allTables, Transaction.prototype], keys(globalSchema), READWRITE, globalSchema);
    }

    function adjustToExistingIndexNames(schema, idbtrans) {
        /// <summary>
        /// Issue #30 Problem with existing db - adjust to existing index names when migrating from non-dexie db
        /// </summary>
        /// <param name="schema" type="Object">Map between name and TableSchema</param>
        /// <param name="idbtrans" type="IDBTransaction"></param>
        var storeNames = idbtrans.db.objectStoreNames;
        for (var i = 0; i < storeNames.length; ++i) {
            var storeName = storeNames[i];
            var store = idbtrans.objectStore(storeName);
            hasGetAll = 'getAll' in store;
            for (var j = 0; j < store.indexNames.length; ++j) {
                var indexName = store.indexNames[j];
                var keyPath = store.index(indexName).keyPath;
                var dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
                if (schema[storeName]) {
                    var indexSpec = schema[storeName].idxByName[dexieName];
                    if (indexSpec) indexSpec.name = indexName;
                }
            }
        }
    }

    function fireOnBlocked(ev) {
        db.on("blocked").fire(ev);
        // Workaround (not fully*) for missing "versionchange" event in IE,Edge and Safari:
        connections.filter(function (c) {
            return c.name === db.name && c !== db && !c._vcFired;
        }).map(function (c) {
            return c.on("versionchange").fire(ev);
        });
    }

    extend(this, {
        Collection: Collection,
        Table: Table,
        Transaction: Transaction,
        Version: Version,
        WhereClause: WhereClause,
        WriteableCollection: WriteableCollection,
        WriteableTable: WriteableTable
    });

    init();

    addons.forEach(function (fn) {
        fn(db);
    });
}

var fakeAutoComplete = function () {}; // Will never be changed. We just fake for the IDE that we change it (see doFakeAutoComplete())
var fake = false; // Will never be changed. We just fake for the IDE that we change it (see doFakeAutoComplete())

function parseType(type) {
    if (typeof type === 'function') {
        return new type();
    } else if (isArray(type)) {
        return [parseType(type[0])];
    } else if (type && typeof type === 'object') {
        var rv = {};
        applyStructure(rv, type);
        return rv;
    } else {
        return type;
    }
}

function applyStructure(obj, structure) {
    keys(structure).forEach(function (member) {
        var value = parseType(structure[member]);
        obj[member] = value;
    });
    return obj;
}

function eventSuccessHandler(done) {
    return function (ev) {
        done(ev.target.result);
    };
}

function hookedEventSuccessHandler(resolve) {
    // wrap() is needed when calling hooks because the rare scenario of:
    //  * hook does a db operation that fails immediately (IDB throws exception)
    //    For calling db operations on correct transaction, wrap makes sure to set PSD correctly.
    //    wrap() will also execute in a virtual tick.
    //  * If not wrapped in a virtual tick, direct exception will launch a new physical tick.
    //  * If this was the last event in the bulk, the promise will resolve after a physical tick
    //    and the transaction will have committed already.
    // If no hook, the virtual tick will be executed in the reject()/resolve of the final promise,
    // because it is always marked with _lib = true when created using Transaction._promise().
    return wrap(function (event) {
        var req = event.target,
            result = req.result,
            ctx = req._hookCtx,
            // Contains the hook error handler. Put here instead of closure to boost performance.
        hookSuccessHandler = ctx && ctx.onsuccess;
        hookSuccessHandler && hookSuccessHandler(result);
        resolve && resolve(result);
    }, resolve);
}

function eventRejectHandler(reject) {
    return function (event) {
        preventDefault(event);
        reject(event.target.error);
        return false;
    };
}

function hookedEventRejectHandler(reject) {
    return wrap(function (event) {
        // See comment on hookedEventSuccessHandler() why wrap() is needed only when supporting hooks.

        var req = event.target,
            err = req.error,
            ctx = req._hookCtx,
            // Contains the hook error handler. Put here instead of closure to boost performance.
        hookErrorHandler = ctx && ctx.onerror;
        hookErrorHandler && hookErrorHandler(err);
        preventDefault(event);
        reject(err);
        return false;
    });
}

function preventDefault(event) {
    if (event.stopPropagation) // IndexedDBShim doesnt support this on Safari 8 and below.
        event.stopPropagation();
    if (event.preventDefault) // IndexedDBShim doesnt support this on Safari 8 and below.
        event.preventDefault();
}

function globalDatabaseList(cb) {
    var val,
        localStorage = Dexie.dependencies.localStorage;
    if (!localStorage) return cb([]); // Envs without localStorage support
    try {
        val = JSON.parse(localStorage.getItem('Dexie.DatabaseNames') || "[]");
    } catch (e) {
        val = [];
    }
    if (cb(val)) {
        localStorage.setItem('Dexie.DatabaseNames', JSON.stringify(val));
    }
}

function awaitIterator(iterator) {
    var callNext = function (result) {
        return iterator.next(result);
    },
        doThrow = function (error) {
        return iterator.throw(error);
    },
        onSuccess = step(callNext),
        onError = step(doThrow);

    function step(getNext) {
        return function (val) {
            var next = getNext(val),
                value = next.value;

            return next.done ? value : !value || typeof value.then !== 'function' ? isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
        };
    }

    return step(callNext)();
}

//
// IndexSpec struct
//
function IndexSpec(name, keyPath, unique, multi, auto, compound, dotted) {
    /// <param name="name" type="String"></param>
    /// <param name="keyPath" type="String"></param>
    /// <param name="unique" type="Boolean"></param>
    /// <param name="multi" type="Boolean"></param>
    /// <param name="auto" type="Boolean"></param>
    /// <param name="compound" type="Boolean"></param>
    /// <param name="dotted" type="Boolean"></param>
    this.name = name;
    this.keyPath = keyPath;
    this.unique = unique;
    this.multi = multi;
    this.auto = auto;
    this.compound = compound;
    this.dotted = dotted;
    var keyPathSrc = typeof keyPath === 'string' ? keyPath : keyPath && '[' + [].join.call(keyPath, '+') + ']';
    this.src = (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + keyPathSrc;
}

//
// TableSchema struct
//
function TableSchema(name, primKey, indexes, instanceTemplate) {
    /// <param name="name" type="String"></param>
    /// <param name="primKey" type="IndexSpec"></param>
    /// <param name="indexes" type="Array" elementType="IndexSpec"></param>
    /// <param name="instanceTemplate" type="Object"></param>
    this.name = name;
    this.primKey = primKey || new IndexSpec();
    this.indexes = indexes || [new IndexSpec()];
    this.instanceTemplate = instanceTemplate;
    this.mappedClass = null;
    this.idxByName = arrayToObject(indexes, function (index) {
        return [index.name, index];
    });
}

// Used in when defining dependencies later...
// (If IndexedDBShim is loaded, prefer it before standard indexedDB)
var idbshim = _global.idbModules && _global.idbModules.shimIndexedDB ? _global.idbModules : {};

function safariMultiStoreFix(storeNames) {
    return storeNames.length === 1 ? storeNames[0] : storeNames;
}

function getNativeGetDatabaseNamesFn(indexedDB) {
    var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
    return fn && fn.bind(indexedDB);
}

// Export Error classes
props(Dexie, fullNameExceptions); // Dexie.XXXError = class XXXError {...};

//
// Static methods and properties
// 
props(Dexie, {

    //
    // Static delete() method.
    //
    delete: function (databaseName) {
        var db = new Dexie(databaseName),
            promise = db.delete();
        promise.onblocked = function (fn) {
            db.on("blocked", fn);
            return this;
        };
        return promise;
    },

    //
    // Static exists() method.
    //
    exists: function (name) {
        return new Dexie(name).open().then(function (db) {
            db.close();
            return true;
        }).catch(Dexie.NoSuchDatabaseError, function () {
            return false;
        });
    },

    //
    // Static method for retrieving a list of all existing databases at current host.
    //
    getDatabaseNames: function (cb) {
        return new Promise(function (resolve, reject) {
            var getDatabaseNames = getNativeGetDatabaseNamesFn(indexedDB);
            if (getDatabaseNames) {
                // In case getDatabaseNames() becomes standard, let's prepare to support it:
                var req = getDatabaseNames();
                req.onsuccess = function (event) {
                    resolve(slice(event.target.result, 0)); // Converst DOMStringList to Array<String>
                };
                req.onerror = eventRejectHandler(reject);
            } else {
                globalDatabaseList(function (val) {
                    resolve(val);
                    return false;
                });
            }
        }).then(cb);
    },

    defineClass: function (structure) {
        /// <summary>
        ///     Create a javascript constructor based on given template for which properties to expect in the class.
        ///     Any property that is a constructor function will act as a type. So {name: String} will be equal to {name: new String()}.
        /// </summary>
        /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
        /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>

        // Default constructor able to copy given properties into this object.
        function Class(properties) {
            /// <param name="properties" type="Object" optional="true">Properties to initialize object with.
            /// </param>
            properties ? extend(this, properties) : fake && applyStructure(this, structure);
        }
        return Class;
    },

    applyStructure: applyStructure,

    ignoreTransaction: function (scopeFunc) {
        // In case caller is within a transaction but needs to create a separate transaction.
        // Example of usage:
        //
        // Let's say we have a logger function in our app. Other application-logic should be unaware of the
        // logger function and not need to include the 'logentries' table in all transaction it performs.
        // The logging should always be done in a separate transaction and not be dependant on the current
        // running transaction context. Then you could use Dexie.ignoreTransaction() to run code that starts a new transaction.
        //
        //     Dexie.ignoreTransaction(function() {
        //         db.logentries.add(newLogEntry);
        //     });
        //
        // Unless using Dexie.ignoreTransaction(), the above example would try to reuse the current transaction
        // in current Promise-scope.
        //
        // An alternative to Dexie.ignoreTransaction() would be setImmediate() or setTimeout(). The reason we still provide an
        // API for this because
        //  1) The intention of writing the statement could be unclear if using setImmediate() or setTimeout().
        //  2) setTimeout() would wait unnescessary until firing. This is however not the case with setImmediate().
        //  3) setImmediate() is not supported in the ES standard.
        //  4) You might want to keep other PSD state that was set in a parent PSD, such as PSD.letThrough.
        return PSD.trans ? usePSD(PSD.transless, scopeFunc) : // Use the closest parent that was non-transactional.
        scopeFunc(); // No need to change scope because there is no ongoing transaction.
    },

    vip: function (fn) {
        // To be used by subscribers to the on('ready') event.
        // This will let caller through to access DB even when it is blocked while the db.ready() subscribers are firing.
        // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
        // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
        // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that.
        // Note that this method is only useful for on('ready') subscribers that is returning a Promise from the event. If not using vip()
        // the database could deadlock since it wont open until the returned Promise is resolved, and any non-VIPed operation started by
        // the caller will not resolve until database is opened.
        return newScope(function () {
            PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.
            return fn();
        });
    },

    async: function (generatorFn) {
        return function () {
            try {
                var rv = awaitIterator(generatorFn.apply(this, arguments));
                if (!rv || typeof rv.then !== 'function') return Promise.resolve(rv);
                return rv;
            } catch (e) {
                return rejection(e);
            }
        };
    },

    spawn: function (generatorFn, args, thiz) {
        try {
            var rv = awaitIterator(generatorFn.apply(thiz, args || []));
            if (!rv || typeof rv.then !== 'function') return Promise.resolve(rv);
            return rv;
        } catch (e) {
            return rejection(e);
        }
    },

    // Dexie.currentTransaction property
    currentTransaction: {
        get: function () {
            return PSD.trans || null;
        }
    },

    // Export our Promise implementation since it can be handy as a standalone Promise implementation
    Promise: Promise,

    // Dexie.debug proptery:
    // Dexie.debug = false
    // Dexie.debug = true
    // Dexie.debug = "dexie" - don't hide dexie's stack frames.
    debug: {
        get: function () {
            return debug;
        },
        set: function (value) {
            setDebug(value, value === 'dexie' ? function () {
                return true;
            } : dexieStackFrameFilter);
        }
    },

    // Export our derive/extend/override methodology
    derive: derive,
    extend: extend,
    props: props,
    override: override,
    // Export our Events() function - can be handy as a toolkit
    Events: Events,
    events: { get: deprecated(function () {
            return Events;
        }) }, // Backward compatible lowercase version.
    // Utilities
    getByKeyPath: getByKeyPath,
    setByKeyPath: setByKeyPath,
    delByKeyPath: delByKeyPath,
    shallowClone: shallowClone,
    deepClone: deepClone,
    getObjectDiff: getObjectDiff,
    asap: asap,
    maxKey: maxKey,
    // Addon registry
    addons: [],
    // Global DB connection list
    connections: connections,

    MultiModifyError: exceptions.Modify, // Backward compatibility 0.9.8. Deprecate.
    errnames: errnames,

    // Export other static classes
    IndexSpec: IndexSpec,
    TableSchema: TableSchema,

    //
    // Dependencies
    //
    // These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
    //
    // In node.js, however, these properties must be set "manually" before instansiating a new Dexie().
    // For node.js, you need to require indexeddb-js or similar and then set these deps.
    //
    dependencies: {
        // Required:
        indexedDB: idbshim.shimIndexedDB || _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
        IDBKeyRange: idbshim.IDBKeyRange || _global.IDBKeyRange || _global.webkitIDBKeyRange
    },

    // API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
    semVer: DEXIE_VERSION,
    version: DEXIE_VERSION.split('.').map(function (n) {
        return parseInt(n);
    }).reduce(function (p, c, i) {
        return p + c / Math.pow(10, i * 2);
    }),
    fakeAutoComplete: fakeAutoComplete,

    // https://github.com/dfahlander/Dexie.js/issues/186
    // typescript compiler tsc in mode ts-->es5 & commonJS, will expect require() to return
    // x.default. Workaround: Set Dexie.default = Dexie.
    default: Dexie
});

tryCatch(function () {
    // Optional dependencies
    // localStorage
    Dexie.dependencies.localStorage = (typeof chrome !== "undefined" && chrome !== null ? chrome.storage : void 0) != null ? null : _global.localStorage;
});

// Map DOMErrors and DOMExceptions to corresponding Dexie errors. May change in Dexie v2.0.
Promise.rejectionMapper = mapError;

// Fool IDE to improve autocomplete. Tested with Visual Studio 2013 and 2015.
doFakeAutoComplete(function () {
    Dexie.fakeAutoComplete = fakeAutoComplete = doFakeAutoComplete;
    Dexie.fake = fake = true;
});

return Dexie;

})));
//# sourceMappingURL=dexie.js.map

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./../../webpack/buildin/global.js */ 0), __webpack_require__(/*! ./../../timers-browserify/main.js */ 10).setImmediate))

/***/ }),
/* 7 */
/* unknown exports provided */
/* all exports used */
/*!***************************************!*\
  !*** ./~/es6-mixin/dist/lib/index.js ***!
  \***************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.mixin = mixin;
exports.mix = mix;

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Converts an object to an array of pairs, in the form of an array of tuples
 * where index 0 is the key and index 1 is the value. This include both
 * enumerable and non-enumerable properties.
 * @param {object} object Object for which to get pairs
 * @returns {[string, *][]} Array containing object pairs
 */
function entries(object) {
  return Object.getOwnPropertyNames(object).map(function (key) {
    return [key, object[key]];
  });
}

/**
 * Generic mixin superclass. This class is intended to be extended by actual
 * mixins.
 */

var Mixin = exports.Mixin = function () {
  function Mixin() {
    _classCallCheck(this, Mixin);
  }

  _createClass(Mixin, null, [{
    key: 'mixin',


    /**
     * Mixes in this class's methods into an existing object.
     * @param {object} [target={}] Any object to mix this class's methods into
     * @param {function} [MixedIn=this] Constructor to be mixed in
     * @param {...*} [args] Arguments to pass to the mixed in constructor, if any
     * @return {object} The original target object, mutated
     */
    value: function mixin() {
      var target = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var MixedIn = arguments.length <= 1 || arguments[1] === undefined ? this : arguments[1];

      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var instance = new (Function.prototype.bind.apply(MixedIn, [null].concat(args)))();

      // Get all the methods from this class, bind them to the instance, and copy
      // them to the target object.
      entries(MixedIn.prototype).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var methodName = _ref2[0];
        var method = _ref2[1];
        return typeof method === 'function' && methodName !== 'constructor';
      }).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2);

        var methodName = _ref4[0];
        var method = _ref4[1];
        return target[methodName] = method.bind(instance);
      });

      return target;
    }
  }]);

  return Mixin;
}();

/**
 * Mixes in this class's methods into an existing object.
 * @param {object} [target={}] Any object to mix this class's methods into
 * @param {function} [MixedIn=Mixin] Constructor to be mixed in
 * @param {...*} [args] Arguments to pass to the mixed in constructor, if any
 * @return {object} The original target object, mutated
 */


function mixin() {
  var target = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var MixedIn = arguments.length <= 1 || arguments[1] === undefined ? Mixin : arguments[1];

  for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    args[_key2 - 2] = arguments[_key2];
  }

  return Mixin.mixin.apply(Mixin, [target, MixedIn].concat(args));
}

/**
 * Create a subclass of a constructor and mix 1 or many mixin into it.
 * @param {function} SuperClass Class that will be used as super-class
 * @param {...function} mixins Mixins to add
 * @return {function} A new anonymous class that extends `SuperClass` and has all `mixins` mixed in
 */
function mix(SuperClass) {
  for (var _len3 = arguments.length, mixins = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    mixins[_key3 - 1] = arguments[_key3];
  }

  return function (_SuperClass) {
    _inherits(_class, _SuperClass);

    function _class() {
      var _Object$getPrototypeO;

      _classCallCheck(this, _class);

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(_class)).call.apply(_Object$getPrototypeO, [this].concat(args)));

      mixins.forEach(function (Mixedin) {
        return mixin(_this, Mixedin);
      });
      return _this;
    }

    return _class;
  }(SuperClass);
}

/***/ }),
/* 8 */
/* unknown exports provided */
/* all exports used */
/*!******************************!*\
  !*** ./~/process/browser.js ***!
  \******************************/
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 9 */
/* unknown exports provided */
/* all exports used */
/*!****************************************!*\
  !*** ./~/setimmediate/setImmediate.js ***!
  \****************************************/
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./../webpack/buildin/global.js */ 0), __webpack_require__(/*! ./../process/browser.js */ 8)))

/***/ }),
/* 10 */
/* unknown exports provided */
/* all exports used */
/*!*************************************!*\
  !*** ./~/timers-browserify/main.js ***!
  \*************************************/
/***/ (function(module, exports, __webpack_require__) {

var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(/*! setimmediate */ 9);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ }),
/* 11 */
/* unknown exports provided */
/* all exports used */
/*!********************************!*\
  !*** ./sourceScripts/index.js ***!
  \********************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! ./simprovcore */ 1).default;

/***/ })
/******/ ]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAwOWZkNTJmYmY3ODFhMmRjYjE0YiIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzIiwid2VicGFjazovLy8uL3NvdXJjZVNjcmlwdHMvc2ltcHJvdmNvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vc291cmNlU2NyaXB0cy9iYWNrdXAuanMiLCJ3ZWJwYWNrOi8vLy4vc291cmNlU2NyaXB0cy9kYXRhYmFzZS5qcyIsIndlYnBhY2s6Ly8vLi9zb3VyY2VTY3JpcHRzL3ZlbmRvcmhvb2tzLmpzIiwid2VicGFjazovLy8uL34vY3VpZC9kaXN0L2Jyb3dzZXItY3VpZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2RleGllL2Rpc3QvZGV4aWUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9lczYtbWl4aW4vZGlzdC9saWIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9zZXRpbW1lZGlhdGUvc2V0SW1tZWRpYXRlLmpzIiwid2VicGFjazovLy8uL34vdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qcyIsIndlYnBhY2s6Ly8vLi9zb3VyY2VTY3JpcHRzL2luZGV4LmpzIl0sIm5hbWVzIjpbIlNpbXByb3ZDb3JlIiwiY29uc3RydWN0b3IiLCJjb25maWd1cmF0aW9uIiwidXNlck5hbWUiLCJ1c2VybmFtZSIsIm9uUmVsb2FkIiwidXNlckNVSUQiLCJkYlRvZ2dsZSIsImRiRXhpc3RzIiwic2ltcHJvdlN0YXRlcyIsInVuZG9DVUlEIiwicmVkb0NVSUQiLCJ1bmRvVHJpZ2dlcmVkIiwidXBsb2FkZWRKc29uRGF0YSIsInJlcGxheVRyaWdnZXIiLCJyZXBsYXlUcmlnZ2VyRGVsYXkiLCJhY3Rpb25SZXBsYXkiLCJzdGF0ZUNVSUQiLCJnZXRPYmplY3QiLCJ0aGVuIiwicmVjZWl2ZWREYXRhIiwic2V0VGltZW91dCIsImNyZWF0ZUN1c3RvbUV2ZW50IiwiY29uc29sZSIsImxvZyIsIlByb21pc2UiLCJyZXNvbHZlIiwiYWNxdWlyZSIsImNoYXJ0RmlsdGVycyIsInVzZXJBY3Rpb24iLCJwcm92ZW5hbmNlRGF0YSIsInN0YXRlRGF0YSIsInN0YXRlSW5mbyIsIm9iamVjdFdyYXBwZXIiLCJhZGREYXRhIiwiZGJDVUlEIiwicHVzaCIsImxlbmd0aCIsImFkZGVkT2JqZWN0IiwibG9jYWxTdG9yYWdlU2V0IiwiZXZlbnREYXRhIiwiZXZlbnRUeXBlIiwiY3VzdG9tRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsIndpbmRvdyIsImRpc3BhdGNoRXZlbnQiLCJleHBvcnRQcm92ZW5hbmNlIiwiZXhwb3J0VHlwZSIsImZldGNoQWxsIiwidGVtcE9iamVjdCIsInNpbXByb3ZVc2VyIiwidW5zaGlmdCIsImRvd25sb2FkSnNvbiIsInB1Ymxpc2hHaXN0IiwiaW1wb3J0UHJvdmVuYW5jZSIsImltcG9ydFR5cGUiLCJnaXN0SUQiLCJjbGVhclRhYmxlIiwicmV0cml2ZUdpc3QiLCJzaGlmdCIsInVzZXJEZWNpc2lvbiIsImNvbmZpcm0iLCJidWxrQWRkRGF0YSIsImxhc3RDVUlEIiwidGFibGVDb3VudCIsIml0ZW1Db3VudCIsImluaXRpYWxpemUiLCJleGlzdHNEQiIsInZhbHVlIiwiYWxsIiwibG9jYWxTdG9yYWdlR2V0IiwidmFsdWVzIiwiaW5pdGlhbGl6ZURCIiwibG9hZEpzb24iLCJkb2N1bWVudEJvZHkiLCJkb2N1bWVudCIsImJvZHkiLCJpbnB1dCIsImNyZWF0ZUVsZW1lbnQiLCJ0eXBlIiwic3R5bGUiLCJkaXNwbGF5IiwicmVjZWl2ZWRUZXh0IiwiZXZlbnQiLCJKU09OIiwicGFyc2UiLCJ0YXJnZXQiLCJyZXN1bHQiLCJyZW1vdmVDaGlsZCIsImhhbmRsZUZpbGVTZWxlY3QiLCJmaWxlIiwiZmlsZXMiLCJmciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJyZWFkQXNUZXh0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImFwcGVuZENoaWxkIiwiY2xpY2siLCJzdG9yYWdlRGF0YSIsInRvV2hlcmUiLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwic3RyaW5naWZ5IiwiZnJvbVdoZXJlIiwiZ2V0SXRlbSIsIndyYXBwZWRPYmplY3QiLCJ0aW1lU3RhbXAiLCJEYXRlIiwibm93IiwidGh1bWJuYWlsIiwiYW5ub3RhdGlvbiIsInVuZG9BY3Rpb24iLCJyZWNlaXZlZE9iamVjdCIsImluZGV4T2YiLCJyZWRvQWN0aW9uIiwicmVkb0FjdGlvbkhlbHBlciIsImNsYXNzU2ltcHJvdkNvcmVJbmZvcm1hdGlvbiIsIkJhY2t1cCIsImdpc3REYXRhIiwicG9zdENvbnRlbnQiLCJkZXNjcmlwdGlvbiIsInB1YmxpYyIsImNvbnRlbnQiLCJmZXRjaCIsIm1ldGhvZCIsInJlc3BvbnNlIiwianNvbiIsImRhdGEiLCJodG1sX3VybCIsImlkIiwiZmV0Y2hGcm9tIiwianNvbkRhdGEiLCJlbmNvZGVVUklDb21wb25lbnQiLCJsaW5rIiwiaHJlZiIsImRvd25sb2FkIiwiY2xhc3NCYWNrdXBJbmZvcm1hdGlvbiIsIkRhdGFiYXNlIiwiZGIiLCJzdG9yZU5hbWUiLCJhZGQiLCJidWxrRGF0YSIsImJ1bGtBZGQiLCJjbGVhciIsImRlbGV0ZU9iamVjdCIsInByaW1hcnlLZXkiLCJkZWxldGUiLCJkZWxldGVEQiIsImRiTmFtZSIsImNsb3NlIiwiZXhpc3RzIiwidG9BcnJheSIsImdldCIsInZlcnNpb24iLCJzdG9yZXMiLCJwcm92ZW5hbmNlIiwibGlzdEFsbERCIiwiZ2V0RGF0YWJhc2VOYW1lcyIsImNvdW50IiwidXBkYXRlT2JqZWN0IiwidXBkYXRlIiwiY2xhc3NEYXRhYmFzZUluZm9ybWF0aW9uIiwiVmVuZG9ySG9va3MiLCJpc0RDSW5pdGlhbGl6ZWQiLCJkYyIsImRjUmVnaXN0cnkiLCJleGNsdWRlIiwidGVtcENoYXJ0UmVnaXN0cnkiLCJjaGFydFJlZ2lzdHJ5IiwibGlzdCIsInVuZGVmaW5lZCIsInNvcnQiLCJhIiwiYiIsImZvckVhY2giLCJpdGVtIiwiaW5kZXgiLCJhcnJheSIsInNwbGljZSIsInBvcCIsImNsYXNzVmVuZG9ySG9va3NlSW5mb3JtYXRpb24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVxdWlyZSIsImRlZmF1bHQiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1EQUEyQyxjQUFjOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2hFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNENBQTRDOztBQUU1Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3BCQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7O0FBR2UsTUFBTUEsV0FBTixDQUFrQjtBQUM3QkMsZ0JBQVlDLGFBQVosRUFBMkI7QUFDdkIsYUFBS0MsUUFBTCxHQUFnQkQsY0FBY0UsUUFBZCxJQUEwQixhQUExQztBQUNBLGFBQUtDLFFBQUwsR0FBZ0JILGNBQWNHLFFBQWQsSUFBMEIsS0FBMUM7QUFDQSxhQUFLQyxRQUFMLEdBQWdCLHFCQUFoQjtBQUNBLGFB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QTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQztBQUNuQztBQUNBO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7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O0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QztBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUEsS0FBSztBQUNMO0FBQ0E7O0FBRUEsS0FBSztBQUNMO0FBQ0E7O0FBRUEsS0FBSztBQUNMO0FBQ0E7O0FBRUEsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7OztBQ3pMRDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUNwREFtQixPQUFPQyxPQUFQLEdBQWlCLG1CQUFBQyxDQUFRLHNCQUFSLEVBQXlCQyxPQUExQyxDIiwiZmlsZSI6InNpbXByb3YuZGV2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiU2ltcHJvdlwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJTaW1wcm92XCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDExKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAwOWZkNTJmYmY3ODFhMmRjYjE0YiIsInZhciBnO1xyXG5cclxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcclxuZyA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGhpcztcclxufSkoKTtcclxuXHJcbnRyeSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXHJcblx0ZyA9IGcgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpIHx8ICgxLGV2YWwpKFwidGhpc1wiKTtcclxufSBjYXRjaChlKSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcclxuXHRpZih0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKVxyXG5cdFx0ZyA9IHdpbmRvdztcclxufVxyXG5cclxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxyXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xyXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGc7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgRGF0YWJhc2UgZnJvbSBcIi4vZGF0YWJhc2VcIjtcclxuaW1wb3J0IFZlbmRvckhvb2tzIGZyb20gXCIuL3ZlbmRvcmhvb2tzXCI7XHJcbmltcG9ydCBCYWNrdXAgZnJvbSBcIi4vYmFja3VwXCI7XHJcbmltcG9ydCB7bWl4aW59IGZyb20gXCJlczYtbWl4aW5cIjtcclxuaW1wb3J0IGN1aWQgZnJvbSBcImN1aWRcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaW1wcm92Q29yZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWd1cmF0aW9uKSB7XHJcbiAgICAgICAgdGhpcy51c2VyTmFtZSA9IGNvbmZpZ3VyYXRpb24udXNlcm5hbWUgfHwgJ1NJTVByb3ZVc2VyJztcclxuICAgICAgICB0aGlzLm9uUmVsb2FkID0gY29uZmlndXJhdGlvbi5vblJlbG9hZCB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLnVzZXJDVUlEID0gY3VpZCgpO1xyXG4gICAgICAgIHRoaXMuZGJUb2dnbGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmRiRXhpc3RzID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaW1wcm92U3RhdGVzID0gW107XHJcbiAgICAgICAgdGhpcy51bmRvQ1VJRCA9ICcnO1xyXG4gICAgICAgIHRoaXMucmVkb0NVSUQgPSAnJztcclxuICAgICAgICB0aGlzLnVuZG9UcmlnZ2VyZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnVwbG9hZGVkSnNvbkRhdGEgPSBbXTtcclxuICAgICAgICB0aGlzLnJlcGxheVRyaWdnZXIgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnJlcGxheVRyaWdnZXJEZWxheSA9IDA7XHJcbiAgICAgICAgbWl4aW4odGhpcywgRGF0YWJhc2UpO1xyXG4gICAgICAgIG1peGluKHRoaXMsIFZlbmRvckhvb2tzKTtcclxuICAgICAgICBtaXhpbih0aGlzLCBCYWNrdXApO1xyXG4gICAgfVxyXG5cclxuICAgIGFjdGlvblJlcGxheShzdGF0ZUNVSUQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRPYmplY3Qoc3RhdGVDVUlEKS50aGVuKHJlY2VpdmVkRGF0YSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucmVwbGF5VHJpZ2dlciA9IHRydWU7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXBsYXlUcmlnZ2VyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0sIHRoaXMucmVwbGF5VHJpZ2dlckRlbGF5KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQ3VzdG9tRXZlbnQocmVjZWl2ZWREYXRhLCAnc2ltcHJvdlJlcGxheScpO1xyXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2ltcHJvdjo+IEFjdGlvbiBSZXBsYXkgQ29tcGxldGVkJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhY3F1aXJlKGNoYXJ0RmlsdGVycywgdXNlckFjdGlvbikge1xyXG4gICAgICAgIGlmICghdGhpcy5yZXBsYXlUcmlnZ2VyKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kYlRvZ2dsZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHByb3ZlbmFuY2VEYXRhID0ge307XHJcbiAgICAgICAgICAgICAgICBwcm92ZW5hbmNlRGF0YS5zdGF0ZURhdGEgPSBjaGFydEZpbHRlcnM7XHJcbiAgICAgICAgICAgICAgICBwcm92ZW5hbmNlRGF0YS5zdGF0ZUluZm8gPSB1c2VyQWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub2JqZWN0V3JhcHBlcihwcm92ZW5hbmNlRGF0YSkudGhlbigoYWRkRGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZERhdGEoYWRkRGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKGRiQ1VJRCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaW1wcm92U3RhdGVzLnB1c2goZGJDVUlEKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zaW1wcm92U3RhdGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51bmRvQ1VJRCA9IHRoaXMuc2ltcHJvdlN0YXRlc1t0aGlzLnNpbXByb3ZTdGF0ZXMubGVuZ3RoIC0gMl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVkb0NVSUQgPSB0aGlzLnNpbXByb3ZTdGF0ZXNbdGhpcy5zaW1wcm92U3RhdGVzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRiQ1VJRCk7XHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKChkYkNVSUQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPYmplY3QoZGJDVUlEKTtcclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oKGFkZGVkT2JqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQ3VzdG9tRXZlbnQoYWRkZWRPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxTdG9yYWdlU2V0KHRoaXMuc2ltcHJvdlN0YXRlcylcclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTaW1wcm92Oj4gQWRkIE9wZXJhdGlvbiBDb21wbGV0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTsgLy9Ub2RvIEhhbmRsZSBEQiBlcnJvclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYlRvZ2dsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUN1c3RvbUV2ZW50KGV2ZW50RGF0YSwgZXZlbnRUeXBlID0gJ3NpbXByb3ZBZGRlZCcpIHtcclxuICAgICAgICBsZXQgY3VzdG9tRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoZXZlbnRUeXBlLCB7ZGV0YWlsOiBldmVudERhdGF9KTtcclxuICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChjdXN0b21FdmVudCk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydFByb3ZlbmFuY2UoZXhwb3J0VHlwZSA9ICdqc29uJykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoQWxsKCkudGhlbigocmVjZWl2ZWREYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB0ZW1wT2JqZWN0ID0ge1xyXG4gICAgICAgICAgICAgICAgc2ltcHJvdlN0YXRlczogdGhpcy5zaW1wcm92U3RhdGVzLCBzaW1wcm92VXNlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLnVzZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJDVUlEOiB0aGlzLnVzZXJDVUlEXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJlY2VpdmVkRGF0YS51bnNoaWZ0KHRlbXBPYmplY3QpO1xyXG4gICAgICAgICAgICBpZiAoZXhwb3J0VHlwZSA9PT0gJ2pzb24nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25sb2FkSnNvbihyZWNlaXZlZERhdGEpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTaW1wcm92Oj4gRG93bmxvYWQgSnNvbiBDb21wbGV0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHVibGlzaEdpc3QocmVjZWl2ZWREYXRhKS50aGVuKChyZWNlaXZlZERhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU2ltcHJvdjo+IEdpdGh1YiBVUkw6ICR7cmVjZWl2ZWREYXRhWzBdfVxcblNpbXByb3Y6PiBHaXN0IElEOiAke3JlY2VpdmVkRGF0YVsxXX1gKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2ltcHJvdjo+IEdpc3QgUHVibGlzaCBDb21wbGV0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlY2VpdmVkRGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9KTsgLy9Ub2RvIEhhbmRsZSBnaXN0IGVycm9yXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpbXBvcnRQcm92ZW5hbmNlKGltcG9ydFR5cGUgPSAnanNvbicsIGdpc3RJRCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNsZWFyVGFibGUoKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKGltcG9ydFR5cGUgPT09ICdqc29uJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLnVwbG9hZGVkSnNvbkRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmV0cml2ZUdpc3QoZ2lzdElEKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLnRoZW4ocmVjZWl2ZWREYXRhID0+IHtcclxuICAgICAgICAgICAgbGV0IHRlbXBPYmplY3QgPSByZWNlaXZlZERhdGEuc2hpZnQoKTsgLy9Ub2RvIEV4dHJhY3QgVGh1bWJuYWlscyBkYXRhXHJcbiAgICAgICAgICAgIHRoaXMuc2ltcHJvdlN0YXRlcyA9IHRlbXBPYmplY3Quc2ltcHJvdlN0YXRlcztcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2ltcHJvdlN0YXRlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVuZG9DVUlEID0gdGhpcy5zaW1wcm92U3RhdGVzW3RoaXMuc2ltcHJvdlN0YXRlcy5sZW5ndGggLSAyXTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVkb0NVSUQgPSB0aGlzLnNpbXByb3ZTdGF0ZXNbdGhpcy5zaW1wcm92U3RhdGVzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB1c2VyRGVjaXNpb24gPSBjb25maXJtKCdEbyB5b3Ugd2FudCB0byB1c2UgdGhlIHVzZXJuYW1lIGFuZCBDVUlEIGZyb20gdGhlIHVwbG9hZGVkIGZpbGU/Jyk7XHJcbiAgICAgICAgICAgIGlmICh1c2VyRGVjaXNpb24pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlck5hbWUgPSB0ZW1wT2JqZWN0LnNpbXByb3ZVc2VyLnVzZXJuYW1lO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyQ1VJRCA9IHRlbXBPYmplY3Quc2ltcHJvdlVzZXIudXNlckNVSUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnVsa0FkZERhdGEocmVjZWl2ZWREYXRhKTtcclxuICAgICAgICB9KS50aGVuKChsYXN0Q1VJRCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbFN0b3JhZ2VTZXQodGhpcy5zaW1wcm92U3RhdGVzKTtcclxuICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxTdG9yYWdlU2V0KHtcclxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLnVzZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgdXNlckNVSUQ6IHRoaXMudXNlckNVSURcclxuICAgICAgICAgICAgfSwgJ3NpbXByb3ZVc2VyJyk7XHJcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRhYmxlQ291bnQoKTtcclxuICAgICAgICB9KS50aGVuKChpdGVtQ291bnQpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFNpbXByb3Y6PiAke2l0ZW1Db3VudH0gSXRlbXMgQWRkZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVDdXN0b21FdmVudCh0aGlzLnNpbXByb3ZTdGF0ZXMsICdzaW1wcm92UmVsb2FkZWQnKTsgLy9Ub2RvIFNlbmQgVGh1bWJuYWlscyBkYXRhIGFsc29cclxuICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NpbXByb3Y6PiBJbXBvcnQgT3BlcmF0aW9uIENvbXBsZXRlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLnVwbG9hZGVkSnNvbkRhdGEgPSBbXTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pOyAvL1RvZG8gSGFuZGxlIERCIGVycm9yXHJcbiAgICB9XHJcblxyXG4gICAgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5leGlzdHNEQigpLnRoZW4odmFsdWUgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRiRXhpc3RzID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRiRXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChbdGhpcy5sb2NhbFN0b3JhZ2VHZXQoKSwgdGhpcy5sb2NhbFN0b3JhZ2VHZXQoJ3NpbXByb3ZVc2VyJyldKS50aGVuKHZhbHVlcyA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaW1wcm92U3RhdGVzID0gdmFsdWVzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNpbXByb3ZTdGF0ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVuZG9DVUlEID0gdGhpcy5zaW1wcm92U3RhdGVzW3RoaXMuc2ltcHJvdlN0YXRlcy5sZW5ndGggLSAyXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWRvQ1VJRCA9IHRoaXMuc2ltcHJvdlN0YXRlc1t0aGlzLnNpbXByb3ZTdGF0ZXMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXNlck5hbWUgPSB2YWx1ZXNbMV0udXNlcm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VyQ1VJRCA9IHZhbHVlc1sxXS51c2VyQ1VJRDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIFByb21pc2UuYWxsKFt0aGlzLmxvY2FsU3RvcmFnZVNldCh0aGlzLnNpbXByb3ZTdGF0ZXMpLCB0aGlzLmxvY2FsU3RvcmFnZVNldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMudXNlck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdXNlckNVSUQ6IHRoaXMudXNlckNVSURcclxuICAgICAgICAgICAgICAgIH0sICdzaW1wcm92VXNlcicpXSkudGhlbih2YWx1ZXMgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vblJlbG9hZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYlRvZ2dsZSA9IHRoaXMuZGJFeGlzdHM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemVEQigpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplREIoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRKc29uKCkgeyAvL1RvZG8ganNvbiB2YWxpZGF0aW9uXHJcbiAgICAgICAgbGV0IGRvY3VtZW50Qm9keSA9IGRvY3VtZW50LmJvZHk7XHJcbiAgICAgICAgbGV0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgICAgIGlucHV0LnR5cGUgPSBcImZpbGVcIjtcclxuICAgICAgICBpbnB1dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIGxldCByZWNlaXZlZFRleHQgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy51cGxvYWRlZEpzb25EYXRhID0gSlNPTi5wYXJzZShldmVudC50YXJnZXQucmVzdWx0KTtcclxuICAgICAgICAgICAgZG9jdW1lbnRCb2R5LnJlbW92ZUNoaWxkKGlucHV0KTtcclxuICAgICAgICAgICAgdGhpcy5pbXBvcnRQcm92ZW5hbmNlKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBsZXQgaGFuZGxlRmlsZVNlbGVjdCA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlc1swXTtcclxuICAgICAgICAgICAgbGV0IGZyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgICAgICAgZnIub25sb2FkID0gcmVjZWl2ZWRUZXh0O1xyXG4gICAgICAgICAgICBmci5yZWFkQXNUZXh0KGZpbGUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlRmlsZVNlbGVjdCwgdHJ1ZSk7XHJcbiAgICAgICAgZG9jdW1lbnRCb2R5LmFwcGVuZENoaWxkKGlucHV0KTtcclxuICAgICAgICBpbnB1dC5jbGljaygpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvY2FsU3RvcmFnZVNldChzdG9yYWdlRGF0YSwgdG9XaGVyZSA9ICdzaW1wcm92U3RhdGVzJykge1xyXG4gICAgICAgIGlmICh0b1doZXJlID09PSAnc2ltcHJvdlN0YXRlcycpIHtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odG9XaGVyZSwgSlNPTi5zdHJpbmdpZnkoc3RvcmFnZURhdGEpKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odG9XaGVyZSwgSlNPTi5zdHJpbmdpZnkoc3RvcmFnZURhdGEpKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsb2NhbFN0b3JhZ2VHZXQoZnJvbVdoZXJlID0gJ3NpbXByb3ZTdGF0ZXMnKSB7XHJcbiAgICAgICAgaWYgKGZyb21XaGVyZSA9PT0gJ3NpbXByb3ZTdGF0ZXMnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShmcm9tV2hlcmUpKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGZyb21XaGVyZSkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb2JqZWN0V3JhcHBlcihwcm92ZW5hbmNlRGF0YSkge1xyXG4gICAgICAgIGxldCB3cmFwcGVkT2JqZWN0ID0ge307XHJcbiAgICAgICAgd3JhcHBlZE9iamVjdC5zdGF0ZUNVSUQgPSBjdWlkKCk7XHJcbiAgICAgICAgd3JhcHBlZE9iamVjdC5wcm92ZW5hbmNlRGF0YSA9IHByb3ZlbmFuY2VEYXRhLnN0YXRlRGF0YTtcclxuICAgICAgICB3cmFwcGVkT2JqZWN0LnRpbWVTdGFtcCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgd3JhcHBlZE9iamVjdC51c2VybmFtZSA9IHRoaXMudXNlck5hbWU7XHJcbiAgICAgICAgd3JhcHBlZE9iamVjdC51c2VyQ1VJRCA9IHRoaXMudXNlckNVSUQ7XHJcbiAgICAgICAgd3JhcHBlZE9iamVjdC50aHVtYm5haWwgPSAnJztcclxuICAgICAgICB3cmFwcGVkT2JqZWN0LnN0YXRlSW5mbyA9IHByb3ZlbmFuY2VEYXRhLnN0YXRlSW5mbztcclxuICAgICAgICB3cmFwcGVkT2JqZWN0LmFubm90YXRpb24gPSAnJztcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHdyYXBwZWRPYmplY3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHVuZG9BY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudW5kb0NVSUQgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kb1RyaWdnZXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0T2JqZWN0KHRoaXMudW5kb0NVSUQpLnRoZW4ocmVjZWl2ZWRPYmplY3QgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXBsYXlUcmlnZ2VyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVwbGF5VHJpZ2dlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5yZXBsYXlUcmlnZ2VyRGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQ3VzdG9tRXZlbnQocmVjZWl2ZWRPYmplY3QsICdzaW1wcm92UmVwbGF5Jyk7XHJcbiAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2ltcHJvdlN0YXRlcy5pbmRleE9mKHRoaXMudW5kb0NVSUQpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVkb0NVSUQgPSB0aGlzLnVuZG9DVUlEO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudW5kb0NVSUQgPSB0aGlzLnNpbXByb3ZTdGF0ZXNbdGhpcy5zaW1wcm92U3RhdGVzLmluZGV4T2YodGhpcy51bmRvQ1VJRCkgLSAxXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudW5kb0NVSUQgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZG9DVUlEID0gdGhpcy5zaW1wcm92U3RhdGVzWzFdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NpbXByb3Y6PiBVbmRvIE9wZXJhdGlvbiBDb21wbGV0ZWQnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgfSk7IC8vVG9kbyBIYW5kbGUgREIgZXJyb3JcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTaW1wcm92Oj4gTm90aGluZyB0byBVbmRvJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVkb0FjdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5yZWRvQ1VJRCAhPT0gJycpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucmVkb0NVSUQgPT09IHRoaXMuc2ltcHJvdlN0YXRlc1t0aGlzLnNpbXByb3ZTdGF0ZXMubGVuZ3RoIC0gMV0pIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnVuZG9UcmlnZ2VyZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZG9BY3Rpb25IZWxwZXIoKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51bmRvVHJpZ2dlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NpbXByb3Y6PiBOb3RoaW5nIHRvIFJlZG8nKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWRvQWN0aW9uSGVscGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTaW1wcm92Oj4gTm90aGluZyB0byBSZWRvJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVkb0FjdGlvbkhlbHBlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRPYmplY3QodGhpcy5yZWRvQ1VJRCkudGhlbihyZWNlaXZlZE9iamVjdCA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucmVwbGF5VHJpZ2dlciA9IHRydWU7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXBsYXlUcmlnZ2VyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0sIHRoaXMucmVwbGF5VHJpZ2dlckRlbGF5KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQ3VzdG9tRXZlbnQocmVjZWl2ZWRPYmplY3QsICdzaW1wcm92UmVwbGF5Jyk7XHJcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNpbXByb3ZTdGF0ZXMuaW5kZXhPZih0aGlzLnJlZG9DVUlEKSA8IHRoaXMuc2ltcHJvdlN0YXRlcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVuZG9DVUlEID0gdGhpcy5yZWRvQ1VJRDtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVkb0NVSUQgPSB0aGlzLnNpbXByb3ZTdGF0ZXNbdGhpcy5zaW1wcm92U3RhdGVzLmluZGV4T2YodGhpcy5yZWRvQ1VJRCkgKyAxXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVkb0NVSUQgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2ltcHJvdjo+IFJlZG8gT3BlcmF0aW9uIENvbXBsZXRlZCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgfSk7IC8vVG9kbyBIYW5kbGUgREIgZXJyb3JcclxuICAgIH1cclxuXHJcbiAgICBjbGFzc1NpbXByb3ZDb3JlSW5mb3JtYXRpb24oKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1NpbXByb3Y6PiBUaGlzIGlzIENsYXNzIFNpbXByb3ZDb3JlJyk7XHJcbiAgICB9XHJcblxyXG59XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc291cmNlU2NyaXB0cy9zaW1wcm92Y29yZS5qcyIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhY2t1cCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaXNoR2lzdChnaXN0RGF0YSkge1xyXG4gICAgICAgIGxldCBwb3N0Q29udGVudCA9IHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTaW1wcm92IFByb3ZlbmFuY2UgRGF0YScsXHJcbiAgICAgICAgICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZmlsZXM6IHtcclxuICAgICAgICAgICAgICAgICdzaW1wcm92Lmpzb24nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogSlNPTi5zdHJpbmdpZnkoZ2lzdERhdGEpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBmZXRjaCgnaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9naXN0cycsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiAncG9zdCcsXHJcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBvc3RDb250ZW50KVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtkYXRhLmh0bWxfdXJsLCBkYXRhLmlkXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0cml2ZUdpc3QoZ2lzdElEKSB7IC8vVG9kbyBoYW5kbGUgaW52YWxpZCBJRFxyXG4gICAgICAgIGxldCBmZXRjaEZyb20gPSBgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9naXN0cy8ke2dpc3RJRH1gO1xyXG4gICAgICAgIHJldHVybiBmZXRjaChmZXRjaEZyb20sIHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0J1xyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKEpTT04ucGFyc2UoZGF0YS5maWxlc1snc2ltcHJvdi5qc29uJ10uY29udGVudCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGRvd25sb2FkSnNvbihqc29uRGF0YSkge1xyXG4gICAgICAgIGxldCBkYXRhID0gYHRleHQvanNvbjtjaGFyc2V0PXV0Zi04LCR7ZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGpzb25EYXRhKSl9YDtcclxuICAgICAgICBsZXQgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgICAgICBsaW5rLmhyZWYgPSBgZGF0YToke2RhdGF9YDtcclxuICAgICAgICBsaW5rLmRvd25sb2FkID0gJ3NpbXByb3YuanNvbic7XHJcbiAgICAgICAgbGV0IGRvY3VtZW50Qm9keSA9IGRvY3VtZW50LmJvZHk7XHJcbiAgICAgICAgZG9jdW1lbnRCb2R5LmFwcGVuZENoaWxkKGxpbmspO1xyXG4gICAgICAgIGxpbmsuY2xpY2soKTtcclxuICAgICAgICBkb2N1bWVudEJvZHkucmVtb3ZlQ2hpbGQobGluayk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzQmFja3VwSW5mb3JtYXRpb24oKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1NpbXByb3Y6PiBUaGlzIGlzIENsYXNzIEJhY2t1cCcpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zb3VyY2VTY3JpcHRzL2JhY2t1cC5qcyIsImltcG9ydCBEZXhpZSBmcm9tIFwiZGV4aWVcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFiYXNlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGIgPSBuZXcgRGV4aWUoXCJzaW1wcm92XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZERhdGEoZGF0YSwgc3RvcmVOYW1lID0gJ3Byb3ZlbmFuY2UnKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGJbc3RvcmVOYW1lXS5hZGQoZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgYnVsa0FkZERhdGEoYnVsa0RhdGEsIHN0b3JlTmFtZSA9ICdwcm92ZW5hbmNlJykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRiW3N0b3JlTmFtZV0uYnVsa0FkZChidWxrRGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJUYWJsZShzdG9yZU5hbWUgPSAncHJvdmVuYW5jZScpIHsgLy9Ub2RvIGNoZWNrIHRhYmxlIGV4aXN0c1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRiW3N0b3JlTmFtZV0uY2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkZWxldGVUYWJsZUNvbnRlbnRCeVByaW1hcnlLZXlcclxuICAgIGRlbGV0ZU9iamVjdChwcmltYXJ5S2V5LCBzdG9yZU5hbWUgPSAncHJvdmVuYW5jZScpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kYltzdG9yZU5hbWVdLmRlbGV0ZShwcmltYXJ5S2V5KTsgLy9Ub2RvIGNoZWNrIHRhYmxlIGV4aXN0c1xyXG4gICAgfVxyXG5cclxuICAgIGRlbGV0ZURCKGRiTmFtZSkgeyAvL1RvZG8gY2hlY2sgREIgZXhpc3RzXHJcbiAgICAgICAgdGhpcy5kYi5jbG9zZSgpO1xyXG4gICAgICAgIHJldHVybiBEZXhpZS5kZWxldGUoZGJOYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBleGlzdHNEQihkYk5hbWUgPSAnc2ltcHJvdicpIHtcclxuICAgICAgICByZXR1cm4gRGV4aWUuZXhpc3RzKGRiTmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZmV0Y2hBbGwoc3RvcmVOYW1lID0gJ3Byb3ZlbmFuY2UnKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGJbc3RvcmVOYW1lXS50b0FycmF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0T2JqZWN0KHByaW1hcnlLZXksIHN0b3JlTmFtZSA9ICdwcm92ZW5hbmNlJykgeyAvL1RvZG8gY2hlY2sgdGFibGUgZXhpc3RzXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGJbc3RvcmVOYW1lXS5nZXQocHJpbWFyeUtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdGlhbGl6ZURCKCkge1xyXG4gICAgICAgIHRoaXMuZGIudmVyc2lvbigxKS5zdG9yZXMoe1xyXG4gICAgICAgICAgICBwcm92ZW5hbmNlOiBcInN0YXRlQ1VJRFwiXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbGlzdEFsbERCKCkge1xyXG4gICAgICAgIHJldHVybiBEZXhpZS5nZXREYXRhYmFzZU5hbWVzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGFibGVDb3VudChzdG9yZU5hbWUgPSAncHJvdmVuYW5jZScpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRiW3N0b3JlTmFtZV0uY291bnQoKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVPYmplY3QocHJpbWFyeUtleSwgdXBkYXRlLCBzdG9yZU5hbWUgPSAncHJvdmVuYW5jZScpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kYltzdG9yZU5hbWVdLnVwZGF0ZShwcmltYXJ5S2V5LCB1cGRhdGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzRGF0YWJhc2VJbmZvcm1hdGlvbigpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnU2ltcHJvdjo+IFRoaXMgaXMgQ2xhc3MgRGF0YWJhc2UnKTtcclxuICAgIH1cclxufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NvdXJjZVNjcmlwdHMvZGF0YWJhc2UuanMiLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBWZW5kb3JIb29rcyB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIH1cclxuXHJcbiAgICBpc0RDSW5pdGlhbGl6ZWQoKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuZGMgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHRocm93ICc+IGRjLmpzIGlzIG5vdCBpbml0aWFsaXplZCc7XHJcbiAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTaW1wcm92Oj4gZGMuanMgaXMgaW5pdGlhbGl6ZWQnKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBkY1JlZ2lzdHJ5KC4uLmV4Y2x1ZGUpIHtcclxuICAgICAgICB0aGlzLmlzRENJbml0aWFsaXplZCgpO1xyXG4gICAgICAgIGxldCB0ZW1wQ2hhcnRSZWdpc3RyeSA9IFsuLi5kYy5jaGFydFJlZ2lzdHJ5Lmxpc3QoKV07XHJcbiAgICAgICAgaWYgKGV4Y2x1ZGUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBleGNsdWRlLnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhIC0gYjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGV4Y2x1ZGUuZm9yRWFjaCgoaXRlbSwgaW5kZXgsIGFycmF5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhcnJheVtpbmRleF0gPSBpdGVtIC0gMTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHdoaWxlIChleGNsdWRlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGVtcENoYXJ0UmVnaXN0cnkuc3BsaWNlKGV4Y2x1ZGUucG9wKCksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0ZW1wQ2hhcnRSZWdpc3RyeTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0ZW1wQ2hhcnRSZWdpc3RyeTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3NWZW5kb3JIb29rc2VJbmZvcm1hdGlvbigpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnU2ltcHJvdjo+IFRoaXMgaXMgQ2xhc3MgVmVuZG9ySG9va3MnKTtcclxuICAgIH1cclxufVxyXG5cclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc291cmNlU2NyaXB0cy92ZW5kb3Job29rcy5qcyIsIi8qKlxuICogY3VpZC5qc1xuICogQ29sbGlzaW9uLXJlc2lzdGFudCBVSUQgZ2VuZXJhdG9yIGZvciBicm93c2VycyBhbmQgbm9kZS5cbiAqIFNlcXVlbnRpYWwgZm9yIGZhc3QgZGIgbG9va3VwcyBhbmQgcmVjZW5jeSBzb3J0aW5nLlxuICogU2FmZSBmb3IgZWxlbWVudCBJRHMgYW5kIHNlcnZlci1zaWRlIGxvb2t1cHMuXG4gKlxuICogRXh0cmFjdGVkIGZyb20gQ0xDVFJcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIEVyaWMgRWxsaW90dCAyMDEyXG4gKiBNSVQgTGljZW5zZVxuICovXG5cbi8qZ2xvYmFsIHdpbmRvdywgbmF2aWdhdG9yLCBkb2N1bWVudCwgcmVxdWlyZSwgcHJvY2VzcywgbW9kdWxlICovXG4oZnVuY3Rpb24gKGFwcCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBuYW1lc3BhY2UgPSAnY3VpZCcsXG4gICAgYyA9IDAsXG4gICAgYmxvY2tTaXplID0gNCxcbiAgICBiYXNlID0gMzYsXG4gICAgZGlzY3JldGVWYWx1ZXMgPSBNYXRoLnBvdyhiYXNlLCBibG9ja1NpemUpLFxuXG4gICAgcGFkID0gZnVuY3Rpb24gcGFkKG51bSwgc2l6ZSkge1xuICAgICAgdmFyIHMgPSBcIjAwMDAwMDAwMFwiICsgbnVtO1xuICAgICAgcmV0dXJuIHMuc3Vic3RyKHMubGVuZ3RoLXNpemUpO1xuICAgIH0sXG5cbiAgICByYW5kb21CbG9jayA9IGZ1bmN0aW9uIHJhbmRvbUJsb2NrKCkge1xuICAgICAgcmV0dXJuIHBhZCgoTWF0aC5yYW5kb20oKSAqXG4gICAgICAgICAgICBkaXNjcmV0ZVZhbHVlcyA8PCAwKVxuICAgICAgICAgICAgLnRvU3RyaW5nKGJhc2UpLCBibG9ja1NpemUpO1xuICAgIH0sXG5cbiAgICBzYWZlQ291bnRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGMgPSAoYyA8IGRpc2NyZXRlVmFsdWVzKSA/IGMgOiAwO1xuICAgICAgYysrOyAvLyB0aGlzIGlzIG5vdCBzdWJsaW1pbmFsXG4gICAgICByZXR1cm4gYyAtIDE7XG4gICAgfSxcblxuICAgIGFwaSA9IGZ1bmN0aW9uIGN1aWQoKSB7XG4gICAgICAvLyBTdGFydGluZyB3aXRoIGEgbG93ZXJjYXNlIGxldHRlciBtYWtlc1xuICAgICAgLy8gaXQgSFRNTCBlbGVtZW50IElEIGZyaWVuZGx5LlxuICAgICAgdmFyIGxldHRlciA9ICdjJywgLy8gaGFyZC1jb2RlZCBhbGxvd3MgZm9yIHNlcXVlbnRpYWwgYWNjZXNzXG5cbiAgICAgICAgLy8gdGltZXN0YW1wXG4gICAgICAgIC8vIHdhcm5pbmc6IHRoaXMgZXhwb3NlcyB0aGUgZXhhY3QgZGF0ZSBhbmQgdGltZVxuICAgICAgICAvLyB0aGF0IHRoZSB1aWQgd2FzIGNyZWF0ZWQuXG4gICAgICAgIHRpbWVzdGFtcCA9IChuZXcgRGF0ZSgpLmdldFRpbWUoKSkudG9TdHJpbmcoYmFzZSksXG5cbiAgICAgICAgLy8gUHJldmVudCBzYW1lLW1hY2hpbmUgY29sbGlzaW9ucy5cbiAgICAgICAgY291bnRlcixcblxuICAgICAgICAvLyBBIGZldyBjaGFycyB0byBnZW5lcmF0ZSBkaXN0aW5jdCBpZHMgZm9yIGRpZmZlcmVudFxuICAgICAgICAvLyBjbGllbnRzIChzbyBkaWZmZXJlbnQgY29tcHV0ZXJzIGFyZSBmYXIgbGVzc1xuICAgICAgICAvLyBsaWtlbHkgdG8gZ2VuZXJhdGUgdGhlIHNhbWUgaWQpXG4gICAgICAgIGZpbmdlcnByaW50ID0gYXBpLmZpbmdlcnByaW50KCksXG5cbiAgICAgICAgLy8gR3JhYiBzb21lIG1vcmUgY2hhcnMgZnJvbSBNYXRoLnJhbmRvbSgpXG4gICAgICAgIHJhbmRvbSA9IHJhbmRvbUJsb2NrKCkgKyByYW5kb21CbG9jaygpO1xuXG4gICAgICAgIGNvdW50ZXIgPSBwYWQoc2FmZUNvdW50ZXIoKS50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKTtcblxuICAgICAgcmV0dXJuICAobGV0dGVyICsgdGltZXN0YW1wICsgY291bnRlciArIGZpbmdlcnByaW50ICsgcmFuZG9tKTtcbiAgICB9O1xuXG4gIGFwaS5zbHVnID0gZnVuY3Rpb24gc2x1ZygpIHtcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLnRvU3RyaW5nKDM2KSxcbiAgICAgIGNvdW50ZXIsXG4gICAgICBwcmludCA9IGFwaS5maW5nZXJwcmludCgpLnNsaWNlKDAsMSkgK1xuICAgICAgICBhcGkuZmluZ2VycHJpbnQoKS5zbGljZSgtMSksXG4gICAgICByYW5kb20gPSByYW5kb21CbG9jaygpLnNsaWNlKC0yKTtcblxuICAgICAgY291bnRlciA9IHNhZmVDb3VudGVyKCkudG9TdHJpbmcoMzYpLnNsaWNlKC00KTtcblxuICAgIHJldHVybiBkYXRlLnNsaWNlKC0yKSArXG4gICAgICBjb3VudGVyICsgcHJpbnQgKyByYW5kb207XG4gIH07XG5cbiAgYXBpLmdsb2JhbENvdW50ID0gZnVuY3Rpb24gZ2xvYmFsQ291bnQoKSB7XG4gICAgLy8gV2Ugd2FudCB0byBjYWNoZSB0aGUgcmVzdWx0cyBvZiB0aGlzXG4gICAgdmFyIGNhY2hlID0gKGZ1bmN0aW9uIGNhbGMoKSB7XG4gICAgICAgIHZhciBpLFxuICAgICAgICAgIGNvdW50ID0gMDtcblxuICAgICAgICBmb3IgKGkgaW4gd2luZG93KSB7XG4gICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICAgIH0oKSk7XG5cbiAgICBhcGkuZ2xvYmFsQ291bnQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBjYWNoZTsgfTtcbiAgICByZXR1cm4gY2FjaGU7XG4gIH07XG5cbiAgYXBpLmZpbmdlcnByaW50ID0gZnVuY3Rpb24gYnJvd3NlclByaW50KCkge1xuICAgIHJldHVybiBwYWQoKG5hdmlnYXRvci5taW1lVHlwZXMubGVuZ3RoICtcbiAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQubGVuZ3RoKS50b1N0cmluZygzNikgK1xuICAgICAgYXBpLmdsb2JhbENvdW50KCkudG9TdHJpbmcoMzYpLCA0KTtcbiAgfTtcblxuICAvLyBkb24ndCBjaGFuZ2UgYW55dGhpbmcgZnJvbSBoZXJlIGRvd24uXG4gIGlmIChhcHAucmVnaXN0ZXIpIHtcbiAgICBhcHAucmVnaXN0ZXIobmFtZXNwYWNlLCBhcGkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBhcGk7XG4gIH0gZWxzZSB7XG4gICAgYXBwW25hbWVzcGFjZV0gPSBhcGk7XG4gIH1cblxufSh0aGlzLmFwcGxpdHVkZSB8fCB0aGlzKSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3VpZC9kaXN0L2Jyb3dzZXItY3VpZC5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgIChnbG9iYWwuRGV4aWUgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbi8qXHJcbiogRGV4aWUuanMgLSBhIG1pbmltYWxpc3RpYyB3cmFwcGVyIGZvciBJbmRleGVkREJcclxuKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4qXHJcbiogQnkgRGF2aWQgRmFobGFuZGVyLCBkYXZpZC5mYWhsYW5kZXJAZ21haWwuY29tXHJcbipcclxuKiBWZXJzaW9uIDEuNS4xLCBUdWUgTm92IDAxIDIwMTZcclxuKiB3d3cuZGV4aWUuY29tXHJcbiogQXBhY2hlIExpY2Vuc2UgVmVyc2lvbiAyLjAsIEphbnVhcnkgMjAwNCwgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL1xyXG4qL1xudmFyIGtleXMgPSBPYmplY3Qua2V5cztcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbnZhciBfZ2xvYmFsID0gdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsO1xuXG5mdW5jdGlvbiBleHRlbmQob2JqLCBleHRlbnNpb24pIHtcbiAgICBpZiAodHlwZW9mIGV4dGVuc2lvbiAhPT0gJ29iamVjdCcpIHJldHVybiBvYmo7XG4gICAga2V5cyhleHRlbnNpb24pLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBvYmpba2V5XSA9IGV4dGVuc2lvbltrZXldO1xuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG59XG5cbnZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbnZhciBfaGFzT3duID0ge30uaGFzT3duUHJvcGVydHk7XG5mdW5jdGlvbiBoYXNPd24ob2JqLCBwcm9wKSB7XG4gICAgcmV0dXJuIF9oYXNPd24uY2FsbChvYmosIHByb3ApO1xufVxuXG5mdW5jdGlvbiBwcm9wcyhwcm90bywgZXh0ZW5zaW9uKSB7XG4gICAgaWYgKHR5cGVvZiBleHRlbnNpb24gPT09ICdmdW5jdGlvbicpIGV4dGVuc2lvbiA9IGV4dGVuc2lvbihnZXRQcm90byhwcm90bykpO1xuICAgIGtleXMoZXh0ZW5zaW9uKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgc2V0UHJvcChwcm90bywga2V5LCBleHRlbnNpb25ba2V5XSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldFByb3Aob2JqLCBwcm9wLCBmdW5jdGlvbk9yR2V0U2V0LCBvcHRpb25zKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcCwgZXh0ZW5kKGZ1bmN0aW9uT3JHZXRTZXQgJiYgaGFzT3duKGZ1bmN0aW9uT3JHZXRTZXQsIFwiZ2V0XCIpICYmIHR5cGVvZiBmdW5jdGlvbk9yR2V0U2V0LmdldCA9PT0gJ2Z1bmN0aW9uJyA/IHsgZ2V0OiBmdW5jdGlvbk9yR2V0U2V0LmdldCwgc2V0OiBmdW5jdGlvbk9yR2V0U2V0LnNldCwgY29uZmlndXJhYmxlOiB0cnVlIH0gOiB7IHZhbHVlOiBmdW5jdGlvbk9yR2V0U2V0LCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0sIG9wdGlvbnMpKTtcbn1cblxuZnVuY3Rpb24gZGVyaXZlKENoaWxkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZnJvbTogZnVuY3Rpb24gKFBhcmVudCkge1xuICAgICAgICAgICAgQ2hpbGQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQYXJlbnQucHJvdG90eXBlKTtcbiAgICAgICAgICAgIHNldFByb3AoQ2hpbGQucHJvdG90eXBlLCBcImNvbnN0cnVjdG9yXCIsIENoaWxkKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXh0ZW5kOiBwcm9wcy5iaW5kKG51bGwsIENoaWxkLnByb3RvdHlwZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuZnVuY3Rpb24gZ2V0UHJvcGVydHlEZXNjcmlwdG9yKG9iaiwgcHJvcCkge1xuICAgIHZhciBwZCA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIHByb3ApLFxuICAgICAgICBwcm90bztcbiAgICByZXR1cm4gcGQgfHwgKHByb3RvID0gZ2V0UHJvdG8ob2JqKSkgJiYgZ2V0UHJvcGVydHlEZXNjcmlwdG9yKHByb3RvLCBwcm9wKTtcbn1cblxudmFyIF9zbGljZSA9IFtdLnNsaWNlO1xuZnVuY3Rpb24gc2xpY2UoYXJncywgc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBfc2xpY2UuY2FsbChhcmdzLCBzdGFydCwgZW5kKTtcbn1cblxuZnVuY3Rpb24gb3ZlcnJpZGUob3JpZ0Z1bmMsIG92ZXJyaWRlZEZhY3RvcnkpIHtcbiAgICByZXR1cm4gb3ZlcnJpZGVkRmFjdG9yeShvcmlnRnVuYyk7XG59XG5cbmZ1bmN0aW9uIGRvRmFrZUF1dG9Db21wbGV0ZShmbikge1xuICAgIHZhciB0byA9IHNldFRpbWVvdXQoZm4sIDEwMDApO1xuICAgIGNsZWFyVGltZW91dCh0byk7XG59XG5cbmZ1bmN0aW9uIGFzc2VydChiKSB7XG4gICAgaWYgKCFiKSB0aHJvdyBuZXcgRXJyb3IoXCJBc3NlcnRpb24gRmFpbGVkXCIpO1xufVxuXG5mdW5jdGlvbiBhc2FwKGZuKSB7XG4gICAgaWYgKF9nbG9iYWwuc2V0SW1tZWRpYXRlKSBzZXRJbW1lZGlhdGUoZm4pO2Vsc2Ugc2V0VGltZW91dChmbiwgMCk7XG59XG5cblxuXG4vKiogR2VuZXJhdGUgYW4gb2JqZWN0IChoYXNoIG1hcCkgYmFzZWQgb24gZ2l2ZW4gYXJyYXkuXHJcbiAqIEBwYXJhbSBleHRyYWN0b3IgRnVuY3Rpb24gdGFraW5nIGFuIGFycmF5IGl0ZW0gYW5kIGl0cyBpbmRleCBhbmQgcmV0dXJuaW5nIGFuIGFycmF5IG9mIDIgaXRlbXMgKFtrZXksIHZhbHVlXSkgdG9cclxuICogICAgICAgIGluc3RlcnQgb24gdGhlIHJlc3VsdGluZyBvYmplY3QgZm9yIGVhY2ggaXRlbSBpbiB0aGUgYXJyYXkuIElmIHRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIGZhbHN5IHZhbHVlLCB0aGVcclxuICogICAgICAgIGN1cnJlbnQgaXRlbSB3b250IGFmZmVjdCB0aGUgcmVzdWx0aW5nIG9iamVjdC5cclxuICovXG5mdW5jdGlvbiBhcnJheVRvT2JqZWN0KGFycmF5LCBleHRyYWN0b3IpIHtcbiAgICByZXR1cm4gYXJyYXkucmVkdWNlKGZ1bmN0aW9uIChyZXN1bHQsIGl0ZW0sIGkpIHtcbiAgICAgICAgdmFyIG5hbWVBbmRWYWx1ZSA9IGV4dHJhY3RvcihpdGVtLCBpKTtcbiAgICAgICAgaWYgKG5hbWVBbmRWYWx1ZSkgcmVzdWx0W25hbWVBbmRWYWx1ZVswXV0gPSBuYW1lQW5kVmFsdWVbMV07XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge30pO1xufVxuXG5mdW5jdGlvbiB0cnljYXRjaGVyKGZuLCByZWplY3QpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9uZXJyb3IsIGFyZ3MpIHtcbiAgICB0cnkge1xuICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBvbmVycm9yICYmIG9uZXJyb3IoZXgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0QnlLZXlQYXRoKG9iaiwga2V5UGF0aCkge1xuICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL0luZGV4ZWREQi8jc3RlcHMtZm9yLWV4dHJhY3RpbmctYS1rZXktZnJvbS1hLXZhbHVlLXVzaW5nLWEta2V5LXBhdGhcbiAgICBpZiAoaGFzT3duKG9iaiwga2V5UGF0aCkpIHJldHVybiBvYmpba2V5UGF0aF07IC8vIFRoaXMgbGluZSBpcyBtb3ZlZCBmcm9tIGxhc3QgdG8gZmlyc3QgZm9yIG9wdGltaXphdGlvbiBwdXJwb3NlLlxuICAgIGlmICgha2V5UGF0aCkgcmV0dXJuIG9iajtcbiAgICBpZiAodHlwZW9mIGtleVBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHZhciBydiA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGtleVBhdGgubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gZ2V0QnlLZXlQYXRoKG9iaiwga2V5UGF0aFtpXSk7XG4gICAgICAgICAgICBydi5wdXNoKHZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJ2O1xuICAgIH1cbiAgICB2YXIgcGVyaW9kID0ga2V5UGF0aC5pbmRleE9mKCcuJyk7XG4gICAgaWYgKHBlcmlvZCAhPT0gLTEpIHtcbiAgICAgICAgdmFyIGlubmVyT2JqID0gb2JqW2tleVBhdGguc3Vic3RyKDAsIHBlcmlvZCldO1xuICAgICAgICByZXR1cm4gaW5uZXJPYmogPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGdldEJ5S2V5UGF0aChpbm5lck9iaiwga2V5UGF0aC5zdWJzdHIocGVyaW9kICsgMSkpO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBzZXRCeUtleVBhdGgob2JqLCBrZXlQYXRoLCB2YWx1ZSkge1xuICAgIGlmICghb2JqIHx8IGtleVBhdGggPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgIGlmICgnaXNGcm96ZW4nIGluIE9iamVjdCAmJiBPYmplY3QuaXNGcm96ZW4ob2JqKSkgcmV0dXJuO1xuICAgIGlmICh0eXBlb2Yga2V5UGF0aCAhPT0gJ3N0cmluZycgJiYgJ2xlbmd0aCcgaW4ga2V5UGF0aCkge1xuICAgICAgICBhc3NlcnQodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyAmJiAnbGVuZ3RoJyBpbiB2YWx1ZSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0ga2V5UGF0aC5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICAgIHNldEJ5S2V5UGF0aChvYmosIGtleVBhdGhbaV0sIHZhbHVlW2ldKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwZXJpb2QgPSBrZXlQYXRoLmluZGV4T2YoJy4nKTtcbiAgICAgICAgaWYgKHBlcmlvZCAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50S2V5UGF0aCA9IGtleVBhdGguc3Vic3RyKDAsIHBlcmlvZCk7XG4gICAgICAgICAgICB2YXIgcmVtYWluaW5nS2V5UGF0aCA9IGtleVBhdGguc3Vic3RyKHBlcmlvZCArIDEpO1xuICAgICAgICAgICAgaWYgKHJlbWFpbmluZ0tleVBhdGggPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkgZGVsZXRlIG9ialtjdXJyZW50S2V5UGF0aF07ZWxzZSBvYmpbY3VycmVudEtleVBhdGhdID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBpbm5lck9iaiA9IG9ialtjdXJyZW50S2V5UGF0aF07XG4gICAgICAgICAgICAgICAgaWYgKCFpbm5lck9iaikgaW5uZXJPYmogPSBvYmpbY3VycmVudEtleVBhdGhdID0ge307XG4gICAgICAgICAgICAgICAgc2V0QnlLZXlQYXRoKGlubmVyT2JqLCByZW1haW5pbmdLZXlQYXRoLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkgZGVsZXRlIG9ialtrZXlQYXRoXTtlbHNlIG9ialtrZXlQYXRoXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkZWxCeUtleVBhdGgob2JqLCBrZXlQYXRoKSB7XG4gICAgaWYgKHR5cGVvZiBrZXlQYXRoID09PSAnc3RyaW5nJykgc2V0QnlLZXlQYXRoKG9iaiwga2V5UGF0aCwgdW5kZWZpbmVkKTtlbHNlIGlmICgnbGVuZ3RoJyBpbiBrZXlQYXRoKSBbXS5tYXAuY2FsbChrZXlQYXRoLCBmdW5jdGlvbiAoa3ApIHtcbiAgICAgICAgc2V0QnlLZXlQYXRoKG9iaiwga3AsIHVuZGVmaW5lZCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNoYWxsb3dDbG9uZShvYmopIHtcbiAgICB2YXIgcnYgPSB7fTtcbiAgICBmb3IgKHZhciBtIGluIG9iaikge1xuICAgICAgICBpZiAoaGFzT3duKG9iaiwgbSkpIHJ2W21dID0gb2JqW21dO1xuICAgIH1cbiAgICByZXR1cm4gcnY7XG59XG5cbmZ1bmN0aW9uIGRlZXBDbG9uZShhbnkpIHtcbiAgICBpZiAoIWFueSB8fCB0eXBlb2YgYW55ICE9PSAnb2JqZWN0JykgcmV0dXJuIGFueTtcbiAgICB2YXIgcnY7XG4gICAgaWYgKGlzQXJyYXkoYW55KSkge1xuICAgICAgICBydiA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFueS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICAgIHJ2LnB1c2goZGVlcENsb25lKGFueVtpXSkpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChhbnkgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIHJ2ID0gbmV3IERhdGUoKTtcbiAgICAgICAgcnYuc2V0VGltZShhbnkuZ2V0VGltZSgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBydiA9IGFueS5jb25zdHJ1Y3RvciA/IE9iamVjdC5jcmVhdGUoYW55LmNvbnN0cnVjdG9yLnByb3RvdHlwZSkgOiB7fTtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBhbnkpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24oYW55LCBwcm9wKSkge1xuICAgICAgICAgICAgICAgIHJ2W3Byb3BdID0gZGVlcENsb25lKGFueVtwcm9wXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJ2O1xufVxuXG5mdW5jdGlvbiBnZXRPYmplY3REaWZmKGEsIGIsIHJ2LCBwcmZ4KSB7XG4gICAgLy8gQ29tcGFyZXMgb2JqZWN0cyBhIGFuZCBiIGFuZCBwcm9kdWNlcyBhIGRpZmYgb2JqZWN0LlxuICAgIHJ2ID0gcnYgfHwge307XG4gICAgcHJmeCA9IHByZnggfHwgJyc7XG4gICAga2V5cyhhKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgIGlmICghaGFzT3duKGIsIHByb3ApKSBydltwcmZ4ICsgcHJvcF0gPSB1bmRlZmluZWQ7IC8vIFByb3BlcnR5IHJlbW92ZWRcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGFwID0gYVtwcm9wXSxcbiAgICAgICAgICAgICAgICAgICAgYnAgPSBiW3Byb3BdO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYXAgPT09ICdvYmplY3QnICYmIHR5cGVvZiBicCA9PT0gJ29iamVjdCcgJiYgYXAgJiYgYnAgJiYgYXAuY29uc3RydWN0b3IgPT09IGJwLmNvbnN0cnVjdG9yKVxuICAgICAgICAgICAgICAgICAgICAvLyBTYW1lIHR5cGUgb2Ygb2JqZWN0IGJ1dCBpdHMgcHJvcGVydGllcyBtYXkgaGF2ZSBjaGFuZ2VkXG4gICAgICAgICAgICAgICAgICAgIGdldE9iamVjdERpZmYoYXAsIGJwLCBydiwgcHJmeCArIHByb3AgKyBcIi5cIik7ZWxzZSBpZiAoYXAgIT09IGJwKSBydltwcmZ4ICsgcHJvcF0gPSBiW3Byb3BdOyAvLyBQcmltaXRpdmUgdmFsdWUgY2hhbmdlZFxuICAgICAgICAgICAgfVxuICAgIH0pO1xuICAgIGtleXMoYikuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xuICAgICAgICBpZiAoIWhhc093bihhLCBwcm9wKSkge1xuICAgICAgICAgICAgcnZbcHJmeCArIHByb3BdID0gYltwcm9wXTsgLy8gUHJvcGVydHkgYWRkZWRcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBydjtcbn1cblxuLy8gSWYgZmlyc3QgYXJndW1lbnQgaXMgaXRlcmFibGUgb3IgYXJyYXktbGlrZSwgcmV0dXJuIGl0IGFzIGFuIGFycmF5XG52YXIgaXRlcmF0b3JTeW1ib2wgPSB0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wuaXRlcmF0b3I7XG52YXIgZ2V0SXRlcmF0b3JPZiA9IGl0ZXJhdG9yU3ltYm9sID8gZnVuY3Rpb24gKHgpIHtcbiAgICB2YXIgaTtcbiAgICByZXR1cm4geCAhPSBudWxsICYmIChpID0geFtpdGVyYXRvclN5bWJvbF0pICYmIGkuYXBwbHkoeCk7XG59IDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBudWxsO1xufTtcblxudmFyIE5PX0NIQVJfQVJSQVkgPSB7fTtcbi8vIFRha2VzIG9uZSBvciBzZXZlcmFsIGFyZ3VtZW50cyBhbmQgcmV0dXJucyBhbiBhcnJheSBiYXNlZCBvbiB0aGUgZm9sbG93aW5nIGNyaXRlcmFzOlxuLy8gKiBJZiBzZXZlcmFsIGFyZ3VtZW50cyBwcm92aWRlZCwgcmV0dXJuIGFyZ3VtZW50cyBjb252ZXJ0ZWQgdG8gYW4gYXJyYXkgaW4gYSB3YXkgdGhhdFxuLy8gICBzdGlsbCBhbGxvd3MgamF2YXNjcmlwdCBlbmdpbmUgdG8gb3B0aW1pemUgdGhlIGNvZGUuXG4vLyAqIElmIHNpbmdsZSBhcmd1bWVudCBpcyBhbiBhcnJheSwgcmV0dXJuIGEgY2xvbmUgb2YgaXQuXG4vLyAqIElmIHRoaXMtcG9pbnRlciBlcXVhbHMgTk9fQ0hBUl9BUlJBWSwgZG9uJ3QgYWNjZXB0IHN0cmluZ3MgYXMgdmFsaWQgaXRlcmFibGVzIGFzIGEgc3BlY2lhbFxuLy8gICBjYXNlIHRvIHRoZSB0d28gYnVsbGV0cyBiZWxvdy5cbi8vICogSWYgc2luZ2xlIGFyZ3VtZW50IGlzIGFuIGl0ZXJhYmxlLCBjb252ZXJ0IGl0IHRvIGFuIGFycmF5IGFuZCByZXR1cm4gdGhlIHJlc3VsdGluZyBhcnJheS5cbi8vICogSWYgc2luZ2xlIGFyZ3VtZW50IGlzIGFycmF5LWxpa2UgKGhhcyBsZW5ndGggb2YgdHlwZSBudW1iZXIpLCBjb252ZXJ0IGl0IHRvIGFuIGFycmF5LlxuZnVuY3Rpb24gZ2V0QXJyYXlPZihhcnJheUxpa2UpIHtcbiAgICB2YXIgaSwgYSwgeCwgaXQ7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkoYXJyYXlMaWtlKSkgcmV0dXJuIGFycmF5TGlrZS5zbGljZSgpO1xuICAgICAgICBpZiAodGhpcyA9PT0gTk9fQ0hBUl9BUlJBWSAmJiB0eXBlb2YgYXJyYXlMaWtlID09PSAnc3RyaW5nJykgcmV0dXJuIFthcnJheUxpa2VdO1xuICAgICAgICBpZiAoaXQgPSBnZXRJdGVyYXRvck9mKGFycmF5TGlrZSkpIHtcbiAgICAgICAgICAgIGEgPSBbXTtcbiAgICAgICAgICAgIHdoaWxlICh4ID0gaXQubmV4dCgpLCAheC5kb25lKSB7XG4gICAgICAgICAgICAgICAgYS5wdXNoKHgudmFsdWUpO1xuICAgICAgICAgICAgfXJldHVybiBhO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcnJheUxpa2UgPT0gbnVsbCkgcmV0dXJuIFthcnJheUxpa2VdO1xuICAgICAgICBpID0gYXJyYXlMaWtlLmxlbmd0aDtcbiAgICAgICAgaWYgKHR5cGVvZiBpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgYSA9IG5ldyBBcnJheShpKTtcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICBhW2ldID0gYXJyYXlMaWtlW2ldO1xuICAgICAgICAgICAgfXJldHVybiBhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbYXJyYXlMaWtlXTtcbiAgICB9XG4gICAgaSA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYSA9IG5ldyBBcnJheShpKTtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGFbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfXJldHVybiBhO1xufVxuXG52YXIgY29uY2F0ID0gW10uY29uY2F0O1xuZnVuY3Rpb24gZmxhdHRlbihhKSB7XG4gICAgcmV0dXJuIGNvbmNhdC5hcHBseShbXSwgYSk7XG59XG5cbmZ1bmN0aW9uIG5vcCgpIHt9XG5mdW5jdGlvbiBtaXJyb3IodmFsKSB7XG4gICAgcmV0dXJuIHZhbDtcbn1cbmZ1bmN0aW9uIHB1cmVGdW5jdGlvbkNoYWluKGYxLCBmMikge1xuICAgIC8vIEVuYWJsZXMgY2hhaW5lZCBldmVudHMgdGhhdCB0YWtlcyBPTkUgYXJndW1lbnQgYW5kIHJldHVybnMgaXQgdG8gdGhlIG5leHQgZnVuY3Rpb24gaW4gY2hhaW4uXG4gICAgLy8gVGhpcyBwYXR0ZXJuIGlzIHVzZWQgaW4gdGhlIGhvb2soXCJyZWFkaW5nXCIpIGV2ZW50LlxuICAgIGlmIChmMSA9PSBudWxsIHx8IGYxID09PSBtaXJyb3IpIHJldHVybiBmMjtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICByZXR1cm4gZjIoZjEodmFsKSk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gY2FsbEJvdGgob24xLCBvbjIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBvbjEuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgb24yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gaG9va0NyZWF0aW5nQ2hhaW4oZjEsIGYyKSB7XG4gICAgLy8gRW5hYmxlcyBjaGFpbmVkIGV2ZW50cyB0aGF0IHRha2VzIHNldmVyYWwgYXJndW1lbnRzIGFuZCBtYXkgbW9kaWZ5IGZpcnN0IGFyZ3VtZW50IGJ5IG1ha2luZyBhIG1vZGlmaWNhdGlvbiBhbmQgdGhlbiByZXR1cm5pbmcgdGhlIHNhbWUgaW5zdGFuY2UuXG4gICAgLy8gVGhpcyBwYXR0ZXJuIGlzIHVzZWQgaW4gdGhlIGhvb2soXCJjcmVhdGluZ1wiKSBldmVudC5cbiAgICBpZiAoZjEgPT09IG5vcCkgcmV0dXJuIGYyO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXMgPSBmMS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBpZiAocmVzICE9PSB1bmRlZmluZWQpIGFyZ3VtZW50c1swXSA9IHJlcztcbiAgICAgICAgdmFyIG9uc3VjY2VzcyA9IHRoaXMub25zdWNjZXNzLFxuICAgICAgICAgICAgLy8gSW4gY2FzZSBldmVudCBsaXN0ZW5lciBoYXMgc2V0IHRoaXMub25zdWNjZXNzXG4gICAgICAgIG9uZXJyb3IgPSB0aGlzLm9uZXJyb3I7IC8vIEluIGNhc2UgZXZlbnQgbGlzdGVuZXIgaGFzIHNldCB0aGlzLm9uZXJyb3JcbiAgICAgICAgdGhpcy5vbnN1Y2Nlc3MgPSBudWxsO1xuICAgICAgICB0aGlzLm9uZXJyb3IgPSBudWxsO1xuICAgICAgICB2YXIgcmVzMiA9IGYyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGlmIChvbnN1Y2Nlc3MpIHRoaXMub25zdWNjZXNzID0gdGhpcy5vbnN1Y2Nlc3MgPyBjYWxsQm90aChvbnN1Y2Nlc3MsIHRoaXMub25zdWNjZXNzKSA6IG9uc3VjY2VzcztcbiAgICAgICAgaWYgKG9uZXJyb3IpIHRoaXMub25lcnJvciA9IHRoaXMub25lcnJvciA/IGNhbGxCb3RoKG9uZXJyb3IsIHRoaXMub25lcnJvcikgOiBvbmVycm9yO1xuICAgICAgICByZXR1cm4gcmVzMiAhPT0gdW5kZWZpbmVkID8gcmVzMiA6IHJlcztcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBob29rRGVsZXRpbmdDaGFpbihmMSwgZjIpIHtcbiAgICBpZiAoZjEgPT09IG5vcCkgcmV0dXJuIGYyO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGYxLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciBvbnN1Y2Nlc3MgPSB0aGlzLm9uc3VjY2VzcyxcbiAgICAgICAgICAgIC8vIEluIGNhc2UgZXZlbnQgbGlzdGVuZXIgaGFzIHNldCB0aGlzLm9uc3VjY2Vzc1xuICAgICAgICBvbmVycm9yID0gdGhpcy5vbmVycm9yOyAvLyBJbiBjYXNlIGV2ZW50IGxpc3RlbmVyIGhhcyBzZXQgdGhpcy5vbmVycm9yXG4gICAgICAgIHRoaXMub25zdWNjZXNzID0gdGhpcy5vbmVycm9yID0gbnVsbDtcbiAgICAgICAgZjIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKG9uc3VjY2VzcykgdGhpcy5vbnN1Y2Nlc3MgPSB0aGlzLm9uc3VjY2VzcyA/IGNhbGxCb3RoKG9uc3VjY2VzcywgdGhpcy5vbnN1Y2Nlc3MpIDogb25zdWNjZXNzO1xuICAgICAgICBpZiAob25lcnJvcikgdGhpcy5vbmVycm9yID0gdGhpcy5vbmVycm9yID8gY2FsbEJvdGgob25lcnJvciwgdGhpcy5vbmVycm9yKSA6IG9uZXJyb3I7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gaG9va1VwZGF0aW5nQ2hhaW4oZjEsIGYyKSB7XG4gICAgaWYgKGYxID09PSBub3ApIHJldHVybiBmMjtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZGlmaWNhdGlvbnMpIHtcbiAgICAgICAgdmFyIHJlcyA9IGYxLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGV4dGVuZChtb2RpZmljYXRpb25zLCByZXMpOyAvLyBJZiBmMSByZXR1cm5zIG5ldyBtb2RpZmljYXRpb25zLCBleHRlbmQgY2FsbGVyJ3MgbW9kaWZpY2F0aW9ucyB3aXRoIHRoZSByZXN1bHQgYmVmb3JlIGNhbGxpbmcgbmV4dCBpbiBjaGFpbi5cbiAgICAgICAgdmFyIG9uc3VjY2VzcyA9IHRoaXMub25zdWNjZXNzLFxuICAgICAgICAgICAgLy8gSW4gY2FzZSBldmVudCBsaXN0ZW5lciBoYXMgc2V0IHRoaXMub25zdWNjZXNzXG4gICAgICAgIG9uZXJyb3IgPSB0aGlzLm9uZXJyb3I7IC8vIEluIGNhc2UgZXZlbnQgbGlzdGVuZXIgaGFzIHNldCB0aGlzLm9uZXJyb3JcbiAgICAgICAgdGhpcy5vbnN1Y2Nlc3MgPSBudWxsO1xuICAgICAgICB0aGlzLm9uZXJyb3IgPSBudWxsO1xuICAgICAgICB2YXIgcmVzMiA9IGYyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGlmIChvbnN1Y2Nlc3MpIHRoaXMub25zdWNjZXNzID0gdGhpcy5vbnN1Y2Nlc3MgPyBjYWxsQm90aChvbnN1Y2Nlc3MsIHRoaXMub25zdWNjZXNzKSA6IG9uc3VjY2VzcztcbiAgICAgICAgaWYgKG9uZXJyb3IpIHRoaXMub25lcnJvciA9IHRoaXMub25lcnJvciA/IGNhbGxCb3RoKG9uZXJyb3IsIHRoaXMub25lcnJvcikgOiBvbmVycm9yO1xuICAgICAgICByZXR1cm4gcmVzID09PSB1bmRlZmluZWQgPyByZXMyID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiByZXMyIDogZXh0ZW5kKHJlcywgcmVzMik7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gcmV2ZXJzZVN0b3BwYWJsZUV2ZW50Q2hhaW4oZjEsIGYyKSB7XG4gICAgaWYgKGYxID09PSBub3ApIHJldHVybiBmMjtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoZjIuYXBwbHkodGhpcywgYXJndW1lbnRzKSA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGYxLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxuXG5cbmZ1bmN0aW9uIHByb21pc2FibGVDaGFpbihmMSwgZjIpIHtcbiAgICBpZiAoZjEgPT09IG5vcCkgcmV0dXJuIGYyO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXMgPSBmMS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBpZiAocmVzICYmIHR5cGVvZiByZXMudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdmFyIHRoaXogPSB0aGlzLFxuICAgICAgICAgICAgICAgIGkgPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoaSk7XG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIH1yZXR1cm4gcmVzLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmMi5hcHBseSh0aGl6LCBhcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmMi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG5cbi8vIEJ5IGRlZmF1bHQsIGRlYnVnIHdpbGwgYmUgdHJ1ZSBvbmx5IGlmIHBsYXRmb3JtIGlzIGEgd2ViIHBsYXRmb3JtIGFuZCBpdHMgcGFnZSBpcyBzZXJ2ZWQgZnJvbSBsb2NhbGhvc3QuXG4vLyBXaGVuIGRlYnVnID0gdHJ1ZSwgZXJyb3IncyBzdGFja3Mgd2lsbCBjb250YWluIGFzeW5jcm9uaWMgbG9uZyBzdGFja3MuXG52YXIgZGVidWcgPSB0eXBlb2YgbG9jYXRpb24gIT09ICd1bmRlZmluZWQnICYmXG4vLyBCeSBkZWZhdWx0LCB1c2UgZGVidWcgbW9kZSBpZiBzZXJ2ZWQgZnJvbSBsb2NhbGhvc3QuXG4vXihodHRwfGh0dHBzKTpcXC9cXC8obG9jYWxob3N0fDEyN1xcLjBcXC4wXFwuMSkvLnRlc3QobG9jYXRpb24uaHJlZik7XG5cbmZ1bmN0aW9uIHNldERlYnVnKHZhbHVlLCBmaWx0ZXIpIHtcbiAgICBkZWJ1ZyA9IHZhbHVlO1xuICAgIGxpYnJhcnlGaWx0ZXIgPSBmaWx0ZXI7XG59XG5cbnZhciBsaWJyYXJ5RmlsdGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0cnVlO1xufTtcblxudmFyIE5FRURTX1RIUk9XX0ZPUl9TVEFDSyA9ICFuZXcgRXJyb3IoXCJcIikuc3RhY2s7XG5cbmZ1bmN0aW9uIGdldEVycm9yV2l0aFN0YWNrKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKE5FRURTX1RIUk9XX0ZPUl9TVEFDSykgdHJ5IHtcbiAgICAgICAgLy8gRG9pbmcgc29tZXRoaW5nIG5hdWdodHkgaW4gc3RyaWN0IG1vZGUgaGVyZSB0byB0cmlnZ2VyIGEgc3BlY2lmaWMgZXJyb3JcbiAgICAgICAgLy8gdGhhdCBjYW4gYmUgZXhwbGljaXRlbHkgaWdub3JlZCBpbiBkZWJ1Z2dlcidzIGV4Y2VwdGlvbiBzZXR0aW5ncy5cbiAgICAgICAgLy8gSWYgd2UnZCBqdXN0IHRocm93IG5ldyBFcnJvcigpIGhlcmUsIElFJ3MgZGVidWdnZXIncyBleGNlcHRpb24gc2V0dGluZ3NcbiAgICAgICAgLy8gd2lsbCBqdXN0IGNvbnNpZGVyIGl0IGFzIFwiZXhjZXB0aW9uIHRocm93biBieSBqYXZhc2NyaXB0IGNvZGVcIiB3aGljaCBpc1xuICAgICAgICAvLyBzb21ldGhpbmcgeW91IHdvdWxkbid0IHdhbnQgaXQgdG8gaWdub3JlLlxuICAgICAgICBnZXRFcnJvcldpdGhTdGFjay5hcmd1bWVudHM7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpOyAvLyBGYWxsYmFjayBpZiBhYm92ZSBsaW5lIGRvbid0IHRocm93LlxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRXJyb3IoKTtcbn1cblxuZnVuY3Rpb24gcHJldHR5U3RhY2soZXhjZXB0aW9uLCBudW1JZ25vcmVkRnJhbWVzKSB7XG4gICAgdmFyIHN0YWNrID0gZXhjZXB0aW9uLnN0YWNrO1xuICAgIGlmICghc3RhY2spIHJldHVybiBcIlwiO1xuICAgIG51bUlnbm9yZWRGcmFtZXMgPSBudW1JZ25vcmVkRnJhbWVzIHx8IDA7XG4gICAgaWYgKHN0YWNrLmluZGV4T2YoZXhjZXB0aW9uLm5hbWUpID09PSAwKSBudW1JZ25vcmVkRnJhbWVzICs9IChleGNlcHRpb24ubmFtZSArIGV4Y2VwdGlvbi5tZXNzYWdlKS5zcGxpdCgnXFxuJykubGVuZ3RoO1xuICAgIHJldHVybiBzdGFjay5zcGxpdCgnXFxuJykuc2xpY2UobnVtSWdub3JlZEZyYW1lcykuZmlsdGVyKGxpYnJhcnlGaWx0ZXIpLm1hcChmdW5jdGlvbiAoZnJhbWUpIHtcbiAgICAgICAgcmV0dXJuIFwiXFxuXCIgKyBmcmFtZTtcbiAgICB9KS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gZGVwcmVjYXRlZCh3aGF0LCBmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybih3aGF0ICsgXCIgaXMgZGVwcmVjYXRlZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9kZmFobGFuZGVyL0RleGllLmpzL3dpa2kvRGVwcmVjYXRpb25zLiBcIiArIHByZXR0eVN0YWNrKGdldEVycm9yV2l0aFN0YWNrKCksIDEpKTtcbiAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxudmFyIGRleGllRXJyb3JOYW1lcyA9IFsnTW9kaWZ5JywgJ0J1bGsnLCAnT3BlbkZhaWxlZCcsICdWZXJzaW9uQ2hhbmdlJywgJ1NjaGVtYScsICdVcGdyYWRlJywgJ0ludmFsaWRUYWJsZScsICdNaXNzaW5nQVBJJywgJ05vU3VjaERhdGFiYXNlJywgJ0ludmFsaWRBcmd1bWVudCcsICdTdWJUcmFuc2FjdGlvbicsICdVbnN1cHBvcnRlZCcsICdJbnRlcm5hbCcsICdEYXRhYmFzZUNsb3NlZCcsICdJbmNvbXBhdGlibGVQcm9taXNlJ107XG5cbnZhciBpZGJEb21FcnJvck5hbWVzID0gWydVbmtub3duJywgJ0NvbnN0cmFpbnQnLCAnRGF0YScsICdUcmFuc2FjdGlvbkluYWN0aXZlJywgJ1JlYWRPbmx5JywgJ1ZlcnNpb24nLCAnTm90Rm91bmQnLCAnSW52YWxpZFN0YXRlJywgJ0ludmFsaWRBY2Nlc3MnLCAnQWJvcnQnLCAnVGltZW91dCcsICdRdW90YUV4Y2VlZGVkJywgJ1N5bnRheCcsICdEYXRhQ2xvbmUnXTtcblxudmFyIGVycm9yTGlzdCA9IGRleGllRXJyb3JOYW1lcy5jb25jYXQoaWRiRG9tRXJyb3JOYW1lcyk7XG5cbnZhciBkZWZhdWx0VGV4dHMgPSB7XG4gICAgVmVyc2lvbkNoYW5nZWQ6IFwiRGF0YWJhc2UgdmVyc2lvbiBjaGFuZ2VkIGJ5IG90aGVyIGRhdGFiYXNlIGNvbm5lY3Rpb25cIixcbiAgICBEYXRhYmFzZUNsb3NlZDogXCJEYXRhYmFzZSBoYXMgYmVlbiBjbG9zZWRcIixcbiAgICBBYm9ydDogXCJUcmFuc2FjdGlvbiBhYm9ydGVkXCIsXG4gICAgVHJhbnNhY3Rpb25JbmFjdGl2ZTogXCJUcmFuc2FjdGlvbiBoYXMgYWxyZWFkeSBjb21wbGV0ZWQgb3IgZmFpbGVkXCJcbn07XG5cbi8vXG4vLyBEZXhpZUVycm9yIC0gYmFzZSBjbGFzcyBvZiBhbGwgb3V0IGV4Y2VwdGlvbnMuXG4vL1xuZnVuY3Rpb24gRGV4aWVFcnJvcihuYW1lLCBtc2cpIHtcbiAgICAvLyBSZWFzb24gd2UgZG9uJ3QgdXNlIEVTNiBjbGFzc2VzIGlzIGJlY2F1c2U6XG4gICAgLy8gMS4gSXQgYmxvYXRzIHRyYW5zcGlsZWQgY29kZSBhbmQgaW5jcmVhc2VzIHNpemUgb2YgbWluaWZpZWQgY29kZS5cbiAgICAvLyAyLiBJdCBkb2Vzbid0IGdpdmUgdXMgbXVjaCBpbiB0aGlzIGNhc2UuXG4gICAgLy8gMy4gSXQgd291bGQgcmVxdWlyZSBzdWIgY2xhc3NlcyB0byBjYWxsIHN1cGVyKCksIHdoaWNoXG4gICAgLy8gICAgaXMgbm90IG5lZWRlZCB3aGVuIGRlcml2aW5nIGZyb20gRXJyb3IuXG4gICAgdGhpcy5fZSA9IGdldEVycm9yV2l0aFN0YWNrKCk7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtc2c7XG59XG5cbmRlcml2ZShEZXhpZUVycm9yKS5mcm9tKEVycm9yKS5leHRlbmQoe1xuICAgIHN0YWNrOiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3N0YWNrIHx8ICh0aGlzLl9zdGFjayA9IHRoaXMubmFtZSArIFwiOiBcIiArIHRoaXMubWVzc2FnZSArIHByZXR0eVN0YWNrKHRoaXMuX2UsIDIpKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArIFwiOiBcIiArIHRoaXMubWVzc2FnZTtcbiAgICB9XG59KTtcblxuZnVuY3Rpb24gZ2V0TXVsdGlFcnJvck1lc3NhZ2UobXNnLCBmYWlsdXJlcykge1xuICAgIHJldHVybiBtc2cgKyBcIi4gRXJyb3JzOiBcIiArIGZhaWx1cmVzLm1hcChmdW5jdGlvbiAoZikge1xuICAgICAgICByZXR1cm4gZi50b1N0cmluZygpO1xuICAgIH0pLmZpbHRlcihmdW5jdGlvbiAodiwgaSwgcykge1xuICAgICAgICByZXR1cm4gcy5pbmRleE9mKHYpID09PSBpO1xuICAgIH0pIC8vIE9ubHkgdW5pcXVlIGVycm9yIHN0cmluZ3NcbiAgICAuam9pbignXFxuJyk7XG59XG5cbi8vXG4vLyBNb2RpZnlFcnJvciAtIHRocm93biBpbiBXcml0ZWFibGVDb2xsZWN0aW9uLm1vZGlmeSgpXG4vLyBTcGVjaWZpYyBjb25zdHJ1Y3RvciBiZWNhdXNlIGl0IGNvbnRhaW5zIG1lbWJlcnMgZmFpbHVyZXMgYW5kIGZhaWxlZEtleXMuXG4vL1xuZnVuY3Rpb24gTW9kaWZ5RXJyb3IobXNnLCBmYWlsdXJlcywgc3VjY2Vzc0NvdW50LCBmYWlsZWRLZXlzKSB7XG4gICAgdGhpcy5fZSA9IGdldEVycm9yV2l0aFN0YWNrKCk7XG4gICAgdGhpcy5mYWlsdXJlcyA9IGZhaWx1cmVzO1xuICAgIHRoaXMuZmFpbGVkS2V5cyA9IGZhaWxlZEtleXM7XG4gICAgdGhpcy5zdWNjZXNzQ291bnQgPSBzdWNjZXNzQ291bnQ7XG59XG5kZXJpdmUoTW9kaWZ5RXJyb3IpLmZyb20oRGV4aWVFcnJvcik7XG5cbmZ1bmN0aW9uIEJ1bGtFcnJvcihtc2csIGZhaWx1cmVzKSB7XG4gICAgdGhpcy5fZSA9IGdldEVycm9yV2l0aFN0YWNrKCk7XG4gICAgdGhpcy5uYW1lID0gXCJCdWxrRXJyb3JcIjtcbiAgICB0aGlzLmZhaWx1cmVzID0gZmFpbHVyZXM7XG4gICAgdGhpcy5tZXNzYWdlID0gZ2V0TXVsdGlFcnJvck1lc3NhZ2UobXNnLCBmYWlsdXJlcyk7XG59XG5kZXJpdmUoQnVsa0Vycm9yKS5mcm9tKERleGllRXJyb3IpO1xuXG4vL1xuLy9cbi8vIER5bmFtaWNhbGx5IGdlbmVyYXRlIGVycm9yIG5hbWVzIGFuZCBleGNlcHRpb24gY2xhc3NlcyBiYXNlZFxuLy8gb24gdGhlIG5hbWVzIGluIGVycm9yTGlzdC5cbi8vXG4vL1xuXG4vLyBNYXAgb2Yge0Vycm9yTmFtZSAtPiBFcnJvck5hbWUgKyBcIkVycm9yXCJ9XG52YXIgZXJybmFtZXMgPSBlcnJvckxpc3QucmVkdWNlKGZ1bmN0aW9uIChvYmosIG5hbWUpIHtcbiAgICByZXR1cm4gb2JqW25hbWVdID0gbmFtZSArIFwiRXJyb3JcIiwgb2JqO1xufSwge30pO1xuXG4vLyBOZWVkIGFuIGFsaWFzIGZvciBEZXhpZUVycm9yIGJlY2F1c2Ugd2UncmUgZ29ubmEgY3JlYXRlIHN1YmNsYXNzZXMgd2l0aCB0aGUgc2FtZSBuYW1lLlxudmFyIEJhc2VFeGNlcHRpb24gPSBEZXhpZUVycm9yO1xuLy8gTWFwIG9mIHtFcnJvck5hbWUgLT4gZXhjZXB0aW9uIGNvbnN0cnVjdG9yfVxudmFyIGV4Y2VwdGlvbnMgPSBlcnJvckxpc3QucmVkdWNlKGZ1bmN0aW9uIChvYmosIG5hbWUpIHtcbiAgICAvLyBMZXQgdGhlIG5hbWUgYmUgXCJEZXhpZUVycm9yXCIgYmVjYXVzZSB0aGlzIG5hbWUgbWF5XG4gICAgLy8gYmUgc2hvd24gaW4gY2FsbCBzdGFjayBhbmQgd2hlbiBkZWJ1Z2dpbmcuIERleGllRXJyb3IgaXNcbiAgICAvLyB0aGUgbW9zdCB0cnVlIG5hbWUgYmVjYXVzZSBpdCBkZXJpdmVzIGZyb20gRGV4aWVFcnJvcixcbiAgICAvLyBhbmQgd2UgY2Fubm90IGNoYW5nZSBGdW5jdGlvbi5uYW1lIHByb2dyYW1hdGljYWxseSB3aXRob3V0XG4gICAgLy8gZHluYW1pY2FsbHkgY3JlYXRlIGEgRnVuY3Rpb24gb2JqZWN0LCB3aGljaCB3b3VsZCBiZSBjb25zaWRlcmVkXG4gICAgLy8gJ2V2YWwtZXZpbCcuXG4gICAgdmFyIGZ1bGxOYW1lID0gbmFtZSArIFwiRXJyb3JcIjtcbiAgICBmdW5jdGlvbiBEZXhpZUVycm9yKG1zZ09ySW5uZXIsIGlubmVyKSB7XG4gICAgICAgIHRoaXMuX2UgPSBnZXRFcnJvcldpdGhTdGFjaygpO1xuICAgICAgICB0aGlzLm5hbWUgPSBmdWxsTmFtZTtcbiAgICAgICAgaWYgKCFtc2dPcklubmVyKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UgPSBkZWZhdWx0VGV4dHNbbmFtZV0gfHwgZnVsbE5hbWU7XG4gICAgICAgICAgICB0aGlzLmlubmVyID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbXNnT3JJbm5lciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZSA9IG1zZ09ySW5uZXI7XG4gICAgICAgICAgICB0aGlzLmlubmVyID0gaW5uZXIgfHwgbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbXNnT3JJbm5lciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZSA9IG1zZ09ySW5uZXIubmFtZSArICcgJyArIG1zZ09ySW5uZXIubWVzc2FnZTtcbiAgICAgICAgICAgIHRoaXMuaW5uZXIgPSBtc2dPcklubmVyO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlcml2ZShEZXhpZUVycm9yKS5mcm9tKEJhc2VFeGNlcHRpb24pO1xuICAgIG9ialtuYW1lXSA9IERleGllRXJyb3I7XG4gICAgcmV0dXJuIG9iajtcbn0sIHt9KTtcblxuLy8gVXNlIEVDTUFTQ1JJUFQgc3RhbmRhcmQgZXhjZXB0aW9ucyB3aGVyZSBhcHBsaWNhYmxlOlxuZXhjZXB0aW9ucy5TeW50YXggPSBTeW50YXhFcnJvcjtcbmV4Y2VwdGlvbnMuVHlwZSA9IFR5cGVFcnJvcjtcbmV4Y2VwdGlvbnMuUmFuZ2UgPSBSYW5nZUVycm9yO1xuXG52YXIgZXhjZXB0aW9uTWFwID0gaWRiRG9tRXJyb3JOYW1lcy5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwgbmFtZSkge1xuICAgIG9ialtuYW1lICsgXCJFcnJvclwiXSA9IGV4Y2VwdGlvbnNbbmFtZV07XG4gICAgcmV0dXJuIG9iajtcbn0sIHt9KTtcblxuZnVuY3Rpb24gbWFwRXJyb3IoZG9tRXJyb3IsIG1lc3NhZ2UpIHtcbiAgICBpZiAoIWRvbUVycm9yIHx8IGRvbUVycm9yIGluc3RhbmNlb2YgRGV4aWVFcnJvciB8fCBkb21FcnJvciBpbnN0YW5jZW9mIFR5cGVFcnJvciB8fCBkb21FcnJvciBpbnN0YW5jZW9mIFN5bnRheEVycm9yIHx8ICFkb21FcnJvci5uYW1lIHx8ICFleGNlcHRpb25NYXBbZG9tRXJyb3IubmFtZV0pIHJldHVybiBkb21FcnJvcjtcbiAgICB2YXIgcnYgPSBuZXcgZXhjZXB0aW9uTWFwW2RvbUVycm9yLm5hbWVdKG1lc3NhZ2UgfHwgZG9tRXJyb3IubWVzc2FnZSwgZG9tRXJyb3IpO1xuICAgIGlmIChcInN0YWNrXCIgaW4gZG9tRXJyb3IpIHtcbiAgICAgICAgLy8gRGVyaXZlIHN0YWNrIGZyb20gaW5uZXIgZXhjZXB0aW9uIGlmIGl0IGhhcyBhIHN0YWNrXG4gICAgICAgIHNldFByb3AocnYsIFwic3RhY2tcIiwgeyBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pbm5lci5zdGFjaztcbiAgICAgICAgICAgIH0gfSk7XG4gICAgfVxuICAgIHJldHVybiBydjtcbn1cblxudmFyIGZ1bGxOYW1lRXhjZXB0aW9ucyA9IGVycm9yTGlzdC5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwgbmFtZSkge1xuICAgIGlmIChbXCJTeW50YXhcIiwgXCJUeXBlXCIsIFwiUmFuZ2VcIl0uaW5kZXhPZihuYW1lKSA9PT0gLTEpIG9ialtuYW1lICsgXCJFcnJvclwiXSA9IGV4Y2VwdGlvbnNbbmFtZV07XG4gICAgcmV0dXJuIG9iajtcbn0sIHt9KTtcblxuZnVsbE5hbWVFeGNlcHRpb25zLk1vZGlmeUVycm9yID0gTW9kaWZ5RXJyb3I7XG5mdWxsTmFtZUV4Y2VwdGlvbnMuRGV4aWVFcnJvciA9IERleGllRXJyb3I7XG5mdWxsTmFtZUV4Y2VwdGlvbnMuQnVsa0Vycm9yID0gQnVsa0Vycm9yO1xuXG5mdW5jdGlvbiBFdmVudHMoY3R4KSB7XG4gICAgdmFyIGV2cyA9IHt9O1xuICAgIHZhciBydiA9IGZ1bmN0aW9uIChldmVudE5hbWUsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgaWYgKHN1YnNjcmliZXIpIHtcbiAgICAgICAgICAgIC8vIFN1YnNjcmliZS4gSWYgYWRkaXRpb25hbCBhcmd1bWVudHMgdGhhbiBqdXN0IHRoZSBzdWJzY3JpYmVyIHdhcyBwcm92aWRlZCwgZm9yd2FyZCB0aGVtIGFzIHdlbGwuXG4gICAgICAgICAgICB2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgYXJncyA9IG5ldyBBcnJheShpIC0gMSk7XG4gICAgICAgICAgICB3aGlsZSAoLS1pKSB7XG4gICAgICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICB9ZXZzW2V2ZW50TmFtZV0uc3Vic2NyaWJlLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIGN0eDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZXZlbnROYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgLy8gUmV0dXJuIGludGVyZmFjZSBhbGxvd2luZyB0byBmaXJlIG9yIHVuc3Vic2NyaWJlIGZyb20gZXZlbnRcbiAgICAgICAgICAgIHJldHVybiBldnNbZXZlbnROYW1lXTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcnYuYWRkRXZlbnRUeXBlID0gYWRkO1xuXG4gICAgZm9yICh2YXIgaSA9IDEsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgIGFkZChhcmd1bWVudHNbaV0pO1xuICAgIH1cblxuICAgIHJldHVybiBydjtcblxuICAgIGZ1bmN0aW9uIGFkZChldmVudE5hbWUsIGNoYWluRnVuY3Rpb24sIGRlZmF1bHRGdW5jdGlvbikge1xuICAgICAgICBpZiAodHlwZW9mIGV2ZW50TmFtZSA9PT0gJ29iamVjdCcpIHJldHVybiBhZGRDb25maWd1cmVkRXZlbnRzKGV2ZW50TmFtZSk7XG4gICAgICAgIGlmICghY2hhaW5GdW5jdGlvbikgY2hhaW5GdW5jdGlvbiA9IHJldmVyc2VTdG9wcGFibGVFdmVudENoYWluO1xuICAgICAgICBpZiAoIWRlZmF1bHRGdW5jdGlvbikgZGVmYXVsdEZ1bmN0aW9uID0gbm9wO1xuXG4gICAgICAgIHZhciBjb250ZXh0ID0ge1xuICAgICAgICAgICAgc3Vic2NyaWJlcnM6IFtdLFxuICAgICAgICAgICAgZmlyZTogZGVmYXVsdEZ1bmN0aW9uLFxuICAgICAgICAgICAgc3Vic2NyaWJlOiBmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29udGV4dC5zdWJzY3JpYmVycy5pbmRleE9mKGNiKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5zdWJzY3JpYmVycy5wdXNoKGNiKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5maXJlID0gY2hhaW5GdW5jdGlvbihjb250ZXh0LmZpcmUsIGNiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uIChjYikge1xuICAgICAgICAgICAgICAgIGNvbnRleHQuc3Vic2NyaWJlcnMgPSBjb250ZXh0LnN1YnNjcmliZXJzLmZpbHRlcihmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuICE9PSBjYjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpcmUgPSBjb250ZXh0LnN1YnNjcmliZXJzLnJlZHVjZShjaGFpbkZ1bmN0aW9uLCBkZWZhdWx0RnVuY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBldnNbZXZlbnROYW1lXSA9IHJ2W2V2ZW50TmFtZV0gPSBjb250ZXh0O1xuICAgICAgICByZXR1cm4gY29udGV4dDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRDb25maWd1cmVkRXZlbnRzKGNmZykge1xuICAgICAgICAvLyBldmVudHModGhpcywge3JlYWRpbmc6IFtmdW5jdGlvbkNoYWluLCBub3BdfSk7XG4gICAgICAgIGtleXMoY2ZnKS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gY2ZnW2V2ZW50TmFtZV07XG4gICAgICAgICAgICBpZiAoaXNBcnJheShhcmdzKSkge1xuICAgICAgICAgICAgICAgIGFkZChldmVudE5hbWUsIGNmZ1tldmVudE5hbWVdWzBdLCBjZmdbZXZlbnROYW1lXVsxXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3MgPT09ICdhc2FwJykge1xuICAgICAgICAgICAgICAgIC8vIFJhdGhlciB0aGFuIGFwcHJvYWNoaW5nIGV2ZW50IHN1YnNjcmlwdGlvbiB1c2luZyBhIGZ1bmN0aW9uYWwgYXBwcm9hY2gsIHdlIGhlcmUgZG8gaXQgaW4gYSBmb3ItbG9vcCB3aGVyZSBzdWJzY3JpYmVyIGlzIGV4ZWN1dGVkIGluIGl0cyBvd24gc3RhY2tcbiAgICAgICAgICAgICAgICAvLyBlbmFibGluZyB0aGF0IGFueSBleGNlcHRpb24gdGhhdCBvY2N1ciB3b250IGRpc3R1cmIgdGhlIGluaXRpYXRvciBhbmQgYWxzbyBub3QgbmVzY2Vzc2FyeSBiZSBjYXRjaGVkIGFuZCBmb3Jnb3R0ZW4uXG4gICAgICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBhZGQoZXZlbnROYW1lLCBtaXJyb3IsIGZ1bmN0aW9uIGZpcmUoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9wdGltYXphdGlvbi1zYWZlIGNsb25pbmcgb2YgYXJndW1lbnRzIGludG8gYXJncy5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXJncyA9IG5ldyBBcnJheShpKTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfSAvLyBBbGwgZWFjaCBzdWJzY3JpYmVyOlxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LnN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc2FwKGZ1bmN0aW9uIGZpcmVFdmVudCgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB0aHJvdyBuZXcgZXhjZXB0aW9ucy5JbnZhbGlkQXJndW1lbnQoXCJJbnZhbGlkIGV2ZW50IGNvbmZpZ1wiKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vL1xuLy8gUHJvbWlzZSBDbGFzcyBmb3IgRGV4aWUgbGlicmFyeVxuLy9cbi8vIEkgc3RhcnRlZCBvdXQgd3JpdGluZyB0aGlzIFByb21pc2UgY2xhc3MgYnkgY29weWluZyBwcm9taXNlLWxpZ2h0IChodHRwczovL2dpdGh1Yi5jb20vdGF5bG9yaGFrZXMvcHJvbWlzZS1saWdodCkgYnlcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YXlsb3JoYWtlcyAtIGFuIEErIGFuZCBFQ01BU0NSSVBUIDYgY29tcGxpYW50IFByb21pc2UgaW1wbGVtZW50YXRpb24uXG4vL1xuLy8gTW9kaWZpY2F0aW9ucyBuZWVkZWQgdG8gYmUgZG9uZSB0byBzdXBwb3J0IGluZGV4ZWREQiBiZWNhdXNlIGl0IHdvbnQgYWNjZXB0IHNldFRpbWVvdXQoKVxuLy8gKFNlZSBkaXNjdXNzaW9uOiBodHRwczovL2dpdGh1Yi5jb20vcHJvbWlzZXMtYXBsdXMvcHJvbWlzZXMtc3BlYy9pc3N1ZXMvNDUpIC5cbi8vIFRoaXMgdG9waWMgd2FzIGFsc28gZGlzY3Vzc2VkIGluIHRoZSBmb2xsb3dpbmcgdGhyZWFkOiBodHRwczovL2dpdGh1Yi5jb20vcHJvbWlzZXMtYXBsdXMvcHJvbWlzZXMtc3BlYy9pc3N1ZXMvNDVcbi8vXG4vLyBUaGlzIGltcGxlbWVudGF0aW9uIHdpbGwgbm90IHVzZSBzZXRUaW1lb3V0IG9yIHNldEltbWVkaWF0ZSB3aGVuIGl0J3Mgbm90IG5lZWRlZC4gVGhlIGJlaGF2aW9yIGlzIDEwMCUgUHJvbWlzZS9BKyBjb21wbGlhbnQgc2luY2Vcbi8vIHRoZSBjYWxsZXIgb2YgbmV3IFByb21pc2UoKSBjYW4gYmUgY2VydGFpbiB0aGF0IHRoZSBwcm9taXNlIHdvbnQgYmUgdHJpZ2dlcmVkIHRoZSBsaW5lcyBhZnRlciBjb25zdHJ1Y3RpbmcgdGhlIHByb21pc2UuXG4vL1xuLy8gSW4gcHJldmlvdXMgdmVyc2lvbnMgdGhpcyB3YXMgZml4ZWQgYnkgbm90IGNhbGxpbmcgc2V0VGltZW91dCB3aGVuIGtub3dpbmcgdGhhdCB0aGUgcmVzb2x2ZSgpIG9yIHJlamVjdCgpIGNhbWUgZnJvbSBhbm90aGVyXG4vLyB0aWNrLiBJbiBEZXhpZSB2MS40LjAsIEkndmUgcmV3cml0dGVuIHRoZSBQcm9taXNlIGNsYXNzIGVudGlyZWx5LiBKdXN0IHNvbWUgZnJhZ21lbnRzIG9mIHByb21pc2UtbGlnaHQgaXMgbGVmdC4gSSB1c2Vcbi8vIGFub3RoZXIgc3RyYXRlZ3kgbm93IHRoYXQgc2ltcGxpZmllcyBldmVyeXRoaW5nIGEgbG90OiB0byBhbHdheXMgZXhlY3V0ZSBjYWxsYmFja3MgaW4gYSBuZXcgdGljaywgYnV0IGhhdmUgYW4gb3duIG1pY3JvVGlja1xuLy8gZW5naW5lIHRoYXQgaXMgdXNlZCBpbnN0ZWFkIG9mIHNldEltbWVkaWF0ZSgpIG9yIHNldFRpbWVvdXQoKS5cbi8vIFByb21pc2UgY2xhc3MgaGFzIGFsc28gYmVlbiBvcHRpbWl6ZWQgYSBsb3Qgd2l0aCBpbnNwaXJhdGlvbiBmcm9tIGJsdWViaXJkIC0gdG8gYXZvaWQgY2xvc3VyZXMgYXMgbXVjaCBhcyBwb3NzaWJsZS5cbi8vIEFsc28gd2l0aCBpbnNwaXJhdGlvbiBmcm9tIGJsdWViaXJkLCBhc3luY3JvbmljIHN0YWNrcyBpbiBkZWJ1ZyBtb2RlLlxuLy9cbi8vIFNwZWNpZmljIG5vbi1zdGFuZGFyZCBmZWF0dXJlcyBvZiB0aGlzIFByb21pc2UgY2xhc3M6XG4vLyAqIEFzeW5jIHN0YXRpYyBjb250ZXh0IHN1cHBvcnQgKFByb21pc2UuUFNEKVxuLy8gKiBQcm9taXNlLmZvbGxvdygpIG1ldGhvZCBidWlsdCB1cG9uIFBTRCwgdGhhdCBhbGxvd3MgdXNlciB0byB0cmFjayBhbGwgcHJvbWlzZXMgY3JlYXRlZCBmcm9tIGN1cnJlbnQgc3RhY2sgZnJhbWVcbi8vICAgYW5kIGJlbG93ICsgYWxsIHByb21pc2VzIHRoYXQgdGhvc2UgcHJvbWlzZXMgY3JlYXRlcyBvciBhd2FpdHMuXG4vLyAqIERldGVjdCBhbnkgdW5oYW5kbGVkIHByb21pc2UgaW4gYSBQU0Qtc2NvcGUgKFBTRC5vbnVuaGFuZGxlZCkuIFxuLy9cbi8vIERhdmlkIEZhaGxhbmRlciwgaHR0cHM6Ly9naXRodWIuY29tL2RmYWhsYW5kZXJcbi8vXG5cbi8vIEp1c3QgYSBwb2ludGVyIHRoYXQgb25seSB0aGlzIG1vZHVsZSBrbm93cyBhYm91dC5cbi8vIFVzZWQgaW4gUHJvbWlzZSBjb25zdHJ1Y3RvciB0byBlbXVsYXRlIGEgcHJpdmF0ZSBjb25zdHJ1Y3Rvci5cbnZhciBJTlRFUk5BTCA9IHt9O1xuXG4vLyBBc3luYyBzdGFja3MgKGxvbmcgc3RhY2tzKSBtdXN0IG5vdCBncm93IGluZmluaXRlbHkuXG52YXIgTE9OR19TVEFDS1NfQ0xJUF9MSU1JVCA9IDEwMDtcbnZhciBNQVhfTE9OR19TVEFDS1MgPSAyMDtcbnZhciBzdGFja19iZWluZ19nZW5lcmF0ZWQgPSBmYWxzZTtcblxuLyogVGhlIGRlZmF1bHQgXCJuZXh0VGlja1wiIGZ1bmN0aW9uIHVzZWQgb25seSBmb3IgdGhlIHZlcnkgZmlyc3QgcHJvbWlzZSBpbiBhIHByb21pc2UgY2hhaW4uXHJcbiAgIEFzIHNvb24gYXMgdGhlbiBwcm9taXNlIGlzIHJlc29sdmVkIG9yIHJlamVjdGVkLCBhbGwgbmV4dCB0YXNrcyB3aWxsIGJlIGV4ZWN1dGVkIGluIG1pY3JvIHRpY2tzXHJcbiAgIGVtdWxhdGVkIGluIHRoaXMgbW9kdWxlLiBGb3IgaW5kZXhlZERCIGNvbXBhdGliaWxpdHksIHRoaXMgbWVhbnMgdGhhdCBldmVyeSBtZXRob2QgbmVlZHMgdG8gXHJcbiAgIGV4ZWN1dGUgYXQgbGVhc3Qgb25lIHByb21pc2UgYmVmb3JlIGRvaW5nIGFuIGluZGV4ZWREQiBvcGVyYXRpb24uIERleGllIHdpbGwgYWx3YXlzIGNhbGwgXHJcbiAgIGRiLnJlYWR5KCkudGhlbigpIGZvciBldmVyeSBvcGVyYXRpb24gdG8gbWFrZSBzdXJlIHRoZSBpbmRleGVkREIgZXZlbnQgaXMgc3RhcnRlZCBpbiBhblxyXG4gICBlbXVsYXRlZCBtaWNybyB0aWNrLlxyXG4qL1xudmFyIHNjaGVkdWxlUGh5c2ljYWxUaWNrID0gX2dsb2JhbC5zZXRJbW1lZGlhdGUgP1xuLy8gc2V0SW1tZWRpYXRlIHN1cHBvcnRlZC4gVGhvc2UgbW9kZXJuIHBsYXRmb3JtcyBhbHNvIHN1cHBvcnRzIEZ1bmN0aW9uLmJpbmQoKS5cbnNldEltbWVkaWF0ZS5iaW5kKG51bGwsIHBoeXNpY2FsVGljaykgOiBfZ2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgP1xuLy8gTXV0YXRpb25PYnNlcnZlciBzdXBwb3J0ZWRcbmZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGlkZGVuRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHBoeXNpY2FsVGljaygpO1xuICAgICAgICBoaWRkZW5EaXYgPSBudWxsO1xuICAgIH0pLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG4gICAgaGlkZGVuRGl2LnNldEF0dHJpYnV0ZSgnaScsICcxJyk7XG59IDpcbi8vIE5vIHN1cHBvcnQgZm9yIHNldEltbWVkaWF0ZSBvciBNdXRhdGlvbk9ic2VydmVyLiBObyB3b3JyeSwgc2V0VGltZW91dCBpcyBvbmx5IGNhbGxlZFxuLy8gb25jZSB0aW1lLiBFdmVyeSB0aWNrIHRoYXQgZm9sbG93cyB3aWxsIGJlIG91ciBlbXVsYXRlZCBtaWNybyB0aWNrLlxuLy8gQ291bGQgaGF2ZSB1c2VzIHNldFRpbWVvdXQuYmluZChudWxsLCAwLCBwaHlzaWNhbFRpY2spIGlmIGl0IHdhc250IGZvciB0aGF0IEZGMTMgYW5kIGJlbG93IGhhcyBhIGJ1ZyBcbmZ1bmN0aW9uICgpIHtcbiAgICBzZXRUaW1lb3V0KHBoeXNpY2FsVGljaywgMCk7XG59O1xuXG4vLyBDb25maWZ1cmFibGUgdGhyb3VnaCBQcm9taXNlLnNjaGVkdWxlci5cbi8vIERvbid0IGV4cG9ydCBiZWNhdXNlIGl0IHdvdWxkIGJlIHVuc2FmZSB0byBsZXQgdW5rbm93blxuLy8gY29kZSBjYWxsIGl0IHVubGVzcyB0aGV5IGRvIHRyeS4uY2F0Y2ggd2l0aGluIHRoZWlyIGNhbGxiYWNrLlxuLy8gVGhpcyBmdW5jdGlvbiBjYW4gYmUgcmV0cmlldmVkIHRocm91Z2ggZ2V0dGVyIG9mIFByb21pc2Uuc2NoZWR1bGVyIHRob3VnaCxcbi8vIGJ1dCB1c2VycyBtdXN0IG5vdCBkbyBQcm9taXNlLnNjaGVkdWxlciAobXlGdW5jVGhhdFRocm93cyBleGNlcHRpb24pIVxudmFyIGFzYXAkMSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYXJncykge1xuICAgIG1pY3JvdGlja1F1ZXVlLnB1c2goW2NhbGxiYWNrLCBhcmdzXSk7XG4gICAgaWYgKG5lZWRzTmV3UGh5c2ljYWxUaWNrKSB7XG4gICAgICAgIHNjaGVkdWxlUGh5c2ljYWxUaWNrKCk7XG4gICAgICAgIG5lZWRzTmV3UGh5c2ljYWxUaWNrID0gZmFsc2U7XG4gICAgfVxufTtcblxudmFyIGlzT3V0c2lkZU1pY3JvVGljayA9IHRydWU7XG52YXIgbmVlZHNOZXdQaHlzaWNhbFRpY2sgPSB0cnVlO1xudmFyIHVuaGFuZGxlZEVycm9ycyA9IFtdO1xudmFyIHJlamVjdGluZ0Vycm9ycyA9IFtdO1xudmFyIGN1cnJlbnRGdWxmaWxsZXIgPSBudWxsO1xudmFyIHJlamVjdGlvbk1hcHBlciA9IG1pcnJvcjsgLy8gUmVtb3ZlIGluIG5leHQgbWFqb3Igd2hlbiByZW1vdmluZyBlcnJvciBtYXBwaW5nIG9mIERPTUVycm9ycyBhbmQgRE9NRXhjZXB0aW9uc1xuXG52YXIgZ2xvYmFsUFNEID0ge1xuICAgIGdsb2JhbDogdHJ1ZSxcbiAgICByZWY6IDAsXG4gICAgdW5oYW5kbGVkczogW10sXG4gICAgb251bmhhbmRsZWQ6IGdsb2JhbEVycm9yLFxuICAgIC8vZW52OiBudWxsLCAvLyBXaWxsIGJlIHNldCB3aGVuZXZlciBsZWF2aW5nIGEgc2NvcGUgdXNpbmcgd3JhcHBlcnMuc25hcHNob3QoKVxuICAgIGZpbmFsaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudW5oYW5kbGVkcy5mb3JFYWNoKGZ1bmN0aW9uICh1aCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBnbG9iYWxFcnJvcih1aFswXSwgdWhbMV0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxudmFyIFBTRCA9IGdsb2JhbFBTRDtcblxudmFyIG1pY3JvdGlja1F1ZXVlID0gW107IC8vIENhbGxiYWNrcyB0byBjYWxsIGluIHRoaXMgb3IgbmV4dCBwaHlzaWNhbCB0aWNrLlxudmFyIG51bVNjaGVkdWxlZENhbGxzID0gMDsgLy8gTnVtYmVyIG9mIGxpc3RlbmVyLWNhbGxzIGxlZnQgdG8gZG8gaW4gdGhpcyBwaHlzaWNhbCB0aWNrLlxudmFyIHRpY2tGaW5hbGl6ZXJzID0gW107IC8vIEZpbmFsaXplcnMgdG8gY2FsbCB3aGVuIHRoZXJlIGFyZSBubyBtb3JlIGFzeW5jIGNhbGxzIHNjaGVkdWxlZCB3aXRoaW4gY3VycmVudCBwaHlzaWNhbCB0aWNrLlxuXG4vLyBXcmFwcGVycyBhcmUgbm90IGJlaW5nIHVzZWQgeWV0LiBUaGVpciBmcmFtZXdvcmsgaXMgZnVuY3Rpb25pbmcgYW5kIGNhbiBiZSB1c2VkXG4vLyB0byByZXBsYWNlIGVudmlyb25tZW50IGR1cmluZyBhIFBTRCBzY29wZSAoYS5rLmEuICd6b25lJykuXG4vKiAqKktFRVAqKiBleHBvcnQgdmFyIHdyYXBwZXJzID0gKCgpID0+IHtcclxuICAgIHZhciB3cmFwcGVycyA9IFtdO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc25hcHNob3Q6ICgpID0+IHtcclxuICAgICAgICAgICAgdmFyIGkgPSB3cmFwcGVycy5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoaSk7XHJcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHJlc3VsdFtpXSA9IHdyYXBwZXJzW2ldLnNuYXBzaG90KCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXN0b3JlOiB2YWx1ZXMgPT4ge1xyXG4gICAgICAgICAgICB2YXIgaSA9IHdyYXBwZXJzLmxlbmd0aDtcclxuICAgICAgICAgICAgd2hpbGUgKGktLSkgd3JhcHBlcnNbaV0ucmVzdG9yZSh2YWx1ZXNbaV0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgd3JhcDogKCkgPT4gd3JhcHBlcnMubWFwKHcgPT4gdy53cmFwKCkpLFxyXG4gICAgICAgIGFkZDogd3JhcHBlciA9PiB7XHJcbiAgICAgICAgICAgIHdyYXBwZXJzLnB1c2god3JhcHBlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSkoKTtcclxuKi9cblxuZnVuY3Rpb24gUHJvbWlzZShmbikge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb21pc2VzIG11c3QgYmUgY29uc3RydWN0ZWQgdmlhIG5ldycpO1xuICAgIHRoaXMuX2xpc3RlbmVycyA9IFtdO1xuICAgIHRoaXMub251bmNhdGNoZWQgPSBub3A7IC8vIERlcHJlY2F0ZSBpbiBuZXh0IG1ham9yLiBOb3QgbmVlZGVkLiBCZXR0ZXIgdG8gdXNlIGdsb2JhbCBlcnJvciBoYW5kbGVyLlxuXG4gICAgLy8gQSBsaWJyYXJ5IG1heSBzZXQgYHByb21pc2UuX2xpYiA9IHRydWU7YCBhZnRlciBwcm9taXNlIGlzIGNyZWF0ZWQgdG8gbWFrZSByZXNvbHZlKCkgb3IgcmVqZWN0KClcbiAgICAvLyBleGVjdXRlIHRoZSBtaWNyb3Rhc2sgZW5naW5lIGltcGxpY2l0ZWx5IHdpdGhpbiB0aGUgY2FsbCB0byByZXNvbHZlKCkgb3IgcmVqZWN0KCkuXG4gICAgLy8gVG8gcmVtYWluIEErIGNvbXBsaWFudCwgYSBsaWJyYXJ5IG11c3Qgb25seSBzZXQgYF9saWI9dHJ1ZWAgaWYgaXQgY2FuIGd1YXJhbnRlZSB0aGF0IHRoZSBzdGFja1xuICAgIC8vIG9ubHkgY29udGFpbnMgbGlicmFyeSBjb2RlIHdoZW4gY2FsbGluZyByZXNvbHZlKCkgb3IgcmVqZWN0KCkuXG4gICAgLy8gUlVMRSBPRiBUSFVNQjogT05MWSBzZXQgX2xpYiA9IHRydWUgZm9yIHByb21pc2VzIGV4cGxpY2l0ZWx5IHJlc29sdmluZy9yZWplY3RpbmcgZGlyZWN0bHkgZnJvbVxuICAgIC8vIGdsb2JhbCBzY29wZSAoZXZlbnQgaGFuZGxlciwgdGltZXIgZXRjKSFcbiAgICB0aGlzLl9saWIgPSBmYWxzZTtcbiAgICAvLyBDdXJyZW50IGFzeW5jIHNjb3BlXG4gICAgdmFyIHBzZCA9IHRoaXMuX1BTRCA9IFBTRDtcblxuICAgIGlmIChkZWJ1Zykge1xuICAgICAgICB0aGlzLl9zdGFja0hvbGRlciA9IGdldEVycm9yV2l0aFN0YWNrKCk7XG4gICAgICAgIHRoaXMuX3ByZXYgPSBudWxsO1xuICAgICAgICB0aGlzLl9udW1QcmV2ID0gMDsgLy8gTnVtYmVyIG9mIHByZXZpb3VzIHByb21pc2VzIChmb3IgbG9uZyBzdGFja3MpXG4gICAgICAgIGxpbmtUb1ByZXZpb3VzUHJvbWlzZSh0aGlzLCBjdXJyZW50RnVsZmlsbGVyKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChmbiAhPT0gSU5URVJOQUwpIHRocm93IG5ldyBUeXBlRXJyb3IoJ05vdCBhIGZ1bmN0aW9uJyk7XG4gICAgICAgIC8vIFByaXZhdGUgY29uc3RydWN0b3IgKElOVEVSTkFMLCBzdGF0ZSwgdmFsdWUpLlxuICAgICAgICAvLyBVc2VkIGludGVybmFsbHkgYnkgUHJvbWlzZS5yZXNvbHZlKCkgYW5kIFByb21pc2UucmVqZWN0KCkuXG4gICAgICAgIHRoaXMuX3N0YXRlID0gYXJndW1lbnRzWzFdO1xuICAgICAgICB0aGlzLl92YWx1ZSA9IGFyZ3VtZW50c1syXTtcbiAgICAgICAgaWYgKHRoaXMuX3N0YXRlID09PSBmYWxzZSkgaGFuZGxlUmVqZWN0aW9uKHRoaXMsIHRoaXMuX3ZhbHVlKTsgLy8gTWFwIGVycm9yLCBzZXQgc3RhY2sgYW5kIGFkZFBvc3NpYmx5VW5oYW5kbGVkRXJyb3IoKS5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3N0YXRlID0gbnVsbDsgLy8gbnVsbCAoPXBlbmRpbmcpLCBmYWxzZSAoPXJlamVjdGVkKSBvciB0cnVlICg9cmVzb2x2ZWQpXG4gICAgdGhpcy5fdmFsdWUgPSBudWxsOyAvLyBlcnJvciBvciByZXN1bHRcbiAgICArK3BzZC5yZWY7IC8vIFJlZmNvdW50aW5nIGN1cnJlbnQgc2NvcGVcbiAgICBleGVjdXRlUHJvbWlzZVRhc2sodGhpcywgZm4pO1xufVxuXG5wcm9wcyhQcm9taXNlLnByb3RvdHlwZSwge1xuXG4gICAgdGhlbjogZnVuY3Rpb24gKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHJ2ID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgcHJvcGFnYXRlVG9MaXN0ZW5lcihfdGhpcywgbmV3IExpc3RlbmVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCByZXNvbHZlLCByZWplY3QpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRlYnVnICYmICghdGhpcy5fcHJldiB8fCB0aGlzLl9zdGF0ZSA9PT0gbnVsbCkgJiYgbGlua1RvUHJldmlvdXNQcm9taXNlKHJ2LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHJ2O1xuICAgIH0sXG5cbiAgICBfdGhlbjogZnVuY3Rpb24gKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgICAgIC8vIEEgbGl0dGxlIHRpbmllciB2ZXJzaW9uIG9mIHRoZW4oKSB0aGF0IGRvbid0IGhhdmUgdG8gY3JlYXRlIGEgcmVzdWx0aW5nIHByb21pc2UuXG4gICAgICAgIHByb3BhZ2F0ZVRvTGlzdGVuZXIodGhpcywgbmV3IExpc3RlbmVyKG51bGwsIG51bGwsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSk7XG4gICAgfSxcblxuICAgIGNhdGNoOiBmdW5jdGlvbiAob25SZWplY3RlZCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGVkKTtcbiAgICAgICAgLy8gRmlyc3QgYXJndW1lbnQgaXMgdGhlIEVycm9yIHR5cGUgdG8gY2F0Y2hcbiAgICAgICAgdmFyIHR5cGUgPSBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgICBoYW5kbGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgICByZXR1cm4gdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgPyB0aGlzLnRoZW4obnVsbCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAvLyBDYXRjaGluZyBlcnJvcnMgYnkgaXRzIGNvbnN0cnVjdG9yIHR5cGUgKHNpbWlsYXIgdG8gamF2YSAvIGMrKyAvIGMjKVxuICAgICAgICAgICAgICAgIC8vIFNhbXBsZTogcHJvbWlzZS5jYXRjaChUeXBlRXJyb3IsIGZ1bmN0aW9uIChlKSB7IC4uLiB9KTtcbiAgICAgICAgICAgICAgICBlcnIgaW5zdGFuY2VvZiB0eXBlID8gaGFuZGxlcihlcnIpIDogUHJvbWlzZVJlamVjdChlcnIpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KSA6IHRoaXMudGhlbihudWxsLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIC8vIENhdGNoaW5nIGVycm9ycyBieSB0aGUgZXJyb3IubmFtZSBwcm9wZXJ0eS4gTWFrZXMgc2Vuc2UgZm9yIGluZGV4ZWREQiB3aGVyZSBlcnJvciB0eXBlXG4gICAgICAgICAgICAgICAgLy8gaXMgYWx3YXlzIERPTUVycm9yIGJ1dCB3aGVyZSBlLm5hbWUgdGVsbHMgdGhlIGFjdHVhbCBlcnJvciB0eXBlLlxuICAgICAgICAgICAgICAgIC8vIFNhbXBsZTogcHJvbWlzZS5jYXRjaCgnQ29uc3RyYWludEVycm9yJywgZnVuY3Rpb24gKGUpIHsgLi4uIH0pO1xuICAgICAgICAgICAgICAgIGVyciAmJiBlcnIubmFtZSA9PT0gdHlwZSA/IGhhbmRsZXIoZXJyKSA6IFByb21pc2VSZWplY3QoZXJyKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZpbmFsbHk6IGZ1bmN0aW9uIChvbkZpbmFsbHkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIG9uRmluYWxseSgpO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBvbkZpbmFsbHkoKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlUmVqZWN0KGVycik7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBEZXByZWNhdGUgaW4gbmV4dCBtYWpvci4gTmVlZGVkIG9ubHkgZm9yIGRiLm9uLmVycm9yLlxuICAgIHVuY2F1Z2h0OiBmdW5jdGlvbiAodW5jYXVnaHRIYW5kbGVyKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIC8vIEJlIGJhY2t3YXJkIGNvbXBhdGlibGUgYW5kIHVzZSBcIm9udW5jYXRjaGVkXCIgYXMgdGhlIGV2ZW50IG5hbWUgb24gdGhpcy5cbiAgICAgICAgLy8gSGFuZGxlIG11bHRpcGxlIHN1YnNjcmliZXJzIHRocm91Z2ggcmV2ZXJzZVN0b3BwYWJsZUV2ZW50Q2hhaW4oKS4gSWYgYSBoYW5kbGVyIHJldHVybnMgYGZhbHNlYCwgYnViYmxpbmcgc3RvcHMuXG4gICAgICAgIHRoaXMub251bmNhdGNoZWQgPSByZXZlcnNlU3RvcHBhYmxlRXZlbnRDaGFpbih0aGlzLm9udW5jYXRjaGVkLCB1bmNhdWdodEhhbmRsZXIpO1xuICAgICAgICAvLyBJbiBjYXNlIGNhbGxlciBkb2VzIHRoaXMgb24gYW4gYWxyZWFkeSByZWplY3RlZCBwcm9taXNlLCBhc3N1bWUgY2FsbGVyIHdhbnRzIHRvIHBvaW50IG91dCB0aGUgZXJyb3IgdG8gdGhpcyBwcm9taXNlIGFuZCBub3RcbiAgICAgICAgLy8gYSBwcmV2aW91cyBwcm9taXNlLiBSZWFzb246IHRoZSBwcmV2b3VzIHByb21pc2UgbWF5IGxhY2sgb251bmNhdGNoZWQgaGFuZGxlci4gXG4gICAgICAgIGlmICh0aGlzLl9zdGF0ZSA9PT0gZmFsc2UgJiYgdW5oYW5kbGVkRXJyb3JzLmluZGV4T2YodGhpcykgPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBSZXBsYWNlIHVuaGFuZGxlZCBlcnJvcidzIGRlc3RpbmFpb24gcHJvbWlzZSB3aXRoIHRoaXMgb25lIVxuICAgICAgICAgICAgdW5oYW5kbGVkRXJyb3JzLnNvbWUoZnVuY3Rpb24gKHAsIGksIGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcC5fdmFsdWUgPT09IF90aGlzMi5fdmFsdWUgJiYgKGxbaV0gPSBfdGhpczIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBBY3R1YWxseSB3ZSBkbyB0aGlzIHNoaXQgYmVjYXVzZSB3ZSBuZWVkIHRvIHN1cHBvcnQgZGIub24uZXJyb3IoKSBjb3JyZWN0bHkgZHVyaW5nIGRiLm9wZW4oKS4gSWYgd2UgZGVwcmVjYXRlIGRiLm9uLmVycm9yLCB3ZSBjb3VsZFxuICAgICAgICAgICAgLy8gdGFrZSBhd2F5IHRoaXMgcGllY2Ugb2YgY29kZSBhcyB3ZWxsIGFzIHRoZSBvbnVuY2F0Y2hlZCBhbmQgdW5jYXVnaHQoKSBtZXRob2QuXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHN0YWNrOiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0YWNrKSByZXR1cm4gdGhpcy5fc3RhY2s7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHN0YWNrX2JlaW5nX2dlbmVyYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdmFyIHN0YWNrcyA9IGdldFN0YWNrKHRoaXMsIFtdLCBNQVhfTE9OR19TVEFDS1MpO1xuICAgICAgICAgICAgICAgIHZhciBzdGFjayA9IHN0YWNrcy5qb2luKFwiXFxuRnJvbSBwcmV2aW91czogXCIpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zdGF0ZSAhPT0gbnVsbCkgdGhpcy5fc3RhY2sgPSBzdGFjazsgLy8gU3RhY2sgbWF5IGJlIHVwZGF0ZWQgb24gcmVqZWN0LlxuICAgICAgICAgICAgICAgIHJldHVybiBzdGFjaztcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgc3RhY2tfYmVpbmdfZ2VuZXJhdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuZnVuY3Rpb24gTGlzdGVuZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHJlc29sdmUsIHJlamVjdCkge1xuICAgIHRoaXMub25GdWxmaWxsZWQgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IG51bGw7XG4gICAgdGhpcy5vblJlamVjdGVkID0gdHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicgPyBvblJlamVjdGVkIDogbnVsbDtcbiAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xuICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgIHRoaXMucHNkID0gUFNEO1xufVxuXG4vLyBQcm9taXNlIFN0YXRpYyBQcm9wZXJ0aWVzXG5wcm9wcyhQcm9taXNlLCB7XG4gICAgYWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBnZXRBcnJheU9mLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IC8vIFN1cHBvcnRzIGl0ZXJhYmxlcywgaW1wbGljaXQgYXJndW1lbnRzIGFuZCBhcnJheS1saWtlLlxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggPT09IDApIHJlc29sdmUoW10pO1xuICAgICAgICAgICAgdmFyIHJlbWFpbmluZyA9IHZhbHVlcy5sZW5ndGg7XG4gICAgICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoYSwgaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYSkudGhlbihmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbaV0gPSB4O1xuICAgICAgICAgICAgICAgICAgICBpZiAoISAtLXJlbWFpbmluZykgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlc29sdmU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSByZXR1cm4gdmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhbHVlLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShJTlRFUk5BTCwgdHJ1ZSwgdmFsdWUpO1xuICAgIH0sXG5cbiAgICByZWplY3Q6IFByb21pc2VSZWplY3QsXG5cbiAgICByYWNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBnZXRBcnJheU9mLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB2YWx1ZXMubWFwKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgUFNEOiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIFBTRDtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBQU0QgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBuZXdQU0Q6IG5ld1Njb3BlLFxuXG4gICAgdXNlUFNEOiB1c2VQU0QsXG5cbiAgICBzY2hlZHVsZXI6IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXNhcCQxO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgYXNhcCQxID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVqZWN0aW9uTWFwcGVyOiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdGlvbk1hcHBlcjtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJlamVjdGlvbk1hcHBlciA9IHZhbHVlO1xuICAgICAgICB9IC8vIE1hcCByZWplY3QgZmFpbHVyZXNcbiAgICB9LFxuXG4gICAgZm9sbG93OiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXdTY29wZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBzZCA9IFBTRDtcbiAgICAgICAgICAgICAgICBwc2QudW5oYW5kbGVkcyA9IFtdOyAvLyBGb3IgdW5oYW5kbGVkIHN0YW5kYXJkLSBvciAzcmQgcGFydHkgUHJvbWlzZXMuIENoZWNrZWQgYXQgcHNkLmZpbmFsaXplKClcbiAgICAgICAgICAgICAgICBwc2Qub251bmhhbmRsZWQgPSByZWplY3Q7IC8vIFRyaWdnZXJlZCBkaXJlY3RseSBvbiB1bmhhbmRsZWQgcHJvbWlzZXMgb2YgdGhpcyBsaWJyYXJ5LlxuICAgICAgICAgICAgICAgIHBzZC5maW5hbGl6ZSA9IGNhbGxCb3RoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVW5oYW5kbGVkIHN0YW5kYXJkIG9yIDNyZCBwYXJ0IHByb21pc2VzIGFyZSBwdXQgaW4gUFNELnVuaGFuZGxlZHMgYW5kXG4gICAgICAgICAgICAgICAgICAgIC8vIGV4YW1pbmVkIHVwb24gc2NvcGUgY29tcGxldGlvbiB3aGlsZSB1bmhhbmRsZWQgcmVqZWN0aW9ucyBpbiB0aGlzIFByb21pc2VcbiAgICAgICAgICAgICAgICAgICAgLy8gd2lsbCB0cmlnZ2VyIGRpcmVjdGx5IHRocm91Z2ggcHNkLm9udW5oYW5kbGVkXG4gICAgICAgICAgICAgICAgICAgIHJ1bl9hdF9lbmRfb2ZfdGhpc19vcl9uZXh0X3BoeXNpY2FsX3RpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnVuaGFuZGxlZHMubGVuZ3RoID09PSAwID8gcmVzb2x2ZSgpIDogcmVqZWN0KF90aGlzMy51bmhhbmRsZWRzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgcHNkLmZpbmFsaXplKTtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uOiBFdmVudHMobnVsbCwgeyBcImVycm9yXCI6IFtyZXZlcnNlU3RvcHBhYmxlRXZlbnRDaGFpbiwgZGVmYXVsdEVycm9ySGFuZGxlcl0gLy8gRGVmYXVsdCB0byBkZWZhdWx0RXJyb3JIYW5kbGVyXG4gICAgfSlcblxufSk7XG5cbnZhciBQcm9taXNlT25FcnJvciA9IFByb21pc2Uub24uZXJyb3I7XG5Qcm9taXNlT25FcnJvci5zdWJzY3JpYmUgPSBkZXByZWNhdGVkKFwiUHJvbWlzZS5vbignZXJyb3InKVwiLCBQcm9taXNlT25FcnJvci5zdWJzY3JpYmUpO1xuUHJvbWlzZU9uRXJyb3IudW5zdWJzY3JpYmUgPSBkZXByZWNhdGVkKFwiUHJvbWlzZS5vbignZXJyb3InKS51bnN1YnNjcmliZVwiLCBQcm9taXNlT25FcnJvci51bnN1YnNjcmliZSk7XG5cbi8qKlxyXG4qIFRha2UgYSBwb3RlbnRpYWxseSBtaXNiZWhhdmluZyByZXNvbHZlciBmdW5jdGlvbiBhbmQgbWFrZSBzdXJlXHJcbiogb25GdWxmaWxsZWQgYW5kIG9uUmVqZWN0ZWQgYXJlIG9ubHkgY2FsbGVkIG9uY2UuXHJcbipcclxuKiBNYWtlcyBubyBndWFyYW50ZWVzIGFib3V0IGFzeW5jaHJvbnkuXHJcbiovXG5mdW5jdGlvbiBleGVjdXRlUHJvbWlzZVRhc2socHJvbWlzZSwgZm4pIHtcbiAgICAvLyBQcm9taXNlIFJlc29sdXRpb24gUHJvY2VkdXJlOlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9taXNlcy1hcGx1cy9wcm9taXNlcy1zcGVjI3RoZS1wcm9taXNlLXJlc29sdXRpb24tcHJvY2VkdXJlXG4gICAgdHJ5IHtcbiAgICAgICAgZm4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gcHJvbWlzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQSBwcm9taXNlIGNhbm5vdCBiZSByZXNvbHZlZCB3aXRoIGl0c2VsZi4nKTtcbiAgICAgICAgICAgIHZhciBzaG91bGRFeGVjdXRlVGljayA9IHByb21pc2UuX2xpYiAmJiBiZWdpbk1pY3JvVGlja1Njb3BlKCk7XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBleGVjdXRlUHJvbWlzZVRhc2socHJvbWlzZSwgZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UgPyB2YWx1ZS5fdGhlbihyZXNvbHZlLCByZWplY3QpIDogdmFsdWUudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlLl9zdGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgcHJvbWlzZS5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBwcm9wYWdhdGVBbGxMaXN0ZW5lcnMocHJvbWlzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2hvdWxkRXhlY3V0ZVRpY2spIGVuZE1pY3JvVGlja1Njb3BlKCk7XG4gICAgICAgIH0sIGhhbmRsZVJlamVjdGlvbi5iaW5kKG51bGwsIHByb21pc2UpKTsgLy8gSWYgRnVuY3Rpb24uYmluZCBpcyBub3Qgc3VwcG9ydGVkLiBFeGNlcHRpb24gaXMgaGFuZGxlZCBpbiBjYXRjaCBiZWxvd1xuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGhhbmRsZVJlamVjdGlvbihwcm9taXNlLCBleCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVSZWplY3Rpb24ocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgcmVqZWN0aW5nRXJyb3JzLnB1c2gocmVhc29uKTtcbiAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IG51bGwpIHJldHVybjtcbiAgICB2YXIgc2hvdWxkRXhlY3V0ZVRpY2sgPSBwcm9taXNlLl9saWIgJiYgYmVnaW5NaWNyb1RpY2tTY29wZSgpO1xuICAgIHJlYXNvbiA9IHJlamVjdGlvbk1hcHBlcihyZWFzb24pO1xuICAgIHByb21pc2UuX3N0YXRlID0gZmFsc2U7XG4gICAgcHJvbWlzZS5fdmFsdWUgPSByZWFzb247XG4gICAgZGVidWcgJiYgcmVhc29uICE9PSBudWxsICYmIHR5cGVvZiByZWFzb24gPT09ICdvYmplY3QnICYmICFyZWFzb24uX3Byb21pc2UgJiYgdHJ5Q2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3JpZ1Byb3AgPSBnZXRQcm9wZXJ0eURlc2NyaXB0b3IocmVhc29uLCBcInN0YWNrXCIpO1xuICAgICAgICByZWFzb24uX3Byb21pc2UgPSBwcm9taXNlO1xuICAgICAgICBzZXRQcm9wKHJlYXNvbiwgXCJzdGFja1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tfYmVpbmdfZ2VuZXJhdGVkID8gb3JpZ1Byb3AgJiYgKG9yaWdQcm9wLmdldCA/IG9yaWdQcm9wLmdldC5hcHBseShyZWFzb24pIDogb3JpZ1Byb3AudmFsdWUpIDogcHJvbWlzZS5zdGFjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgLy8gQWRkIHRoZSBmYWlsdXJlIHRvIGEgbGlzdCBvZiBwb3NzaWJseSB1bmNhdWdodCBlcnJvcnNcbiAgICBhZGRQb3NzaWJseVVuaGFuZGxlZEVycm9yKHByb21pc2UpO1xuICAgIHByb3BhZ2F0ZUFsbExpc3RlbmVycyhwcm9taXNlKTtcbiAgICBpZiAoc2hvdWxkRXhlY3V0ZVRpY2spIGVuZE1pY3JvVGlja1Njb3BlKCk7XG59XG5cbmZ1bmN0aW9uIHByb3BhZ2F0ZUFsbExpc3RlbmVycyhwcm9taXNlKSB7XG4gICAgLy9kZWJ1ZyAmJiBsaW5rVG9QcmV2aW91c1Byb21pc2UocHJvbWlzZSk7XG4gICAgdmFyIGxpc3RlbmVycyA9IHByb21pc2UuX2xpc3RlbmVycztcbiAgICBwcm9taXNlLl9saXN0ZW5lcnMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgIHByb3BhZ2F0ZVRvTGlzdGVuZXIocHJvbWlzZSwgbGlzdGVuZXJzW2ldKTtcbiAgICB9XG4gICAgdmFyIHBzZCA9IHByb21pc2UuX1BTRDtcbiAgICAtLXBzZC5yZWYgfHwgcHNkLmZpbmFsaXplKCk7IC8vIGlmIHBzZC5yZWYgcmVhY2hlcyB6ZXJvLCBjYWxsIHBzZC5maW5hbGl6ZSgpO1xuICAgIGlmIChudW1TY2hlZHVsZWRDYWxscyA9PT0gMCkge1xuICAgICAgICAvLyBJZiBudW1TY2hlZHVsZWRDYWxscyBpcyAwLCBpdCBtZWFucyB0aGF0IG91ciBzdGFjayBpcyBub3QgaW4gYSBjYWxsYmFjayBvZiBhIHNjaGVkdWxlZCBjYWxsLFxuICAgICAgICAvLyBhbmQgdGhhdCBubyBkZWZlcnJlZHMgd2hlcmUgbGlzdGVuaW5nIHRvIHRoaXMgcmVqZWN0aW9uIG9yIHN1Y2Nlc3MuXG4gICAgICAgIC8vIFNpbmNlIHRoZXJlIGlzIGEgcmlzayB0aGF0IG91ciBzdGFjayBjYW4gY29udGFpbiBhcHBsaWNhdGlvbiBjb2RlIHRoYXQgbWF5XG4gICAgICAgIC8vIGRvIHN0dWZmIGFmdGVyIHRoaXMgY29kZSBpcyBmaW5pc2hlZCB0aGF0IG1heSBnZW5lcmF0ZSBuZXcgY2FsbHMsIHdlIGNhbm5vdFxuICAgICAgICAvLyBjYWxsIGZpbmFsaXplcnMgaGVyZS5cbiAgICAgICAgKytudW1TY2hlZHVsZWRDYWxscztcbiAgICAgICAgYXNhcCQxKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICgtLW51bVNjaGVkdWxlZENhbGxzID09PSAwKSBmaW5hbGl6ZVBoeXNpY2FsVGljaygpOyAvLyBXaWxsIGRldGVjdCB1bmhhbmRsZWQgZXJyb3JzXG4gICAgICAgIH0sIFtdKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHByb3BhZ2F0ZVRvTGlzdGVuZXIocHJvbWlzZSwgbGlzdGVuZXIpIHtcbiAgICBpZiAocHJvbWlzZS5fc3RhdGUgPT09IG51bGwpIHtcbiAgICAgICAgcHJvbWlzZS5fbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGNiID0gcHJvbWlzZS5fc3RhdGUgPyBsaXN0ZW5lci5vbkZ1bGZpbGxlZCA6IGxpc3RlbmVyLm9uUmVqZWN0ZWQ7XG4gICAgaWYgKGNiID09PSBudWxsKSB7XG4gICAgICAgIC8vIFRoaXMgTGlzdGVuZXIgZG9lc250IGhhdmUgYSBsaXN0ZW5lciBmb3IgdGhlIGV2ZW50IGJlaW5nIHRyaWdnZXJlZCAob25GdWxmaWxsZWQgb3Igb25SZWplY3QpIHNvIGxldHMgZm9yd2FyZCB0aGUgZXZlbnQgdG8gYW55IGV2ZW50dWFsIGxpc3RlbmVycyBvbiB0aGUgUHJvbWlzZSBpbnN0YW5jZSByZXR1cm5lZCBieSB0aGVuKCkgb3IgY2F0Y2goKVxuICAgICAgICByZXR1cm4gKHByb21pc2UuX3N0YXRlID8gbGlzdGVuZXIucmVzb2x2ZSA6IGxpc3RlbmVyLnJlamVjdCkocHJvbWlzZS5fdmFsdWUpO1xuICAgIH1cbiAgICB2YXIgcHNkID0gbGlzdGVuZXIucHNkO1xuICAgICsrcHNkLnJlZjtcbiAgICArK251bVNjaGVkdWxlZENhbGxzO1xuICAgIGFzYXAkMShjYWxsTGlzdGVuZXIsIFtjYiwgcHJvbWlzZSwgbGlzdGVuZXJdKTtcbn1cblxuZnVuY3Rpb24gY2FsbExpc3RlbmVyKGNiLCBwcm9taXNlLCBsaXN0ZW5lcikge1xuICAgIHZhciBvdXRlclNjb3BlID0gUFNEO1xuICAgIHZhciBwc2QgPSBsaXN0ZW5lci5wc2Q7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHBzZCAhPT0gb3V0ZXJTY29wZSkge1xuICAgICAgICAgICAgLy8gKipLRUVQKiogb3V0ZXJTY29wZS5lbnYgPSB3cmFwcGVycy5zbmFwc2hvdCgpOyAvLyBTbmFwc2hvdCBvdXRlclNjb3BlJ3MgZW52aXJvbm1lbnQuXG4gICAgICAgICAgICBQU0QgPSBwc2Q7XG4gICAgICAgICAgICAvLyAqKktFRVAqKiB3cmFwcGVycy5yZXN0b3JlKHBzZC5lbnYpOyAvLyBSZXN0b3JlIFBTRCdzIGVudmlyb25tZW50LlxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHN0YXRpYyB2YXJpYWJsZSBjdXJyZW50RnVsZmlsbGVyIHRvIHRoZSBwcm9taXNlIHRoYXQgaXMgYmVpbmcgZnVsbGZpbGxlZCxcbiAgICAgICAgLy8gc28gdGhhdCB3ZSBjb25uZWN0IHRoZSBjaGFpbiBvZiBwcm9taXNlcyAoZm9yIGxvbmcgc3RhY2tzIHN1cHBvcnQpXG4gICAgICAgIGN1cnJlbnRGdWxmaWxsZXIgPSBwcm9taXNlO1xuXG4gICAgICAgIC8vIENhbGwgY2FsbGJhY2sgYW5kIHJlc29sdmUgb3VyIGxpc3RlbmVyIHdpdGggaXQncyByZXR1cm4gdmFsdWUuXG4gICAgICAgIHZhciB2YWx1ZSA9IHByb21pc2UuX3ZhbHVlLFxuICAgICAgICAgICAgcmV0O1xuICAgICAgICBpZiAocHJvbWlzZS5fc3RhdGUpIHtcbiAgICAgICAgICAgIHJldCA9IGNiKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChyZWplY3RpbmdFcnJvcnMubGVuZ3RoKSByZWplY3RpbmdFcnJvcnMgPSBbXTtcbiAgICAgICAgICAgIHJldCA9IGNiKHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChyZWplY3RpbmdFcnJvcnMuaW5kZXhPZih2YWx1ZSkgPT09IC0xKSBtYXJrRXJyb3JBc0hhbmRsZWQocHJvbWlzZSk7IC8vIENhbGxiYWNrIGRpZG50IGRvIFByb21pc2UucmVqZWN0KGVycikgbm9yIHJlamVjdChlcnIpIG9udG8gYW5vdGhlciBwcm9taXNlLlxuICAgICAgICB9XG4gICAgICAgIGxpc3RlbmVyLnJlc29sdmUocmV0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gaW4gY2FsbGJhY2suIFJlamVjdCBvdXIgbGlzdGVuZXIuXG4gICAgICAgIGxpc3RlbmVyLnJlamVjdChlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBSZXN0b3JlIFBTRCwgZW52IGFuZCBjdXJyZW50RnVsZmlsbGVyLlxuICAgICAgICBpZiAocHNkICE9PSBvdXRlclNjb3BlKSB7XG4gICAgICAgICAgICBQU0QgPSBvdXRlclNjb3BlO1xuICAgICAgICAgICAgLy8gKipLRUVQKiogd3JhcHBlcnMucmVzdG9yZShvdXRlclNjb3BlLmVudik7IC8vIFJlc3RvcmUgb3V0ZXJTY29wZSdzIGVudmlyb25tZW50XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudEZ1bGZpbGxlciA9IG51bGw7XG4gICAgICAgIGlmICgtLW51bVNjaGVkdWxlZENhbGxzID09PSAwKSBmaW5hbGl6ZVBoeXNpY2FsVGljaygpO1xuICAgICAgICAtLXBzZC5yZWYgfHwgcHNkLmZpbmFsaXplKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRTdGFjayhwcm9taXNlLCBzdGFja3MsIGxpbWl0KSB7XG4gICAgaWYgKHN0YWNrcy5sZW5ndGggPT09IGxpbWl0KSByZXR1cm4gc3RhY2tzO1xuICAgIHZhciBzdGFjayA9IFwiXCI7XG4gICAgaWYgKHByb21pc2UuX3N0YXRlID09PSBmYWxzZSkge1xuICAgICAgICB2YXIgZmFpbHVyZSA9IHByb21pc2UuX3ZhbHVlLFxuICAgICAgICAgICAgZXJyb3JOYW1lLFxuICAgICAgICAgICAgbWVzc2FnZTtcblxuICAgICAgICBpZiAoZmFpbHVyZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBlcnJvck5hbWUgPSBmYWlsdXJlLm5hbWUgfHwgXCJFcnJvclwiO1xuICAgICAgICAgICAgbWVzc2FnZSA9IGZhaWx1cmUubWVzc2FnZSB8fCBmYWlsdXJlO1xuICAgICAgICAgICAgc3RhY2sgPSBwcmV0dHlTdGFjayhmYWlsdXJlLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVycm9yTmFtZSA9IGZhaWx1cmU7IC8vIElmIGVycm9yIGlzIHVuZGVmaW5lZCBvciBudWxsLCBzaG93IHRoYXQuXG4gICAgICAgICAgICBtZXNzYWdlID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBzdGFja3MucHVzaChlcnJvck5hbWUgKyAobWVzc2FnZSA/IFwiOiBcIiArIG1lc3NhZ2UgOiBcIlwiKSArIHN0YWNrKTtcbiAgICB9XG4gICAgaWYgKGRlYnVnKSB7XG4gICAgICAgIHN0YWNrID0gcHJldHR5U3RhY2socHJvbWlzZS5fc3RhY2tIb2xkZXIsIDIpO1xuICAgICAgICBpZiAoc3RhY2sgJiYgc3RhY2tzLmluZGV4T2Yoc3RhY2spID09PSAtMSkgc3RhY2tzLnB1c2goc3RhY2spO1xuICAgICAgICBpZiAocHJvbWlzZS5fcHJldikgZ2V0U3RhY2socHJvbWlzZS5fcHJldiwgc3RhY2tzLCBsaW1pdCk7XG4gICAgfVxuICAgIHJldHVybiBzdGFja3M7XG59XG5cbmZ1bmN0aW9uIGxpbmtUb1ByZXZpb3VzUHJvbWlzZShwcm9taXNlLCBwcmV2KSB7XG4gICAgLy8gU3VwcG9ydCBsb25nIHN0YWNrcyBieSBsaW5raW5nIHRvIHByZXZpb3VzIGNvbXBsZXRlZCBwcm9taXNlLlxuICAgIHZhciBudW1QcmV2ID0gcHJldiA/IHByZXYuX251bVByZXYgKyAxIDogMDtcbiAgICBpZiAobnVtUHJldiA8IExPTkdfU1RBQ0tTX0NMSVBfTElNSVQpIHtcbiAgICAgICAgLy8gUHJvaGliaXQgaW5maW5pdGUgUHJvbWlzZSBsb29wcyB0byBnZXQgYW4gaW5maW5pdGUgbG9uZyBtZW1vcnkgY29uc3VtaW5nIFwidGFpbFwiLlxuICAgICAgICBwcm9taXNlLl9wcmV2ID0gcHJldjtcbiAgICAgICAgcHJvbWlzZS5fbnVtUHJldiA9IG51bVByZXY7XG4gICAgfVxufVxuXG4vKiBUaGUgY2FsbGJhY2sgdG8gc2NoZWR1bGUgd2l0aCBzZXRJbW1lZGlhdGUoKSBvciBzZXRUaW1lb3V0KCkuXHJcbiAgIEl0IHJ1bnMgYSB2aXJ0dWFsIG1pY3JvdGljayBhbmQgZXhlY3V0ZXMgYW55IGNhbGxiYWNrIHJlZ2lzdGVyZWQgaW4gbWljcm90aWNrUXVldWUuXHJcbiAqL1xuZnVuY3Rpb24gcGh5c2ljYWxUaWNrKCkge1xuICAgIGJlZ2luTWljcm9UaWNrU2NvcGUoKSAmJiBlbmRNaWNyb1RpY2tTY29wZSgpO1xufVxuXG5mdW5jdGlvbiBiZWdpbk1pY3JvVGlja1Njb3BlKCkge1xuICAgIHZhciB3YXNSb290RXhlYyA9IGlzT3V0c2lkZU1pY3JvVGljaztcbiAgICBpc091dHNpZGVNaWNyb1RpY2sgPSBmYWxzZTtcbiAgICBuZWVkc05ld1BoeXNpY2FsVGljayA9IGZhbHNlO1xuICAgIHJldHVybiB3YXNSb290RXhlYztcbn1cblxuLyogRXhlY3V0ZXMgbWljcm8tdGlja3Mgd2l0aG91dCBkb2luZyB0cnkuLmNhdGNoLlxyXG4gICBUaGlzIGNhbiBiZSBwb3NzaWJsZSBiZWNhdXNlIHdlIG9ubHkgdXNlIHRoaXMgaW50ZXJuYWxseSBhbmRcclxuICAgdGhlIHJlZ2lzdGVyZWQgZnVuY3Rpb25zIGFyZSBleGNlcHRpb24tc2FmZSAodGhleSBkbyB0cnkuLmNhdGNoXHJcbiAgIGludGVybmFsbHkgYmVmb3JlIGNhbGxpbmcgYW55IGV4dGVybmFsIG1ldGhvZCkuIElmIHJlZ2lzdGVyaW5nXHJcbiAgIGZ1bmN0aW9ucyBpbiB0aGUgbWljcm90aWNrUXVldWUgdGhhdCBhcmUgbm90IGV4Y2VwdGlvbi1zYWZlLCB0aGlzXHJcbiAgIHdvdWxkIGRlc3Ryb3kgdGhlIGZyYW1ld29yayBhbmQgbWFrZSBpdCBpbnN0YWJsZS4gU28gd2UgZG9uJ3QgZXhwb3J0XHJcbiAgIG91ciBhc2FwIG1ldGhvZC5cclxuKi9cbmZ1bmN0aW9uIGVuZE1pY3JvVGlja1Njb3BlKCkge1xuICAgIHZhciBjYWxsYmFja3MsIGksIGw7XG4gICAgZG8ge1xuICAgICAgICB3aGlsZSAobWljcm90aWNrUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY2FsbGJhY2tzID0gbWljcm90aWNrUXVldWU7XG4gICAgICAgICAgICBtaWNyb3RpY2tRdWV1ZSA9IFtdO1xuICAgICAgICAgICAgbCA9IGNhbGxiYWNrcy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBjYWxsYmFja3NbaV07XG4gICAgICAgICAgICAgICAgaXRlbVswXS5hcHBseShudWxsLCBpdGVtWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gd2hpbGUgKG1pY3JvdGlja1F1ZXVlLmxlbmd0aCA+IDApO1xuICAgIGlzT3V0c2lkZU1pY3JvVGljayA9IHRydWU7XG4gICAgbmVlZHNOZXdQaHlzaWNhbFRpY2sgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBmaW5hbGl6ZVBoeXNpY2FsVGljaygpIHtcbiAgICB2YXIgdW5oYW5kbGVkRXJycyA9IHVuaGFuZGxlZEVycm9ycztcbiAgICB1bmhhbmRsZWRFcnJvcnMgPSBbXTtcbiAgICB1bmhhbmRsZWRFcnJzLmZvckVhY2goZnVuY3Rpb24gKHApIHtcbiAgICAgICAgcC5fUFNELm9udW5oYW5kbGVkLmNhbGwobnVsbCwgcC5fdmFsdWUsIHApO1xuICAgIH0pO1xuICAgIHZhciBmaW5hbGl6ZXJzID0gdGlja0ZpbmFsaXplcnMuc2xpY2UoMCk7IC8vIENsb25lIGZpcnN0IGJlY2F1c2UgZmluYWxpemVyIG1heSByZW1vdmUgaXRzZWxmIGZyb20gbGlzdC5cbiAgICB2YXIgaSA9IGZpbmFsaXplcnMubGVuZ3RoO1xuICAgIHdoaWxlIChpKSB7XG4gICAgICAgIGZpbmFsaXplcnNbLS1pXSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcnVuX2F0X2VuZF9vZl90aGlzX29yX25leHRfcGh5c2ljYWxfdGljayhmbikge1xuICAgIGZ1bmN0aW9uIGZpbmFsaXplcigpIHtcbiAgICAgICAgZm4oKTtcbiAgICAgICAgdGlja0ZpbmFsaXplcnMuc3BsaWNlKHRpY2tGaW5hbGl6ZXJzLmluZGV4T2YoZmluYWxpemVyKSwgMSk7XG4gICAgfVxuICAgIHRpY2tGaW5hbGl6ZXJzLnB1c2goZmluYWxpemVyKTtcbiAgICArK251bVNjaGVkdWxlZENhbGxzO1xuICAgIGFzYXAkMShmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgtLW51bVNjaGVkdWxlZENhbGxzID09PSAwKSBmaW5hbGl6ZVBoeXNpY2FsVGljaygpO1xuICAgIH0sIFtdKTtcbn1cblxuZnVuY3Rpb24gYWRkUG9zc2libHlVbmhhbmRsZWRFcnJvcihwcm9taXNlKSB7XG4gICAgLy8gT25seSBhZGQgdG8gdW5oYW5kbGVkRXJyb3JzIGlmIG5vdCBhbHJlYWR5IHRoZXJlLiBUaGUgZmlyc3Qgb25lIHRvIGFkZCB0byB0aGlzIGxpc3RcbiAgICAvLyB3aWxsIGJlIHVwb24gdGhlIGZpcnN0IHJlamVjdGlvbiBzbyB0aGF0IHRoZSByb290IGNhdXNlIChmaXJzdCBwcm9taXNlIGluIHRoZVxuICAgIC8vIHJlamVjdGlvbiBjaGFpbikgaXMgdGhlIG9uZSBsaXN0ZWQuXG4gICAgaWYgKCF1bmhhbmRsZWRFcnJvcnMuc29tZShmdW5jdGlvbiAocCkge1xuICAgICAgICByZXR1cm4gcC5fdmFsdWUgPT09IHByb21pc2UuX3ZhbHVlO1xuICAgIH0pKSB1bmhhbmRsZWRFcnJvcnMucHVzaChwcm9taXNlKTtcbn1cblxuZnVuY3Rpb24gbWFya0Vycm9yQXNIYW5kbGVkKHByb21pc2UpIHtcbiAgICAvLyBDYWxsZWQgd2hlbiBhIHJlamVjdCBoYW5kbGVkIGlzIGFjdHVhbGx5IGJlaW5nIGNhbGxlZC5cbiAgICAvLyBTZWFyY2ggaW4gdW5oYW5kbGVkRXJyb3JzIGZvciBhbnkgcHJvbWlzZSB3aG9zIF92YWx1ZSBpcyB0aGlzIHByb21pc2VfdmFsdWUgKGxpc3RcbiAgICAvLyBjb250YWlucyBvbmx5IHJlamVjdGVkIHByb21pc2VzLCBhbmQgb25seSBvbmUgaXRlbSBwZXIgZXJyb3IpXG4gICAgdmFyIGkgPSB1bmhhbmRsZWRFcnJvcnMubGVuZ3RoO1xuICAgIHdoaWxlIChpKSB7XG4gICAgICAgIGlmICh1bmhhbmRsZWRFcnJvcnNbLS1pXS5fdmFsdWUgPT09IHByb21pc2UuX3ZhbHVlKSB7XG4gICAgICAgICAgICAvLyBGb3VuZCBhIHByb21pc2UgdGhhdCBmYWlsZWQgd2l0aCB0aGlzIHNhbWUgZXJyb3Igb2JqZWN0IHBvaW50ZXIsXG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhhdCBzaW5jZSB0aGVyZSBpcyBhIGxpc3RlbmVyIHRoYXQgYWN0dWFsbHkgdGFrZXMgY2FyZSBvZiBpdC5cbiAgICAgICAgICAgIHVuaGFuZGxlZEVycm9ycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIEJ5IGRlZmF1bHQsIGxvZyB1bmNhdWdodCBlcnJvcnMgdG8gdGhlIGNvbnNvbGVcbmZ1bmN0aW9uIGRlZmF1bHRFcnJvckhhbmRsZXIoZSkge1xuICAgIGNvbnNvbGUud2FybignVW5oYW5kbGVkIHJlamVjdGlvbjogJyArIChlLnN0YWNrIHx8IGUpKTtcbn1cblxuZnVuY3Rpb24gUHJvbWlzZVJlamVjdChyZWFzb24pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoSU5URVJOQUwsIGZhbHNlLCByZWFzb24pO1xufVxuXG5mdW5jdGlvbiB3cmFwKGZuLCBlcnJvckNhdGNoZXIpIHtcbiAgICB2YXIgcHNkID0gUFNEO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3YXNSb290RXhlYyA9IGJlZ2luTWljcm9UaWNrU2NvcGUoKSxcbiAgICAgICAgICAgIG91dGVyU2NvcGUgPSBQU0Q7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChvdXRlclNjb3BlICE9PSBwc2QpIHtcbiAgICAgICAgICAgICAgICAvLyAqKktFRVAqKiBvdXRlclNjb3BlLmVudiA9IHdyYXBwZXJzLnNuYXBzaG90KCk7IC8vIFNuYXBzaG90IG91dGVyU2NvcGUncyBlbnZpcm9ubWVudFxuICAgICAgICAgICAgICAgIFBTRCA9IHBzZDtcbiAgICAgICAgICAgICAgICAvLyAqKktFRVAqKiB3cmFwcGVycy5yZXN0b3JlKHBzZC5lbnYpOyAvLyBSZXN0b3JlIFBTRCdzIGVudmlyb25tZW50LlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGVycm9yQ2F0Y2hlciAmJiBlcnJvckNhdGNoZXIoZSk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAob3V0ZXJTY29wZSAhPT0gcHNkKSB7XG4gICAgICAgICAgICAgICAgUFNEID0gb3V0ZXJTY29wZTtcbiAgICAgICAgICAgICAgICAvLyAqKktFRVAqKiB3cmFwcGVycy5yZXN0b3JlKG91dGVyU2NvcGUuZW52KTsgLy8gUmVzdG9yZSBvdXRlclNjb3BlJ3MgZW52aXJvbm1lbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh3YXNSb290RXhlYykgZW5kTWljcm9UaWNrU2NvcGUoKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIG5ld1Njb3BlKGZuLCBhMSwgYTIsIGEzKSB7XG4gICAgdmFyIHBhcmVudCA9IFBTRCxcbiAgICAgICAgcHNkID0gT2JqZWN0LmNyZWF0ZShwYXJlbnQpO1xuICAgIHBzZC5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgcHNkLnJlZiA9IDA7XG4gICAgcHNkLmdsb2JhbCA9IGZhbHNlO1xuICAgIC8vICoqS0VFUCoqIHBzZC5lbnYgPSB3cmFwcGVycy53cmFwKHBzZCk7XG5cbiAgICAvLyB1bmhhbmRsZWRzIGFuZCBvbnVuaGFuZGxlZCBzaG91bGQgbm90IGJlIHNwZWNpZmljYWxseSBzZXQgaGVyZS5cbiAgICAvLyBMZWF2ZSB0aGVtIG9uIHBhcmVudCBwcm90b3R5cGUuXG4gICAgLy8gdW5oYW5kbGVkcy5wdXNoKGVycikgd2lsbCBwdXNoIHRvIHBhcmVudCdzIHByb3RvdHlwZVxuICAgIC8vIG9udW5oYW5kbGVkKCkgd2lsbCBjYWxsIHBhcmVudHMgb251bmhhbmRsZWQgKHdpdGggdGhpcyBzY29wZSdzIHRoaXMtcG9pbnRlciB0aG91Z2ghKVxuICAgICsrcGFyZW50LnJlZjtcbiAgICBwc2QuZmluYWxpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC0tdGhpcy5wYXJlbnQucmVmIHx8IHRoaXMucGFyZW50LmZpbmFsaXplKCk7XG4gICAgfTtcbiAgICB2YXIgcnYgPSB1c2VQU0QocHNkLCBmbiwgYTEsIGEyLCBhMyk7XG4gICAgaWYgKHBzZC5yZWYgPT09IDApIHBzZC5maW5hbGl6ZSgpO1xuICAgIHJldHVybiBydjtcbn1cblxuZnVuY3Rpb24gdXNlUFNEKHBzZCwgZm4sIGExLCBhMiwgYTMpIHtcbiAgICB2YXIgb3V0ZXJTY29wZSA9IFBTRDtcbiAgICB0cnkge1xuICAgICAgICBpZiAocHNkICE9PSBvdXRlclNjb3BlKSB7XG4gICAgICAgICAgICAvLyAqKktFRVAqKiBvdXRlclNjb3BlLmVudiA9IHdyYXBwZXJzLnNuYXBzaG90KCk7IC8vIHNuYXBzaG90IG91dGVyU2NvcGUncyBlbnZpcm9ubWVudC5cbiAgICAgICAgICAgIFBTRCA9IHBzZDtcbiAgICAgICAgICAgIC8vICoqS0VFUCoqIHdyYXBwZXJzLnJlc3RvcmUocHNkLmVudik7IC8vIFJlc3RvcmUgUFNEJ3MgZW52aXJvbm1lbnQuXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZuKGExLCBhMiwgYTMpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChwc2QgIT09IG91dGVyU2NvcGUpIHtcbiAgICAgICAgICAgIFBTRCA9IG91dGVyU2NvcGU7XG4gICAgICAgICAgICAvLyAqKktFRVAqKiB3cmFwcGVycy5yZXN0b3JlKG91dGVyU2NvcGUuZW52KTsgLy8gUmVzdG9yZSBvdXRlclNjb3BlJ3MgZW52aXJvbm1lbnQuXG4gICAgICAgIH1cbiAgICB9XG59XG5cbnZhciBVTkhBTkRMRURSRUpFQ1RJT04gPSBcInVuaGFuZGxlZHJlamVjdGlvblwiO1xuXG5mdW5jdGlvbiBnbG9iYWxFcnJvcihlcnIsIHByb21pc2UpIHtcbiAgICB2YXIgcnY7XG4gICAgdHJ5IHtcbiAgICAgICAgcnYgPSBwcm9taXNlLm9udW5jYXRjaGVkKGVycik7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICBpZiAocnYgIT09IGZhbHNlKSB0cnkge1xuICAgICAgICB2YXIgZXZlbnQsXG4gICAgICAgICAgICBldmVudERhdGEgPSB7IHByb21pc2U6IHByb21pc2UsIHJlYXNvbjogZXJyIH07XG4gICAgICAgIGlmIChfZ2xvYmFsLmRvY3VtZW50ICYmIGRvY3VtZW50LmNyZWF0ZUV2ZW50KSB7XG4gICAgICAgICAgICBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICAgICAgZXZlbnQuaW5pdEV2ZW50KFVOSEFORExFRFJFSkVDVElPTiwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBleHRlbmQoZXZlbnQsIGV2ZW50RGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoX2dsb2JhbC5DdXN0b21FdmVudCkge1xuICAgICAgICAgICAgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoVU5IQU5ETEVEUkVKRUNUSU9OLCB7IGRldGFpbDogZXZlbnREYXRhIH0pO1xuICAgICAgICAgICAgZXh0ZW5kKGV2ZW50LCBldmVudERhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudCAmJiBfZ2xvYmFsLmRpc3BhdGNoRXZlbnQpIHtcbiAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgaWYgKCFfZ2xvYmFsLlByb21pc2VSZWplY3Rpb25FdmVudCAmJiBfZ2xvYmFsLm9udW5oYW5kbGVkcmVqZWN0aW9uKVxuICAgICAgICAgICAgICAgIC8vIE5vIG5hdGl2ZSBzdXBwb3J0IGZvciBQcm9taXNlUmVqZWN0aW9uRXZlbnQgYnV0IHVzZXIgaGFzIHNldCB3aW5kb3cub251bmhhbmRsZWRyZWplY3Rpb24uIE1hbnVhbGx5IGNhbGwgaXQuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgX2dsb2JhbC5vbnVuaGFuZGxlZHJlamVjdGlvbihldmVudCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoXykge31cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgIC8vIEJhY2t3YXJkIGNvbXBhdGliaWxpdHk6IGZpcmUgdG8gZXZlbnRzIHJlZ2lzdGVyZWQgYXQgUHJvbWlzZS5vbi5lcnJvclxuICAgICAgICAgICAgUHJvbWlzZS5vbi5lcnJvci5maXJlKGVyciwgcHJvbWlzZSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7fVxufVxuXG4vKiAqKktFRVAqKiBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB3cmFwUHJvbWlzZShQcm9taXNlQ2xhc3MpIHtcclxuICAgIHZhciBwcm90byA9IFByb21pc2VDbGFzcy5wcm90b3R5cGU7XHJcbiAgICB2YXIgb3JpZ1RoZW4gPSBwcm90by50aGVuO1xyXG4gICAgXHJcbiAgICB3cmFwcGVycy5hZGQoe1xyXG4gICAgICAgIHNuYXBzaG90OiAoKSA9PiBwcm90by50aGVuLFxyXG4gICAgICAgIHJlc3RvcmU6IHZhbHVlID0+IHtwcm90by50aGVuID0gdmFsdWU7fSxcclxuICAgICAgICB3cmFwOiAoKSA9PiBwYXRjaGVkVGhlblxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gcGF0Y2hlZFRoZW4gKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XHJcbiAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzO1xyXG4gICAgICAgIHZhciBvbkZ1bGZpbGxlZFByb3h5ID0gd3JhcChmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgICAgICAgIHZhciBydiA9IHZhbHVlO1xyXG4gICAgICAgICAgICBpZiAob25GdWxmaWxsZWQpIHtcclxuICAgICAgICAgICAgICAgIHJ2ID0gb25GdWxmaWxsZWQocnYpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ2ICYmIHR5cGVvZiBydi50aGVuID09PSAnZnVuY3Rpb24nKSBydi50aGVuKCk7IC8vIEludGVyY2VwdCB0aGF0IHByb21pc2UgYXMgd2VsbC5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAtLVBTRC5yZWYgfHwgUFNELmZpbmFsaXplKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBydjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgb25SZWplY3RlZFByb3h5ID0gd3JhcChmdW5jdGlvbihlcnIpe1xyXG4gICAgICAgICAgICBwcm9taXNlLl8kZXJyID0gZXJyO1xyXG4gICAgICAgICAgICB2YXIgdW5oYW5kbGVkcyA9IFBTRC51bmhhbmRsZWRzO1xyXG4gICAgICAgICAgICB2YXIgaWR4ID0gdW5oYW5kbGVkcy5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICBydjtcclxuICAgICAgICAgICAgd2hpbGUgKGlkeC0tKSBpZiAodW5oYW5kbGVkc1tpZHhdLl8kZXJyID09PSBlcnIpIGJyZWFrO1xyXG4gICAgICAgICAgICBpZiAob25SZWplY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkeCAhPT0gLTEpIHVuaGFuZGxlZHMuc3BsaWNlKGlkeCwgMSk7IC8vIE1hcmsgYXMgaGFuZGxlZC5cclxuICAgICAgICAgICAgICAgIHJ2ID0gb25SZWplY3RlZChlcnIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ2ICYmIHR5cGVvZiBydi50aGVuID09PSAnZnVuY3Rpb24nKSBydi50aGVuKCk7IC8vIEludGVyY2VwdCB0aGF0IHByb21pc2UgYXMgd2VsbC5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChpZHggPT09IC0xKSB1bmhhbmRsZWRzLnB1c2gocHJvbWlzZSk7XHJcbiAgICAgICAgICAgICAgICBydiA9IFByb21pc2VDbGFzcy5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIHJ2Ll8kbm9pbnRlcmNlcHQgPSB0cnVlOyAvLyBQcm9oaWJpdCBldGVybmFsIGxvb3AuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLS1QU0QucmVmIHx8IFBTRC5maW5hbGl6ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcnY7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuXyRub2ludGVyY2VwdCkgcmV0dXJuIG9yaWdUaGVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgKytQU0QucmVmO1xyXG4gICAgICAgIHJldHVybiBvcmlnVGhlbi5jYWxsKHRoaXMsIG9uRnVsZmlsbGVkUHJveHksIG9uUmVqZWN0ZWRQcm94eSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIEdsb2JhbCBQcm9taXNlIHdyYXBwZXJcclxuaWYgKF9nbG9iYWwuUHJvbWlzZSkgd3JhcFByb21pc2UoX2dsb2JhbC5Qcm9taXNlKTtcclxuXHJcbiovXG5cbmRvRmFrZUF1dG9Db21wbGV0ZShmdW5jdGlvbiAoKSB7XG4gICAgLy8gU2ltcGxpZnkgdGhlIGpvYiBmb3IgVlMgSW50ZWxsaXNlbnNlLiBUaGlzIHBpZWNlIG9mIGNvZGUgaXMgb25lIG9mIHRoZSBrZXlzIHRvIHRoZSBuZXcgbWFydmVsbG91cyBpbnRlbGxpc2Vuc2Ugc3VwcG9ydCBpbiBEZXhpZS5cbiAgICBhc2FwJDEgPSBmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgfSwgMCk7XG4gICAgfTtcbn0pO1xuXG5mdW5jdGlvbiByZWplY3Rpb24oZXJyLCB1bmNhdWdodEhhbmRsZXIpIHtcbiAgICAvLyBHZXQgdGhlIGNhbGwgc3RhY2sgYW5kIHJldHVybiBhIHJlamVjdGVkIHByb21pc2UuXG4gICAgdmFyIHJ2ID0gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICByZXR1cm4gdW5jYXVnaHRIYW5kbGVyID8gcnYudW5jYXVnaHQodW5jYXVnaHRIYW5kbGVyKSA6IHJ2O1xufVxuXG4vKlxyXG4gKiBEZXhpZS5qcyAtIGEgbWluaW1hbGlzdGljIHdyYXBwZXIgZm9yIEluZGV4ZWREQlxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKlxyXG4gKiBCeSBEYXZpZCBGYWhsYW5kZXIsIGRhdmlkLmZhaGxhbmRlckBnbWFpbC5jb21cclxuICpcclxuICogVmVyc2lvbiAxLjUuMSwgVHVlIE5vdiAwMSAyMDE2XHJcbiAqXHJcbiAqIGh0dHA6Ly9kZXhpZS5vcmdcclxuICpcclxuICogQXBhY2hlIExpY2Vuc2UgVmVyc2lvbiAyLjAsIEphbnVhcnkgMjAwNCwgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL1xyXG4gKi9cblxudmFyIERFWElFX1ZFUlNJT04gPSAnMS41LjEnO1xudmFyIG1heFN0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjU1MzUpO1xudmFyIG1heEtleSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBJREJLZXlSYW5nZS5vbmx5KFtbXV0pO3JldHVybiBbW11dO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIG1heFN0cmluZztcbiAgICB9XG59KCk7XG52YXIgSU5WQUxJRF9LRVlfQVJHVU1FTlQgPSBcIkludmFsaWQga2V5IHByb3ZpZGVkLiBLZXlzIG11c3QgYmUgb2YgdHlwZSBzdHJpbmcsIG51bWJlciwgRGF0ZSBvciBBcnJheTxzdHJpbmcgfCBudW1iZXIgfCBEYXRlPi5cIjtcbnZhciBTVFJJTkdfRVhQRUNURUQgPSBcIlN0cmluZyBleHBlY3RlZC5cIjtcbnZhciBjb25uZWN0aW9ucyA9IFtdO1xudmFyIGlzSUVPckVkZ2UgPSB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAvKE1TSUV8VHJpZGVudHxFZGdlKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbnZhciBoYXNJRURlbGV0ZU9iamVjdFN0b3JlQnVnID0gaXNJRU9yRWRnZTtcbnZhciBoYW5nc09uRGVsZXRlTGFyZ2VLZXlSYW5nZSA9IGlzSUVPckVkZ2U7XG52YXIgZGV4aWVTdGFja0ZyYW1lRmlsdGVyID0gZnVuY3Rpb24gKGZyYW1lKSB7XG4gICAgcmV0dXJuICEvKGRleGllXFwuanN8ZGV4aWVcXC5taW5cXC5qcykvLnRlc3QoZnJhbWUpO1xufTtcblxuc2V0RGVidWcoZGVidWcsIGRleGllU3RhY2tGcmFtZUZpbHRlcik7XG5cbmZ1bmN0aW9uIERleGllKGRiTmFtZSwgb3B0aW9ucykge1xuICAgIC8vLyA8cGFyYW0gbmFtZT1cIm9wdGlvbnNcIiB0eXBlPVwiT2JqZWN0XCIgb3B0aW9uYWw9XCJ0cnVlXCI+U3BlY2lmeSBvbmx5IGlmIHlvdSB3aWNoIHRvIGNvbnRyb2wgd2hpY2ggYWRkb25zIHRoYXQgc2hvdWxkIHJ1biBvbiB0aGlzIGluc3RhbmNlPC9wYXJhbT5cbiAgICB2YXIgZGVwcyA9IERleGllLmRlcGVuZGVuY2llcztcbiAgICB2YXIgb3B0cyA9IGV4dGVuZCh7XG4gICAgICAgIC8vIERlZmF1bHQgT3B0aW9uc1xuICAgICAgICBhZGRvbnM6IERleGllLmFkZG9ucywgLy8gUGljayBzdGF0aWNhbGx5IHJlZ2lzdGVyZWQgYWRkb25zIGJ5IGRlZmF1bHRcbiAgICAgICAgYXV0b09wZW46IHRydWUsIC8vIERvbid0IHJlcXVpcmUgZGIub3BlbigpIGV4cGxpY2l0ZWx5LlxuICAgICAgICBpbmRleGVkREI6IGRlcHMuaW5kZXhlZERCLCAvLyBCYWNrZW5kIEluZGV4ZWREQiBhcGkuIERlZmF1bHQgdG8gSURCU2hpbSBvciBicm93c2VyIGVudi5cbiAgICAgICAgSURCS2V5UmFuZ2U6IGRlcHMuSURCS2V5UmFuZ2UgLy8gQmFja2VuZCBJREJLZXlSYW5nZSBhcGkuIERlZmF1bHQgdG8gSURCU2hpbSBvciBicm93c2VyIGVudi5cbiAgICB9LCBvcHRpb25zKTtcbiAgICB2YXIgYWRkb25zID0gb3B0cy5hZGRvbnMsXG4gICAgICAgIGF1dG9PcGVuID0gb3B0cy5hdXRvT3BlbixcbiAgICAgICAgaW5kZXhlZERCID0gb3B0cy5pbmRleGVkREIsXG4gICAgICAgIElEQktleVJhbmdlID0gb3B0cy5JREJLZXlSYW5nZTtcblxuICAgIHZhciBnbG9iYWxTY2hlbWEgPSB0aGlzLl9kYlNjaGVtYSA9IHt9O1xuICAgIHZhciB2ZXJzaW9ucyA9IFtdO1xuICAgIHZhciBkYlN0b3JlTmFtZXMgPSBbXTtcbiAgICB2YXIgYWxsVGFibGVzID0ge307XG4gICAgLy8vPHZhciB0eXBlPVwiSURCRGF0YWJhc2VcIiAvPlxuICAgIHZhciBpZGJkYiA9IG51bGw7IC8vIEluc3RhbmNlIG9mIElEQkRhdGFiYXNlXG4gICAgdmFyIGRiT3BlbkVycm9yID0gbnVsbDtcbiAgICB2YXIgaXNCZWluZ09wZW5lZCA9IGZhbHNlO1xuICAgIHZhciBvcGVuQ29tcGxldGUgPSBmYWxzZTtcbiAgICB2YXIgUkVBRE9OTFkgPSBcInJlYWRvbmx5XCIsXG4gICAgICAgIFJFQURXUklURSA9IFwicmVhZHdyaXRlXCI7XG4gICAgdmFyIGRiID0gdGhpcztcbiAgICB2YXIgZGJSZWFkeVJlc29sdmUsXG4gICAgICAgIGRiUmVhZHlQcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgZGJSZWFkeVJlc29sdmUgPSByZXNvbHZlO1xuICAgIH0pLFxuICAgICAgICBjYW5jZWxPcGVuLFxuICAgICAgICBvcGVuQ2FuY2VsbGVyID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKF8sIHJlamVjdCkge1xuICAgICAgICBjYW5jZWxPcGVuID0gcmVqZWN0O1xuICAgIH0pO1xuICAgIHZhciBhdXRvU2NoZW1hID0gdHJ1ZTtcbiAgICB2YXIgaGFzTmF0aXZlR2V0RGF0YWJhc2VOYW1lcyA9ICEhZ2V0TmF0aXZlR2V0RGF0YWJhc2VOYW1lc0ZuKGluZGV4ZWREQiksXG4gICAgICAgIGhhc0dldEFsbDtcblxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIC8vIERlZmF1bHQgc3Vic2NyaWJlcnMgdG8gXCJ2ZXJzaW9uY2hhbmdlXCIgYW5kIFwiYmxvY2tlZFwiLlxuICAgICAgICAvLyBDYW4gYmUgb3ZlcnJpZGRlbiBieSBjdXN0b20gaGFuZGxlcnMuIElmIGN1c3RvbSBoYW5kbGVycyByZXR1cm4gZmFsc2UsIHRoZXNlIGRlZmF1bHRcbiAgICAgICAgLy8gYmVoYXZpb3VycyB3aWxsIGJlIHByZXZlbnRlZC5cbiAgICAgICAgZGIub24oXCJ2ZXJzaW9uY2hhbmdlXCIsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgLy8gRGVmYXVsdCBiZWhhdmlvciBmb3IgdmVyc2lvbmNoYW5nZSBldmVudCBpcyB0byBjbG9zZSBkYXRhYmFzZSBjb25uZWN0aW9uLlxuICAgICAgICAgICAgLy8gQ2FsbGVyIGNhbiBvdmVycmlkZSB0aGlzIGJlaGF2aW9yIGJ5IGRvaW5nIGRiLm9uKFwidmVyc2lvbmNoYW5nZVwiLCBmdW5jdGlvbigpeyByZXR1cm4gZmFsc2U7IH0pO1xuICAgICAgICAgICAgLy8gTGV0J3Mgbm90IGJsb2NrIHRoZSBvdGhlciB3aW5kb3cgZnJvbSBtYWtpbmcgaXQncyBkZWxldGUoKSBvciBvcGVuKCkgY2FsbC5cbiAgICAgICAgICAgIC8vIE5PVEUhIFRoaXMgZXZlbnQgaXMgbmV2ZXIgZmlyZWQgaW4gSUUsRWRnZSBvciBTYWZhcmkuXG4gICAgICAgICAgICBpZiAoZXYubmV3VmVyc2lvbiA+IDApIGNvbnNvbGUud2FybignQW5vdGhlciBjb25uZWN0aW9uIHdhbnRzIHRvIHVwZ3JhZGUgZGF0YWJhc2UgXFwnJyArIGRiLm5hbWUgKyAnXFwnLiBDbG9zaW5nIGRiIG5vdyB0byByZXN1bWUgdGhlIHVwZ3JhZGUuJyk7ZWxzZSBjb25zb2xlLndhcm4oJ0Fub3RoZXIgY29ubmVjdGlvbiB3YW50cyB0byBkZWxldGUgZGF0YWJhc2UgXFwnJyArIGRiLm5hbWUgKyAnXFwnLiBDbG9zaW5nIGRiIG5vdyB0byByZXN1bWUgdGhlIGRlbGV0ZSByZXF1ZXN0LicpO1xuICAgICAgICAgICAgZGIuY2xvc2UoKTtcbiAgICAgICAgICAgIC8vIEluIG1hbnkgd2ViIGFwcGxpY2F0aW9ucywgaXQgd291bGQgYmUgcmVjb21tZW5kZWQgdG8gZm9yY2Ugd2luZG93LnJlbG9hZCgpXG4gICAgICAgICAgICAvLyB3aGVuIHRoaXMgZXZlbnQgb2NjdXJzLiBUbyBkbyB0aGF0LCBzdWJzY3JpYmUgdG8gdGhlIHZlcnNpb25jaGFuZ2UgZXZlbnRcbiAgICAgICAgICAgIC8vIGFuZCBjYWxsIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQodHJ1ZSkgaWYgZXYubmV3VmVyc2lvbiA+IDAgKG5vdCBhIGRlbGV0aW9uKVxuICAgICAgICAgICAgLy8gVGhlIHJlYXNvbiBmb3IgdGhpcyBpcyB0aGF0IHlvdXIgY3VycmVudCB3ZWIgYXBwIG9idmlvdXNseSBoYXMgb2xkIHNjaGVtYSBjb2RlIHRoYXQgbmVlZHNcbiAgICAgICAgICAgIC8vIHRvIGJlIHVwZGF0ZWQuIEFub3RoZXIgd2luZG93IGdvdCBhIG5ld2VyIHZlcnNpb24gb2YgdGhlIGFwcCBhbmQgbmVlZHMgdG8gdXBncmFkZSBEQiBidXRcbiAgICAgICAgICAgIC8vIHlvdXIgd2luZG93IGlzIGJsb2NraW5nIGl0IHVubGVzcyB3ZSBjbG9zZSBpdCBoZXJlLlxuICAgICAgICB9KTtcbiAgICAgICAgZGIub24oXCJibG9ja2VkXCIsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgaWYgKCFldi5uZXdWZXJzaW9uIHx8IGV2Lm5ld1ZlcnNpb24gPCBldi5vbGRWZXJzaW9uKSBjb25zb2xlLndhcm4oJ0RleGllLmRlbGV0ZShcXCcnICsgZGIubmFtZSArICdcXCcpIHdhcyBibG9ja2VkJyk7ZWxzZSBjb25zb2xlLndhcm4oJ1VwZ3JhZGUgXFwnJyArIGRiLm5hbWUgKyAnXFwnIGJsb2NrZWQgYnkgb3RoZXIgY29ubmVjdGlvbiBob2xkaW5nIHZlcnNpb24gJyArIGV2Lm9sZFZlcnNpb24gLyAxMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gVmVyc2lvbmluZyBGcmFtZXdvcmstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cblxuICAgIHRoaXMudmVyc2lvbiA9IGZ1bmN0aW9uICh2ZXJzaW9uTnVtYmVyKSB7XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInZlcnNpb25OdW1iZXJcIiB0eXBlPVwiTnVtYmVyXCI+PC9wYXJhbT5cbiAgICAgICAgLy8vIDxyZXR1cm5zIHR5cGU9XCJWZXJzaW9uXCI+PC9yZXR1cm5zPlxuICAgICAgICBpZiAoaWRiZGIgfHwgaXNCZWluZ09wZW5lZCkgdGhyb3cgbmV3IGV4Y2VwdGlvbnMuU2NoZW1hKFwiQ2Fubm90IGFkZCB2ZXJzaW9uIHdoZW4gZGF0YWJhc2UgaXMgb3BlblwiKTtcbiAgICAgICAgdGhpcy52ZXJubyA9IE1hdGgubWF4KHRoaXMudmVybm8sIHZlcnNpb25OdW1iZXIpO1xuICAgICAgICB2YXIgdmVyc2lvbkluc3RhbmNlID0gdmVyc2lvbnMuZmlsdGVyKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICByZXR1cm4gdi5fY2ZnLnZlcnNpb24gPT09IHZlcnNpb25OdW1iZXI7XG4gICAgICAgIH0pWzBdO1xuICAgICAgICBpZiAodmVyc2lvbkluc3RhbmNlKSByZXR1cm4gdmVyc2lvbkluc3RhbmNlO1xuICAgICAgICB2ZXJzaW9uSW5zdGFuY2UgPSBuZXcgVmVyc2lvbih2ZXJzaW9uTnVtYmVyKTtcbiAgICAgICAgdmVyc2lvbnMucHVzaCh2ZXJzaW9uSW5zdGFuY2UpO1xuICAgICAgICB2ZXJzaW9ucy5zb3J0KGxvd2VyVmVyc2lvbkZpcnN0KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb25JbnN0YW5jZTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gVmVyc2lvbih2ZXJzaW9uTnVtYmVyKSB7XG4gICAgICAgIHRoaXMuX2NmZyA9IHtcbiAgICAgICAgICAgIHZlcnNpb246IHZlcnNpb25OdW1iZXIsXG4gICAgICAgICAgICBzdG9yZXNTb3VyY2U6IG51bGwsXG4gICAgICAgICAgICBkYnNjaGVtYToge30sXG4gICAgICAgICAgICB0YWJsZXM6IHt9LFxuICAgICAgICAgICAgY29udGVudFVwZ3JhZGU6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zdG9yZXMoe30pOyAvLyBEZXJpdmUgZWFybGllciBzY2hlbWFzIGJ5IGRlZmF1bHQuXG4gICAgfVxuXG4gICAgZXh0ZW5kKFZlcnNpb24ucHJvdG90eXBlLCB7XG4gICAgICAgIHN0b3JlczogZnVuY3Rpb24gKHN0b3Jlcykge1xuICAgICAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAgICAgLy8vICAgRGVmaW5lcyB0aGUgc2NoZW1hIGZvciBhIHBhcnRpY3VsYXIgdmVyc2lvblxuICAgICAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInN0b3Jlc1wiIHR5cGU9XCJPYmplY3RcIj5cbiAgICAgICAgICAgIC8vLyBFeGFtcGxlOiA8YnIvPlxuICAgICAgICAgICAgLy8vICAge3VzZXJzOiBcImlkKyssZmlyc3QsbGFzdCwmYW1wO3VzZXJuYW1lLCplbWFpbFwiLCA8YnIvPlxuICAgICAgICAgICAgLy8vICAgcGFzc3dvcmRzOiBcImlkKyssJmFtcDt1c2VybmFtZVwifTxici8+XG4gICAgICAgICAgICAvLy8gPGJyLz5cbiAgICAgICAgICAgIC8vLyBTeW50YXg6IHtUYWJsZTogXCJbcHJpbWFyeUtleV1bKytdLFsmYW1wO11bKl1pbmRleDEsWyZhbXA7XVsqXWluZGV4MiwuLi5cIn08YnIvPjxici8+XG4gICAgICAgICAgICAvLy8gU3BlY2lhbCBjaGFyYWN0ZXJzOjxici8+XG4gICAgICAgICAgICAvLy8gIFwiJmFtcDtcIiAgbWVhbnMgdW5pcXVlIGtleSwgPGJyLz5cbiAgICAgICAgICAgIC8vLyAgXCIqXCIgIG1lYW5zIHZhbHVlIGlzIG11bHRpRW50cnksIDxici8+XG4gICAgICAgICAgICAvLy8gIFwiKytcIiBtZWFucyBhdXRvLWluY3JlbWVudCBhbmQgb25seSBhcHBsaWNhYmxlIGZvciBwcmltYXJ5IGtleSA8YnIvPlxuICAgICAgICAgICAgLy8vIDwvcGFyYW0+XG4gICAgICAgICAgICB0aGlzLl9jZmcuc3RvcmVzU291cmNlID0gdGhpcy5fY2ZnLnN0b3Jlc1NvdXJjZSA/IGV4dGVuZCh0aGlzLl9jZmcuc3RvcmVzU291cmNlLCBzdG9yZXMpIDogc3RvcmVzO1xuXG4gICAgICAgICAgICAvLyBEZXJpdmUgc3RvcmVzIGZyb20gZWFybGllciB2ZXJzaW9ucyBpZiB0aGV5IGFyZSBub3QgZXhwbGljaXRlbHkgc3BlY2lmaWVkIGFzIG51bGwgb3IgYSBuZXcgc3ludGF4LlxuICAgICAgICAgICAgdmFyIHN0b3Jlc1NwZWMgPSB7fTtcbiAgICAgICAgICAgIHZlcnNpb25zLmZvckVhY2goZnVuY3Rpb24gKHZlcnNpb24pIHtcbiAgICAgICAgICAgICAgICAvLyAndmVyc2lvbnMnIGlzIGFsd2F5cyBzb3J0ZWQgYnkgbG93ZXN0IHZlcnNpb24gZmlyc3QuXG4gICAgICAgICAgICAgICAgZXh0ZW5kKHN0b3Jlc1NwZWMsIHZlcnNpb24uX2NmZy5zdG9yZXNTb3VyY2UpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBkYnNjaGVtYSA9IHRoaXMuX2NmZy5kYnNjaGVtYSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5fcGFyc2VTdG9yZXNTcGVjKHN0b3Jlc1NwZWMsIGRic2NoZW1hKTtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgbGF0ZXN0IHNjaGVtYSB0byB0aGlzIHZlcnNpb25cbiAgICAgICAgICAgIC8vIFVwZGF0ZSBBUElcbiAgICAgICAgICAgIGdsb2JhbFNjaGVtYSA9IGRiLl9kYlNjaGVtYSA9IGRic2NoZW1hO1xuICAgICAgICAgICAgcmVtb3ZlVGFibGVzQXBpKFthbGxUYWJsZXMsIGRiLCBUcmFuc2FjdGlvbi5wcm90b3R5cGVdKTtcbiAgICAgICAgICAgIHNldEFwaU9uUGxhY2UoW2FsbFRhYmxlcywgZGIsIFRyYW5zYWN0aW9uLnByb3RvdHlwZSwgdGhpcy5fY2ZnLnRhYmxlc10sIGtleXMoZGJzY2hlbWEpLCBSRUFEV1JJVEUsIGRic2NoZW1hKTtcbiAgICAgICAgICAgIGRiU3RvcmVOYW1lcyA9IGtleXMoZGJzY2hlbWEpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHVwZ3JhZGU6IGZ1bmN0aW9uICh1cGdyYWRlRnVuY3Rpb24pIHtcbiAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInVwZ3JhZGVGdW5jdGlvblwiIG9wdGlvbmFsPVwidHJ1ZVwiPkZ1bmN0aW9uIHRoYXQgcGVyZm9ybXMgdXBncmFkaW5nIGFjdGlvbnMuPC9wYXJhbT5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGZha2VBdXRvQ29tcGxldGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHVwZ3JhZGVGdW5jdGlvbihkYi5fY3JlYXRlVHJhbnNhY3Rpb24oUkVBRFdSSVRFLCBrZXlzKHNlbGYuX2NmZy5kYnNjaGVtYSksIHNlbGYuX2NmZy5kYnNjaGVtYSkpOyAvLyBCVUdCVUc6IE5vIGNvZGUgY29tcGxldGlvbiBmb3IgcHJldiB2ZXJzaW9uJ3MgdGFibGVzIHdvbnQgYXBwZWFyLlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9jZmcuY29udGVudFVwZ3JhZGUgPSB1cGdyYWRlRnVuY3Rpb247XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgX3BhcnNlU3RvcmVzU3BlYzogZnVuY3Rpb24gKHN0b3Jlcywgb3V0U2NoZW1hKSB7XG4gICAgICAgICAgICBrZXlzKHN0b3JlcykuZm9yRWFjaChmdW5jdGlvbiAodGFibGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0b3Jlc1t0YWJsZU5hbWVdICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbnN0YW5jZVRlbXBsYXRlID0ge307XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleGVzID0gcGFyc2VJbmRleFN5bnRheChzdG9yZXNbdGFibGVOYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmltS2V5ID0gaW5kZXhlcy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJpbUtleS5tdWx0aSkgdGhyb3cgbmV3IGV4Y2VwdGlvbnMuU2NoZW1hKFwiUHJpbWFyeSBrZXkgY2Fubm90IGJlIG11bHRpLXZhbHVlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByaW1LZXkua2V5UGF0aCkgc2V0QnlLZXlQYXRoKGluc3RhbmNlVGVtcGxhdGUsIHByaW1LZXkua2V5UGF0aCwgcHJpbUtleS5hdXRvID8gMCA6IHByaW1LZXkua2V5UGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ZXMuZm9yRWFjaChmdW5jdGlvbiAoaWR4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWR4LmF1dG8pIHRocm93IG5ldyBleGNlcHRpb25zLlNjaGVtYShcIk9ubHkgcHJpbWFyeSBrZXkgY2FuIGJlIG1hcmtlZCBhcyBhdXRvSW5jcmVtZW50ICgrKylcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlkeC5rZXlQYXRoKSB0aHJvdyBuZXcgZXhjZXB0aW9ucy5TY2hlbWEoXCJJbmRleCBtdXN0IGhhdmUgYSBuYW1lIGFuZCBjYW5ub3QgYmUgYW4gZW1wdHkgc3RyaW5nXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0QnlLZXlQYXRoKGluc3RhbmNlVGVtcGxhdGUsIGlkeC5rZXlQYXRoLCBpZHguY29tcG91bmQgPyBpZHgua2V5UGF0aC5tYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIG91dFNjaGVtYVt0YWJsZU5hbWVdID0gbmV3IFRhYmxlU2NoZW1hKHRhYmxlTmFtZSwgcHJpbUtleSwgaW5kZXhlcywgaW5zdGFuY2VUZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHJ1blVwZ3JhZGVycyhvbGRWZXJzaW9uLCBpZGJ0cmFucywgcmVqZWN0KSB7XG4gICAgICAgIHZhciB0cmFucyA9IGRiLl9jcmVhdGVUcmFuc2FjdGlvbihSRUFEV1JJVEUsIGRiU3RvcmVOYW1lcywgZ2xvYmFsU2NoZW1hKTtcbiAgICAgICAgdHJhbnMuY3JlYXRlKGlkYnRyYW5zKTtcbiAgICAgICAgdHJhbnMuX2NvbXBsZXRpb24uY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgdmFyIHJlamVjdFRyYW5zYWN0aW9uID0gdHJhbnMuX3JlamVjdC5iaW5kKHRyYW5zKTtcbiAgICAgICAgbmV3U2NvcGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgUFNELnRyYW5zID0gdHJhbnM7XG4gICAgICAgICAgICBpZiAob2xkVmVyc2lvbiA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0YWJsZXM6XG4gICAgICAgICAgICAgICAga2V5cyhnbG9iYWxTY2hlbWEpLmZvckVhY2goZnVuY3Rpb24gKHRhYmxlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVUYWJsZShpZGJ0cmFucywgdGFibGVOYW1lLCBnbG9iYWxTY2hlbWFbdGFibGVOYW1lXS5wcmltS2V5LCBnbG9iYWxTY2hlbWFbdGFibGVOYW1lXS5pbmRleGVzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBQcm9taXNlLmZvbGxvdyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkYi5vbi5wb3B1bGF0ZS5maXJlKHRyYW5zKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChyZWplY3RUcmFuc2FjdGlvbik7XG4gICAgICAgICAgICB9IGVsc2UgdXBkYXRlVGFibGVzQW5kSW5kZXhlcyhvbGRWZXJzaW9uLCB0cmFucywgaWRidHJhbnMpLmNhdGNoKHJlamVjdFRyYW5zYWN0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlVGFibGVzQW5kSW5kZXhlcyhvbGRWZXJzaW9uLCB0cmFucywgaWRidHJhbnMpIHtcbiAgICAgICAgLy8gVXBncmFkZSB2ZXJzaW9uIHRvIHZlcnNpb24sIHN0ZXAtYnktc3RlcCBmcm9tIG9sZGVzdCB0byBuZXdlc3QgdmVyc2lvbi5cbiAgICAgICAgLy8gRWFjaCB0cmFuc2FjdGlvbiBvYmplY3Qgd2lsbCBjb250YWluIHRoZSB0YWJsZSBzZXQgdGhhdCB3YXMgY3VycmVudCBpbiB0aGF0IHZlcnNpb24gKGJ1dCBhbHNvIG5vdC15ZXQtZGVsZXRlZCB0YWJsZXMgZnJvbSBpdHMgcHJldmlvdXMgdmVyc2lvbilcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHZhciBvbGRWZXJzaW9uU3RydWN0ID0gdmVyc2lvbnMuZmlsdGVyKGZ1bmN0aW9uICh2ZXJzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdmVyc2lvbi5fY2ZnLnZlcnNpb24gPT09IG9sZFZlcnNpb247XG4gICAgICAgIH0pWzBdO1xuICAgICAgICBpZiAoIW9sZFZlcnNpb25TdHJ1Y3QpIHRocm93IG5ldyBleGNlcHRpb25zLlVwZ3JhZGUoXCJEZXhpZSBzcGVjaWZpY2F0aW9uIG9mIGN1cnJlbnRseSBpbnN0YWxsZWQgREIgdmVyc2lvbiBpcyBtaXNzaW5nXCIpO1xuICAgICAgICBnbG9iYWxTY2hlbWEgPSBkYi5fZGJTY2hlbWEgPSBvbGRWZXJzaW9uU3RydWN0Ll9jZmcuZGJzY2hlbWE7XG4gICAgICAgIHZhciBhbnlDb250ZW50VXBncmFkZXJIYXNSdW4gPSBmYWxzZTtcblxuICAgICAgICB2YXIgdmVyc1RvUnVuID0gdmVyc2lvbnMuZmlsdGVyKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICByZXR1cm4gdi5fY2ZnLnZlcnNpb24gPiBvbGRWZXJzaW9uO1xuICAgICAgICB9KTtcbiAgICAgICAgdmVyc1RvUnVuLmZvckVhY2goZnVuY3Rpb24gKHZlcnNpb24pIHtcbiAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInZlcnNpb25cIiB0eXBlPVwiVmVyc2lvblwiPjwvcGFyYW0+XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2xkU2NoZW1hID0gZ2xvYmFsU2NoZW1hO1xuICAgICAgICAgICAgICAgIHZhciBuZXdTY2hlbWEgPSB2ZXJzaW9uLl9jZmcuZGJzY2hlbWE7XG4gICAgICAgICAgICAgICAgYWRqdXN0VG9FeGlzdGluZ0luZGV4TmFtZXMob2xkU2NoZW1hLCBpZGJ0cmFucyk7XG4gICAgICAgICAgICAgICAgYWRqdXN0VG9FeGlzdGluZ0luZGV4TmFtZXMobmV3U2NoZW1hLCBpZGJ0cmFucyk7XG4gICAgICAgICAgICAgICAgZ2xvYmFsU2NoZW1hID0gZGIuX2RiU2NoZW1hID0gbmV3U2NoZW1hO1xuICAgICAgICAgICAgICAgIHZhciBkaWZmID0gZ2V0U2NoZW1hRGlmZihvbGRTY2hlbWEsIG5ld1NjaGVtYSk7XG4gICAgICAgICAgICAgICAgLy8gQWRkIHRhYmxlcyAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGlmZi5hZGQuZm9yRWFjaChmdW5jdGlvbiAodHVwbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlVGFibGUoaWRidHJhbnMsIHR1cGxlWzBdLCB0dXBsZVsxXS5wcmltS2V5LCB0dXBsZVsxXS5pbmRleGVzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBDaGFuZ2UgdGFibGVzXG4gICAgICAgICAgICAgICAgZGlmZi5jaGFuZ2UuZm9yRWFjaChmdW5jdGlvbiAoY2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFuZ2UucmVjcmVhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBleGNlcHRpb25zLlVwZ3JhZGUoXCJOb3QgeWV0IHN1cHBvcnQgZm9yIGNoYW5naW5nIHByaW1hcnkga2V5XCIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gaWRidHJhbnMub2JqZWN0U3RvcmUoY2hhbmdlLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGluZGV4ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZS5hZGQuZm9yRWFjaChmdW5jdGlvbiAoaWR4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkSW5kZXgoc3RvcmUsIGlkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBpbmRleGVzXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2UuY2hhbmdlLmZvckVhY2goZnVuY3Rpb24gKGlkeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlLmRlbGV0ZUluZGV4KGlkeC5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRJbmRleChzdG9yZSwgaWR4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGVsZXRlIGluZGV4ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZS5kZWwuZm9yRWFjaChmdW5jdGlvbiAoaWR4TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlLmRlbGV0ZUluZGV4KGlkeE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodmVyc2lvbi5fY2ZnLmNvbnRlbnRVcGdyYWRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFueUNvbnRlbnRVcGdyYWRlckhhc1J1biA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmZvbGxvdyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uLl9jZmcuY29udGVudFVwZ3JhZGUodHJhbnMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZnVuY3Rpb24gKGlkYnRyYW5zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhbnlDb250ZW50VXBncmFkZXJIYXNSdW4gfHwgIWhhc0lFRGVsZXRlT2JqZWN0U3RvcmVCdWcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRG9udCBkZWxldGUgb2xkIHRhYmxlcyBpZiBpZUJ1ZyBpcyBwcmVzZW50IGFuZCBhIGNvbnRlbnQgdXBncmFkZXIgaGFzIHJ1bi4gTGV0IHRhYmxlcyBiZSBsZWZ0IGluIERCIHNvIGZhci4gVGhpcyBuZWVkcyB0byBiZSB0YWtlbiBjYXJlIG9mLlxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3U2NoZW1hID0gdmVyc2lvbi5fY2ZnLmRic2NoZW1hO1xuICAgICAgICAgICAgICAgICAgICAvLyBEZWxldGUgb2xkIHRhYmxlc1xuICAgICAgICAgICAgICAgICAgICBkZWxldGVSZW1vdmVkVGFibGVzKG5ld1NjaGVtYSwgaWRidHJhbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3csIGNyZWF0ZSBhIHF1ZXVlIGV4ZWN1dGlvbiBlbmdpbmVcbiAgICAgICAgZnVuY3Rpb24gcnVuUXVldWUoKSB7XG4gICAgICAgICAgICByZXR1cm4gcXVldWUubGVuZ3RoID8gUHJvbWlzZS5yZXNvbHZlKHF1ZXVlLnNoaWZ0KCkodHJhbnMuaWRidHJhbnMpKS50aGVuKHJ1blF1ZXVlKSA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJ1blF1ZXVlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjcmVhdGVNaXNzaW5nVGFibGVzKGdsb2JhbFNjaGVtYSwgaWRidHJhbnMpOyAvLyBBdCBsYXN0LCBtYWtlIHN1cmUgdG8gY3JlYXRlIGFueSBtaXNzaW5nIHRhYmxlcy4gKE5lZWRlZCBieSBhZGRvbnMgdGhhdCBhZGQgc3RvcmVzIHRvIERCIHdpdGhvdXQgc3BlY2lmeWluZyB2ZXJzaW9uKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTY2hlbWFEaWZmKG9sZFNjaGVtYSwgbmV3U2NoZW1hKSB7XG4gICAgICAgIHZhciBkaWZmID0ge1xuICAgICAgICAgICAgZGVsOiBbXSwgLy8gQXJyYXkgb2YgdGFibGUgbmFtZXNcbiAgICAgICAgICAgIGFkZDogW10sIC8vIEFycmF5IG9mIFt0YWJsZU5hbWUsIG5ld0RlZmluaXRpb25dXG4gICAgICAgICAgICBjaGFuZ2U6IFtdIC8vIEFycmF5IG9mIHtuYW1lOiB0YWJsZU5hbWUsIHJlY3JlYXRlOiBuZXdEZWZpbml0aW9uLCBkZWw6IGRlbEluZGV4TmFtZXMsIGFkZDogbmV3SW5kZXhEZWZzLCBjaGFuZ2U6IGNoYW5nZWRJbmRleERlZnN9XG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIHRhYmxlIGluIG9sZFNjaGVtYSkge1xuICAgICAgICAgICAgaWYgKCFuZXdTY2hlbWFbdGFibGVdKSBkaWZmLmRlbC5wdXNoKHRhYmxlKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHRhYmxlIGluIG5ld1NjaGVtYSkge1xuICAgICAgICAgICAgdmFyIG9sZERlZiA9IG9sZFNjaGVtYVt0YWJsZV0sXG4gICAgICAgICAgICAgICAgbmV3RGVmID0gbmV3U2NoZW1hW3RhYmxlXTtcbiAgICAgICAgICAgIGlmICghb2xkRGVmKSB7XG4gICAgICAgICAgICAgICAgZGlmZi5hZGQucHVzaChbdGFibGUsIG5ld0RlZl0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hhbmdlID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0YWJsZSxcbiAgICAgICAgICAgICAgICAgICAgZGVmOiBuZXdEZWYsXG4gICAgICAgICAgICAgICAgICAgIHJlY3JlYXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZGVsOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgYWRkOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlOiBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKG9sZERlZi5wcmltS2V5LnNyYyAhPT0gbmV3RGVmLnByaW1LZXkuc3JjKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFByaW1hcnkga2V5IGhhcyBjaGFuZ2VkLiBSZW1vdmUgYW5kIHJlLWFkZCB0YWJsZS5cbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlLnJlY3JlYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZGlmZi5jaGFuZ2UucHVzaChjaGFuZ2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNhbWUgcHJpbWFyeSBrZXkuIEp1c3QgZmluZCBvdXQgd2hhdCBkaWZmZXJzOlxuICAgICAgICAgICAgICAgICAgICB2YXIgb2xkSW5kZXhlcyA9IG9sZERlZi5pZHhCeU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdJbmRleGVzID0gbmV3RGVmLmlkeEJ5TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaWR4TmFtZSBpbiBvbGRJbmRleGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5ld0luZGV4ZXNbaWR4TmFtZV0pIGNoYW5nZS5kZWwucHVzaChpZHhOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGlkeE5hbWUgaW4gbmV3SW5kZXhlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZElkeCA9IG9sZEluZGV4ZXNbaWR4TmFtZV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SWR4ID0gbmV3SW5kZXhlc1tpZHhOYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb2xkSWR4KSBjaGFuZ2UuYWRkLnB1c2gobmV3SWR4KTtlbHNlIGlmIChvbGRJZHguc3JjICE9PSBuZXdJZHguc3JjKSBjaGFuZ2UuY2hhbmdlLnB1c2gobmV3SWR4KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhbmdlLmRlbC5sZW5ndGggPiAwIHx8IGNoYW5nZS5hZGQubGVuZ3RoID4gMCB8fCBjaGFuZ2UuY2hhbmdlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYuY2hhbmdlLnB1c2goY2hhbmdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGlmZjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVUYWJsZShpZGJ0cmFucywgdGFibGVOYW1lLCBwcmltS2V5LCBpbmRleGVzKSB7XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImlkYnRyYW5zXCIgdHlwZT1cIklEQlRyYW5zYWN0aW9uXCI+PC9wYXJhbT5cbiAgICAgICAgdmFyIHN0b3JlID0gaWRidHJhbnMuZGIuY3JlYXRlT2JqZWN0U3RvcmUodGFibGVOYW1lLCBwcmltS2V5LmtleVBhdGggPyB7IGtleVBhdGg6IHByaW1LZXkua2V5UGF0aCwgYXV0b0luY3JlbWVudDogcHJpbUtleS5hdXRvIH0gOiB7IGF1dG9JbmNyZW1lbnQ6IHByaW1LZXkuYXV0byB9KTtcbiAgICAgICAgaW5kZXhlcy5mb3JFYWNoKGZ1bmN0aW9uIChpZHgpIHtcbiAgICAgICAgICAgIGFkZEluZGV4KHN0b3JlLCBpZHgpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHN0b3JlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZU1pc3NpbmdUYWJsZXMobmV3U2NoZW1hLCBpZGJ0cmFucykge1xuICAgICAgICBrZXlzKG5ld1NjaGVtYSkuZm9yRWFjaChmdW5jdGlvbiAodGFibGVOYW1lKSB7XG4gICAgICAgICAgICBpZiAoIWlkYnRyYW5zLmRiLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnModGFibGVOYW1lKSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZVRhYmxlKGlkYnRyYW5zLCB0YWJsZU5hbWUsIG5ld1NjaGVtYVt0YWJsZU5hbWVdLnByaW1LZXksIG5ld1NjaGVtYVt0YWJsZU5hbWVdLmluZGV4ZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWxldGVSZW1vdmVkVGFibGVzKG5ld1NjaGVtYSwgaWRidHJhbnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZGJ0cmFucy5kYi5vYmplY3RTdG9yZU5hbWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgc3RvcmVOYW1lID0gaWRidHJhbnMuZGIub2JqZWN0U3RvcmVOYW1lc1tpXTtcbiAgICAgICAgICAgIGlmIChuZXdTY2hlbWFbc3RvcmVOYW1lXSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWRidHJhbnMuZGIuZGVsZXRlT2JqZWN0U3RvcmUoc3RvcmVOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZEluZGV4KHN0b3JlLCBpZHgpIHtcbiAgICAgICAgc3RvcmUuY3JlYXRlSW5kZXgoaWR4Lm5hbWUsIGlkeC5rZXlQYXRoLCB7IHVuaXF1ZTogaWR4LnVuaXF1ZSwgbXVsdGlFbnRyeTogaWR4Lm11bHRpIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRiVW5jYXVnaHQoZXJyKSB7XG4gICAgICAgIHJldHVybiBkYi5vbi5lcnJvci5maXJlKGVycik7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICAgRGV4aWUgUHJvdGVjdGVkIEFQSVxuICAgIC8vXG4gICAgLy9cblxuICAgIHRoaXMuX2FsbFRhYmxlcyA9IGFsbFRhYmxlcztcblxuICAgIHRoaXMuX3RhYmxlRmFjdG9yeSA9IGZ1bmN0aW9uIGNyZWF0ZVRhYmxlKG1vZGUsIHRhYmxlU2NoZW1hKSB7XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInRhYmxlU2NoZW1hXCIgdHlwZT1cIlRhYmxlU2NoZW1hXCI+PC9wYXJhbT5cbiAgICAgICAgaWYgKG1vZGUgPT09IFJFQURPTkxZKSByZXR1cm4gbmV3IFRhYmxlKHRhYmxlU2NoZW1hLm5hbWUsIHRhYmxlU2NoZW1hLCBDb2xsZWN0aW9uKTtlbHNlIHJldHVybiBuZXcgV3JpdGVhYmxlVGFibGUodGFibGVTY2hlbWEubmFtZSwgdGFibGVTY2hlbWEpO1xuICAgIH07XG5cbiAgICB0aGlzLl9jcmVhdGVUcmFuc2FjdGlvbiA9IGZ1bmN0aW9uIChtb2RlLCBzdG9yZU5hbWVzLCBkYnNjaGVtYSwgcGFyZW50VHJhbnNhY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFuc2FjdGlvbihtb2RlLCBzdG9yZU5hbWVzLCBkYnNjaGVtYSwgcGFyZW50VHJhbnNhY3Rpb24pO1xuICAgIH07XG5cbiAgICAvKiBHZW5lcmF0ZSBhIHRlbXBvcmFyeSB0cmFuc2FjdGlvbiB3aGVuIGRiIG9wZXJhdGlvbnMgYXJlIGRvbmUgb3V0c2lkZSBhIHRyYW5zYWN0aW5vIHNjb3BlLlxyXG4gICAgKi9cbiAgICBmdW5jdGlvbiB0ZW1wVHJhbnNhY3Rpb24obW9kZSwgc3RvcmVOYW1lcywgZm4pIHtcbiAgICAgICAgLy8gTGFzdCBhcmd1bWVudCBpcyBcIndyaXRlTG9ja2VkXCIuIEJ1dCB0aGlzIGRvZXNudCBhcHBseSB0byBvbmVzaG90IGRpcmVjdCBkYiBvcGVyYXRpb25zLCBzbyB3ZSBpZ25vcmUgaXQuXG4gICAgICAgIGlmICghb3BlbkNvbXBsZXRlICYmICFQU0QubGV0VGhyb3VnaCkge1xuICAgICAgICAgICAgaWYgKCFpc0JlaW5nT3BlbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhdXRvT3BlbikgcmV0dXJuIHJlamVjdGlvbihuZXcgZXhjZXB0aW9ucy5EYXRhYmFzZUNsb3NlZCgpLCBkYlVuY2F1Z2h0KTtcbiAgICAgICAgICAgICAgICBkYi5vcGVuKCkuY2F0Y2gobm9wKTsgLy8gT3BlbiBpbiBiYWNrZ3JvdW5kLiBJZiBpZiBmYWlscywgaXQgd2lsbCBiZSBjYXRjaGVkIGJ5IHRoZSBmaW5hbCBwcm9taXNlIGFueXdheS5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkYlJlYWR5UHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcFRyYW5zYWN0aW9uKG1vZGUsIHN0b3JlTmFtZXMsIGZuKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHRyYW5zID0gZGIuX2NyZWF0ZVRyYW5zYWN0aW9uKG1vZGUsIHN0b3JlTmFtZXMsIGdsb2JhbFNjaGVtYSk7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnMuX3Byb21pc2UobW9kZSwgZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIG5ld1Njb3BlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gT1BUSU1JWkFUSU9OIFBPU1NJQkxFPyBuZXdTY29wZSgpIG5vdCBuZWVkZWQgYmVjYXVzZSBpdCdzIGFscmVhZHkgZG9uZSBpbiBfcHJvbWlzZS5cbiAgICAgICAgICAgICAgICAgICAgUFNELnRyYW5zID0gdHJhbnM7XG4gICAgICAgICAgICAgICAgICAgIGZuKHJlc29sdmUsIHJlamVjdCwgdHJhbnMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgLy8gSW5zdGVhZCBvZiByZXNvbHZpbmcgdmFsdWUgZGlyZWN0bHksIHdhaXQgd2l0aCByZXNvbHZpbmcgaXQgdW50aWwgdHJhbnNhY3Rpb24gaGFzIGNvbXBsZXRlZC5cbiAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UgdGhlIGRhdGEgd291bGQgbm90IGJlIGluIHRoZSBEQiBpZiByZXF1ZXN0aW5nIGl0IGluIHRoZSB0aGVuKCkgb3BlcmF0aW9uLlxuICAgICAgICAgICAgICAgIC8vIFNwZWNpZmljYWxseSwgdG8gZW5zdXJlIHRoYXQgdGhlIGZvbGxvd2luZyBleHByZXNzaW9uIHdpbGwgd29yazpcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vICAgZGIuZnJpZW5kcy5wdXQoe25hbWU6IFwiQXJuZVwifSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgZGIuZnJpZW5kcy53aGVyZShcIm5hbWVcIikuZXF1YWxzKFwiQXJuZVwiKS5jb3VudChmdW5jdGlvbihjb3VudCkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICBhc3NlcnQgKGNvdW50ID09PSAxKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyAgIH0pO1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zLl9jb21wbGV0aW9uLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7IC8qLmNhdGNoKGVyciA9PiB7IC8vIERvbid0IGRvIHRoaXMgYXMgb2Ygbm93LiBJZiB3b3VsZCBhZmZlY3QgYnVsay0gYW5kIG1vZGlmeSBtZXRob2RzIGluIGEgd2F5IHRoYXQgY291bGQgYmUgbW9yZSBpbnR1aXRpdmUuIEJ1dCB3YWl0ISBNYXliZSBjaGFuZ2UgaW4gbmV4dCBtYWpvci5cclxuICAgICAgICAgICAgICAgICB0cmFucy5fcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdGlvbihlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSk7Ki9cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3doZW5SZWFkeSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZmFrZSB8fCBvcGVuQ29tcGxldGUgfHwgUFNELmxldFRocm91Z2ggPyBmbiA6IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGlmICghaXNCZWluZ09wZW5lZCkge1xuICAgICAgICAgICAgICAgIGlmICghYXV0b09wZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBleGNlcHRpb25zLkRhdGFiYXNlQ2xvc2VkKCkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRiLm9wZW4oKS5jYXRjaChub3ApOyAvLyBPcGVuIGluIGJhY2tncm91bmQuIElmIGlmIGZhaWxzLCBpdCB3aWxsIGJlIGNhdGNoZWQgYnkgdGhlIGZpbmFsIHByb21pc2UgYW55d2F5LlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGJSZWFkeVByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZm4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS51bmNhdWdodChkYlVuY2F1Z2h0KTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAgICAgIERleGllIEFQSVxuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuXG4gICAgdGhpcy52ZXJubyA9IDA7XG5cbiAgICB0aGlzLm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChpc0JlaW5nT3BlbmVkIHx8IGlkYmRiKSByZXR1cm4gZGJSZWFkeVByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZGJPcGVuRXJyb3IgPyByZWplY3Rpb24oZGJPcGVuRXJyb3IsIGRiVW5jYXVnaHQpIDogZGI7XG4gICAgICAgIH0pO1xuICAgICAgICBkZWJ1ZyAmJiAob3BlbkNhbmNlbGxlci5fc3RhY2tIb2xkZXIgPSBnZXRFcnJvcldpdGhTdGFjaygpKTsgLy8gTGV0IHN0YWNrcyBwb2ludCB0byB3aGVuIG9wZW4oKSB3YXMgY2FsbGVkIHJhdGhlciB0aGFuIHdoZXJlIG5ldyBEZXhpZSgpIHdhcyBjYWxsZWQuXG4gICAgICAgIGlzQmVpbmdPcGVuZWQgPSB0cnVlO1xuICAgICAgICBkYk9wZW5FcnJvciA9IG51bGw7XG4gICAgICAgIG9wZW5Db21wbGV0ZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIEZ1bmN0aW9uIHBvaW50ZXJzIHRvIGNhbGwgd2hlbiB0aGUgY29yZSBvcGVuaW5nIHByb2Nlc3MgY29tcGxldGVzLlxuICAgICAgICB2YXIgcmVzb2x2ZURiUmVhZHkgPSBkYlJlYWR5UmVzb2x2ZSxcblxuICAgICAgICAvLyB1cGdyYWRlVHJhbnNhY3Rpb24gdG8gYWJvcnQgb24gZmFpbHVyZS5cbiAgICAgICAgdXBncmFkZVRyYW5zYWN0aW9uID0gbnVsbDtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yYWNlKFtvcGVuQ2FuY2VsbGVyLCBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBkb0Zha2VBdXRvQ29tcGxldGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIGNhbGxlciBoYXMgc3BlY2lmaWVkIGF0IGxlYXN0IG9uZSB2ZXJzaW9uXG4gICAgICAgICAgICBpZiAodmVyc2lvbnMubGVuZ3RoID4gMCkgYXV0b1NjaGVtYSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBNdWx0aXBseSBkYi52ZXJubyB3aXRoIDEwIHdpbGwgYmUgbmVlZGVkIHRvIHdvcmthcm91bmQgdXBncmFkaW5nIGJ1ZyBpbiBJRTpcbiAgICAgICAgICAgIC8vIElFIGZhaWxzIHdoZW4gZGVsZXRpbmcgb2JqZWN0U3RvcmUgYWZ0ZXIgcmVhZGluZyBmcm9tIGl0LlxuICAgICAgICAgICAgLy8gQSBmdXR1cmUgdmVyc2lvbiBvZiBEZXhpZS5qcyB3aWxsIHN0b3BvdmVyIGFuIGludGVybWVkaWF0ZSB2ZXJzaW9uIHRvIHdvcmthcm91bmQgdGhpcy5cbiAgICAgICAgICAgIC8vIEF0IHRoYXQgcG9pbnQsIHdlIHdhbnQgdG8gYmUgYmFja3dhcmQgY29tcGF0aWJsZS4gQ291bGQgaGF2ZSBiZWVuIG11bHRpcGxpZWQgd2l0aCAyLCBidXQgYnkgdXNpbmcgMTAsIGl0IGlzIGVhc2llciB0byBtYXAgdGhlIG51bWJlciB0byB0aGUgcmVhbCB2ZXJzaW9uIG51bWJlci5cblxuICAgICAgICAgICAgLy8gSWYgbm8gQVBJLCB0aHJvdyFcbiAgICAgICAgICAgIGlmICghaW5kZXhlZERCKSB0aHJvdyBuZXcgZXhjZXB0aW9ucy5NaXNzaW5nQVBJKFwiaW5kZXhlZERCIEFQSSBub3QgZm91bmQuIElmIHVzaW5nIElFMTArLCBtYWtlIHN1cmUgdG8gcnVuIHlvdXIgY29kZSBvbiBhIHNlcnZlciBVUkwgXCIgKyBcIihub3QgbG9jYWxseSkuIElmIHVzaW5nIG9sZCBTYWZhcmkgdmVyc2lvbnMsIG1ha2Ugc3VyZSB0byBpbmNsdWRlIGluZGV4ZWREQiBwb2x5ZmlsbC5cIik7XG5cbiAgICAgICAgICAgIHZhciByZXEgPSBhdXRvU2NoZW1hID8gaW5kZXhlZERCLm9wZW4oZGJOYW1lKSA6IGluZGV4ZWREQi5vcGVuKGRiTmFtZSwgTWF0aC5yb3VuZChkYi52ZXJubyAqIDEwKSk7XG4gICAgICAgICAgICBpZiAoIXJlcSkgdGhyb3cgbmV3IGV4Y2VwdGlvbnMuTWlzc2luZ0FQSShcIkluZGV4ZWREQiBBUEkgbm90IGF2YWlsYWJsZVwiKTsgLy8gTWF5IGhhcHBlbiBpbiBTYWZhcmkgcHJpdmF0ZSBtb2RlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2RmYWhsYW5kZXIvRGV4aWUuanMvaXNzdWVzLzEzNFxuICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSB3cmFwKGV2ZW50UmVqZWN0SGFuZGxlcihyZWplY3QpKTtcbiAgICAgICAgICAgIHJlcS5vbmJsb2NrZWQgPSB3cmFwKGZpcmVPbkJsb2NrZWQpO1xuICAgICAgICAgICAgcmVxLm9udXBncmFkZW5lZWRlZCA9IHdyYXAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB1cGdyYWRlVHJhbnNhY3Rpb24gPSByZXEudHJhbnNhY3Rpb247XG4gICAgICAgICAgICAgICAgaWYgKGF1dG9TY2hlbWEgJiYgIWRiLl9hbGxvd0VtcHR5REIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVW5sZXNzIGFuIGFkZG9uIGhhcyBzcGVjaWZpZWQgZGIuX2FsbG93RW1wdHlEQiwgbGV0cyBtYWtlIHRoZSBjYWxsIGZhaWwuXG4gICAgICAgICAgICAgICAgICAgIC8vIENhbGxlciBkaWQgbm90IHNwZWNpZnkgYSB2ZXJzaW9uIG9yIHNjaGVtYS4gRG9pbmcgdGhhdCBpcyBvbmx5IGFjY2VwdGFibGUgZm9yIG9wZW5pbmcgYWxyZWFkIGV4aXN0aW5nIGRhdGFiYXNlcy5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgb251cGdyYWRlbmVlZGVkIGlzIGNhbGxlZCBpdCBtZWFucyBkYXRhYmFzZSBkaWQgbm90IGV4aXN0LiBSZWplY3QgdGhlIG9wZW4oKSBwcm9taXNlIGFuZCBtYWtlIHN1cmUgdGhhdCB3ZVxuICAgICAgICAgICAgICAgICAgICAvLyBkbyBub3QgY3JlYXRlIGEgbmV3IGRhdGFiYXNlIGJ5IGFjY2lkZW50IGhlcmUuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gcHJldmVudERlZmF1bHQ7IC8vIFByb2hpYml0IG9uYWJvcnQgZXJyb3IgZnJvbSBmaXJpbmcgYmVmb3JlIHdlJ3JlIGRvbmUhXG4gICAgICAgICAgICAgICAgICAgIHVwZ3JhZGVUcmFuc2FjdGlvbi5hYm9ydCgpOyAvLyBBYm9ydCB0cmFuc2FjdGlvbiAod291bGQgaG9wZSB0aGF0IHRoaXMgd291bGQgbWFrZSBEQiBkaXNhcHBlYXIgYnV0IGl0IGRvZXNudC4pXG4gICAgICAgICAgICAgICAgICAgIC8vIENsb3NlIGRhdGFiYXNlIGFuZCBkZWxldGUgaXQuXG4gICAgICAgICAgICAgICAgICAgIHJlcS5yZXN1bHQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlbHJlcSA9IGluZGV4ZWREQi5kZWxldGVEYXRhYmFzZShkYk5hbWUpOyAvLyBUaGUgdXBncmFkZSB0cmFuc2FjdGlvbiBpcyBhdG9taWMsIGFuZCBqYXZhc2NyaXB0IGlzIHNpbmdsZSB0aHJlYWRlZCAtIG1lYW5pbmcgdGhhdCB0aGVyZSBpcyBubyByaXNrIHRoYXQgd2UgZGVsZXRlIHNvbWVvbmUgZWxzZXMgZGF0YWJhc2UgaGVyZSFcbiAgICAgICAgICAgICAgICAgICAgZGVscmVxLm9uc3VjY2VzcyA9IGRlbHJlcS5vbmVycm9yID0gd3JhcChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IGV4Y2VwdGlvbnMuTm9TdWNoRGF0YWJhc2UoJ0RhdGFiYXNlICcgKyBkYk5hbWUgKyAnIGRvZXNudCBleGlzdCcpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXBncmFkZVRyYW5zYWN0aW9uLm9uZXJyb3IgPSB3cmFwKGV2ZW50UmVqZWN0SGFuZGxlcihyZWplY3QpKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9sZFZlciA9IGUub2xkVmVyc2lvbiA+IE1hdGgucG93KDIsIDYyKSA/IDAgOiBlLm9sZFZlcnNpb247IC8vIFNhZmFyaSA4IGZpeC5cbiAgICAgICAgICAgICAgICAgICAgcnVuVXBncmFkZXJzKG9sZFZlciAvIDEwLCB1cGdyYWRlVHJhbnNhY3Rpb24sIHJlamVjdCwgcmVxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCByZWplY3QpO1xuXG4gICAgICAgICAgICByZXEub25zdWNjZXNzID0gd3JhcChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gQ29yZSBvcGVuaW5nIHByb2NlZHVyZSBjb21wbGV0ZS4gTm93IGxldCdzIGp1c3QgcmVjb3JkIHNvbWUgc3R1ZmYuXG4gICAgICAgICAgICAgICAgdXBncmFkZVRyYW5zYWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZGJkYiA9IHJlcS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbnMucHVzaChkYik7IC8vIFVzZWQgZm9yIGVtdWxhdGluZyB2ZXJzaW9uY2hhbmdlIGV2ZW50IG9uIElFL0VkZ2UvU2FmYXJpLlxuXG4gICAgICAgICAgICAgICAgaWYgKGF1dG9TY2hlbWEpIHJlYWRHbG9iYWxTY2hlbWEoKTtlbHNlIGlmIChpZGJkYi5vYmplY3RTdG9yZU5hbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkanVzdFRvRXhpc3RpbmdJbmRleE5hbWVzKGdsb2JhbFNjaGVtYSwgaWRiZGIudHJhbnNhY3Rpb24oc2FmYXJpTXVsdGlTdG9yZUZpeChpZGJkYi5vYmplY3RTdG9yZU5hbWVzKSwgUkVBRE9OTFkpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2FmYXJpIG1heSBiYWlsIG91dCBpZiA+IDEgc3RvcmUgbmFtZXMuIEhvd2V2ZXIsIHRoaXMgc2hvdWxkbnQgYmUgYSBzaG93c3RvcHBlci4gSXNzdWUgIzEyMC5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlkYmRiLm9udmVyc2lvbmNoYW5nZSA9IHdyYXAoZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICAgICAgICAgIGRiLl92Y0ZpcmVkID0gdHJ1ZTsgLy8gZGV0ZWN0IGltcGxlbWVudGF0aW9ucyB0aGF0IG5vdCBzdXBwb3J0IHZlcnNpb25jaGFuZ2UgKElFL0VkZ2UvU2FmYXJpKVxuICAgICAgICAgICAgICAgICAgICBkYi5vbihcInZlcnNpb25jaGFuZ2VcIikuZmlyZShldik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWhhc05hdGl2ZUdldERhdGFiYXNlTmFtZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIGxvY2FsU3RvcmFnZSB3aXRoIGxpc3Qgb2YgZGF0YWJhc2UgbmFtZXNcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsRGF0YWJhc2VMaXN0KGZ1bmN0aW9uIChkYXRhYmFzZU5hbWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YWJhc2VOYW1lcy5pbmRleE9mKGRiTmFtZSkgPT09IC0xKSByZXR1cm4gZGF0YWJhc2VOYW1lcy5wdXNoKGRiTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgIH0pXSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBCZWZvcmUgZmluYWxseSByZXNvbHZpbmcgdGhlIGRiUmVhZHlQcm9taXNlIGFuZCB0aGlzIHByb21pc2UsXG4gICAgICAgICAgICAvLyBjYWxsIGFuZCBhd2FpdCBhbGwgb24oJ3JlYWR5Jykgc3Vic2NyaWJlcnM6XG4gICAgICAgICAgICAvLyBEZXhpZS52aXAoKSBtYWtlcyBzdWJzY3JpYmVycyBhYmxlIHRvIHVzZSB0aGUgZGF0YWJhc2Ugd2hpbGUgYmVpbmcgb3BlbmVkLlxuICAgICAgICAgICAgLy8gVGhpcyBpcyBhIG11c3Qgc2luY2UgdGhlc2Ugc3Vic2NyaWJlcnMgdGFrZSBwYXJ0IG9mIHRoZSBvcGVuaW5nIHByb2NlZHVyZS5cbiAgICAgICAgICAgIHJldHVybiBEZXhpZS52aXAoZGIub24ucmVhZHkuZmlyZSk7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gUmVzb2x2ZSB0aGUgZGIub3BlbigpIHdpdGggdGhlIGRiIGluc3RhbmNlLlxuICAgICAgICAgICAgaXNCZWluZ09wZW5lZCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIGRiO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIERpZCB3ZSBmYWlsIHdpdGhpbiBvbnVwZ3JhZGVuZWVkZWQ/IE1ha2Ugc3VyZSB0byBhYm9ydCB0aGUgdXBncmFkZSB0cmFuc2FjdGlvbiBzbyBpdCBkb2VzbnQgY29tbWl0LlxuICAgICAgICAgICAgICAgIHVwZ3JhZGVUcmFuc2FjdGlvbiAmJiB1cGdyYWRlVHJhbnNhY3Rpb24uYWJvcnQoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgICAgICBpc0JlaW5nT3BlbmVkID0gZmFsc2U7IC8vIFNldCBiZWZvcmUgY2FsbGluZyBkYi5jbG9zZSgpIHNvIHRoYXQgaXQgZG9lc250IHJlamVjdCBvcGVuQ2FuY2VsbGVyIGFnYWluIChsZWFkcyB0byB1bmhhbmRsZWQgcmVqZWN0aW9uIGV2ZW50KS5cbiAgICAgICAgICAgIGRiLmNsb3NlKCk7IC8vIENsb3NlcyBhbmQgcmVzZXRzIGlkYmRiLCByZW1vdmVzIGNvbm5lY3Rpb25zLCByZXNldHMgZGJSZWFkeVByb21pc2UgYW5kIG9wZW5DYW5jZWxsZXIgc28gdGhhdCBhIGxhdGVyIGRiLm9wZW4oKSBpcyBmcmVzaC5cbiAgICAgICAgICAgIC8vIEEgY2FsbCB0byBkYi5jbG9zZSgpIG1heSBoYXZlIG1hZGUgb24tcmVhZHkgc3Vic2NyaWJlcnMgZmFpbC4gVXNlIGRiT3BlbkVycm9yIGlmIHNldCwgc2luY2UgZXJyIGNvdWxkIGJlIGEgZm9sbG93LXVwIGVycm9yIG9uIHRoYXQuXG4gICAgICAgICAgICBkYk9wZW5FcnJvciA9IGVycjsgLy8gUmVjb3JkIHRoZSBlcnJvci4gSXQgd2lsbCBiZSB1c2VkIHRvIHJlamVjdCBmdXJ0aGVyIHByb21pc2VzIG9mIGRiIG9wZXJhdGlvbnMuXG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0aW9uKGRiT3BlbkVycm9yLCBkYlVuY2F1Z2h0KTsgLy8gZGJVbmNhdWdodCB3aWxsIG1ha2Ugc3VyZSBhbnkgZXJyb3IgdGhhdCBoYXBwZW5lZCBpbiBhbnkgb3BlcmF0aW9uIGJlZm9yZSB3aWxsIG5vdyBidWJibGUgdG8gZGIub24uZXJyb3IoKSB0aGFua3MgdG8gdGhlIHNwZWNpYWwgaGFuZGxpbmcgaW4gUHJvbWlzZS51bmNhdWdodCgpLlxuICAgICAgICB9KS5maW5hbGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG9wZW5Db21wbGV0ZSA9IHRydWU7XG4gICAgICAgICAgICByZXNvbHZlRGJSZWFkeSgpOyAvLyBkYlJlYWR5UHJvbWlzZSBpcyByZXNvbHZlZCBubyBtYXR0ZXIgaWYgb3BlbigpIHJlamVjdHMgb3IgcmVzb2x2ZWQuIEl0J3MganVzdCB0byB3YWtlIHVwIHdhaXRlcnMuXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaWR4ID0gY29ubmVjdGlvbnMuaW5kZXhPZihkYik7XG4gICAgICAgIGlmIChpZHggPj0gMCkgY29ubmVjdGlvbnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIGlmIChpZGJkYikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZGJkYi5jbG9zZSgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgIGlkYmRiID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBhdXRvT3BlbiA9IGZhbHNlO1xuICAgICAgICBkYk9wZW5FcnJvciA9IG5ldyBleGNlcHRpb25zLkRhdGFiYXNlQ2xvc2VkKCk7XG4gICAgICAgIGlmIChpc0JlaW5nT3BlbmVkKSBjYW5jZWxPcGVuKGRiT3BlbkVycm9yKTtcbiAgICAgICAgLy8gUmVzZXQgZGJSZWFkeVByb21pc2UgcHJvbWlzZTpcbiAgICAgICAgZGJSZWFkeVByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgZGJSZWFkeVJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICB9KTtcbiAgICAgICAgb3BlbkNhbmNlbGxlciA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChfLCByZWplY3QpIHtcbiAgICAgICAgICAgIGNhbmNlbE9wZW4gPSByZWplY3Q7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGhhc0FyZ3VtZW50cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgaWYgKGhhc0FyZ3VtZW50cykgdGhyb3cgbmV3IGV4Y2VwdGlvbnMuSW52YWxpZEFyZ3VtZW50KFwiQXJndW1lbnRzIG5vdCBhbGxvd2VkIGluIGRiLmRlbGV0ZSgpXCIpO1xuICAgICAgICAgICAgaWYgKGlzQmVpbmdPcGVuZWQpIHtcbiAgICAgICAgICAgICAgICBkYlJlYWR5UHJvbWlzZS50aGVuKGRvRGVsZXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZG9EZWxldGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRvRGVsZXRlKCkge1xuICAgICAgICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgdmFyIHJlcSA9IGluZGV4ZWREQi5kZWxldGVEYXRhYmFzZShkYk5hbWUpO1xuICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSB3cmFwKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFoYXNOYXRpdmVHZXREYXRhYmFzZU5hbWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxEYXRhYmFzZUxpc3QoZnVuY3Rpb24gKGRhdGFiYXNlTmFtZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcG9zID0gZGF0YWJhc2VOYW1lcy5pbmRleE9mKGRiTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvcyA+PSAwKSByZXR1cm4gZGF0YWJhc2VOYW1lcy5zcGxpY2UocG9zLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IHdyYXAoZXZlbnRSZWplY3RIYW5kbGVyKHJlamVjdCkpO1xuICAgICAgICAgICAgICAgIHJlcS5vbmJsb2NrZWQgPSBmaXJlT25CbG9ja2VkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS51bmNhdWdodChkYlVuY2F1Z2h0KTtcbiAgICB9O1xuXG4gICAgdGhpcy5iYWNrZW5kREIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBpZGJkYjtcbiAgICB9O1xuXG4gICAgdGhpcy5pc09wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBpZGJkYiAhPT0gbnVsbDtcbiAgICB9O1xuICAgIHRoaXMuaGFzRmFpbGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZGJPcGVuRXJyb3IgIT09IG51bGw7XG4gICAgfTtcbiAgICB0aGlzLmR5bmFtaWNhbGx5T3BlbmVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gYXV0b1NjaGVtYTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICAvLyBQcm9wZXJ0aWVzXG4gICAgLy9cbiAgICB0aGlzLm5hbWUgPSBkYk5hbWU7XG5cbiAgICAvLyBkYi50YWJsZXMgLSBhbiBhcnJheSBvZiBhbGwgVGFibGUgaW5zdGFuY2VzLlxuICAgIHNldFByb3AodGhpcywgXCJ0YWJsZXNcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vLyA8cmV0dXJucyB0eXBlPVwiQXJyYXlcIiBlbGVtZW50VHlwZT1cIldyaXRlYWJsZVRhYmxlXCIgLz5cbiAgICAgICAgICAgIHJldHVybiBrZXlzKGFsbFRhYmxlcykubWFwKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFsbFRhYmxlc1tuYW1lXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIC8vIEV2ZW50c1xuICAgIC8vXG4gICAgdGhpcy5vbiA9IEV2ZW50cyh0aGlzLCBcImVycm9yXCIsIFwicG9wdWxhdGVcIiwgXCJibG9ja2VkXCIsIFwidmVyc2lvbmNoYW5nZVwiLCB7IHJlYWR5OiBbcHJvbWlzYWJsZUNoYWluLCBub3BdIH0pO1xuICAgIHRoaXMub24uZXJyb3Iuc3Vic2NyaWJlID0gZGVwcmVjYXRlZChcIkRleGllLm9uLmVycm9yXCIsIHRoaXMub24uZXJyb3Iuc3Vic2NyaWJlKTtcbiAgICB0aGlzLm9uLmVycm9yLnVuc3Vic2NyaWJlID0gZGVwcmVjYXRlZChcIkRleGllLm9uLmVycm9yLnVuc3Vic2NyaWJlXCIsIHRoaXMub24uZXJyb3IudW5zdWJzY3JpYmUpO1xuXG4gICAgdGhpcy5vbi5yZWFkeS5zdWJzY3JpYmUgPSBvdmVycmlkZSh0aGlzLm9uLnJlYWR5LnN1YnNjcmliZSwgZnVuY3Rpb24gKHN1YnNjcmliZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHN1YnNjcmliZXIsIGJTdGlja3kpIHtcbiAgICAgICAgICAgIERleGllLnZpcChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wZW5Db21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBEYXRhYmFzZSBhbHJlYWR5IG9wZW4uIENhbGwgc3Vic2NyaWJlciBhc2FwLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRiT3BlbkVycm9yKSBQcm9taXNlLnJlc29sdmUoKS50aGVuKHN1YnNjcmliZXIpO1xuICAgICAgICAgICAgICAgICAgICAvLyBiU3RpY2t5OiBBbHNvIHN1YnNjcmliZSB0byBmdXR1cmUgb3BlbiBzdWNlc3NlcyAoYWZ0ZXIgY2xvc2UgLyByZW9wZW4pIFxuICAgICAgICAgICAgICAgICAgICBpZiAoYlN0aWNreSkgc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERhdGFiYXNlIG5vdCB5ZXQgb3Blbi4gU3Vic2NyaWJlIHRvIGl0LlxuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGJTdGlja3kgaXMgZmFsc3ksIG1ha2Ugc3VyZSB0byB1bnN1YnNjcmliZSBzdWJzY3JpYmVyIHdoZW4gZmlyZWQgb25jZS5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFiU3RpY2t5KSBzdWJzY3JpYmUoZnVuY3Rpb24gdW5zdWJzY3JpYmUoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYi5vbi5yZWFkeS51bnN1YnNjcmliZShzdWJzY3JpYmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiLm9uLnJlYWR5LnVuc3Vic2NyaWJlKHVuc3Vic2NyaWJlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBmYWtlQXV0b0NvbXBsZXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGIub24oXCJwb3B1bGF0ZVwiKS5maXJlKGRiLl9jcmVhdGVUcmFuc2FjdGlvbihSRUFEV1JJVEUsIGRiU3RvcmVOYW1lcywgZ2xvYmFsU2NoZW1hKSk7XG4gICAgICAgIGRiLm9uKFwiZXJyb3JcIikuZmlyZShuZXcgRXJyb3IoKSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnRyYW5zYWN0aW9uID0gZnVuY3Rpb24gKG1vZGUsIHRhYmxlSW5zdGFuY2VzLCBzY29wZUZ1bmMpIHtcbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy9cbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwibW9kZVwiIHR5cGU9XCJTdHJpbmdcIj5cInJcIiBmb3IgcmVhZG9ubHksIG9yIFwicndcIiBmb3IgcmVhZHdyaXRlPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwidGFibGVJbnN0YW5jZXNcIj5UYWJsZSBpbnN0YW5jZSwgQXJyYXkgb2YgVGFibGUgaW5zdGFuY2VzLCBTdHJpbmcgb3IgU3RyaW5nIEFycmF5IG9mIG9iamVjdCBzdG9yZXMgdG8gaW5jbHVkZSBpbiB0aGUgdHJhbnNhY3Rpb248L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJzY29wZUZ1bmNcIiB0eXBlPVwiRnVuY3Rpb25cIj5GdW5jdGlvbiB0byBleGVjdXRlIHdpdGggdHJhbnNhY3Rpb248L3BhcmFtPlxuXG4gICAgICAgIC8vIExldCB0YWJsZSBhcmd1bWVudHMgYmUgYWxsIGFyZ3VtZW50cyBiZXR3ZWVuIG1vZGUgYW5kIGxhc3QgYXJndW1lbnQuXG4gICAgICAgIHZhciBpID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgaWYgKGkgPCAyKSB0aHJvdyBuZXcgZXhjZXB0aW9ucy5JbnZhbGlkQXJndW1lbnQoXCJUb28gZmV3IGFyZ3VtZW50c1wiKTtcbiAgICAgICAgLy8gUHJldmVudCBvcHRpbXphdGlvbiBraWxsZXIgKGh0dHBzOi8vZ2l0aHViLmNvbS9wZXRrYWFudG9ub3YvYmx1ZWJpcmQvd2lraS9PcHRpbWl6YXRpb24ta2lsbGVycyMzMi1sZWFraW5nLWFyZ3VtZW50cylcbiAgICAgICAgLy8gYW5kIGNsb25lIGFyZ3VtZW50cyBleGNlcHQgdGhlIGZpcnN0IG9uZSBpbnRvIGxvY2FsIHZhciAnYXJncycuXG4gICAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGkgLSAxKTtcbiAgICAgICAgd2hpbGUgKC0taSkge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH0gLy8gTGV0IHNjb3BlRnVuYyBiZSB0aGUgbGFzdCBhcmd1bWVudCBhbmQgcG9wIGl0IHNvIHRoYXQgYXJncyBub3cgb25seSBjb250YWluIHRoZSB0YWJsZSBhcmd1bWVudHMuXG4gICAgICAgIHNjb3BlRnVuYyA9IGFyZ3MucG9wKCk7XG4gICAgICAgIHZhciB0YWJsZXMgPSBmbGF0dGVuKGFyZ3MpOyAvLyBTdXBwb3J0IHVzaW5nIGFycmF5IGFzIG1pZGRsZSBhcmd1bWVudCwgb3IgYSBtaXggb2YgYXJyYXlzIGFuZCBub24tYXJyYXlzLlxuICAgICAgICB2YXIgcGFyZW50VHJhbnNhY3Rpb24gPSBQU0QudHJhbnM7XG4gICAgICAgIC8vIENoZWNrIGlmIHBhcmVudCB0cmFuc2FjdGlvbnMgaXMgYm91bmQgdG8gdGhpcyBkYiBpbnN0YW5jZSwgYW5kIGlmIGNhbGxlciB3YW50cyB0byByZXVzZSBpdFxuICAgICAgICBpZiAoIXBhcmVudFRyYW5zYWN0aW9uIHx8IHBhcmVudFRyYW5zYWN0aW9uLmRiICE9PSBkYiB8fCBtb2RlLmluZGV4T2YoJyEnKSAhPT0gLTEpIHBhcmVudFRyYW5zYWN0aW9uID0gbnVsbDtcbiAgICAgICAgdmFyIG9ubHlJZkNvbXBhdGlibGUgPSBtb2RlLmluZGV4T2YoJz8nKSAhPT0gLTE7XG4gICAgICAgIG1vZGUgPSBtb2RlLnJlcGxhY2UoJyEnLCAnJykucmVwbGFjZSgnPycsICcnKTsgLy8gT2suIFdpbGwgY2hhbmdlIGFyZ3VtZW50c1swXSBhcyB3ZWxsIGJ1dCB3ZSB3b250IHRvdWNoIGFyZ3VtZW50cyBoZW5jZWZvcnRoLlxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gR2V0IHN0b3JlTmFtZXMgZnJvbSBhcmd1bWVudHMuIEVpdGhlciB0aHJvdWdoIGdpdmVuIHRhYmxlIGluc3RhbmNlcywgb3IgdGhyb3VnaCBnaXZlbiB0YWJsZSBuYW1lcy5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICB2YXIgc3RvcmVOYW1lcyA9IHRhYmxlcy5tYXAoZnVuY3Rpb24gKHRhYmxlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0b3JlTmFtZSA9IHRhYmxlIGluc3RhbmNlb2YgVGFibGUgPyB0YWJsZS5uYW1lIDogdGFibGU7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzdG9yZU5hbWUgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCB0YWJsZSBhcmd1bWVudCB0byBEZXhpZS50cmFuc2FjdGlvbigpLiBPbmx5IFRhYmxlIG9yIFN0cmluZyBhcmUgYWxsb3dlZFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RvcmVOYW1lO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBSZXNvbHZlIG1vZGUuIEFsbG93IHNob3J0Y3V0cyBcInJcIiBhbmQgXCJyd1wiLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIGlmIChtb2RlID09IFwiclwiIHx8IG1vZGUgPT0gUkVBRE9OTFkpIG1vZGUgPSBSRUFET05MWTtlbHNlIGlmIChtb2RlID09IFwicndcIiB8fCBtb2RlID09IFJFQURXUklURSkgbW9kZSA9IFJFQURXUklURTtlbHNlIHRocm93IG5ldyBleGNlcHRpb25zLkludmFsaWRBcmd1bWVudChcIkludmFsaWQgdHJhbnNhY3Rpb24gbW9kZTogXCIgKyBtb2RlKTtcblxuICAgICAgICAgICAgaWYgKHBhcmVudFRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgLy8gQmFzaWMgY2hlY2tzXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudFRyYW5zYWN0aW9uLm1vZGUgPT09IFJFQURPTkxZICYmIG1vZGUgPT09IFJFQURXUklURSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAob25seUlmQ29tcGF0aWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3Bhd24gbmV3IHRyYW5zYWN0aW9uIGluc3RlYWQuXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRUcmFuc2FjdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB0aHJvdyBuZXcgZXhjZXB0aW9ucy5TdWJUcmFuc2FjdGlvbihcIkNhbm5vdCBlbnRlciBhIHN1Yi10cmFuc2FjdGlvbiB3aXRoIFJFQURXUklURSBtb2RlIHdoZW4gcGFyZW50IHRyYW5zYWN0aW9uIGlzIFJFQURPTkxZXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocGFyZW50VHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChzdG9yZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnRUcmFuc2FjdGlvbiAmJiBwYXJlbnRUcmFuc2FjdGlvbi5zdG9yZU5hbWVzLmluZGV4T2Yoc3RvcmVOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob25seUlmQ29tcGF0aWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTcGF3biBuZXcgdHJhbnNhY3Rpb24gaW5zdGVhZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50VHJhbnNhY3Rpb24gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB0aHJvdyBuZXcgZXhjZXB0aW9ucy5TdWJUcmFuc2FjdGlvbihcIlRhYmxlIFwiICsgc3RvcmVOYW1lICsgXCIgbm90IGluY2x1ZGVkIGluIHBhcmVudCB0cmFuc2FjdGlvbi5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmVudFRyYW5zYWN0aW9uID8gcGFyZW50VHJhbnNhY3Rpb24uX3Byb21pc2UobnVsbCwgZnVuY3Rpb24gKF8sIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgIH0pIDogcmVqZWN0aW9uKGUsIGRiVW5jYXVnaHQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSBzdWItdHJhbnNhY3Rpb24sIGxvY2sgdGhlIHBhcmVudCBhbmQgdGhlbiBsYXVuY2ggdGhlIHN1Yi10cmFuc2FjdGlvbi5cbiAgICAgICAgcmV0dXJuIHBhcmVudFRyYW5zYWN0aW9uID8gcGFyZW50VHJhbnNhY3Rpb24uX3Byb21pc2UobW9kZSwgZW50ZXJUcmFuc2FjdGlvblNjb3BlLCBcImxvY2tcIikgOiBkYi5fd2hlblJlYWR5KGVudGVyVHJhbnNhY3Rpb25TY29wZSk7XG5cbiAgICAgICAgZnVuY3Rpb24gZW50ZXJUcmFuc2FjdGlvblNjb3BlKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRQU0QgPSBQU0Q7XG4gICAgICAgICAgICByZXNvbHZlKFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdTY29wZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEtlZXAgYSBwb2ludGVyIHRvIGxhc3Qgbm9uLXRyYW5zYWN0aW9uYWwgUFNEIHRvIHVzZSBpZiBzb21lb25lIGNhbGxzIERleGllLmlnbm9yZVRyYW5zYWN0aW9uKCkuXG4gICAgICAgICAgICAgICAgICAgIFBTRC50cmFuc2xlc3MgPSBQU0QudHJhbnNsZXNzIHx8IHBhcmVudFBTRDtcbiAgICAgICAgICAgICAgICAgICAgLy8gT3VyIHRyYW5zYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAvL3JldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0cmFucyA9IGRiLl9jcmVhdGVUcmFuc2FjdGlvbihtb2RlLCBzdG9yZU5hbWVzLCBnbG9iYWxTY2hlbWEsIHBhcmVudFRyYW5zYWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gTGV0IHRoZSB0cmFuc2FjdGlvbiBpbnN0YW5jZSBiZSBwYXJ0IG9mIGEgUHJvbWlzZS1zcGVjaWZpYyBkYXRhIChQU0QpIHZhbHVlLlxuICAgICAgICAgICAgICAgICAgICBQU0QudHJhbnMgPSB0cmFucztcblxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50VHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVtdWxhdGUgdHJhbnNhY3Rpb24gY29tbWl0IGF3YXJlbmVzcyBmb3IgaW5uZXIgdHJhbnNhY3Rpb24gKG11c3QgJ2NvbW1pdCcgd2hlbiB0aGUgaW5uZXIgdHJhbnNhY3Rpb24gaGFzIG5vIG1vcmUgb3BlcmF0aW9ucyBvbmdvaW5nKVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnMuaWRidHJhbnMgPSBwYXJlbnRUcmFuc2FjdGlvbi5pZGJ0cmFucztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zLmNyZWF0ZSgpOyAvLyBDcmVhdGUgdGhlIGJhY2tlbmQgdHJhbnNhY3Rpb24gc28gdGhhdCBjb21wbGV0ZSgpIG9yIGVycm9yKCkgd2lsbCB0cmlnZ2VyIGV2ZW4gaWYgbm8gb3BlcmF0aW9uIGlzIG1hZGUgdXBvbiBpdC5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFByb3ZpZGUgYXJndW1lbnRzIHRvIHRoZSBzY29wZSBmdW5jdGlvbiAoZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpXG4gICAgICAgICAgICAgICAgICAgIHZhciB0YWJsZUFyZ3MgPSBzdG9yZU5hbWVzLm1hcChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsbFRhYmxlc1tuYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlQXJncy5wdXNoKHRyYW5zKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmV0dXJuVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmZvbGxvdyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGaW5hbGx5LCBjYWxsIHRoZSBzY29wZSBmdW5jdGlvbiB3aXRoIG91ciB0YWJsZSBhbmQgdHJhbnNhY3Rpb24gYXJndW1lbnRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSBzY29wZUZ1bmMuYXBwbHkodHJhbnMsIHRhYmxlQXJncyk7IC8vIE5PVEU6IHJldHVyblZhbHVlIGlzIHVzZWQgaW4gdHJhbnMub24uY29tcGxldGUoKSBub3QgYXMgYSByZXR1cm5WYWx1ZSB0byB0aGlzIGZ1bmMuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0dXJuVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJldHVyblZhbHVlLm5leHQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHJldHVyblZhbHVlLnRocm93ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNjb3BlRnVuYyByZXR1cm5lZCBhbiBpdGVyYXRvciB3aXRoIHRocm93LXN1cHBvcnQuIEhhbmRsZSB5aWVsZCBhcyBhd2FpdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSBhd2FpdEl0ZXJhdG9yKHJldHVyblZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXR1cm5WYWx1ZS50aGVuID09PSAnZnVuY3Rpb24nICYmICFoYXNPd24ocmV0dXJuVmFsdWUsICdfUFNEJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGV4Y2VwdGlvbnMuSW5jb21wYXRpYmxlUHJvbWlzZShcIkluY29tcGF0aWJsZSBQcm9taXNlIHJldHVybmVkIGZyb20gdHJhbnNhY3Rpb24gc2NvcGUgKHJlYWQgbW9yZSBhdCBodHRwOi8vdGlueXVybC5jb20vem55cWpxYykuIFRyYW5zYWN0aW9uIHNjb3BlOiBcIiArIHNjb3BlRnVuYy50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLnVuY2F1Z2h0KGRiVW5jYXVnaHQpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudFRyYW5zYWN0aW9uKSB0cmFucy5fcmVzb2x2ZSgpOyAvLyBzdWIgdHJhbnNhY3Rpb25zIGRvbid0IHJlYWN0IHRvIGlkYnRyYW5zLm9uY29tcGxldGUuIFdlIG11c3QgdHJpZ2dlciBhIGFjb21wbGV0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zLl9jb21wbGV0aW9uOyAvLyBFdmVuIGlmIFdFIGJlbGlldmUgZXZlcnl0aGluZyBpcyBmaW5lLiBBd2FpdCBJREJUcmFuc2FjdGlvbidzIG9uY29tcGxldGUgb3Igb25lcnJvciBhcyB3ZWxsLlxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnMuX3JlamVjdChlKTsgLy8gWWVzLCBhYm92ZSB0aGVuLWhhbmRsZXIgd2VyZSBtYXliZSBub3QgY2FsbGVkIGJlY2F1c2Ugb2YgYW4gdW5oYW5kbGVkIHJlamVjdGlvbiBpbiBzY29wZUZ1bmMhXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0aW9uKGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy99KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnRhYmxlID0gZnVuY3Rpb24gKHRhYmxlTmFtZSkge1xuICAgICAgICAvLy8gPHJldHVybnMgdHlwZT1cIldyaXRlYWJsZVRhYmxlXCI+PC9yZXR1cm5zPlxuICAgICAgICBpZiAoZmFrZSAmJiBhdXRvU2NoZW1hKSByZXR1cm4gbmV3IFdyaXRlYWJsZVRhYmxlKHRhYmxlTmFtZSk7XG4gICAgICAgIGlmICghaGFzT3duKGFsbFRhYmxlcywgdGFibGVOYW1lKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGV4Y2VwdGlvbnMuSW52YWxpZFRhYmxlKCdUYWJsZSAnICsgdGFibGVOYW1lICsgJyBkb2VzIG5vdCBleGlzdCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbGxUYWJsZXNbdGFibGVOYW1lXTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gVGFibGUgQ2xhc3NcbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICBmdW5jdGlvbiBUYWJsZShuYW1lLCB0YWJsZVNjaGVtYSwgY29sbENsYXNzKSB7XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cIm5hbWVcIiB0eXBlPVwiU3RyaW5nXCI+PC9wYXJhbT5cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5zY2hlbWEgPSB0YWJsZVNjaGVtYTtcbiAgICAgICAgdGhpcy5ob29rID0gYWxsVGFibGVzW25hbWVdID8gYWxsVGFibGVzW25hbWVdLmhvb2sgOiBFdmVudHMobnVsbCwge1xuICAgICAgICAgICAgXCJjcmVhdGluZ1wiOiBbaG9va0NyZWF0aW5nQ2hhaW4sIG5vcF0sXG4gICAgICAgICAgICBcInJlYWRpbmdcIjogW3B1cmVGdW5jdGlvbkNoYWluLCBtaXJyb3JdLFxuICAgICAgICAgICAgXCJ1cGRhdGluZ1wiOiBbaG9va1VwZGF0aW5nQ2hhaW4sIG5vcF0sXG4gICAgICAgICAgICBcImRlbGV0aW5nXCI6IFtob29rRGVsZXRpbmdDaGFpbiwgbm9wXVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fY29sbENsYXNzID0gY29sbENsYXNzIHx8IENvbGxlY3Rpb247XG4gICAgfVxuXG4gICAgcHJvcHMoVGFibGUucHJvdG90eXBlLCB7XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGFibGUgUHJvdGVjdGVkIE1ldGhvZHNcbiAgICAgICAgLy9cblxuICAgICAgICBfdHJhbnM6IGZ1bmN0aW9uIGdldFRyYW5zYWN0aW9uKG1vZGUsIGZuLCB3cml0ZUxvY2tlZCkge1xuICAgICAgICAgICAgdmFyIHRyYW5zID0gUFNELnRyYW5zO1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zICYmIHRyYW5zLmRiID09PSBkYiA/IHRyYW5zLl9wcm9taXNlKG1vZGUsIGZuLCB3cml0ZUxvY2tlZCkgOiB0ZW1wVHJhbnNhY3Rpb24obW9kZSwgW3RoaXMubmFtZV0sIGZuKTtcbiAgICAgICAgfSxcbiAgICAgICAgX2lkYnN0b3JlOiBmdW5jdGlvbiBnZXRJREJPYmplY3RTdG9yZShtb2RlLCBmbiwgd3JpdGVMb2NrZWQpIHtcbiAgICAgICAgICAgIGlmIChmYWtlKSByZXR1cm4gbmV3IFByb21pc2UoZm4pOyAvLyBTaW1wbGlmeSB0aGUgd29yayBmb3IgSW50ZWxsaXNlbnNlL0NvZGUgY29tcGxldGlvbi5cbiAgICAgICAgICAgIHZhciB0cmFucyA9IFBTRC50cmFucyxcbiAgICAgICAgICAgICAgICB0YWJsZU5hbWUgPSB0aGlzLm5hbWU7XG4gICAgICAgICAgICBmdW5jdGlvbiBzdXBwbHlJZGJTdG9yZShyZXNvbHZlLCByZWplY3QsIHRyYW5zKSB7XG4gICAgICAgICAgICAgICAgZm4ocmVzb2x2ZSwgcmVqZWN0LCB0cmFucy5pZGJ0cmFucy5vYmplY3RTdG9yZSh0YWJsZU5hbWUpLCB0cmFucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJhbnMgJiYgdHJhbnMuZGIgPT09IGRiID8gdHJhbnMuX3Byb21pc2UobW9kZSwgc3VwcGx5SWRiU3RvcmUsIHdyaXRlTG9ja2VkKSA6IHRlbXBUcmFuc2FjdGlvbihtb2RlLCBbdGhpcy5uYW1lXSwgc3VwcGx5SWRiU3RvcmUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRhYmxlIFB1YmxpYyBNZXRob2RzXG4gICAgICAgIC8vXG4gICAgICAgIGdldDogZnVuY3Rpb24gKGtleSwgY2IpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pZGJzdG9yZShSRUFET05MWSwgZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCwgaWRic3RvcmUpIHtcbiAgICAgICAgICAgICAgICBmYWtlICYmIHJlc29sdmUoc2VsZi5zY2hlbWEuaW5zdGFuY2VUZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgdmFyIHJlcSA9IGlkYnN0b3JlLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZXZlbnRSZWplY3RIYW5kbGVyKHJlamVjdCk7XG4gICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IHdyYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNlbGYuaG9vay5yZWFkaW5nLmZpcmUocmVxLnJlc3VsdCkpO1xuICAgICAgICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgICAgICB9KS50aGVuKGNiKTtcbiAgICAgICAgfSxcbiAgICAgICAgd2hlcmU6IGZ1bmN0aW9uIChpbmRleE5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgV2hlcmVDbGF1c2UodGhpcywgaW5kZXhOYW1lKTtcbiAgICAgICAgfSxcbiAgICAgICAgY291bnQ6IGZ1bmN0aW9uIChjYikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9Db2xsZWN0aW9uKCkuY291bnQoY2IpO1xuICAgICAgICB9LFxuICAgICAgICBvZmZzZXQ6IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvQ29sbGVjdGlvbigpLm9mZnNldChvZmZzZXQpO1xuICAgICAgICB9LFxuICAgICAgICBsaW1pdDogZnVuY3Rpb24gKG51bVJvd3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvQ29sbGVjdGlvbigpLmxpbWl0KG51bVJvd3MpO1xuICAgICAgICB9LFxuICAgICAgICByZXZlcnNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0NvbGxlY3Rpb24oKS5yZXZlcnNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGZpbHRlcjogZnVuY3Rpb24gKGZpbHRlckZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0NvbGxlY3Rpb24oKS5hbmQoZmlsdGVyRnVuY3Rpb24pO1xuICAgICAgICB9LFxuICAgICAgICBlYWNoOiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvQ29sbGVjdGlvbigpLmVhY2goZm4pO1xuICAgICAgICB9LFxuICAgICAgICB0b0FycmF5OiBmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvQ29sbGVjdGlvbigpLnRvQXJyYXkoY2IpO1xuICAgICAgICB9LFxuICAgICAgICBvcmRlckJ5OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcy5fY29sbENsYXNzKG5ldyBXaGVyZUNsYXVzZSh0aGlzLCBpbmRleCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvQ29sbGVjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzLl9jb2xsQ2xhc3MobmV3IFdoZXJlQ2xhdXNlKHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtYXBUb0NsYXNzOiBmdW5jdGlvbiAoY29uc3RydWN0b3IsIHN0cnVjdHVyZSkge1xuICAgICAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAgICAgLy8vICAgICBNYXAgdGFibGUgdG8gYSBqYXZhc2NyaXB0IGNvbnN0cnVjdG9yIGZ1bmN0aW9uLiBPYmplY3RzIHJldHVybmVkIGZyb20gdGhlIGRhdGFiYXNlIHdpbGwgYmUgaW5zdGFuY2VzIG9mIHRoaXMgY2xhc3MsIG1ha2luZ1xuICAgICAgICAgICAgLy8vICAgICBpdCBwb3NzaWJsZSB0byB0aGUgaW5zdGFuY2VPZiBvcGVyYXRvciBhcyB3ZWxsIGFzIGV4dGVuZGluZyB0aGUgY2xhc3MgdXNpbmcgY29uc3RydWN0b3IucHJvdG90eXBlLm1ldGhvZCA9IGZ1bmN0aW9uKCl7Li4ufS5cbiAgICAgICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJjb25zdHJ1Y3RvclwiPkNvbnN0cnVjdG9yIGZ1bmN0aW9uIHJlcHJlc2VudGluZyB0aGUgY2xhc3MuPC9wYXJhbT5cbiAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInN0cnVjdHVyZVwiIG9wdGlvbmFsPVwidHJ1ZVwiPkhlbHBzIElERSBjb2RlIGNvbXBsZXRpb24gYnkga25vd2luZyB0aGUgbWVtYmVycyB0aGF0IG9iamVjdHMgY29udGFpbiBhbmQgbm90IGp1c3QgdGhlIGluZGV4ZXMuIEFsc29cbiAgICAgICAgICAgIC8vLyBrbm93IHdoYXQgdHlwZSBlYWNoIG1lbWJlciBoYXMuIEV4YW1wbGU6IHtuYW1lOiBTdHJpbmcsIGVtYWlsQWRkcmVzc2VzOiBbU3RyaW5nXSwgcGFzc3dvcmR9PC9wYXJhbT5cbiAgICAgICAgICAgIHRoaXMuc2NoZW1hLm1hcHBlZENsYXNzID0gY29uc3RydWN0b3I7XG4gICAgICAgICAgICB2YXIgaW5zdGFuY2VUZW1wbGF0ZSA9IE9iamVjdC5jcmVhdGUoY29uc3RydWN0b3IucHJvdG90eXBlKTtcbiAgICAgICAgICAgIGlmIChzdHJ1Y3R1cmUpIHtcbiAgICAgICAgICAgICAgICAvLyBzdHJ1Y3R1cmUgYW5kIGluc3RhbmNlVGVtcGxhdGUgaXMgZm9yIElERSBjb2RlIGNvbXBldGlvbiBvbmx5IHdoaWxlIGNvbnN0cnVjdG9yLnByb3RvdHlwZSBpcyBmb3IgYWN0dWFsIGluaGVyaXRhbmNlLlxuICAgICAgICAgICAgICAgIGFwcGx5U3RydWN0dXJlKGluc3RhbmNlVGVtcGxhdGUsIHN0cnVjdHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNjaGVtYS5pbnN0YW5jZVRlbXBsYXRlID0gaW5zdGFuY2VUZW1wbGF0ZTtcblxuICAgICAgICAgICAgLy8gTm93LCBzdWJzY3JpYmUgdG8gdGhlIHdoZW4oXCJyZWFkaW5nXCIpIGV2ZW50IHRvIG1ha2UgYWxsIG9iamVjdHMgdGhhdCBjb21lIG91dCBmcm9tIHRoaXMgdGFibGUgaW5oZXJpdCBmcm9tIGdpdmVuIGNsYXNzXG4gICAgICAgICAgICAvLyBubyBtYXR0ZXIgd2hpY2ggbWV0aG9kIHRvIHVzZSBmb3IgcmVhZGluZyAoVGFibGUuZ2V0KCkgb3IgVGFibGUud2hlcmUoLi4uKS4uLiApXG4gICAgICAgICAgICB2YXIgcmVhZEhvb2sgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmopIHJldHVybiBvYmo7IC8vIE5vIHZhbGlkIG9iamVjdC4gKFZhbHVlIGlzIG51bGwpLiBSZXR1cm4gYXMgaXMuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IG9iamVjdCB0aGF0IGRlcml2ZXMgZnJvbSBjb25zdHJ1Y3RvcjpcbiAgICAgICAgICAgICAgICB2YXIgcmVzID0gT2JqZWN0LmNyZWF0ZShjb25zdHJ1Y3Rvci5wcm90b3R5cGUpO1xuICAgICAgICAgICAgICAgIC8vIENsb25lIG1lbWJlcnM6XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhc093bihvYmosIG0pKSB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzW21dID0gb2JqW21dO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChfKSB7fVxuICAgICAgICAgICAgICAgIH1yZXR1cm4gcmVzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc2NoZW1hLnJlYWRIb29rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ob29rLnJlYWRpbmcudW5zdWJzY3JpYmUodGhpcy5zY2hlbWEucmVhZEhvb2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zY2hlbWEucmVhZEhvb2sgPSByZWFkSG9vaztcbiAgICAgICAgICAgIHRoaXMuaG9vayhcInJlYWRpbmdcIiwgcmVhZEhvb2spO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yO1xuICAgICAgICB9LFxuICAgICAgICBkZWZpbmVDbGFzczogZnVuY3Rpb24gKHN0cnVjdHVyZSkge1xuICAgICAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAgICAgLy8vICAgICBEZWZpbmUgYWxsIG1lbWJlcnMgb2YgdGhlIGNsYXNzIHRoYXQgcmVwcmVzZW50cyB0aGUgdGFibGUuIFRoaXMgd2lsbCBoZWxwIGNvZGUgY29tcGxldGlvbiBvZiB3aGVuIG9iamVjdHMgYXJlIHJlYWQgZnJvbSB0aGUgZGF0YWJhc2VcbiAgICAgICAgICAgIC8vLyAgICAgYXMgd2VsbCBhcyBtYWtpbmcgaXQgcG9zc2libGUgdG8gZXh0ZW5kIHRoZSBwcm90b3R5cGUgb2YgdGhlIHJldHVybmVkIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuICAgICAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInN0cnVjdHVyZVwiPkhlbHBzIElERSBjb2RlIGNvbXBsZXRpb24gYnkga25vd2luZyB0aGUgbWVtYmVycyB0aGF0IG9iamVjdHMgY29udGFpbiBhbmQgbm90IGp1c3QgdGhlIGluZGV4ZXMuIEFsc29cbiAgICAgICAgICAgIC8vLyBrbm93IHdoYXQgdHlwZSBlYWNoIG1lbWJlciBoYXMuIEV4YW1wbGU6IHtuYW1lOiBTdHJpbmcsIGVtYWlsQWRkcmVzc2VzOiBbU3RyaW5nXSwgcHJvcGVydGllczoge3Nob2VTaXplOiBOdW1iZXJ9fTwvcGFyYW0+XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXBUb0NsYXNzKERleGllLmRlZmluZUNsYXNzKHN0cnVjdHVyZSksIHN0cnVjdHVyZSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vIFdyaXRlYWJsZVRhYmxlIENsYXNzIChleHRlbmRzIFRhYmxlKVxuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIGZ1bmN0aW9uIFdyaXRlYWJsZVRhYmxlKG5hbWUsIHRhYmxlU2NoZW1hLCBjb2xsQ2xhc3MpIHtcbiAgICAgICAgVGFibGUuY2FsbCh0aGlzLCBuYW1lLCB0YWJsZVNjaGVtYSwgY29sbENsYXNzIHx8IFdyaXRlYWJsZUNvbGxlY3Rpb24pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIEJ1bGtFcnJvckhhbmRsZXJDYXRjaEFsbChlcnJvckxpc3QsIGRvbmUsIHN1cHBvcnRIb29rcykge1xuICAgICAgICByZXR1cm4gKHN1cHBvcnRIb29rcyA/IGhvb2tlZEV2ZW50UmVqZWN0SGFuZGxlciA6IGV2ZW50UmVqZWN0SGFuZGxlcikoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGVycm9yTGlzdC5wdXNoKGUpO1xuICAgICAgICAgICAgZG9uZSAmJiBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJ1bGtEZWxldGUoaWRic3RvcmUsIHRyYW5zLCBrZXlzT3JUdXBsZXMsIGhhc0RlbGV0ZUhvb2ssIGRlbGV0aW5nSG9vaykge1xuICAgICAgICAvLyBJZiBoYXNEZWxldGVIb29rLCBrZXlzT3JUdXBsZXMgbXVzdCBiZSBhbiBhcnJheSBvZiB0dXBsZXM6IFtba2V5MSwgdmFsdWUyXSxba2V5Mix2YWx1ZTJdLC4uLl0sXG4gICAgICAgIC8vIGVsc2Uga2V5c09yVHVwbGVzIG11c3QgYmUganVzdCBhbiBhcnJheSBvZiBrZXlzOiBba2V5MSwga2V5MiwgLi4uXS5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBrZXlzT3JUdXBsZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGxhc3RJdGVtID0gbGVuIC0gMTtcbiAgICAgICAgICAgIGlmIChsZW4gPT09IDApIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgICAgICBpZiAoIWhhc0RlbGV0ZUhvb2spIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBpZGJzdG9yZS5kZWxldGUoa2V5c09yVHVwbGVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSB3cmFwKGV2ZW50UmVqZWN0SGFuZGxlcihyZWplY3QpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IGxhc3RJdGVtKSByZXEub25zdWNjZXNzID0gd3JhcChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBob29rQ3R4LFxuICAgICAgICAgICAgICAgICAgICBlcnJvckhhbmRsZXIgPSBob29rZWRFdmVudFJlamVjdEhhbmRsZXIocmVqZWN0KSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc0hhbmRsZXIgPSBob29rZWRFdmVudFN1Y2Nlc3NIYW5kbGVyKG51bGwpO1xuICAgICAgICAgICAgICAgIHRyeUNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaG9va0N0eCA9IHsgb25zdWNjZXNzOiBudWxsLCBvbmVycm9yOiBudWxsIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHVwbGUgPSBrZXlzT3JUdXBsZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGluZ0hvb2suY2FsbChob29rQ3R4LCB0dXBsZVswXSwgdHVwbGVbMV0sIHRyYW5zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBpZGJzdG9yZS5kZWxldGUodHVwbGVbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxLl9ob29rQ3R4ID0gaG9va0N0eDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZXJyb3JIYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IGxhc3RJdGVtKSByZXEub25zdWNjZXNzID0gaG9va2VkRXZlbnRTdWNjZXNzSGFuZGxlcihyZXNvbHZlKTtlbHNlIHJlcS5vbnN1Y2Nlc3MgPSBzdWNjZXNzSGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaG9va0N0eC5vbmVycm9yICYmIGhvb2tDdHgub25lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnVuY2F1Z2h0KGRiVW5jYXVnaHQpO1xuICAgIH1cblxuICAgIGRlcml2ZShXcml0ZWFibGVUYWJsZSkuZnJvbShUYWJsZSkuZXh0ZW5kKHtcbiAgICAgICAgYnVsa0RlbGV0ZTogZnVuY3Rpb24gKGtleXMkJDEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhvb2suZGVsZXRpbmcuZmlyZSA9PT0gbm9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lkYnN0b3JlKFJFQURXUklURSwgZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCwgaWRic3RvcmUsIHRyYW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYnVsa0RlbGV0ZShpZGJzdG9yZSwgdHJhbnMsIGtleXMkJDEsIGZhbHNlLCBub3ApKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2hlcmUoJzppZCcpLmFueU9mKGtleXMkJDEpLmRlbGV0ZSgpLnRoZW4oZnVuY3Rpb24gKCkge30pOyAvLyBSZXNvbHZlIHdpdGggdW5kZWZpbmVkLlxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBidWxrUHV0OiBmdW5jdGlvbiAob2JqZWN0cywga2V5cyQkMSkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lkYnN0b3JlKFJFQURXUklURSwgZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCwgaWRic3RvcmUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlkYnN0b3JlLmtleVBhdGggJiYgIV90aGlzLnNjaGVtYS5wcmltS2V5LmF1dG8gJiYgIWtleXMkJDEpIHRocm93IG5ldyBleGNlcHRpb25zLkludmFsaWRBcmd1bWVudChcImJ1bGtQdXQoKSB3aXRoIG5vbi1pbmJvdW5kIGtleXMgcmVxdWlyZXMga2V5cyBhcnJheSBpbiBzZWNvbmQgYXJndW1lbnRcIik7XG4gICAgICAgICAgICAgICAgaWYgKGlkYnN0b3JlLmtleVBhdGggJiYga2V5cyQkMSkgdGhyb3cgbmV3IGV4Y2VwdGlvbnMuSW52YWxpZEFyZ3VtZW50KFwiYnVsa1B1dCgpOiBrZXlzIGFyZ3VtZW50IGludmFsaWQgb24gdGFibGVzIHdpdGggaW5ib3VuZCBrZXlzXCIpO1xuICAgICAgICAgICAgICAgIGlmIChrZXlzJCQxICYmIGtleXMkJDEubGVuZ3RoICE9PSBvYmplY3RzLmxlbmd0aCkgdGhyb3cgbmV3IGV4Y2VwdGlvbnMuSW52YWxpZEFyZ3VtZW50KFwiQXJndW1lbnRzIG9iamVjdHMgYW5kIGtleXMgbXVzdCBoYXZlIHRoZSBzYW1lIGxlbmd0aFwiKTtcbiAgICAgICAgICAgICAgICBpZiAob2JqZWN0cy5sZW5ndGggPT09IDApIHJldHVybiByZXNvbHZlKCk7IC8vIENhbGxlciBwcm92aWRlZCBlbXB0eSBsaXN0LlxuICAgICAgICAgICAgICAgIHZhciBkb25lID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3JMaXN0Lmxlbmd0aCA9PT0gMCkgcmVzb2x2ZShyZXN1bHQpO2Vsc2UgcmVqZWN0KG5ldyBCdWxrRXJyb3IoX3RoaXMubmFtZSArICcuYnVsa1B1dCgpOiAnICsgZXJyb3JMaXN0Lmxlbmd0aCArICcgb2YgJyArIG51bU9ianMgKyAnIG9wZXJhdGlvbnMgZmFpbGVkJywgZXJyb3JMaXN0KSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgcmVxLFxuICAgICAgICAgICAgICAgICAgICBlcnJvckxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JIYW5kbGVyLFxuICAgICAgICAgICAgICAgICAgICBudW1PYmpzID0gb2JqZWN0cy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlID0gX3RoaXM7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmhvb2suY3JlYXRpbmcuZmlyZSA9PT0gbm9wICYmIF90aGlzLmhvb2sudXBkYXRpbmcuZmlyZSA9PT0gbm9wKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vIFN0YW5kYXJkIEJ1bGsgKG5vICdjcmVhdGluZycgb3IgJ3VwZGF0aW5nJyBob29rcyB0byBjYXJlIGFib3V0KVxuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICBlcnJvckhhbmRsZXIgPSBCdWxrRXJyb3JIYW5kbGVyQ2F0Y2hBbGwoZXJyb3JMaXN0KTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmplY3RzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxID0ga2V5cyQkMSA/IGlkYnN0b3JlLnB1dChvYmplY3RzW2ldLCBrZXlzJCQxW2ldKSA6IGlkYnN0b3JlLnB1dChvYmplY3RzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZXJyb3JIYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgbmVlZCB0byBjYXRjaCBzdWNjZXNzIG9yIGVycm9yIG9uIHRoZSBsYXN0IG9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyBhY2NvcmRpbmcgdG8gdGhlIElEQiBzcGVjLlxuICAgICAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IEJ1bGtFcnJvckhhbmRsZXJDYXRjaEFsbChlcnJvckxpc3QsIGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gZXZlbnRTdWNjZXNzSGFuZGxlcihkb25lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWZmZWN0aXZlS2V5cyA9IGtleXMkJDEgfHwgaWRic3RvcmUua2V5UGF0aCAmJiBvYmplY3RzLm1hcChmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldEJ5S2V5UGF0aChvLCBpZGJzdG9yZS5rZXlQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIG1hcCBvZiB7W2tleV06IG9iamVjdH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iamVjdExvb2t1cCA9IGVmZmVjdGl2ZUtleXMgJiYgYXJyYXlUb09iamVjdChlZmZlY3RpdmVLZXlzLCBmdW5jdGlvbiAoa2V5LCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5ICE9IG51bGwgJiYgW2tleSwgb2JqZWN0c1tpXV07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZSA9ICFlZmZlY3RpdmVLZXlzID9cblxuICAgICAgICAgICAgICAgICAgICAvLyBBdXRvLWluY3JlbWVudGVkIGtleS1sZXNzIG9iamVjdHMgb25seSB3aXRob3V0IGFueSBrZXlzIGFyZ3VtZW50LlxuICAgICAgICAgICAgICAgICAgICB0YWJsZS5idWxrQWRkKG9iamVjdHMpIDpcblxuICAgICAgICAgICAgICAgICAgICAvLyBLZXlzIHByb3ZpZGVkLiBFaXRoZXIgYXMgaW5ib3VuZCBpbiBwcm92aWRlZCBvYmplY3RzLCBvciBhcyBhIGtleXMgYXJndW1lbnQuXG4gICAgICAgICAgICAgICAgICAgIC8vIEJlZ2luIHdpdGggdXBkYXRpbmcgdGhvc2UgdGhhdCBleGlzdHMgaW4gREI6XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlLndoZXJlKCc6aWQnKS5hbnlPZihlZmZlY3RpdmVLZXlzLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5ICE9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0pKS5tb2RpZnkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG9iamVjdExvb2t1cFt0aGlzLnByaW1LZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0TG9va3VwW3RoaXMucHJpbUtleV0gPSBudWxsOyAvLyBNYXJrIGFzIFwiZG9uJ3QgYWRkIHRoaXNcIlxuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChNb2RpZnlFcnJvciwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTGlzdCA9IGUuZmFpbHVyZXM7IC8vIE5vIG5lZWQgdG8gY29uY2F0IGhlcmUuIFRoZXNlIGFyZSB0aGUgZmlyc3QgZXJyb3JzIGFkZGVkLlxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdywgbGV0J3MgZXhhbWluZSB3aGljaCBpdGVtcyBkaWRudCBleGlzdCBzbyB3ZSBjYW4gYWRkIHRoZW06XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2Jqc1RvQWRkID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5c1RvQWRkID0ga2V5cyQkMSAmJiBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEl0ZXJhdGUgYmFja3dhcmRzLiBXaHk/IEJlY2F1c2UgaWYgc2FtZSBrZXkgd2FzIHVzZWQgdHdpY2UsIGp1c3QgYWRkIHRoZSBsYXN0IG9uZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBlZmZlY3RpdmVLZXlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGVmZmVjdGl2ZUtleXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PSBudWxsIHx8IG9iamVjdExvb2t1cFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ianNUb0FkZC5wdXNoKG9iamVjdHNbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXlzJCQxICYmIGtleXNUb0FkZC5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrZXkgIT0gbnVsbCkgb2JqZWN0TG9va3VwW2tleV0gPSBudWxsOyAvLyBNYXJrIGFzIFwiZG9udCBhZGQgYWdhaW5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBpdGVtcyBhcmUgaW4gcmV2ZXJzZSBvcmRlciBzbyByZXZlcnNlIHRoZW0gYmVmb3JlIGFkZGluZy5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvdWxkIGJlIGltcG9ydGFudCBpbiBvcmRlciB0byBnZXQgYXV0by1pbmNyZW1lbnRlZCBrZXlzIHRoZSB3YXkgdGhlIGNhbGxlclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd291bGQgZXhwZWN0LiBDb3VsZCBoYXZlIHVzZWQgdW5zaGlmdCBpbnN0ZWFkIG9mIHB1c2goKS9yZXZlcnNlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBidXQ6IGh0dHA6Ly9qc3BlcmYuY29tL3Vuc2hpZnQtdnMtcmV2ZXJzZVxuICAgICAgICAgICAgICAgICAgICAgICAgb2Jqc1RvQWRkLnJldmVyc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleXMkJDEgJiYga2V5c1RvQWRkLnJldmVyc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJsZS5idWxrQWRkKG9ianNUb0FkZCwga2V5c1RvQWRkKTtcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobGFzdEFkZGVkS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXNvbHZlIHdpdGgga2V5IG9mIHRoZSBsYXN0IG9iamVjdCBpbiBnaXZlbiBhcmd1bWVudHMgdG8gYnVsa1B1dCgpOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RFZmZlY3RpdmVLZXkgPSBlZmZlY3RpdmVLZXlzW2VmZmVjdGl2ZUtleXMubGVuZ3RoIC0gMV07IC8vIEtleSB3YXMgcHJvdmlkZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFzdEVmZmVjdGl2ZUtleSAhPSBudWxsID8gbGFzdEVmZmVjdGl2ZUtleSA6IGxhc3RBZGRlZEtleTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZS50aGVuKGRvbmUpLmNhdGNoKEJ1bGtFcnJvciwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbmNhdCBmYWlsdXJlIGZyb20gTW9kaWZ5RXJyb3IgYW5kIHJlamVjdCB1c2luZyBvdXIgJ2RvbmUnIG1ldGhvZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTGlzdCA9IGVycm9yTGlzdC5jb25jYXQoZS5mYWlsdXJlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKHJlamVjdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgXCJsb2NrZWRcIik7IC8vIElmIGNhbGxlZCBmcm9tIHRyYW5zYWN0aW9uIHNjb3BlLCBsb2NrIHRyYW5zYWN0aW9uIHRpbCBhbGwgc3RlcHMgYXJlIGRvbmUuXG4gICAgICAgIH0sXG4gICAgICAgIGJ1bGtBZGQ6IGZ1bmN0aW9uIChvYmplY3RzLCBrZXlzJCQxKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY3JlYXRpbmdIb29rID0gdGhpcy5ob29rLmNyZWF0aW5nLmZpcmU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faWRic3RvcmUoUkVBRFdSSVRFLCBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBpZGJzdG9yZSwgdHJhbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlkYnN0b3JlLmtleVBhdGggJiYgIXNlbGYuc2NoZW1hLnByaW1LZXkuYXV0byAmJiAha2V5cyQkMSkgdGhyb3cgbmV3IGV4Y2VwdGlvbnMuSW52YWxpZEFyZ3VtZW50KFwiYnVsa0FkZCgpIHdpdGggbm9uLWluYm91bmQga2V5cyByZXF1aXJlcyBrZXlzIGFycmF5IGluIHNlY29uZCBhcmd1bWVudFwiKTtcbiAgICAgICAgICAgICAgICBpZiAoaWRic3RvcmUua2V5UGF0aCAmJiBrZXlzJCQxKSB0aHJvdyBuZXcgZXhjZXB0aW9ucy5JbnZhbGlkQXJndW1lbnQoXCJidWxrQWRkKCk6IGtleXMgYXJndW1lbnQgaW52YWxpZCBvbiB0YWJsZXMgd2l0aCBpbmJvdW5kIGtleXNcIik7XG4gICAgICAgICAgICAgICAgaWYgKGtleXMkJDEgJiYga2V5cyQkMS5sZW5ndGggIT09IG9iamVjdHMubGVuZ3RoKSB0aHJvdyBuZXcgZXhjZXB0aW9ucy5JbnZhbGlkQXJndW1lbnQoXCJBcmd1bWVudHMgb2JqZWN0cyBhbmQga2V5cyBtdXN0IGhhdmUgdGhlIHNhbWUgbGVuZ3RoXCIpO1xuICAgICAgICAgICAgICAgIGlmIChvYmplY3RzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJlc29sdmUoKTsgLy8gQ2FsbGVyIHByb3ZpZGVkIGVtcHR5IGxpc3QuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZG9uZShyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yTGlzdC5sZW5ndGggPT09IDApIHJlc29sdmUocmVzdWx0KTtlbHNlIHJlamVjdChuZXcgQnVsa0Vycm9yKHNlbGYubmFtZSArICcuYnVsa0FkZCgpOiAnICsgZXJyb3JMaXN0Lmxlbmd0aCArICcgb2YgJyArIG51bU9ianMgKyAnIG9wZXJhdGlvbnMgZmFpbGVkJywgZXJyb3JMaXN0KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZXEsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTGlzdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBlcnJvckhhbmRsZXIsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NIYW5kbGVyLFxuICAgICAgICAgICAgICAgICAgICBudW1PYmpzID0gb2JqZWN0cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKGNyZWF0aW5nSG9vayAhPT0gbm9wKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZXJlIGFyZSBzdWJzY3JpYmVycyB0byBob29rKCdjcmVhdGluZycpXG4gICAgICAgICAgICAgICAgICAgIC8vIE11c3QgYmVoYXZlIGFzIGRvY3VtZW50ZWQuXG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXlQYXRoID0gaWRic3RvcmUua2V5UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvb2tDdHg7XG4gICAgICAgICAgICAgICAgICAgIGVycm9ySGFuZGxlciA9IEJ1bGtFcnJvckhhbmRsZXJDYXRjaEFsbChlcnJvckxpc3QsIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzSGFuZGxlciA9IGhvb2tlZEV2ZW50U3VjY2Vzc0hhbmRsZXIobnVsbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdHJ5Q2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmplY3RzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvb2tDdHggPSB7IG9uZXJyb3I6IG51bGwsIG9uc3VjY2VzczogbnVsbCB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBrZXlzJCQxICYmIGtleXMkJDFbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9iaiA9IG9iamVjdHNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVmZmVjdGl2ZUtleSA9IGtleXMkJDEgPyBrZXkgOiBrZXlQYXRoID8gZ2V0QnlLZXlQYXRoKG9iaiwga2V5UGF0aCkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleVRvVXNlID0gY3JlYXRpbmdIb29rLmNhbGwoaG9va0N0eCwgZWZmZWN0aXZlS2V5LCBvYmosIHRyYW5zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWZmZWN0aXZlS2V5ID09IG51bGwgJiYga2V5VG9Vc2UgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5UGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gZGVlcENsb25lKG9iaik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRCeUtleVBhdGgob2JqLCBrZXlQYXRoLCBrZXlUb1VzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXkgPSBrZXlUb1VzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXEgPSBrZXkgIT0gbnVsbCA/IGlkYnN0b3JlLmFkZChvYmosIGtleSkgOiBpZGJzdG9yZS5hZGQob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXEuX2hvb2tDdHggPSBob29rQ3R4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpIDwgbCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBlcnJvckhhbmRsZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChob29rQ3R4Lm9uc3VjY2VzcykgcmVxLm9uc3VjY2VzcyA9IHN1Y2Nlc3NIYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaG9va0N0eC5vbmVycm9yICYmIGhvb2tDdHgub25lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IEJ1bGtFcnJvckhhbmRsZXJDYXRjaEFsbChlcnJvckxpc3QsIGRvbmUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gaG9va2VkRXZlbnRTdWNjZXNzSGFuZGxlcihkb25lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyBTdGFuZGFyZCBCdWxrIChubyAnY3JlYXRpbmcnIGhvb2sgdG8gY2FyZSBhYm91dClcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgZXJyb3JIYW5kbGVyID0gQnVsa0Vycm9ySGFuZGxlckNhdGNoQWxsKGVycm9yTGlzdCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqZWN0cy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcSA9IGtleXMkJDEgPyBpZGJzdG9yZS5hZGQob2JqZWN0c1tpXSwga2V5cyQkMVtpXSkgOiBpZGJzdG9yZS5hZGQob2JqZWN0c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGVycm9ySGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IG5lZWQgdG8gY2F0Y2ggc3VjY2VzcyBvciBlcnJvciBvbiB0aGUgbGFzdCBvcGVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gYWNjb3JkaW5nIHRvIHRoZSBJREIgc3BlYy5cbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBCdWxrRXJyb3JIYW5kbGVyQ2F0Y2hBbGwoZXJyb3JMaXN0LCBkb25lKTtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGV2ZW50U3VjY2Vzc0hhbmRsZXIoZG9uZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZDogZnVuY3Rpb24gKG9iaiwga2V5KSB7XG4gICAgICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgICAgICAvLy8gICBBZGQgYW4gb2JqZWN0IHRvIHRoZSBkYXRhYmFzZS4gSW4gY2FzZSBhbiBvYmplY3Qgd2l0aCBzYW1lIHByaW1hcnkga2V5IGFscmVhZHkgZXhpc3RzLCB0aGUgb2JqZWN0IHdpbGwgbm90IGJlIGFkZGVkLlxuICAgICAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cIm9ialwiIHR5cGU9XCJPYmplY3RcIj5BIGphdmFzY3JpcHQgb2JqZWN0IHRvIGluc2VydDwvcGFyYW0+XG4gICAgICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJrZXlcIiBvcHRpb25hbD1cInRydWVcIj5QcmltYXJ5IGtleTwvcGFyYW0+XG4gICAgICAgICAgICB2YXIgY3JlYXRpbmdIb29rID0gdGhpcy5ob29rLmNyZWF0aW5nLmZpcmU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faWRic3RvcmUoUkVBRFdSSVRFLCBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBpZGJzdG9yZSwgdHJhbnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgaG9va0N0eCA9IHsgb25zdWNjZXNzOiBudWxsLCBvbmVycm9yOiBudWxsIH07XG4gICAgICAgICAgICAgICAgaWYgKGNyZWF0aW5nSG9vayAhPT0gbm9wKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlZmZlY3RpdmVLZXkgPSBrZXkgIT0gbnVsbCA/IGtleSA6IGlkYnN0b3JlLmtleVBhdGggPyBnZXRCeUtleVBhdGgob2JqLCBpZGJzdG9yZS5rZXlQYXRoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleVRvVXNlID0gY3JlYXRpbmdIb29rLmNhbGwoaG9va0N0eCwgZWZmZWN0aXZlS2V5LCBvYmosIHRyYW5zKTsgLy8gQWxsb3cgc3Vic2NyaWJlcnMgdG8gd2hlbihcImNyZWF0aW5nXCIpIHRvIGdlbmVyYXRlIHRoZSBrZXkuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlZmZlY3RpdmVLZXkgPT0gbnVsbCAmJiBrZXlUb1VzZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBVc2luZyBcIj09XCIgYW5kIFwiIT1cIiB0byBjaGVjayBmb3IgZWl0aGVyIG51bGwgb3IgdW5kZWZpbmVkIVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlkYnN0b3JlLmtleVBhdGgpIHNldEJ5S2V5UGF0aChvYmosIGlkYnN0b3JlLmtleVBhdGgsIGtleVRvVXNlKTtlbHNlIGtleSA9IGtleVRvVXNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBrZXkgIT0gbnVsbCA/IGlkYnN0b3JlLmFkZChvYmosIGtleSkgOiBpZGJzdG9yZS5hZGQob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgcmVxLl9ob29rQ3R4ID0gaG9va0N0eDtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBob29rZWRFdmVudFJlamVjdEhhbmRsZXIocmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGhvb2tlZEV2ZW50U3VjY2Vzc0hhbmRsZXIoZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIHRoZXNlIHR3byBsaW5lcyBpbiBuZXh0IG1ham9yIHJlbGVhc2UgKDIuMD8pXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJdCdzIG5vIGdvb2QgcHJhY3RpY2UgdG8gaGF2ZSBzaWRlIGVmZmVjdHMgb24gcHJvdmlkZWQgcGFyYW1ldGVyc1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleVBhdGggPSBpZGJzdG9yZS5rZXlQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleVBhdGgpIHNldEJ5S2V5UGF0aChvYmosIGtleVBhdGgsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvb2tDdHgub25lcnJvcikgaG9va0N0eC5vbmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHB1dDogZnVuY3Rpb24gKG9iaiwga2V5KSB7XG4gICAgICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgICAgICAvLy8gICBBZGQgYW4gb2JqZWN0IHRvIHRoZSBkYXRhYmFzZSBidXQgaW4gY2FzZSBhbiBvYmplY3Qgd2l0aCBzYW1lIHByaW1hcnkga2V5IGFscmVhZCBleGlzdHMsIHRoZSBleGlzdGluZyBvbmUgd2lsbCBnZXQgdXBkYXRlZC5cbiAgICAgICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJvYmpcIiB0eXBlPVwiT2JqZWN0XCI+QSBqYXZhc2NyaXB0IG9iamVjdCB0byBpbnNlcnQgb3IgdXBkYXRlPC9wYXJhbT5cbiAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImtleVwiIG9wdGlvbmFsPVwidHJ1ZVwiPlByaW1hcnkga2V5PC9wYXJhbT5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjcmVhdGluZ0hvb2sgPSB0aGlzLmhvb2suY3JlYXRpbmcuZmlyZSxcbiAgICAgICAgICAgICAgICB1cGRhdGluZ0hvb2sgPSB0aGlzLmhvb2sudXBkYXRpbmcuZmlyZTtcbiAgICAgICAgICAgIGlmIChjcmVhdGluZ0hvb2sgIT09IG5vcCB8fCB1cGRhdGluZ0hvb2sgIT09IG5vcCkge1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gUGVvcGxlIGxpc3RlbnMgdG8gd2hlbihcImNyZWF0aW5nXCIpIG9yIHdoZW4oXCJ1cGRhdGluZ1wiKSBldmVudHMhXG4gICAgICAgICAgICAgICAgLy8gV2UgbXVzdCBrbm93IHdoZXRoZXIgdGhlIHB1dCBvcGVyYXRpb24gcmVzdWx0cyBpbiBhbiBDUkVBVEUgb3IgVVBEQVRFLlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zKFJFQURXUklURSwgZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCwgdHJhbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2Uga2V5IGlzIG9wdGlvbmFsLCBtYWtlIHN1cmUgd2UgZ2V0IGl0IGZyb20gb2JqIGlmIG5vdCBwcm92aWRlZFxuICAgICAgICAgICAgICAgICAgICB2YXIgZWZmZWN0aXZlS2V5ID0ga2V5ICE9PSB1bmRlZmluZWQgPyBrZXkgOiBzZWxmLnNjaGVtYS5wcmltS2V5LmtleVBhdGggJiYgZ2V0QnlLZXlQYXRoKG9iaiwgc2VsZi5zY2hlbWEucHJpbUtleS5rZXlQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVmZmVjdGl2ZUtleSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBcIj09IG51bGxcIiBtZWFucyBjaGVja2luZyBmb3IgZWl0aGVyIG51bGwgb3IgdW5kZWZpbmVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm8gcHJpbWFyeSBrZXkuIE11c3QgdXNlIGFkZCgpLlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGQob2JqKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmltYXJ5IGtleSBleGlzdC4gTG9jayB0cmFuc2FjdGlvbiBhbmQgdHJ5IG1vZGlmeWluZyBleGlzdGluZy4gSWYgbm90aGluZyBtb2RpZmllZCwgY2FsbCBhZGQoKS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zLl9sb2NrKCk7IC8vIE5lZWRlZCBiZWNhdXNlIG9wZXJhdGlvbiBpcyBzcGxpdHRlZCBpbnRvIG1vZGlmeSgpIGFuZCBhZGQoKS5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNsb25lIG9iaiBiZWZvcmUgdGhpcyBhc3luYyBjYWxsLiBJZiBjYWxsZXIgbW9kaWZpZXMgb2JqIHRoZSBsaW5lIGFmdGVyIHB1dCgpLCB0aGUgSURCIHNwZWMgcmVxdWlyZXMgdGhhdCBpdCBzaG91bGQgbm90IGFmZmVjdCBvcGVyYXRpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmogPSBkZWVwQ2xvbmUob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYud2hlcmUoXCI6aWRcIikuZXF1YWxzKGVmZmVjdGl2ZUtleSkubW9kaWZ5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIGV4dGlzdGluZyB2YWx1ZSB3aXRoIG91ciBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDUlVEIGV2ZW50IGZpcmluZyBoYW5kbGVkIGluIFdyaXRlYWJsZUNvbGxlY3Rpb24ubW9kaWZ5KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gb2JqO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoY291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT2JqZWN0J3Mga2V5IHdhcyBub3QgZm91bmQuIEFkZCB0aGUgb2JqZWN0IGluc3RlYWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENSVUQgZXZlbnQgZmlyaW5nIHdpbGwgYmUgZG9uZSBpbiBhZGQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5hZGQob2JqLCBrZXkpOyAvLyBSZXNvbHZpbmcgd2l0aCBhbm90aGVyIFByb21pc2UuIFJldHVybmVkIFByb21pc2Ugd2lsbCB0aGVuIHJlc29sdmUgd2l0aCB0aGUgbmV3IGtleS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWZmZWN0aXZlS2V5OyAvLyBSZXNvbHZlIHdpdGggdGhlIHByb3ZpZGVkIGtleS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFucy5fdW5sb2NrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVXNlIHRoZSBzdGFuZGFyZCBJREIgcHV0KCkgbWV0aG9kLlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9pZGJzdG9yZShSRUFEV1JJVEUsIGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QsIGlkYnN0b3JlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBrZXkgIT09IHVuZGVmaW5lZCA/IGlkYnN0b3JlLnB1dChvYmosIGtleSkgOiBpZGJzdG9yZS5wdXQob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBldmVudFJlamVjdEhhbmRsZXIocmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleVBhdGggPSBpZGJzdG9yZS5rZXlQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleVBhdGgpIHNldEJ5S2V5UGF0aChvYmosIGtleVBhdGgsIGV2LnRhcmdldC5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAnZGVsZXRlJzogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwia2V5XCI+UHJpbWFyeSBrZXkgb2YgdGhlIG9iamVjdCB0byBkZWxldGU8L3BhcmFtPlxuICAgICAgICAgICAgaWYgKHRoaXMuaG9vay5kZWxldGluZy5zdWJzY3JpYmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyBQZW9wbGUgbGlzdGVucyB0byB3aGVuKFwiZGVsZXRpbmdcIikgZXZlbnQuIE11c3QgaW1wbGVtZW50IGRlbGV0ZSB1c2luZyBXcml0ZWFibGVDb2xsZWN0aW9uLmRlbGV0ZSgpIHRoYXQgd2lsbFxuICAgICAgICAgICAgICAgIC8vIGNhbGwgdGhlIENSVUQgZXZlbnQuIE9ubHkgV3JpdGVhYmxlQ29sbGVjdGlvbi5kZWxldGUoKSB3aWxsIGtub3cgd2hldGhlciBhbiBvYmplY3Qgd2FzIGFjdHVhbGx5IGRlbGV0ZWQuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2hlcmUoXCI6aWRcIikuZXF1YWxzKGtleSkuZGVsZXRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIE5vIG9uZSBsaXN0ZW5zLiBVc2Ugc3RhbmRhcmQgSURCIGRlbGV0ZSgpIG1ldGhvZC5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faWRic3RvcmUoUkVBRFdSSVRFLCBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBpZGJzdG9yZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gaWRic3RvcmUuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZXZlbnRSZWplY3RIYW5kbGVyKHJlamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlcS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ob29rLmRlbGV0aW5nLnN1YnNjcmliZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIC8vIFBlb3BsZSBsaXN0ZW5zIHRvIHdoZW4oXCJkZWxldGluZ1wiKSBldmVudC4gTXVzdCBpbXBsZW1lbnQgZGVsZXRlIHVzaW5nIFdyaXRlYWJsZUNvbGxlY3Rpb24uZGVsZXRlKCkgdGhhdCB3aWxsXG4gICAgICAgICAgICAgICAgLy8gY2FsbCB0aGUgQ1JVRCBldmVudC4gT25seSBXcml0ZWFibGVDb2xsZWN0aW9uLmRlbGV0ZSgpIHdpbGwga25vd3Mgd2hpY2ggb2JqZWN0cyB0aGF0IGFyZSBhY3R1YWxseSBkZWxldGVkLlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvQ29sbGVjdGlvbigpLmRlbGV0ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faWRic3RvcmUoUkVBRFdSSVRFLCBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBpZGJzdG9yZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gaWRic3RvcmUuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBldmVudFJlamVjdEhhbmRsZXIocmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAoa2V5T3JPYmplY3QsIG1vZGlmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbW9kaWZpY2F0aW9ucyAhPT0gJ29iamVjdCcgfHwgaXNBcnJheShtb2RpZmljYXRpb25zKSkgdGhyb3cgbmV3IGV4Y2VwdGlvbnMuSW52YWxpZEFyZ3VtZW50KFwiTW9kaWZpY2F0aW9ucyBtdXN0IGJlIGFuIG9iamVjdC5cIik7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGtleU9yT2JqZWN0ID09PSAnb2JqZWN0JyAmJiAhaXNBcnJheShrZXlPck9iamVjdCkpIHtcbiAgICAgICAgICAgICAgICAvLyBvYmplY3QgdG8gbW9kaWZ5LiBBbHNvIG1vZGlmeSBnaXZlbiBvYmplY3Qgd2l0aCB0aGUgbW9kaWZpY2F0aW9uczpcbiAgICAgICAgICAgICAgICBrZXlzKG1vZGlmaWNhdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKGtleVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0QnlLZXlQYXRoKGtleU9yT2JqZWN0LCBrZXlQYXRoLCBtb2RpZmljYXRpb25zW2tleVBhdGhdKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gZ2V0QnlLZXlQYXRoKGtleU9yT2JqZWN0LCB0aGlzLnNjaGVtYS5wcmltS2V5LmtleVBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHJlamVjdGlvbihuZXcgZXhjZXB0aW9ucy5JbnZhbGlkQXJndW1lbnQoXCJHaXZlbiBvYmplY3QgZG9lcyBub3QgY29udGFpbiBpdHMgcHJpbWFyeSBrZXlcIiksIGRiVW5jYXVnaHQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLndoZXJlKFwiOmlkXCIpLmVxdWFscyhrZXkpLm1vZGlmeShtb2RpZmljYXRpb25zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8ga2V5IHRvIG1vZGlmeVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLndoZXJlKFwiOmlkXCIpLmVxdWFscyhrZXlPck9iamVjdCkubW9kaWZ5KG1vZGlmaWNhdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyBUcmFuc2FjdGlvbiBDbGFzc1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIGZ1bmN0aW9uIFRyYW5zYWN0aW9uKG1vZGUsIHN0b3JlTmFtZXMsIGRic2NoZW1hLCBwYXJlbnQpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gICAgVHJhbnNhY3Rpb24gY2xhc3MuIFJlcHJlc2VudHMgYSBkYXRhYmFzZSB0cmFuc2FjdGlvbi4gQWxsIG9wZXJhdGlvbnMgb24gZGIgZ29lcyB0aHJvdWdoIGEgVHJhbnNhY3Rpb24uXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cIm1vZGVcIiB0eXBlPVwiU3RyaW5nXCI+QW55IG9mIFwicmVhZHdyaXRlXCIgb3IgXCJyZWFkb25seVwiPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic3RvcmVOYW1lc1wiIHR5cGU9XCJBcnJheVwiPkFycmF5IG9mIHRhYmxlIG5hbWVzIHRvIG9wZXJhdGUgb248L3BhcmFtPlxuICAgICAgICB0aGlzLmRiID0gZGI7XG4gICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIHRoaXMuc3RvcmVOYW1lcyA9IHN0b3JlTmFtZXM7XG4gICAgICAgIHRoaXMuaWRidHJhbnMgPSBudWxsO1xuICAgICAgICB0aGlzLm9uID0gRXZlbnRzKHRoaXMsIFwiY29tcGxldGVcIiwgXCJlcnJvclwiLCBcImFib3J0XCIpO1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudCB8fCBudWxsO1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX3RhYmxlcyA9IG51bGw7XG4gICAgICAgIHRoaXMuX3JlY3Vsb2NrID0gMDtcbiAgICAgICAgdGhpcy5fYmxvY2tlZEZ1bmNzID0gW107XG4gICAgICAgIHRoaXMuX3BzZCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2Ric2NoZW1hID0gZGJzY2hlbWE7XG4gICAgICAgIHRoaXMuX3Jlc29sdmUgPSBudWxsO1xuICAgICAgICB0aGlzLl9yZWplY3QgPSBudWxsO1xuICAgICAgICB0aGlzLl9jb21wbGV0aW9uID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgX3RoaXMyLl9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIF90aGlzMi5fcmVqZWN0ID0gcmVqZWN0O1xuICAgICAgICB9KS51bmNhdWdodChkYlVuY2F1Z2h0KTtcblxuICAgICAgICB0aGlzLl9jb21wbGV0aW9uLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMyLm9uLmNvbXBsZXRlLmZpcmUoKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIF90aGlzMi5vbi5lcnJvci5maXJlKGUpO1xuICAgICAgICAgICAgX3RoaXMyLnBhcmVudCA/IF90aGlzMi5wYXJlbnQuX3JlamVjdChlKSA6IF90aGlzMi5hY3RpdmUgJiYgX3RoaXMyLmlkYnRyYW5zICYmIF90aGlzMi5pZGJ0cmFucy5hYm9ydCgpO1xuICAgICAgICAgICAgX3RoaXMyLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdGlvbihlKTsgLy8gSW5kaWNhdGUgd2UgYWN0dWFsbHkgRE8gTk9UIGNhdGNoIHRoaXMgZXJyb3IuXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb3BzKFRyYW5zYWN0aW9uLnByb3RvdHlwZSwge1xuICAgICAgICAvL1xuICAgICAgICAvLyBUcmFuc2FjdGlvbiBQcm90ZWN0ZWQgTWV0aG9kcyAobm90IHJlcXVpcmVkIGJ5IEFQSSB1c2VycywgYnV0IG5lZWRlZCBpbnRlcm5hbGx5IGFuZCBldmVudHVhbGx5IGJ5IGRleGllIGV4dGVuc2lvbnMpXG4gICAgICAgIC8vXG4gICAgICAgIF9sb2NrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhc3NlcnQoIVBTRC5nbG9iYWwpOyAvLyBMb2NraW5nIGFuZCB1bmxvY2tpbmcgcmV1aXJlcyB0byBiZSB3aXRoaW4gYSBQU0Qgc2NvcGUuXG4gICAgICAgICAgICAvLyBUZW1wb3Jhcnkgc2V0IGFsbCByZXF1ZXN0cyBpbnRvIGEgcGVuZGluZyBxdWV1ZSBpZiB0aGV5IGFyZSBjYWxsZWQgYmVmb3JlIGRhdGFiYXNlIGlzIHJlYWR5LlxuICAgICAgICAgICAgKyt0aGlzLl9yZWN1bG9jazsgLy8gUmVjdXJzaXZlIHJlYWQvd3JpdGUgbG9jayBwYXR0ZXJuIHVzaW5nIFBTRCAoUHJvbWlzZSBTcGVjaWZpYyBEYXRhKSBpbnN0ZWFkIG9mIFRMUyAoVGhyZWFkIExvY2FsIFN0b3JhZ2UpXG4gICAgICAgICAgICBpZiAodGhpcy5fcmVjdWxvY2sgPT09IDEgJiYgIVBTRC5nbG9iYWwpIFBTRC5sb2NrT3duZXJGb3IgPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIF91bmxvY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFzc2VydCghUFNELmdsb2JhbCk7IC8vIExvY2tpbmcgYW5kIHVubG9ja2luZyByZXVpcmVzIHRvIGJlIHdpdGhpbiBhIFBTRCBzY29wZS5cbiAgICAgICAgICAgIGlmICgtLXRoaXMuX3JlY3Vsb2NrID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFQU0QuZ2xvYmFsKSBQU0QubG9ja093bmVyRm9yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB3aGlsZSAodGhpcy5fYmxvY2tlZEZ1bmNzLmxlbmd0aCA+IDAgJiYgIXRoaXMuX2xvY2tlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbkFuZFBTRCA9IHRoaXMuX2Jsb2NrZWRGdW5jcy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlUFNEKGZuQW5kUFNEWzFdLCBmbkFuZFBTRFswXSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIF9sb2NrZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIENoZWNrcyBpZiBhbnkgd3JpdGUtbG9jayBpcyBhcHBsaWVkIG9uIHRoaXMgdHJhbnNhY3Rpb24uXG4gICAgICAgICAgICAvLyBUbyBzaW1wbGlmeSB0aGUgRGV4aWUgQVBJIGZvciBleHRlbnNpb24gaW1wbGVtZW50YXRpb25zLCB3ZSBzdXBwb3J0IHJlY3Vyc2l2ZSBsb2Nrcy5cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYWNjb21wbGlzaGVkIGJ5IHVzaW5nIFwiUHJvbWlzZSBTcGVjaWZpYyBEYXRhXCIgKFBTRCkuXG4gICAgICAgICAgICAvLyBQU0QgZGF0YSBpcyBib3VuZCB0byBhIFByb21pc2UgYW5kIGFueSBjaGlsZCBQcm9taXNlIGVtaXR0ZWQgdGhyb3VnaCB0aGVuKCkgb3IgcmVzb2x2ZSggbmV3IFByb21pc2UoKSApLlxuICAgICAgICAgICAgLy8gUFNEIGlzIGxvY2FsIHRvIGNvZGUgZXhlY3V0aW5nIG9uIHRvcCBvZiB0aGUgY2FsbCBzdGFja3Mgb2YgYW55IG9mIGFueSBjb2RlIGV4ZWN1dGVkIGJ5IFByb21pc2UoKTpcbiAgICAgICAgICAgIC8vICAgICAgICAgKiBjYWxsYmFjayBnaXZlbiB0byB0aGUgUHJvbWlzZSgpIGNvbnN0cnVjdG9yICAoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCl7Li4ufSlcbiAgICAgICAgICAgIC8vICAgICAgICAgKiBjYWxsYmFja3MgZ2l2ZW4gdG8gdGhlbigpL2NhdGNoKCkvZmluYWxseSgpIG1ldGhvZHMgKGZ1bmN0aW9uICh2YWx1ZSl7Li4ufSlcbiAgICAgICAgICAgIC8vIElmIGNyZWF0aW5nIGEgbmV3IGluZGVwZW5kYW50IFByb21pc2UgaW5zdGFuY2UgZnJvbSB3aXRoaW4gYSBQcm9taXNlIGNhbGwgc3RhY2ssIHRoZSBuZXcgUHJvbWlzZSB3aWxsIGRlcml2ZSB0aGUgUFNEIGZyb20gdGhlIGNhbGwgc3RhY2sgb2YgdGhlIHBhcmVudCBQcm9taXNlLlxuICAgICAgICAgICAgLy8gRGVyaXZhdGlvbiBpcyBkb25lIHNvIHRoYXQgdGhlIGlubmVyIFBTRCBfX3Byb3RvX18gcG9pbnRzIHRvIHRoZSBvdXRlciBQU0QuXG4gICAgICAgICAgICAvLyBQU0QubG9ja093bmVyRm9yIHdpbGwgcG9pbnQgdG8gY3VycmVudCB0cmFuc2FjdGlvbiBvYmplY3QgaWYgdGhlIGN1cnJlbnRseSBleGVjdXRpbmcgUFNEIHNjb3BlIG93bnMgdGhlIGxvY2suXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVjdWxvY2sgJiYgUFNELmxvY2tPd25lckZvciAhPT0gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlOiBmdW5jdGlvbiAoaWRidHJhbnMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICBhc3NlcnQoIXRoaXMuaWRidHJhbnMpO1xuICAgICAgICAgICAgaWYgKCFpZGJ0cmFucyAmJiAhaWRiZGIpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGRiT3BlbkVycm9yICYmIGRiT3BlbkVycm9yLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkRhdGFiYXNlQ2xvc2VkRXJyb3JcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVycm9ycyB3aGVyZSBpdCBpcyBubyBkaWZmZXJlbmNlIHdoZXRoZXIgaXQgd2FzIGNhdXNlZCBieSB0aGUgdXNlciBvcGVyYXRpb24gb3IgYW4gZWFybGllciBjYWxsIHRvIGRiLm9wZW4oKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGV4Y2VwdGlvbnMuRGF0YWJhc2VDbG9zZWQoZGJPcGVuRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTWlzc2luZ0FQSUVycm9yXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFcnJvcnMgd2hlcmUgaXQgaXMgbm8gZGlmZmVyZW5jZSB3aGV0aGVyIGl0IHdhcyBjYXVzZWQgYnkgdGhlIHVzZXIgb3BlcmF0aW9uIG9yIGFuIGVhcmxpZXIgY2FsbCB0byBkYi5vcGVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBleGNlcHRpb25zLk1pc3NpbmdBUEkoZGJPcGVuRXJyb3IubWVzc2FnZSwgZGJPcGVuRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBpdCBjbGVhciB0aGF0IHRoZSB1c2VyIG9wZXJhdGlvbiB3YXMgbm90IHdoYXQgY2F1c2VkIHRoZSBlcnJvciAtIHRoZSBlcnJvciBoYWQgb2NjdXJyZWQgZWFybGllciBvbiBkYi5vcGVuKCkhXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXhjZXB0aW9ucy5PcGVuRmFpbGVkKGRiT3BlbkVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aHJvdyBuZXcgZXhjZXB0aW9ucy5UcmFuc2FjdGlvbkluYWN0aXZlKCk7XG4gICAgICAgICAgICBhc3NlcnQodGhpcy5fY29tcGxldGlvbi5fc3RhdGUgPT09IG51bGwpO1xuXG4gICAgICAgICAgICBpZGJ0cmFucyA9IHRoaXMuaWRidHJhbnMgPSBpZGJ0cmFucyB8fCBpZGJkYi50cmFuc2FjdGlvbihzYWZhcmlNdWx0aVN0b3JlRml4KHRoaXMuc3RvcmVOYW1lcyksIHRoaXMubW9kZSk7XG4gICAgICAgICAgICBpZGJ0cmFucy5vbmVycm9yID0gd3JhcChmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdChldik7IC8vIFByb2hpYml0IGRlZmF1bHQgYnViYmxpbmcgdG8gd2luZG93LmVycm9yXG4gICAgICAgICAgICAgICAgX3RoaXMzLl9yZWplY3QoaWRidHJhbnMuZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZGJ0cmFucy5vbmFib3J0ID0gd3JhcChmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdChldik7XG4gICAgICAgICAgICAgICAgX3RoaXMzLmFjdGl2ZSAmJiBfdGhpczMuX3JlamVjdChuZXcgZXhjZXB0aW9ucy5BYm9ydCgpKTtcbiAgICAgICAgICAgICAgICBfdGhpczMuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgX3RoaXMzLm9uKFwiYWJvcnRcIikuZmlyZShldik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlkYnRyYW5zLm9uY29tcGxldGUgPSB3cmFwKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpczMuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgX3RoaXMzLl9yZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBfcHJvbWlzZTogZnVuY3Rpb24gKG1vZGUsIGZuLCBiV3JpdGVMb2NrKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgcCA9IHNlbGYuX2xvY2tlZCgpID9cbiAgICAgICAgICAgIC8vIFJlYWQgbG9jayBhbHdheXMuIFRyYW5zYWN0aW9uIGlzIHdyaXRlLWxvY2tlZC4gV2FpdCBmb3IgbXV0ZXguXG4gICAgICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fYmxvY2tlZEZ1bmNzLnB1c2goW2Z1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcHJvbWlzZShtb2RlLCBmbiwgYldyaXRlTG9jaykudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgICAgIH0sIFBTRF0pO1xuICAgICAgICAgICAgfSkgOiBuZXdTY29wZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBfID0gc2VsZi5hY3RpdmUgPyBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2RlID09PSBSRUFEV1JJVEUgJiYgc2VsZi5tb2RlICE9PSBSRUFEV1JJVEUpIHRocm93IG5ldyBleGNlcHRpb25zLlJlYWRPbmx5KFwiVHJhbnNhY3Rpb24gaXMgcmVhZG9ubHlcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc2VsZi5pZGJ0cmFucyAmJiBtb2RlKSBzZWxmLmNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYldyaXRlTG9jaykgc2VsZi5fbG9jaygpOyAvLyBXcml0ZSBsb2NrIGlmIHdyaXRlIG9wZXJhdGlvbiBpcyByZXF1ZXN0ZWRcbiAgICAgICAgICAgICAgICAgICAgZm4ocmVzb2x2ZSwgcmVqZWN0LCBzZWxmKTtcbiAgICAgICAgICAgICAgICB9KSA6IHJlamVjdGlvbihuZXcgZXhjZXB0aW9ucy5UcmFuc2FjdGlvbkluYWN0aXZlKCkpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmFjdGl2ZSAmJiBiV3JpdGVMb2NrKSBwXy5maW5hbGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fdW5sb2NrKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBfO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHAuX2xpYiA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gcC51bmNhdWdodChkYlVuY2F1Z2h0KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvL1xuICAgICAgICAvLyBUcmFuc2FjdGlvbiBQdWJsaWMgUHJvcGVydGllcyBhbmQgTWV0aG9kc1xuICAgICAgICAvL1xuICAgICAgICBhYm9ydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmUgJiYgdGhpcy5fcmVqZWN0KG5ldyBleGNlcHRpb25zLkFib3J0KCkpO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICB0YWJsZXM6IHtcbiAgICAgICAgICAgIGdldDogZGVwcmVjYXRlZChcIlRyYW5zYWN0aW9uLnRhYmxlc1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5VG9PYmplY3QodGhpcy5zdG9yZU5hbWVzLCBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW25hbWUsIGFsbFRhYmxlc1tuYW1lXV07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCBcIlVzZSBkYi50YWJsZXMoKVwiKVxuICAgICAgICB9LFxuXG4gICAgICAgIGNvbXBsZXRlOiBkZXByZWNhdGVkKFwiVHJhbnNhY3Rpb24uY29tcGxldGUoKVwiLCBmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKFwiY29tcGxldGVcIiwgY2IpO1xuICAgICAgICB9KSxcblxuICAgICAgICBlcnJvcjogZGVwcmVjYXRlZChcIlRyYW5zYWN0aW9uLmVycm9yKClcIiwgZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbihcImVycm9yXCIsIGNiKTtcbiAgICAgICAgfSksXG5cbiAgICAgICAgdGFibGU6IGRlcHJlY2F0ZWQoXCJUcmFuc2FjdGlvbi50YWJsZSgpXCIsIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdG9yZU5hbWVzLmluZGV4T2YobmFtZSkgPT09IC0xKSB0aHJvdyBuZXcgZXhjZXB0aW9ucy5JbnZhbGlkVGFibGUoXCJUYWJsZSBcIiArIG5hbWUgKyBcIiBub3QgaW4gdHJhbnNhY3Rpb25cIik7XG4gICAgICAgICAgICByZXR1cm4gYWxsVGFibGVzW25hbWVdO1xuICAgICAgICB9KVxuXG4gICAgfSk7XG5cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyBXaGVyZUNsYXVzZVxuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIGZ1bmN0aW9uIFdoZXJlQ2xhdXNlKHRhYmxlLCBpbmRleCwgb3JDb2xsZWN0aW9uKSB7XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInRhYmxlXCIgdHlwZT1cIlRhYmxlXCI+PC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiaW5kZXhcIiB0eXBlPVwiU3RyaW5nXCIgb3B0aW9uYWw9XCJ0cnVlXCI+PC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwib3JDb2xsZWN0aW9uXCIgdHlwZT1cIkNvbGxlY3Rpb25cIiBvcHRpb25hbD1cInRydWVcIj48L3BhcmFtPlxuICAgICAgICB0aGlzLl9jdHggPSB7XG4gICAgICAgICAgICB0YWJsZTogdGFibGUsXG4gICAgICAgICAgICBpbmRleDogaW5kZXggPT09IFwiOmlkXCIgPyBudWxsIDogaW5kZXgsXG4gICAgICAgICAgICBjb2xsQ2xhc3M6IHRhYmxlLl9jb2xsQ2xhc3MsXG4gICAgICAgICAgICBvcjogb3JDb2xsZWN0aW9uXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJvcHMoV2hlcmVDbGF1c2UucHJvdG90eXBlLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gV2hlcmVDbGF1c2UgcHJpdmF0ZSBtZXRob2RzXG5cbiAgICAgICAgZnVuY3Rpb24gZmFpbChjb2xsZWN0aW9uT3JXaGVyZUNsYXVzZSwgZXJyLCBUKSB7XG4gICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGNvbGxlY3Rpb25PcldoZXJlQ2xhdXNlIGluc3RhbmNlb2YgV2hlcmVDbGF1c2UgPyBuZXcgY29sbGVjdGlvbk9yV2hlcmVDbGF1c2UuX2N0eC5jb2xsQ2xhc3MoY29sbGVjdGlvbk9yV2hlcmVDbGF1c2UpIDogY29sbGVjdGlvbk9yV2hlcmVDbGF1c2U7XG5cbiAgICAgICAgICAgIGNvbGxlY3Rpb24uX2N0eC5lcnJvciA9IFQgPyBuZXcgVChlcnIpIDogbmV3IFR5cGVFcnJvcihlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBlbXB0eUNvbGxlY3Rpb24od2hlcmVDbGF1c2UpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgd2hlcmVDbGF1c2UuX2N0eC5jb2xsQ2xhc3Mod2hlcmVDbGF1c2UsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSURCS2V5UmFuZ2Uub25seShcIlwiKTtcbiAgICAgICAgICAgIH0pLmxpbWl0KDApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdXBwZXJGYWN0b3J5KGRpcikge1xuICAgICAgICAgICAgcmV0dXJuIGRpciA9PT0gXCJuZXh0XCIgPyBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICB9IDogZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcy50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBsb3dlckZhY3RvcnkoZGlyKSB7XG4gICAgICAgICAgICByZXR1cm4gZGlyID09PSBcIm5leHRcIiA/IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHMudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIH0gOiBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG5leHRDYXNpbmcoa2V5LCBsb3dlcktleSwgdXBwZXJOZWVkbGUsIGxvd2VyTmVlZGxlLCBjbXAsIGRpcikge1xuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGtleS5sZW5ndGgsIGxvd2VyTmVlZGxlLmxlbmd0aCk7XG4gICAgICAgICAgICB2YXIgbGxwID0gLTE7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGx3cktleUNoYXIgPSBsb3dlcktleVtpXTtcbiAgICAgICAgICAgICAgICBpZiAobHdyS2V5Q2hhciAhPT0gbG93ZXJOZWVkbGVbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNtcChrZXlbaV0sIHVwcGVyTmVlZGxlW2ldKSA8IDApIHJldHVybiBrZXkuc3Vic3RyKDAsIGkpICsgdXBwZXJOZWVkbGVbaV0gKyB1cHBlck5lZWRsZS5zdWJzdHIoaSArIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY21wKGtleVtpXSwgbG93ZXJOZWVkbGVbaV0pIDwgMCkgcmV0dXJuIGtleS5zdWJzdHIoMCwgaSkgKyBsb3dlck5lZWRsZVtpXSArIHVwcGVyTmVlZGxlLnN1YnN0cihpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsbHAgPj0gMCkgcmV0dXJuIGtleS5zdWJzdHIoMCwgbGxwKSArIGxvd2VyS2V5W2xscF0gKyB1cHBlck5lZWRsZS5zdWJzdHIobGxwICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY21wKGtleVtpXSwgbHdyS2V5Q2hhcikgPCAwKSBsbHAgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxlbmd0aCA8IGxvd2VyTmVlZGxlLmxlbmd0aCAmJiBkaXIgPT09IFwibmV4dFwiKSByZXR1cm4ga2V5ICsgdXBwZXJOZWVkbGUuc3Vic3RyKGtleS5sZW5ndGgpO1xuICAgICAgICAgICAgaWYgKGxlbmd0aCA8IGtleS5sZW5ndGggJiYgZGlyID09PSBcInByZXZcIikgcmV0dXJuIGtleS5zdWJzdHIoMCwgdXBwZXJOZWVkbGUubGVuZ3RoKTtcbiAgICAgICAgICAgIHJldHVybiBsbHAgPCAwID8gbnVsbCA6IGtleS5zdWJzdHIoMCwgbGxwKSArIGxvd2VyTmVlZGxlW2xscF0gKyB1cHBlck5lZWRsZS5zdWJzdHIobGxwICsgMSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhZGRJZ25vcmVDYXNlQWxnb3JpdGhtKHdoZXJlQ2xhdXNlLCBtYXRjaCwgbmVlZGxlcywgc3VmZml4KSB7XG4gICAgICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJuZWVkbGVzXCIgdHlwZT1cIkFycmF5XCIgZWxlbWVudFR5cGU9XCJTdHJpbmdcIj48L3BhcmFtPlxuICAgICAgICAgICAgdmFyIHVwcGVyLFxuICAgICAgICAgICAgICAgIGxvd2VyLFxuICAgICAgICAgICAgICAgIGNvbXBhcmUsXG4gICAgICAgICAgICAgICAgdXBwZXJOZWVkbGVzLFxuICAgICAgICAgICAgICAgIGxvd2VyTmVlZGxlcyxcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24sXG4gICAgICAgICAgICAgICAgbmV4dEtleVN1ZmZpeCxcbiAgICAgICAgICAgICAgICBuZWVkbGVzTGVuID0gbmVlZGxlcy5sZW5ndGg7XG4gICAgICAgICAgICBpZiAoIW5lZWRsZXMuZXZlcnkoZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnO1xuICAgICAgICAgICAgfSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFpbCh3aGVyZUNsYXVzZSwgU1RSSU5HX0VYUEVDVEVEKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXREaXJlY3Rpb24oZGlyKSB7XG4gICAgICAgICAgICAgICAgdXBwZXIgPSB1cHBlckZhY3RvcnkoZGlyKTtcbiAgICAgICAgICAgICAgICBsb3dlciA9IGxvd2VyRmFjdG9yeShkaXIpO1xuICAgICAgICAgICAgICAgIGNvbXBhcmUgPSBkaXIgPT09IFwibmV4dFwiID8gc2ltcGxlQ29tcGFyZSA6IHNpbXBsZUNvbXBhcmVSZXZlcnNlO1xuICAgICAgICAgICAgICAgIHZhciBuZWVkbGVCb3VuZHMgPSBuZWVkbGVzLm1hcChmdW5jdGlvbiAobmVlZGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGxvd2VyOiBsb3dlcihuZWVkbGUpLCB1cHBlcjogdXBwZXIobmVlZGxlKSB9O1xuICAgICAgICAgICAgICAgIH0pLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmUoYS5sb3dlciwgYi5sb3dlcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdXBwZXJOZWVkbGVzID0gbmVlZGxlQm91bmRzLm1hcChmdW5jdGlvbiAobmIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5iLnVwcGVyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGxvd2VyTmVlZGxlcyA9IG5lZWRsZUJvdW5kcy5tYXAoZnVuY3Rpb24gKG5iKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuYi5sb3dlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBkaXI7XG4gICAgICAgICAgICAgICAgbmV4dEtleVN1ZmZpeCA9IGRpciA9PT0gXCJuZXh0XCIgPyBcIlwiIDogc3VmZml4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5pdERpcmVjdGlvbihcIm5leHRcIik7XG5cbiAgICAgICAgICAgIHZhciBjID0gbmV3IHdoZXJlQ2xhdXNlLl9jdHguY29sbENsYXNzKHdoZXJlQ2xhdXNlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIElEQktleVJhbmdlLmJvdW5kKHVwcGVyTmVlZGxlc1swXSwgbG93ZXJOZWVkbGVzW25lZWRsZXNMZW4gLSAxXSArIHN1ZmZpeCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYy5fb25kaXJlY3Rpb25jaGFuZ2UgPSBmdW5jdGlvbiAoZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBldmVudCBvbmx5cyBvY2N1ciBiZWZvcmUgZmlsdGVyIGlzIGNhbGxlZCB0aGUgZmlyc3QgdGltZS5cbiAgICAgICAgICAgICAgICBpbml0RGlyZWN0aW9uKGRpcmVjdGlvbik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgZmlyc3RQb3NzaWJsZU5lZWRsZSA9IDA7XG5cbiAgICAgICAgICAgIGMuX2FkZEFsZ29yaXRobShmdW5jdGlvbiAoY3Vyc29yLCBhZHZhbmNlLCByZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiY3Vyc29yXCIgdHlwZT1cIklEQkN1cnNvclwiPjwvcGFyYW0+XG4gICAgICAgICAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiYWR2YW5jZVwiIHR5cGU9XCJGdW5jdGlvblwiPjwvcGFyYW0+XG4gICAgICAgICAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwicmVzb2x2ZVwiIHR5cGU9XCJGdW5jdGlvblwiPjwvcGFyYW0+XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IGN1cnNvci5rZXk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIGxvd2VyS2V5ID0gbG93ZXIoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gobG93ZXJLZXksIGxvd2VyTmVlZGxlcywgZmlyc3RQb3NzaWJsZU5lZWRsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvd2VzdFBvc3NpYmxlQ2FzaW5nID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IGZpcnN0UG9zc2libGVOZWVkbGU7IGkgPCBuZWVkbGVzTGVuOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYXNpbmcgPSBuZXh0Q2FzaW5nKGtleSwgbG93ZXJLZXksIHVwcGVyTmVlZGxlc1tpXSwgbG93ZXJOZWVkbGVzW2ldLCBjb21wYXJlLCBkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhc2luZyA9PT0gbnVsbCAmJiBsb3dlc3RQb3NzaWJsZUNhc2luZyA9PT0gbnVsbCkgZmlyc3RQb3NzaWJsZU5lZWRsZSA9IGkgKyAxO2Vsc2UgaWYgKGxvd2VzdFBvc3NpYmxlQ2FzaW5nID09PSBudWxsIHx8IGNvbXBhcmUobG93ZXN0UG9zc2libGVDYXNpbmcsIGNhc2luZykgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG93ZXN0UG9zc2libGVDYXNpbmcgPSBjYXNpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvd2VzdFBvc3NpYmxlQ2FzaW5nICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3IuY29udGludWUobG93ZXN0UG9zc2libGVDYXNpbmcgKyBuZXh0S2V5U3VmZml4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZShyZXNvbHZlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFdoZXJlQ2xhdXNlIHB1YmxpYyBtZXRob2RzXG4gICAgICAgIC8vXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBiZXR3ZWVuOiBmdW5jdGlvbiAobG93ZXIsIHVwcGVyLCBpbmNsdWRlTG93ZXIsIGluY2x1ZGVVcHBlcikge1xuICAgICAgICAgICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgICAgICAgICAvLy8gICAgIEZpbHRlciBvdXQgcmVjb3JkcyB3aG9zZSB3aGVyZS1maWVsZCBsYXlzIGJldHdlZW4gZ2l2ZW4gbG93ZXIgYW5kIHVwcGVyIHZhbHVlcy4gQXBwbGllcyB0byBTdHJpbmdzLCBOdW1iZXJzIGFuZCBEYXRlcy5cbiAgICAgICAgICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImxvd2VyXCI+PC9wYXJhbT5cbiAgICAgICAgICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJ1cHBlclwiPjwvcGFyYW0+XG4gICAgICAgICAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiaW5jbHVkZUxvd2VyXCIgb3B0aW9uYWw9XCJ0cnVlXCI+V2hldGhlciBpdGVtcyB0aGF0IGVxdWFscyBsb3dlciBzaG91bGQgYmUgaW5jbHVkZWQuIERlZmF1bHQgdHJ1ZS48L3BhcmFtPlxuICAgICAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImluY2x1ZGVVcHBlclwiIG9wdGlvbmFsPVwidHJ1ZVwiPldoZXRoZXIgaXRlbXMgdGhhdCBlcXVhbHMgdXBwZXIgc2hvdWxkIGJlIGluY2x1ZGVkLiBEZWZhdWx0IGZhbHNlLjwvcGFyYW0+XG4gICAgICAgICAgICAgICAgLy8vIDxyZXR1cm5zIHR5cGU9XCJDb2xsZWN0aW9uXCI+PC9yZXR1cm5zPlxuICAgICAgICAgICAgICAgIGluY2x1ZGVMb3dlciA9IGluY2x1ZGVMb3dlciAhPT0gZmFsc2U7IC8vIERlZmF1bHQgdG8gdHJ1ZVxuICAgICAgICAgICAgICAgIGluY2x1ZGVVcHBlciA9IGluY2x1ZGVVcHBlciA9PT0gdHJ1ZTsgLy8gRGVmYXVsdCB0byBmYWxzZVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjbXAobG93ZXIsIHVwcGVyKSA+IDAgfHwgY21wKGxvd2VyLCB1cHBlcikgPT09IDAgJiYgKGluY2x1ZGVMb3dlciB8fCBpbmNsdWRlVXBwZXIpICYmICEoaW5jbHVkZUxvd2VyICYmIGluY2x1ZGVVcHBlcikpIHJldHVybiBlbXB0eUNvbGxlY3Rpb24odGhpcyk7IC8vIFdvcmthcm91bmQgZm9yIGlkaW90aWMgVzNDIFNwZWNpZmljYXRpb24gdGhhdCBEYXRhRXJyb3IgbXVzdCBiZSB0aHJvd24gaWYgbG93ZXIgPiB1cHBlci4gVGhlIG5hdHVyYWwgcmVzdWx0IHdvdWxkIGJlIHRvIHJldHVybiBhbiBlbXB0eSBjb2xsZWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMuX2N0eC5jb2xsQ2xhc3ModGhpcywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElEQktleVJhbmdlLmJvdW5kKGxvd2VyLCB1cHBlciwgIWluY2x1ZGVMb3dlciwgIWluY2x1ZGVVcHBlcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwodGhpcywgSU5WQUxJRF9LRVlfQVJHVU1FTlQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcXVhbHM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcy5fY3R4LmNvbGxDbGFzcyh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJREJLZXlSYW5nZS5vbmx5KHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhYm92ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzLl9jdHguY29sbENsYXNzKHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElEQktleVJhbmdlLmxvd2VyQm91bmQodmFsdWUsIHRydWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFib3ZlT3JFcXVhbDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzLl9jdHguY29sbENsYXNzKHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElEQktleVJhbmdlLmxvd2VyQm91bmQodmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJlbG93OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMuX2N0eC5jb2xsQ2xhc3ModGhpcywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSURCS2V5UmFuZ2UudXBwZXJCb3VuZCh2YWx1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmVsb3dPckVxdWFsOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMuX2N0eC5jb2xsQ2xhc3ModGhpcywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSURCS2V5UmFuZ2UudXBwZXJCb3VuZCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhcnRzV2l0aDogZnVuY3Rpb24gKHN0cikge1xuICAgICAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInN0clwiIHR5cGU9XCJTdHJpbmdcIj48L3BhcmFtPlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhaWwodGhpcywgU1RSSU5HX0VYUEVDVEVEKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5iZXR3ZWVuKHN0ciwgc3RyICsgbWF4U3RyaW5nLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGFydHNXaXRoSWdub3JlQ2FzZTogZnVuY3Rpb24gKHN0cikge1xuICAgICAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInN0clwiIHR5cGU9XCJTdHJpbmdcIj48L3BhcmFtPlxuICAgICAgICAgICAgICAgIGlmIChzdHIgPT09IFwiXCIpIHJldHVybiB0aGlzLnN0YXJ0c1dpdGgoc3RyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkSWdub3JlQ2FzZUFsZ29yaXRobSh0aGlzLCBmdW5jdGlvbiAoeCwgYSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC5pbmRleE9mKGFbMF0pID09PSAwO1xuICAgICAgICAgICAgICAgIH0sIFtzdHJdLCBtYXhTdHJpbmcpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVxdWFsc0lnbm9yZUNhc2U6IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJzdHJcIiB0eXBlPVwiU3RyaW5nXCI+PC9wYXJhbT5cbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkSWdub3JlQ2FzZUFsZ29yaXRobSh0aGlzLCBmdW5jdGlvbiAoeCwgYSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geCA9PT0gYVswXTtcbiAgICAgICAgICAgICAgICB9LCBbc3RyXSwgXCJcIik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW55T2ZJZ25vcmVDYXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNldCA9IGdldEFycmF5T2YuYXBwbHkoTk9fQ0hBUl9BUlJBWSwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICBpZiAoc2V0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIGVtcHR5Q29sbGVjdGlvbih0aGlzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkSWdub3JlQ2FzZUFsZ29yaXRobSh0aGlzLCBmdW5jdGlvbiAoeCwgYSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5pbmRleE9mKHgpICE9PSAtMTtcbiAgICAgICAgICAgICAgICB9LCBzZXQsIFwiXCIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXJ0c1dpdGhBbnlPZklnbm9yZUNhc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2V0ID0gZ2V0QXJyYXlPZi5hcHBseShOT19DSEFSX0FSUkFZLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIGlmIChzZXQubGVuZ3RoID09PSAwKSByZXR1cm4gZW1wdHlDb2xsZWN0aW9uKHRoaXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRJZ25vcmVDYXNlQWxnb3JpdGhtKHRoaXMsIGZ1bmN0aW9uICh4LCBhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhLnNvbWUoZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB4LmluZGV4T2YobikgPT09IDA7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIHNldCwgbWF4U3RyaW5nKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbnlPZjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzZXQgPSBnZXRBcnJheU9mLmFwcGx5KE5PX0NIQVJfQVJSQVksIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBhcmUgPSBhc2NlbmRpbmc7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0LnNvcnQoY29tcGFyZSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbCh0aGlzLCBJTlZBTElEX0tFWV9BUkdVTUVOVCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzZXQubGVuZ3RoID09PSAwKSByZXR1cm4gZW1wdHlDb2xsZWN0aW9uKHRoaXMpO1xuICAgICAgICAgICAgICAgIHZhciBjID0gbmV3IHRoaXMuX2N0eC5jb2xsQ2xhc3ModGhpcywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSURCS2V5UmFuZ2UuYm91bmQoc2V0WzBdLCBzZXRbc2V0Lmxlbmd0aCAtIDFdKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGMuX29uZGlyZWN0aW9uY2hhbmdlID0gZnVuY3Rpb24gKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjb21wYXJlID0gZGlyZWN0aW9uID09PSBcIm5leHRcIiA/IGFzY2VuZGluZyA6IGRlc2NlbmRpbmc7XG4gICAgICAgICAgICAgICAgICAgIHNldC5zb3J0KGNvbXBhcmUpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAgICAgICAgIGMuX2FkZEFsZ29yaXRobShmdW5jdGlvbiAoY3Vyc29yLCBhZHZhbmNlLCByZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBjdXJzb3Iua2V5O1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY29tcGFyZShrZXksIHNldFtpXSkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY3Vyc29yIGhhcyBwYXNzZWQgYmV5b25kIHRoaXMga2V5LiBDaGVjayBuZXh0LlxuICAgICAgICAgICAgICAgICAgICAgICAgKytpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IHNldC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGVyZSBpcyBubyBuZXh0LiBTdG9wIHNlYXJjaGluZy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlKHJlc29sdmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcGFyZShrZXksIHNldFtpXSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjdXJyZW50IGN1cnNvciB2YWx1ZSBzaG91bGQgYmUgaW5jbHVkZWQgYW5kIHdlIHNob3VsZCBjb250aW51ZSBhIHNpbmdsZSBzdGVwIGluIGNhc2UgbmV4dCBpdGVtIGhhcyB0aGUgc2FtZSBrZXkgb3IgcG9zc2libHkgb3VyIG5leHQga2V5IGluIHNldC5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY3Vyc29yLmtleSBub3QgeWV0IGF0IHNldFtpXS4gRm9yd2FyZCBjdXJzb3IgdG8gdGhlIG5leHQga2V5IHRvIGh1bnQgZm9yLlxuICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKHNldFtpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbm90RXF1YWw6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmluQW55UmFuZ2UoW1stSW5maW5pdHksIHZhbHVlXSwgW3ZhbHVlLCBtYXhLZXldXSwgeyBpbmNsdWRlTG93ZXJzOiBmYWxzZSwgaW5jbHVkZVVwcGVyczogZmFsc2UgfSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBub25lT2Y6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2V0ID0gZ2V0QXJyYXlPZi5hcHBseShOT19DSEFSX0FSUkFZLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIGlmIChzZXQubGVuZ3RoID09PSAwKSByZXR1cm4gbmV3IHRoaXMuX2N0eC5jb2xsQ2xhc3ModGhpcyk7IC8vIFJldHVybiBlbnRpcmUgY29sbGVjdGlvbi5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBzZXQuc29ydChhc2NlbmRpbmcpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwodGhpcywgSU5WQUxJRF9LRVlfQVJHVU1FTlQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBUcmFuc2Zvcm0gW1wiYVwiLFwiYlwiLFwiY1wiXSB0byBhIHNldCBvZiByYW5nZXMgZm9yIGJldHdlZW4vYWJvdmUvYmVsb3c6IFtbLUluZmluaXR5LFwiYVwiXSwgW1wiYVwiLFwiYlwiXSwgW1wiYlwiLFwiY1wiXSwgW1wiY1wiLG1heEtleV1dXG4gICAgICAgICAgICAgICAgdmFyIHJhbmdlcyA9IHNldC5yZWR1Y2UoZnVuY3Rpb24gKHJlcywgdmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXMgPyByZXMuY29uY2F0KFtbcmVzW3Jlcy5sZW5ndGggLSAxXVsxXSwgdmFsXV0pIDogW1stSW5maW5pdHksIHZhbF1dO1xuICAgICAgICAgICAgICAgIH0sIG51bGwpO1xuICAgICAgICAgICAgICAgIHJhbmdlcy5wdXNoKFtzZXRbc2V0Lmxlbmd0aCAtIDFdLCBtYXhLZXldKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pbkFueVJhbmdlKHJhbmdlcywgeyBpbmNsdWRlTG93ZXJzOiBmYWxzZSwgaW5jbHVkZVVwcGVyczogZmFsc2UgfSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvKiogRmlsdGVyIG91dCB2YWx1ZXMgd2l0aGluZyBnaXZlbiBzZXQgb2YgcmFuZ2VzLlxyXG4gICAgICAgICAgICAqIEV4YW1wbGUsIGdpdmUgY2hpbGRyZW4gYW5kIGVsZGVycyBhIHJlYmF0ZSBvZiA1MCU6XHJcbiAgICAgICAgICAgICpcclxuICAgICAgICAgICAgKiAgIGRiLmZyaWVuZHMud2hlcmUoJ2FnZScpLmluQW55UmFuZ2UoW1swLDE4XSxbNjUsSW5maW5pdHldXSkubW9kaWZ5KHtSZWJhdGU6IDEvMn0pO1xyXG4gICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICogQHBhcmFtIHsoc3RyaW5nfG51bWJlcnxEYXRlfEFycmF5KVtdW119IHJhbmdlc1xyXG4gICAgICAgICAgICAqIEBwYXJhbSB7e2luY2x1ZGVMb3dlcnM6IGJvb2xlYW4sIGluY2x1ZGVVcHBlcnM6IGJvb2xlYW59fSBvcHRpb25zXHJcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpbkFueVJhbmdlOiBmdW5jdGlvbiAocmFuZ2VzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN0eCA9IHRoaXMuX2N0eDtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGVtcHR5Q29sbGVjdGlvbih0aGlzKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJhbmdlcy5ldmVyeShmdW5jdGlvbiAocmFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhbmdlWzBdICE9PSB1bmRlZmluZWQgJiYgcmFuZ2VbMV0gIT09IHVuZGVmaW5lZCAmJiBhc2NlbmRpbmcocmFuZ2VbMF0sIHJhbmdlWzFdKSA8PSAwO1xuICAgICAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKHRoaXMsIFwiRmlyc3QgYXJndW1lbnQgdG8gaW5BbnlSYW5nZSgpIG11c3QgYmUgYW4gQXJyYXkgb2YgdHdvLXZhbHVlIEFycmF5cyBbbG93ZXIsdXBwZXJdIHdoZXJlIHVwcGVyIG11c3Qgbm90IGJlIGxvd2VyIHRoYW4gbG93ZXJcIiwgZXhjZXB0aW9ucy5JbnZhbGlkQXJndW1lbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgaW5jbHVkZUxvd2VycyA9ICFvcHRpb25zIHx8IG9wdGlvbnMuaW5jbHVkZUxvd2VycyAhPT0gZmFsc2U7IC8vIERlZmF1bHQgdG8gdHJ1ZVxuICAgICAgICAgICAgICAgIHZhciBpbmNsdWRlVXBwZXJzID0gb3B0aW9ucyAmJiBvcHRpb25zLmluY2x1ZGVVcHBlcnMgPT09IHRydWU7IC8vIERlZmF1bHQgdG8gZmFsc2VcblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGFkZFJhbmdlKHJhbmdlcywgbmV3UmFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSByYW5nZXMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmFuZ2UgPSByYW5nZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY21wKG5ld1JhbmdlWzBdLCByYW5nZVsxXSkgPCAwICYmIGNtcChuZXdSYW5nZVsxXSwgcmFuZ2VbMF0pID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhbmdlWzBdID0gbWluKHJhbmdlWzBdLCBuZXdSYW5nZVswXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmFuZ2VbMV0gPSBtYXgocmFuZ2VbMV0sIG5ld1JhbmdlWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gbCkgcmFuZ2VzLnB1c2gobmV3UmFuZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmFuZ2VzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBzb3J0RGlyZWN0aW9uID0gYXNjZW5kaW5nO1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHJhbmdlU29ydGVyKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNvcnREaXJlY3Rpb24oYVswXSwgYlswXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSm9pbiBvdmVybGFwcGluZyByYW5nZXNcbiAgICAgICAgICAgICAgICB2YXIgc2V0O1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHNldCA9IHJhbmdlcy5yZWR1Y2UoYWRkUmFuZ2UsIFtdKTtcbiAgICAgICAgICAgICAgICAgICAgc2V0LnNvcnQocmFuZ2VTb3J0ZXIpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKHRoaXMsIElOVkFMSURfS0VZX0FSR1VNRU5UKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIGtleUlzQmV5b25kQ3VycmVudEVudHJ5ID0gaW5jbHVkZVVwcGVycyA/IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzY2VuZGluZyhrZXksIHNldFtpXVsxXSkgPiAwO1xuICAgICAgICAgICAgICAgIH0gOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc2NlbmRpbmcoa2V5LCBzZXRbaV1bMV0pID49IDA7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZhciBrZXlJc0JlZm9yZUN1cnJlbnRFbnRyeSA9IGluY2x1ZGVMb3dlcnMgPyBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZXNjZW5kaW5nKGtleSwgc2V0W2ldWzBdKSA+IDA7XG4gICAgICAgICAgICAgICAgfSA6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlc2NlbmRpbmcoa2V5LCBzZXRbaV1bMF0pID49IDA7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGtleVdpdGhpbkN1cnJlbnRSYW5nZShrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFrZXlJc0JleW9uZEN1cnJlbnRFbnRyeShrZXkpICYmICFrZXlJc0JlZm9yZUN1cnJlbnRFbnRyeShrZXkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjaGVja0tleSA9IGtleUlzQmV5b25kQ3VycmVudEVudHJ5O1xuXG4gICAgICAgICAgICAgICAgdmFyIGMgPSBuZXcgY3R4LmNvbGxDbGFzcyh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJREJLZXlSYW5nZS5ib3VuZChzZXRbMF1bMF0sIHNldFtzZXQubGVuZ3RoIC0gMV1bMV0sICFpbmNsdWRlTG93ZXJzLCAhaW5jbHVkZVVwcGVycyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjLl9vbmRpcmVjdGlvbmNoYW5nZSA9IGZ1bmN0aW9uIChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrS2V5ID0ga2V5SXNCZXlvbmRDdXJyZW50RW50cnk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0RGlyZWN0aW9uID0gYXNjZW5kaW5nO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tLZXkgPSBrZXlJc0JlZm9yZUN1cnJlbnRFbnRyeTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnREaXJlY3Rpb24gPSBkZXNjZW5kaW5nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNldC5zb3J0KHJhbmdlU29ydGVyKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgYy5fYWRkQWxnb3JpdGhtKGZ1bmN0aW9uIChjdXJzb3IsIGFkdmFuY2UsIHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGN1cnNvci5rZXk7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjaGVja0tleShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY3Vyc29yIGhhcyBwYXNzZWQgYmV5b25kIHRoaXMga2V5LiBDaGVjayBuZXh0LlxuICAgICAgICAgICAgICAgICAgICAgICAgKytpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IHNldC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGVyZSBpcyBubyBuZXh0LiBTdG9wIHNlYXJjaGluZy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlKHJlc29sdmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5V2l0aGluQ3VycmVudFJhbmdlKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjdXJyZW50IGN1cnNvciB2YWx1ZSBzaG91bGQgYmUgaW5jbHVkZWQgYW5kIHdlIHNob3VsZCBjb250aW51ZSBhIHNpbmdsZSBzdGVwIGluIGNhc2UgbmV4dCBpdGVtIGhhcyB0aGUgc2FtZSBrZXkgb3IgcG9zc2libHkgb3VyIG5leHQga2V5IGluIHNldC5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNtcChrZXksIHNldFtpXVsxXSkgPT09IDAgfHwgY21wKGtleSwgc2V0W2ldWzBdKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW5jbHVkZVVwcGVyIG9yIGluY2x1ZGVMb3dlciBpcyBmYWxzZSBzbyBrZXlXaXRoaW5DdXJyZW50UmFuZ2UoKSByZXR1cm5zIGZhbHNlIGV2ZW4gdGhvdWdoIHdlIGFyZSBhdCByYW5nZSBib3JkZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb250aW51ZSB0byBuZXh0IGtleSBidXQgZG9uJ3QgaW5jbHVkZSB0aGlzIG9uZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGN1cnNvci5rZXkgbm90IHlldCBhdCBzZXRbaV0uIEZvcndhcmQgY3Vyc29yIHRvIHRoZSBuZXh0IGtleSB0byBodW50IGZvci5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFkdmFuY2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzb3J0RGlyZWN0aW9uID09PSBhc2NlbmRpbmcpIGN1cnNvci5jb250aW51ZShzZXRbaV1bMF0pO2Vsc2UgY3Vyc29yLmNvbnRpbnVlKHNldFtpXVsxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXJ0c1dpdGhBbnlPZjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzZXQgPSBnZXRBcnJheU9mLmFwcGx5KE5PX0NIQVJfQVJSQVksIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXNldC5ldmVyeShmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnO1xuICAgICAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKHRoaXMsIFwic3RhcnRzV2l0aEFueU9mKCkgb25seSB3b3JrcyB3aXRoIHN0cmluZ3NcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzZXQubGVuZ3RoID09PSAwKSByZXR1cm4gZW1wdHlDb2xsZWN0aW9uKHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5BbnlSYW5nZShzZXQubWFwKGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtzdHIsIHN0ciArIG1heFN0cmluZ107XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gQ29sbGVjdGlvbiBDbGFzc1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIGZ1bmN0aW9uIENvbGxlY3Rpb24od2hlcmVDbGF1c2UsIGtleVJhbmdlR2VuZXJhdG9yKSB7XG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cIndoZXJlQ2xhdXNlXCIgdHlwZT1cIldoZXJlQ2xhdXNlXCI+V2hlcmUgY2xhdXNlIGluc3RhbmNlPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwia2V5UmFuZ2VHZW5lcmF0b3JcIiB2YWx1ZT1cImZ1bmN0aW9uKCl7IHJldHVybiBJREJLZXlSYW5nZS5ib3VuZCgwLDEpO31cIiBvcHRpb25hbD1cInRydWVcIj48L3BhcmFtPlxuICAgICAgICB2YXIga2V5UmFuZ2UgPSBudWxsLFxuICAgICAgICAgICAgZXJyb3IgPSBudWxsO1xuICAgICAgICBpZiAoa2V5UmFuZ2VHZW5lcmF0b3IpIHRyeSB7XG4gICAgICAgICAgICBrZXlSYW5nZSA9IGtleVJhbmdlR2VuZXJhdG9yKCk7XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICBlcnJvciA9IGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdoZXJlQ3R4ID0gd2hlcmVDbGF1c2UuX2N0eCxcbiAgICAgICAgICAgIHRhYmxlID0gd2hlcmVDdHgudGFibGU7XG4gICAgICAgIHRoaXMuX2N0eCA9IHtcbiAgICAgICAgICAgIHRhYmxlOiB0YWJsZSxcbiAgICAgICAgICAgIGluZGV4OiB3aGVyZUN0eC5pbmRleCxcbiAgICAgICAgICAgIGlzUHJpbUtleTogIXdoZXJlQ3R4LmluZGV4IHx8IHRhYmxlLnNjaGVtYS5wcmltS2V5LmtleVBhdGggJiYgd2hlcmVDdHguaW5kZXggPT09IHRhYmxlLnNjaGVtYS5wcmltS2V5Lm5hbWUsXG4gICAgICAgICAgICByYW5nZToga2V5UmFuZ2UsXG4gICAgICAgICAgICBrZXlzT25seTogZmFsc2UsXG4gICAgICAgICAgICBkaXI6IFwibmV4dFwiLFxuICAgICAgICAgICAgdW5pcXVlOiBcIlwiLFxuICAgICAgICAgICAgYWxnb3JpdGhtOiBudWxsLFxuICAgICAgICAgICAgZmlsdGVyOiBudWxsLFxuICAgICAgICAgICAgcmVwbGF5RmlsdGVyOiBudWxsLFxuICAgICAgICAgICAganVzdExpbWl0OiB0cnVlLCAvLyBUcnVlIGlmIGEgcmVwbGF5RmlsdGVyIGlzIGp1c3QgYSBmaWx0ZXIgdGhhdCBwZXJmb3JtcyBhIFwibGltaXRcIiBvcGVyYXRpb24gKG9yIG5vbmUgYXQgYWxsKVxuICAgICAgICAgICAgaXNNYXRjaDogbnVsbCxcbiAgICAgICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgICAgIGxpbWl0OiBJbmZpbml0eSxcbiAgICAgICAgICAgIGVycm9yOiBlcnJvciwgLy8gSWYgc2V0LCBhbnkgcHJvbWlzZSBtdXN0IGJlIHJlamVjdGVkIHdpdGggdGhpcyBlcnJvclxuICAgICAgICAgICAgb3I6IHdoZXJlQ3R4Lm9yLFxuICAgICAgICAgICAgdmFsdWVNYXBwZXI6IHRhYmxlLmhvb2sucmVhZGluZy5maXJlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNQbGFpbktleVJhbmdlKGN0eCwgaWdub3JlTGltaXRGaWx0ZXIpIHtcbiAgICAgICAgcmV0dXJuICEoY3R4LmZpbHRlciB8fCBjdHguYWxnb3JpdGhtIHx8IGN0eC5vcikgJiYgKGlnbm9yZUxpbWl0RmlsdGVyID8gY3R4Lmp1c3RMaW1pdCA6ICFjdHgucmVwbGF5RmlsdGVyKTtcbiAgICB9XG5cbiAgICBwcm9wcyhDb2xsZWN0aW9uLnByb3RvdHlwZSwgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIENvbGxlY3Rpb24gUHJpdmF0ZSBGdW5jdGlvbnNcbiAgICAgICAgLy9cblxuICAgICAgICBmdW5jdGlvbiBhZGRGaWx0ZXIoY3R4LCBmbikge1xuICAgICAgICAgICAgY3R4LmZpbHRlciA9IGNvbWJpbmUoY3R4LmZpbHRlciwgZm4pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYWRkUmVwbGF5RmlsdGVyKGN0eCwgZmFjdG9yeSwgaXNMaW1pdEZpbHRlcikge1xuICAgICAgICAgICAgdmFyIGN1cnIgPSBjdHgucmVwbGF5RmlsdGVyO1xuICAgICAgICAgICAgY3R4LnJlcGxheUZpbHRlciA9IGN1cnIgPyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbWJpbmUoY3VycigpLCBmYWN0b3J5KCkpO1xuICAgICAgICAgICAgfSA6IGZhY3Rvcnk7XG4gICAgICAgICAgICBjdHguanVzdExpbWl0ID0gaXNMaW1pdEZpbHRlciAmJiAhY3VycjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFkZE1hdGNoRmlsdGVyKGN0eCwgZm4pIHtcbiAgICAgICAgICAgIGN0eC5pc01hdGNoID0gY29tYmluZShjdHguaXNNYXRjaCwgZm4pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEBwYXJhbSBjdHgge1xyXG4gICAgICAgICAqICAgICAgaXNQcmltS2V5OiBib29sZWFuLFxyXG4gICAgICAgICAqICAgICAgdGFibGU6IFRhYmxlLFxyXG4gICAgICAgICAqICAgICAgaW5kZXg6IHN0cmluZ1xyXG4gICAgICAgICAqIH1cclxuICAgICAgICAgKiBAcGFyYW0gc3RvcmUgSURCT2JqZWN0U3RvcmVcclxuICAgICAgICAgKiovXG4gICAgICAgIGZ1bmN0aW9uIGdldEluZGV4T3JTdG9yZShjdHgsIHN0b3JlKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmlzUHJpbUtleSkgcmV0dXJuIHN0b3JlO1xuICAgICAgICAgICAgdmFyIGluZGV4U3BlYyA9IGN0eC50YWJsZS5zY2hlbWEuaWR4QnlOYW1lW2N0eC5pbmRleF07XG4gICAgICAgICAgICBpZiAoIWluZGV4U3BlYykgdGhyb3cgbmV3IGV4Y2VwdGlvbnMuU2NoZW1hKFwiS2V5UGF0aCBcIiArIGN0eC5pbmRleCArIFwiIG9uIG9iamVjdCBzdG9yZSBcIiArIHN0b3JlLm5hbWUgKyBcIiBpcyBub3QgaW5kZXhlZFwiKTtcbiAgICAgICAgICAgIHJldHVybiBzdG9yZS5pbmRleChpbmRleFNwZWMubmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQHBhcmFtIGN0eCB7XHJcbiAgICAgICAgICogICAgICBpc1ByaW1LZXk6IGJvb2xlYW4sXHJcbiAgICAgICAgICogICAgICB0YWJsZTogVGFibGUsXHJcbiAgICAgICAgICogICAgICBpbmRleDogc3RyaW5nLFxyXG4gICAgICAgICAqICAgICAga2V5c09ubHk6IGJvb2xlYW4sXHJcbiAgICAgICAgICogICAgICByYW5nZT86IElEQktleVJhbmdlLFxyXG4gICAgICAgICAqICAgICAgZGlyOiBcIm5leHRcIiB8IFwicHJldlwiXHJcbiAgICAgICAgICogfVxyXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBvcGVuQ3Vyc29yKGN0eCwgc3RvcmUpIHtcbiAgICAgICAgICAgIHZhciBpZHhPclN0b3JlID0gZ2V0SW5kZXhPclN0b3JlKGN0eCwgc3RvcmUpO1xuICAgICAgICAgICAgcmV0dXJuIGN0eC5rZXlzT25seSAmJiAnb3BlbktleUN1cnNvcicgaW4gaWR4T3JTdG9yZSA/IGlkeE9yU3RvcmUub3BlbktleUN1cnNvcihjdHgucmFuZ2UgfHwgbnVsbCwgY3R4LmRpciArIGN0eC51bmlxdWUpIDogaWR4T3JTdG9yZS5vcGVuQ3Vyc29yKGN0eC5yYW5nZSB8fCBudWxsLCBjdHguZGlyICsgY3R4LnVuaXF1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpdGVyKGN0eCwgZm4sIHJlc29sdmUsIHJlamVjdCwgaWRic3RvcmUpIHtcbiAgICAgICAgICAgIHZhciBmaWx0ZXIgPSBjdHgucmVwbGF5RmlsdGVyID8gY29tYmluZShjdHguZmlsdGVyLCBjdHgucmVwbGF5RmlsdGVyKCkpIDogY3R4LmZpbHRlcjtcbiAgICAgICAgICAgIGlmICghY3R4Lm9yKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0ZShvcGVuQ3Vyc29yKGN0eCwgaWRic3RvcmUpLCBjb21iaW5lKGN0eC5hbGdvcml0aG0sIGZpbHRlciksIGZuLCByZXNvbHZlLCByZWplY3QsICFjdHgua2V5c09ubHkgJiYgY3R4LnZhbHVlTWFwcGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzZXQgPSB7fTtcbiAgICAgICAgICAgICAgICB2YXIgcmVzb2x2ZWQgPSAwO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZWJvdGgoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgrK3Jlc29sdmVkID09PSAyKSByZXNvbHZlKCk7IC8vIFNlZW1zIGxpa2Ugd2UganVzdCBzdXBwb3J0IG9yIGJ0d24gbWF4IDIgZXhwcmVzc2lvbnMsIGJ1dCB0aGVyZSBhcmUgbm8gbGltaXQgYmVjYXVzZSB3ZSBkbyByZWN1cnNpb24uXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gdW5pb24oaXRlbSwgY3Vyc29yLCBhZHZhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZmlsdGVyIHx8IGZpbHRlcihjdXJzb3IsIGFkdmFuY2UsIHJlc29sdmVib3RoLCByZWplY3QpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gY3Vyc29yLnByaW1hcnlLZXkudG9TdHJpbmcoKTsgLy8gQ29udmVydHMgYW55IERhdGUgdG8gU3RyaW5nLCBTdHJpbmcgdG8gU3RyaW5nLCBOdW1iZXIgdG8gU3RyaW5nIGFuZCBBcnJheSB0byBjb21tYS1zZXBhcmF0ZWQgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWhhc093bihzZXQsIGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRba2V5XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm4oaXRlbSwgY3Vyc29yLCBhZHZhbmNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGN0eC5vci5faXRlcmF0ZSh1bmlvbiwgcmVzb2x2ZWJvdGgsIHJlamVjdCwgaWRic3RvcmUpO1xuICAgICAgICAgICAgICAgIGl0ZXJhdGUob3BlbkN1cnNvcihjdHgsIGlkYnN0b3JlKSwgY3R4LmFsZ29yaXRobSwgdW5pb24sIHJlc29sdmVib3RoLCByZWplY3QsICFjdHgua2V5c09ubHkgJiYgY3R4LnZhbHVlTWFwcGVyKTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gZ2V0SW5zdGFuY2VUZW1wbGF0ZShjdHgpIHtcbiAgICAgICAgICAgIHJldHVybiBjdHgudGFibGUuc2NoZW1hLmluc3RhbmNlVGVtcGxhdGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gQ29sbGVjdGlvbiBQcm90ZWN0ZWQgRnVuY3Rpb25zXG4gICAgICAgICAgICAvL1xuXG4gICAgICAgICAgICBfcmVhZDogZnVuY3Rpb24gKGZuLCBjYikge1xuICAgICAgICAgICAgICAgIHZhciBjdHggPSB0aGlzLl9jdHg7XG4gICAgICAgICAgICAgICAgaWYgKGN0eC5lcnJvcikgcmV0dXJuIGN0eC50YWJsZS5fdHJhbnMobnVsbCwgZnVuY3Rpb24gcmVqZWN0b3IocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChjdHguZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO2Vsc2UgcmV0dXJuIGN0eC50YWJsZS5faWRic3RvcmUoUkVBRE9OTFksIGZuKS50aGVuKGNiKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfd3JpdGU6IGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIHZhciBjdHggPSB0aGlzLl9jdHg7XG4gICAgICAgICAgICAgICAgaWYgKGN0eC5lcnJvcikgcmV0dXJuIGN0eC50YWJsZS5fdHJhbnMobnVsbCwgZnVuY3Rpb24gcmVqZWN0b3IocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChjdHguZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO2Vsc2UgcmV0dXJuIGN0eC50YWJsZS5faWRic3RvcmUoUkVBRFdSSVRFLCBmbiwgXCJsb2NrZWRcIik7IC8vIFdoZW4gZG9pbmcgd3JpdGUgb3BlcmF0aW9ucyBvbiBjb2xsZWN0aW9ucywgYWx3YXlzIGxvY2sgdGhlIG9wZXJhdGlvbiBzbyB0aGF0IHVwY29taW5nIG9wZXJhdGlvbnMgZ2V0cyBxdWV1ZWQuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX2FkZEFsZ29yaXRobTogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN0eCA9IHRoaXMuX2N0eDtcbiAgICAgICAgICAgICAgICBjdHguYWxnb3JpdGhtID0gY29tYmluZShjdHguYWxnb3JpdGhtLCBmbik7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBfaXRlcmF0ZTogZnVuY3Rpb24gKGZuLCByZXNvbHZlLCByZWplY3QsIGlkYnN0b3JlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXIodGhpcy5fY3R4LCBmbiwgcmVzb2x2ZSwgcmVqZWN0LCBpZGJzdG9yZSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBjbG9uZTogZnVuY3Rpb24gKHByb3BzJCQxKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJ2ID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmNvbnN0cnVjdG9yLnByb3RvdHlwZSksXG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IE9iamVjdC5jcmVhdGUodGhpcy5fY3R4KTtcbiAgICAgICAgICAgICAgICBpZiAocHJvcHMkJDEpIGV4dGVuZChjdHgsIHByb3BzJCQxKTtcbiAgICAgICAgICAgICAgICBydi5fY3R4ID0gY3R4O1xuICAgICAgICAgICAgICAgIHJldHVybiBydjtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHJhdzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N0eC52YWx1ZU1hcHBlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gQ29sbGVjdGlvbiBQdWJsaWMgbWV0aG9kc1xuICAgICAgICAgICAgLy9cblxuICAgICAgICAgICAgZWFjaDogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN0eCA9IHRoaXMuX2N0eDtcblxuICAgICAgICAgICAgICAgIGlmIChmYWtlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gZ2V0SW5zdGFuY2VUZW1wbGF0ZShjdHgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbUtleVBhdGggPSBjdHgudGFibGUuc2NoZW1hLnByaW1LZXkua2V5UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSA9IGdldEJ5S2V5UGF0aChpdGVtLCBjdHguaW5kZXggPyBjdHgudGFibGUuc2NoZW1hLmlkeEJ5TmFtZVtjdHguaW5kZXhdLmtleVBhdGggOiBwcmltS2V5UGF0aCksXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5S2V5ID0gZ2V0QnlLZXlQYXRoKGl0ZW0sIHByaW1LZXlQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oaXRlbSwgeyBrZXk6IGtleSwgcHJpbWFyeUtleTogcHJpbWFyeUtleSB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVhZChmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBpZGJzdG9yZSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVyKGN0eCwgZm4sIHJlc29sdmUsIHJlamVjdCwgaWRic3RvcmUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgY291bnQ6IGZ1bmN0aW9uIChjYikge1xuICAgICAgICAgICAgICAgIGlmIChmYWtlKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDApLnRoZW4oY2IpO1xuICAgICAgICAgICAgICAgIHZhciBjdHggPSB0aGlzLl9jdHg7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNQbGFpbktleVJhbmdlKGN0eCwgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIHBsYWluIGtleSByYW5nZS4gV2UgY2FuIHVzZSB0aGUgY291bnQoKSBtZXRob2QgaWYgdGhlIGluZGV4LlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVhZChmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBpZGJzdG9yZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlkeCA9IGdldEluZGV4T3JTdG9yZShjdHgsIGlkYnN0b3JlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXEgPSBjdHgucmFuZ2UgPyBpZHguY291bnQoY3R4LnJhbmdlKSA6IGlkeC5jb3VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBldmVudFJlamVjdEhhbmRsZXIocmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoTWF0aC5taW4oZS50YXJnZXQucmVzdWx0LCBjdHgubGltaXQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0sIGNiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBBbGdvcml0aG1zLCBmaWx0ZXJzIG9yIGV4cHJlc3Npb25zIGFyZSBhcHBsaWVkLiBOZWVkIHRvIGNvdW50IG1hbnVhbGx5LlxuICAgICAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVhZChmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBpZGJzdG9yZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlcihjdHgsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArK2NvdW50O3JldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHJlamVjdCwgaWRic3RvcmUpO1xuICAgICAgICAgICAgICAgICAgICB9LCBjYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc29ydEJ5OiBmdW5jdGlvbiAoa2V5UGF0aCwgY2IpIHtcbiAgICAgICAgICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJrZXlQYXRoXCIgdHlwZT1cIlN0cmluZ1wiPjwvcGFyYW0+XG4gICAgICAgICAgICAgICAgdmFyIHBhcnRzID0ga2V5UGF0aC5zcGxpdCgnLicpLnJldmVyc2UoKSxcbiAgICAgICAgICAgICAgICAgICAgbGFzdFBhcnQgPSBwYXJ0c1swXSxcbiAgICAgICAgICAgICAgICAgICAgbGFzdEluZGV4ID0gcGFydHMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBnZXR2YWwob2JqLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpKSByZXR1cm4gZ2V0dmFsKG9ialtwYXJ0c1tpXV0sIGkgLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9ialtsYXN0UGFydF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBvcmRlciA9IHRoaXMuX2N0eC5kaXIgPT09IFwibmV4dFwiID8gMSA6IC0xO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc29ydGVyKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFWYWwgPSBnZXR2YWwoYSwgbGFzdEluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJWYWwgPSBnZXR2YWwoYiwgbGFzdEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFWYWwgPCBiVmFsID8gLW9yZGVyIDogYVZhbCA+IGJWYWwgPyBvcmRlciA6IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvQXJyYXkoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEuc29ydChzb3J0ZXIpO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oY2IpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgdG9BcnJheTogZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN0eCA9IHRoaXMuX2N0eDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVhZChmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBpZGJzdG9yZSkge1xuICAgICAgICAgICAgICAgICAgICBmYWtlICYmIHJlc29sdmUoW2dldEluc3RhbmNlVGVtcGxhdGUoY3R4KV0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFzR2V0QWxsICYmIGN0eC5kaXIgPT09ICduZXh0JyAmJiBpc1BsYWluS2V5UmFuZ2UoY3R4LCB0cnVlKSAmJiBjdHgubGltaXQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIG9wdGltYXRpb24gaWYgd2UgY291bGQgdXNlIElEQk9iamVjdFN0b3JlLmdldEFsbCgpIG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJREJLZXlSYW5nZS5nZXRBbGwoKTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWFkaW5nSG9vayA9IGN0eC50YWJsZS5ob29rLnJlYWRpbmcuZmlyZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZHhPclN0b3JlID0gZ2V0SW5kZXhPclN0b3JlKGN0eCwgaWRic3RvcmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IGN0eC5saW1pdCA8IEluZmluaXR5ID8gaWR4T3JTdG9yZS5nZXRBbGwoY3R4LnJhbmdlLCBjdHgubGltaXQpIDogaWR4T3JTdG9yZS5nZXRBbGwoY3R4LnJhbmdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZXZlbnRSZWplY3RIYW5kbGVyKHJlamVjdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gcmVhZGluZ0hvb2sgPT09IG1pcnJvciA/IGV2ZW50U3VjY2Vzc0hhbmRsZXIocmVzb2x2ZSkgOiB3cmFwKGV2ZW50U3VjY2Vzc0hhbmRsZXIoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLm1hcChyZWFkaW5nSG9vaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldHRpbmcgYXJyYXkgdGhyb3VnaCBhIGN1cnNvci5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVyKGN0eCwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiBhcnJheUNvbXBsZXRlKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCByZWplY3QsIGlkYnN0b3JlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGNiKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9mZnNldDogZnVuY3Rpb24gKG9mZnNldCkge1xuICAgICAgICAgICAgICAgIHZhciBjdHggPSB0aGlzLl9jdHg7XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldCA8PSAwKSByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgICBjdHgub2Zmc2V0ICs9IG9mZnNldDsgLy8gRm9yIGNvdW50KClcbiAgICAgICAgICAgICAgICBpZiAoaXNQbGFpbktleVJhbmdlKGN0eCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkUmVwbGF5RmlsdGVyKGN0eCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldExlZnQgPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGN1cnNvciwgYWR2YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvZmZzZXRMZWZ0ID09PSAwKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob2Zmc2V0TGVmdCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtLW9mZnNldExlZnQ7cmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yLmFkdmFuY2Uob2Zmc2V0TGVmdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldExlZnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZFJlcGxheUZpbHRlcihjdHgsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvZmZzZXRMZWZ0ID0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLS1vZmZzZXRMZWZ0IDwgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGxpbWl0OiBmdW5jdGlvbiAobnVtUm93cykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N0eC5saW1pdCA9IE1hdGgubWluKHRoaXMuX2N0eC5saW1pdCwgbnVtUm93cyk7IC8vIEZvciBjb3VudCgpXG4gICAgICAgICAgICAgICAgYWRkUmVwbGF5RmlsdGVyKHRoaXMuX2N0eCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcm93c0xlZnQgPSBudW1Sb3dzO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGN1cnNvciwgYWR2YW5jZSwgcmVzb2x2ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKC0tcm93c0xlZnQgPD0gMCkgYWR2YW5jZShyZXNvbHZlKTsgLy8gU3RvcCBhZnRlciB0aGlzIGl0ZW0gaGFzIGJlZW4gaW5jbHVkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByb3dzTGVmdCA+PSAwOyAvLyBJZiBudW1Sb3dzIGlzIGFscmVhZHkgYmVsb3cgMCwgcmV0dXJuIGZhbHNlIGJlY2F1c2UgdGhlbiAwIHdhcyBwYXNzZWQgdG8gbnVtUm93cyBpbml0aWFsbHkuIE90aGVyd2lzZSB3ZSB3b3VsZG50IGNvbWUgaGVyZS5cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHVudGlsOiBmdW5jdGlvbiAoZmlsdGVyRnVuY3Rpb24sIGJJbmNsdWRlU3RvcEVudHJ5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGN0eCA9IHRoaXMuX2N0eDtcbiAgICAgICAgICAgICAgICBmYWtlICYmIGZpbHRlckZ1bmN0aW9uKGdldEluc3RhbmNlVGVtcGxhdGUoY3R4KSk7XG4gICAgICAgICAgICAgICAgYWRkRmlsdGVyKHRoaXMuX2N0eCwgZnVuY3Rpb24gKGN1cnNvciwgYWR2YW5jZSwgcmVzb2x2ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyRnVuY3Rpb24oY3Vyc29yLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZShyZXNvbHZlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiSW5jbHVkZVN0b3BFbnRyeTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBmaXJzdDogZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGltaXQoMSkudG9BcnJheShmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYVswXTtcbiAgICAgICAgICAgICAgICB9KS50aGVuKGNiKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGxhc3Q6IGZ1bmN0aW9uIChjYikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJldmVyc2UoKS5maXJzdChjYik7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uIChmaWx0ZXJGdW5jdGlvbikge1xuICAgICAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImpzRnVuY3Rpb25GaWx0ZXJcIiB0eXBlPVwiRnVuY3Rpb25cIj5mdW5jdGlvbih2YWwpe3JldHVybiB0cnVlL2ZhbHNlfTwvcGFyYW0+XG4gICAgICAgICAgICAgICAgZmFrZSAmJiBmaWx0ZXJGdW5jdGlvbihnZXRJbnN0YW5jZVRlbXBsYXRlKHRoaXMuX2N0eCkpO1xuICAgICAgICAgICAgICAgIGFkZEZpbHRlcih0aGlzLl9jdHgsIGZ1bmN0aW9uIChjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlckZ1bmN0aW9uKGN1cnNvci52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gbWF0Y2ggZmlsdGVycyBub3QgdXNlZCBpbiBEZXhpZS5qcyBidXQgY2FuIGJlIHVzZWQgYnkgM3JkIHBhcnQgbGlicmFyaWVzIHRvIHRlc3QgYVxuICAgICAgICAgICAgICAgIC8vIGNvbGxlY3Rpb24gZm9yIGEgbWF0Y2ggd2l0aG91dCBxdWVyeWluZyBEQi4gVXNlZCBieSBEZXhpZS5PYnNlcnZhYmxlLlxuICAgICAgICAgICAgICAgIGFkZE1hdGNoRmlsdGVyKHRoaXMuX2N0eCwgZmlsdGVyRnVuY3Rpb24pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgYW5kOiBmdW5jdGlvbiAoZmlsdGVyRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXIoZmlsdGVyRnVuY3Rpb24pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgb3I6IGZ1bmN0aW9uIChpbmRleE5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFdoZXJlQ2xhdXNlKHRoaXMuX2N0eC50YWJsZSwgaW5kZXhOYW1lLCB0aGlzKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHJldmVyc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdHguZGlyID0gdGhpcy5fY3R4LmRpciA9PT0gXCJwcmV2XCIgPyBcIm5leHRcIiA6IFwicHJldlwiO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbmRpcmVjdGlvbmNoYW5nZSkgdGhpcy5fb25kaXJlY3Rpb25jaGFuZ2UodGhpcy5fY3R4LmRpcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBkZXNjOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmV2ZXJzZSgpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZWFjaEtleTogZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN0eCA9IHRoaXMuX2N0eDtcbiAgICAgICAgICAgICAgICBjdHgua2V5c09ubHkgPSAhY3R4LmlzTWF0Y2g7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodmFsLCBjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY2IoY3Vyc29yLmtleSwgY3Vyc29yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGVhY2hVbmlxdWVLZXk6IGZ1bmN0aW9uIChjYikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N0eC51bmlxdWUgPSBcInVuaXF1ZVwiO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2hLZXkoY2IpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZWFjaFByaW1hcnlLZXk6IGZ1bmN0aW9uIChjYikge1xuICAgICAgICAgICAgICAgIHZhciBjdHggPSB0aGlzLl9jdHg7XG4gICAgICAgICAgICAgICAgY3R4LmtleXNPbmx5ID0gIWN0eC5pc01hdGNoO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKHZhbCwgY3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNiKGN1cnNvci5wcmltYXJ5S2V5LCBjdXJzb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAga2V5czogZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN0eCA9IHRoaXMuX2N0eDtcbiAgICAgICAgICAgICAgICBjdHgua2V5c09ubHkgPSAhY3R4LmlzTWF0Y2g7XG4gICAgICAgICAgICAgICAgdmFyIGEgPSBbXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uIChpdGVtLCBjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKGN1cnNvci5rZXkpO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgICAgICAgICB9KS50aGVuKGNiKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHByaW1hcnlLZXlzOiBmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3R4ID0gdGhpcy5fY3R4O1xuICAgICAgICAgICAgICAgIGlmIChoYXNHZXRBbGwgJiYgY3R4LmRpciA9PT0gJ25leHQnICYmIGlzUGxhaW5LZXlSYW5nZShjdHgsIHRydWUpICYmIGN0eC5saW1pdCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3BlY2lhbCBvcHRpbWF0aW9uIGlmIHdlIGNvdWxkIHVzZSBJREJPYmplY3RTdG9yZS5nZXRBbGxLZXlzKCkgb3JcbiAgICAgICAgICAgICAgICAgICAgLy8gSURCS2V5UmFuZ2UuZ2V0QWxsS2V5cygpOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVhZChmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBpZGJzdG9yZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlkeE9yU3RvcmUgPSBnZXRJbmRleE9yU3RvcmUoY3R4LCBpZGJzdG9yZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVxID0gY3R4LmxpbWl0IDwgSW5maW5pdHkgPyBpZHhPclN0b3JlLmdldEFsbEtleXMoY3R4LnJhbmdlLCBjdHgubGltaXQpIDogaWR4T3JTdG9yZS5nZXRBbGxLZXlzKGN0eC5yYW5nZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGV2ZW50UmVqZWN0SGFuZGxlcihyZWplY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGV2ZW50U3VjY2Vzc0hhbmRsZXIocmVzb2x2ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oY2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdHgua2V5c09ubHkgPSAhY3R4LmlzTWF0Y2g7XG4gICAgICAgICAgICAgICAgdmFyIGEgPSBbXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uIChpdGVtLCBjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKGN1cnNvci5wcmltYXJ5S2V5KTtcbiAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgICAgICAgICAgfSkudGhlbihjYik7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB1bmlxdWVLZXlzOiBmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdHgudW5pcXVlID0gXCJ1bmlxdWVcIjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5rZXlzKGNiKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGZpcnN0S2V5OiBmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5saW1pdCgxKS5rZXlzKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhWzBdO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oY2IpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbGFzdEtleTogZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmV2ZXJzZSgpLmZpcnN0S2V5KGNiKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGRpc3RpbmN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN0eCA9IHRoaXMuX2N0eCxcbiAgICAgICAgICAgICAgICAgICAgaWR4ID0gY3R4LmluZGV4ICYmIGN0eC50YWJsZS5zY2hlbWEuaWR4QnlOYW1lW2N0eC5pbmRleF07XG4gICAgICAgICAgICAgICAgaWYgKCFpZHggfHwgIWlkeC5tdWx0aSkgcmV0dXJuIHRoaXM7IC8vIGRpc3RpbmN0KCkgb25seSBtYWtlcyBkaWZmZXJlbmNpZXMgb24gbXVsdGlFbnRyeSBpbmRleGVzLlxuICAgICAgICAgICAgICAgIHZhciBzZXQgPSB7fTtcbiAgICAgICAgICAgICAgICBhZGRGaWx0ZXIodGhpcy5fY3R4LCBmdW5jdGlvbiAoY3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHJLZXkgPSBjdXJzb3IucHJpbWFyeUtleS50b1N0cmluZygpOyAvLyBDb252ZXJ0cyBhbnkgRGF0ZSB0byBTdHJpbmcsIFN0cmluZyB0byBTdHJpbmcsIE51bWJlciB0byBTdHJpbmcgYW5kIEFycmF5IHRvIGNvbW1hLXNlcGFyYXRlZCBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZvdW5kID0gaGFzT3duKHNldCwgc3RyS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgc2V0W3N0cktleV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIWZvdW5kO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy9cbiAgICAvL1xuICAgIC8vIFdyaXRlYWJsZUNvbGxlY3Rpb24gQ2xhc3NcbiAgICAvL1xuICAgIC8vXG4gICAgZnVuY3Rpb24gV3JpdGVhYmxlQ29sbGVjdGlvbigpIHtcbiAgICAgICAgQ29sbGVjdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIGRlcml2ZShXcml0ZWFibGVDb2xsZWN0aW9uKS5mcm9tKENvbGxlY3Rpb24pLmV4dGVuZCh7XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV3JpdGVhYmxlQ29sbGVjdGlvbiBQdWJsaWMgTWV0aG9kc1xuICAgICAgICAvL1xuXG4gICAgICAgIG1vZGlmeTogZnVuY3Rpb24gKGNoYW5nZXMpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9jdHgsXG4gICAgICAgICAgICAgICAgaG9vayA9IGN0eC50YWJsZS5ob29rLFxuICAgICAgICAgICAgICAgIHVwZGF0aW5nSG9vayA9IGhvb2sudXBkYXRpbmcuZmlyZSxcbiAgICAgICAgICAgICAgICBkZWxldGluZ0hvb2sgPSBob29rLmRlbGV0aW5nLmZpcmU7XG5cbiAgICAgICAgICAgIGZha2UgJiYgdHlwZW9mIGNoYW5nZXMgPT09ICdmdW5jdGlvbicgJiYgY2hhbmdlcy5jYWxsKHsgdmFsdWU6IGN0eC50YWJsZS5zY2hlbWEuaW5zdGFuY2VUZW1wbGF0ZSB9LCBjdHgudGFibGUuc2NoZW1hLmluc3RhbmNlVGVtcGxhdGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd3JpdGUoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCwgaWRic3RvcmUsIHRyYW5zKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1vZGlmeWVyO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2hhbmdlcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBDaGFuZ2VzIGlzIGEgZnVuY3Rpb24gdGhhdCBtYXkgdXBkYXRlLCBhZGQgb3IgZGVsZXRlIHByb3B0ZXJ0aWVzIG9yIGV2ZW4gcmVxdWlyZSBhIGRlbGV0aW9uIHRoZSBvYmplY3QgaXRzZWxmIChkZWxldGUgdGhpcy5pdGVtKVxuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRpbmdIb29rID09PSBub3AgJiYgZGVsZXRpbmdIb29rID09PSBub3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vb25lIGNhcmVzIGFib3V0IHdoYXQgaXMgYmVpbmcgY2hhbmdlZC4gSnVzdCBsZXQgdGhlIG1vZGlmaWVyIGZ1bmN0aW9uIGJlIHRoZSBnaXZlbiBhcmd1bWVudCBhcyBpcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmeWVyID0gY2hhbmdlcztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBlb3BsZSB3YW50IHRvIGtub3cgZXhhY3RseSB3aGF0IGlzIGJlaW5nIG1vZGlmaWVkIG9yIGRlbGV0ZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBMZXQgbW9kaWZ5ZXIgYmUgYSBwcm94eSBmdW5jdGlvbiB0aGF0IGZpbmRzIG91dCB3aGF0IGNoYW5nZXMgdGhlIGNhbGxlciBpcyBhY3R1YWxseSBkb2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYW5kIGNhbGwgdGhlIGhvb2tzIGFjY29yZGluZ2x5IVxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZ5ZXIgPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmlnSXRlbSA9IGRlZXBDbG9uZShpdGVtKTsgLy8gQ2xvbmUgdGhlIGl0ZW0gZmlyc3Qgc28gd2UgY2FuIGNvbXBhcmUgbGF0ZXJzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGFuZ2VzLmNhbGwodGhpcywgaXRlbSwgdGhpcykgPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7IC8vIENhbGwgdGhlIHJlYWwgbW9kaWZ5ZXIgZnVuY3Rpb24gKElmIGl0IHJldHVybnMgZmFsc2UgZXhwbGljaXRlbHksIGl0IG1lYW5zIGl0IGRvbnQgd2FudCB0byBtb2RpZnkgYW55dGluZyBvbiB0aGlzIG9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWhhc093bih0aGlzLCBcInZhbHVlXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSByZWFsIG1vZGlmeWVyIGZ1bmN0aW9uIHJlcXVlc3RzIGEgZGVsZXRpb24gb2YgdGhlIG9iamVjdC4gSW5mb3JtIHRoZSBkZWxldGluZ0hvb2sgdGhhdCBhIGRlbGV0aW9uIGlzIHRha2luZyBwbGFjZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRpbmdIb29rLmNhbGwodGhpcywgdGhpcy5wcmltS2V5LCBpdGVtLCB0cmFucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm8gZGVsZXRpb24uIENoZWNrIHdoYXQgd2FzIGNoYW5nZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9iamVjdERpZmYgPSBnZXRPYmplY3REaWZmKG9yaWdJdGVtLCB0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFkZGl0aW9uYWxDaGFuZ2VzID0gdXBkYXRpbmdIb29rLmNhbGwodGhpcywgb2JqZWN0RGlmZiwgdGhpcy5wcmltS2V5LCBvcmlnSXRlbSwgdHJhbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWRkaXRpb25hbENoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhvb2sgd2FudCB0byBhcHBseSBhZGRpdGlvbmFsIG1vZGlmaWNhdGlvbnMuIE1ha2Ugc3VyZSB0byBmdWxsZmlsbCB0aGUgd2lsbCBvZiB0aGUgaG9vay5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0gPSB0aGlzLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5cyhhZGRpdGlvbmFsQ2hhbmdlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5UGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEJ5S2V5UGF0aChpdGVtLCBrZXlQYXRoLCBhZGRpdGlvbmFsQ2hhbmdlc1trZXlQYXRoXSk7IC8vIEFkZGluZyB7a2V5UGF0aDogdW5kZWZpbmVkfSBtZWFucyB0aGF0IHRoZSBrZXlQYXRoIHNob3VsZCBiZSBkZWxldGVkLiBIYW5kbGVkIGJ5IHNldEJ5S2V5UGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGluZ0hvb2sgPT09IG5vcCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2VzIGlzIGEgc2V0IG9mIHtrZXlQYXRoOiB2YWx1ZX0gYW5kIG5vIG9uZSBpcyBsaXN0ZW5pbmcgdG8gdGhlIHVwZGF0aW5nIGhvb2suXG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXlQYXRocyA9IGtleXMoY2hhbmdlcyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBudW1LZXlzID0ga2V5UGF0aHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBtb2RpZnllciA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYW55dGhpbmdNb2RpZmllZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1LZXlzOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5UGF0aCA9IGtleVBhdGhzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWwgPSBjaGFuZ2VzW2tleVBhdGhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChnZXRCeUtleVBhdGgoaXRlbSwga2V5UGF0aCkgIT09IHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRCeUtleVBhdGgoaXRlbSwga2V5UGF0aCwgdmFsKTsgLy8gQWRkaW5nIHtrZXlQYXRoOiB1bmRlZmluZWR9IG1lYW5zIHRoYXQgdGhlIGtleVBhdGggc2hvdWxkIGJlIGRlbGV0ZWQuIEhhbmRsZWQgYnkgc2V0QnlLZXlQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFueXRoaW5nTW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhbnl0aGluZ01vZGlmaWVkO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZXMgaXMgYSBzZXQgb2Yge2tleVBhdGg6IHZhbHVlfSBhbmQgcGVvcGxlIGFyZSBsaXN0ZW5pbmcgdG8gdGhlIHVwZGF0aW5nIGhvb2sgc28gd2UgbmVlZCB0byBjYWxsIGl0IGFuZFxuICAgICAgICAgICAgICAgICAgICAvLyBhbGxvdyBpdCB0byBhZGQgYWRkaXRpb25hbCBtb2RpZmljYXRpb25zIHRvIG1ha2UuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcmlnQ2hhbmdlcyA9IGNoYW5nZXM7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZXMgPSBzaGFsbG93Q2xvbmUob3JpZ0NoYW5nZXMpOyAvLyBMZXQncyB3b3JrIHdpdGggYSBjbG9uZSBvZiB0aGUgY2hhbmdlcyBrZXlQYXRoL3ZhbHVlIHNldCBzbyB0aGF0IHdlIGNhbiByZXN0b3JlIGl0IGluIGNhc2UgYSBob29rIGV4dGVuZHMgaXQuXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmeWVyID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbnl0aGluZ01vZGlmaWVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWRkaXRpb25hbENoYW5nZXMgPSB1cGRhdGluZ0hvb2suY2FsbCh0aGlzLCBjaGFuZ2VzLCB0aGlzLnByaW1LZXksIGRlZXBDbG9uZShpdGVtKSwgdHJhbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFkZGl0aW9uYWxDaGFuZ2VzKSBleHRlbmQoY2hhbmdlcywgYWRkaXRpb25hbENoYW5nZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5cyhjaGFuZ2VzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXlQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IGNoYW5nZXNba2V5UGF0aF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdldEJ5S2V5UGF0aChpdGVtLCBrZXlQYXRoKSAhPT0gdmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEJ5S2V5UGF0aChpdGVtLCBrZXlQYXRoLCB2YWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnl0aGluZ01vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhZGRpdGlvbmFsQ2hhbmdlcykgY2hhbmdlcyA9IHNoYWxsb3dDbG9uZShvcmlnQ2hhbmdlcyk7IC8vIFJlc3RvcmUgb3JpZ2luYWwgY2hhbmdlcyBmb3IgbmV4dCBpdGVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhbnl0aGluZ01vZGlmaWVkO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHN1Y2Nlc3NDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZXJhdGlvbkNvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIGZhaWx1cmVzID0gW107XG4gICAgICAgICAgICAgICAgdmFyIGZhaWxLZXlzID0gW107XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRLZXkgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gbW9kaWZ5SXRlbShpdGVtLCBjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEtleSA9IGN1cnNvci5wcmltYXJ5S2V5O1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc0NvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltS2V5OiBjdXJzb3IucHJpbWFyeUtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWNjZXNzOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25lcnJvcjogbnVsbFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uZXJyb3IoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbHVyZXMucHVzaChlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxLZXlzLnB1c2godGhpc0NvbnRleHQucHJpbUtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja0ZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gQ2F0Y2ggdGhlc2UgZXJyb3JzIGFuZCBsZXQgYSBmaW5hbCByZWplY3Rpb24gZGVjaWRlIHdoZXRoZXIgb3Igbm90IHRvIGFib3J0IGVudGlyZSB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGlmeWVyLmNhbGwodGhpc0NvbnRleHQsIGl0ZW0sIHRoaXNDb250ZXh0KSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGEgY2FsbGJhY2sgZXhwbGljaXRlbHkgcmV0dXJucyBmYWxzZSwgZG8gbm90IHBlcmZvcm0gdGhlIHVwZGF0ZSFcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBiRGVsZXRlID0gIWhhc093bih0aGlzQ29udGV4dCwgXCJ2YWx1ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICsrY291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnlDYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlcSA9IGJEZWxldGUgPyBjdXJzb3IuZGVsZXRlKCkgOiBjdXJzb3IudXBkYXRlKHRoaXNDb250ZXh0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXEuX2hvb2tDdHggPSB0aGlzQ29udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGhvb2tlZEV2ZW50UmVqZWN0SGFuZGxlcihvbmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gaG9va2VkRXZlbnRTdWNjZXNzSGFuZGxlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsrc3VjY2Vzc0NvdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja0ZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBvbmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzQ29udGV4dC5vbnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhvb2sgd2lsbCBleHBlY3QgZWl0aGVyIG9uZXJyb3Igb3Igb25zdWNjZXNzIHRvIGFsd2F5cyBiZSBjYWxsZWQhXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzQ29udGV4dC5vbnN1Y2Nlc3ModGhpc0NvbnRleHQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZG9SZWplY3QoZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbHVyZXMucHVzaChlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxLZXlzLnB1c2goY3VycmVudEtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgTW9kaWZ5RXJyb3IoXCJFcnJvciBtb2RpZnlpbmcgb25lIG9yIG1vcmUgb2JqZWN0c1wiLCBmYWlsdXJlcywgc3VjY2Vzc0NvdW50LCBmYWlsS2V5cykpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNoZWNrRmluaXNoZWQoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVyYXRpb25Db21wbGV0ZSAmJiBzdWNjZXNzQ291bnQgKyBmYWlsdXJlcy5sZW5ndGggPT09IGNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmFpbHVyZXMubGVuZ3RoID4gMCkgZG9SZWplY3QoKTtlbHNlIHJlc29sdmUoc3VjY2Vzc0NvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLmNsb25lKCkucmF3KCkuX2l0ZXJhdGUobW9kaWZ5SXRlbSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVyYXRpb25Db21wbGV0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICB9LCBkb1JlamVjdCwgaWRic3RvcmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY3R4ID0gdGhpcy5fY3R4LFxuICAgICAgICAgICAgICAgIHJhbmdlID0gY3R4LnJhbmdlLFxuICAgICAgICAgICAgICAgIGRlbGV0aW5nSG9vayA9IGN0eC50YWJsZS5ob29rLmRlbGV0aW5nLmZpcmUsXG4gICAgICAgICAgICAgICAgaGFzRGVsZXRlSG9vayA9IGRlbGV0aW5nSG9vayAhPT0gbm9wO1xuICAgICAgICAgICAgaWYgKCFoYXNEZWxldGVIb29rICYmIGlzUGxhaW5LZXlSYW5nZShjdHgpICYmIChjdHguaXNQcmltS2V5ICYmICFoYW5nc09uRGVsZXRlTGFyZ2VLZXlSYW5nZSB8fCAhcmFuZ2UpKSAvLyBpZiBubyByYW5nZSwgd2UnbGwgdXNlIGNsZWFyKCkuXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBNYXkgdXNlIElEQk9iamVjdFN0b3JlLmRlbGV0ZShJREJLZXlSYW5nZSkgaW4gdGhpcyBjYXNlIChJc3N1ZSAjMjA4KVxuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgY2hyb21pdW0sIHRoaXMgaXMgdGhlIHdheSBtb3N0IG9wdGltaXplZCB2ZXJzaW9uLlxuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgSUUvRWRnZSwgdGhpcyBjb3VsZCBoYW5nIHRoZSBpbmRleGVkREIgZW5naW5lIGFuZCBtYWtlIG9wZXJhdGluZyBzeXN0ZW0gaW5zdGFibGVcbiAgICAgICAgICAgICAgICAgICAgLy8gKGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2RmYWhsYW5kZXIvNWEzOTMyOGYwMjlkZTE4MjIyY2YyMTI1ZDU2YzM4ZjcpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl93cml0ZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBpZGJzdG9yZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3VyIEFQSSBjb250cmFjdCBpcyB0byByZXR1cm4gYSBjb3VudCBvZiBkZWxldGVkIGl0ZW1zLCBzbyB3ZSBoYXZlIHRvIGNvdW50KCkgYmVmb3JlIGRlbGV0ZSgpLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9uZXJyb3IgPSBldmVudFJlamVjdEhhbmRsZXIocmVqZWN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudFJlcSA9IHJhbmdlID8gaWRic3RvcmUuY291bnQocmFuZ2UpIDogaWRic3RvcmUuY291bnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50UmVxLm9uZXJyb3IgPSBvbmVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRSZXEub25zdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IGNvdW50UmVxLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnlDYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZWxSZXEgPSByYW5nZSA/IGlkYnN0b3JlLmRlbGV0ZShyYW5nZSkgOiBpZGJzdG9yZS5jbGVhcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxSZXEub25lcnJvciA9IG9uZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbFJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShjb3VudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERlZmF1bHQgdmVyc2lvbiB0byB1c2Ugd2hlbiBjb2xsZWN0aW9uIGlzIG5vdCBhIHZhbmlsbGEgSURCS2V5UmFuZ2Ugb24gdGhlIHByaW1hcnkga2V5LlxuICAgICAgICAgICAgLy8gRGl2aWRlIGludG8gY2h1bmtzIHRvIG5vdCBzdGFydmUgUkFNLlxuICAgICAgICAgICAgLy8gSWYgaGFzIGRlbGV0ZSBob29rLCB3ZSB3aWxsIGhhdmUgdG8gY29sbGVjdCBub3QganVzdCBrZXlzIGJ1dCBhbHNvIG9iamVjdHMsIHNvIGl0IHdpbGwgdXNlXG4gICAgICAgICAgICAvLyBtb3JlIG1lbW9yeSBhbmQgbmVlZCBsb3dlciBjaHVuayBzaXplLlxuICAgICAgICAgICAgdmFyIENIVU5LU0laRSA9IGhhc0RlbGV0ZUhvb2sgPyAyMDAwIDogMTAwMDA7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93cml0ZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBpZGJzdG9yZSwgdHJhbnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG90YWxDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgLy8gQ2xvbmUgY29sbGVjdGlvbiBhbmQgY2hhbmdlIGl0cyB0YWJsZSBhbmQgc2V0IGEgbGltaXQgb2YgQ0hVTktTSVpFIG9uIHRoZSBjbG9uZWQgQ29sbGVjdGlvbiBpbnN0YW5jZS5cbiAgICAgICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IF90aGlzNC5jbG9uZSh7XG4gICAgICAgICAgICAgICAgICAgIGtleXNPbmx5OiAhY3R4LmlzTWF0Y2ggJiYgIWhhc0RlbGV0ZUhvb2sgfSkgLy8gbG9hZCBqdXN0IGtleXMgKHVubGVzcyBmaWx0ZXIoKSBvciBhbmQoKSBvciBkZWxldGVIb29rIGhhcyBzdWJzY3JpYmVycylcbiAgICAgICAgICAgICAgICAuZGlzdGluY3QoKSAvLyBJbiBjYXNlIG11bHRpRW50cnkgaXMgdXNlZCwgbmV2ZXIgZGVsZXRlIHNhbWUga2V5IHR3aWNlIGJlY2F1c2UgcmVzdWx0aW5nIGNvdW50XG4gICAgICAgICAgICAgICAgLy8gd291bGQgYmVjb21lIGxhcmdlciB0aGFuIGFjdHVhbCBkZWxldGUgY291bnQuXG4gICAgICAgICAgICAgICAgLmxpbWl0KENIVU5LU0laRSkucmF3KCk7IC8vIERvbid0IGZpbHRlciB0aHJvdWdoIHJlYWRpbmctaG9va3MgKGxpa2UgbWFwcGVkIGNsYXNzZXMgZXRjKVxuXG4gICAgICAgICAgICAgICAgdmFyIGtleXNPclR1cGxlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgLy8gV2UncmUgZ29ubmEgZG8gdGhpbmdzIG9uIGFzIG1hbnkgY2h1bmtzIHRoYXQgYXJlIG5lZWRlZC5cbiAgICAgICAgICAgICAgICAvLyBVc2UgcmVjdXJzaW9uIG9mIG5leHRDaHVuayBmdW5jdGlvbjpcbiAgICAgICAgICAgICAgICB2YXIgbmV4dENodW5rID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5lYWNoKGhhc0RlbGV0ZUhvb2sgPyBmdW5jdGlvbiAodmFsLCBjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvbWVib2R5IHN1YnNjcmliZXMgdG8gaG9vaygnZGVsZXRpbmcnKS4gQ29sbGVjdCBhbGwgcHJpbWFyeSBrZXlzIGFuZCB0aGVpciB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyB0aGF0IHRoZSBob29rIGNhbiBiZSBjYWxsZWQgd2l0aCBpdHMgdmFsdWVzIGluIGJ1bGtEZWxldGUoKS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGtleXNPclR1cGxlcy5wdXNoKFtjdXJzb3IucHJpbWFyeUtleSwgY3Vyc29yLnZhbHVlXSk7XG4gICAgICAgICAgICAgICAgICAgIH0gOiBmdW5jdGlvbiAodmFsLCBjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vIG9uZSBzdWJzY3JpYmVzIHRvIGhvb2soJ2RlbGV0aW5nJykuIENvbGxlY3Qgb25seSBwcmltYXJ5IGtleXM6XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzT3JUdXBsZXMucHVzaChjdXJzb3IucHJpbWFyeUtleSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21pdW0gZGVsZXRlcyBmYXN0ZXIgd2hlbiBkb2luZyBpdCBpbiBzb3J0IG9yZGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzRGVsZXRlSG9vayA/IGtleXNPclR1cGxlcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzY2VuZGluZyhhWzBdLCBiWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pIDoga2V5c09yVHVwbGVzLnNvcnQoYXNjZW5kaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBidWxrRGVsZXRlKGlkYnN0b3JlLCB0cmFucywga2V5c09yVHVwbGVzLCBoYXNEZWxldGVIb29rLCBkZWxldGluZ0hvb2spO1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IGtleXNPclR1cGxlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbENvdW50ICs9IGNvdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5c09yVHVwbGVzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY291bnQgPCBDSFVOS1NJWkUgPyB0b3RhbENvdW50IDogbmV4dENodW5rKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKG5leHRDaHVuaygpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEhlbHAgZnVuY3Rpb25zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuXG4gICAgZnVuY3Rpb24gbG93ZXJWZXJzaW9uRmlyc3QoYSwgYikge1xuICAgICAgICByZXR1cm4gYS5fY2ZnLnZlcnNpb24gLSBiLl9jZmcudmVyc2lvbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRBcGlPblBsYWNlKG9ianMsIHRhYmxlTmFtZXMsIG1vZGUsIGRic2NoZW1hKSB7XG4gICAgICAgIHRhYmxlTmFtZXMuZm9yRWFjaChmdW5jdGlvbiAodGFibGVOYW1lKSB7XG4gICAgICAgICAgICB2YXIgdGFibGVJbnN0YW5jZSA9IGRiLl90YWJsZUZhY3RvcnkobW9kZSwgZGJzY2hlbWFbdGFibGVOYW1lXSk7XG4gICAgICAgICAgICBvYmpzLmZvckVhY2goZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgICAgIHRhYmxlTmFtZSBpbiBvYmogfHwgKG9ialt0YWJsZU5hbWVdID0gdGFibGVJbnN0YW5jZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlVGFibGVzQXBpKG9ianMpIHtcbiAgICAgICAgb2Jqcy5mb3JFYWNoKGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqW2tleV0gaW5zdGFuY2VvZiBUYWJsZSkgZGVsZXRlIG9ialtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpdGVyYXRlKHJlcSwgZmlsdGVyLCBmbiwgcmVzb2x2ZSwgcmVqZWN0LCB2YWx1ZU1hcHBlcikge1xuXG4gICAgICAgIC8vIEFwcGx5IHZhbHVlTWFwcGVyIChob29rKCdyZWFkaW5nJykgb3IgbWFwcHBlZCBjbGFzcylcbiAgICAgICAgdmFyIG1hcHBlZEZuID0gdmFsdWVNYXBwZXIgPyBmdW5jdGlvbiAoeCwgYywgYSkge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHZhbHVlTWFwcGVyKHgpLCBjLCBhKTtcbiAgICAgICAgfSA6IGZuO1xuICAgICAgICAvLyBXcmFwIGZuIHdpdGggUFNEIGFuZCBtaWNyb3RpY2sgc3R1ZmYgZnJvbSBQcm9taXNlLlxuICAgICAgICB2YXIgd3JhcHBlZEZuID0gd3JhcChtYXBwZWRGbiwgcmVqZWN0KTtcblxuICAgICAgICBpZiAoIXJlcS5vbmVycm9yKSByZXEub25lcnJvciA9IGV2ZW50UmVqZWN0SGFuZGxlcihyZWplY3QpO1xuICAgICAgICBpZiAoZmlsdGVyKSB7XG4gICAgICAgICAgICByZXEub25zdWNjZXNzID0gdHJ5Y2F0Y2hlcihmdW5jdGlvbiBmaWx0ZXJfcmVjb3JkKCkge1xuICAgICAgICAgICAgICAgIHZhciBjdXJzb3IgPSByZXEucmVzdWx0O1xuICAgICAgICAgICAgICAgIGlmIChjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlcihjdXJzb3IsIGZ1bmN0aW9uIChhZHZhbmNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IGFkdmFuY2VyO1xuICAgICAgICAgICAgICAgICAgICB9LCByZXNvbHZlLCByZWplY3QpKSB3cmFwcGVkRm4oY3Vyc29yLnZhbHVlLCBjdXJzb3IsIGZ1bmN0aW9uIChhZHZhbmNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IGFkdmFuY2VyO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IHRyeWNhdGNoZXIoZnVuY3Rpb24gZmlsdGVyX3JlY29yZCgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3Vyc29yID0gcmVxLnJlc3VsdDtcbiAgICAgICAgICAgICAgICBpZiAoY3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZWRGbihjdXJzb3IudmFsdWUsIGN1cnNvciwgZnVuY3Rpb24gKGFkdmFuY2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gYWR2YW5jZXI7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUluZGV4U3ludGF4KGluZGV4ZXMpIHtcbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiaW5kZXhlc1wiIHR5cGU9XCJTdHJpbmdcIj48L3BhcmFtPlxuICAgICAgICAvLy8gPHJldHVybnMgdHlwZT1cIkFycmF5XCIgZWxlbWVudFR5cGU9XCJJbmRleFNwZWNcIj48L3JldHVybnM+XG4gICAgICAgIHZhciBydiA9IFtdO1xuICAgICAgICBpbmRleGVzLnNwbGl0KCcsJykuZm9yRWFjaChmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIGluZGV4ID0gaW5kZXgudHJpbSgpO1xuICAgICAgICAgICAgdmFyIG5hbWUgPSBpbmRleC5yZXBsYWNlKC8oWyYqXXxcXCtcXCspL2csIFwiXCIpOyAvLyBSZW1vdmUgXCImXCIsIFwiKytcIiBhbmQgXCIqXCJcbiAgICAgICAgICAgIC8vIExldCBrZXlQYXRoIG9mIFwiW2ErYl1cIiBiZSBbXCJhXCIsXCJiXCJdOlxuICAgICAgICAgICAgdmFyIGtleVBhdGggPSAvXlxcWy8udGVzdChuYW1lKSA/IG5hbWUubWF0Y2goL15cXFsoLiopXFxdJC8pWzFdLnNwbGl0KCcrJykgOiBuYW1lO1xuXG4gICAgICAgICAgICBydi5wdXNoKG5ldyBJbmRleFNwZWMobmFtZSwga2V5UGF0aCB8fCBudWxsLCAvXFwmLy50ZXN0KGluZGV4KSwgL1xcKi8udGVzdChpbmRleCksIC9cXCtcXCsvLnRlc3QoaW5kZXgpLCBpc0FycmF5KGtleVBhdGgpLCAvXFwuLy50ZXN0KGluZGV4KSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJ2O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNtcChrZXkxLCBrZXkyKSB7XG4gICAgICAgIHJldHVybiBpbmRleGVkREIuY21wKGtleTEsIGtleTIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1pbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBjbXAoYSwgYikgPCAwID8gYSA6IGI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWF4KGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGNtcChhLCBiKSA+IDAgPyBhIDogYjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICAgICAgICByZXR1cm4gaW5kZXhlZERCLmNtcChhLCBiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZXNjZW5kaW5nKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGluZGV4ZWREQi5jbXAoYiwgYSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2ltcGxlQ29tcGFyZShhLCBiKSB7XG4gICAgICAgIHJldHVybiBhIDwgYiA/IC0xIDogYSA9PT0gYiA/IDAgOiAxO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNpbXBsZUNvbXBhcmVSZXZlcnNlKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEgPiBiID8gLTEgOiBhID09PSBiID8gMCA6IDE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tYmluZShmaWx0ZXIxLCBmaWx0ZXIyKSB7XG4gICAgICAgIHJldHVybiBmaWx0ZXIxID8gZmlsdGVyMiA/IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXIxLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgJiYgZmlsdGVyMi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IDogZmlsdGVyMSA6IGZpbHRlcjI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZEdsb2JhbFNjaGVtYSgpIHtcbiAgICAgICAgZGIudmVybm8gPSBpZGJkYi52ZXJzaW9uIC8gMTA7XG4gICAgICAgIGRiLl9kYlNjaGVtYSA9IGdsb2JhbFNjaGVtYSA9IHt9O1xuICAgICAgICBkYlN0b3JlTmFtZXMgPSBzbGljZShpZGJkYi5vYmplY3RTdG9yZU5hbWVzLCAwKTtcbiAgICAgICAgaWYgKGRiU3RvcmVOYW1lcy5sZW5ndGggPT09IDApIHJldHVybjsgLy8gRGF0YWJhc2UgY29udGFpbnMgbm8gc3RvcmVzLlxuICAgICAgICB2YXIgdHJhbnMgPSBpZGJkYi50cmFuc2FjdGlvbihzYWZhcmlNdWx0aVN0b3JlRml4KGRiU3RvcmVOYW1lcyksICdyZWFkb25seScpO1xuICAgICAgICBkYlN0b3JlTmFtZXMuZm9yRWFjaChmdW5jdGlvbiAoc3RvcmVOYW1lKSB7XG4gICAgICAgICAgICB2YXIgc3RvcmUgPSB0cmFucy5vYmplY3RTdG9yZShzdG9yZU5hbWUpLFxuICAgICAgICAgICAgICAgIGtleVBhdGggPSBzdG9yZS5rZXlQYXRoLFxuICAgICAgICAgICAgICAgIGRvdHRlZCA9IGtleVBhdGggJiYgdHlwZW9mIGtleVBhdGggPT09ICdzdHJpbmcnICYmIGtleVBhdGguaW5kZXhPZignLicpICE9PSAtMTtcbiAgICAgICAgICAgIHZhciBwcmltS2V5ID0gbmV3IEluZGV4U3BlYyhrZXlQYXRoLCBrZXlQYXRoIHx8IFwiXCIsIGZhbHNlLCBmYWxzZSwgISFzdG9yZS5hdXRvSW5jcmVtZW50LCBrZXlQYXRoICYmIHR5cGVvZiBrZXlQYXRoICE9PSAnc3RyaW5nJywgZG90dGVkKTtcbiAgICAgICAgICAgIHZhciBpbmRleGVzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN0b3JlLmluZGV4TmFtZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgICAgICB2YXIgaWRiaW5kZXggPSBzdG9yZS5pbmRleChzdG9yZS5pbmRleE5hbWVzW2pdKTtcbiAgICAgICAgICAgICAgICBrZXlQYXRoID0gaWRiaW5kZXgua2V5UGF0aDtcbiAgICAgICAgICAgICAgICBkb3R0ZWQgPSBrZXlQYXRoICYmIHR5cGVvZiBrZXlQYXRoID09PSAnc3RyaW5nJyAmJiBrZXlQYXRoLmluZGV4T2YoJy4nKSAhPT0gLTE7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gbmV3IEluZGV4U3BlYyhpZGJpbmRleC5uYW1lLCBrZXlQYXRoLCAhIWlkYmluZGV4LnVuaXF1ZSwgISFpZGJpbmRleC5tdWx0aUVudHJ5LCBmYWxzZSwga2V5UGF0aCAmJiB0eXBlb2Yga2V5UGF0aCAhPT0gJ3N0cmluZycsIGRvdHRlZCk7XG4gICAgICAgICAgICAgICAgaW5kZXhlcy5wdXNoKGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdsb2JhbFNjaGVtYVtzdG9yZU5hbWVdID0gbmV3IFRhYmxlU2NoZW1hKHN0b3JlTmFtZSwgcHJpbUtleSwgaW5kZXhlcywge30pO1xuICAgICAgICB9KTtcbiAgICAgICAgc2V0QXBpT25QbGFjZShbYWxsVGFibGVzLCBUcmFuc2FjdGlvbi5wcm90b3R5cGVdLCBrZXlzKGdsb2JhbFNjaGVtYSksIFJFQURXUklURSwgZ2xvYmFsU2NoZW1hKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGp1c3RUb0V4aXN0aW5nSW5kZXhOYW1lcyhzY2hlbWEsIGlkYnRyYW5zKSB7XG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIElzc3VlICMzMCBQcm9ibGVtIHdpdGggZXhpc3RpbmcgZGIgLSBhZGp1c3QgdG8gZXhpc3RpbmcgaW5kZXggbmFtZXMgd2hlbiBtaWdyYXRpbmcgZnJvbSBub24tZGV4aWUgZGJcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic2NoZW1hXCIgdHlwZT1cIk9iamVjdFwiPk1hcCBiZXR3ZWVuIG5hbWUgYW5kIFRhYmxlU2NoZW1hPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiaWRidHJhbnNcIiB0eXBlPVwiSURCVHJhbnNhY3Rpb25cIj48L3BhcmFtPlxuICAgICAgICB2YXIgc3RvcmVOYW1lcyA9IGlkYnRyYW5zLmRiLm9iamVjdFN0b3JlTmFtZXM7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RvcmVOYW1lcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIHN0b3JlTmFtZSA9IHN0b3JlTmFtZXNbaV07XG4gICAgICAgICAgICB2YXIgc3RvcmUgPSBpZGJ0cmFucy5vYmplY3RTdG9yZShzdG9yZU5hbWUpO1xuICAgICAgICAgICAgaGFzR2V0QWxsID0gJ2dldEFsbCcgaW4gc3RvcmU7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN0b3JlLmluZGV4TmFtZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXhOYW1lID0gc3RvcmUuaW5kZXhOYW1lc1tqXTtcbiAgICAgICAgICAgICAgICB2YXIga2V5UGF0aCA9IHN0b3JlLmluZGV4KGluZGV4TmFtZSkua2V5UGF0aDtcbiAgICAgICAgICAgICAgICB2YXIgZGV4aWVOYW1lID0gdHlwZW9mIGtleVBhdGggPT09ICdzdHJpbmcnID8ga2V5UGF0aCA6IFwiW1wiICsgc2xpY2Uoa2V5UGF0aCkuam9pbignKycpICsgXCJdXCI7XG4gICAgICAgICAgICAgICAgaWYgKHNjaGVtYVtzdG9yZU5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleFNwZWMgPSBzY2hlbWFbc3RvcmVOYW1lXS5pZHhCeU5hbWVbZGV4aWVOYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4U3BlYykgaW5kZXhTcGVjLm5hbWUgPSBpbmRleE5hbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmlyZU9uQmxvY2tlZChldikge1xuICAgICAgICBkYi5vbihcImJsb2NrZWRcIikuZmlyZShldik7XG4gICAgICAgIC8vIFdvcmthcm91bmQgKG5vdCBmdWxseSopIGZvciBtaXNzaW5nIFwidmVyc2lvbmNoYW5nZVwiIGV2ZW50IGluIElFLEVkZ2UgYW5kIFNhZmFyaTpcbiAgICAgICAgY29ubmVjdGlvbnMuZmlsdGVyKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICByZXR1cm4gYy5uYW1lID09PSBkYi5uYW1lICYmIGMgIT09IGRiICYmICFjLl92Y0ZpcmVkO1xuICAgICAgICB9KS5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgIHJldHVybiBjLm9uKFwidmVyc2lvbmNoYW5nZVwiKS5maXJlKGV2KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZXh0ZW5kKHRoaXMsIHtcbiAgICAgICAgQ29sbGVjdGlvbjogQ29sbGVjdGlvbixcbiAgICAgICAgVGFibGU6IFRhYmxlLFxuICAgICAgICBUcmFuc2FjdGlvbjogVHJhbnNhY3Rpb24sXG4gICAgICAgIFZlcnNpb246IFZlcnNpb24sXG4gICAgICAgIFdoZXJlQ2xhdXNlOiBXaGVyZUNsYXVzZSxcbiAgICAgICAgV3JpdGVhYmxlQ29sbGVjdGlvbjogV3JpdGVhYmxlQ29sbGVjdGlvbixcbiAgICAgICAgV3JpdGVhYmxlVGFibGU6IFdyaXRlYWJsZVRhYmxlXG4gICAgfSk7XG5cbiAgICBpbml0KCk7XG5cbiAgICBhZGRvbnMuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgZm4oZGIpO1xuICAgIH0pO1xufVxuXG52YXIgZmFrZUF1dG9Db21wbGV0ZSA9IGZ1bmN0aW9uICgpIHt9OyAvLyBXaWxsIG5ldmVyIGJlIGNoYW5nZWQuIFdlIGp1c3QgZmFrZSBmb3IgdGhlIElERSB0aGF0IHdlIGNoYW5nZSBpdCAoc2VlIGRvRmFrZUF1dG9Db21wbGV0ZSgpKVxudmFyIGZha2UgPSBmYWxzZTsgLy8gV2lsbCBuZXZlciBiZSBjaGFuZ2VkLiBXZSBqdXN0IGZha2UgZm9yIHRoZSBJREUgdGhhdCB3ZSBjaGFuZ2UgaXQgKHNlZSBkb0Zha2VBdXRvQ29tcGxldGUoKSlcblxuZnVuY3Rpb24gcGFyc2VUeXBlKHR5cGUpIHtcbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0eXBlKCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHR5cGUpKSB7XG4gICAgICAgIHJldHVybiBbcGFyc2VUeXBlKHR5cGVbMF0pXTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgJiYgdHlwZW9mIHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHZhciBydiA9IHt9O1xuICAgICAgICBhcHBseVN0cnVjdHVyZShydiwgdHlwZSk7XG4gICAgICAgIHJldHVybiBydjtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5U3RydWN0dXJlKG9iaiwgc3RydWN0dXJlKSB7XG4gICAga2V5cyhzdHJ1Y3R1cmUpLmZvckVhY2goZnVuY3Rpb24gKG1lbWJlcikge1xuICAgICAgICB2YXIgdmFsdWUgPSBwYXJzZVR5cGUoc3RydWN0dXJlW21lbWJlcl0pO1xuICAgICAgICBvYmpbbWVtYmVyXSA9IHZhbHVlO1xuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIGV2ZW50U3VjY2Vzc0hhbmRsZXIoZG9uZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgZG9uZShldi50YXJnZXQucmVzdWx0KTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBob29rZWRFdmVudFN1Y2Nlc3NIYW5kbGVyKHJlc29sdmUpIHtcbiAgICAvLyB3cmFwKCkgaXMgbmVlZGVkIHdoZW4gY2FsbGluZyBob29rcyBiZWNhdXNlIHRoZSByYXJlIHNjZW5hcmlvIG9mOlxuICAgIC8vICAqIGhvb2sgZG9lcyBhIGRiIG9wZXJhdGlvbiB0aGF0IGZhaWxzIGltbWVkaWF0ZWx5IChJREIgdGhyb3dzIGV4Y2VwdGlvbilcbiAgICAvLyAgICBGb3IgY2FsbGluZyBkYiBvcGVyYXRpb25zIG9uIGNvcnJlY3QgdHJhbnNhY3Rpb24sIHdyYXAgbWFrZXMgc3VyZSB0byBzZXQgUFNEIGNvcnJlY3RseS5cbiAgICAvLyAgICB3cmFwKCkgd2lsbCBhbHNvIGV4ZWN1dGUgaW4gYSB2aXJ0dWFsIHRpY2suXG4gICAgLy8gICogSWYgbm90IHdyYXBwZWQgaW4gYSB2aXJ0dWFsIHRpY2ssIGRpcmVjdCBleGNlcHRpb24gd2lsbCBsYXVuY2ggYSBuZXcgcGh5c2ljYWwgdGljay5cbiAgICAvLyAgKiBJZiB0aGlzIHdhcyB0aGUgbGFzdCBldmVudCBpbiB0aGUgYnVsaywgdGhlIHByb21pc2Ugd2lsbCByZXNvbHZlIGFmdGVyIGEgcGh5c2ljYWwgdGlja1xuICAgIC8vICAgIGFuZCB0aGUgdHJhbnNhY3Rpb24gd2lsbCBoYXZlIGNvbW1pdHRlZCBhbHJlYWR5LlxuICAgIC8vIElmIG5vIGhvb2ssIHRoZSB2aXJ0dWFsIHRpY2sgd2lsbCBiZSBleGVjdXRlZCBpbiB0aGUgcmVqZWN0KCkvcmVzb2x2ZSBvZiB0aGUgZmluYWwgcHJvbWlzZSxcbiAgICAvLyBiZWNhdXNlIGl0IGlzIGFsd2F5cyBtYXJrZWQgd2l0aCBfbGliID0gdHJ1ZSB3aGVuIGNyZWF0ZWQgdXNpbmcgVHJhbnNhY3Rpb24uX3Byb21pc2UoKS5cbiAgICByZXR1cm4gd3JhcChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIHJlcSA9IGV2ZW50LnRhcmdldCxcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlcS5yZXN1bHQsXG4gICAgICAgICAgICBjdHggPSByZXEuX2hvb2tDdHgsXG4gICAgICAgICAgICAvLyBDb250YWlucyB0aGUgaG9vayBlcnJvciBoYW5kbGVyLiBQdXQgaGVyZSBpbnN0ZWFkIG9mIGNsb3N1cmUgdG8gYm9vc3QgcGVyZm9ybWFuY2UuXG4gICAgICAgIGhvb2tTdWNjZXNzSGFuZGxlciA9IGN0eCAmJiBjdHgub25zdWNjZXNzO1xuICAgICAgICBob29rU3VjY2Vzc0hhbmRsZXIgJiYgaG9va1N1Y2Nlc3NIYW5kbGVyKHJlc3VsdCk7XG4gICAgICAgIHJlc29sdmUgJiYgcmVzb2x2ZShyZXN1bHQpO1xuICAgIH0sIHJlc29sdmUpO1xufVxuXG5mdW5jdGlvbiBldmVudFJlamVjdEhhbmRsZXIocmVqZWN0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBwcmV2ZW50RGVmYXVsdChldmVudCk7XG4gICAgICAgIHJlamVjdChldmVudC50YXJnZXQuZXJyb3IpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gaG9va2VkRXZlbnRSZWplY3RIYW5kbGVyKHJlamVjdCkge1xuICAgIHJldHVybiB3cmFwKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAvLyBTZWUgY29tbWVudCBvbiBob29rZWRFdmVudFN1Y2Nlc3NIYW5kbGVyKCkgd2h5IHdyYXAoKSBpcyBuZWVkZWQgb25seSB3aGVuIHN1cHBvcnRpbmcgaG9va3MuXG5cbiAgICAgICAgdmFyIHJlcSA9IGV2ZW50LnRhcmdldCxcbiAgICAgICAgICAgIGVyciA9IHJlcS5lcnJvcixcbiAgICAgICAgICAgIGN0eCA9IHJlcS5faG9va0N0eCxcbiAgICAgICAgICAgIC8vIENvbnRhaW5zIHRoZSBob29rIGVycm9yIGhhbmRsZXIuIFB1dCBoZXJlIGluc3RlYWQgb2YgY2xvc3VyZSB0byBib29zdCBwZXJmb3JtYW5jZS5cbiAgICAgICAgaG9va0Vycm9ySGFuZGxlciA9IGN0eCAmJiBjdHgub25lcnJvcjtcbiAgICAgICAgaG9va0Vycm9ySGFuZGxlciAmJiBob29rRXJyb3JIYW5kbGVyKGVycik7XG4gICAgICAgIHByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gcHJldmVudERlZmF1bHQoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSAvLyBJbmRleGVkREJTaGltIGRvZXNudCBzdXBwb3J0IHRoaXMgb24gU2FmYXJpIDggYW5kIGJlbG93LlxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIC8vIEluZGV4ZWREQlNoaW0gZG9lc250IHN1cHBvcnQgdGhpcyBvbiBTYWZhcmkgOCBhbmQgYmVsb3cuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59XG5cbmZ1bmN0aW9uIGdsb2JhbERhdGFiYXNlTGlzdChjYikge1xuICAgIHZhciB2YWwsXG4gICAgICAgIGxvY2FsU3RvcmFnZSA9IERleGllLmRlcGVuZGVuY2llcy5sb2NhbFN0b3JhZ2U7XG4gICAgaWYgKCFsb2NhbFN0b3JhZ2UpIHJldHVybiBjYihbXSk7IC8vIEVudnMgd2l0aG91dCBsb2NhbFN0b3JhZ2Ugc3VwcG9ydFxuICAgIHRyeSB7XG4gICAgICAgIHZhbCA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ0RleGllLkRhdGFiYXNlTmFtZXMnKSB8fCBcIltdXCIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdmFsID0gW107XG4gICAgfVxuICAgIGlmIChjYih2YWwpKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdEZXhpZS5EYXRhYmFzZU5hbWVzJywgSlNPTi5zdHJpbmdpZnkodmFsKSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBhd2FpdEl0ZXJhdG9yKGl0ZXJhdG9yKSB7XG4gICAgdmFyIGNhbGxOZXh0ID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3IubmV4dChyZXN1bHQpO1xuICAgIH0sXG4gICAgICAgIGRvVGhyb3cgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yLnRocm93KGVycm9yKTtcbiAgICB9LFxuICAgICAgICBvblN1Y2Nlc3MgPSBzdGVwKGNhbGxOZXh0KSxcbiAgICAgICAgb25FcnJvciA9IHN0ZXAoZG9UaHJvdyk7XG5cbiAgICBmdW5jdGlvbiBzdGVwKGdldE5leHQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gZ2V0TmV4dCh2YWwpLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gbmV4dC52YWx1ZTtcblxuICAgICAgICAgICAgcmV0dXJuIG5leHQuZG9uZSA/IHZhbHVlIDogIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZS50aGVuICE9PSAnZnVuY3Rpb24nID8gaXNBcnJheSh2YWx1ZSkgPyBQcm9taXNlLmFsbCh2YWx1ZSkudGhlbihvblN1Y2Nlc3MsIG9uRXJyb3IpIDogb25TdWNjZXNzKHZhbHVlKSA6IHZhbHVlLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RlcChjYWxsTmV4dCkoKTtcbn1cblxuLy9cbi8vIEluZGV4U3BlYyBzdHJ1Y3Rcbi8vXG5mdW5jdGlvbiBJbmRleFNwZWMobmFtZSwga2V5UGF0aCwgdW5pcXVlLCBtdWx0aSwgYXV0bywgY29tcG91bmQsIGRvdHRlZCkge1xuICAgIC8vLyA8cGFyYW0gbmFtZT1cIm5hbWVcIiB0eXBlPVwiU3RyaW5nXCI+PC9wYXJhbT5cbiAgICAvLy8gPHBhcmFtIG5hbWU9XCJrZXlQYXRoXCIgdHlwZT1cIlN0cmluZ1wiPjwvcGFyYW0+XG4gICAgLy8vIDxwYXJhbSBuYW1lPVwidW5pcXVlXCIgdHlwZT1cIkJvb2xlYW5cIj48L3BhcmFtPlxuICAgIC8vLyA8cGFyYW0gbmFtZT1cIm11bHRpXCIgdHlwZT1cIkJvb2xlYW5cIj48L3BhcmFtPlxuICAgIC8vLyA8cGFyYW0gbmFtZT1cImF1dG9cIiB0eXBlPVwiQm9vbGVhblwiPjwvcGFyYW0+XG4gICAgLy8vIDxwYXJhbSBuYW1lPVwiY29tcG91bmRcIiB0eXBlPVwiQm9vbGVhblwiPjwvcGFyYW0+XG4gICAgLy8vIDxwYXJhbSBuYW1lPVwiZG90dGVkXCIgdHlwZT1cIkJvb2xlYW5cIj48L3BhcmFtPlxuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5rZXlQYXRoID0ga2V5UGF0aDtcbiAgICB0aGlzLnVuaXF1ZSA9IHVuaXF1ZTtcbiAgICB0aGlzLm11bHRpID0gbXVsdGk7XG4gICAgdGhpcy5hdXRvID0gYXV0bztcbiAgICB0aGlzLmNvbXBvdW5kID0gY29tcG91bmQ7XG4gICAgdGhpcy5kb3R0ZWQgPSBkb3R0ZWQ7XG4gICAgdmFyIGtleVBhdGhTcmMgPSB0eXBlb2Yga2V5UGF0aCA9PT0gJ3N0cmluZycgPyBrZXlQYXRoIDoga2V5UGF0aCAmJiAnWycgKyBbXS5qb2luLmNhbGwoa2V5UGF0aCwgJysnKSArICddJztcbiAgICB0aGlzLnNyYyA9ICh1bmlxdWUgPyAnJicgOiAnJykgKyAobXVsdGkgPyAnKicgOiAnJykgKyAoYXV0byA/IFwiKytcIiA6IFwiXCIpICsga2V5UGF0aFNyYztcbn1cblxuLy9cbi8vIFRhYmxlU2NoZW1hIHN0cnVjdFxuLy9cbmZ1bmN0aW9uIFRhYmxlU2NoZW1hKG5hbWUsIHByaW1LZXksIGluZGV4ZXMsIGluc3RhbmNlVGVtcGxhdGUpIHtcbiAgICAvLy8gPHBhcmFtIG5hbWU9XCJuYW1lXCIgdHlwZT1cIlN0cmluZ1wiPjwvcGFyYW0+XG4gICAgLy8vIDxwYXJhbSBuYW1lPVwicHJpbUtleVwiIHR5cGU9XCJJbmRleFNwZWNcIj48L3BhcmFtPlxuICAgIC8vLyA8cGFyYW0gbmFtZT1cImluZGV4ZXNcIiB0eXBlPVwiQXJyYXlcIiBlbGVtZW50VHlwZT1cIkluZGV4U3BlY1wiPjwvcGFyYW0+XG4gICAgLy8vIDxwYXJhbSBuYW1lPVwiaW5zdGFuY2VUZW1wbGF0ZVwiIHR5cGU9XCJPYmplY3RcIj48L3BhcmFtPlxuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5wcmltS2V5ID0gcHJpbUtleSB8fCBuZXcgSW5kZXhTcGVjKCk7XG4gICAgdGhpcy5pbmRleGVzID0gaW5kZXhlcyB8fCBbbmV3IEluZGV4U3BlYygpXTtcbiAgICB0aGlzLmluc3RhbmNlVGVtcGxhdGUgPSBpbnN0YW5jZVRlbXBsYXRlO1xuICAgIHRoaXMubWFwcGVkQ2xhc3MgPSBudWxsO1xuICAgIHRoaXMuaWR4QnlOYW1lID0gYXJyYXlUb09iamVjdChpbmRleGVzLCBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIFtpbmRleC5uYW1lLCBpbmRleF07XG4gICAgfSk7XG59XG5cbi8vIFVzZWQgaW4gd2hlbiBkZWZpbmluZyBkZXBlbmRlbmNpZXMgbGF0ZXIuLi5cbi8vIChJZiBJbmRleGVkREJTaGltIGlzIGxvYWRlZCwgcHJlZmVyIGl0IGJlZm9yZSBzdGFuZGFyZCBpbmRleGVkREIpXG52YXIgaWRic2hpbSA9IF9nbG9iYWwuaWRiTW9kdWxlcyAmJiBfZ2xvYmFsLmlkYk1vZHVsZXMuc2hpbUluZGV4ZWREQiA/IF9nbG9iYWwuaWRiTW9kdWxlcyA6IHt9O1xuXG5mdW5jdGlvbiBzYWZhcmlNdWx0aVN0b3JlRml4KHN0b3JlTmFtZXMpIHtcbiAgICByZXR1cm4gc3RvcmVOYW1lcy5sZW5ndGggPT09IDEgPyBzdG9yZU5hbWVzWzBdIDogc3RvcmVOYW1lcztcbn1cblxuZnVuY3Rpb24gZ2V0TmF0aXZlR2V0RGF0YWJhc2VOYW1lc0ZuKGluZGV4ZWREQikge1xuICAgIHZhciBmbiA9IGluZGV4ZWREQiAmJiAoaW5kZXhlZERCLmdldERhdGFiYXNlTmFtZXMgfHwgaW5kZXhlZERCLndlYmtpdEdldERhdGFiYXNlTmFtZXMpO1xuICAgIHJldHVybiBmbiAmJiBmbi5iaW5kKGluZGV4ZWREQik7XG59XG5cbi8vIEV4cG9ydCBFcnJvciBjbGFzc2VzXG5wcm9wcyhEZXhpZSwgZnVsbE5hbWVFeGNlcHRpb25zKTsgLy8gRGV4aWUuWFhYRXJyb3IgPSBjbGFzcyBYWFhFcnJvciB7Li4ufTtcblxuLy9cbi8vIFN0YXRpYyBtZXRob2RzIGFuZCBwcm9wZXJ0aWVzXG4vLyBcbnByb3BzKERleGllLCB7XG5cbiAgICAvL1xuICAgIC8vIFN0YXRpYyBkZWxldGUoKSBtZXRob2QuXG4gICAgLy9cbiAgICBkZWxldGU6IGZ1bmN0aW9uIChkYXRhYmFzZU5hbWUpIHtcbiAgICAgICAgdmFyIGRiID0gbmV3IERleGllKGRhdGFiYXNlTmFtZSksXG4gICAgICAgICAgICBwcm9taXNlID0gZGIuZGVsZXRlKCk7XG4gICAgICAgIHByb21pc2Uub25ibG9ja2VkID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICBkYi5vbihcImJsb2NrZWRcIiwgZm4pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH0sXG5cbiAgICAvL1xuICAgIC8vIFN0YXRpYyBleGlzdHMoKSBtZXRob2QuXG4gICAgLy9cbiAgICBleGlzdHM6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGV4aWUobmFtZSkub3BlbigpLnRoZW4oZnVuY3Rpb24gKGRiKSB7XG4gICAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pLmNhdGNoKERleGllLk5vU3VjaERhdGFiYXNlRXJyb3IsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vXG4gICAgLy8gU3RhdGljIG1ldGhvZCBmb3IgcmV0cmlldmluZyBhIGxpc3Qgb2YgYWxsIGV4aXN0aW5nIGRhdGFiYXNlcyBhdCBjdXJyZW50IGhvc3QuXG4gICAgLy9cbiAgICBnZXREYXRhYmFzZU5hbWVzOiBmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciBnZXREYXRhYmFzZU5hbWVzID0gZ2V0TmF0aXZlR2V0RGF0YWJhc2VOYW1lc0ZuKGluZGV4ZWREQik7XG4gICAgICAgICAgICBpZiAoZ2V0RGF0YWJhc2VOYW1lcykge1xuICAgICAgICAgICAgICAgIC8vIEluIGNhc2UgZ2V0RGF0YWJhc2VOYW1lcygpIGJlY29tZXMgc3RhbmRhcmQsIGxldCdzIHByZXBhcmUgdG8gc3VwcG9ydCBpdDpcbiAgICAgICAgICAgICAgICB2YXIgcmVxID0gZ2V0RGF0YWJhc2VOYW1lcygpO1xuICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzbGljZShldmVudC50YXJnZXQucmVzdWx0LCAwKSk7IC8vIENvbnZlcnN0IERPTVN0cmluZ0xpc3QgdG8gQXJyYXk8U3RyaW5nPlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBldmVudFJlamVjdEhhbmRsZXIocmVqZWN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2xvYmFsRGF0YWJhc2VMaXN0KGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh2YWwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oY2IpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVDbGFzczogZnVuY3Rpb24gKHN0cnVjdHVyZSkge1xuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyAgICAgQ3JlYXRlIGEgamF2YXNjcmlwdCBjb25zdHJ1Y3RvciBiYXNlZCBvbiBnaXZlbiB0ZW1wbGF0ZSBmb3Igd2hpY2ggcHJvcGVydGllcyB0byBleHBlY3QgaW4gdGhlIGNsYXNzLlxuICAgICAgICAvLy8gICAgIEFueSBwcm9wZXJ0eSB0aGF0IGlzIGEgY29uc3RydWN0b3IgZnVuY3Rpb24gd2lsbCBhY3QgYXMgYSB0eXBlLiBTbyB7bmFtZTogU3RyaW5nfSB3aWxsIGJlIGVxdWFsIHRvIHtuYW1lOiBuZXcgU3RyaW5nKCl9LlxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJzdHJ1Y3R1cmVcIj5IZWxwcyBJREUgY29kZSBjb21wbGV0aW9uIGJ5IGtub3dpbmcgdGhlIG1lbWJlcnMgdGhhdCBvYmplY3RzIGNvbnRhaW4gYW5kIG5vdCBqdXN0IHRoZSBpbmRleGVzLiBBbHNvXG4gICAgICAgIC8vLyBrbm93IHdoYXQgdHlwZSBlYWNoIG1lbWJlciBoYXMuIEV4YW1wbGU6IHtuYW1lOiBTdHJpbmcsIGVtYWlsQWRkcmVzc2VzOiBbU3RyaW5nXSwgcHJvcGVydGllczoge3Nob2VTaXplOiBOdW1iZXJ9fTwvcGFyYW0+XG5cbiAgICAgICAgLy8gRGVmYXVsdCBjb25zdHJ1Y3RvciBhYmxlIHRvIGNvcHkgZ2l2ZW4gcHJvcGVydGllcyBpbnRvIHRoaXMgb2JqZWN0LlxuICAgICAgICBmdW5jdGlvbiBDbGFzcyhwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJwcm9wZXJ0aWVzXCIgdHlwZT1cIk9iamVjdFwiIG9wdGlvbmFsPVwidHJ1ZVwiPlByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBvYmplY3Qgd2l0aC5cbiAgICAgICAgICAgIC8vLyA8L3BhcmFtPlxuICAgICAgICAgICAgcHJvcGVydGllcyA/IGV4dGVuZCh0aGlzLCBwcm9wZXJ0aWVzKSA6IGZha2UgJiYgYXBwbHlTdHJ1Y3R1cmUodGhpcywgc3RydWN0dXJlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQ2xhc3M7XG4gICAgfSxcblxuICAgIGFwcGx5U3RydWN0dXJlOiBhcHBseVN0cnVjdHVyZSxcblxuICAgIGlnbm9yZVRyYW5zYWN0aW9uOiBmdW5jdGlvbiAoc2NvcGVGdW5jKSB7XG4gICAgICAgIC8vIEluIGNhc2UgY2FsbGVyIGlzIHdpdGhpbiBhIHRyYW5zYWN0aW9uIGJ1dCBuZWVkcyB0byBjcmVhdGUgYSBzZXBhcmF0ZSB0cmFuc2FjdGlvbi5cbiAgICAgICAgLy8gRXhhbXBsZSBvZiB1c2FnZTpcbiAgICAgICAgLy9cbiAgICAgICAgLy8gTGV0J3Mgc2F5IHdlIGhhdmUgYSBsb2dnZXIgZnVuY3Rpb24gaW4gb3VyIGFwcC4gT3RoZXIgYXBwbGljYXRpb24tbG9naWMgc2hvdWxkIGJlIHVuYXdhcmUgb2YgdGhlXG4gICAgICAgIC8vIGxvZ2dlciBmdW5jdGlvbiBhbmQgbm90IG5lZWQgdG8gaW5jbHVkZSB0aGUgJ2xvZ2VudHJpZXMnIHRhYmxlIGluIGFsbCB0cmFuc2FjdGlvbiBpdCBwZXJmb3Jtcy5cbiAgICAgICAgLy8gVGhlIGxvZ2dpbmcgc2hvdWxkIGFsd2F5cyBiZSBkb25lIGluIGEgc2VwYXJhdGUgdHJhbnNhY3Rpb24gYW5kIG5vdCBiZSBkZXBlbmRhbnQgb24gdGhlIGN1cnJlbnRcbiAgICAgICAgLy8gcnVubmluZyB0cmFuc2FjdGlvbiBjb250ZXh0LiBUaGVuIHlvdSBjb3VsZCB1c2UgRGV4aWUuaWdub3JlVHJhbnNhY3Rpb24oKSB0byBydW4gY29kZSB0aGF0IHN0YXJ0cyBhIG5ldyB0cmFuc2FjdGlvbi5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgIERleGllLmlnbm9yZVRyYW5zYWN0aW9uKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgICAgICAgIGRiLmxvZ2VudHJpZXMuYWRkKG5ld0xvZ0VudHJ5KTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICAvLyBVbmxlc3MgdXNpbmcgRGV4aWUuaWdub3JlVHJhbnNhY3Rpb24oKSwgdGhlIGFib3ZlIGV4YW1wbGUgd291bGQgdHJ5IHRvIHJldXNlIHRoZSBjdXJyZW50IHRyYW5zYWN0aW9uXG4gICAgICAgIC8vIGluIGN1cnJlbnQgUHJvbWlzZS1zY29wZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gQW4gYWx0ZXJuYXRpdmUgdG8gRGV4aWUuaWdub3JlVHJhbnNhY3Rpb24oKSB3b3VsZCBiZSBzZXRJbW1lZGlhdGUoKSBvciBzZXRUaW1lb3V0KCkuIFRoZSByZWFzb24gd2Ugc3RpbGwgcHJvdmlkZSBhblxuICAgICAgICAvLyBBUEkgZm9yIHRoaXMgYmVjYXVzZVxuICAgICAgICAvLyAgMSkgVGhlIGludGVudGlvbiBvZiB3cml0aW5nIHRoZSBzdGF0ZW1lbnQgY291bGQgYmUgdW5jbGVhciBpZiB1c2luZyBzZXRJbW1lZGlhdGUoKSBvciBzZXRUaW1lb3V0KCkuXG4gICAgICAgIC8vICAyKSBzZXRUaW1lb3V0KCkgd291bGQgd2FpdCB1bm5lc2Nlc3NhcnkgdW50aWwgZmlyaW5nLiBUaGlzIGlzIGhvd2V2ZXIgbm90IHRoZSBjYXNlIHdpdGggc2V0SW1tZWRpYXRlKCkuXG4gICAgICAgIC8vICAzKSBzZXRJbW1lZGlhdGUoKSBpcyBub3Qgc3VwcG9ydGVkIGluIHRoZSBFUyBzdGFuZGFyZC5cbiAgICAgICAgLy8gIDQpIFlvdSBtaWdodCB3YW50IHRvIGtlZXAgb3RoZXIgUFNEIHN0YXRlIHRoYXQgd2FzIHNldCBpbiBhIHBhcmVudCBQU0QsIHN1Y2ggYXMgUFNELmxldFRocm91Z2guXG4gICAgICAgIHJldHVybiBQU0QudHJhbnMgPyB1c2VQU0QoUFNELnRyYW5zbGVzcywgc2NvcGVGdW5jKSA6IC8vIFVzZSB0aGUgY2xvc2VzdCBwYXJlbnQgdGhhdCB3YXMgbm9uLXRyYW5zYWN0aW9uYWwuXG4gICAgICAgIHNjb3BlRnVuYygpOyAvLyBObyBuZWVkIHRvIGNoYW5nZSBzY29wZSBiZWNhdXNlIHRoZXJlIGlzIG5vIG9uZ29pbmcgdHJhbnNhY3Rpb24uXG4gICAgfSxcblxuICAgIHZpcDogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIC8vIFRvIGJlIHVzZWQgYnkgc3Vic2NyaWJlcnMgdG8gdGhlIG9uKCdyZWFkeScpIGV2ZW50LlxuICAgICAgICAvLyBUaGlzIHdpbGwgbGV0IGNhbGxlciB0aHJvdWdoIHRvIGFjY2VzcyBEQiBldmVuIHdoZW4gaXQgaXMgYmxvY2tlZCB3aGlsZSB0aGUgZGIucmVhZHkoKSBzdWJzY3JpYmVycyBhcmUgZmlyaW5nLlxuICAgICAgICAvLyBUaGlzIHdvdWxkIGhhdmUgd29ya2VkIGF1dG9tYXRpY2FsbHkgaWYgd2Ugd2VyZSBjZXJ0YWluIHRoYXQgdGhlIFByb3ZpZGVyIHdhcyB1c2luZyBEZXhpZS5Qcm9taXNlIGZvciBhbGwgYXN5bmNyb25pYyBvcGVyYXRpb25zLiBUaGUgcHJvbWlzZSBQU0RcbiAgICAgICAgLy8gZnJvbSB0aGUgcHJvdmlkZXIuY29ubmVjdCgpIGNhbGwgd291bGQgdGhlbiBiZSBkZXJpdmVkIGFsbCB0aGUgd2F5IHRvIHdoZW4gcHJvdmlkZXIgd291bGQgY2FsbCBsb2NhbERhdGFiYXNlLmFwcGx5Q2hhbmdlcygpLiBCdXQgc2luY2VcbiAgICAgICAgLy8gdGhlIHByb3ZpZGVyIG1vcmUgbGlrZWx5IGlzIHVzaW5nIG5vbi1wcm9taXNlIGFzeW5jIEFQSXMgb3Igb3RoZXIgdGhlbmFibGUgaW1wbGVtZW50YXRpb25zLCB3ZSBjYW5ub3QgYXNzdW1lIHRoYXQuXG4gICAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIG1ldGhvZCBpcyBvbmx5IHVzZWZ1bCBmb3Igb24oJ3JlYWR5Jykgc3Vic2NyaWJlcnMgdGhhdCBpcyByZXR1cm5pbmcgYSBQcm9taXNlIGZyb20gdGhlIGV2ZW50LiBJZiBub3QgdXNpbmcgdmlwKClcbiAgICAgICAgLy8gdGhlIGRhdGFiYXNlIGNvdWxkIGRlYWRsb2NrIHNpbmNlIGl0IHdvbnQgb3BlbiB1bnRpbCB0aGUgcmV0dXJuZWQgUHJvbWlzZSBpcyByZXNvbHZlZCwgYW5kIGFueSBub24tVklQZWQgb3BlcmF0aW9uIHN0YXJ0ZWQgYnlcbiAgICAgICAgLy8gdGhlIGNhbGxlciB3aWxsIG5vdCByZXNvbHZlIHVudGlsIGRhdGFiYXNlIGlzIG9wZW5lZC5cbiAgICAgICAgcmV0dXJuIG5ld1Njb3BlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIFBTRC5sZXRUaHJvdWdoID0gdHJ1ZTsgLy8gTWFrZSBzdXJlIHdlIGFyZSBsZXQgdGhyb3VnaCBpZiBzdGlsbCBibG9ja2luZyBkYiBkdWUgdG8gb25yZWFkeSBpcyBmaXJpbmcuXG4gICAgICAgICAgICByZXR1cm4gZm4oKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jOiBmdW5jdGlvbiAoZ2VuZXJhdG9yRm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIHJ2ID0gYXdhaXRJdGVyYXRvcihnZW5lcmF0b3JGbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJ2IHx8IHR5cGVvZiBydi50aGVuICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJ2KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcnY7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdGlvbihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgc3Bhd246IGZ1bmN0aW9uIChnZW5lcmF0b3JGbiwgYXJncywgdGhpeikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHJ2ID0gYXdhaXRJdGVyYXRvcihnZW5lcmF0b3JGbi5hcHBseSh0aGl6LCBhcmdzIHx8IFtdKSk7XG4gICAgICAgICAgICBpZiAoIXJ2IHx8IHR5cGVvZiBydi50aGVuICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJ2KTtcbiAgICAgICAgICAgIHJldHVybiBydjtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdGlvbihlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBEZXhpZS5jdXJyZW50VHJhbnNhY3Rpb24gcHJvcGVydHlcbiAgICBjdXJyZW50VHJhbnNhY3Rpb246IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gUFNELnRyYW5zIHx8IG51bGw7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gRXhwb3J0IG91ciBQcm9taXNlIGltcGxlbWVudGF0aW9uIHNpbmNlIGl0IGNhbiBiZSBoYW5keSBhcyBhIHN0YW5kYWxvbmUgUHJvbWlzZSBpbXBsZW1lbnRhdGlvblxuICAgIFByb21pc2U6IFByb21pc2UsXG5cbiAgICAvLyBEZXhpZS5kZWJ1ZyBwcm9wdGVyeTpcbiAgICAvLyBEZXhpZS5kZWJ1ZyA9IGZhbHNlXG4gICAgLy8gRGV4aWUuZGVidWcgPSB0cnVlXG4gICAgLy8gRGV4aWUuZGVidWcgPSBcImRleGllXCIgLSBkb24ndCBoaWRlIGRleGllJ3Mgc3RhY2sgZnJhbWVzLlxuICAgIGRlYnVnOiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRlYnVnO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgc2V0RGVidWcodmFsdWUsIHZhbHVlID09PSAnZGV4aWUnID8gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSA6IGRleGllU3RhY2tGcmFtZUZpbHRlcik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gRXhwb3J0IG91ciBkZXJpdmUvZXh0ZW5kL292ZXJyaWRlIG1ldGhvZG9sb2d5XG4gICAgZGVyaXZlOiBkZXJpdmUsXG4gICAgZXh0ZW5kOiBleHRlbmQsXG4gICAgcHJvcHM6IHByb3BzLFxuICAgIG92ZXJyaWRlOiBvdmVycmlkZSxcbiAgICAvLyBFeHBvcnQgb3VyIEV2ZW50cygpIGZ1bmN0aW9uIC0gY2FuIGJlIGhhbmR5IGFzIGEgdG9vbGtpdFxuICAgIEV2ZW50czogRXZlbnRzLFxuICAgIGV2ZW50czogeyBnZXQ6IGRlcHJlY2F0ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIEV2ZW50cztcbiAgICAgICAgfSkgfSwgLy8gQmFja3dhcmQgY29tcGF0aWJsZSBsb3dlcmNhc2UgdmVyc2lvbi5cbiAgICAvLyBVdGlsaXRpZXNcbiAgICBnZXRCeUtleVBhdGg6IGdldEJ5S2V5UGF0aCxcbiAgICBzZXRCeUtleVBhdGg6IHNldEJ5S2V5UGF0aCxcbiAgICBkZWxCeUtleVBhdGg6IGRlbEJ5S2V5UGF0aCxcbiAgICBzaGFsbG93Q2xvbmU6IHNoYWxsb3dDbG9uZSxcbiAgICBkZWVwQ2xvbmU6IGRlZXBDbG9uZSxcbiAgICBnZXRPYmplY3REaWZmOiBnZXRPYmplY3REaWZmLFxuICAgIGFzYXA6IGFzYXAsXG4gICAgbWF4S2V5OiBtYXhLZXksXG4gICAgLy8gQWRkb24gcmVnaXN0cnlcbiAgICBhZGRvbnM6IFtdLFxuICAgIC8vIEdsb2JhbCBEQiBjb25uZWN0aW9uIGxpc3RcbiAgICBjb25uZWN0aW9uczogY29ubmVjdGlvbnMsXG5cbiAgICBNdWx0aU1vZGlmeUVycm9yOiBleGNlcHRpb25zLk1vZGlmeSwgLy8gQmFja3dhcmQgY29tcGF0aWJpbGl0eSAwLjkuOC4gRGVwcmVjYXRlLlxuICAgIGVycm5hbWVzOiBlcnJuYW1lcyxcblxuICAgIC8vIEV4cG9ydCBvdGhlciBzdGF0aWMgY2xhc3Nlc1xuICAgIEluZGV4U3BlYzogSW5kZXhTcGVjLFxuICAgIFRhYmxlU2NoZW1hOiBUYWJsZVNjaGVtYSxcblxuICAgIC8vXG4gICAgLy8gRGVwZW5kZW5jaWVzXG4gICAgLy9cbiAgICAvLyBUaGVzZSB3aWxsIGF1dG9tYXRpY2FsbHkgd29yayBpbiBicm93c2VycyB3aXRoIGluZGV4ZWREQiBzdXBwb3J0LCBvciB3aGVyZSBhbiBpbmRleGVkREIgcG9seWZpbGwgaGFzIGJlZW4gaW5jbHVkZWQuXG4gICAgLy9cbiAgICAvLyBJbiBub2RlLmpzLCBob3dldmVyLCB0aGVzZSBwcm9wZXJ0aWVzIG11c3QgYmUgc2V0IFwibWFudWFsbHlcIiBiZWZvcmUgaW5zdGFuc2lhdGluZyBhIG5ldyBEZXhpZSgpLlxuICAgIC8vIEZvciBub2RlLmpzLCB5b3UgbmVlZCB0byByZXF1aXJlIGluZGV4ZWRkYi1qcyBvciBzaW1pbGFyIGFuZCB0aGVuIHNldCB0aGVzZSBkZXBzLlxuICAgIC8vXG4gICAgZGVwZW5kZW5jaWVzOiB7XG4gICAgICAgIC8vIFJlcXVpcmVkOlxuICAgICAgICBpbmRleGVkREI6IGlkYnNoaW0uc2hpbUluZGV4ZWREQiB8fCBfZ2xvYmFsLmluZGV4ZWREQiB8fCBfZ2xvYmFsLm1vekluZGV4ZWREQiB8fCBfZ2xvYmFsLndlYmtpdEluZGV4ZWREQiB8fCBfZ2xvYmFsLm1zSW5kZXhlZERCLFxuICAgICAgICBJREJLZXlSYW5nZTogaWRic2hpbS5JREJLZXlSYW5nZSB8fCBfZ2xvYmFsLklEQktleVJhbmdlIHx8IF9nbG9iYWwud2Via2l0SURCS2V5UmFuZ2VcbiAgICB9LFxuXG4gICAgLy8gQVBJIFZlcnNpb24gTnVtYmVyOiBUeXBlIE51bWJlciwgbWFrZSBzdXJlIHRvIGFsd2F5cyBzZXQgYSB2ZXJzaW9uIG51bWJlciB0aGF0IGNhbiBiZSBjb21wYXJhYmxlIGNvcnJlY3RseS4gRXhhbXBsZTogMC45LCAwLjkxLCAwLjkyLCAxLjAsIDEuMDEsIDEuMSwgMS4yLCAxLjIxLCBldGMuXG4gICAgc2VtVmVyOiBERVhJRV9WRVJTSU9OLFxuICAgIHZlcnNpb246IERFWElFX1ZFUlNJT04uc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KG4pO1xuICAgIH0pLnJlZHVjZShmdW5jdGlvbiAocCwgYywgaSkge1xuICAgICAgICByZXR1cm4gcCArIGMgLyBNYXRoLnBvdygxMCwgaSAqIDIpO1xuICAgIH0pLFxuICAgIGZha2VBdXRvQ29tcGxldGU6IGZha2VBdXRvQ29tcGxldGUsXG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZGZhaGxhbmRlci9EZXhpZS5qcy9pc3N1ZXMvMTg2XG4gICAgLy8gdHlwZXNjcmlwdCBjb21waWxlciB0c2MgaW4gbW9kZSB0cy0tPmVzNSAmIGNvbW1vbkpTLCB3aWxsIGV4cGVjdCByZXF1aXJlKCkgdG8gcmV0dXJuXG4gICAgLy8geC5kZWZhdWx0LiBXb3JrYXJvdW5kOiBTZXQgRGV4aWUuZGVmYXVsdCA9IERleGllLlxuICAgIGRlZmF1bHQ6IERleGllXG59KTtcblxudHJ5Q2F0Y2goZnVuY3Rpb24gKCkge1xuICAgIC8vIE9wdGlvbmFsIGRlcGVuZGVuY2llc1xuICAgIC8vIGxvY2FsU3RvcmFnZVxuICAgIERleGllLmRlcGVuZGVuY2llcy5sb2NhbFN0b3JhZ2UgPSAodHlwZW9mIGNocm9tZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjaHJvbWUgIT09IG51bGwgPyBjaHJvbWUuc3RvcmFnZSA6IHZvaWQgMCkgIT0gbnVsbCA/IG51bGwgOiBfZ2xvYmFsLmxvY2FsU3RvcmFnZTtcbn0pO1xuXG4vLyBNYXAgRE9NRXJyb3JzIGFuZCBET01FeGNlcHRpb25zIHRvIGNvcnJlc3BvbmRpbmcgRGV4aWUgZXJyb3JzLiBNYXkgY2hhbmdlIGluIERleGllIHYyLjAuXG5Qcm9taXNlLnJlamVjdGlvbk1hcHBlciA9IG1hcEVycm9yO1xuXG4vLyBGb29sIElERSB0byBpbXByb3ZlIGF1dG9jb21wbGV0ZS4gVGVzdGVkIHdpdGggVmlzdWFsIFN0dWRpbyAyMDEzIGFuZCAyMDE1LlxuZG9GYWtlQXV0b0NvbXBsZXRlKGZ1bmN0aW9uICgpIHtcbiAgICBEZXhpZS5mYWtlQXV0b0NvbXBsZXRlID0gZmFrZUF1dG9Db21wbGV0ZSA9IGRvRmFrZUF1dG9Db21wbGV0ZTtcbiAgICBEZXhpZS5mYWtlID0gZmFrZSA9IHRydWU7XG59KTtcblxucmV0dXJuIERleGllO1xuXG59KSkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGV4aWUuanMubWFwXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vZGV4aWUvZGlzdC9kZXhpZS5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheSA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0pIF9pW1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfSByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IHJldHVybiBhcnI7IH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7IHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7IH0gZWxzZSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpOyB9IH07IH0oKTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZXhwb3J0cy5taXhpbiA9IG1peGluO1xuZXhwb3J0cy5taXggPSBtaXg7XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBvYmplY3QgdG8gYW4gYXJyYXkgb2YgcGFpcnMsIGluIHRoZSBmb3JtIG9mIGFuIGFycmF5IG9mIHR1cGxlc1xuICogd2hlcmUgaW5kZXggMCBpcyB0aGUga2V5IGFuZCBpbmRleCAxIGlzIHRoZSB2YWx1ZS4gVGhpcyBpbmNsdWRlIGJvdGhcbiAqIGVudW1lcmFibGUgYW5kIG5vbi1lbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IE9iamVjdCBmb3Igd2hpY2ggdG8gZ2V0IHBhaXJzXG4gKiBAcmV0dXJucyB7W3N0cmluZywgKl1bXX0gQXJyYXkgY29udGFpbmluZyBvYmplY3QgcGFpcnNcbiAqL1xuZnVuY3Rpb24gZW50cmllcyhvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iamVjdCkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gW2tleSwgb2JqZWN0W2tleV1dO1xuICB9KTtcbn1cblxuLyoqXG4gKiBHZW5lcmljIG1peGluIHN1cGVyY2xhc3MuIFRoaXMgY2xhc3MgaXMgaW50ZW5kZWQgdG8gYmUgZXh0ZW5kZWQgYnkgYWN0dWFsXG4gKiBtaXhpbnMuXG4gKi9cblxudmFyIE1peGluID0gZXhwb3J0cy5NaXhpbiA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTWl4aW4oKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1peGluKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhNaXhpbiwgbnVsbCwgW3tcbiAgICBrZXk6ICdtaXhpbicsXG5cblxuICAgIC8qKlxuICAgICAqIE1peGVzIGluIHRoaXMgY2xhc3MncyBtZXRob2RzIGludG8gYW4gZXhpc3Rpbmcgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbdGFyZ2V0PXt9XSBBbnkgb2JqZWN0IHRvIG1peCB0aGlzIGNsYXNzJ3MgbWV0aG9kcyBpbnRvXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gW01peGVkSW49dGhpc10gQ29uc3RydWN0b3IgdG8gYmUgbWl4ZWQgaW5cbiAgICAgKiBAcGFyYW0gey4uLip9IFthcmdzXSBBcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWl4ZWQgaW4gY29uc3RydWN0b3IsIGlmIGFueVxuICAgICAqIEByZXR1cm4ge29iamVjdH0gVGhlIG9yaWdpbmFsIHRhcmdldCBvYmplY3QsIG11dGF0ZWRcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gbWl4aW4oKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG4gICAgICB2YXIgTWl4ZWRJbiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHRoaXMgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiA+IDIgPyBfbGVuIC0gMiA6IDApLCBfa2V5ID0gMjsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBhcmdzW19rZXkgLSAyXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgdmFyIGluc3RhbmNlID0gbmV3IChGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5hcHBseShNaXhlZEluLCBbbnVsbF0uY29uY2F0KGFyZ3MpKSkoKTtcblxuICAgICAgLy8gR2V0IGFsbCB0aGUgbWV0aG9kcyBmcm9tIHRoaXMgY2xhc3MsIGJpbmQgdGhlbSB0byB0aGUgaW5zdGFuY2UsIGFuZCBjb3B5XG4gICAgICAvLyB0aGVtIHRvIHRoZSB0YXJnZXQgb2JqZWN0LlxuICAgICAgZW50cmllcyhNaXhlZEluLnByb3RvdHlwZSkuZmlsdGVyKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICAgIHZhciBfcmVmMiA9IF9zbGljZWRUb0FycmF5KF9yZWYsIDIpO1xuXG4gICAgICAgIHZhciBtZXRob2ROYW1lID0gX3JlZjJbMF07XG4gICAgICAgIHZhciBtZXRob2QgPSBfcmVmMlsxXTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBtZXRob2QgPT09ICdmdW5jdGlvbicgJiYgbWV0aG9kTmFtZSAhPT0gJ2NvbnN0cnVjdG9yJztcbiAgICAgIH0pLmZvckVhY2goZnVuY3Rpb24gKF9yZWYzKSB7XG4gICAgICAgIHZhciBfcmVmNCA9IF9zbGljZWRUb0FycmF5KF9yZWYzLCAyKTtcblxuICAgICAgICB2YXIgbWV0aG9kTmFtZSA9IF9yZWY0WzBdO1xuICAgICAgICB2YXIgbWV0aG9kID0gX3JlZjRbMV07XG4gICAgICAgIHJldHVybiB0YXJnZXRbbWV0aG9kTmFtZV0gPSBtZXRob2QuYmluZChpbnN0YW5jZSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTWl4aW47XG59KCk7XG5cbi8qKlxuICogTWl4ZXMgaW4gdGhpcyBjbGFzcydzIG1ldGhvZHMgaW50byBhbiBleGlzdGluZyBvYmplY3QuXG4gKiBAcGFyYW0ge29iamVjdH0gW3RhcmdldD17fV0gQW55IG9iamVjdCB0byBtaXggdGhpcyBjbGFzcydzIG1ldGhvZHMgaW50b1xuICogQHBhcmFtIHtmdW5jdGlvbn0gW01peGVkSW49TWl4aW5dIENvbnN0cnVjdG9yIHRvIGJlIG1peGVkIGluXG4gKiBAcGFyYW0gey4uLip9IFthcmdzXSBBcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWl4ZWQgaW4gY29uc3RydWN0b3IsIGlmIGFueVxuICogQHJldHVybiB7b2JqZWN0fSBUaGUgb3JpZ2luYWwgdGFyZ2V0IG9iamVjdCwgbXV0YXRlZFxuICovXG5cblxuZnVuY3Rpb24gbWl4aW4oKSB7XG4gIHZhciB0YXJnZXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcbiAgdmFyIE1peGVkSW4gPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBNaXhpbiA6IGFyZ3VtZW50c1sxXTtcblxuICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuMiA+IDIgPyBfbGVuMiAtIDIgOiAwKSwgX2tleTIgPSAyOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgYXJnc1tfa2V5MiAtIDJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgfVxuXG4gIHJldHVybiBNaXhpbi5taXhpbi5hcHBseShNaXhpbiwgW3RhcmdldCwgTWl4ZWRJbl0uY29uY2F0KGFyZ3MpKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBzdWJjbGFzcyBvZiBhIGNvbnN0cnVjdG9yIGFuZCBtaXggMSBvciBtYW55IG1peGluIGludG8gaXQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBTdXBlckNsYXNzIENsYXNzIHRoYXQgd2lsbCBiZSB1c2VkIGFzIHN1cGVyLWNsYXNzXG4gKiBAcGFyYW0gey4uLmZ1bmN0aW9ufSBtaXhpbnMgTWl4aW5zIHRvIGFkZFxuICogQHJldHVybiB7ZnVuY3Rpb259IEEgbmV3IGFub255bW91cyBjbGFzcyB0aGF0IGV4dGVuZHMgYFN1cGVyQ2xhc3NgIGFuZCBoYXMgYWxsIGBtaXhpbnNgIG1peGVkIGluXG4gKi9cbmZ1bmN0aW9uIG1peChTdXBlckNsYXNzKSB7XG4gIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgbWl4aW5zID0gQXJyYXkoX2xlbjMgPiAxID8gX2xlbjMgLSAxIDogMCksIF9rZXkzID0gMTsgX2tleTMgPCBfbGVuMzsgX2tleTMrKykge1xuICAgIG1peGluc1tfa2V5MyAtIDFdID0gYXJndW1lbnRzW19rZXkzXTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoX1N1cGVyQ2xhc3MpIHtcbiAgICBfaW5oZXJpdHMoX2NsYXNzLCBfU3VwZXJDbGFzcyk7XG5cbiAgICBmdW5jdGlvbiBfY2xhc3MoKSB7XG4gICAgICB2YXIgX09iamVjdCRnZXRQcm90b3R5cGVPO1xuXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgX2NsYXNzKTtcblxuICAgICAgZm9yICh2YXIgX2xlbjQgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjQpLCBfa2V5NCA9IDA7IF9rZXk0IDwgX2xlbjQ7IF9rZXk0KyspIHtcbiAgICAgICAgYXJnc1tfa2V5NF0gPSBhcmd1bWVudHNbX2tleTRdO1xuICAgICAgfVxuXG4gICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoX09iamVjdCRnZXRQcm90b3R5cGVPID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKF9jbGFzcykpLmNhbGwuYXBwbHkoX09iamVjdCRnZXRQcm90b3R5cGVPLCBbdGhpc10uY29uY2F0KGFyZ3MpKSk7XG5cbiAgICAgIG1peGlucy5mb3JFYWNoKGZ1bmN0aW9uIChNaXhlZGluKSB7XG4gICAgICAgIHJldHVybiBtaXhpbihfdGhpcywgTWl4ZWRpbik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICByZXR1cm4gX2NsYXNzO1xuICB9KFN1cGVyQ2xhc3MpO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9lczYtbWl4aW4vZGlzdC9saWIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wcm9jZXNzL2Jyb3dzZXIuanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiKGZ1bmN0aW9uIChnbG9iYWwsIHVuZGVmaW5lZCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKGdsb2JhbC5zZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBuZXh0SGFuZGxlID0gMTsgLy8gU3BlYyBzYXlzIGdyZWF0ZXIgdGhhbiB6ZXJvXG4gICAgdmFyIHRhc2tzQnlIYW5kbGUgPSB7fTtcbiAgICB2YXIgY3VycmVudGx5UnVubmluZ0FUYXNrID0gZmFsc2U7XG4gICAgdmFyIGRvYyA9IGdsb2JhbC5kb2N1bWVudDtcbiAgICB2YXIgcmVnaXN0ZXJJbW1lZGlhdGU7XG5cbiAgICBmdW5jdGlvbiBzZXRJbW1lZGlhdGUoY2FsbGJhY2spIHtcbiAgICAgIC8vIENhbGxiYWNrIGNhbiBlaXRoZXIgYmUgYSBmdW5jdGlvbiBvciBhIHN0cmluZ1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKFwiXCIgKyBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgICAvLyBDb3B5IGZ1bmN0aW9uIGFyZ3VtZW50c1xuICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpICsgMV07XG4gICAgICB9XG4gICAgICAvLyBTdG9yZSBhbmQgcmVnaXN0ZXIgdGhlIHRhc2tcbiAgICAgIHZhciB0YXNrID0geyBjYWxsYmFjazogY2FsbGJhY2ssIGFyZ3M6IGFyZ3MgfTtcbiAgICAgIHRhc2tzQnlIYW5kbGVbbmV4dEhhbmRsZV0gPSB0YXNrO1xuICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUobmV4dEhhbmRsZSk7XG4gICAgICByZXR1cm4gbmV4dEhhbmRsZSsrO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFySW1tZWRpYXRlKGhhbmRsZSkge1xuICAgICAgICBkZWxldGUgdGFza3NCeUhhbmRsZVtoYW5kbGVdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJ1bih0YXNrKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IHRhc2suY2FsbGJhY2s7XG4gICAgICAgIHZhciBhcmdzID0gdGFzay5hcmdzO1xuICAgICAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgY2FsbGJhY2soYXJnc1swXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgY2FsbGJhY2soYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgY2FsbGJhY2soYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJ1bklmUHJlc2VudChoYW5kbGUpIHtcbiAgICAgICAgLy8gRnJvbSB0aGUgc3BlYzogXCJXYWl0IHVudGlsIGFueSBpbnZvY2F0aW9ucyBvZiB0aGlzIGFsZ29yaXRobSBzdGFydGVkIGJlZm9yZSB0aGlzIG9uZSBoYXZlIGNvbXBsZXRlZC5cIlxuICAgICAgICAvLyBTbyBpZiB3ZSdyZSBjdXJyZW50bHkgcnVubmluZyBhIHRhc2ssIHdlJ2xsIG5lZWQgdG8gZGVsYXkgdGhpcyBpbnZvY2F0aW9uLlxuICAgICAgICBpZiAoY3VycmVudGx5UnVubmluZ0FUYXNrKSB7XG4gICAgICAgICAgICAvLyBEZWxheSBieSBkb2luZyBhIHNldFRpbWVvdXQuIHNldEltbWVkaWF0ZSB3YXMgdHJpZWQgaW5zdGVhZCwgYnV0IGluIEZpcmVmb3ggNyBpdCBnZW5lcmF0ZWQgYVxuICAgICAgICAgICAgLy8gXCJ0b28gbXVjaCByZWN1cnNpb25cIiBlcnJvci5cbiAgICAgICAgICAgIHNldFRpbWVvdXQocnVuSWZQcmVzZW50LCAwLCBoYW5kbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHRhc2sgPSB0YXNrc0J5SGFuZGxlW2hhbmRsZV07XG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRseVJ1bm5pbmdBVGFzayA9IHRydWU7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcnVuKHRhc2spO1xuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW1tZWRpYXRlKGhhbmRsZSk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRseVJ1bm5pbmdBVGFzayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxOZXh0VGlja0ltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiAoKSB7IHJ1bklmUHJlc2VudChoYW5kbGUpOyB9KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5Vc2VQb3N0TWVzc2FnZSgpIHtcbiAgICAgICAgLy8gVGhlIHRlc3QgYWdhaW5zdCBgaW1wb3J0U2NyaXB0c2AgcHJldmVudHMgdGhpcyBpbXBsZW1lbnRhdGlvbiBmcm9tIGJlaW5nIGluc3RhbGxlZCBpbnNpZGUgYSB3ZWIgd29ya2VyLFxuICAgICAgICAvLyB3aGVyZSBgZ2xvYmFsLnBvc3RNZXNzYWdlYCBtZWFucyBzb21ldGhpbmcgY29tcGxldGVseSBkaWZmZXJlbnQgYW5kIGNhbid0IGJlIHVzZWQgZm9yIHRoaXMgcHVycG9zZS5cbiAgICAgICAgaWYgKGdsb2JhbC5wb3N0TWVzc2FnZSAmJiAhZ2xvYmFsLmltcG9ydFNjcmlwdHMpIHtcbiAgICAgICAgICAgIHZhciBwb3N0TWVzc2FnZUlzQXN5bmNocm9ub3VzID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBvbGRPbk1lc3NhZ2UgPSBnbG9iYWwub25tZXNzYWdlO1xuICAgICAgICAgICAgZ2xvYmFsLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXMgPSBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBnbG9iYWwucG9zdE1lc3NhZ2UoXCJcIiwgXCIqXCIpO1xuICAgICAgICAgICAgZ2xvYmFsLm9ubWVzc2FnZSA9IG9sZE9uTWVzc2FnZTtcbiAgICAgICAgICAgIHJldHVybiBwb3N0TWVzc2FnZUlzQXN5bmNocm9ub3VzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbFBvc3RNZXNzYWdlSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIC8vIEluc3RhbGxzIGFuIGV2ZW50IGhhbmRsZXIgb24gYGdsb2JhbGAgZm9yIHRoZSBgbWVzc2FnZWAgZXZlbnQ6IHNlZVxuICAgICAgICAvLyAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0RPTS93aW5kb3cucG9zdE1lc3NhZ2VcbiAgICAgICAgLy8gKiBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9jb21tcy5odG1sI2Nyb3NzRG9jdW1lbnRNZXNzYWdlc1xuXG4gICAgICAgIHZhciBtZXNzYWdlUHJlZml4ID0gXCJzZXRJbW1lZGlhdGUkXCIgKyBNYXRoLnJhbmRvbSgpICsgXCIkXCI7XG4gICAgICAgIHZhciBvbkdsb2JhbE1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZSA9PT0gZ2xvYmFsICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIGV2ZW50LmRhdGEgPT09IFwic3RyaW5nXCIgJiZcbiAgICAgICAgICAgICAgICBldmVudC5kYXRhLmluZGV4T2YobWVzc2FnZVByZWZpeCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBydW5JZlByZXNlbnQoK2V2ZW50LmRhdGEuc2xpY2UobWVzc2FnZVByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBvbkdsb2JhbE1lc3NhZ2UsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsb2JhbC5hdHRhY2hFdmVudChcIm9ubWVzc2FnZVwiLCBvbkdsb2JhbE1lc3NhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShtZXNzYWdlUHJlZml4ICsgaGFuZGxlLCBcIipcIik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbE1lc3NhZ2VDaGFubmVsSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGUgPSBldmVudC5kYXRhO1xuICAgICAgICAgICAgcnVuSWZQcmVzZW50KGhhbmRsZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoaGFuZGxlKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsUmVhZHlTdGF0ZUNoYW5nZUltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICB2YXIgaHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYSA8c2NyaXB0PiBlbGVtZW50OyBpdHMgcmVhZHlzdGF0ZWNoYW5nZSBldmVudCB3aWxsIGJlIGZpcmVkIGFzeW5jaHJvbm91c2x5IG9uY2UgaXQgaXMgaW5zZXJ0ZWRcbiAgICAgICAgICAgIC8vIGludG8gdGhlIGRvY3VtZW50LiBEbyBzbywgdGh1cyBxdWV1aW5nIHVwIHRoZSB0YXNrLiBSZW1lbWJlciB0byBjbGVhbiB1cCBvbmNlIGl0J3MgYmVlbiBjYWxsZWQuXG4gICAgICAgICAgICB2YXIgc2NyaXB0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgICAgICAgICBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJ1bklmUHJlc2VudChoYW5kbGUpO1xuICAgICAgICAgICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIGh0bWwucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgICAgICBzY3JpcHQgPSBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsU2V0VGltZW91dEltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChydW5JZlByZXNlbnQsIDAsIGhhbmRsZSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSWYgc3VwcG9ydGVkLCB3ZSBzaG91bGQgYXR0YWNoIHRvIHRoZSBwcm90b3R5cGUgb2YgZ2xvYmFsLCBzaW5jZSB0aGF0IGlzIHdoZXJlIHNldFRpbWVvdXQgZXQgYWwuIGxpdmUuXG4gICAgdmFyIGF0dGFjaFRvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihnbG9iYWwpO1xuICAgIGF0dGFjaFRvID0gYXR0YWNoVG8gJiYgYXR0YWNoVG8uc2V0VGltZW91dCA/IGF0dGFjaFRvIDogZ2xvYmFsO1xuXG4gICAgLy8gRG9uJ3QgZ2V0IGZvb2xlZCBieSBlLmcuIGJyb3dzZXJpZnkgZW52aXJvbm1lbnRzLlxuICAgIGlmICh7fS50b1N0cmluZy5jYWxsKGdsb2JhbC5wcm9jZXNzKSA9PT0gXCJbb2JqZWN0IHByb2Nlc3NdXCIpIHtcbiAgICAgICAgLy8gRm9yIE5vZGUuanMgYmVmb3JlIDAuOVxuICAgICAgICBpbnN0YWxsTmV4dFRpY2tJbXBsZW1lbnRhdGlvbigpO1xuXG4gICAgfSBlbHNlIGlmIChjYW5Vc2VQb3N0TWVzc2FnZSgpKSB7XG4gICAgICAgIC8vIEZvciBub24tSUUxMCBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgaW5zdGFsbFBvc3RNZXNzYWdlSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSBpZiAoZ2xvYmFsLk1lc3NhZ2VDaGFubmVsKSB7XG4gICAgICAgIC8vIEZvciB3ZWIgd29ya2Vycywgd2hlcmUgc3VwcG9ydGVkXG4gICAgICAgIGluc3RhbGxNZXNzYWdlQ2hhbm5lbEltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2UgaWYgKGRvYyAmJiBcIm9ucmVhZHlzdGF0ZWNoYW5nZVwiIGluIGRvYy5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpKSB7XG4gICAgICAgIC8vIEZvciBJRSA24oCTOFxuICAgICAgICBpbnN0YWxsUmVhZHlTdGF0ZUNoYW5nZUltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGb3Igb2xkZXIgYnJvd3NlcnNcbiAgICAgICAgaW5zdGFsbFNldFRpbWVvdXRJbXBsZW1lbnRhdGlvbigpO1xuICAgIH1cblxuICAgIGF0dGFjaFRvLnNldEltbWVkaWF0ZSA9IHNldEltbWVkaWF0ZTtcbiAgICBhdHRhY2hUby5jbGVhckltbWVkaWF0ZSA9IGNsZWFySW1tZWRpYXRlO1xufSh0eXBlb2Ygc2VsZiA9PT0gXCJ1bmRlZmluZWRcIiA/IHR5cGVvZiBnbG9iYWwgPT09IFwidW5kZWZpbmVkXCIgPyB0aGlzIDogZ2xvYmFsIDogc2VsZikpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3NldGltbWVkaWF0ZS9zZXRJbW1lZGlhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5O1xuXG4vLyBET00gQVBJcywgZm9yIGNvbXBsZXRlbmVzc1xuXG5leHBvcnRzLnNldFRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0VGltZW91dCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhclRpbWVvdXQpO1xufTtcbmV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0SW50ZXJ2YWwsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJJbnRlcnZhbCk7XG59O1xuZXhwb3J0cy5jbGVhclRpbWVvdXQgPVxuZXhwb3J0cy5jbGVhckludGVydmFsID0gZnVuY3Rpb24odGltZW91dCkge1xuICBpZiAodGltZW91dCkge1xuICAgIHRpbWVvdXQuY2xvc2UoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gVGltZW91dChpZCwgY2xlYXJGbikge1xuICB0aGlzLl9pZCA9IGlkO1xuICB0aGlzLl9jbGVhckZuID0gY2xlYXJGbjtcbn1cblRpbWVvdXQucHJvdG90eXBlLnVucmVmID0gVGltZW91dC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24oKSB7fTtcblRpbWVvdXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2NsZWFyRm4uY2FsbCh3aW5kb3csIHRoaXMuX2lkKTtcbn07XG5cbi8vIERvZXMgbm90IHN0YXJ0IHRoZSB0aW1lLCBqdXN0IHNldHMgdXAgdGhlIG1lbWJlcnMgbmVlZGVkLlxuZXhwb3J0cy5lbnJvbGwgPSBmdW5jdGlvbihpdGVtLCBtc2Vjcykge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gbXNlY3M7XG59O1xuXG5leHBvcnRzLnVuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gLTE7XG59O1xuXG5leHBvcnRzLl91bnJlZkFjdGl2ZSA9IGV4cG9ydHMuYWN0aXZlID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG5cbiAgdmFyIG1zZWNzID0gaXRlbS5faWRsZVRpbWVvdXQ7XG4gIGlmIChtc2VjcyA+PSAwKSB7XG4gICAgaXRlbS5faWRsZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gb25UaW1lb3V0KCkge1xuICAgICAgaWYgKGl0ZW0uX29uVGltZW91dClcbiAgICAgICAgaXRlbS5fb25UaW1lb3V0KCk7XG4gICAgfSwgbXNlY3MpO1xuICB9XG59O1xuXG4vLyBzZXRpbW1lZGlhdGUgYXR0YWNoZXMgaXRzZWxmIHRvIHRoZSBnbG9iYWwgb2JqZWN0XG5yZXF1aXJlKFwic2V0aW1tZWRpYXRlXCIpO1xuZXhwb3J0cy5zZXRJbW1lZGlhdGUgPSBzZXRJbW1lZGlhdGU7XG5leHBvcnRzLmNsZWFySW1tZWRpYXRlID0gY2xlYXJJbW1lZGlhdGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3NpbXByb3Zjb3JlJykuZGVmYXVsdDtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zb3VyY2VTY3JpcHRzL2luZGV4LmpzIl0sInNvdXJjZVJvb3QiOiIifQ==