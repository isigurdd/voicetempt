/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "role",
    category: "Moderation",
    aliases: [],
    description: "Assign/Remove members roles.",
    args: true,
    usage: ['{member} {roles}'],
    examples: [],
    memberPermissions: ["ManageGuild"],
    botPermissions: [ "SendMessages" ],
    owner: true,
    async execute(message, args) {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) message.channel.send("Please provide valid members!");

        const roles = message.mentions.roles.first() || message.guild.members.cache.get(args.slice(1).join(" ")) || message.guild.roles.cache.find(r => r.name === args.slice(1).join(" "));
        if (!roles) return message.channel.send("Please provide valid roles!");

        const checkBot = message.guild.members.me.roles.highest.position;
        const checkAuthor = message.member.roles.highest.position;
        const checkRole = roles.position;

        

        if (checkRole > checkBot) return message.channel.send("I can't give the role because my role is lower than the role that will be given!");
        if (checkRole > checkAuthor) return message.channel.send("The role you enter is higher than the role you have!");

        if (member.roles.cache.has(roles)) {
            member.roles.removeRole({ user: member.id, role: roles.id, reason: `Removed by ${message.author.tag}`});
            message.channel.send(`Successfully remove ${roles.name} to ${member}`)
        } else {
            member.roles.addRole({ user: member.id, role: roles.id, reason: `Removed by ${message.author.tag}`});
            message.channel.send(`Successfully assign ${roles.name} to ${member}`)
        }
    }
}