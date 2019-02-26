var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');

//utility
var util = require('./common/Utility.js');
var musicbot = require('./common/MusicBot.js');

//Database
var db = require('./database/DBQueries.js');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client();
bot.login(auth.token);

let locDB = null;
//Initialize local Database
try{
  locDB = db.openDB("./database/localDB.db");
  db.createUserTable(locDB);
  db.createPlaylist(locDB);
  db.createSong(locDB);
}catch(err){
  logger.info(err.message);
}


bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

var musicDispatch = null;
bot.on('message',(message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.content.substring(0, 1) == '>') {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
            break;
            case 'enter':
              if(message.member.voiceChannel){
                if(!message.author.voiceConnection){
                    const connection = message.member.voiceChannel;

                    connection.join()
                    .then(connection => logger.info('Connected!'))
                    .catch(console.error);
                    message.channel.send("You called me master - " + message.author + "?");
                }
              }
              else {
                logger.info('Channel does not exist!');
              }
            break;

            case 'leave':
                message.member.voiceChannel.leave();
                message.channel.send("As you wish master - " + message.author);
            break;

            case 'playlist':
              if(args.length == 1){
                musicbot.checkUserExist(message.author.id,locDB).then(res=>{
                  if(res.length > 0){
                    db.addPlaylist(message.author.id.toString() + args[0].toString(), args[0].toString(),message.author.id,locDB,message);
                  }else{
                    logger.info('User does not exist');
                    logger.info('Creating user...');
                    db.addUser(message.author.id, message.author.username,locDB,message);
                    logger.info('Adding playlist '+ args[0].toString() +' ...');
                    db.addPlaylist(message.author.id.toString() + args[0].toString(), args[0].toString(),message.author.id,locDB,message);
                  }
                }).catch(err=>{
                  message.channel.send("Master - "+message.author+" there seems to be a problem!");
                });

              }else {
                message.channel.send("Master - " + message.author + ", you mean: <!playlist> <PlaylistName>?.");
              }

            break;

            case 'songToPlaylist':
            if(args.length == 2){
              var searchName = args[0];
              var res = musicbot.searchSong(searchName).then(res=>{
                db.songToPlaylist(res.title,'https://www.youtube.com'+res.url,res.author.name,message.author.id.toString() + args[1].toString(),message.author.id, locDB, message);
              }).catch(err=>{
                console.log(err.message);
              });
            }else {
              message.channel.send("Master - " + message.author + ", you mean: <!songToPlaylist> <SongName> <PlaylistName>?.");
            }

            break;

            case 'displaySongs':
            if(args.length == 1){
              musicbot.displaySongs(message.author.id.toString() + args[0], locDB, message);
            }else {
              message.channel.send("Master - " + message.author + ", you mean: <!displaySongs> <PlaylistName>?.");
            }

            break;

            case 'play':
            if(message.member.voiceChannel){
              if(!message.member.voiceConnection){
                  const connection = message.member.voiceChannel;
                  connection.join()
                  .then(connection => {
                    var searchName = args.join("");
                    var res = musicbot.searchSong(searchName).then(res=>{

                      musicbot.play(connection,'https://www.youtube.com'+res.url).then(res=>{
                        musicDispatch = res;
                        res.on("end", function(){
                          setTimeout(function(){
                            message.member.voiceChannel.leave();
                          },60000);
                        });
                      }).catch(err=>{
                        logger.info(err.message);
                      });

                      var emd =  {embed:{
                        color: 3447003,
                        author:{
                          name: " "
                        },
                        title: "",
                        fields: [
                          {
                            name:  "Playing",
                            value: res.title
                          }
                        ],
                        timestamp: new Date()
                      }
                    }
                      message.channel.send(emd);
                      
                    }).catch(err=>{
                      logger.info(err.message);
                    });

                  })
                  .catch(console.error);

              }
            }
            else {
              logger.info('Channel does not exist!');
            }

            break;

            case 'end':
              if(musicDispatch){
                musicDispatch.pause();
                musicDispatch.end();
              }

            break;

            case 'pause':
              if(musicDispatch){
                musicDispatch.pause();
              }
            break;

            case 'resume':
              if(musicDispatch){
                musicDispatch.resume();
              }
            break;
            case 'playSongs':
            if(message.member.voiceChannel){
              if(!message.author.voiceConnection){
                  const connection = message.member.voiceChannel;

                  connection.join()
                  .then(connection => {
                    musicbot.playSongs(connection,message.author.id.toString() + args[0],locDB);
                    //musicbot.playSong(connection,args[0]);
                    message.channel.send("Playing music!");
                  })
                  .catch(console.error);

              }
            }
            else {
              logger.info('Channel does not exist!');
            }
            break;
            case 'help':
            if(args.length == 0){
              musicbot.help(message);
            }else{
              message.channel.send("Master - " + message.author + ", you mean: [>help]?.");
            }

            break;
            // Just add any case commands if you want to..
         }
     }
});
