
var logger = require('winston');
const youtubesearch = require("yt-search");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

var dbTools = require('../database/DBQueries.js');

function embeddedMsg(data){

  let _fields = [];
  data.name.forEach((songName)=>{
    _fields.push({name:songName,value:"Under construction!"});
  });

  let emdData = {embed:{
    color:3447003,
    author:{
      name: "Jenny The Bot"
    },
    title: "Playlist Songs",
    fields: _fields,
    timestamp: new Date()
  }};
  return emdData;
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

  }
}
