/* eslint-disable no-unused-vars */
const { EmbedBuilder, ActionRowBuilder, ModalBuilder, SelectMenuBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ms = require("ms")

module.exports = async (client) => {
    const buttonCooldown = new Set();

    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;

        let customId1 = [ "buttonBitrateAVC", "buttonInfoAVC", "buttonClaimAVC", "buttonLimitAVC", "buttonRenameAVC", "buttonRegionAVC", "buttonTransferAVC", "buttonKickAVC" ];
        let customId2 = [ "buttonBitrateAVC", "buttonLimitAVC", "buttonRenameAVC", "buttonRegionAVC", "buttonTransferAVC", "buttonKickAVC" ];

        if (!customId1.includes(interaction.customId)) return;

        const memberVC = interaction.member.voice.channel;
        if (!memberVC) return await interaction.deferUpdate();

        if (buttonCooldown.has(interaction.user.id)) return await interaction.deferUpdate();
        buttonCooldown.add(interaction.user.id);
        setTimeout(() => buttonCooldown.delete(interaction.user.id), ms('5s'));

        const getAVC = await interaction.client.avc.findOne({ GuildId: interaction.guild.id }).exec();
        if (!getAVC) return await interaction.deferUpdate();

        const getTextChannel = getAVC.TextChannel;
        if (!getTextChannel.includes(interaction.channel.id)) return await interaction.deferUpdate();

        const getCreateChannel = getAVC.CreateChannel;
        if (getCreateChannel.includes(memberVC.id)) return await interaction.deferUpdate();

        const getSecondaries = await interaction.client.secondaries.findOne({ GuildId: interaction.guild.id, ChannelId: memberVC.id }).exec();
        if (!getSecondaries) return await interaction.reply({ content: `You're not on my channel.`, ephemeral: true, fetchReply: true });

        const getChannelCreator = getSecondaries.ChannelCreator;
        const getWhitelist = getSecondaries.Whitelist;
        const getChannelRole = getSecondaries.ChannelRole;
        const hasAdmin = interaction.member.permissions.has("ManageChannels");
        const hasStaff = interaction.member.roles.cache.hasAny("773708648739373077",
"773708964482252840", "773788687519580200", "773723655346585630", "773723765661630464", "773788693348483072");

        if (customId2.includes(interaction.customId)) {
            if (getWhitelist) {
                const hasRole = interaction.member.roles.cache.has(getChannelRole);
                if (!hasRole && !hasStaff) return await interaction.reply({ content: `You can manage this setting!.`, ephemeral: true });
            } else {
                if (getChannelCreator !== interaction.member.id && !hasStaff) return await interaction.reply({ content: `You're not owner of this channel, only <@${getChannelCreator}> can use this command.`, ephemeral: true, fetchReply: true });
            }
        }

        switch (interaction.customId) {
            case "buttonBitrateAVC":
                await buttonBitrate(interaction, getAVC);
                break;
            case "buttonInfoAVC":
                await buttonInfo(interaction, getSecondaries);
                break;
            case "buttonClaimAVC":
                await buttonClaim(interaction, getAVC, getSecondaries);
                break;
            case "buttonLimitAVC":
                await buttonLimit(interaction, getAVC);
                break;
            case "buttonRenameAVC":
                await buttonRename(interaction, getAVC, getSecondaries);
                break;
            case "buttonRegionAVC":
                await buttonRegion(interaction, getAVC);
                break;
            case "buttonTransferAVC":
                await buttonTransfer(interaction, getAVC, getSecondaries);
                break;
            case "buttonKickAVC":
                await buttonKick(interaction, getAVC);
                break;
            default:
                break;
        }
    });

}

