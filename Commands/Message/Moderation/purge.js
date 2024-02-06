/* eslint-disable no-unused-vars */
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "purge",
    category: "Moderation",
    aliases: ["clean", "clear"],
    description: "Purge message",
    args: true,
    usage: ["{Number of Messages}"],
    examples: ["99"],
    memberPermissions: ["ManageMessages"],
    botPermissions: [],
    owner: false,
    async execute(message, args) {

        const amount = parseInt(args[0]);
        if(!amount) return message.channel.send("Please provide amount to delete message!");
        if(amount > 99) return message.channel.send("Cannot delete more than 99 messages!");
        if(amount < 1) return message.channel.send("Amount need to greather than 0");

        message.channel.bulkDelete(amount)
        .then((msg) => {
            msg.channel.send(`Sucessfully delete ${amount} of message`)
        })
        .catch((error) => {
            if(error.code === 50034) {
                message.channel.messages.fetch({ limit: amount })
                .then((messages) => {
                    messages.forEach(msg => { // message
                        msg.delete()
                    });
                })
            }
        })


    }
}