const {CommandInteraction, PermissionFlagsBits, Collection, EmbedBuilder} = require('discord.js');
const {config} = require('dotenv');
config();
const fs = require('fs');


module.exports = {
    name: 'interactionCreate',

    execute(interaction, client){
        

        if(interaction.isChatInputCommand())
        {

            const command = client.commands.get(interaction.commandName);
            const me = interaction.guild.members.cache.get(process.env.KAYLE_CLIENT_ID);
            if(interaction.guild === null) {
                return interaction.reply('Private commands are not available yet!');
                
            }

            if(command.ownerOnly === true && interaction.user.id !== process.env.OWNER){
                const rEmbed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('Error')
                        .setDescription('This command requires Master privileges.');
                    interaction.reply({ embeds: [rEmbed], ephemeral: true });
                    return;
            }

            if (command.userPermissions?.length) {
                for (const permission of command.userPermissions) {
                    if (interaction.member.permissions.has(permission)) {
                        continue;
                    }
                    const rEmbed = new EmbedBuilder()
                        .setColor(`Red`)
                        .setTitle('Error')
                        .setDescription(`You have insufficient permissions! ${PermissionFlagsBits[permission]}`);
                    interaction.reply({ embeds: [rEmbed], ephemeral: true });
                    return;
                }
            }

            if (command.botPermissions?.length) {
                for (const permission of command.botPermissions) {
                    if (interaction.member.permissions.has(permission)) {
                        continue;
                    }
                    const rEmbed = new EmbedBuilder()
                        .setColor(`Red`)
                        .setTitle('Error')
                        .setDescription(`I lack the permission(s) to do that! ${PermissionFlagsBits[permission]}`);
                    interaction.reply({ embeds: [rEmbed], ephemeral: true });
                    return;
                }
            }

            
            if(command.testOnly && interaction.guild.id !== process.env.HOME_SERVER_ID) {
                const rEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Error')
                    .setDescription('This command cannot be ran outside the Test Server!')
                    interaction.reply({ embeds: [rEmbed], ephemeral: true });
                    return;
            }

            // user based cooldown implementation https://discordjs.guide/additional-features/cooldowns
            const { cooldowns } = interaction.client; 
            // adding a cooldown collection for all the commands
            if(!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now(); // the interaction is sent
            const timestamps = cooldowns.get(command.data.name); // the cooldown of the specific interaction
            const defaultCooldownDuration = 0; // the default cooldown duration in case it is not specifiend in the slash command
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

            // checking if user is in cooldown for the specified command
            if(timestamps.has(interaction.user.id)) {
                // calculates the cooldown expiration timer
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
                // checking if the cooldown expired and gives a reply if not
                if(now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
		            return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
	
                }
                
            }
            // if user isn't a key of the cooldown collection, then the user is added.
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            
            if(!command)
            {
                interaction.reply({content: "This is not an operable command!"});
            }
            command.execute(interaction, client);
        }

    
        else return;
    }
}