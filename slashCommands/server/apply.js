const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js')
const applySchema = require('../../config/models/applySchema')
const whitelistSchema = require('../../config/models/whitelistData.js')
module.exports = {
    name: 'application',
    description: 'apply to join your clan!',
    botPerms: [],
    userPerms: [],
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'send',
        description: 'send an application to join your clan!',
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: 'rank',
            description: 'Please input your rank here',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        }, {
            name: 'uid',
            description: 'Please input your UID here',
            type: ApplicationCommandOptionType.String,
            required: true,
            min_length: 12,
            max_length: 12
        }, {
            name: 'in_game_name',
            description: 'Please input your in game name here',
            type: ApplicationCommandOptionType.String,
            required: true,
            max_length: 20,
        }, {
            name: 'additional_note',
            description: 'Add any additional note about yourself!(maximum 4096 characters)',
            type: ApplicationCommandOptionType.String,
            required: false,
            max_length: 1024
        }]
    }, {
        name: 'setup',
        description: 'config your application command settings!',
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: 'channel',
            description: 'set up/change where the application channel is going to be',
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: false
        }, {
            name: 'minimum-rank',
            description: 'set up an minimum rank that you need to have in order to join your clan',
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: false
        }, {
            name: 'note',
            description: 'Set up a note about your clan! Use \\n to have a line break.',
            type: ApplicationCommandOptionType.String,
            required: false,
            max_length: 2048
        }, {
            name: 'active',
            type: ApplicationCommandOptionType.Boolean,
            description: 'toggle wether to active the application command or not.',
            required: false
        }, {
            name: 'role',
            type: ApplicationCommandOptionType.Role,
            description: 'Auto role a member after they have been accepted!',
            required: false
        }]
    }, {
        name: 'info',
        description: 'Have a basic view of your current application settings!',
        type: ApplicationCommandOptionType.Subcommand,
    }, {
        name: 'help',
        description: 'get help on how to set up the application system for your clan!',
        type: ApplicationCommandOptionType.Subcommand,
    }, {
        name: 'delete',
        description: 'Delete your applications system data from our data base.',
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: 'confirm',
            description: 'Select True to confirm. THIS ACTION CAN NOT BE UNDONE.',
            type: ApplicationCommandOptionType.Boolean,
            required: true
        }]
    }],
    async run({ client, interaction }) {
        const { options } = interaction;

        const subCmd = options.getSubcommand();

        const rank = options.getString('rank')
        const minimumRank = options.getString('minimum-rank')
        const uid = options.getString('uid')
        const inGameName = options.getString('in_game_name')
        const channel = options.getChannel('channel')
        const playerNote = options.getString('additional_note')
        const clanNote = options.getString('note')
        const active = options.getBoolean('active')
        const role = options.getRole('role')
        const confirmation = options.getBoolean('confirm')
        const ranks = ["Junior", "Junior I", "Junior II", "Senior", "Senior I", "Senior II", "Senior III", "Elite", "Elite I", "Elite II", "Elite III", "Eminent", "Eminent I", "Eminent II", "Eminent III", "Super", "Super I", "Super II", "Super III", "Shadow", "Shadow I", "Shadow II", "Shadow III", "Shadow IV", " Shadow V"]

        let applicationData = await applySchema.findOne({
            guildId: interaction.guild.id
        })

        const whitelistData = await whitelistSchema.findOne({
            guildId: interaction.guild.id
        })

        function whitelistCheck() {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                if (whitelistData) {
                    if (!whitelistData?.users.includes(interaction.user.id)) {
                        let found = false;
                        for (const role of whitelistData?.roles) {
                            if (interaction.member.roles.cache.has(role)) found = true;
                        }
                        if (!found) return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription('You can not use this command, you will need the \`Manage Server\` permission, or have a whitelisted role!')
                                    .setColor('Red')
                            ],
                            ephemeral: true
                        })
                    }
                } else return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription('You can not use this command, you will need the \`Manage Server\` permission, or have a whitelisted role!')
                            .setColor('Red')
                    ],
                    ephemeral: true
                })
            }
        }


        if (subCmd === 'send') {

            if (!applicationData) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('Sorry, but this clan does not have any application system set up!')
                        .setColor('Red')
                        .setAuthor({
                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                            name: `|| ${interaction.guild.name}`
                        })
                        .setFooter({
                            iconURL: interaction.member.displayAvatarURL(),
                            text: interaction.user.id
                        })
                        .setTimestamp()
                ],
                ephemeral: true
            })

            if (applicationData.active === false) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('Sorry, but this clan\'s application is currently closed!')
                        .setColor('Red')
                        .setAuthor({
                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                            name: `|| ${interaction.guild.name}`
                        })
                        .setFooter({
                            iconURL: interaction.member.displayAvatarURL(),
                            text: interaction.user.id
                        })
                        .setTimestamp()
                ],
                ephemeral: true
            })

            if (!ranks.includes(rank)) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Invalid Rank')
                        .setDescription('Please enter a valid rank in the provided options!')
                        .setColor('Red')
                        .setAuthor({
                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                            name: `|| ${interaction.guild.name}`
                        })
                        .setFooter({
                            iconURL: interaction.member.displayAvatarURL(),
                            text: interaction.user.id
                        })
                        .setTimestamp()
                ],
                ephemeral: true
            })

            if (ranks.indexOf(rank) < ranks.indexOf(applicationData.requiredRank)) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Rank too low')
                        .setColor('Red')
                        .setDescription(`Your rank is too low to join this clan.\n\n***Required Rank:*** \`${applicationData.requiredRank}\``)
                        .setAuthor({
                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                            name: `|| ${interaction.guild.name}`
                        })
                        .setFooter({
                            iconURL: interaction.member.displayAvatarURL(),
                            text: interaction.user.id
                        })
                        .setTimestamp()
                ],
                ephemeral: true
            })

            if (!Number(uid)) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('Please enter a valid UID')
                        .setDescription('Please enter a valid UID(16 characters long, all numbers).')
                        .setAuthor({
                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                            name: `|| ${interaction.guild.name}`
                        })
                        .setFooter({
                            iconURL: interaction.member.displayAvatarURL(),
                            text: interaction.user.id
                        })
                        .setTimestamp()
                ],
                ephemeral: true
            })

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Application sent successful.')
                        .setColor('Green')
                        .setDescription('Your application has been sent and is waiting to be reviewed. Please be patient and \`have your DM turned on\` so the bot can notify you when your application result is out.')
                        .addFields({
                            name: 'Additional clan notes:',
                            value: applicationData?.notes
                        })
                        .setAuthor({
                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                            name: `|| ${interaction.guild.name}`
                        })
                        .setFooter({
                            iconURL: interaction.member.displayAvatarURL(),
                            text: interaction.user.id
                        })
                        .setTimestamp()
                ],
                ephemeral: true
            })

            try {
                const msg = await client.channels.cache.get(applicationData.channelId).send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`An new application by ${interaction.user.tag}!`)
                            .setDescription(`***Status: \`Pending\`***\nUser: <@${interaction.user.id}>`)
                            .addFields({
                                name: 'UID:',
                                value: uid,
                                inline: true
                            }, {
                                name: 'In game name:',
                                value: inGameName,
                                inline: true
                            }, {
                                name: 'rank',
                                value: rank,
                                inline: true
                            }, {
                                name: 'Additional player note:',
                                value: playerNote ? `\`${playerNote}\`` : `\`No additional note was provided by this player.\``
                            })
                            .setColor('#96e1f5')
                            .setAuthor({
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                name: `|| ${interaction.guild.name}`
                            })
                            .setFooter({
                                iconURL: interaction.member.displayAvatarURL(),
                                text: interaction.user.id
                            })
                            .setTimestamp()
                    ],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel('Accept')
                                    .setCustomId('applicationAccept'),
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Danger)
                                    .setLabel('Deny')
                                    .setCustomId('applicationDeny')
                            )
                    ]
                })
                const collector = await msg.createMessageComponentCollector({ idle: 7 * 24 * 60 * 60 * 1000 });

                collector.on('collect', async (btn) => {
                    await btn.deferUpdate().catch(e => { });

                    if (!btn.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                        if (whitelistData) {
                            if (!whitelistData?.users.includes(btn.user.id)) {
                                let found = false;
                                for (const role of whitelistData?.roles) {
                                    if (btn.member.roles.cache.has(role)) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) return btn.followUp({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setDescription('You can not use this command, you will need the \`Manage Server\` permission, or have a whitelisted role!')
                                            .setColor('Red')
                                    ],
                                    ephemeral: true
                                })
                            }
                        } else return btn.followUp({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription('You can not use this command, you will need the \`Manage Server\` permission, or have a whitelisted role!')
                                    .setColor('Red')
                            ],
                            ephemeral: true
                        })
                    }

                    if (btn.customId === 'applicationAccept') {
                        await interaction.member.setNickname(`${interaction.user.username} (${inGameName})`).catch(() => { })
                        try {
                            await interaction.user.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle(`You have been accepted to \`${interaction.guild.name}\`!`)
                                        .setColor('Green')
                                        .setDescription(`Your application to \`${interaction.guild.name}\` has been accepted, and you are now one of their clan members! Remember to follow to rules and participate in clan events!`)
                                        .addFields({
                                            name: 'Additional Clan Notes:',
                                            value: applicationData?.notes
                                        })
                                        .setTimestamp()
                                        .setAuthor({
                                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                            name: `|| ${interaction.guild.name}`
                                        })
                                        .setFooter({
                                            iconURL: interaction.member.displayAvatarURL(),
                                            text: interaction.user.id
                                        })
                                ]
                            })
                        } catch (err) {
                            await btn.followUp({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle('Unable to sent DM to user.')
                                        .setDescription('We are unable to sent DM to this user to announce that their application has been accepted. They may have blocked the bot or have DM turned off. Please notify they manually.')
                                        .setColor('#908bf8')
                                        .setTimestamp()
                                        .setAuthor({
                                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                            name: `|| ${interaction.guild.name}`
                                        })
                                        .setFooter({
                                            iconURL: interaction.member.displayAvatarURL(),
                                            text: interaction.user.id
                                        })
                                ],
                                ephemeral: true
                            })
                        } finally {
                            await msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle(`An accepted application by ${interaction.user.tag}!`)
                                        .setDescription(`***Status: \`Accepted\`***\n***User:*** <@${interaction.user.id}>\n***Accepted by:*** <@${btn.user.id}>`)
                                        .addFields({
                                            name: 'UID:',
                                            value: uid,
                                            inline: true
                                        }, {
                                            name: 'In game name:',
                                            value: inGameName,
                                            inline: true
                                        }, {
                                            name: 'rank',
                                            value: rank,
                                            inline: true
                                        }, {
                                            name: 'Additional player note:',
                                            value: playerNote ? `\`${playerNote}\`` : `\`No additional note was provided by this player.\``
                                        })
                                        .setColor('#8ff88b')
                                        .setAuthor({
                                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                            name: `|| ${interaction.guild.name}`
                                        })
                                        .setFooter({
                                            iconURL: interaction.member.displayAvatarURL(),
                                            text: interaction.user.id
                                        })
                                        .setTimestamp()
                                ],
                                components: [
                                    new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                                .setStyle(ButtonStyle.Primary)
                                                .setLabel('Accept')
                                                .setDisabled(true)
                                                .setCustomId('applicationAccept'),
                                            new ButtonBuilder()
                                                .setStyle(ButtonStyle.Danger)
                                                .setLabel('Deny')
                                                .setDisabled(true)
                                                .setCustomId('applicationDeny')
                                        )
                                ],
                                ephemeral: true
                            })
                            await btn.followUp({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle('Application accepted successfully')
                                        .setDescription('The application has been accepted successfully, and the user were notified via DM.')
                                        .setColor('#87fd8a')
                                        .setTimestamp()
                                        .setAuthor({
                                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                            name: `|| ${interaction.guild.name}`
                                        })
                                        .setFooter({
                                            iconURL: interaction.member.displayAvatarURL(),
                                            text: interaction.user.id
                                        })
                                ],
                                ephemeral: true
                            })
                        }
                        if (applicationData?.role) {
                            try {
                                await interaction.member.roles.add(interaction.guild.roles.cache.get(applicationData.role))
                            } catch (err) {
                                btn.followUp({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setTitle('Unable to add role to user.')
                                            .setDescription(`Auto role: <@&${applicationData.role}>\nWe are unable to add auto role to user. Please make sure to give us \`Manage Roles\` permission, and the auto role position is below our highest role\'s position.`)
                                            .setColor('#908bf8')
                                            .setTimestamp()
                                            .setAuthor({
                                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                                name: `|| ${interaction.guild.name}`
                                            })
                                            .setFooter({
                                                iconURL: interaction.member.displayAvatarURL(),
                                                text: interaction.user.id
                                            })
                                    ],
                                    ephemeral: true
                                })
                            }
                        }
                        collector.stop()
                    } else if (btn.customId === 'applicationDeny') {
                        try {
                            await interaction.user.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle(`You have been denied to \`${interaction.guild.name}\`!`)
                                        .setColor('Red')
                                        .setDescription(`Your application to \`${interaction.guild.name}\` has been denied.`)
                                        .setTimestamp()
                                        .setAuthor({
                                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                            name: `|| ${interaction.guild.name}`
                                        })
                                        .setFooter({
                                            iconURL: interaction.member.displayAvatarURL(),
                                            text: interaction.user.id
                                        })
                                ],
                                ephemeral: true
                            })
                        } catch (err) {
                            btn.followUp({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle('Unable to sent DM to user.')
                                        .setDescription('We are unable to sent DM to this user to announce that their application has been denied. They may have blocked the bot or have DM turned off. Please notify they manually.')
                                        .setColor('#908bf8')
                                        .setTimestamp()
                                        .setAuthor({
                                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                            name: `|| ${interaction.guild.name}`
                                        })
                                        .setFooter({
                                            iconURL: interaction.member.displayAvatarURL(),
                                            text: interaction.user.id
                                        })
                                ]
                            })
                        } finally {
                            await msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle(`An denied application by ${interaction.user.tag}!`)
                                        .setDescription(`***Status: \`Denied\`***\nUser: <@${interaction.user.id}>\n***Denied By:*** <@${btn.user.id}>`)
                                        .addFields({
                                            name: 'UID:',
                                            value: uid,
                                            inline: true
                                        }, {
                                            name: 'In game name:',
                                            value: inGameName,
                                            inline: true
                                        }, {
                                            name: 'rank',
                                            value: rank,
                                            inline: true
                                        }, {
                                            name: 'Additional player note:',
                                            value: playerNote ? `\`${playerNote}\`` : `\`No additional note was provided by this player.\``
                                        })
                                        .setColor('Red')
                                        .setAuthor({
                                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                            name: `|| ${interaction.guild.name}`
                                        })
                                        .setFooter({
                                            iconURL: interaction.member.displayAvatarURL(),
                                            text: interaction.user.id
                                        })
                                        .setTimestamp()
                                ],
                                components: [
                                    new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                                .setStyle(ButtonStyle.Primary)
                                                .setLabel('Accept')
                                                .setDisabled(true)
                                                .setCustomId('applicationAccept'),
                                            new ButtonBuilder()
                                                .setStyle(ButtonStyle.Danger)
                                                .setLabel('Deny')
                                                .setDisabled(true)
                                                .setCustomId('applicationDeny')
                                        )
                                ]
                            })
                            btn.followUp({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle('Application denied successfully')
                                        .setDescription('The application has been denied successfully, and the user were notified via DM.')
                                        .setColor('#87fd8a')
                                        .setTimestamp()
                                        .setAuthor({
                                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                            name: `|| ${interaction.guild.name}`
                                        })
                                        .setFooter({
                                            iconURL: interaction.member.displayAvatarURL(),
                                            text: interaction.user.id
                                        })
                                ]
                            })
                        }
                        collector.stop()
                    }
                })

                collector.on('end', () => {
                    msg.edit({
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setLabel('Accept')
                                        .setDisabled(true)
                                        .setCustomId('applicationAccept'),
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Danger)
                                        .setLabel('Deny')
                                        .setDisabled(true)
                                        .setCustomId('applicationDeny')
                                )
                        ],
                    })
                })
            } catch (err) {

            }

        } else {

            if (subCmd === 'setup') {

                whitelistCheck()

                if (!(minimumRank || channel || clanNote || role || active)) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Please input a value')
                            .setDescription('Please input a value in witch you want to set up/change.')
                            .setColor('Red')
                    ],
                    ephemeral: true
                })

                await applySchema.findOneAndUpdate({
                    guildId: interaction.guild.id
                }, {
                    channelId: channel?.id || (applicationData?.channelId || interaction.channel.id),
                    guildId: interaction.guild.id,
                    active: active || (applicationData?.active || true),
                    notes: clanNote || (applicationData?.notes || '\`There are no clan notes set up for this server.\`'),
                    requiredRank: minimumRank || (applicationData?.requiredRank || 'Junior'),
                    role: role?.id || ''
                }, {
                    upsert: true
                })

                applicationData = await applySchema.findOne({
                    guildId: interaction.guild.id
                })

                try {
                    await client.channels.cache.get(applicationData?.channelId).send('Applications has been set to be sent to this channel!')
                } catch (err) {
                    setTimeout(async () => {
                        await interaction.followUp({
                            content: `The bot does not seem to have permission to send messages in that <#${applicationData?.channelId}>. Make sure to allow me to be able to see and send messages!`,
                            ephemeral: true
                        })
                    }, 500)
                } finally {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Application system configured successfully')
                                .setDescription('Application channel has been set up/changed! Below is the current application system info(you can also use \`/application info\`)')
                                .addFields({
                                    name: 'Application receiving channel:',
                                    value: `<#${applicationData?.channelId}>`,
                                    inline: true
                                }, {
                                    name: 'Required rank:',
                                    value: applicationData?.requiredRank,
                                    inline: true
                                }, {
                                    name: 'Active:',
                                    value: applicationData?.active?.toString(),
                                    inline: true
                                }, {
                                    name: 'Auto role',
                                    value: applicationData?.role ? `<@&${applicationData?.role}>` : '\`There are no auto roles set up.\`'
                                }, {
                                    name: 'Additional application notes:',
                                    value: `\`${applicationData?.notes}\``
                                })
                                .setColor('#fdf287')
                                .setAuthor({
                                    iconURL: interaction.guild.iconURL() || client?.user?.displayAvatarURL(),
                                    name: `|| ${interaction.guild.name}`
                                })
                                .setFooter({
                                    iconURL: interaction.member.displayAvatarURL(),
                                    text: interaction.user.id
                                })
                                .setTimestamp()
                        ],
                        ephemeral: true
                    })
                }

            } else if (subCmd === 'info') {
                whitelistCheck()
                if (!applicationData) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription('Sorry, but this clan does not have any application system set up!')
                            .setColor('Red')
                            .setAuthor({
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                name: `|| ${interaction.guild.name}`
                            })
                            .setFooter({
                                iconURL: interaction.member.displayAvatarURL(),
                                text: interaction.user.id
                            })
                            .setTimestamp()
                    ],
                    ephemeral: true
                })
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Application system configuration')
                            .setDescription('Application system configuration infos. Use \`/application setup\` to change/set up these settings.')
                            .addFields({
                                name: 'Application receiving channel:',
                                value: `<#${applicationData?.channelId}>`,
                                inline: true
                            }, {
                                name: 'Required rank:',
                                value: applicationData?.requiredRank,
                                inline: true
                            }, {
                                name: 'Active:',
                                value: applicationData?.active?.toString(),
                                inline: true
                            }, {
                                name: 'Auto role',
                                value: applicationData?.role ? `<@&${applicationData?.role}>` : '\`There are no auto roles set up.\`'
                            }, {
                                name: 'Additional application notes:',
                                value: `\`${applicationData?.notes}\``
                            })
                            .setColor('#fdf287')
                            .setAuthor({
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                name: `|| ${interaction.guild.name}`
                            })
                            .setFooter({
                                iconURL: interaction.member.displayAvatarURL(),
                                text: interaction.user.id
                            })
                            .setTimestamp()
                    ],
                    ephemeral: true
                })
            } else if (subCmd === 'help') {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Application system configuration help')
                            .setDescription('A help guide on how to set up application system for your server!(Default permission needed: \`Manage Server\`)')
                            .setColor('#65ffc4')
                            .addFields({
                                name: 'Required Rank:',
                                value: 'Set up an minimum rank you need in order to join this clan. Any application with their ranks below this(After it has been changed, applications before will not be denied) will be automatically denied. Default is set to \`Junior\`.'
                            }, {
                                name: 'Channel',
                                value: 'The channel where applications will be sent to. Default is set to the channel where you first used the \`/application setup\` command(if no channel property was provided).'
                            }, {
                                name: 'Role',
                                value: 'This will automatically give applicants who have been accepted a role of your choice. Default set to none.'
                            }, {
                                name: 'Active',
                                value: 'This will toggle wether to allow applications or close the application system(not allowing applications to be sent). This is different from \`/application delete\` because it will store your data instead of deleting them. Default set to true(active).'
                            }, {
                                name: 'Additional Notes:',
                                value: 'This will be shown to applicants after they send out an application. Default set to none.'
                            }, {
                                name: '/application delete',
                                value: 'This __***PERMANENTLY DELETES***__ you application system data from our data base. This action can not be undone. If you wish to just pause it but keep your application system data, use \`/application setup <active: false>\`'
                            })
                            .setAuthor({
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                name: `|| ${interaction.guild.name}`
                            })
                            .setFooter({
                                iconURL: interaction.member.displayAvatarURL(),
                                text: interaction.user.id
                            })
                            .setTimestamp()
                    ],
                    ephemeral: true
                })
            } else if (subCmd === 'delete') {
               whitelistCheck()
                if (!applicationData) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription('Sorry, but this clan does not have any application system set up!')
                            .setColor('Red')
                            .setAuthor({
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                name: `|| ${interaction.guild.name}`
                            })
                            .setFooter({
                                iconURL: interaction.member.displayAvatarURL(),
                                text: interaction.user.id
                            })
                            .setTimestamp()
                    ],
                    ephemeral: true
                })
                if (!confirmation) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Please Confirm')
                            .setDescription('Select \`True\` if you wish to confirm to delete your application system data from our database. __***THIS ACTION CAN NOT BE UNDONE.***__')
                            .setColor('Red')
                            .setAuthor({
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                name: `|| ${interaction.guild.name}`
                            })
                            .setFooter({
                                iconURL: interaction.member.displayAvatarURL(),
                                text: interaction.user.id
                            })
                            .setTimestamp()
                    ],
                    ephemeral: true
                })
                await applySchema.deleteOne({
                    guildId: interaction.guild.id
                })
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Data deleted successful')
                            .setColor('Green')
                            .setDescription('Your application system data has been successfully removed from our database!')
                            .setAuthor({
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                                name: `|| ${interaction.guild.name}`
                            })
                            .setFooter({
                                iconURL: interaction.member.displayAvatarURL(),
                                text: interaction.user.id
                            })
                            .setTimestamp()
                    ],
                    ephemeral: true
                })
            }
        }
    }
}