const {
	ActivityType
} = require('discord.js');
const { NMDClient } = require('../../index.js');
const chalk = require('chalk');

module.exports = {
	event: 'ready',
	run() {
		const activities = [{
				name: `${NMDClient.guilds.cache.size} Servers`,
				type: ActivityType.Listening
			},
			{
				name: `${NMDClient.channels.cache.size} Channels`,
				type: ActivityType.Playing
			},
			{
				name: `${NMDClient.users.cache.size} Users`,
				type: ActivityType.Watching
			},
			{
				name: `Discord.js v14`,
				type: ActivityType.Competing
			}
		];
		const status = [
			'online',
			'dnd',
			'idle'
		];
		let i = 0;
		setInterval(() => {
			if (i >= activities.length) i = 0
			NMDClient.user.setActivity(activities[i])
			i++;
		}, 5000);

		let s = 0;
		setInterval(() => {
			if (s >= activities.length) s = 0
			NMDClient.user.setStatus(status[s])
			s++;
		}, 30000);
		console.log(chalk.red(`Logged in as ${NMDClient.user.tag}!`))
	}
}