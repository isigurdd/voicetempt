/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "unban",
    category: "Moderation",
    aliases: [],
    description: "Unban members.",
    args: true,
    usage: ['{userid} {reason}'],
    examples: ['5139538315831 sudah tobat'],
    memberPermissions: ["ManageGuild"],
    botPermissions: [ "SendMessages" ],
    owner: true,
    async execute(message, args) {

        const member = args[0];
        let reason = args.slice(1).join(" "); 
        if (!reason) reason = "No reason provided" 

        message.guild.members.unban(member, {
            reason: `${reason} by ${message.author.tag}`
        })
        .then(user => {
            message.channel.send(`**${user.user?.tag ?? user.tag ?? user}** has been unbanned by **${member.user.tag}** with following reason **${reason}**`)
        })

    }
}