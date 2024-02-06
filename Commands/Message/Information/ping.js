/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ping",
    category: "Information",
    aliases: [],
    description: "Check Ping Bot",
    args: false,
    usage: [],
    examples: [],
    memberPermissions: [],
    botPermissions: [ "SendMessages" ],
    owner: false,
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor(message.client.color)
            .setDescription(`Websocket heartbeat: ${message.client.ws.ping}ms.`)
            .setFooter({ text: `Request by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
        const sent = await message.channel.send({ embeds: [embed] });
    
        embed.setDescription(`Websocket heartbeat: ${message.client.ws.ping}ms.\nRoundtrip latency: ${sent.createdTimestamp - message.createdTimestamp}ms.`)
        sent.edit({ embeds: [embed] });
    }
}