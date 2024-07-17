const {SlashCommandBuilder, EmbedBuilder, ChannelType} = require('discord.js');
const fs = require('fs');

module.exports ={
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName('ignorelist')
        .setDescription('Add or remove a channel from ignore list.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The targeted channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        if((await botUtils.isFileOk('./objects/ignorelist.json')) == false) {
            const initObj = {"channel":[]};
            await fs.promises.writeFile('./objects/ignorelist.json', JSON.stringify(initObj, null, 2), 'utf8');
        }
        const dataFile = fs.readFileSync('./objects/ignorelist.json', 'utf8');
        const dataObj = JSON.parse(dataFile);
        if(dataObj["channel"].includes(channel.id.toString())) {
            dataObj['channel'] = dataObj['channel'].filter(ch => ch !== channel.id.toString());
        }
        else {
            dataObj['channel'].push(channel.id);
        }
        fs.writeFileSync('./objects/ignorelist.json', JSON.stringify(dataObj, null, 2), 'utf8');

        const embed = new EmbedBuilder()
            .setTitle('Ignore list updated')
            .setDescription(`IDs ignored: ${dataObj['channel'].join(", ")}`)
            .setColor('Red')
        
        return interaction.reply({embeds: [embed]});
    }
};