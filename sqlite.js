const sqlite =  require('sqlite3');

const sqliteDB ={
    setUp : function(){
        let db = new sqlite.Database('./mydb.sqlite');
        db.run("CREATE TABLE IF NOT EXISTS comparison(id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT , deepspeechText TEXT, googleText TEXT,audioLength INTEGER)");
        db.close();
    },

    insertData: function(path,deepspeechText,googleText,audioLength){
        let db = new sqlite.Database('./mydb.sqlite');
        db.run('INSERT INTO comparison (path,deepspeechText,googleText,audioLength) VALUES (?,?,?,?)',[path,deepspeechText,googleText,audioLength]);
        db.close();
    }

}

module.exports = sqliteDB;