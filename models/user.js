'use strict';

const jwt = require('jsonwebtoken');
const Model = require("./model");
const { DB, POOL } = require("./database");
const isEmpty = require('is-empty');
const config = require('config');


module.exports = class User extends Model {

    constructor() {
        super();
    }

    static tableName() {

        return "user";
    }

    /*
        @param:
            Data {Object} : email and Other fields from the user table
            tabledeletedArray {Array}: tabledeletedArray ids
            cb callback function
        Return db insertion status
    */
    static createUser(data, tabledeletedArray = [], cb) {


        if (isEmpty(investigationArray.length)) { // No record of investigation so just add only the user
            return User.insert(data, cb);
        }

        POOL.getConnection(function (error, CONN) {

            CONN.beginTransaction(function (error) {

                if (error) {
                    CONN.rollback(function () {
                        CONN.release();
                        return cb(error);
                    });
                } else {

                    CONN.query(`INSERT INTO ${User.tableName()}  SET ? `, data, function (error, result) {
                        if (error) {
                            CONN.rollback(function () {
                                CONN.release();
                                return cb(error);
                            });

                        } else {

                            let sql = `INSERT INTO ${tabledeleted.tableName()} (user_id, tabledeleted_id) VALUES ? `;

                            let dataValues = [];

                            if (isEmpty(result)) return cb('error');

                            investigationArray.forEach(function (val, index) {
                                dataValues.push([result.insertId, val]);
                            })

                            CONN.query(sql, [dataValues], function (error) {
                                if (error) {
                                    CONN.rollback(function () {
                                        CONN.release();
                                        return cb(error);
                                    });

                                } else {
                                    CONN.commit(function (error) {
                                        if (error) {
                                            CONN.rollback(function () {
                                                CONN.release();
                                                return cb(error);
                                            });
                                        } else {
                                            CONN.release();
                                            return cb(null, result);
                                        }
                                    });
                                }

                            });
                        }


                    });

                }

            }); // End Transaction
        });
    }

    /*
        @param:
            Data {Object} : email and Other fields from the user table
            id {Int}: User id primary key from user table
            cb callback function
        Return db insertion status
    */
    static updateUser(data, id, tabledeletedArray = [], cb) {

        POOL.getConnection(function (error, CONN) {

            CONN.beginTransaction(function (error) {

                if (error) {
                    CONN.rollback(function () {
                        CONN.release();
                        return cb(error);
                    });

                } else {

                    CONN.query(`UPDATE ${User.tableName()} SET ?  WHERE id = ?  LIMIT 1`, [data, id], function (error, result) {
                        if (error) {
                            CONN.rollback(function () {
                                CONN.release();
                                return cb(error);
                            });

                        } else {
                            CONN.query(`DELETE FROM ${InvestigationUserMapping.tableName()} WHERE user_id = ?`, [id], function (error) { // Delete the existing record from mapping table
                                if (error) {
                                    CONN.rollback(function () {
                                        CONN.release();
                                        return cb(error);
                                    });

                                } else {

                                    if (isEmpty(investigationArray.length)) { // No Investigation result so initiate the commit here

                                        CONN.commit(function (error) {
                                            if (error) {
                                                CONN.rollback(function () {
                                                    CONN.release();
                                                    return cb(error);
                                                });
                                            } else {
                                                CONN.release();
                                                return cb(null, result);
                                            }
                                        });

                                    } else {
                                        // Investigation result is not empty
                                        let sql = `INSERT INTO ${tabledeleted.tableName()} (user_id, tabledeleted_id) VALUES ? `;

                                        let dataValues = [];

                                        if (isEmpty(result)) return cb('error');

                                        tabledeletedArray.forEach(function (val, index) {
                                            dataValues.push([id, val]);
                                        })

                                        CONN.query(sql, [dataValues], function (error) {
                                            if (error) {
                                                CONN.rollback(function () {
                                                    CONN.release();
                                                    return cb(error);
                                                });

                                            } else {
                                                CONN.commit(function (error) {
                                                    if (error) {
                                                        CONN.rollback(function () {
                                                            CONN.release();
                                                            return cb(error);
                                                        });

                                                    } else {
                                                        CONN.release();
                                                        return cb(null, result);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }

                            });
                        }
                    });
                }
            }); // End Transaction
        });
    }

    /*
        @param:
            Data {Array} : email and status
            cb callback function
        Return user result
    */
    static login(data, cb) {

        return this.dbQuery(`SELECT ${User.tableName()}.id, ${User.tableName()}.name, username, email, password, status, mobile, FROM 
        
        ${User.tableName()}
        
        
        
        WHERE username = ? LIMIT 1`, data, cb);
    }


    /*
       @param:
           Data {Object} : id (User id)
           cb callback function
       Return user result
   */
    static getById(data, cb) {

        return this.dbQuery(`SELECT ${User.tableName()}.id, ${User.tableName()}.name, username, email, status,  mobile, FROM 
    
        ${User.tableName()}
        
        
        WHERE ${User.tableName()}.id = ?  LIMIT 1`, [data.id], cb);
    }

    static getNameById(data, cb) {

        return this.dbQuery(`SELECT ${User.tableName()}.name FROM

         ${User.tableName()}
         WHERE ${User.tableName()}.id = ?  LIMIT 1 `, [data.id], cb);

    }

    static getNamesByIds(data, cb) {

        return this.dbQuery(`SELECT ${User.tableName()}.name FROM
        ${User.tableName()}
        WHERE ${User.tableName()}.id IN (?) `, [data.id], cb);
    }


    /*
       @param:
           email {String} : User Email address
           cb callback function
       Return user result
   */
    static findByEmail(email, cb) {

        return DB.dbQuery(`
    SELECT id, username, name, email, mobile, serviceNumber, status, last_login_at FROM ${this.tableName()} 
    WHERE email = ? LIMIT 1
    `, [email], cb);
    }

    /*
       @param:
           data {Object} : Useername
           cb callback function
       Return user result
   */
    static findByUsername(data, cb) {

        let dataArray = [data.username];
        let sql = "";

        if (data.id) {
            sql = " AND id != ? "
            dataArray.push(data.id)
        }


        return DB.dbQuery(`SELECT id, username, name, email, mobile, status, last_login_at FROM ${this.tableName()} WHERE username = ? ${sql} LIMIT 1`, dataArray, cb);
    }


    /*
         @param:
             dataValues {Array} User id and  token
             cb callback function
         Return db update status
     */
    static updateLastLogin(dataValues, cb) {

        return DB.dbQuery(`UPDATE ${User.tableName()} SET 
            last_login_at = UNIX_TIMESTAMP(), token = ?
                WHERE id = ?  LIMIT 1`, dataValues, cb);
    }

    /*
        @param:
             id {int} User id 
             cb callback function
        Return db update status
     */
    static updateTokenAndPassword(id, dataValues, cb) {

        return DB.dbQuery(`UPDATE ${User.tableName()} SET 
                password = ?,
                reset_password_token = ?,
                reset_password_expires = ?
                WHERE id = ? LIMIT 1`, [...dataValues, id], cb);
    }

    /*
        @param:
            Data {Array} : email, password, and Other fields from the user table
            id {int} User id
            cb callback function
        Return db update status
    */
    static updateTokenResetDetails(data, id, cb) {


        return DB.dbQuery(`UPDATE ${User.tableName()} SET 
            reset_password_token = ?,
            reset_password_expires = ?,
            updated_by = ?,
            updated_at = ?
                WHERE id = ? AND LIMIT 1`, [...data, id], cb);
    }

    /*
        @param:
            user object details eg: id, email, name and etc fields from user table
        Return the JWT token
    */
    static getJwt(user) {

        let data = {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            token: user.token
        };

        // https://github.com/zeit/ms
        return jwt.sign(data, config.get('jwtSecKey'), { expiresIn: '1d' }); // expire the token in 1 day
    }

    /*
        @param:
            data {Array} : token, expiration and email
            cb callback function
        Return user results
    */
    static tokenValidity(data, cb) {

        return this.dbQuery(`SELECT id, email FROM ${User.tableName()} WHERE reset_password_token = ? AND reset_password_expires > ? LIMIT 1`, data, cb);
    }


    /*
          @param:
            token {String} : token
            status {String}: User status
            cb callback function
        Return decoded JWT details
    */
    static validateJwt(token, status, cb) {

        let that = this;
        jwt.verify(token, config.get('jwtSecKey'), function (error, decoded) {

            if (error) return cb(error);

            that.dbQuery(`SELECT ${that.tableName()}.id, ${that.tableName()}.status, username, token, name, email
            FROM ${that.tableName()}, 
            WHERE

             ${that.tableName()}.id = ? AND ${that.tableName()}.status= ?   LIMIT 1`, [decoded.id, status,], function (error, result) {

                cb(error, result, decoded);

            })
        });
    }


    /*
   @param:
       data {Array} : User Ids
       cb callback function
   Return user result
*/
    static userValidationCount(data, cb) {

        return DB.dbQuery(`SELECT  COUNT(id) AS count FROM ${User.tableName()} WHERE id IN (?)  `, [data], cb);
    }

}
