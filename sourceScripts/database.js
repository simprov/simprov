import Dexie from 'dexie';

export default class Database {
    constructor(configuration) {
        this.dbName = configuration;
        this.db = new Dexie(this.dbName);
    }

    addData(data, storeName = 'provenance') {
        return this.db[storeName].add(data);
    }

    putData(data, storeName = 'provenance', primaryKey) {
        return this.db[storeName].put(data, primaryKey);
    }

    bulkAddData(bulkData, storeName = 'provenance') {
        return this.db[storeName].bulkAdd(bulkData);
    }

    clearTable(storeName = 'provenance') { //Todo check table exists
        return this.db[storeName].clear();
    }

    checkDBStatus() {
        return Promise.resolve(Dexie.isOpen());
    }

    // deleteTableContentByPrimaryKey
    deleteObject(primaryKey, storeName = 'provenance') {
        return this.db[storeName].delete(primaryKey); //Todo check table exists
    }

    deleteDB(dbName = this.dbName) { //Todo check DB exists
        this.db.close();
        return Dexie.delete(dbName);
    }

    static existsDBHelper(dbName) {
        return Dexie.exists(dbName);
    }

    fetchAll(storeName = 'provenance') {
        return this.db[storeName].toArray();
    }

    getObject(primaryKey, storeName = 'provenance') { //Todo check table exists
        return this.db[storeName].get(primaryKey);
    }

    initializeDB() {
        return new Promise((resolve) => {
            this.db.version(1).stores({
                provenance: 'actionCUID',
                cache: '++',
                stream: '++, timestamp'
            });
            resolve();
        });
    }

    listAllDB() {
        return Dexie.getDatabaseNames();
    }

    streamFetcher(startTimestamp, endTimestamp) {
        return this.db.stream.where('timestamp').between(startTimestamp, endTimestamp, true, true).toArray();
    }

    tableCount(storeName = 'provenance') {
        return this.db[storeName].count();
    }

    updateObject(primaryKey, updateData, storeName = 'provenance') {
        return this.db[storeName].update(primaryKey, updateData);
    }

    dexieVersion() {
        return Promise.resolve(Dexie.semVer);
    }

    classDatabaseInformation() {
        console.log('This is Class Database');
    }
}