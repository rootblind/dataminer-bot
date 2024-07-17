const utils = require('../../utility_modules/utility_methods');
const fs = require('graceful-fs');
module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if(message.author.bot || !message.guildId || !message.member) return;
        if((await utils.isFileOk('./objects/ignorelist.json')) == false) {
            const initObj = {"channel":[]};
            await fs.promises.writeFile('./objects/ignorelist.json', JSON.stringify(initObj, null, 2), 'utf8');
        }
        const dataFile = fs.readFileSync('./objects/ignorelist.json', 'utf8');
        const dataObj = JSON.parse(dataFile);
        if(dataObj["channel"].includes(message.channelId.toString())) {
            return;
        }
        if((await utils.isFileOk(`./MessageLogging/data.csv`)) == false) {
            await fs.promises.writeFile(`./MessageLogging/data.csv`, 'Message\n', 'utf8');
        }
        utils.csvAppend(utils.filterMessage(message.content),
        './MessageLogging/data.csv');
        
    }
};