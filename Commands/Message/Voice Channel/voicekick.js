/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "voicekick",
    category: "Voice Channel",
    aliases: [ "vk" ],
    description: "Kick some user from your voice channel",
    args: true,
    usage: [ "{Mention user}", "{User ID}" ],
    examples: [ "@Discord", "1234567890" ],
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
        const hasAdmin = message.member.permissions.has("ManageGuild");
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

        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            embedError.setDescription(`<a:no:893059567427133451> | Silahkan mention atau sertakan User ID pemilik voice channel yang baru.`);
            return message.channel.send({ embeds: [embedError] });
        }
        if (memberVC !== member.voice.channel) {
            embedError.setDescription(`<a:no:893059567427133451> | Orang yang anda pilih tidak berada di voice channel yang sama dengan anda.`);
            return message.channel.send({ embeds: [embedError] });
        }

        member.voice.disconnect()
        .then(async member => {
            embed.setDescription(`<a:yes:893059568383438868> | Berhasil mengeluarkan ${member} dari voice channel anda.`);
            message.channel.send({ embeds: [embed] });
            await logs(message, memberVC, "Kick", `${member.user.tag} [\`${member.id}\`]`);
        })
        .catch(error => {
            embedError.setDescription(`<a:no:893059567427133451> | Terjadi kesalahan ketika mengeluarkan ${member} dari voice channel anda. Silahkan hubungi staff.`);
            message.channel.send({ embeds: [embedError] });
            return console.error(error);
        });
    }
}

async function logs(message, channel, type, target) {
    const logsChannel = message.client.channels.cache.get("1142145876245086289");
    if (!logsChannel) return;

    const embed = new EmbedBuilder()
        .setColor(message.client.color)
        .setTimestamp()
        .setAuthor({ name: type, iconURL: message.client.user.displayAvatarURL() })
        .addFields([
            { name: "Executor", value: `${message.author.tag} [\`${message.author.id}\`]`, inline: false },
            { name: "Channel", value: `${channel} [\`${channel.id}\`]`, inline: false },
            { name: "Target", value: target, inline: true }
        ]);
    logsChannel.send({ embeds: [embed] });
}