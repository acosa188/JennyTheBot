
var logger = require('winston');
const youtubesearch = require("yt-search");
const youtube = require("ytdl-core-discord");
const refme = this;
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

var dbTools = require('../database/DBQueries.js');

async function playSong(connection, playlist){
  var dispatcher = connection.playOpusStream(await youtube(playlist[0].song_link));

  if(playlist.length != 0){
    playlist.shift();
  }
  dispatcher.on("end", function(){
    if(playlist[0]){
      playSong(connection,playlist);
    }else{
      console.log("done");
    }
  });
}
module.exports = {
  displaySongs:function(playlistID,db,message){

    dbTools.getSongsByPlaylistID(playlistID,db).then(res=>{
      let songListObj = [];
      let msg = "Songs          \n\n";
      res.forEach((row)=>{
        songListObj.push({name:row.song_name,link:row.song_link,author:row.song_author});
        msg += row.song_name + "\n";
      });
      //embeded messages
      let _fields = [];
      songListObj.forEach((song)=>{
        _fields.push({name:song.name,value:"Author: "+ song.author +"\n Link: "+ song.link +"\n"});
      });
      let emdData = {embed:{
        color:3447003,
        author:{
          name: "Playlist Songs"
        },
        title: "",
        fields: _fields,
        timestamp: new Date()
      }};

      message.channel.send(emdData);
      //message.channel.send(msg);
    }).catch(err=>{
        console.log(err);
    });

  },
  searchSong:function(args){
    return new Promise(function(resolve,reject){
      youtubesearch(args, function(err,res){
        const URL = "https://www.youtube.com";
        //Error handling
        if(err){
          reject("Something went wrong, when searching..");
        }

        let videos = res.videos.slice(0,1);
        resolve(videos[0]);
      });
    });
  },

  playSong:async function(connection, playlist){
    var dispatcher = connection.playOpusStream(await youtube(playlist[0].song_link));

    if(playlist.length != 0){
      playlist.shift();
    }
    dispatcher.on("end", function(){
    if(playlist[0]){
      playSong(connection,playlist);
    }else{
      console.log("done");
    }
  });

  },
  playSongs: async function(connection, playlistID, db){
    var songsQueue = [];
    dbTools.getSongsByPlaylistID(playlistID,db).then(res=>{
      res.forEach((row)=>{
        songsQueue.push(row);
      });
      this.playSong(connection,songsQueue);
    }).catch(err=>{
        console.log(err);
    });
  },

  checkUserExist: async function(userID,db){
      return dbTools.checkUserExist(userID,db).then(function(res){
        return res;
      }).catch(err=>{
        console.log(err);
      });
  }
}
