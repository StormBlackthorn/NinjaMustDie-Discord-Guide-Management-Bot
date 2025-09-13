const { client } = require('../../index.js')
const {
    EmbedBuilder,
    ChannelType,
} = require('discord.js')


module.exports = {
    event: 'guildCreate',
    async run(guild) {

        var thankYouEmbed = new EmbedBuilder()
            .setAuthor({
                name: " || " + guild.name,
                iconURL: guild.iconURL() || client.user.displayAvatarURL()
            })
            .setThumbnail(client.user.displayAvatarURL())
            .setTitle(`Thanks for inviting me into \`${guild.name}\`!`)
            .setColor('Orange')
            .setDescription('Thanks for picking me to join your wonderful server! You can now connect your Discord Community flawlessly to Ninja Must Die!! Use \`/help\` for a list of all commands!')
            .setFooter({
                text: `Thank you very much!!! <3`,
            })
            .setTimestamp()

        const AuditLogFetch = await guild.fetchAuditLogs({
            limit: 1,
            type: "BOT_ADD",
        }).catch((e) => { });
        const Entry = AuditLogFetch?.entries?.first();

        client.channels.cache.get('1080658471021723678').send({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`I Was Added To A New Server`)
                    .addFields(
                        {
                            name: "Server Name",
                            value: guild.name,
                        },
                        {
                            name: "Server Owner",
                            value: owner?.user?.tag || "Not Found",
                        },
                        {
                            name: "Server Size",
                            value: guild.memberCount.toString(),
                        },
                        {
                            name: "Inviter",
                            value: Entry?.executor?.tag || "Not Found",
                        },
                        {
                            name: "Created At",
                            value: guild.createdAt.toDateString(),
                        },
                        {
                            name: "ID",
                            value: guild.id,
                        }
                    )
                    .setThumbnail(
                        guild.iconURL({
                            dynamic: true,
                            size: 4096,
                        })
                    )
                    .setColor("#0D98BA")
                    .setFooter({
                        text: `I Am Now In ${servers} Servers!`,
                    })

            ]
        })

        if (guild.systemChannel && guild.systemChannel.permissionsFor(guild.member.me).has('SendMessages')) {
            try {
                guild.systemChannel.send({
                    embeds: [
                        thankYouEmbed
                    ]
                })
            } catch (err) {
                const channel = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText)
                if (!channel) return;
                for (const i of channel) {
                    if (i[1].permissionsFor(guild.members.me).has('SendMessages')) {
                        try {
                            i[1].send({
                                embeds: [
                                    thankYouEmbed
                                ]
                            })
                        } catch (err) {

                        }
                    }
                }
                return;
            }
        } else {
            const channel = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText)
            if (!channel) return;
            for (const i of channel) {
                if (i[1].permissionsFor(guild.members.me).has('SendMessages')) {
                    try {
                        i[1].send({
                            embeds: [
                                thankYouEmbed
                            ]
                        })
                    } catch (err) {

                    }
                }
            }
            return;
        }
    }
}
