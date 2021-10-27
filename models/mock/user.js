'use strict';

// Here we write only additional functions which required for the test cases

const Model = require("../model");
const { DB } = require("../database");

module.exports = class User extends Model {

    constructor() {
        super();
    }

    static tableName() {

        return "user";
    }

    /*
        @param:
            Data {Array} : email, password, and Other fields from the user table
            cb callback function
        Return db insertion status
    */
    static mockCreateUser(data, cb) {

        return DB.dbQuery(`INSERT INTO ${User.tableName()} (clientId, username, name, password, alias, email, mobile, serviceNumber, status, created_by, created_at, notes, role_id) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, data, cb);
    }


    /*
       @param:
           email {Email} : user username
           cb callback function
       Return user result
   */
    static mockDelete(username, cb) {

        return DB.dbQuery(`DELETE FROM ${User.tableName()} WHERE username LIKE ? LIMIT 1`, [username + "%"], cb);
    }


    /*
      @param:
          email {Email} : user email
          cb callback function
      Return user result
  */
    static mockGetTokenDetailsBy(email, cb) {

        return this.dbQuery(`SELECT reset_password_token FROM ${User.tableName()} WHERE email = ? LIMIT 1`, [email], cb);
    }


    /*
       @param:
            email {String} User email address
            time {String} - old/new to identify update the unixtime to old or new time in the database
            cb callback function
       Return db update status
    */
    static mockUpdateTokenExpiryTime(email, time, cb) {

        let sql = '';
        if (time == "old") sql = 'UNIX_TIMESTAMP() - 7200'
        else
            sql = 'UNIX_TIMESTAMP() + 3600'

        return DB.dbQuery(`UPDATE ${User.tableName()} SET 
                reset_password_expires = `+ sql + `
                WHERE email = ? LIMIT 1`, [email], cb);
    }


    /*
        @param:
            mobile {String} : user mobile
            serviceNumber {String} : User service number
            cb callback function
        Return user result
    */
    static mockDeleteUsers(mobile, serviceNumber, cb) {

        return DB.dbQuery(`DELETE FROM ${User.tableName()} WHERE mobile = ? AND serviceNumber = ? `, [mobile, serviceNumber], cb);
    }

}