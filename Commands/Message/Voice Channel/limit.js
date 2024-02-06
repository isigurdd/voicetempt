
/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "limit",
    category: "Voice Channel",
    aliases: [],
    description: "Set the limit of your channel.",
    args: true,
    usage: [ "{Number}" ],
    examples: [ "5" ],
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

        const getChannelCreator = getSecondaries.ChannelCreator;
        const getWhitelist = getSecondaries.Whitelist;
        const getChannelRole = getSecondaries.ChannelRole;
        const hasAdmin = message.member.permissions.has("ManageChannels");
        const hasStaff = message.member.roles.cache.hasAny("773708648739373077",
"773708964482252840", "773788687519580200", "773723655346585630", "773723765661630464", "773788693348483072");

        if (getWhitelist) {
            const hasRole = message.member.roles.cache.has(getChannelRole);
            if (!hasRole && !hasStaff) {
                embedError.setDescription(`You cannot manage this channel!`);
                return message.channel.send({ embeds: [embedError] });
            }
        } else {
            if (getChannelCreator !== message.member.id && !hasStaff) {
                embedError.setDescription(`<a:no:893059567427133451> | Anda bukan pemilik voice channel ini, hanya <@${getChannelCreator}> yang dapat menggunakan perintah ini.`);
                return message.channel.send({ embeds: [embedError] });
            }
        }

        let rangeLimit;
        const getLimited = getAVC.Limited;
        if (getLimited) {
            rangeLimit = "2 - 99";
        } else {
            rangeLimit = "1 - 99";
        }

        let text = args[0];
        if (!text) {
            embedError.setDescription(`<a:no:893059567427133451> | Silahkan sertakan Limit beruka angka.`);
            return message.channel.send({ embeds: [embedError] });
        }
        if (isNaN(text)) {
            embedError.setDescription(`<a:no:893059567427133451> | Limit harus berupa angka (${rangeLimit}).`);
            return message.channel.send({ embeds: [embedError] });
        }

        let limit = Number(text);
        if (limit < 0) {
            embedError.setDescription(`<a:no:893059567427133451> | Limit harus lebih dari 0.`);
            return message.channel.send({ embeds: [embedError] });
        }
        if (limit > 99) {
            limit = 0;
        }
        if (getLimited) {
            if (limit > 0 && limit < 2) {
                embedError.setDescription(`<a:no:893059567427133451> | Limit tidak bisa kurang dari 2.`);
                return message.channel.send({ embeds: [embedError] });
            }
        }

        const fromLimit = memberVC.userLimit;

        memberVC.setUserLimit(limit)
        .then(async channel => {
            embed.setDescription(`<a:yes:893059568383438868> | Berhasil mengubah Limit voice channel anda menjadi **${limit}**.`);
            message.channel.send({ embeds: [embed] });
            await logs(message, memberVC, "Limit", `${fromLimit}`, `${channel.userLimit}`);
        })
        .catch(error => {
            embedError.setDescription(`<a:no:893059567427133451> | Terjadi kesalahan ketika mengubah Limit voice channel anda. Silahkan hubungi staff.`);
            message.channel.send({ embeds: [embedError] });
            return console.error(error);
        });
    }
}

async function logs(message, channel, type, from, to) {
    const logsChannel = message.client.channels.cache.get("1142145876245086289");
    if (!logsChannel) return;

    const embed = new EmbedBuilder()
        .setColor(message.client.color)
        .setTimestamp()
        .setAuthor({ name: type, iconURL: message.client.user.displayAvatarURL() })
        .addFields([
            { name: "Executor", value: `${message.author.tag} [\`${message.author.id}\`]`, inline: false },
            { name: "Channel", value: `${channel} [\`${channel.id}\`]`, inline: false },
            { name: "From", value: from, inline: true },
            { name: "To", value: to, inline: true }
        ]);
    logsChannel.send({ embeds: [embed] });
}
