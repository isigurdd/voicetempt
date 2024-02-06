const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: 'messageCreate',
	async execute(message) {
		if (message.author.bot) return;
        if (!message.guild) return;

        let PREFIX = message.client.prefix;
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const embed = new EmbedBuilder()
            .setColor(message.client.color)
            .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({ text: `Request by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        const embederror = new EmbedBuilder()
            .setColor("#FF0000");

        if (message.content.match(new RegExp(`^<@!?${message.client.user.id}>( |)$`))) {
            embed.setDescription(`Hello **${message.author.tag}**, my prefix is **${PREFIX}**.\nUse **${PREFIX}help** to get the list of the commands!`);
            return message.channel.send({ embeds: [embed] });
        }

        const prefixRegex = new RegExp(`^(<@!?${message.client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
        if (!prefixRegex.test(message.content)) return;

        const [ matchedPrefix ] = message.content.match(prefixRegex);

        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        const command = message.client.commands.get(commandName) || message.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        if (command.args && !args.length) {
            let reply = `<a:no:893059567427133451> | You didn't provide any arguments!`;

            if (command.usage) {
                reply += `\n\nExamples:`
                command.usage.forEach(usage => {
                    reply += `\n\`${PREFIX}${command.name} ${usage}\``
                });
            }

            embederror.setDescription(reply);
            return message.channel.send({ embeds: [embederror] });
        }

        if (command.memberPermissions && !message.member.permissions.has(command.memberPermissions)) {
            embederror.setDescription("<a:no:893059567427133451> | You don't have permission to run this command.");
            return message.channel.send({ embeds: [embederror] });
        }

        if (command.botPermissions && !message.guild.members.me.permissions.has(command.botPermissions)) {
            embederror.setDescription("<a:no:893059567427133451> | I don't have permission to run this command.");
            return message.channel.send({ embeds: [embederror] });
        }

        if (command.owner && !message.client.owner.includes(message.author.id)) return;

        try {
            command.execute(message, args);
        } catch (error) {
            console.error(error);

            message.client.logger.log(`Error Execute Commands at ${command.name} | ` + error, "error");
            embederror.setDescription(`<a:no:893059567427133451> | There was an error executing that command.\nI have contacted the owner of the bot to fix it immediately.`);
            message.channel.send({ embeds: [embederror] });

            let owner = message.client.users.cache.get(message.client.owner[0]);
            owner.send({ content: `<a:no:893059567427133451> | There was an error executing command **${command.name}**.\nAn error encountered: \n${error}\n<#${message.channel.id}>` });
        }
	}
};