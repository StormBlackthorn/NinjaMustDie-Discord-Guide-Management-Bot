const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, WebhookClient } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});

const config = require('./config/config.json');
require('dotenv').config()
const mongoose = require('mongoose');
client.commands = new Collection()
client.aliases = new Collection()
client.slashCommands = new Collection();
client.prefix = config.prefix
module.exports = client;


const glob = require('glob');
const { promisify } = require('util');

const globPromise = promisify(glob);

(async () => {
	const handlers = await globPromise(`${process.cwd().replace(/\\/g, '/')}/handlers/*.js`);
	handlers.forEach((handler) => {
		require(handler)(client);
	});
})()


client.login(process.env.TOKEN)

const mongooseConnectionString = process.env.mongooseConnectionString

if (!mongooseConnectionString) return console.warn('Invalid moongoose connection string');
mongoose.connect(mongooseConnectionString, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
}).then(() => console.log("Connected to Mongo DB!!!"));


webHook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1082879185153966201/ieQj2E3VQ8zLfzx1tEpIEpHLHQykls62N088fePJpHjucUR2woNC6JgjO0wjQu83orrc' })

process.on('uncaughtException', (err, origin) => {
	try {
		webHook.send({
			content: `<@864372060305883136>`,
			embeds: [
				new EmbedBuilder()
					.setTitle('UncaughtException Error')
					.setColor('Red')
					.setDescription(`***${err} [ \`${origin}\` ]***\n\n\`\`\`sh\n${err.stack}\`\`\` `)
					.setTimestamp()
			]
		})
	} catch {
		webHook.send({
			content: `<@864372060305883136>`,
			embeds: [
				new EmbedBuilder()
					.setTitle('UncaughtException Error')
					.setColor('Red')
					.setDescription(`***${err} [ \`${origin}\` ]***\n\n\`No error backtrace due to it being too long. It has been logged to the console.\` `)
					.setTimestamp()
			]
		})
	} finally {
		console.warn(`----------ERROR----------\n${err} [ ${origin} ]\n\n${err.stack}\n-------------------------`)
	}
})

