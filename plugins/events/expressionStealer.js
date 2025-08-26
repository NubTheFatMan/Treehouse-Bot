exports.type = 'event';
exports.name = "Expression Stealer";
exports.event = "messageCreate";

let emojiRegex = /<(a?):([a-zA-Z0-9 _\-]+):(\d+)>/g;
let dest = process.cwd() + '/downloads';

exports.callback = async message => {
    if (message.channel.guildId) return;
    if (message.author.id !== '292447249672175618') return;

    if (message.stickers.size > 0) {
        let sticker = message.stickers.first();
        downloader.image({
            url: sticker.url,
            dest: `${dest}/stickers/${sticker.id}.png`
        }).then(() => message.react('✅')).catch(() => message.react('❌'));
    } else {
        let emojisMatch = message.content.matchAll(emojiRegex);
        if (!emojisMatch) return message.react('❔');

        let failedCount = 0;
        let emojiCount = 0
        for (let emoji of emojisMatch) {
            emojiCount++;
            try {
                let name = `${emoji[3]}.${emoji[1] === 'a' ? 'gif' : 'png'}`;
                await downloader.image({
                    url: `https://cdn.discordapp.com/emojis/${name}`,
                    dest: `${dest}/emojis/${name}`
                });
            } catch (e) {
                failedCount++;
            }
        }
        if (failedCount === 0) message.react('✅');
        else if (failedCount > 0 && failedCount < emojiCount) message.react('⚠️');
        else if (failedCount === emojiCount) message.react('❌');
        else message.react('🤔');
    }
}