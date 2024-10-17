exports.type = 'command';
exports.name = 'Ping';
exports.calls = ['ping', 'pong'];

exports.commandObject = {
    name: "ping",
    description: "Check the response time of the bot"
}

exports.callback = (message, args, userdata, timeToProcessCommand) => {
    message.reply('Ponging...').then(msg => {
        let totalDif = msg.createdTimestamp - message.createdTimestamp;
        msg.edit(`Pong! Took **${totalDif} ms** to respond.\nLatency to Discord servers is about **${client.ws.ping} ms**\nTime to process command: **${(timeToProcessCommand * 1000).toFixed(1)} μs** or **${timeToProcessCommand.toFixed(4)} ms**`).catch(console.error);
    }).catch(console.error);
}

exports.interactionCallback = interaction => {
    interaction.reply(`Pong! Discord API response time: **${client.ws.ping}**ms`);
}