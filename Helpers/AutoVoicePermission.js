/* eslint-disable no-unused-vars */
module.exports = async (client) => {

    client.on("voiceStateUpdate", async (oldState, newState) => {
        if (oldState.member.user.bot) return;

        const newVoice = newState.channelId;
        const oldVoice = oldState.channelId;

        const getAVC = await oldState.client.avc.findOne({ GuildId: oldState.guild.id }).exec();
        if (!getAVC) return;

        if (oldVoice !== newVoice) {
            if (!oldVoice) {
                const getSecondaries = await newState.client.secondaries.findOne({ GuildId: newState.guild.id, ChannelId: newVoice }).exec();
                if (getSecondaries) {
                    await givePermiss(newState, getSecondaries);
                }
            } else if (!newVoice) {
                const getSecondaries = await oldState.client.secondaries.findOne({ GuildId: oldState.guild.id, ChannelId: oldVoice }).exec();
                if (getSecondaries) {
                    await deletePermiss(oldState, getSecondaries);
                }
            } else {
                const getSecondaries2 = await newState.client.secondaries.findOne({ GuildId: newState.guild.id, ChannelId: newVoice }).exec();
                if (getSecondaries2) {
                    await givePermiss(newState, getSecondaries2);
                }

                const getSecondaries1 = await oldState.client.secondaries.findOne({ GuildId: oldState.guild.id, ChannelId: oldVoice }).exec();
                if (getSecondaries1) {
                    await deletePermiss(oldState, getSecondaries1);
                }
            }
        }
    });

}

async function givePermiss(newState, getSecondaries) {
    if (!newState.channel) return;

    const getChannelCreator = getSecondaries.ChannelCreator;

    await newState.channel.permissionOverwrites.edit(newState.member, {
        SendMessages: true,
        ReadMessageHistory: true
    })
    .catch(error => {
        if (error.code !== 10003) return console.error(error);
    });
}

async function deletePermiss(oldState, getSecondaries) {
    if (!oldState.channel) return;

    await oldState.channel.permissionOverwrites.delete(oldState.member)
    .catch(error => {
        if (error.code !== 10003) return console.error(error);
    });
}