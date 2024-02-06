/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = {
    name: "name",
    category: "Voice Channel",
    aliases: [],
    description: "Set the name of your channel.",
    args: true,
    usage: [ "{New Name}" ],
    examples: [ "AVC" ],
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
        const getPrivate = await message.client.private.findOne({ GuildId: message.guild.id }).exec();

        if (getAVC && getSecondaries) {
            const getCreateChannel = getAVC.CreateChannel;
            if (getCreateChannel.includes(memberVC.id)) return;
            if (getCreateChannel.includes(message.channel.id)) return;
            if (memberVC.id !== message.channel.id) {
                embedError.setDescription(`Use this command on Voice Chat ${memberVC}`);
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
                    embedError.setDescription(`You cannot manage this channel!`);
                    return message.channel.send({ embeds: [embedError] });
                }
            } else {
                if (getChannelCreator !== message.member.id && !hasStaff) {
                    embedError.setDescription(`<a:no:893059567427133451> | Anda bukan pemilik voice channel ini, hanya <@${getChannelCreator}> yang dapat menggunakan perintah ini.`);
                    return message.channel.send({ embeds: [embedError] });
                }
            }

            const getChannelTime = getSecondaries.ChannelTime;
            if (getChannelTime && Date.now() - getChannelTime < 330000) {
                let time = (getChannelTime + 330000) -  Date.now();
                embedError.setDescription(`<a:no:893059567427133451> | Voice channel anda terkena cooldown selama ${ms(time, { long: true })}, Harap sabar menunggu cooldown.`);
                return message.channel.send({ embeds: [embedError] });
            }

            await rename(message, args, memberVC, getSecondaries, embedError, embed);
        } else if (getPrivate && memberVC.parentId === getPrivate.ParentId) {
            const getCreateChannel = getPrivate.CreateChannel;
            if (memberVC.id === getCreateChannel) return;
            if (message.channel.id === getCreateChannel) return;
            if (memberVC.id !== message.channel.id) return message.channel.send(`<a:no:893059567427133451> | Please set your channel on ${memberVC}`);

            await rename(message, args, memberVC, getSecondaries, embedError, embed);
        } else {
            embedError.setDescription(`You're not on my channel!`);
            return message.channel.send({ embeds: [embedError] });
        }

        
    }
}

async function rename(message, args, memberVC, getSecondaries, embedError, embed) {
    const newName = args.join(" ");
    const fromName = memberVC.name;

    memberVC.setName(newName)
    .then(async channel => {
        getSecondaries.ChannelName = channel.name;
        getSecondaries.ChannelTime = Date.now();
        getSecondaries.save(async (err, data) => {
            if (err) {
                embedError.setDescription(`<a:no:893059567427133451> | Terjadi kesalahan. Silahkan hubungi staff.`);
                message.channel.send({ embeds: [embedError] });
                return console.error(err);
            }
            embed.setDescription(`<a:yes:893059568383438868> | Berhasil mengubah Nama voice channel anda menjadi **${newName}**.`);
            message.channel.send({ embeds: [embed] });
            await logs(message, memberVC, "Rename", `${fromName}`, `${channel.name}`);
        });
    })
    .catch(error => {
        if (error.message === "Invalid Form Body\nname[INVALID_COMMUNITY_PROPERTY_NAME]: Contains words not allowed for servers in Server Discovery.") {
            embedError.setDescription(`<a:no:893059567427133451> | Nama voice channel yang anda inginkan mengandung kata yang tidak diperbolehkan.`);
            return message.channel.send({ embeds: [embedError] });
        } else {
            embedError.setDescription(`<a:no:893059567427133451> | Terjadi kesalahan ketika mengubah Nama voice channel anda. Silahkan hubungi staff.`);
            message.channel.send({ embeds: [embedError] });
            return console.error(error);
        }
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