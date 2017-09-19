const Discord = require("discord.js");
const YTDL = require("ytdl-core");
const ms = require("ms");

const TOKEN = "MzE3Njg1NjkzMzEwNTY2NDAw.DKIkbg.nYkpNqMa4n2vIxe_H2rb-E5xMrU"
const PREFIX = "$$"
const ROLE = "moderators"

// Functions

function generateHex() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function isAllowed(member) {
    return member.roles.find("name", ROLE) ? true : false;
}

function fromMention(mention, guild) {
    mention = mention.substring(2);
    mention = mention.slice(0, -1);

    return guild.members.get(mention);
}

function play(connection, message) {
    var server = servers[message.guild.id];

    server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

    server.queue.shift();

    server.dispatcher.on("end", function() {
        if (server.queue[0]) play(connection, message);
        else connection.disconnect();
    });
}

var fortunes = [
    ":speech_balloon: My mind says yes!",
    ":speech_balloon: I'm gonna say, nah!",
    ":speech_balloon: Perhaps, maybe",
    ":speech_balloon: Hmm... I've got nothing.",
    ":speech_balloon: I'm gonna answer that later.",
    ":speech_balloon: Not gonna answer that.",
];

var bot = new Discord.Client();

var servers = {};

// Guild Events

bot.on("ready", function(){
    console.log(`Ready as: ${bot.user.tag}`);
});

bot.on('guildCreate', function(){
    console.log(`A New Guild Has Been Added! : ${guild.name}, Owned By ${guild.owner.user.username}`);
});

// Commands

