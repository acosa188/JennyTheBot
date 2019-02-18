
var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');

//utility
var util = require('./common/Utility.js')

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client();
bot.login(auth.token);

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
            case 'pasok':
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
            case 'alis':
                message.member.voiceChannel.leave();
                message.channel.send("As you wish master - " + message.author);
            break;
            // Just add any case commands if you want to..
         }
     }
});
