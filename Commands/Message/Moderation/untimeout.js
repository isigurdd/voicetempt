/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "untimeout",
    category: "Moderation",
    aliases: [],
    description: "Untimeout members.",
    args: true,
    usage: ['@user @reason'],
    examples: ['@ufibu masalah sudah selesai'],
    memberPermissions: ["ManageGuild"],
    botPermissions: [ "SendMessages" ],
    owner: true,
    async execute(message, args) {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) message.channel.send("Please provide valid members!");
        const reason = args.slice(1).join(" "); 


        member.timeout(null, reason)
        .then(user => {
            message.channel.send(`**${member.user.tag}** has been untimeout because **${reason}** by **${message.author.tag}**`)
        })

    }
}