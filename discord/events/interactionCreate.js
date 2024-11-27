const { Events, InteractionType, PermissionsBitField } = require('discord.js');
const { errorEmbed } = require('../../storage/constants.js');

module.exports = {
    name: Events.InteractionCreate,
    async run(bot, interaction) {

        if (bot.dev) return;

        if (interaction.user.bot) return;
        interaction.owner = bot.config.discord.owners.includes(interaction.user.id);
        interaction.twitch = {
            userId: bot.links.get(interaction.user.id),
        }

        
        switch (interaction.type) {

            case InteractionType.ApplicationCommand: 

                const command = bot.commands.get(interaction.commandName);
                if (!command) return interaction.reply({ embeds: [errorEmbed("Cette commande n'existe pas")], ephemeral: true });
                
                if (command.owner && !interaction.owner) return interaction.reply({ embeds: [errorEmbed("Cette commande est seulement utilisable par le créateur du bot")], ephemeral: true });
                if (command.channels && !command.channels?.includes(interaction.channel.id)) return interaction.reply({ embeds: [errorEmbed(`Cette commande n'est pas utilisable dans ce salon, allez dans : ${command.channels.map(c => `<#${c}>`).join(', ')}`)], ephemeral: true });
                if (command.must_linked && !bot.links.has(interaction.user.id)) return interaction.reply({ embeds: [errorEmbed("Vous devez lié votre compte twitch pour utiliser cette commande (/twitch login)")], ephemeral: true });
                
                await command.run(bot, interaction);

            break;
            

            case InteractionType.ApplicationCommandAutocomplete:

                const autocompleteManager = bot.commands.get(interaction.commandName).autocomplete;
                let reply = await autocompleteManager(bot, interaction);

                if (reply.length > 25) {
                    const restants = reply.length - 24;
                    reply = reply.slice(0, 24);
                    reply.push({ name: `Et ${restants} autres`, value: '-' });
                };

                await interaction.respond(reply);

            break;

            default:

                bot.log(`Interaction "${interaction.customId}" used by user "${interaction.user.id}"`, 'cmd');

                const name = interaction.customId.split("_")[0];
                const args = interaction.customId.split("_").slice(1);
                const file = bot.interactions.find(i => i.name === name);

                if (!file) return;

                if (file.permission && !interaction.member.permissions.has(new PermissionsBitField(file.permission))) return await interaction.reply({
                    content: `Vous devez avoir les permissions suivantes pour utiliser cette interaction: \`${new PermissionsBitField(file.permission).toArray().join(', ')}\``,
                    ephemeral: true,
                });

                await file.run(bot, interaction, ...args);

            break;
        }
    }
}