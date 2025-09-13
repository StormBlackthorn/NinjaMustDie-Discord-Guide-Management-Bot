const {
    ApplicationCommandType,
    ApplicationCommandOptionType,
    EmbedBuilder,
    resolveColor,
    PermissionsBitField
} = require('discord.js')

module.exports = {
    name: "embed",
    description: "A advanced embed builder for you to make your own embed!",
    cooldown: 5000,
    userPerms: [],
    botPerms: [],
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: "import",
        description: "import a embed using a embed save code!",
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: 'save_code',
            description: 'enter your embed save code here!',
            type: ApplicationCommandOptionType.String,
            required: true
        }],
    }, {
        name: 'create',
        description: 'make your own embed!',
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: 'author_text',
            description: 'the author text if the embed',
            type: ApplicationCommandOptionType.String,
            max_length: 256
        }, {
            name: 'author_icon',
            description: 'icon of the author text',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'author_url',
            description: 'url of the author text',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'title_url',
            description: 'set the url of the title',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'title',
            description: 'set the title for your embed',
            type: ApplicationCommandOptionType.String,
            max_length: 256
        }, {
            name: `description`,
            description: 'set the description for your embed',
            type: ApplicationCommandOptionType.String,
            max_length: 4096
        }, {
            name: 'color',
            description: 'the color of the embed',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'thumbnail',
            description: 'Thumbnail of the embed',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'image',
            description: 'image of the embed',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'footer_text',
            description: 'Text of the footer',
            type: ApplicationCommandOptionType.String,
            max_length: 2048,
        }, {
            name: 'footer_icon',
            description: 'Icon of the footer',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'timestamp',
            description: 'Wether or not to set a timestamp',
            type: ApplicationCommandOptionType.Boolean,
        }]
    }, {
        name: 'edit',
        description: 'Edit a embed from a save code!',
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: 'save_code',
            description: 'The save code for the embed that you wish to edit!',
            type: ApplicationCommandOptionType.String,
            required: true
        }, {
            name: 'author_text',
            description: 'the author text if the embed',
            type: ApplicationCommandOptionType.String,
            max_length: 256
        }, {
            name: 'author_icon',
            description: 'icon of the author text',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'author_url',
            description: 'url of the author text',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'title_url',
            description: 'set the url of the title',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'title',
            description: 'set the title for your embed',
            type: ApplicationCommandOptionType.String,
            max_length: 256
        }, {
            name: `description`,
            description: 'set the description for your embed',
            type: ApplicationCommandOptionType.String,
            max_length: 4096
        }, {
            name: 'color',
            description: 'the color of the embed',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'thumbnail',
            description: 'Thumbnail of the embed',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'image',
            description: 'image of the embed',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'footer_text',
            description: 'Text of the footer',
            type: ApplicationCommandOptionType.String,
            max_length: 2048,
        }, {
            name: 'footer_icon',
            description: 'Icon of the footer',
            type: ApplicationCommandOptionType.String
        }, {
            name: 'timestamp',
            description: 'Wether or not to set a timestamp',
            type: ApplicationCommandOptionType.Boolean,
        }]
    }],

    async run({
        interaction
    }) {

        function isLink(url) {
            const linkExp = /(https?:\/\/[^\s]+)/g;
            if (url.match(linkExp)) {
                return true;
            } else {
                return false;
            }
        }

        function isImage(url) {
            const imgExp = /\.(jpg|jpeg|png|webp|avif|gif|svg|JPG|JPEG|PNG)$/;
            return imgExp.test(url);
        }

        function isColor(color) {
            const colorExp = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
            if (color.match(colorExp)) {
                return true;
            } else {
                return false;
            }
        }

        function errorEmbed(error) {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('Error!')
                        .setDescription(error)
                ],
                ephemeral: true,
            })
        }

        function lineBreak(embed, helpMe) {
            embed.description ? embed.description = embed.description?.replaceAll(/\\n/g, '\n') : null
            embed.title ? embed.title = embed.title?.replaceAll(/\\n/g, '\n') : null
            embed.author?.name ? embed.author.name = embed.author.name.replaceAll(/\\n/g, '\n') : null
            embed.footer?.text ? embed.footer.text = embed.footer.text.replaceAll(/\\n/g, '\n') : null

            if (helpMe) {
                embed.description ? embed.description = embed.description?.replaceAll(/\$\%\^/g, ':') : null
                embed.title ? embed.title = embed.title?.replaceAll(/\$\%\^/g, ':') : null
                embed.author?.name ? embed.author.name = embed.author.name.replaceAll(/\$\%\^/g, ':') : null
                embed.footer?.text ? embed.footer.text = embed.footer.text.replaceAll(/\$\%\^/g, ':') : null
            }

            return embed;
        }

        async function checkImage(url) {
            try {
                const response = await fetch(url)

                return response.ok
            } catch (err) {
                return false
            }

        }

        const { options } = interaction;

        const subCmd = options.getSubcommand();

        const authorText = options.getString('author_text');
        const authorIcon = options.getString('author_icon');
        const authorUrl = options.getString('author_url');
        const titleUrl = options.getString('title_url');
        const title = options.getString('title');
        const description = options.getString('description');
        const color = options.getString('color');
        const thumbnail = options.getString('thumbnail');
        const image = options.getString('image');
        const footerText = options.getString('footer_text');
        const footerIcon = options.getString('footer_icon');
        let timestamp = options.getBoolean('timestamp');

        if (subCmd === 'create') {
            timestamp = timestamp === true ? 'true' : 'false'

            const embed = {
                title: title,
                color: color,
                description: description,
                url: titleUrl,
                thumbnail: {
                    url: thumbnail
                },
                image: {
                    url: image
                },
                author: {
                    name: authorText,
                    icon_url: authorIcon,
                    url: authorUrl
                },
                footer: {
                    text: footerText,
                    icon_url: footerIcon
                },
                timestamp: timestamp
            }

            let saveCode = []
            for (const key in embed) {
                let val = embed[key]
                if (val === null) {
                    delete embed[key]
                    saveCode.push('$%[null]/')
                } else if (typeof val === 'object' && val !== null) {
                    for (const valKey in val) {
                        if (val[valKey] === null) {
                            saveCode.push('$%[null]/')
                            delete val[valKey]
                        } else {                           
                            val[valKey] = val[valKey].replaceAll(':', '$%^')
                            saveCode.push(val[valKey])
                        }
                    }
                    if (Object.keys(val).length === 0) {
                        delete embed[key]
                    }
                } else {
                    val = val.replaceAll(':', '$%^')
                    saveCode.push(val)
                }
            }

            if ((embed.author?.url || embed.author?.icon_url) && !embed.author?.name) {
                return errorEmbed(`Please have an \`author name\` property value if you have \`author url\` or \`author icon url\` property value.`);
            }
            if (embed.author?.url && !isLink(embed.author?.url)) {
                return errorEmbed(`Please enter a valid url for \`author url\``);
            }
            if (embed.author?.icon_url && !(isImage(embed.author?.icon_url) || checkImage(embed.author?.icon_url))) {
                return errorEmbed(`Please enter a valid image link for \`author icon url\``);
            }
            if (embed.color && !isColor(embed.color)) {
                return errorEmbed(`Please enter a valid \`color\` property`);
            }
            if (embed.url && !embed.title) {
                return errorEmbed(`Please enter \`embed title\` property if you have \`title url\` property `);
            }
            if (embed.url && !isLink(embed.url)) {
                return errorEmbed(`Please enter a valid url for \`title url\` property.`);
            }
            if (embed.footer?.icon_url && !embed.footer?.text) {
                return errorEmbed(`Please have an \`embed footer text\` property value if you have \`embed footer icon\ property value.\``);
            }
            if (embed.footer?.icon_url && !(isImage(embed.footer?.icon_url) || checkImage(embed.footer?.icon_url))) {
                return errorEmbed(`Please enter a valid image link for \`embed footer icon url\``);
            }
            if (embed.image?.url && !(isImage(embed.image?.url) || checkImage(embed.thumbnail?.url))) {
                return errorEmbed(`Please enter a valid image link for \`embed image url\` property.`);
            }
            if (embed.thumbnail?.url && !(isImage(embed.thumbnail?.url) || checkImage(embed.thumbnail?.url))) {
                return errorEmbed(`Please enter a valid image link for \`thumbnail url\` property.`);
            }
            if (
                !(
                    embed.author?.name ||
                    embed.title ||
                    embed.description ||
                    embed.footer?.text ||
                    embed.image?.url ||
                    embed.thumbnail?.url
                )
            ) {
                return errorEmbed(`You need at least one image or text field!`);
            }


            if (embed.timestamp === "true") {
                embed.timestamp = new Date().toISOString()
            } else {
                delete embed.timestamp
            }

            if (embed.color) {
                embed.color = resolveColor(embed.color)
            }

            lineBreak(embed, false)

            saveCode = saveCode.join(':')

            if (saveCode.length > 1968) {
                interaction.reply({
                    content: `Embed Created! Sadly, your embed was too long for us to generate and send a save code.`,
                    ephemeral: true
                })
            } else {
                interaction.reply({
                    content: `Embed Created!\n Save code: \`${saveCode}\``,
                    ephemeral: true
                })
            }
            try {
                return interaction.channel.send({
                    embeds: [
                        embed
                    ]
                })
            } catch {
                return interaction.followUp({
                    content: 'Can not send embed due to missing permission to send messages!',
                    ephemeral: true
                })
            }

        }


        if (subCmd === 'import') {
            let saveCode = options.getString('save_code').split(':')
            if (saveCode.length !== 12) {
                return errorEmbed('Please enter a valid saveCode!')
            }
            let count = 0;

            const embed = {
                title: "title",
                color: "color",
                description: "description",
                url: "titleUrl",
                thumbnail: {
                    url: "thumbnail"
                },
                image: {
                    url: "image"
                },
                author: {
                    name: "authorText",
                    icon_url: "authorIcon",
                    url: "authorUrl"
                },
                footer: {
                    text: "footerText",
                    icon_url: "footerIcon"
                },
                timestamp: "timestamp"
            }

            for (const key in embed) {
                const val = embed[key]
                if (typeof val === 'object') {
                    for (const valKey in val) {
                        if (saveCode[count] === '$%[null]/') {
                            delete val[valKey]
                            count++
                        } else {
                            val[valKey] = saveCode[count]
                            count++
                        }
                    }
                    if (Object.keys(val).length === 0) {
                        delete embed[key]
                    }
                } else if (saveCode[count] === '$%[null]/') {
                    delete embed[key]
                    count++
                } else {
                    embed[key] = saveCode[count]
                    count++
                }
            }

            if ((embed.author?.url || embed.author?.icon_url) && !embed.author?.name) {
                return errorEmbed(`Please have an \`author name\` property value if you have \`author url\` or \`author icon url\` property value.`);
            }
            if (embed.author?.url && !isLink(embed.author?.url)) {
                return errorEmbed(`Please enter a valid url for \`author url\``);
            }
            if (embed.author?.icon_url && !(isImage(embed.author?.icon_url) || checkImage(embed.author?.icon_url))) {
                return errorEmbed(`Please enter a valid image link for \`author icon url\``);
            }
            if (embed.color && !isColor(embed.color)) {
                return errorEmbed(`Please enter a valid \`color\` property`);
            }
            if (embed.url && !embed.title) {
                return errorEmbed(`Please enter \`embed title\` property if you have \`title url\` property `);
            }
            if (embed.url && !isLink(embed.url)) {
                return errorEmbed(`Please enter a valid url for \`title url\` property.`);
            }
            if (embed.footer?.icon_url && !embed.footer?.text) {
                return errorEmbed(`Please have an \`embed footer text\` property value if you have \`embed footer icon\ property value.\``);

            }
            if (embed.footer?.icon_url && !isImage(embed.footer?.icon_url)) {
                return errorEmbed(`Please enter a valid save code.`);
            }
            if (embed.image?.url && !(isImage(embed.image?.url)) && checkImage(embed.thumbnail?.url)) {
                return errorEmbed(`Please enter a valid image link for \`embed image url\` property.`);
            }
            if (embed.thumbnail?.url && !(isImage(embed.thumbnail?.url) || checkImage(embed.thumbnail?.url))) {
                return errorEmbed(`Please enter a valid image link for \`thumbnail url\` property.`);
            }
            if (
                !(
                    embed.author?.name ||
                    embed.title ||
                    embed.description ||
                    embed.footer?.text ||
                    embed.image?.url ||
                    embed.thumbnail?.url
                )
            ) {
                return errorEmbed(`Please enter a valid save code(a necessary requirement for an embed to be made is not met).`);
            }

            if (embed.timestamp === "true") {
                embed.timestamp = new Date().toISOString()
            } else {
                delete embed.timestamp
            }


            if (embed.color) {
                embed.color = resolveColor(embed.color)
            }

            interaction.reply({
                content: 'Embed imported successfully!',
                ephemeral: true
            })

            lineBreak(embed, true)

            return interaction.channel.send({
                embeds: [
                    embed
                ]
            })
        }


        if (subCmd === 'edit') {
            const saveCode = options.getString('save_code').split(':')
            if (timestamp !== null) {
                timestamp = timestamp === true ? 'true' : 'false'
            }

            const source = {
                title: title,
                color: color,
                description: description,
                url: titleUrl,
                thumbnail: {
                    url: thumbnail
                },
                image: {
                    url: image
                },
                author: {
                    name: authorText,
                    icon_url: authorIcon,
                    url: authorUrl
                },
                footer: {
                    text: footerText,
                    icon_url: footerIcon
                },
                timestamp: timestamp
            }

            const target = {
                title: "title",
                color: "color",
                description: "description",
                url: "titleUrl",
                thumbnail: {
                    url: "thumbnail"
                },
                image: {
                    url: "image"
                },
                author: {
                    name: "authorText",
                    icon_url: "authorIcon",
                    url: "authorUrl"
                },
                footer: {
                    text: "footerText",
                    icon_url: "footerIcon"
                },
                timestamp: "timestamp"
            }

            let example = JSON.parse(JSON.stringify(source));


            let count = 0;

            for (const key in target) {
                const val = target[key]
                if (typeof val === 'object') {
                    for (const valKey in val) {
                        if (saveCode[count] === '$%[null]/') {
                            delete val[valKey]
                            count++
                        } else {
                            val[valKey] = saveCode[count]
                            count++
                        }
                    }
                    if (Object.keys(val).length === 0) {
                        delete target[key]
                    }
                } else if (saveCode[count] === '$%[null]/') {
                    delete target[key]
                    count++
                } else {
                    target[key] = saveCode[count]
                    count++
                }
            }

            for (const key in source) {
                const val = source[key]
                if (typeof val === 'object' && val !== null) {
                    for (const valKey in val) {
                        if (val[valKey] === null || val[valKey].toLowerCase() === 'none') {
                            delete val[valKey]
                        }
                    }
                    if (Object.keys(val).length === 0) {
                        delete source[key]
                    }
                } else if (val === null) {
                    delete source[key]
                } else if (val.toLowerCase() === 'none') {
                    delete source[key]
                }
            }

            const embed = Object.assign(target, source)

            example = {
                title: (embed.title || null),
                color: (embed.color || null),
                description: (embed.description || null),
                url: (embed.url || null),
                thumbnail: {
                    url: (embed.thumbnail?.url || null)
                },
                image: {
                    url: (embed.image?.url || null)
                },
                author: {
                    name: (embed.author?.name || null),
                    icon_url: (embed.author?.icon_url || null),
                    url: (embed.author?.url || null)
                },
                footer: {
                    text: (embed.footer?.text || null),
                    icon_url: (embed.footer?.icon_url || null)
                },
                timestamp: (embed.timestamp || null)
            }

            let embedSaveCode = []

            for (const key in example) {
                const val = example[key]

                if (val === null) {
                    delete example[key]
                    embedSaveCode.push('$%[null]/')
                } else if (typeof val === 'object' && val !== null) {
                    for (const valKey in val) {
                        if (val[valKey] === null) {
                            embedSaveCode.push('$%[null]/')
                            delete val[valKey]
                        } else {
                            embedSaveCode.push(val[valKey])
                        }
                    }
                    if (Object.keys(val).length === 0) {
                        delete example[key]
                    }
                } else {
                    embedSaveCode.push(val)
                }
            }
            embedSaveCode = embedSaveCode.join(':')

            if ((embed.author?.url || embed.author?.icon_url) && !embed.author?.name) {
                return errorEmbed(`Please have an \`author name\` property value if you have \`author url\` or \`author icon url\` property value.`);
            }
            if (embed.author?.url && !isLink(embed.author?.url)) {
                return errorEmbed(`Please enter a valid url for \`author url\``);
            }
            if (embed.author?.icon_url && !(isImage(embed.author?.icon_url) || checkImage(embed.author?.icon_url))) {
                return errorEmbed(`Please enter a valid image link for \`author icon url\``);
            }
            if (embed.color && !isColor(embed.color)) {
                return errorEmbed(`Please enter a valid \`color\` property`);
            }
            if (embed.url && !embed.title) {
                return errorEmbed(`Please enter \`embed title\` property if you have \`title url\` property `);
            }
            if (embed.url && !isLink(embed.url)) {
                return errorEmbed(`Please enter a valid url for \`title url\` property.`);
            }
            if (embed.footer?.icon_url && !embed.footer?.text) {
                return errorEmbed(`Please have an \`embed footer text\` property value if you have \`embed footer icon\ property value.\``);
            }
            if (embed.footer?.icon_url && !(isImage(embed.footer?.icon_url) || checkImage(embed.footer?.icon_url))) {
                return errorEmbed(`Please enter a valid image link for \`embed footer icon url\``);
            }
            if (embed.image?.url && !(isImage(embed.image?.url) || checkImage(embed.thumbnail?.url))) {
                return errorEmbed(`Please enter a valid image link for \`embed image url\` property.`);
            }
            if (embed.thumbnail?.url && !(isImage(embed.thumbnail?.url) || checkImage(embed.thumbnail?.url))) {
                return errorEmbed(`Please enter a valid image link for \`thumbnail url\` property.`);
            }
            if (
                !(
                    embed.author?.name ||
                    embed.title ||
                    embed.description ||
                    embed.footer?.text ||
                    embed.image?.url ||
                    embed.thumbnail?.url
                )
            ) {
                return errorEmbed(`You need at least one image or text field!`);
            }

            if (embed.timestamp === 'true') {
                embed.timestamp = new Date().toISOString()
            } else {
                delete embed.timestamp
            }

            if (embed.color) {
                embed.color = resolveColor(embed.color)
            }

            if (embedSaveCode.length > 1956) {
                interaction.reply({
                    content: `Embed edited successfully! Sadly, your embed was too long for us to generate and send a save code.`,
                    ephemeral: true
                })
            } else {
                interaction.reply({
                    content: `Embed edited successfully!\n Save code: \`${embedSaveCode}\``,
                    ephemeral: true
                })
            }

            lineBreak(embed, true)
            interaction.channel.send({
                embeds: [
                    embed
                ]
            })
        }
    }
}





