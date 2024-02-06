/* eslint-disable no-unused-vars */
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ChannelType, ButtonStyle } = require('discord.js');

module.exports = {
    name: "avc",
    category: "Owner",
    aliases: [],
    description: "",
    args: false,
    usage: [],
    examples: [],
    memberPermissions: [],
    botPermissions: [ "SendMessages" ],
    owner: true,
    async execute(message, args) {

        const choose = args[0];
        if (!choose) return message.channel.send("Please provide valid type between premium/normal!");

        if (choose === "normal") {
            const parent = await message.guild.channels.create({ name: 'LOUNGE ¹', type: 4 });
            const setting = await message.guild.channels.create({ name: 'Settings', type: 0, parent: parent.id });
            const voice = await message.guild.channels.create({ name: 'Create Voice', type: 2, parent: parent.id });

            const embed = new EmbedBuilder()
            .setTitle(`PLASTICQUE LOUNGE`)
.setDescription(`**Feature:**
\n1. Bitrate Control (Kontrol Bitrate)
\n2. User Limit (Batasan Member)
\n3. Rename (Ubah Nama)
\n4. Region Setting (Pengaturan Wilayah)
\n5. Kick Users (Kick Pengguna dari Voice Channel)
\n6. Claim Voice Channel (Mengklaim Voice Channel)
\n7. Voice Channel Info (Informasi Voice Channel)
\n8. Voice Channel Transfer (Transfer Voice Channel)

\nTutorial:
\nTo create a temporary voice channel, follow these steps:
\n1. Join a Create voice channel.
\n2. Customize the settings for your temporary voice channel (bitrate, usage limit, etc.).
\n3. Enjoy your temporary voice channel!

\nBest Regard
\nPlasticque Team.`)

    const row1 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder().setCustomId('buttonBitrateAVC').setStyle('Secondary').setEmoji('<:bitrate:1158676534601715752>').setLabel('Bitrate'),
        new ButtonBuilder().setCustomId('buttonLimitAVC').setStyle('Secondary').setEmoji('<:limit:1158676538166890587>').setLabel('Limit'),
        new ButtonBuilder().setCustomId('buttonRenameAVC').setStyle('Secondary').setEmoji('<:rename:1158676543581724702>').setLabel('Rename'),
        new ButtonBuilder().setCustomId('buttonRegionAVC').setStyle('Secondary').setEmoji('<:region:1158676550082895932>').setLabel('Region'),
        new ButtonBuilder().setCustomId('buttonKickAVC').setStyle('Secondary').setEmoji('<:kick:1158676556076568618>').setLabel('Kick')
    );

const row2 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder().setCustomId('buttonClaimAVC').setStyle('Secondary').setEmoji('<:claim:1158676562212827176>').setLabel('Claim'),
        new ButtonBuilder().setCustomId('buttonInfoAVC').setStyle('Secondary').setEmoji('<:information:1158676567539589170>').setLabel('Info'),
        new ButtonBuilder().setCustomId('buttonTransferAVC').setStyle('Secondary').setEmoji('<:transfer:1158676572321095690>').setLabel('Transfer')
    );

            await setting.send({ embeds: [embed], components: [row1, row2] });

            const getAVC = await message.client.avc.findOne({ GuildId: message.guild.id }).exec();
            if (!getAVC) {
                const parentLogs = await message.guild.channels.create({ name: 'Auto Voice Channel Logs', type: 4 });
                const info = await message.guild.channels.create({ name: 'Information', type: ChannelType.GuildText, parent: parentLogs.id });
                const logs = await message.guild.channels.create({ name: 'Setting Logs', type: ChannelType.GuildText, parent: parentLogs.id });

                const data = await message.client.avc.create({
                    GuildId: message.guild.id,
                    ParentId: [parent.id],
                    CreateChannel: [voice.id],
                    TextChannel: [setting.id],
                    InfoChannel: info.id,
                    LogsChannel: logs.id,
                    Limited: true
                });
                data.save((err, data) => {
                    if(err) {
                        console.error(err);
                    }
                    embed.setDescription(`Successfully created Auto Voice Channel.`);
                    message.channel.send({ embeds: [embed] });
                });

            } else {
                getAVC.ParentId.push(parent.id);
                getAVC.CreateChannel.push(voice.id);
                getAVC.TextChannel.push(setting.id);

                await getAVC.save((err, data) => {
                    if(err) {
                        console.error(err);
                    }
                    embed.setDescription(`Successfully created Auto Voice Channel.`);
                    message.channel.send({ embeds: [embed] });
                });
        }

        } else if (choose === "premium") {
            const parent = await message.guild.channels.create({ name: 'Auto Voice Channel', type: 4 });
            const setting = await message.guild.channels.create({ name: 'Settings', type: 0, parent: parent.id });
            const voice = await message.guild.channels.create({ name: 'Voice Channel', type: 2, parent: parent.id });

            voice.permissionOverwrites.edit(1101047730194878554, {
                ViewChannel: true
            });

            voice.permissionOverwrites.edit(message.guild.roles.everyone, {
                ViewChannel: false
            });

            voice.permissionOverwrites.edit()

            const embed = new EmbedBuilder()
            .setTitle(`PLASTICQUE LOUNGE`)
.setDescription(`**Feature:**
\n1. Bitrate Control (Kontrol Bitrate)
\n2. User Limit (Batasan Member)
\n3. Rename (Ubah Nama)
\n4. Region Setting (Pengaturan Wilayah)
\n5. Kick Users (Kick Pengguna dari Voice Channel)
\n6. Claim Voice Channel (Mengklaim Voice Channel)
\n7. Voice Channel Info (Informasi Voice Channel)
\n8. Voice Channel Transfer (Transfer Voice Channel)

\nTutorial:
\nTo create a temporary voice channel, follow these steps:
\n1. Join a Create voice channel.
\n2. Customize the settings for your temporary voice channel (bitrate, usage limit, etc.).
\n3. Enjoy your temporary voice channel!

\nBest Regard
\nPlasticque Team.`)

    const row1 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder().setCustomId('buttonBitrateAVC').setStyle('Secondary').setEmoji('<:bitrate:1158676534601715752>').setLabel('Bitrate'),
        new ButtonBuilder().setCustomId('buttonLimitAVC').setStyle('Secondary').setEmoji('<:limit:1158676538166890587>').setLabel('Limit'),
        new ButtonBuilder().setCustomId('buttonRenameAVC').setStyle('Secondary').setEmoji('<:rename:1158676543581724702>').setLabel('Rename'),
        new ButtonBuilder().setCustomId('buttonRegionAVC').setStyle('Secondary').setEmoji('<:region:1158676550082895932>').setLabel('Region'),
        new ButtonBuilder().setCustomId('buttonKickAVC').setStyle('Secondary').setEmoji('<:kick:1158676556076568618>').setLabel('Kick')
    );

