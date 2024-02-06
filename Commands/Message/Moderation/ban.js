/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ban",
    category: "Moderation",
    aliases: [],
    description: "ban members.",
    args: true,
    usage: ['{member} {reason}'],
    examples: [],
    memberPermissions: ["ManageGuild"],
    botPermissions: [ "SendMessages" ],
    owner: true,
    async execute(message, args) {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) message.channel.send("Please provide valid members!");
        const reason = args.slice(1).join(" "); 

        message.guild.members.ban(member, { reason: `${reason} by ${message.author.tag}` })
        .then(banInfo => {
            message.channel.send(`Sucessfully banned **${banInfo.user?.tag ?? banInfo.tag ?? banInfo}** from server`);
        })

    }
}