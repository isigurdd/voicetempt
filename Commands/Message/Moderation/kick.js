/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "kick",
    category: "Moderation",
    aliases: [],
    description: "kick members.",
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

        if (!message.guild.members.cache.get(member.id).kickable) return message.reply("<a:no:893059567427133451> | I cannot kick this member!");

        message.guild.members.kick(member.id, `${reason} by ${message.author.tag}`)
        .then(kickInfo => {
            message.channel.send(`**${kickInfo.user?.tag ?? kickInfo.tag ?? kickInfo}** has been kicked from server`);
        })

    }
}