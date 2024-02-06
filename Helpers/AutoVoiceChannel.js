/* eslint-disable no-unused-vars */
const { ChannelType, EmbedBuilder } = require('discord.js');
const delay = require('delay');
const ms = require('ms');

module.exports = async (client) => {
    
    client.on("voiceStateUpdate", async (oldState, newState) => {
        const newVoice = newState.channelId;
        const oldVoice = oldState.channelId;

        const getAVC = await newState.client.avc.findOne({ GuildId: newState.guild.id }).exec();
        if (!getAVC) return;

        const getCreateChannel = getAVC.CreateChannel;

        if (oldVoice !== newVoice) {
            if (!oldVoice) {
                if (getCreateChannel.includes(newVoice)) {
                    if (newState.member.user.bot) return setTimeout(() => { newState.disconnect(); }, ms("5s"));
                    await joinAVC(newState, getAVC);
                }
            } else if (!newVoice) {
                const getSecondaries = await oldState.client.secondaries.findOne({ GuildId: oldState.guild.id, ChannelId: oldVoice }).exec();
                if (getSecondaries) {
                    if (oldState.member?.user.bot) return;
                    await leaveAVC(oldState, getSecondaries);
                }
            } else {
                if (getCreateChannel.includes(newVoice)) {
                    if (newState.member.user.bot) return setTimeout(() => { newState.disconnect(); }, ms("5s"));
                    await joinAVC(newState, getAVC);
                }

                const getSecondaries = await oldState.client.secondaries.findOne({ GuildId: oldState.guild.id, ChannelId: oldVoice }).exec();
                if (getSecondaries) {
                    if (oldState.member.user.bot) return;
                    await leaveAVC(oldState, getSecondaries);
                }
            }
        }
    });

    client.on("ready", async client => {
        setInterval(async function() {
            const getSecondaries = await client.secondaries.find({});
            if (!getSecondaries) return;

            getSecondaries.forEach(async secondaries => {
                client.channels.fetch(secondaries.ChannelId)
                .catch(async error => {
                    if (error.code === 10003) {
                        await client.secondaries.deleteOne({ ChannelId: secondaries.ChannelId });
                    } else {
                        console.error(error);
                    }
                });
            });
        }, ms('1h'));
    });

}

async function joinAVC(newState, getAVC) {
    const getParentId = getAVC.ParentId;
    const getInfoChannel = getAVC.InfoChannel;

    const infoChannel = newState.guild.channels.cache.get(getInfoChannel);
    if (!infoChannel) return console.error(`Info Channel not found in guild ${newState.guild.name}.`);

    let parent1 = await newState.guild.channels.fetch(newState.channel.parentId);
    if (parent1.children.cache.size < 50) {
        await createChannel(newState, newState.channel.parentId, infoChannel);
    } else {
        let array = [];
        for (let i = 0; i < getParentId.length; i++) {
            let parent2 = await newState.guild.channels.fetch(getParentId[i]);
            if (parent2.children.cache.size < 50) {
                await createChannel(newState, getParentId[i], infoChannel);
                break;
            } else {
                array.push(getParentId[i]);
            }
        }
        if (array.length === getParentId.length) return infoChannel.send({ content: `${newState.member}, You cannot create more Voice Channel due to maximum limit!` }).then(msg => { setTimeout(() => { newState.disconnect(); }, ms("5s")); });
    }
}