async function buttonBitrate(interaction, getAVC) {
    let maxBitrate;
    const cekPremiumTier = interaction.guild.premiumTier;
    if (!cekPremiumTier) maxBitrate = 96;
    if (cekPremiumTier === 0) maxBitrate = 96;
    if (cekPremiumTier === 1) maxBitrate = 128;
    if (cekPremiumTier === 2) maxBitrate = 256;
    if (cekPremiumTier === 3) maxBitrate = 384;

    const modalBitrate = new ModalBuilder()
        .setCustomId('modalBitrate')
        .setTitle('Bitrate');
    const bitrateInput = new TextInputBuilder()
		.setCustomId('bitrateInput')
		.setLabel("Berapa banyak bitrate yang anda inginkan?")
        .setPlaceholder(`Masukan angka bitrate disini (8 - ${maxBitrate})`)
		.setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(3)
        .setRequired(true);
    const firstActionRow = new ActionRowBuilder().addComponents(bitrateInput);
    modalBitrate.addComponents(firstActionRow);

	await interaction.showModal(modalBitrate);

    await interaction.awaitModalSubmit({ 
        filter: (i) => i.customId === 'modalBitrate' && i.user.id === interaction.user.id,
        time: 60000
    })
    .then(async i => {
        const bitrateInput = i.fields.getTextInputValue('bitrateInput');
        if (isNaN(bitrateInput)) return await i.reply({ content: `Bitrate must a number (8 - ${maxBitrate}).`, ephemeral: true, fetchReply: true });

        const bitrate = Number(bitrateInput);
        if (bitrate < 8) return await i.reply({ content: `Bitrate must be higher than 8.`, ephemeral: true, fetchReply: true });
        if (bitrate > maxBitrate) return await i.reply({ content: `Bitrate must be lower than ${maxBitrate}.`, ephemeral: true, fetchReply: true });

        const fromBitrate = interaction.member.voice.channel.bitrate;

        interaction.member.voice.channel.setBitrate(bitrate * 1000)
        .then(async channel => {
            await i.reply({ content: `Successfully change the bitrate to **${bitrate} kbps**.`, ephemeral: true, fetchReply: true });
        })
        .catch(async error => {
            console.error(error);
            return await i.reply({ content: `There was an error when changing bitrate!`, ephemeral: true, fetchReply: true });
        });
    })
    .catch(async error => {
        await interaction.followUp({ content: `Time up! Try again.`, ephemeral: true });
    });
}

async function buttonInfo(interaction, getSecondaries) {
    const ChannelName = getSecondaries.ChannelName || interaction.member.voice.channel.name;
    const ChannelID = interaction.member.voice.channel.id;
    const ChannelOwner = getSecondaries.ChannelCreator;
    const ChannelBitrate = interaction.member.voice.channel.bitrate / 1000;
    const ChannelRegion = interaction.member.voice.channel.rtcRegion || "Automatically";
    const ChannelMembers = interaction.member.voice.channel.members.filter(m => !m.user.bot).size;
    const botSize = interaction.member.voice.channel.members.filter(m => m.user.bot).size;
    const getChannelOwner = interaction.guild.members.cache.get(ChannelOwner);

    const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
        .setColor(interaction.client.color)
        .setDescription(`**Channel Info**\n
**Channel Name** : ${ChannelName} \`[${ChannelID}]\`
**Channel Owner** : ${getChannelOwner} \`[${ChannelOwner}]\`
**Channel Bitrate** : ${ChannelBitrate}kbps
**Channel Region** : ${ChannelRegion}
**Channel Members** : ${ChannelMembers} users & ${botSize} bots`)
    await interaction.reply({ embeds: [embed], ephemeral: true, fetchReply: true });
}

async function buttonClaim(interaction, getAVC, getSecondaries) {

    const getChannelCreator = getSecondaries.ChannelCreator;
    if (interaction.user.id === getChannelCreator) return await interaction.reply({ content: `You already own this channel`, ephemeral: true, fetchReply: true });

    const ChannelCreator = interaction.guild.members.cache.get(getChannelCreator);
    if (ChannelCreator && ChannelCreator.voice?.channel === interaction.member.voice.channel) return await interaction.reply({ content: `You cannot claim this channel!`, ephemeral: true, fetchReply: true });

    getSecondaries.ChannelCreator = interaction.member.id;
    getSecondaries.save(async (err, data) => {
        if (err) {
            console.error(err);
            return await interaction.reply({ content: `There was an error occured!`, ephemeral: true, fetchReply: true });
        }
        await interaction.reply({ content: `Succesfully claim this channel.`, ephemeral: true, fetchReply: true });
    });
}

