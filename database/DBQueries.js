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

//user table methods
  addUser:function(userID,userName,db,message){
    var logTime = new Date();
    let sql = "INSERT INTO users VALUES(?,?,?)";


    db.run(sql,[userID,userName,logTime.toString()],function(err){
      if(err){
        console.log("User: "+ userName +" is already added.");
        message.channel.send("Master - " + message.author + ", your account already exist.");
        return;
      }
      console.log('User: '+ userName +" is added!");
      message.channel.send("Master - " + message.author+ ", your account has been added.");
    });

  },

  createPlaylist:function(db){
    let sql = "CREATE TABLE playlist (playlist_id TEXT PRIMARY KEY,"+
                                     "playlist_name TEXT NOT NULL,"+
                                     "user_id INTEGER NOT NULL)";

    db.run(sql,function(err){
      if(err){
        return console.log(err.message);
      }
    });
  },

  //playlist methods
  addPlaylist:function(playlistID,playlistName,userID,db,message){
    let sql = "INSERT INTO playlist VALUES(?,?,?)";

    db.run(sql,[playlistID,playlistName,userID],function(err){
      if(err){
        console.log("playlist - "+ playlistName +" is already added.");
        message.channel.send("Master - " + message.author + ", playlist - "+ playlistName +" already exist.");
        return;
      }
      console.log('Playlist: '+ playlistName +" is added!");
      message.channel.send("Master - " + message.author + ", playlist - "+ playlistName +" has been added.");
    });
  },

  createSong:function(db){
    let sql = "CREATE TABLE songs (song_id INTEGER PRIMARY KEY AUTOINCREMENT,"+
                                  "song_name TEXT,"+
                                  "song_link TEXT,"+
                                  "song_author TEXT,"+
                                  "playlist_id TEXT,"+
                                  "user_id INTEGER NOT NULL)";

    db.run(sql,function(err){
      if(err){
        return console.log(err.message);
      }
    });
  },

  //songs methods
  songToPlaylist:function(songName, songLink, songAuthor, playlistID,userID,db,message){
    let sql = "INSERT INTO songs (song_name,song_link,song_author,playlist_id,user_id) VALUES(?,?,?,?,?)";

    db.run(sql,[songName,songLink,songAuthor,playlistID,userID],function(err){
      if(err){
        console.log(err.message);
        console.log("song - "+ songName +" is already added.");
        message.channel.send("Master - " + message.author + ", song - "+ songName +" already exist.");
        return;
      }
      console.log('song: '+ songName +" is added!");
      message.channel.send("Master - " + message.author + ", song - "+ songName +" has been added.");
    });
  },

  getSongsByPlaylistID:function(playlistID,db){
    let sql = "SELECT s.song_name,s.song_link, s.song_author "+
              "FROM songs s "+
              "WHERE s.playlist_id = ?";

    return new Promise(function(resolve, reject){
      db.all(sql,[playlistID],function(err, rows){
        if(err){
          reject(err.message);
        }
        resolve(rows);
      });
    });
  },

  updateSongLink:function(songName, songLink ,db){
    let sql = "UPDATE songs "+
              "SET song_link = ?"+
              "WHERE song_name = ?";
    db.run(sql,[songLink,songName],function(err){
      if(err){
        return console.log(err.message);
      }
      console.log(songName + ' --- URL updated');
    });
  }
}
