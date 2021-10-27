'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, callback) {

  db.createTable('user', {
    id: {
      type: 'bigint',
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: 'string',
      length: 50,
      unique: true
    },
    password: {
      type: 'string',
      length: 150
    },
    name: {
      type: 'string',
      length: 100
    },
    email: {
      type: 'string',
      length: 50,
      unique: true
    },
    mobile: {
      type: 'string',
      length: 20,
    },
    status: {
      type: 'string',
      length: 20,
      defaultValue: 'PENDING', //  A - Approved, R - Requested, P - Pending, D - Disable, T - Terminated
    },
    last_login_at: {
      type: 'int',
      notNull: false,
    },
    created_by: {
      type: 'int',
    },
    created_at: {
      type: 'int',
    },
    updated_by: {
      type: 'int',
      notNull: false,
    },
    updated_at: {
      type: 'int',
      notNull: false,
    },
  }, function (err) {
    if (err) return callback(err);
    return callback();
  });

};

exports.down = function (db, callback) {
  db.dropTable('user', callback);
};

exports._meta = {
  "version": 1
};