async function buttonLimit(interaction, getAVC) {
    let rangeLimit;
    const getLimited = getAVC.Limited;
    if (getLimited) {
        rangeLimit = "2 - 99"
    } else {
        rangeLimit = "1 - 99"
    }

    const modalLimit = new ModalBuilder()
        .setCustomId('modalLimit')
        .setTitle('Limit');
    const limitInput = new TextInputBuilder()
		.setCustomId('limitInput')
		.setLabel("How many limit do you want?")
        .setPlaceholder(`Input the limit here (${rangeLimit} / 0 for make it unlimited)`)
		.setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(2)
        .setRequired(true);
    const firstActionRow = new ActionRowBuilder().addComponents(limitInput);
    modalLimit.addComponents(firstActionRow);

	await interaction.showModal(modalLimit);

    await interaction.awaitModalSubmit({ 
        filter: (i) => i.customId === 'modalLimit' && i.user.id === interaction.user.id,
        time: 60000
    })
    .then(async i => {
        const limitInput = i.fields.getTextInputValue('limitInput');
        if (isNaN(limitInput)) return await i.reply({ content: `Limit must be number (${rangeLimit}).`, ephemeral: true, fetchReply: true });

        const limit = Number(limitInput);

        if (getLimited) {
            if (limit > 0 && limit < 2) return await i.reply({ content: `Limit can't lower than 2.`, ephemeral: true, fetchReply: true });
        }

        const fromLimit = interaction.member.voice.channel.userLimit;

        interaction.member.voice.channel.setUserLimit(limit)
        .then(async channel => {
            await i.reply({ content: `Successfully changing your limit to **${limit}**`, ephemeral: true, fetchReply: true });
        })
        .catch(async error => {
            console.error(error);
            return await i.reply({ content: `An error just occured when changing your limit.`, ephemeral: true, fetchReply: true });
        });
    })
    .catch(async error => {
        await interaction.followUp({ content: `Times up! Try again.`, ephemeral: true });
    });
}

async function buttonRename(interaction, getAVC, getSecondaries) {
    const modalRename = new ModalBuilder()
        .setCustomId('modalRename')
        .setTitle('Name');
    const renameInput = new TextInputBuilder()
		.setCustomId('renameInput')
		.setLabel("What name you want to rename")
        .setPlaceholder(`Input your channel name to rename`)
		.setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(100)
        .setRequired(true);
    const firstActionRow = new ActionRowBuilder().addComponents(renameInput);
    modalRename.addComponents(firstActionRow);

	await interaction.showModal(modalRename);

    const submit = await interaction.awaitModalSubmit({ 
        filter: (i) => i.customId === 'modalRename' && i.user.id === interaction.user.id,
        time: 60000
    })
    .then(async submit => {
        const getChannelTime = getSecondaries.ChannelTime;
        if (getChannelTime && Date.now() - getChannelTime < 330000) {
            let time = (getChannelTime + 330000) -  Date.now();
            return await v.reply({ content: `Your voice channel get cooldown ${ms(time, { long: true })}, Be patient waiting your cooldown.`, ephemeral: true, fetchReply: true });
        }

        const toName = submit.fields.getTextInputValue('renameInput');
        const fromName = interaction.member.voice.channel.name;

        interaction.member.voice.channel.setName(toName)
        .then(async channel => {
            getSecondaries.ChannelName = channel.name;
            getSecondaries.ChannelTime = Date.now();
            getSecondaries.save(async (err, data) => {
                if (err) {
                    console.error(err);
                    return await interaction.followUp({ content: `There was an error occured!`, ephemeral: true, fetchReply: true });
                }
                await interaction.followUp({ content: `Succesfully change your voice channel name to **${toName}**`, ephemeral: true, fetchReply: true })
            });
        })
        .catch(async error => {
            if (error.message === "Invalid Form Body\nname[INVALID_COMMUNITY_PROPERTY_NAME]: Contains words not allowed for servers in Server Discovery.") {
                await submit.followUp({ content: `Your Voice Name contains blocked words.`, ephemeral: true, fetchReply: true });
            } else {
                console.error(error);
                return await interaction.followUp({ content: `An error occured please try again!.`, ephemeral: true, fetchReply: true });
            }
        });
    })
    .catch(async error => {
        return await interaction.followUp({ content: `Times up! Try again`, ephemeral: true });
    });
}

