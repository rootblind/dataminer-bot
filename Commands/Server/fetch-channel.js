/*
        This command fetches 50k messages from a channel (due to discord timeout limitations), filters them with filterMessage()
    to avoid creating errors in the csv format and stores them in a data.csv file, building an unlabeled dataset of the messages
    Discord API has a 100 limit but it can be bypassed by running the messages.fetch method multiple times
*/

const {SlashCommandBuilder, EmbedBuilder, ChannelType} = require('discord.js')
const utils = require('../../utility_modules/utility_methods');
const fs = require('fs');

module.exports = {
    ownerOnly: true,
    cooldown: 20,
    data: new SlashCommandBuilder()
        .setName('fetch-channel')
        .setDescription('Fetch messages from the specified channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Specified channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('id')
                    .setDescription('The id of the message to start with')
            ),
    async execute(interaction, client) {

        const channel = interaction.options.getChannel('channel');

        await interaction.deferReply(); // defering a reply helps with discord timeout

        let lastID = interaction.options.getString('id');

        const allMessages = await utils.fetchAll( channel, interaction, lastID);
        
        const data = allMessages.map(x => x.content); // fetchAll returns message objects, but we only care about the content
       
        // the file is created upon ready event, but we're checking anyway
        // the reason for this code is that initially i was storing each channel messages in its own files
        // then i thought that i eventually had to combine all of them so i am storing everything in one file from the beginning
        if((await utils.isFileOk(`./MessageLogging/data.csv`)) == false) {
            await fs.promises.writeFile(`./MessageLogging/data.csv`, 'Message\n', 'utf8');
        }

        data.forEach((message) => {
            utils.csvAppend(utils.filterMessage(message), `./MessageLogging/data.csv`);
        });// the csvAppend runs a check on the input and adds "" where needed, so the best way to store everything is by
        // calling it for each message
        
       

        const embed = new EmbedBuilder()
            .setTitle('Fetching successfully')
            .setDescription(`Messages from ${channel} have been fetched.`);

        return interaction.followUp({content: `${interaction.user}`, embeds:[embed]});

    }

};