async function leaveAVC(oldState, getSecondaries) {
    if (!oldState.channel) return;

    const getWhitelist = getSecondaries.Whitelist;
    if (getWhitelist) return;

    const getChannelCreator = getSecondaries.ChannelCreator;
    if (getChannelCreator === oldState.member.id) {
        if (oldState.channel.members.filter(m => !m.user.bot).size >= 1) {
            await delay(ms("3m"));

            if (!oldState.channel) return;
            if (oldState.channel.members.filter(m => !m.user.bot).has(getChannelCreator)) return;

            const newCreator = oldState.channel.members.filter(m => !m.user.bot).first();
            if (!newCreator) return;

            const getChannelName = getSecondaries.ChannelName;
            if (!getChannelName) {
                oldState.channel.setName(newCreator.displayName)
                .then(channel => {
                    getSecondaries.ChannelName = oldState.channel.name;
                    getSecondaries.ChannelTime = Date.now();
                })
                .catch(error => {
                    if (error.code !== 10003 && error.message !== "Invalid Form Body\nname[INVALID_COMMUNITY_PROPERTY_NAME]: Contains words not allowed for servers in Server Discovery.") {
                        console.error(error);
                    }
                });
            }

            getSecondaries.ChannelCreator = newCreator.id;
            await getSecondaries.save((err, data) => {
                if (err) console.error(err);
            });
        } else {
            if (oldState.channel.members.filter(m => !m.user.bot).size >= 1) return;

            oldState.channel.delete()
            .then(async channel => {
                await oldState.client.secondaries.deleteOne({ GuildId: oldState.guild.id, ChannelId: oldState.channelId });
            })
            .catch(error => {
                if (error.code !== 10003) return console.error(error);
            });
        }
    } else {
        if (oldState.channel.members.filter(m => !m.user.bot).size >= 1) return;

        oldState.channel.delete()
        .then(async channel => {
            await oldState.client.secondaries.deleteOne({ GuildId: oldState.guild.id, ChannelId: oldState.channelId });
        })
        .catch(error => {
            if (error.code !== 10003) return console.error(error);
        });
    }
}

async function createChannel(newState, ParentId, infoChannel) {
    const totalChannel = newState.guild.channels.channelCountWithoutThreads;
    if (totalChannel >= 500) return infoChannel.send({ content: `${newState.member}, You cannot create more Voice Channel due to maximum limit!` }).then(msg => { setTimeout(() => { newState.disconnect(); }, ms("5s")); });

    const parentChannel = await newState.guild.channels.fetch(ParentId);
    if (parentChannel.children.cache.size >= 50) return infoChannel.send({ content: `${newState.member}, You cannot create more Voice Channel due to maximum limit!` }).then(msg => { setTimeout(() => { newState.disconnect(); }, ms("5s")); });

    newState.guild.channels.create({ name: "⏳", type: 2, parent: parentChannel, rtcRegion: 'hongkong' })
    .then(async channel => {
        newState.setChannel(channel)
		.then(async member => {
            const displayName = member.displayName;
            const username = member.user.username;

            channel.setName(displayName)
            .catch(error => {
                if (error.code === 10003) return;
                if (error.message === "Invalid Form Body\nname[INVALID_COMMUNITY_PROPERTY_NAME]: Contains words not allowed for servers in Server Discovery.") {
                    channel.setName(username)
                    .catch(error => {
                        if (error.code !== 10003) {
                            channel.setName('Unknown');
                        }
                    });
                } else {
                    channel.setName('Unknown');
                }
            });

			channel.permissionOverwrites.edit(member, { SendMessages: true, ReadMessageHistory: true })
			.catch(error => {
                if (error.code === 10003) return;
				console.error(error);
			});

            const data = await newState.client.secondaries.create({
                GuildId: newState.guild.id,
                ChannelId: channel.id,
                ChannelCreator: newState.member.id
            })
            await data.save((err, data) => {
                if (err) console.error(err);
            });
		})
        .catch(error => {
            if (![ 10003, 40032 ].includes(error.code)) console.error(error);
            return channel.delete();
        });
    })
    .catch(error => {
        if (error.code === 30013) {
            setTimeout(() => { newState.disconnect(); }, ms("5s"));
            return infoChannel.send({ content: `${newState.member}, You cannot create more Voice Channel due to maximum limit!` });
        } else if (error.message === "DiscordAPIError: Invalid Form Body\nparent_id: Maximum number of channels in category reached (50)") {
            setTimeout(() => { newState.disconnect(); }, ms("5s"));
            return infoChannel.send({ content: `${newState.member}, You cannot create more Voice Channel due to maximum limit!` });
        } else if (error.code !== 40032) {
            setTimeout(() => { newState.disconnect(); }, ms("5s"));
            return console.error(error.message);
        }
    });
}
