const {
    EmbedBuilder,
    ApplicationCommandType,
    ApplicationCommandOptionType,
    PermissionsBitField
} = require('discord.js')

const whitelistSchema = require('../../config/models/whitelistData.js')

module.exports = {
    name: 'whitelist',
    description: 'add a whitelist to who can use commands even if they don\'t have the default permission needed!',
    type: ApplicationCommandType.ChatInput,
    userPerms: [],
    botPerms: [],
    cooldown: 4000,
    options: [{
        name: 'user',
        description: 'add a user to whitelist',
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [{
            name: 'add',
            description: 'add a user to whitelist',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'user',
                description: 'the user in which you want to add to whitelist',
                type: ApplicationCommandOptionType.User,
                required: true
            }]
        }, {
            name: 'remove',
            description: 'remove a user from whitelist',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'user',
                description: 'the user in which you want to remove from whitelist',
                type: ApplicationCommandOptionType.User,
                required: true
            }]
        }]
    }, {
        name: 'role',
        description: 'add a role to whitelist',
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [{
            name: 'add',
            description: 'add a role to whitelist',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'role',
                description: 'the role in which you want to add to whitelist',
                type: ApplicationCommandOptionType.Role,
                required: true
            }]
        }, {
            name: 'remove',
            description: 'remove a role from whitelist',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'role',
                description: 'the user in which you want to remove from whitelist',
                type: ApplicationCommandOptionType.Role,
                required: true
            }]
        }]
    }, {
        name: 'help',
        description: 'the help menu for whitelist command',
        type: ApplicationCommandOptionType.Subcommand
    }, {
        name: 'view',
        description: 'view your current whitelist',
        type: ApplicationCommandOptionType.Subcommand
    }, {
        name: 'delete',
        description: 'delete your whitelist from out database',
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: 'confirm',
            description: 'remove your data completely from our database. THIS ACTION CAN NOT BE UNDONE.',
            type: ApplicationCommandOptionType.Boolean
        }]
    }],
    async run({ client, interaction }) {

        const { options } = interaction
        const subCmd = options.getSubcommand()
        const subCommandGroup = options.getSubcommandGroup()
        const user = options.getUser('user')?.id
        const role = options.getRole('role')?.id
        const confirm = options.getBoolean('confirm')
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



        if (subCommandGroup === 'user') {
            whitelistCheck()
            if (subCmd === 'add') {
                let updateUser = whitelistData?.users ?? []
                updateUser.push(user)
                await whitelistSchema.findOneAndUpdate({
                    guildId: interaction.guild.id
                }, {
                    users: updateUser,
                    guildId: interaction.guild.id,
                    roles: whitelistData?.roles ?? []
                }, {
                    upsert: true
                })
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Whitelist user updated!')
                            .setColor('Green')
                            .setDescription(`<@${user}> has been successfully added to whitelist!\nTo view your whitelist, please use \`/whitelist view\`.`)
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
            } else {
                if (!whitelistData) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Whitelist not set up')
                            .setColor('Red')
                            .setDescription('Please set up a whitelist using \`/whitelist <user/role> add\`!')
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
                if (whitelistData?.users?.includes(user)) {
                    let updatedUsers = whitelistData.users
                    updatedUsers.splice(whitelistData.users.indexOf(user), 1)

                    if (updatedUsers.length > 0 && whitelistData.roles.length > 0) {
                        await whitelistSchema.findOneAndUpdate({
                            guildId: interaction.guild.id
                        }, {
                            users: updatedUsers
                        })
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Whitelist user updated!')
                                    .setColor('Green')
                                    .setDescription(`<@${user}> has been successfully removed from whitelist!\nTo view your whitelist, please use \`/whitelist view\`.`)
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
                    } else {
                        await whitelistSchema.findOneAndDelete({
                            guildId: interaction.guild.id
                        })
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Whitelist deleted')
                                    .setColor('Green')
                                    .setDescription(`Since whitelist is empty after <@${user}> got removed, your whitelist is now deleted. You can set it back up again with \`/whitelist <user/role> add\`.`)
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
                } else {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('This user is not in whitelist!')
                                .setColor('Red')
                                .setDescription('This user can not be removed from whitelist as they were originally not in the whitelist.')
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
        } else if (subCommandGroup === 'role') {
            whitelistCheck()
            if (subCmd === 'add') {
                let updateRoles = whitelistData?.roles ?? []
                updateRoles.push(role)
                await whitelistSchema.findOneAndUpdate({
                    guildId: interaction.guild.id
                }, {
                    users: whitelistData?.users ?? [],
                    guildId: interaction.guild.id,
                    roles: updateRoles
                }, {
                    upsert: true
                })
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Whitelist roles updated!')
                            .setColor('Green')
                            .setDescription(`<@&${role}> has been successfully added to whitelist!\nTo view your whitelist, please use \`/whitelist view\`.`)
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
            } else {
                if (!whitelistData) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Whitelist not set up')
                            .setColor('Red')
                            .setDescription('Please set up a whitelist using \`/whitelist <user/role> add\`!')
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
                if (whitelistData?.roles?.includes(role)) {
                    let updateRoles = whitelistData.roles
                    updateRoles.splice(whitelistData.roles.indexOf(role), 1)

                    if (updateRoles.length > 0 && whitelistData.users.length > 0) {
                        await whitelistSchema.findOneAndUpdate({
                            guildId: interaction.guild.id
                        }, {
                            users: updateRoles
                        })
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Whitelist user updated!')
                                    .setColor('Green')
                                    .setDescription(`<@&${role}> has been successfully removed from whitelist!\nTo view your whitelist, please use \`/whitelist view\`.`)
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
                    } else {
                        await whitelistSchema.findOneAndDelete({
                            guildId: interaction.guild.id
                        })
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Whitelist deleted')
                                    .setColor('Red')
                                    .setDescription(`Since whitelist is empty after <@&${role}> got removed, your whitelist is now deleted. You can set it back up again with \`/whitelist <user/role> add\`.`)
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
        else if (subCmd === 'help') {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Whitelist Help')
                        .setColor('#65b9ff')
                        .setDescription('Get help on how to setup/use the whitelist!(Default permission needed: \`Manage Server\`)')
                        .addFields({
                            name: 'What is whitelist?',
                            value: '>>> whitelist allows certain users/roles to use commands that they otherwise couldn\'t because they are missing the default permission needed to use it. To find out what default permission a command need(usually for moderation/server setup commands), use /<command> help to find out.'
                        }, {
                            name: 'How to set up whitelist?',
                            value: '>>> -- You can add roles or users to whitelist. Adding a role will allow everyone with the role to use all of the commands, no matter if the user is whitelisted. Adding a user will only let that user able to use all commands. \n\n-- You can use \`/<role or member> add\` to add a role/member to your whitelist, or \`/<role or member> remove\` to remove that role/member from your whitelist.'
                        }, {
                            name: 'How to view my whitelist?',
                            value: 'You can view your whitelist by doing \`/whitelist view\`. If your whitelist is too long to be shown all the content of it, you can make a whitelist role and give it to users who is whitelisted to save space. You can also ping @Storm7093#6591 or [join his server](https://discord.gg/WaxXEEXbUC) to request for the data.'
                        }, {
                            name: 'How to delete my whitelist?',
                            value: 'You can delete your whitelist completely by using \`/whitelist delete\`. ***__THIS ACTION CAN NOT BE UNDONE__***, as it will be completely removed from our database. Picked the \`True\` option to confirm your deletion.'
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
        } else if (subCmd === 'view') {
            whitelistCheck()
            if (!whitelistData) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Whitelist not set up')
                        .setColor('Red')
                        .setDescription('Please set up a whitelist using \`/whitelist <user/role> add\`!')
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

            let roles = whitelistData?.roles
            let users = whitelistData?.users

            if (users[0]) {
                users.forEach((user, index) => {
                    users[index] = `<@${user}>`
                })

                users = users.join(' \|\| ')

                while (users.length > 980) {
                    users = users.split(' || ')
                    users.pop()
                    users = users.join(' \|\| ')
                    users += '......Cut off due to it being too long.'
                }
            } else {
                users = 'None'
            }

            if (roles[0]) {
                roles.forEach((role, index) => {
                    roles[index] = `<@&${role}>`
                })

                roles = roles.join(' || ')

                while (roles.length > 980) {
                    roles = roles.split(' \|\| ')
                    roles.pop()
                    roles = roles.join(' \|\| ')
                    roles += '......Cut off due to it being too long.'
                }
            } else {
                roles = 'None'
            }

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Command Whitelist')
                        .setDescription(`Whitelist for ${interaction.guild.name}! If your whitelist is cut off due to it being too long, try making a \`whitelist\` role, whitelist the role, then give it to people you want to whitelist to reduce space. You can also request your full data by pinging @Storm7093#6591 or joining his server!`)
                        .setAuthor({
                            iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                            name: `|| ${interaction.guild.name}`
                        })
                        .setFooter({
                            iconURL: interaction.member.displayAvatarURL(),
                            text: interaction.user.id
                        })
                        .setTimestamp()
                        .setColor('#ff6575')
                        .addFields({
                            name: 'Whitelisted Roles:',
                            value: roles
                        }, {
                            name: 'Whitelisted Users:',
                            value: users
                        })
                ],
                ephemeral: true
            })

        } else {
            whitelistCheck()
            if (!confirm) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Please Confirm')
                        .setDescription('Select \`True\` if you wish to confirm to delete your whitelist data from our database. __***THIS ACTION CAN NOT BE UNDONE.***__')
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
            await whitelistSchema.findOneAndDelete({
                guildId: interaction.guild.id
            })
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Data deleted successful')
                        .setColor('Green')
                        .setDescription('Your whitelist data has been successfully removed from our database!')
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

