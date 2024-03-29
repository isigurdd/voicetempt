const { EmbedBuilder } = require("discord.js");
const { post } = require("node-superfetch");

module.exports = {
    name: "eval",
    category: "Owner",
    aliases: [],
    description: "Eval Code",
    args: true,
    usage: [],
    examples: [],
    memberPermissions: [],
    botPermissions: [ "SendMessages" ],
    owner: true,
    async execute(message, args) {
        const embederror = new EmbedBuilder()
            .setColor("#FF0000");

        const embed = new EmbedBuilder()
            .addFields([ { name: "📥 Input", value: `\`\`\`js\n${args.join(" ")}\`\`\`` } ]);

        try {
            const code = args.join(" ");
            if (!code) {
                embederror.setDescription(`<a:no:893059567427133451> | Please include the code.`);
                return message.channel.send({ embeds: [embederror] });
            }
            let evaled;

            // This method is to prevent someone that you trust, open the secret shit here.
            if (code.includes(`SECRET`) || code.includes(`TOKEN`) || code.includes("process.env")) {
                evaled = "No, shut up, what will you do it with the token?";
            } else {
                evaled = await eval(code);
            }

            if (typeof evaled !== "string") evaled = await require("util").inspect(evaled, { depth: 0 });

            let output = clean(evaled);
            if (output.length > 1024) {
                // If the output was more than 1024 characters, we're gonna export them into the hastebin.
                const { body } = await post("https://hastebin.com/documents").send(output);
                embed.addFields([ { name: "📤 Output", value: `https://hastebin.com/${body.key}.js` } ]);
                embed.setColor(message.client.color);
                // Sometimes, the body.key will turn into undefined. It might be the API is under maintenance or broken.
            } else {
                embed.addFields([ { name: "📤 Output", value: `\`\`\`js\n${output}\`\`\`` } ]);
                embed.setColor(message.client.color);
            }

            message.channel.send({ embeds: [embed] });

        } catch (error) {
            let err = clean(error);
            if (err.length > 1024) {
                // Do the same like above if the error output was more than 1024 characters.
                const { body } = await post("https://hastebin.com/documents").send(err);
                embed.addFields([ { name: "📤 Output", value: `https://hastebin.com/${body.key}.js` } ]);
                embed.setColor("#FF0000");
            } else {
                embed.addFields([ { name: "📤 Output", value: `\`\`\`js\n${err}\`\`\`` } ]);
                embed.setColor("#FF0000");
            }

            message.channel.send({ embeds: [embed] });
        }
    }
}

function clean(string) {
    if (typeof text === "string") {
        return string.replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203))
    } else {
        return string;
    }
}