// The first signs of "it works!" are provided by the ready event.
// It is also used to initialize some features from the first moments, like auto-updating the presence

const { Client, ActivityType} = require("discord.js");
const { config } = require('dotenv');
const botUtils = require('../../utility_modules/utility_methods.js');
config();

module.exports = {
    name: 'ready',
    once: true,
    async execute(client){
        await client.user.setPresence({
            activities: [
                {
                    name: "Minecraft",
                    type: ActivityType.Playing,
                },
            ],
            status: "online",
        });

        console.log(
                `${
                    client.user.username
                } is functional! - ${botUtils.formatDate(new Date())} | [${botUtils.formatTime(new Date())}]`
            );
    


    }

};
