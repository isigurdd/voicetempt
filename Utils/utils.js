const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    mstodhms: (duration) => {
        let milliseconds = parseInt((duration % 1000) / 100);
        let seconds = parseInt((duration / 1000) % 60);
        let minutes = parseInt((duration / (1000 * 60)) % 60);
        let hours = parseInt((duration / (1000 * 60 * 60)) % 24);
        let days = parseInt((duration / (1000 * 60 * 60 * 24)) % 30);

        if (duration < 60000) {
            return `${seconds} secs`;
        } else if (duration < 3600000) {
            return `${minutes} mins, ${seconds} secs`;
        } else if (duration < 86400000) {
            return `${hours} hrs, ${minutes} mins, ${seconds} secs`;
        } else {
            return `${days} days, ${hours} hrs, ${minutes} mins, ${seconds} secs`;
        }
    },
    mstohms: (duration) => {
        let milliseconds = parseInt((duration % 1000) / 100);
        let seconds = parseInt((duration / 1000) % 60);
        let minutes = parseInt((duration / (1000 * 60)) % 60);
        let hours = parseInt((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        if (duration < 3600000) {
            return minutes + ":" + seconds;
        } else {
            return hours + ":" + minutes + ":" + seconds;
        }
    },
    hmstoms: (hms) => {
        const a = hms.split(':');
        if (hms.length < 3) {
            return (+a[0]) * 1000;
        } else if (hms.length < 6) {
            return ((+a[0]) * 60 + (+a[1])) * 1000;
        } else {
            return ((+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])) * 1000;
        }
    },
    msFormat: (date = Date.now(), type = 'short', timezone = "Asia/Jakarta") => {
        let options;
        if (type === 'long') { // DD Month YYYY at HH:MM:SS GMT+7
            options = {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false,
                timeZone: timezone,
                timeZoneName: 'short'
            };
            return new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
        } else { // DD-MM-YYYY HH:MM:SS GMT+7
            options = {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false,
                timeZone: timezone,
                timeZoneName: 'short'
            };
            return new Intl.DateTimeFormat('en-GB', options).format(new Date(date)).replaceAll("/", "-").replace(",", "");
        }
    },
    numberFormat: (number, decPlaces = 1) => {
        return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: decPlaces }).format(number);
    },
    randomString: (length) => {
        let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = length; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    },
    randomInteger: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    randomNumber: (min, max) => {
        return Math.random() * (max - min) + min;
    },
    progressbar: (total, current, size, line, slider) => {
        if (current > total) {
            return line.repeat(size + 2);
        } else {
            const percentage = current / total;
            const progress = Math.round((size * percentage));
            const emptyProgress = size - progress;
            const progressText = line.repeat(progress).replace(/.$/, slider);
            const emptyProgressText = line.repeat(emptyProgress);
            return progressText + emptyProgressText;
        }
    },
    pageButton: async (channel, author, arrays, embed, timeout = 60000) => {
        const backButton = new ButtonBuilder()
        .setStyle("Secondary")
        .setLabel("Back")
        .setEmoji("⏪")
        .setCustomId("back");
        const forwardButton = new ButtonBuilder()
        .setStyle("Secondary")
        .setLabel("Forward")
        .setEmoji("⏩")
        .setCustomId("forward");

        const generateEmbed = async (start) => {
            const current = arrays.slice(start, start + 10);
            return embed.setDescription(`${current.join("\n")}`);
        };

        const canFitOnOnePage = arrays.length <= 10;
        const row1 = new ActionRowBuilder().addComponents([forwardButton]);
        const embeds = await generateEmbed(0);
        const embedMessage = await channel.send({ embeds: [embeds], components: canFitOnOnePage ? [] : [row1] });

        if (canFitOnOnePage) return;

        const collector = embedMessage.createMessageComponentCollector({
            filter: (interaction) => interaction.user.id === author.id,
            time: timeout,
			componentType: 2
        });

        let currentIndex = 0;
        collector.on("collect", async (interaction) => {
            interaction.customId === "back" ? (currentIndex -= 10) : (currentIndex += 10);

            const row2 = new ActionRowBuilder()
            .addComponents(
                ...(currentIndex ? [backButton] : []), 
                ...(currentIndex + 10 < arrays.length ? [forwardButton] : [])
            );

            const embed = await generateEmbed(currentIndex);

            interaction.update({ embeds: [embed], components: [row2] })
            .catch(error => {
                if (error.code !== 10062) return console.error(error);
            });
        });
        collector.on("end", (collected) => {
            embedMessage.edit({ components: [] });
        });
    },
    pageReact: (message, arrays, embed, footer, timeout = 60000) => {
        const generateEmbed = start => {
            const current = arrays.slice(start, start + 10);
            return embed.setDescription(current.join('\n') + `\n\nShowing ${footer} ${start + 1}-${start + current.length} out of ${arrays.length}`);
        }

        message.channel.send({ embeds: [generateEmbed(0)] })
        .then(async msg => {
            if (arrays.length <= 10) return;

            await msg.react('➡️');

            const collector = msg.createReactionCollector({ 
                filter: (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id == message.author.id, 
                time: timeout 
            });

            let currentIndex = 0;
            collector.on('collect', async reaction => {
                await msg.reactions.removeAll();

                reaction.emoji.name === '⬅️' ? currentIndex -= 10 : currentIndex += 10;

                await msg.edit({ embeds: [ generateEmbed(currentIndex) ] });

                if (currentIndex !== 0) await msg.react('⬅️');
                if (currentIndex + 10 < arrays.length) await msg.react('➡️');
            });
            collector.on("end", async collected => {
                await msg.reactions.removeAll();
            });
        });
    }
}