bot.on("message", function(message) {
    if (message.author.equals(bot.user)) return;

    if (!message.content.startsWith(PREFIX)) return;

    var args = message.content.substring(PREFIX.length).split(" ")

    switch (args[0].toLowerCase()) {
        case "other":
            var embed = new Discord.RichEmbed()
                .addField("Other Commands", "Here are all of the commands available for this bot!", true)
                .addField("$$music", "Displays the music commands. *This feature is currently broken.*")
                .addField("$$8ball", "Ask any question and it will reply back to you!")
                .addField("$$roll", "Rolls a die.")
                .addField("$$ily", "Loves you back. <3")
                .addField("$$punch", "Punches the bot.")
                .addField("$$info", "Gives you information about the bot.")
                .addField("$$lenny", "Types in the Lenny face in chat.")
                .addField("$$social", "Gives you social media links of the main author of the bot.")
                .addField("$$ping", "Calculates your current response time in milleseconds.")
                .addField("$$bugs", "Shows all bugs we are fixing at the moment.")
                .addField("$$noticeme", "Sees you!")
                .setColor(0x00FFFF)
                .setFooter("More commands will be added in the future! :)")
                .setThumbnail(message.author.avatarURL)
            message.channel.sendEmbed(embed);  
            break;
        case "about":
            message.channel.sendMessage("I am a bot that requires me to run the Rahzyy bot to run much more better! :) :)")
            break;
        case "8ball":
            if (args[1]) message.channel.sendMessage(fortunes[Math.floor(Math.random() * fortunes.length)]); 
            else message.channel.sendMessage("I cannot seem to read that...")
            break;
        case "help":
            var embed = new Discord.RichEmbed()
                .addField("Rahzyy", "*I'm a bot that is only found in the Rahzyy Community.*", true)
                .addField("$$help", "Obviously, DMs you a list of commands.")
                .addField("$$admin", "Lists all the administrator commands.")
                .addField("$$other", "Displays all of the other commands that this bot has!")
                .setColor(0x00FFFF)
                .setFooter("More commands will be added in the future! :)")
                .setThumbnail(message.author.avatarURL)
            message.author.sendEmbed(embed);
            break;
        case "noticeme":
            message.channel.sendMessage(message.author.toString() + " I see you! :stuck_out_tongue_winking_eye: :stuck_out_tongue_winking_eye:")
            break;
        case "removerole":
            if (message.author.id !== "274758167563599873") 
            return message.reply(":x: You do not have permission to use this. " + message.author)

            message.member.removeRole(message.member.guild.roles.find("name", "members"));
            break;
        case "deleterole":
            if (message.author.id !== "274758167563599873") 
            return message.reply(":x: You do not have permission to use this. " + message.author)

            message.guild.roles.find("name", "members").delete();
            break;
        case "play":
            if (!args[1]) {
                message.channel.sendMessage("Please provide a link or the name of the song!");
                return;
            }

            if (!message.member.voiceChannel) {
                message.channel.sendMessage("You must be in a voice channel!");
                return;
            }

            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            };

            var server = servers[message.guild.id];

            server.queue.push(args[1]);

            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
                play(connection, message);
            });
            break;
        case "skip":
            var server = servers[message.guild.id];

            if (server.dispatcher) server.dispatcher.end();
            break;
        case "stop":
            var server = servers[message.guild.id];

            if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
            break;
        case "music":
            message.channel.sendMessage(":notes: This feature is not currently working at this time, but the author of these bots are in progress of solving the issue. I am sorry for your inconvenience... :notes:")
            break;
        case "ban":
            if (message.author.id !== "274758167563599873") 
            return message.reply(":x: You do not have permission to use this. " + message.author)

            if (!args[1]) return message.channel.sendMessage("You must specify a username.")

            let target = fromMention(args[1], message.guild);

            if (!target) return message.channel.sendMessage("That user seems to be invalid. Please check your mistakes, if you did!")
            if (!args[2]) return message.channel.sendMessage("Reason: You have broken the rules of Razz Nation... :(")

            args.slice(0, 2);
            let reason = args.join(" ");

            message.channel.sendMessage(target.toString() + " has earned the ban hammer for" + reason).then(function() {
                target.sendMessage("You have earned the ban hammer for" + reason).then(target.kick);
            }); 
            break;
        case "prune":
            if (message.author.id !== "274758167563599873") 
            return message.reply(":x: You do not have permission to use this. " + message.author)

            let count = args[1] > 100 ? 100 : args[1] || 100;

            if (args[2]) {
                let target = fromMention(args[1], message.guild);

                if (!target) return message.channel.sendMessage("That user seems to be invalid. Please check your mistakes, if you did!")

                let i = 0;

                message.channel.fetchMessages({amount: Number.MAX_VALUE}).then(function(messages) {
                    message.channel.bulkDelete(messages.filter(function(m) {
                       if (m.member.id == target.id && 1 < count) {
                           i++; return true;
                       }
                       return false; 
                    }));
                });
            } else {
                message.channel.bulkDelete(count);
            }
            break;
        case "mute":
            if (message.author.id !== "274758167563599873") 
            return message.reply(":x: You do not have permission to use this. " + message.author)

            var ms = require("ms")
            let member = message.mentions.members.first();
            if(!member) return message.reply("Wagwun, you haven't mentioned a member!");
            let muteRole = message.guild.roles.find("name", "Muted");
            if(!muteRole) return message.reply("Wagwun, you haven't got a role by the name of 'Muted'");
            let params = message.content.split(" ").slice(1);
            let time = params[1];
            if(!time) return message.reply("Wagwun, there is no specified, please specify amount of time to mute for!");
            
            member.addRole(muteRole.id);
            message.channel.sendMessage(`Wagwun bif ting, you've been muted for ${ms(ms(time), {long: true})} ${member.user.tag}`);

            setTimeout(function() {
                member.removeRole(muteRole.id);
                message.channel.sendMessage(`${member.user.tag} Wagwun, you've been unmuted! The mute lasted: ${ms(ms(time), {long: true})} ${member.user.tag}`);
            }, ms(time));
            break;
        case "lenny":
            message.channel.sendMessage("( ͡° ͜ʖ ͡°)");
            break;
        case "info":
            message.author.sendMessage("N/A");
            break;
        case "social":
            message.channel.sendMessage("Follow the author of the bots on these social media platforms!: Twitter: http://twitter.com/akaRazyy Youtube: https://goo.gl/KWX0gN Instagram: https://www.instagram.com/uhhrazy/");
            break;
        case "hello":
            message.channel.sendMessage('Well hello there my friend, ' + message.author.username);
            break;
        case "bugs":
            message.channel.sendMessage('Current number of bugs: 1 (Reason: When typing other commands from $$help, commands executed from $$help will say "Invalid Command". In Reality, it is still working like normal.');
            break;
        case "say":
            if(args.length === 1) {
                message.channel.sendMessage('It looks like you have typed this wrong. Try typing $$say [message]');
            } else {
                message.channel.sendMessage(args.join(' ').substring(5));
            }
            break;
        case "ily":
            message.channel.sendMessage(message.author.username + ' I love you too <3');
            break;
        case "ping":
            message.channel.sendMessage(`*Pongs!* \`${Date.now() - message.createdTimestamp} ms\``);
            break;
        case "admin":
        if (message.author.id !== "274758167563599873") 
        return message.reply(":x: You do not have permission to use this. " + message.author)
            
            var embed = new Discord.RichEmbed()
                .addField("Owner Commands", "Displays all of the available owner commands!", true)
                .addField("$$kick", "Kicks the specified user out of the server!")  
                .addField("$$ban", "Bans the specified user.")
                .addField("$$mute", "Mutes the specified player for a certain amount of time! *This feature does not work properly*")
                .addField("$$prune", "Deletes the amount of specified messages. Usage: $$prune (amount)")
                .setColor(0x00FFFF)
                .setFooter("More commands will be added in the future! :)")
                .setThumbnail(message.author.avatarURL)
            message.author.sendEmbed(embed);
            break;
        case "punch":
            message.channel.sendMessage("Ouchies.... that hurts! :sob:")
            break;
        case "roll":
            var roll = Math.floor(Math.random() *6) + 1;
            message.reply("You rolled a " + roll);
            break;
        case "":

            break;
        default:
            message.channel.sendMessage("Unknown Command. Type $$help for a list of commands! :)")
    }
});

bot.login(TOKEN);
