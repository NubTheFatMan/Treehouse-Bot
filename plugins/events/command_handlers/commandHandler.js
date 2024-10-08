exports.type = 'event';
exports.name = "Command Handler";
exports.event = "messageCreate";

exports.callback = message => {
    if (message.author.bot) return;

    let startedProcessingTime = performance.now();

    let prefix = "~";

    let pat = [`<@${client.user.id}>`, `<@!${client.user.id}>`];

    let msg = message.content;
    if (msg === pat[0] || msg === pat[1]) {
        message.reply(`My prefix is \`${prefix}\``).catch(console.error);
        return;
    }

    if (msg.startsWith(pat[0])) {
        prefix = pat[0];
    } else if (msg.startsWith(pat[1])) {
        prefix = pat[1];
    }

    if (!msg.startsWith(prefix)) return;

    let args = msg.slice(prefix.length).trim().split(/ +/g);
    let cmd = removeFormatting(args.shift().toLowerCase());

    let ran = false;
    for (let [name, command] of commands) {
        let can = command.allowed?.length ? command.allowed.includes(message.author.id) : true;
        if (can) {
            for (let call of command.calls) {
                if (cmd === call) {
                    // Update the users last command ran timestamp
                    let dataManager = plugins.get("User Data Manager");
                    let data = dataManager.getUserData(message.author.id);
                    data.lastCommandTimestamp = message.createdTimestamp;
                    dataManager.saveUserData(message.author.id);
                    
                    ran = true;
                    try {
                        let timeToProcessCommand = performance.now() - startedProcessingTime;
                        command.callback(message, args, timeToProcessCommand);
                    } catch (err) {
                        console.error(err);
                        messageDevs(`<@${message.author.id}> (${message.author.id}) encountered an error in command \`${cmd}\`.\`\`\`\n${err.stack}\`\`\``);
                        message.reply(`An error occured while executing the command \`${name}\`. Developers have been notified, so you don't need to do anything!`).catch(console.error);
                    } finally {
                        break;
                    }
                }
            }
        }
    }

    if (!ran) {
        message.reply(`Unknown command`).catch(console.error);
        return;
    }
}