exports.type = "command";
exports.name = "Mine";
exports.calls = ["mine"];

exports.oreChances = { 
    stone: .35, // 35% chance
    coal: .6,   // 25% chance
    copper: .8, // 20% chance
    iron: .9,   // 10% chance
    gold: .97,  //  7% chance
    diamond: 1, //  3% chance
}

let dataManagerReference;

// Does this user's mine need generated?
exports.shouldGenerateMine = (id) => {
    if (typeof id !== "string")
        throw new Error("Bad argument #1: Expected a string, got " + trueTypeof(id));

    if (!dataManagerReference)
        dataManagerReference = plugins.get("User Data Manager");

    let data = dataManagerReference.users.get(id);
    if (!data)
        throw new Error("There is no data loaded in memory for " + id);

    if (!data.mine) {
        data.mine = Object.assign({}, dataManagerReference.templateUser.mine);
        return true;
    } else {
        if (Number.isNaN(data.mine.generatedTimestamp))
            return true;
        else if (Date.now() - data.mine.generatedTimestamp >= 86400000) // The mine should be regenerated every 24 hours.
            return true;
    }
    return false;
}

exports.mineLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
exports.blockTemplate = {
    key: "null",
    x: -1,
    y: -1,
    type: "null",
    mined: false,
    visible: false
}

exports.generateMine = (id) => {
    if (typeof id !== "string")
        throw new Error("Bad argument #1: Expected a string, got " + trueTypeof(id));

    if (!dataManagerReference)
        dataManagerReference = plugins.get("User Data Manager");

    let data = dataManagerReference.users.get(id);
    if (!data)
        throw new Error("There is no data loaded in memory for " + id);

    let blocks = data.mine.blocks;
    let generationTimeStart = performance.now();

    for (let y = 0; y < this.mineLetters.length; y++) {
        for (let x = 0; x < this.mineLetters.length; x++) {
            let block = Object.assign({}, this.blockTemplate);
            block.key = this.mineLetters[x] + this.mineLetters[y];
            block.x = x;
            block.y = y;
            
            let rng = Math.random();
            if (rng < this.oreChances.stone)
                block.type = "stone";
            else if (rng < this.oreChances.coal)
                block.type = "coal";
            else if (rng < this.oreChances.copper)
                block.type = "copper";
            else if (rng < this.oreChances.iron)
                block.type = "iron";
            else if (rng < this.oreChances.gold)
                block.type = "gold";
            else if (rng < this.oreChances.diamond)
                block.type = "diamond";

            blocks[block.key] = block;
        }
    }

    data.mine.generatedTimestamp = Date.now();

    dataManagerReference.saveUserData(id);

    return performance.now() - generationTimeStart;
}

exports.callback = async (message, args) => {
    await message.channel.sendTyping();

    let mineGenerationTime = NaN;
    if (this.shouldGenerateMine(message.author.id)) {
        mineGenerationTime = this.generateMine(message.author.id);
    }

    let generationStart = performance.now();

    let generatedImage = new Jimp({width: 300, height: 300, color: 0x00000000});

    // Apparently caching these doesn't actually save performance time. They must already get cached internally by Jimp
    let imagesDir = process.cwd() + '/images/';
    let letterOverlay = await Jimp.read(imagesDir + 'Letter_Overlay.png');
    let stone =         await Jimp.read(imagesDir + 'stone2.png');
    let stonedark =     await Jimp.read(imagesDir + 'stonedark.png');
    let coal =          await Jimp.read(imagesDir + 'coal.png');
    let copper =        await Jimp.read(imagesDir + 'copper.png');
    let iron =          await Jimp.read(imagesDir + 'iron.png');
    let gold =          await Jimp.read(imagesDir + 'gold.png');
    let diamond =       await Jimp.read(imagesDir + 'diamond.png');

    let mine = dataManagerReference.users.get(message.author.id).mine.blocks;
    for (let y = 0; y < this.mineLetters.length; y++) {
        for (let x = 0; x < this.mineLetters.length; x++) {
            let block = mine[this.mineLetters[x] + this.mineLetters[y]];

            if (block.visible && !block.mined)
                generatedImage.blit({src: stone, x: x * 30, y: y * 30});
            else if (block.mined)
                generatedImage.blit({src: stonedark, x: x * 30, y: y * 30});
            else {
                for (let pixelY = 0; pixelY < 30; pixelY++) {
                    for (let pixelX = 0; pixelX < 30; pixelX++) {
                        generatedImage.setPixelColor(0x191e23ff, (x * 30) + pixelX, (y * 30) + pixelY);
                    }
                }
            }

            if (block.visible || block.mined) {
                switch(block.type) {
                    case "coal":
                        generatedImage.blit({src: coal, x: x * 30, y: y * 30});
                    break;
                    case "copper":
                        generatedImage.blit({src: copper, x: x * 30, y: y * 30});
                    break;
                    case "iron":
                        generatedImage.blit({src: iron, x: x * 30, y: y * 30});
                    break;
                    case "gold":
                        generatedImage.blit({src: gold, x: x * 30, y: y * 30});
                    break;
                    case "diamond":
                        generatedImage.blit({src: diamond, x: x * 30, y: y * 30});
                    break;
                }
            }
        }
    }
    
    generatedImage.blit({src: letterOverlay, x: 0, y: 0});
    let buffer = await generatedImage.getBuffer("image/png");

    let generationTime = performance.now() - generationStart;

    let messageText = `Generated mine image in \`${generationTime.toFixed(2)} ms\``;
    if (!Number.isNaN(mineGenerationTime))
        messageText = `Mine regenerated! Took \`${mineGenerationTime.toFixed(2)} ms\`\n${messageText}`;
    await message.reply({content: messageText, files: [buffer]});
}