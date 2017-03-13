import Dexie from "dexie";

export default class Database {
    constructor() {
        this.db = new Dexie("simprov");
    }

    addData(data, storeName = 'provenance') {
        return this.db[storeName].add(data);
    }

    bulkAddData(bulkData, storeName = 'provenance') {
        return this.db[storeName].bulkAdd(bulkData);
    }

    clearTable(storeName = 'provenance') { //Todo check table exists
        return this.db[storeName].clear();
    }

    // deleteTableContentByPrimaryKey
    deleteObject(primaryKey, storeName = 'provenance') {
        return this.db[storeName].delete(primaryKey); //Todo check table exists
    }

    deleteDB(dbName) { //Todo check DB exists
        this.db.close();
        return Dexie.delete(dbName);
    }

    existsDB(dbName = 'simprov') {
        return Dexie.exists(dbName);
    }

    fetchAll(storeName = 'provenance') {
        return this.db[storeName].toArray();
    }

    getObject(primaryKey, storeName = 'provenance') { //Todo check table exists
        return this.db[storeName].get(primaryKey);
    }

    initializeDB() {
        this.db.version(1).stores({
            provenance: "stateCUID"
        });
    }

    listAllDB() {
        return Dexie.getDatabaseNames();
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