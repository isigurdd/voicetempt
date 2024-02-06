/* eslint-disable no-unused-vars */
const { createConnection, Schema } = require("mongoose");

module.exports = async (client) => {

    const mongoose = createConnection('mongodb+srv://plasticque:haniparrd14@plasticque.owrkxwr.mongodb.net/?retryWrites=true&w=majority');
    mongoose.on("connected", () => {
        client.logger.log("Connected to the Mongodb Database.", "ready");
    })
    mongoose.on('error', err => {
        client.logger.log("Unable to connect to the Mongodb database. Error:" + err, "error");
    });

    const avcSchema = new Schema({
        GuildId: String,
        Enable: Boolean,
        ParentId: Array,
        CreateChannel: Array,
        TextChannel: Array,
        InfoChannel: String,
        LogsChannel: String,
        Limited: Boolean,
        WhitelistChnl: String,
        WhitelistMsg1: String,
        WhitelistMsg2: String,
        GudangChnl: String,
        GudangMsg1: String,
        GudangMsg2: String,
    });
    const avc = mongoose.model("AutoVoiceChannel", avcSchema);
    client.avc = avc;

    const secondariesSchema = new Schema({
        GuildId: String,
        ChannelId: String,
        ChannelCreator: String,
        ChannelName: String,
        ChannelTime: Number,
        Whitelist: Boolean,
        WhitelistChannel: String,
        WhitelistWarn: Boolean,
        WhitelistWarnDate: Number,
        WhitelistWarned: Boolean,
        WhitelistWarnedDate: Number,
        ChannelRole: String
    });
    const secondaries = mongoose.model("SecondariesAVC", secondariesSchema);
    client.secondaries = secondaries;

    const warnSchema = new Schema({
        GuildId: String,
        MemberId: String,
        Reason: Array,
        Executor: Array,
        Count: Number
    })

    const warn = mongoose.model("Warnlist", warnSchema);
    client.warn = warn;

}