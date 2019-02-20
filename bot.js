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

bot.on('message', (message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.content.substring(0, 1) == '!') {
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

            case 'register':
              if(args.length == 0){
                db.addUser(message.author.id, message.author.username,locDB,message);
              }else {
                message.channel.send("Master - " + message.author + ", you mean: <!register>?.");
              }

            break;

            case 'playlist':
              db.addPlaylist(message.author.id.toString() + args[0].toString(), args[0].toString(),message.author.id,locDB,message);
            break;

            case 'songToPlaylist':
              var searchName = args[0];
              var res = musicbot.searchSong(searchName).then(res=>{
                db.songToPlaylist(res.title,'https://www.youtube.com'+res.url,res.author.name,message.author.id.toString() + args[1].toString(),message.author.id, locDB, message);
              }).catch(err=>{
                console.log(err.message);
              });


            break;

            case 'displaySongs':
            if(args.length == 1){
              musicbot.displaySongs(message.author.id.toString() + args[0], locDB, message);
            }else {
              message.channel.send("Master - " + message.author + ", you mean: <!displaySongs> <PlaylistName>?.");
            }

            break;

            // Just add any case commands if you want to..
         }
     }
});
