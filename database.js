const Database = require('better-sqlite3');

const db = new Database('log.db');

const stmt = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' and name='accessLog';`
    );

let row = stmt.get();

if (row == undefined) {
    const sqlInit = `
        CREATE TABLE accessLog ( id INTEGER PRIMARY KEY, 
            remoteaddr TEXT,
            remoteuser TEXT,
            time INTEGER, 
            method TEXT,
            url TEXT,
            protocol TEXT, 
            httpversion TEXT, 
            status INTEGER, 
            referer TEXT, 
            useragent TEXT);
    `;


    db.exec(sqlInit);
} else {
    console.log("Log database already exists.");
}
// Export all of the above as a module so that we can use it elsewhere.
module.exports = db