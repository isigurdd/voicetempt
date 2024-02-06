/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "claim",
    category: "Voice Channel",
    aliases: [],
    description: "Claim your voice channel so You can manage your channel.",
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

        const getWhitelist = getSecondaries.Whitelist;
        if (getWhitelist) {
            embedError.setDescription(`You cannot manage this channel!`);
            return message.channel.send({ embeds: [embedError] });
        }

        const getChannelCreator = getSecondaries.ChannelCreator;
        if (message.author.id === getChannelCreator) {
            embedError.setDescription(`You're already own this channel`);
            return message.channel.send({ embeds: [embedError] });
        }
        const ChannelCreator = message.guild.members.cache.get(getChannelCreator);

        if (!message.member.permissions.has("ManageGuild")) {
            const creatorVC = ChannelCreator.voice.channel;

            if (ChannelCreator && creatorVC === memberVC) {
                embedError.setDescription(`You cannot claim this ownership!`);
                return message.channel.send({ embeds: [embedError] });
            }

            if (!ChannelCreator || creatorVC !== memberVC) {
                getSecondaries.ChannelCreator = message.member.id;
                getSecondaries.save(async (err, data) => {
                    if (err) {
                        embedError.setDescription(`There was an error occured!`);
                        message.channel.send({ embeds: [embedError] });
                        return console.error(err);
                    }
                    embed.setDescription(`Successfully claim this channel`);
                    message.channel.send({ embeds: [embed] });
                    await logs(message, getAVC, memberVC, "Claim", `${ChannelCreator.user.tag} [\`${ChannelCreator.id}\`]`, `${message.author.tag} [\`${message.author.id}\`]`);
                });
            }
        } else {
            getSecondaries.ChannelCreator = message.member.id;
            getSecondaries.save(async (err, data) => {
                if (err) {
                    embedError.setDescription(`There was an error occured!`);
                    message.channel.send({ embeds: [embedError] });
                    return console.error(err);
                }
                embed.setDescription(`Successfully claim this channel!`);
                message.channel.send({ embeds: [embed] });
            });
        }
    }
}