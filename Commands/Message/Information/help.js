/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "help",
    category: "Information",
    aliases: [ "h" ],
    description: "Show all commands, or one specific command",
    args: false,
    usage: [],
    examples: [],
    memberPermissions: [],
    botPermissions: [ "SendMessages"],
    owner: false,
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor(message.client.color)
            .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({ text: `Request by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setDescription(`**Daftar Perintah**\n
**Perintah Voice Channel**
**Bitrate**  - Untuk mengganti **Bitrate** Voice Channel.
**Limit** - Untuk mengganti **User Limit** Voice Channel.
**Name** - Untuk mengganti **Name** Voice Channel.
**Region**- Untuk mengganti **Region** Voice Channel.
**VoiceKick** - Untuk Mengeluarkan seseorang dari Voice Channel.
**Claim** - Untuk klaim kepemilikan Voice Channel.
**ChannelInfo**- Untuk Melihat info Voice Channel.
**Transfer** - Untuk Memindahkan kepemilikan Voice Channel`);
        return message.channel.send({ embeds: [embed] });
        
    }
};
