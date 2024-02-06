/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "bitrate",
    category: "Voice Channel",
    aliases: [],
    description: "Set the bitrate of your channel.",
    args: true,
    usage: [ "{Number}" ],
    examples: [ "64" ],
    memberPermissions: [],
    botPermissions: [ "SendMessages", "ManageChannels" ],
    owner: false,
    async execute(message, args) {
        if (!message.channel.isVoiceBased()) return;

        const embed = new EmbedBuilder()
            .setColor("#00FF00");
        const embedError = new EmbedBuilder()
            .setColor("#FF0000");

        const memberVC = message.member.voice.channel;
        if (!memberVC) return;

        const getAVC = await message.client.avc.findOne({ GuildId: message.guild.id }).exec();
        const getSecondaries = await message.client.secondaries.findOne({ GuildId: message.guild.id, ChannelId: memberVC.id }).exec();
        const getGame = await message.client.game.findOne({ GuildId: message.guild.id }).exec();
        const getPrivate = await message.client.private.findOne({ GuildId: message.guild.id }).exec();

        if (getAVC && getSecondaries) {
            const getCreateChannel = getAVC.CreateChannel;
            if (getCreateChannel.includes(memberVC.id)) return;
            if (getCreateChannel.includes(message.channel.id)) return;
            if (memberVC.id !== message.channel.id) {
                embedError.setDescription(`You can use this command on Voice Chat ${memberVC}`);
                return message.channel.send({ embeds: [embedError] });
            }

            const getChannelCreator = getSecondaries.ChannelCreator;
            const getWhitelist = getSecondaries.Whitelist;
            const getChannelRole = getSecondaries.ChannelRole;
            const hasAdmin = message.member.permissions.has("ManageChannels");
            const hasStaff = message.member.roles.cache.hasAny("773708648739373077", "773708964482252840", "773788687519580200", "773723655346585630", "773723765661630464", "773788693348483072");

            if (getWhitelist) {
                const hasRole = message.member.roles.cache.has(getChannelRole);
                if (!hasRole && !hasStaff) {
                    embedError.setDescription(`You cannot manage channels`);
                    return message.channel.send({ embeds: [embedError] });
                }
            } else {
                if (getChannelCreator !== message.member.id && !hasStaff) {
                    embedError.setDescription(`You're not owner of this channel, only <@${getChannelCreator}> can use this command.`);
                    return message.channel.send({ embeds: [embedError] });
                }
            }

            await bitrate(message, args, memberVC, embedError, embed);
        } else if (getGame && memberVC.parentId === getGame.ParentId) {
            const getCreateChannel = getGame.CreateChannel;
            if (memberVC.id === getCreateChannel) return;
            if (message.channel.id === getCreateChannel) return;
            if (memberVC.id !== message.channel.id) return message.channel.send(`Please set your channel on ${memberVC}`);

            await bitrate(message, args, memberVC, embedError, embed);
        } else if (getPrivate && memberVC.parentId === getPrivate.ParentId) {
            const getCreateChannel = getPrivate.CreateChannel;
            if (memberVC.id === getCreateChannel) return;
            if (message.channel.id === getCreateChannel) return;
            if (memberVC.id !== message.channel.id) return message.channel.send(`Please set your channel on ${memberVC}`);

            await bitrate(message, args, memberVC, embedError, embed);
        } else {
            embedError.setDescription(`You're not on my channel!`);
            return message.channel.send({ embeds: [embedError] });
        }
    }
}

async function bitrate(message, args, memberVC, embedError, embed) {
    const text = args[0];
    if (!text) {
        embedError.setDescription(`<a:no:893059567427133451> | Silahkan sertakan Bitrate beruka angka.`);
        return message.channel.send({ embeds: [embedError] });
    }
    if (isNaN(text)) {
        embedError.setDescription(`<a:no:893059567427133451> | Bitrate harus berupa angka.`);
        return message.channel.send({ embeds: [embedError] });
    }

    let maxBitrate;
    const cekPremiumTier = message.guild.premiumTier;
    if (!cekPremiumTier) maxBitrate = 96;
    if (cekPremiumTier === 0) maxBitrate = 96;
    if (cekPremiumTier === 1) maxBitrate = 128;
    if (cekPremiumTier === 2) maxBitrate = 256;
    if (cekPremiumTier === 3) maxBitrate = 384;

    const bitrate = Number(text);
    if (bitrate < 8) {
        embedError.setDescription(`<a:no:893059567427133451> | Bitrate harus lebih dari 8.`);
        return message.channel.send({ embeds: [embedError] });
    }
    if (bitrate > maxBitrate) {
        embedError.setDescription(`<a:no:893059567427133451> | Bitrate harus kurang dari ${maxBitrate}.`);
        return message.channel.send({ embeds: [embedError] });
    }

    const fromBitrate = memberVC.bitrate;

    memberVC.setBitrate(bitrate * 1000)
    .then(async channel => {
        embed.setDescription(`<a:yes:893059568383438868> | Berhasil mengubah Bitrate voice channel anda menjadi **${bitrate} kbps**.`);
        message.channel.send({ embeds: [embed] });
        await logs(message, memberVC, "Bitrate", `${(fromBitrate / 1000)} kbps`, `${(channel.bitrate / 1000)} kbps`);
    })
    .catch(error => {
        embedError.setDescription(`<a:no:893059567427133451> | Terjadi kesalahan ketika mengubah Bitrate voice channel anda. Silahkan hubungi staff.`);
        message.channel.send({ embeds: [embedError] });
        return console.error(error);
    });
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