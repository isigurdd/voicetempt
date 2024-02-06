/* eslint-disable no-unused-vars */
const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
    name: "region",
    category: "Voice Channel",
    aliases: [],
    description: "Set the region of your channel.",
    args: false,
    usage: [],
    examples: [],
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

            if (getWhitelist) {
                const hasRole = message.member.roles.cache.has(getChannelRole);
                if (!hasRole && !hasAdmin) {
                    embedError.setDescription(`You cannot manage this channel!`);
                    return message.channel.send({ embeds: [embedError] });
                }
            } else {
                if (getChannelCreator !== message.member.id && !hasAdmin) {
                    embedError.setDescription(`<a:no:893059567427133451> | Anda bukan pemilik voice channel ini, hanya <@${getChannelCreator}> yang dapat menggunakan perintah ini.`);
                    return message.channel.send({ embeds: [embedError] });
                }
            }

            await region(message, args, memberVC, embedError, embed);
        } else if (getGame && memberVC.parentId === getGame.ParentId) {
            const getCreateChannel = getGame.CreateChannel;
            if (memberVC.id === getCreateChannel) return;
            if (message.channel.id === getCreateChannel) return;
            if (memberVC.id !== message.channel.id) return message.channel.send(`<a:no:893059567427133451> | Please set your channel on ${memberVC}`);

            await region(message, args, memberVC, embedError, embed);
        } else if (getPrivate && memberVC.parentId === getPrivate.ParentId) {
            const getCreateChannel = getPrivate.CreateChannel;
            if (memberVC.id === getCreateChannel) return;
            if (message.channel.id === getCreateChannel) return;
            if (memberVC.id !== message.channel.id) return message.channel.send(`<a:no:893059567427133451> | Please set your channel on ${memberVC}`);

            await region(message, args, memberVC, embedError, embed);
        } else {
            embedError.setDescription(`You're not on my channel!`);
            return message.channel.send({ embeds: [embedError] });
        }
    }
}

async function region(message, args, memberVC, embedError, embed) {
    let validRegion = [ 'automatically', 'brazil', 'hongkong', 'india', 'japan', 'rotterdam', 'russia', 'singapore', 'south-korea', 'southafrica', 'sydney', 'us-central', 'us-east', 'us-south', 'us-west' ];

    if (args[0]) {
        let region = args[0].toLowerCase();
        if (validRegion.includes(region)) {
            if (region === "automatically") region = null;

            const fromRegion = memberVC.rtcRegion || "Automatically";

            memberVC.setRTCRegion(region)
            .then(async channel => {
                embed.setDescription(`<a:yes:893059568383438868> | Berhasil mengubah Region voice channel anda menjadi **${region}**.`);
                message.channel.send({ embeds: [embed] });

                const toRegion = channel.rtcRegion || "Automatically";
                await logs(message, memberVC, "Region", `${fromRegion}`, `${toRegion}`);
            })
            .catch(error => {
                embedError.setDescription(`<a:no:893059567427133451> | Terjadi kesalahan ketika mengubah Limit voice channel anda. Silahkan hubungi staff.`);
                message.channel.send({ embeds: [embedError] });
                return console.error(error);
            })
        } else {
            embedError.setDescription(`<a:no:893059567427133451> | Valid Region:\n${validRegion.map(value=> `\`${value}\``).join(", ")}`);
            return message.channel.send({ embeds: [embedError] });
        }
    } else {
        const row = new ActionRowBuilder()
        .addComponents(
            new SelectMenuBuilder()
            .setCustomId('selectmenuRegion')
            .setPlaceholder('Daftar Region')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                { label: 'Automatically', value: 'null', emoji: '1097518060589547611' },
                { label: 'Brazil', value: 'brazil', emoji: '1097518045167091742' },
                { label: 'Hongkong', value: 'hongkong', emoji: '1097518032575799316' },
                { label: 'India', value: 'india', emoji: '1097518028675104788' },
                { label: 'Japan', value: 'japan', emoji: '1097518017614712894' },
                { label: 'Rotterdam', value: 'rotterdam', emoji: '1097518060589547611' },
                { label: 'Russia', value: 'russia', emoji: '1095910823672676372' },
                { label: 'Singapore', value: 'singapore', emoji: '1095910793586941963' },
                { label: 'South Korea', value: 'south-korea', emoji: '1095910784523063338' },
                { label: 'South Africa', value: 'southafrica', emoji: '1095910737181941811' },
                { label: 'Sydney', value: 'sydney', emoji: '1095910680172970125' },
                { label: 'US Central', value: 'us-central', emoji: '1097518060589547611' },
                { label: 'US East', value: 'us-east', emoji: '1094825022507458630' },
                { label: 'US South', value: 'us-south', emoji: '1094821112489185301' },
                { label: 'US West', value: 'us-west', emoji: '1094819371475546172' }
            ]),
        );

        const embedMessage = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`Silahkan pilih Region yang anda inginkan.`);
        const embedRegion = await message.channel.send({ embeds: [embedMessage], components: [row] });
        const collector = embedRegion.createMessageComponentCollector({ 
            filter: (interaction) => interaction.customId === 'selectmenuRegion' && interaction.user.id === message.author.id, 
            time: 120000,
            max: 1,
            componentType: 3
        });

        collector.on('collect', async i => {
            let region = i.values[0];
            if (i.values[0] === "null") region = null;

            await i.deferUpdate();

            const fromRegion = memberVC.rtcRegion || "Automatically";

            memberVC.setRTCRegion(region)
            .then(async channel => {
                const toRegion = channel.rtcRegion || "Automatically";

                embed.setDescription(`<a:yes:893059568383438868> | Berhasil mengubah Region voice channel anda menjadi **${toRegion}**.`);
                embedRegion.edit({ embeds: [embed], components: [] });
                await logs(message, memberVC, "Region", `${fromRegion}`, `${toRegion}`);
            })
            .catch(error => {
                embedError.setDescription(`<a:no:893059567427133451> | Terjadi kesalahan ketika mengubah Region voice channel anda. Silahkan hubungi staff.`);
                embedRegion.edit({ embeds: [embedError], components: [] });
                return console.error(error);
            });
        });
        collector.on("end", (collected, reason) => {
            if (reason === "time") {
                embedError.setDescription(`<a:no:893059567427133451> | Waktu anda telah habis. Silahkan coba lagi.`);
                return embedRegion.edit({ embeds: [embedError], components: [] });
            }
        });
    }
}

async function logs(message, getAVC, channel, type, from, to) {
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