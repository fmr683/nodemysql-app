'use strict';

const { DB } = require("./database");

module.exports = class Model extends DB {

    constructor() {
        super();
    }

    static insert(data, cb) {

        return DB.dbQuery(`INSERT INTO ${this.tableName()} SET ?`, data, cb);
    }

    static get(id, cb) {

        return DB.dbQuery(`SELECT * FROM ${this.tableName()} WHERE id = ? LIMIT 1`, [id], cb);
    }

    static getAll(cb) {

        return DB.dbQuery(`SELECT * FROM ${this.tableName()} ORDER BY order_id ASC`, [], cb);
    }


    static delete(id, cb) {

        return DB.dbQuery(`DELETE FROM ${this.tableName()} WHERE id = ?  LIMIT 1`, [id], cb);
    }

    static update(data, id, cb) {

        return DB.dbQuery(`UPDATE ${this.tableName()} SET ?  WHERE id = ? LIMIT 1`, [data, id], cb);
    }
}