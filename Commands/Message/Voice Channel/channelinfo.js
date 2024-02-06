/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "channelinfo",
    category: "Voice Channel",
    aliases: [ "ci" ],
    description: "Show information about your voice channel.",
    args: false,
    usage: [],
    examples: [],
    memberPermissions: [],
    botPermissions: [ "SendMessages", "ManageChannels" ],
    owner: false,
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor("#00FF00");
        const embedError = new EmbedBuilder()
            .setColor("#FF0000");

        if (!message.channel.isVoiceBased()) return;

        const memberVC = message.member.voice.channel;
        if (!memberVC) return;

        const getAVC = await message.client.avc.findOne({ GuildId: message.guild.id }).exec();
        if (!getAVC) return;

        const getCreateChannel = getAVC.CreateChannel;
        if (getCreateChannel.includes(memberVC.id)) return;
        if (getCreateChannel.includes(message.channel.id)) return;
        if (memberVC.id !== message.channel.id) {
            embedError.setDescription(`Use this command on Voice Chat ${memberVC}`);
            return message.channel.send({ embeds: [embedError] });
        }

        const getSecondaries = await message.client.secondaries.findOne({ GuildId: message.guild.id, ChannelId: memberVC.id }).exec();
        if (!getSecondaries) {
            embedError.setDescription(`You're not on my channel!`);
            return message.channel.send({ embeds: [embedError] });
        }

        const ChannelName = getSecondaries.ChannelName || memberVC.name;
        const ChannelID = memberVC.id;
        const ChannelOwner = getSecondaries.ChannelCreator;
        const ChannelBitrate = memberVC.bitrate / 1000;
        const ChannelRegion = memberVC.rtcRegion || "Automatically";
        const ChannelMembers = memberVC.members.filter(m => !m.user.bot).size;
        const botSize = memberVC.members.filter(m => m.user.bot).size;

        let owner;
        if (ChannelOwner === "0") {
            const ChannelRole = getSecondaries.ChannelRole;
            const getChannelRole = message.guild.roles.cache.get(ChannelRole);
            owner = `${getChannelRole} \`[${ChannelRole}]\``;
        } else {
            const getChannelOwner = message.guild.members.cache.get(ChannelOwner);
            owner = `${getChannelOwner} \`[${ChannelOwner}]\``;
        }

        const embedChannelInfo = new EmbedBuilder()
            .setAuthor({ name: "Channel Info", iconURL: message.client.user.displayAvatarURL() })
            .setColor(message.client.color)
            .setFooter({ text: `Request by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setDescription(`
${ChannelName} \`[${ChannelID}]\`
${owner}
${ChannelBitrate} kbps
${ChannelRegion}
${ChannelMembers} users & ${botSize} bots`)
        message.channel.send({ embeds: [embedChannelInfo] });
    }
}