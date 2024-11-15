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

exports.oreValue = {
    coal: 8.50,    // total value based off 25% chance: $212.50
    copper: 14.30, // Total value based off 20% chance: $286.00
    iron: 24.98,   // Total value based off 10% chance: $249.80
    gold: 42.34,   // Total value based off 7% chance: $296.38
    diamond: 79.43 // Total value based off 3% chance: $238.29
}                  // Grand total based off ore chances: $1,282.97

exports.expectedOreCounts = {
    coal: 25,
    copper: 20,
    iron: 10,
    gold: 7,
    diamond: 3
}

exports.mineActions = {
    MINE: 0,
    SCAN: 1,
    BOMB: 2,
    SHOW: 3
}


// Does this user's mine need generated?
exports.shouldGenerateMine = (data) => {
    if (!(data instanceof Object))
        throw new Error("Bad argument #1: Expected an Object, got " + trueTypeof(id));

    if (Number.isNaN(data.mine.generatedTimestamp))
        return true;
    else if (Date.now() - data.mine.generatedTimestamp >= 86400000) // The mine should be regenerated every 24 hours.
        return true;
    else
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

exports.generateMine = (data) => {
    if (!(data instanceof Object))
        throw new Error("Bad argument #1: Expected an Object, got " + trueTypeof(id));

    let blocks = data.mine.blocks;
    let generationTimeStart = performance.now();

    for (let y = 0; y < this.mineLetters.length; y++) {
        for (let x = 0; x < this.mineLetters.length; x++) {
            let block = Object.assign({}, this.blockTemplate);
            block.key = this.mineLetters[x] + this.mineLetters[y];
            block.x = x;
            block.y = y;

            block.type = "null";

            blocks[block.key] = block;
        }
    }

    data.mine.generatedTimestamp = Date.now();

    data.save();

    return performance.now() - generationTimeStart;
}

exports.generateMineImage = async (mine) => {
    let generationStart = performance.now();

    let generatedImage = new Jimp({width: 330, height: 330, color: 0x191e23ff});

    // Apparently caching these doesn't actually save performance time. They must already get cached internally by Jimp
    let imagesDir = process.cwd() + '/images/';
    let letterOverlay = await Jimp.read(imagesDir + 'letteroverlay.png');
    let stone =         await Jimp.read(imagesDir + 'stone2.png');
    let stonedark =     await Jimp.read(imagesDir + 'stonedark.png');
    let coal =          await Jimp.read(imagesDir + 'coal.png');
    let copper =        await Jimp.read(imagesDir + 'copper.png');
    let iron =          await Jimp.read(imagesDir + 'iron.png');
    let gold =          await Jimp.read(imagesDir + 'gold.png');
    let diamond =       await Jimp.read(imagesDir + 'diamond.png');

    for (let y = 0; y < this.mineLetters.length; y++) {
        for (let x = 0; x < this.mineLetters.length; x++) {
            let block = mine[this.mineLetters[x] + this.mineLetters[y]];

            if (block.visible && !block.mined)
                generatedImage.blit({src: stone, x: (x + 1) * 30, y: (y + 1) * 30});
            else if (block.mined)
                generatedImage.blit({src: stonedark, x: (x + 1) * 30, y: (y + 1) * 30});

            if (block.visible || block.mined) {
                switch(block.type) {
                    case "coal":
                        generatedImage.blit({src: coal, x: (x + 1) * 30, y: (y + 1) * 30});
                    break;
                    case "copper":
                        generatedImage.blit({src: copper, x: (x + 1) * 30, y: (y + 1) * 30});
                    break;
                    case "iron":
                        generatedImage.blit({src: iron, x: (x + 1) * 30, y: (y + 1) * 30});
                    break;
                    case "gold":
                        generatedImage.blit({src: gold, x: (x + 1) * 30, y: (y + 1) * 30});
                    break;
                    case "diamond":
                        generatedImage.blit({src: diamond, x: (x + 1) * 30, y: (y + 1) * 30});
                    break;
                }
            }
        }
    }
    
    generatedImage.blit({src: letterOverlay, x: 0, y: 0});
    let buffer = await generatedImage.getBuffer("image/png");
    let generationTime = performance.now() - generationStart;

    return [buffer, generationTime];
}

exports.mineBlock = (data, target, action = this.mineActions.MINE) => {
    if (!(data instanceof Object))
        throw new Error("Bad argument #1: Expected a string, got " + trueTypeof(id));

    let blocks = data.mine.blocks;
    
    let minedBlocks = [];
    if (target) {
        if (!(blocks[target] instanceof Object))
            throw new Error("Invalid position");

        let xPos = this.mineLetters.indexOf(target[0]);
        let yPos = this.mineLetters.indexOf(target[1]);

        if (xPos === -1 || yPos === -1)
            throw new Error("Invalid position? How??");
        
        let radius = 1;
        if (action === this.mineActions.SCAN || action === this.mineActions.BOMB)
            radius = 2;

        let borderLeft = Math.max(0, xPos - radius);
        let borderRight = Math.min(this.mineLetters.length - 1, xPos + radius);
        
        let borderTop = Math.max(0, yPos - radius);
        let borderBottom = Math.min(this.mineLetters.length - 1, yPos + radius);
        
        for (let y = borderTop; y <= borderBottom; y++) {
            for (let x = borderLeft; x <= borderRight; x++) {
                let pos = this.mineLetters[x] + this.mineLetters[y];
                let block = data.mine.blocks[pos];
                if (!block)
                    throw new Error(`Invalid position ${x}, ${y} (${pos})`);

                if (block.type === "null") {
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
                }
                block.visible = true;

                if (action === this.mineActions.MINE && pos === target) {
                    if (!block.mined)
                        minedBlocks.push(block);
                    block.mined = true;
                } else if (action === this.mineActions.BOMB && x > borderLeft && x < borderRight && y > borderTop && y < borderBottom) {
                    if (!block.mined)
                        minedBlocks.push(block);
                    block.mined = true;
                }
            }
        }
    }

    if (action === this.mineActions.SHOW) {
        for (let y = 0; y < this.mineLetters.length; y++) {
            for (let x = 0; x < this.mineLetters.length; x++) {
                let pos = this.mineLetters[x] + this.mineLetters[y];
                let block = data.mine.blocks[pos];
                if (!block)
                    throw new Error(`Invalid position ${x}, ${y} (${pos})`);

                if (block.type === "null") {
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
                }
                block.visible = true;
            }
        }
    }

    data.save();

    return minedBlocks;
}

exports.calculateRemainingValue = (mine) => {
    let minedValue = 0;
    let revealedValue = 0;
    let potentialRemainingValue = 0;

    let oreCounts = {coal: 0, copper: 0, iron: 0, gold: 0, diamond: 0}
    let minedCounts = {coal: 0, copper: 0, iron: 0, gold: 0, diamond: 0}

    for (let y = 0; y < this.mineLetters.length; y++) {
        for (let x = 0; x < this.mineLetters.length; x++) {
            let position = this.mineLetters[x] + this.mineLetters[y];
            let block = mine[position];

            if (!oreCounts[block.type])
                oreCounts[block.type] = 0;
            oreCounts[block.type]++;
            
            if (block.mined) {
                minedValue += this.oreValue[block.type];

                if (!minedCounts[block.type])
                    minedCounts[block.type] = 0;
                minedCounts[block.type]++;
            }
        }
    }

    let revealedCoalValue    = oreCounts.coal    * this.oreValue.coal;
    let revealedCopperValue  = oreCounts.copper  * this.oreValue.copper;
    let revealedIronValue    = oreCounts.iron    * this.oreValue.iron;
    let revealedGoldValue    = oreCounts.gold    * this.oreValue.gold;
    let revealedDiamondValue = oreCounts.diamond * this.oreValue.diamond;

    revealedValue = revealedCoalValue + revealedCopperValue + revealedIronValue + revealedGoldValue + revealedDiamondValue;
    revealedValue -= minedValue;

    let remainingCoalValue    = Math.max(0, this.expectedOreCounts.coal    - oreCounts.coal)    * this.oreValue.coal;
    let remainingCopperValue  = Math.max(0, this.expectedOreCounts.copper  - oreCounts.copper)  * this.oreValue.copper;
    let remainingIronValue    = Math.max(0, this.expectedOreCounts.iron    - oreCounts.iron)    * this.oreValue.iron;
    let remainingGoldValue    = Math.max(0, this.expectedOreCounts.gold    - oreCounts.gold)    * this.oreValue.gold;
    let remainingDiamondValue = Math.max(0, this.expectedOreCounts.diamond - oreCounts.diamond) * this.oreValue.diamond;

    potentialRemainingValue = remainingCoalValue + remainingCopperValue + remainingIronValue + remainingGoldValue + remainingDiamondValue;
    potentialRemainingValue -= minedValue;

    //let total = this.mineLetters.length * this.mineLetters.length;

    // let expectedCounts = {
    //     coal: 
    // }

    return [minedValue, revealedValue, potentialRemainingValue];
}

exports.callback = async (message, args, data) => {
    await message.channel.sendTyping();

    let mineGenerationTime = NaN;
    if (this.shouldGenerateMine(data)) {
        mineGenerationTime = this.generateMine(data);
    }

    let minedBlocks = [];
    if (args.length > 0) {
        let position = args.shift().toLowerCase();
        switch (position) {
            case "reveal": case "show": {
                if (!devs.includes(message.author.id))
                    return message.reply("This is a developer only command.");
                this.mineBlock(data, undefined, this.mineActions.SHOW);
            } break; 

            default: {
                if (position.length !== 2) 
                    return message.reply("Invalid position. Must be 2 letters long, each letter ranging from a-j.");
        
                let action = this.mineActions.MINE;
                if (args.length > 0) {
                    switch(args.shift().toLowerCase()) {
                        case "mine": {
                            action = this.mineActions.MINE;
                        } break;
        
                        case "scan": {
                            action = this.mineActions.SCAN;
                        } break;
                        
                        case "bomb": {
                            action = this.mineActions.BOMB;
                        } break; 
        
                        default: {
                            return await message.reply('Invalid mine action on **' + position + '**');
                        } break;
                    }
                }
        
                minedBlocks = this.mineBlock(data, position, action);
            } break;
        }
    }

    let [buffer, generationTime] = await this.generateMineImage(data.mine.blocks);
    let [minedValue, revealedValue, remainingValue] = this.calculateRemainingValue(data.mine.blocks);

    let messageText = `Generated mine image in \`${generationTime.toFixed(2)} ms\``;
    if (!Number.isNaN(mineGenerationTime))
        messageText = `Mine regenerated! Took \`${mineGenerationTime.toFixed(2)} ms\`\n${messageText}`;

    messageText += `\n\nMined value: **$${minedValue.toFixed(2)}**\nRevealed value: **$${revealedValue}**\nEstimated remaining value: **$${remainingValue.toFixed(2)}**\n**$${(remainingValue + minedValue + revealedValue).toFixed(2)}** total estimated value.\n`;

    if (minedBlocks.length > 0) {
        let blocks = [];
        for (let block of minedBlocks) {
            if (block.type === "stone")
                blocks.push(`Mined ${emojis[block.type]} **${block.type}** from **${block.key}**`);
            else
                blocks.push(`Mined block **${block.key}** and got ${emojis[block.type]} **${block.type}**`);
        }
        messageText += `\n${blocks.join('\n')}`;
    }
    await message.reply({content: messageText, files: [buffer]});
}

exports.commandObject = {
    name: "mine",
    description: "Displays your 10x10 mine image.",
    options: [
        {
            name: "position",
            description: "Must be two letters long ranging from aa to jj.",
            type: 3,
            min_length: 2,
            max_length: 2
        }
    ]
}

exports.interactionCallback = async (interaction) => {
    await interaction.reply('This command is not complete.');

    // let mineGenerationTime = NaN;
    // if (this.shouldGenerateMine(interaction.user.id)) {
    //     mineGenerationTime = this.generateMine(interaction.user.id);
    // }
    // let mine = dataManagerReference.users.get(interaction.user.id).mine.blocks;

    // let target = interaction.options.getString("position", false);
    // if (target) {
    //     if (!(mine[target] instanceof Object))
    //         return await interaction.editReply(`**${target}** is not a valid position.`);
    // }

    // let [buffer, generationTime] = await this.generateMineImage(mine);

    // let messageText = `Generated mine image in \`${generationTime.toFixed(2)} ms\``;
    // if (!Number.isNaN(mineGenerationTime))
    //     messageText = `Mine regenerated! Took \`${mineGenerationTime.toFixed(2)} ms\`\n${messageText}`;
    // await interaction.editReply({content: messageText, files: [buffer]});
}