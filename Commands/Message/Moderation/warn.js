/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "warn",
    category: "Moderation",
    aliases: [],
    description: "Warn members.",
    args: true,
    usage: [],
    examples: [],
    memberPermissions: ["ManageGuild"],
    botPermissions: [ "SendMessages" ],
    owner: true,
    async execute(message, args) {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) message.channel.send("Please provide valid members!");
        const reason = args.slice(1).join(" "); 
        const warn = await message.client.warn.findOne({ GuildId: message.guild.id, Member: member.id });
		if (!warn) {
            await message.client.warn.create({
                GuildId: message.guild.id,
                MemberId: member.id,
                Reason: [reason],
                Executor: [message.author.tag],
                Count: 1
            });
            message.channel.send(`${member} have been warned for the first time!`);
        } else {
            warn.Reason.push(reason);
            warn.Executor.push(message.author.tag);
            warn.Count++
            warn.save((error, data) => {
                if (error) return message.channel.send("There was an error when executing this command!");
                message.channel.send(`${member} have been warned, now have ${warn.Count} total of warn!`);
            })
        }

    }
}