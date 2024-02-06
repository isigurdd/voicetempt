/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "timeout",
    category: "Moderation",
    aliases: [],
    description: "Timeout members.",
    args: true,
    usage: ['{member} {duration} {reason}'],
    examples: ['@ufibu 7d alasan'],
    memberPermissions: ["ManageGuild"],
    botPermissions: [ "SendMessages" ],
    owner: true,
    async execute(message, args) {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) message.channel.send("Please provide valid members!");
        const duration = ms(args[1]);
        const reason = args.slice(2).join(" "); 


        member.timeout(duration, reason)
        .then(user => {
            message.channel.send(`**${member.user.tag}** has been timeout for ${message.client.utils.mstodhms(duration)} because **${reason}** by **${message.author.tag}**`)
        })

    }
}