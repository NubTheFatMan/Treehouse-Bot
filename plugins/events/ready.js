exports.type = 'event';
exports.name = 'Ready';
exports.event = 'ready';

exports.callback = () => {
    global.readyTime = performance.now() - startWatch - startupTime;

    let memUse = process.memoryUsage();
    let [used, total] = [memUse.heapUsed / 1000 / 1000, memUse.heapTotal / 1000 / 1000];

    let timeTaken = `${(startupTime / 1000).toFixed(3)} seconds to process code\n${(readyTime / 1000).toFixed(3)} seconds to login with Discord\n${((startupTime + readyTime) / 1000).toFixed(3)} seconds total`;

    let ready = `Ready! Took ${timeTaken}`;
    let mem = `${(used / total * 100).toFixed(3)}% (${used.toFixed(2)}MB / ${total.toFixed(2)}MB)`;

    console.log(ready);
    console.log('Memory usage: ' + mem);

    let channel = client.channels.cache.get(startChannel);
    if (channel) {
        let embed = new Discord.EmbedBuilder();
            embed.setColor(0x0096ff);
            embed.setTitle('Startup Information');
            embed.addFields(
                {name: 'Memory Heap Usage', value: mem},
                {name: 'Startup Time', value: timeTaken},
                {name: "Plugins Loaded", value: `${plugins.size} plugins loaded across ${fileCount} files.`},
                {name: "Source Code", value: `[View Source Code on GitHub](https://github.com/NubTheFatMan/Treehouse-Bot)`}
            );

        channel.send({embeds: [embed]});
    }

    client.application.commands.set(calculateSlashCommandsArray());
}