async function buttonRegion(interaction, getAVC) {
    const row = new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId('selectmenuRegion')
          .setPlaceholder('Daftar Region')
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions([
            { label: 'Automatically', value: 'null', emoji: '🌍' },
            { label: 'Brazil', value: 'brazil', emoji: '🇧🇷' },
            { label: 'Hongkong', value: 'hongkong', emoji: '🇭🇰' },
            { label: 'India', value: 'india', emoji: '🇮🇳' },
            { label: 'Japan', value: 'japan', emoji: '🇯🇵' },
            { label: 'Rotterdam', value: 'rotterdam', emoji: '🇳🇱' },
            { label: 'Russia', value: 'russia', emoji: '🇷🇺' },
            { label: 'Singapore', value: 'singapore', emoji: '🇸🇬' },
            { label: 'South Korea', value: 'south-korea', emoji: '🇰🇷' },
            { label: 'South Africa', value: 'southafrica', emoji: '🇿🇦' },
            { label: 'Sydney', value: 'sydney', emoji: '🇦🇺' },
            { label: 'US Central', value: 'us-central', emoji: '🇺🇸' },
            { label: 'US East', value: 'us-east', emoji: '🇺🇸' },
            { label: 'US South', value: 'us-south', emoji: '🇺🇸' },
            { label: 'US West', value: 'us-west', emoji: '🇺🇸' },
          ])
      );
      
      const message = await interaction.reply({
        content: 'Please choose a region for your voice channel!',
        components: [row],
        ephemeral: true,
        fetchReply: true,
      });
      
      const collector = message.createMessageComponentCollector({
        filter: (i) =>
          i.customId === 'selectmenuRegion' && i.user.id === interaction.user.id,
        time: 120000,
        max: 1,
        componentType: 3,
      });

    collector.on('collect', async i => {
        let region = i.values[0];
        if (i.values[0] === "null") region = null;

        await i.deferUpdate();

        const fromRegion = interaction.member.voice.channel.rtcRegion || "Automatically";

        interaction.member.voice.channel.setRTCRegion(region)
        .then(async channel => {
            const toRegion = channel.rtcRegion || "Automatically";

            await interaction.editReply({ content: `Successfully change your region to **${toRegion}**`, components: [], ephemeral: true });
        })
        .catch(async error => {
            console.error(error);
            return await interaction.editReply({ content: `An error just occured!`, components: [], ephemeral: true });
        });
    });
    collector.on("end", async (collected, reason) => {
        if (reason === "time") {
            await interaction.editReply({ content: `Times up! Try again.`, components: [], ephemeral: true });
        }
    });
}

