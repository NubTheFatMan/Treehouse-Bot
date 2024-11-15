console.log("Initializing...");

global.startWatch = performance.now();
global.startupTime = null;
global.readyTime = null;


global.Discord = require('discord.js');
global.fs      = require('fs');

// Jimp is special and requires this setup
let {Jimp} = require("jimp");
global.Jimp    = Jimp;

require('dotenv').config();
console.log("NPM dependencies loaded and .env loaded.");

let intents = Discord.GatewayIntentBits;
global.client = new Discord.Client({
    intents: [
        intents.Guilds,
        intents.GuildMessages,
        intents.GuildMessageReactions,
        intents.MessageContent
    ]
});

global.commands = new Map();
global.slashCommands = new Map();
global.eventHandlers = new Map();
global.plugins = new Map();

let spacer = ' -> ';
global.registerPlugin = (plugin, nest = 1) => {
    if (typeof plugin.name !== "string") 
        throw new Error("Plugin must be named");

    if (typeof nest !== "number")
        throw new Error("Nest must be a number")

    let nestSpacer = spacer.repeat(nest);

    plugins.set(plugin.name, plugin);
    console.log(`${nestSpacer}Registered plugin "${plugin.name}"`);

    switch(plugin.type) {
        case "command": {
            if (plugin.calls instanceof Array && plugin.callback instanceof Function) {
                commands.set(plugin.name, plugin);
                console.log(`${nestSpacer}  - Registered text command with calls: ~${plugin.calls.join(', ~')}`);
            }

            if (typeof plugin.commandObject?.name == "string" && plugin.interactionCallback instanceof Function) {
                slashCommands.set(plugin.commandObject.name, plugin);
                console.log(`${nestSpacer}  - Registered slash command "/${plugin.commandObject.name}"`);
            }
        } break;

        case "event": {
            if (typeof plugin.event == "string" && plugin.callback instanceof Function) {
                eventHandlers.set(plugin.name, plugin);
                console.log(`${nestSpacer}  - Registered event listener on "${plugin.event}"`);
            }
        }
    }

    if (plugin.subPlugins instanceof Array) {
        for (let i = 0; i < plugin.subPlugins.length; i++) {
            let sub = plugin.subPlugins[i];
            if (!sub.name)
                sub.name = `${plugin.name}.sub.${i}`;
            registerPlugin(sub, nest + 1);
        }
    }
}

global.fileCount = 0;
global.loadFile = file => {
    if (require.cache[require.resolve(file)]) {
        delete require.cache[require.resolve(file)];
    }

    console.log(`Requiring file: ${file}`);
    let plugin = require(file);
    plugin.file = file;
    if (!plugin.name) plugin.name = file;
    registerPlugin(plugin);

    fileCount++;
    return plugin;
}

global.requireAll = dir => {
    fs.readdirSync(dir).forEach(file => {
        let path = dir + '/' + file;
        if (fs.statSync(path).isDirectory()) {
            requireAll(path);
        } else {
            if (path.endsWith('.js')) {
                loadFile(path);
            }
        }
    });
}

require('./vars.js'); // This takes priority before any plugins
console.log('Loaded vars.js')

console.log('Loading plugin files...');
requireAll(process.cwd() + '/plugins');
console.log(`Loaded ${plugins.size} plugins across ${fileCount} files.`);

refreshEvents();
console.log("Event listers are listening.");

client.login();
global.startupTime = performance.now() - startWatch;
console.log("Logging in client...");


process.on('unhandledRejection', (reason, promise) => {
    messageDevs(`A promise wasn't handled with a \`.catch()\`.\`\`\`\n${reason.stack}\`\`\``);
    console.error(reason);
});
process.on('uncaughtException', (error, origin) => {
    // Since an error occured, send a message to the dev channel and 
    // safely save all files before actually terminating the process (preventing corrupting any .json mid-save)
    console.error(error);

    // Used to make sure a message is sent to the dev channel at least before a restart
    let devMessagePromise = messageDevs(`An exception wasn't caught. Since part of my code may be corrupted, I am restarting myself. Here's the stack trace:\`\`\`\n${error.stack}\`\`\``);
    if (devMessagePromise) {
        devMessagePromise.then(process.exit)
    } else {
        process.exit();
    }
});