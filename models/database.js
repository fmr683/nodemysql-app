const mysql = require('mysql');

const config = require('config');

const DB_CON = process.env.DATABASE_URL || config.get('DATABASE_URL');

const POOL = mysql.createPool(DB_CON);
//const POOL_PROMISE = mysql2.createPool(DB_CON);


class DB {

    /*
    
      @param: 
          $query (SQL)
          data {Array} user values (Optional)
          cb JS Call back function
          debug true/false to print the SQL
    */

    static dbQuery(query, data, cb, debug = false) {

        POOL.getConnection(function (err, conn) {

            conn.query(query, data, function (error, results, fields) {

                conn.release();
                //if (error) console.log(error);
                if (debug) console.log(this.sql);

                cb(error, results);
            });
        });

    }
}

module.exports = {
    DB,
    POOL
}