const { ActivityType } = require("discord.js");

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		client.guilds.cache.forEach(async guild => {
            await guild.members.fetch();
            await guild.channels.fetch();
        });
    
        client.logger.log(`${client.user.username} Sudah online!`, "ready");
        client.logger.log(`Ready on ${client.guilds.cache.size} servers, for a total of ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} users`, "ready");
    
	}
};
