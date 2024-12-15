const {SlashCommandBuilder, EmbedBuilder, ChannelType} = require('discord.js')
const utils = require('../../utility_modules/utility_methods');
const fs = require('fs');



module.exports = {
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName('fetch-images')
        .setDescription('Fetch all images from the specified channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to be scraped.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('id')
                .setDescription('The id of the message to start with')
        ),

    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const id = interaction.options.getString('id');
        await interaction.deferReply();
        const createDirPromise = new Promise((resolve, reject) => {
            utils.isDirOk(`scrapped_images/${channel.id}`);
            resolve(true);
        });

        await createDirPromise;

        const allMessages = await utils.fetchAll( channel, interaction, id);

        const data_media = allMessages
            .map(message => message.attachments)
            .filter(attachments => attachments.size > 0)
        

        for(media of data_media) {
            for(x of media) {
                try{
                    await utils.saveImage(x[1].url, `scrapped_images/${channel.id}/${x[0]}.png`);
                } catch(e) {console.error(e)}
            }
        }
    }
}