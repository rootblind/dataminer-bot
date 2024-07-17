/*
        This command fetches 50k messages from a channel (due to discord timeout limitations), filters them with filterMessage()
    to avoid creating errors in the csv format and stores them in a data.csv file, building an unlabeled dataset of the messages
    Discord API has a 100 limit but it can be bypassed by running the messages.fetch method multiple times
*/

const {SlashCommandBuilder, EmbedBuilder, ChannelType} = require('discord.js')
const utils = require('../../utility_modules/utility_methods');
const fs = require('fs');


// i found this code in a 4 years old unsupported library called discord-fetch-all written in  typescript
// translated it to native js and adapted to my use case
async function fetchAll(channel, interaction, lastID){
    let messages = []; // fetched messages will be stored in this array
    let editMessage = 'Still working on it.' // in order to extend discord's timeout timer, the interaction message will be edited
    // ever so often
    let batch = 0; // keeping track of how many messages were fetched so far
    while (true) {
        // fetching 100 at a time and keeping track of the last message ID in order to go back to it and continue fetching from
        //where we left
        const fetchedMessages = await channel.messages.fetch({ 
            limit: 100, 
            ...(lastID && { before: lastID }) 
          })

        if (fetchedMessages.size === 0 || batch >= 50000) {
            messages = messages.reverse(); // for chronological reasons
            messages = messages.filter(msg => !msg.author.bot); // we don't care about bot messages
            await interaction.editReply(`Fetching stopped at ID  ${lastID} - https://discord.com/channels/${interaction.guild.id}/${channel.id}/${lastID}`); // communicating the last ID in order to run the command
            // multiple times since at around 80000 messages, the discord timeout can not be extended any further
            // a clunky solution but it's the best i got
            // i limited it to 50000 instead of 80000 because of the number being more "round" and slower machines might reach
            //the timeout sooner than 80000, my machine is quite fast.
            return messages;
        }
        else if(batch % 1000 === 0 && batch > 0) {
            await interaction.editReply(editMessage); // uopdating the interaction message every 1000 messages
            editMessage += '.';
        }
        batch += fetchedMessages.size;
        messages = messages.concat(Array.from(fetchedMessages.values())); // adding every batch of fetched messages to the Array
        lastID = fetchedMessages.lastKey(); // storing the last message id
    }
}

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

        const allMessages = await fetchAll( channel, interaction, lastID);
        
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