async function buttonTransfer(interaction, getAVC, getSecondaries) {

    const ChannelMembers = interaction.member.voice.channel.members.filter(m => !m.user.bot);
    if (ChannelMembers.size === 1) return await interaction.reply({ content: `There no more person inside this channel!`, ephemeral: true, fetchReply: true });
    const memberFilter = ChannelMembers.filter(m => m.user.id !== interaction.user.id);

    let memberList = [];
    memberFilter.each(member => {
        memberList.push({ label: member.user.tag, value: member.id, emoji: '1009024662967156776' })
    });
    if (memberList.length === 0) return await interaction.reply({ content: `There no more person inside this channel!`, ephemeral: true, fetchReply: true });

    const row = new ActionRowBuilder()
    .addComponents(
        new SelectMenuBuilder()
        .setCustomId('selectmenuTransfer')
        .setPlaceholder('Member List')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(memberList)
    );

    const message = await interaction.reply({ content: `Choose the person you want to give the ownership.`, components: [row], ephemeral: true, fetchReply: true });
    const collector = message.createMessageComponentCollector({ 
        filter: i => i.customId === 'selectmenuTransfer' && i.user.id === interaction.user.id, 
        time: 120000,
        max: 1,
        componentType: 3
    });

    collector.on('collect', async i => {
        let user = i.values[0];
        await i.deferUpdate();

        const member = interaction.guild.members.cache.get(user);
        if (!member) return await interaction.editReply({ content: `Person you choose isn't exist.`, components: [], ephemeral: true });
        if (interaction.member.voice.channel !== member.voice.channel) return await interaction.editReply({ content: `Person you choose isn't inside the voice channel.`, components: [], ephemeral: true });

        getSecondaries.ChannelCreator = user;
        getSecondaries.save(async (err, data) => {
            if (err) {
                console.error(err);
                return await interaction.editReply({ content: `Error just occured, try again..`, components: [], ephemeral: true });
            }
            await interaction.editReply({ content: `Successfully transfer your ownership to ${member}.`, components: [], ephemeral: true });
        });

    });
    collector.on("end", async (collected, reason) => {
        if (reason === "time") {
            await interaction.editReply({ content: `Times up! Try again.`, components: [], ephemeral: true });
        }
    });
}

async function buttonKick(interaction, getAVC) {
    const ChannelMembers = interaction.member.voice.channel.members.filter(m => !m.user.bot);
    if (ChannelMembers.size === 1) return await interaction.reply({ content: `No more person than you on voice channel.`, ephemeral: true, fetchReply: true });
    const memberFilter = ChannelMembers.filter(m => m.user.id !== interaction.user.id);

    let memberList = [];
    memberFilter.each(member => {
        memberList.push({ label: member.user.tag, value: member.id, emoji: '1009024662967156776' })
    });
    if (memberList.length === 0) return await interaction.reply({ content: `No more person than you on voice channel..`, ephemeral: true, fetchReply: true });

    const row = new ActionRowBuilder()
    .addComponents(
        new SelectMenuBuilder()
        .setCustomId('selectmenuKick')
        .setPlaceholder('Member List')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(memberList)
    );

    const message = await interaction.reply({ content: `Choose person you want to kick from Voice Channel`, components: [row], ephemeral: true, fetchReply: true });
    const collector = message.createMessageComponentCollector({ 
        filter: i => i.customId === 'selectmenuKick' && i.user.id === interaction.user.id, 
        time: 120000,
        max: 1,
        componentType: 3
    });

    collector.on('collect', async i => {
        let user = i.values[0];
        await i.deferUpdate();

        const member = interaction.guild.members.cache.get(user);
        if (!member) return await interaction.editReply({ content: `The person isn't exist!`, components: [], ephemeral: true });
        if (interaction.member.voice.channel !== member.voice.channel) return await interaction.editReply({ content: `You need to be on the same Voice Channel to kick this person.`, components: [], ephemeral: true });

        member.voice.disconnect()
        .then(async member => {
            await interaction.editReply({ content: `Successfully kick ${member} from your Voice Channel.`, components: [], ephemeral: true });
        })
        .catch(async error => {
            console.error(error);
            return await interaction.editReply({ content: `An error occured when kick ${member} from your voice channel.`, components: [], ephemeral: true });
        });
    });
    collector.on("end", async (collected, reason) => {
        if (reason === "time") {
            await interaction.editReply({ content: `Times up! Try again.`, components: [], ephemeral: true });
        }
    });
}