const row2 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder().setCustomId('buttonClaimAVC').setStyle('Secondary').setEmoji('<:claim:1158676562212827176>').setLabel('Claim'),
        new ButtonBuilder().setCustomId('buttonInfoAVC').setStyle('Secondary').setEmoji('<:information:1158676567539589170>').setLabel('Info'),
        new ButtonBuilder().setCustomId('buttonTransferAVC').setStyle('Secondary').setEmoji('<:transfer:1158676572321095690>').setLabel('Transfer')
    );


            await setting.send({ embeds: [embed], components: [row1, row2] });

            const getAVC = await message.client.avc.findOne({ GuildId: message.guild.id }).exec();
            if (!getAVC) {
                const parentLogs = await message.guild.channels.create({ name: 'Auto Voice Channel Logs', type: 4 });
                const info = await message.guild.channels.create({ name: 'Information', type: ChannelType.GuildText, parent: parentLogs.id });
                const logs = await message.guild.channels.create({ name: 'Setting Logs', type: ChannelType.GuildText, parent: parentLogs.id });

                const data = await message.client.avc.create({
                    GuildId: message.guild.id,
                    ParentId: [parent.id],
                    CreateChannel: [voice.id],
                    TextChannel: [setting.id],
                    InfoChannel: info.id,
                    LogsChannel: logs.id,
                    Limited: true
                });
                data.save((err, data) => {
                    if(err) {
                        console.error(err);
                    }
                    embed.setDescription(`Successfully created Auto Voice Channel.`);
                    message.channel.send({ embeds: [embed] });
                });

            } else {
                getAVC.ParentId.push(parent.id);
                getAVC.CreateChannel.push(voice.id);
                getAVC.TextChannel.push(setting.id);

                await getAVC.save((err, data) => {
                    if(err) {
                        console.error(err);
                    }
                    embed.setDescription(`Successfully created Auto Voice Channel.`);
                    message.channel.send({ embeds: [embed] });
                });
            }

        }


    }
}
