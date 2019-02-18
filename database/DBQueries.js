const sqlite3 = require('sqlite3').verbose();

module.exports = {
  openDB: function(fileName){
     db = new sqlite3.Database(fileName, (err)=>{
      if(err){
        return console.error(err.message);
      }
      console.log('Connected to in-memory SQLite database');
    });
    return db;
  },

  closeDB:function(db){
    if(db){
      db.close((err)=>{
       if(err){
         return console.error(err.message);
       }
       console.log('Closing in-memory SQLite database');
     });
    }
  },

  createUserTable:function(db){
    let sql = "CREATE TABLE users (user_id INTEGER PRIMARY KEY,"+
                                  "user_name TEXT NOT NULL,"+
                                  "log_date TEXT NOT NULL)";

    db.run(sql,function(err){
      if(err){
        return console.log(err.message);
      }
    });

  },

  addUser:function(userID,userName,db){
    var logTime = new Date();
    let sql = "INSERT INTO users VALUES(?,?,?)";
    console.log("userID: " + userID);
    console.log("userName: " + userName);
    console.log("logDate: " + logTime);
    db.run(sql,[userID,userName,logTime.toString()],function(err){
      if(err){
        return console.log(err.message);
      }
      console.log('Rows inserted ${this.changes}');
    });
  }
}
