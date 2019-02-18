
var logger = require('winston');
const youtubesearch = require("yt-search");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

var dbTools = require('../database/DBQueries.js');

module.exports = {
  displaySongs:function(playlistID,db,message){

    dbTools.getSongsByPlaylistID(playlistID,db).then(res=>{
      let msg = "Songs          \n\n";
      res.forEach((row)=>{
        msg += row.song_name + "\n";
      });

      message.channel.send(msg);
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
