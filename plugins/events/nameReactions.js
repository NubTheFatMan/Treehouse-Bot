exports.type = "event";
exports.name = "Name Reactions";
exports.event = "messageCreate";

// <:kaching:1135966356580352060> 
// <:fuckboi:1135966358455201864> 
// <:bitinglipmmm:1099133287202553906> 
// <:joeShh:1135966344500744282> 
// <:madcat:1135966355032653987>

exports.storageFile = process.cwd() + '/userdata/nameReactions.json';

exports.namesManager = JSON.parse(fs.readFileSync(this.storageFile));

exports.callback = message => {
    let cleanContentLowerCase = message.cleanContent.toLowerCase();
    let toReactWith;
    for (let i = 0; i < this.namesManager.names.length; i++) {
        let name = this.namesManager.names[i];
        if (cleanContentLowerCase.includes(name)) {
            toReactWith = this.namesManager.reactions[name];
            break;
        }
    }

    if (toReactWith instanceof Array) {
        let selectedReaction = toReactWith[Math.floor(Math.random() * toReactWith.length)];
        if (selectedReaction instanceof Object) {
            selectedReaction = selectedReaction.id;
        }
        message.react(selectedReaction);
    }
}

exports.subPlugins = [
    {
        type: "command",
        name: "Set Name Reaction",
        calls: ["setnamereaction", "snr", "namereact"],
        callback: (message, args) => {
            if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator))
                return message.reply("You must be administrator to use this.");

            if (args.length < 2) 
                return message.reply("You must specify at least 2 arguments, a name (keyword) and at least one emoji.");

            let name = args.shift().toLowerCase();
            if (!this.namesManager.names.includes(name))
                this.namesManager.names.push(name);

            let reactions = [];
            for (let i = 0; i < args.length; i++) {
                let arg = args[i];
                let id = arg.match(/[0-9]+/);
                if (id) {
                    let emojiToken = {
                        id: id[0],
                        animated: false
                    }
                    if (arg.startsWith("<a"))
                        emojiToken.animated = true;
                    reactions.push(emojiToken);
                } else
                    reactions.push(arg);
            }

            this.namesManager.reactions[name] = reactions;
            fs.writeFileSync(this.storageFile, JSON.stringify(this.namesManager));
            message.reply(`Reactions **set** for the name "${name}"`);
        }
    },
    {
        type: "command",
        name: "Remove Name Reaction",
        calls: ["removenamereaction", "rnr"],
        callback: (message, args) => {
            if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator))
                return message.reply("You must be administrator to use this.");

            if (args.length < 1) 
                return message.reply("You must specify the name.");

            let name = args.shift().toLowerCase();
            if (this.namesManager.names.includes(name)) {
                this.namesManager.names.splice(this.namesManager.names.indexOf(name), 1);
                delete this.namesManager.reactions[name];
                fs.writeFileSync(this.storageFile, JSON.stringify(this.namesManager));
                message.reply(`Reactions **removed** for the name "${name}"`);
            } else {
                message.reply("No name to remove reactions for.");
            }
        }
    },
    {
        type: "command",
        name: "Show Name Reaction",
        calls: ["namereaction", "namereactions", "nr"],
        callback: (message, args) => {
            if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator))
                return message.reply("You must be administrator to use this.");

            if (args.length < 1) 
                return message.reply("You must specify the name.");

            let name = args.shift().toLowerCase();
            if (this.namesManager.names.includes(name)) {
                let reactions = this.namesManager.reactions[name];
                let toJoin = [];

                for (let reaction of reactions) {
                    if (reaction instanceof Object) {
                        toJoin.push(`<${reaction.animated ? "a" : ""}:name:${reaction.id}>`);
                    } else {
                        toJoin.push(reaction);
                    }
                }

                message.reply(`If "${name}" is spoken, one of the following will be randomly reacted: ${toJoin.join(' ')}`);
            } else {
                message.reply("No reactions are added for this name/keyword.");
            }
        }
    }
]