const {
	Collection,
	EmbedBuilder,
	PermissionsBitField,
	Interaction,
	InteractionType,
	WebhookClient
} = require('discord.js');
const ms = require('ms');
const { NMDClient } = require('../../index.js')
const client = NMDClient
const config = require('../config/config.json');
const cooldown = new Collection();


/** 
 * @param {Interaction} interaction
 */

module.exports = {
	event: 'interactionCreate',
	async run(interaction) {

		const slashCommand = client.slashCommands.get(interaction.commandName);

		if (interaction.isAutocomplete()) {
			if (interaction.commandName == 'application') {
				const focused = interaction.options.getFocused();
				const choices = ["Junior", "Junior I", "Junior II", "Senior", "Senior I", "Senior II", "Senior III", "Elite", "Elite I", "Elite II", "Elite III", "Eminent", "Eminent I", "Eminent II", "Eminent III", "Super", "Super I", "Super II", "Super III", "Shadow", "Shadow I", "Shadow II", "Shadow III", "Shadow IV", " Shadow V"]
				const filtered = choices.filter((choice) => choice.includes(focused));
				await interaction.respond(
					filtered.map((choice) => ({
						name: choice,
						value: choice
					})),
				);
			}
			return;
		}


		if (!interaction.guild) return interaction.reply('Please use my commands outside of my DMs!')
		if (interaction.type !== InteractionType.ApplicationCommand) return

		try {
			if (slashCommand.cooldown) {
				if (cooldown.has(`slash-${slashCommand.name}${interaction.user.id}`)) return interaction.reply({
					content: config.messages["COOLDOWN_MESSAGE"].replace('<duration>', ms(cooldown.get(`slash-${slashCommand.name}${interaction.user.id}`) - Date.now(), {
						long: true
					}))
				})
				if (slashCommand.userPerms || slashCommand.botPerms) {
					if (!interaction.memberPermissions.has(PermissionsBitField.resolve(slashCommand.userPerms || []))) {
						const userPerms = new EmbedBuilder()
							.setDescription(`🚫 ${interaction.user}, You don't have \`${slashCommand.userPerms}\` permissions to use this command!`)
							.setColor('Red')
						return interaction.reply({
							embeds: [userPerms],
							ephemeral: true
						})
					}
					if (!interaction.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(slashCommand.botPerms || []))) {
						const botPerms = new EmbedBuilder()
							.setDescription(`🚫 ${interaction.user}, I don't have \`${slashCommand.botPerms}\` permissions to use this command!`)
							.setColor('Red')
						return interaction.reply({
							embeds: [botPerms],
							ephemeral: true
						})
					}

				}

				await slashCommand.run({ client, interaction });
				cooldown.set(`slash-${slashCommand.name}${interaction.user.id}`, Date.now() + slashCommand.cooldown)
				setTimeout(() => {
					cooldown.delete(`slash-${slashCommand.name}${interaction.user.id}`)
				}, slashCommand.cooldown)
			} else {
				if (slashCommand.userPerms || slashCommand.botPerms) {
					if (!interaction.memberPermissions.has(PermissionsBitField.resolve(slashCommand.userPerms || []))) {
						const userPerms = new EmbedBuilder()
							.setDescription(`🚫 ${interaction.user}, You don't have \`${slashCommand.userPerms}\` permissions to use this command!`)
							.setColor('Red')
						return interaction.reply({
							embeds: [userPerms],
							ephemeral: true
						})
					}
					if (!interaction.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(slashCommand.botPerms || []))) {
						const botPerms = new EmbedBuilder()
							.setDescription(`🚫 ${interaction.user}, I don't have \`${slashCommand.botPerms}\` permissions to use this command!`)
							.setColor('Red')
						return interaction.reply({
							embeds: [botPerms],
							ephemeral: true
						})
					}

				}
				await slashCommand.run({ client, interaction });
			}
		} catch (error) {
			console.warn(error);
			webhook = new WebhookClient({ url: 'hhttps://discord.com/api/webhooks/1082879185153966201/ieQj2E3VQ8zLfzx1tEpIEpHLHQykls62N088fePJpHjucUR2woNC6JgjO0wjQu83orrc' })

			webhook.send({
				content: `<@864372060305883136>`,
				embeds: [
					new EmbedBuilder()
						.setTitle('Error!')
						.setDescription(`\`${interaction.user.tag}\` Used the \`${slashCommand.name}\` command.\n\nUser ID: \`${interaction.user.id}\`\nGuild ID: \`${interaction.guild.id}\`\n\n\`\`\`sh\n${error}\`\`\``)
						.setColor('Red')
						.setTimestamp()
				]
			})

			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Error')
						.setDescription(`An error occurred while running the command. The developers has been noticed. If you want to further help us investigate/fix this issue, *[please Join my server here](https://discord.gg/WaxXEEXbUC)*\n\`\`\`sh\n${error}\`\`\``)
						.setColor('Red')
				],
				ephemeral: true
			});
		}
	}
}