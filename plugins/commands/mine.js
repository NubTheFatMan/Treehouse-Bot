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

exports.callback = async (message, args) => {
    await message.channel.sendTyping();

    let generationStart = performance.now();

    let generatedImage = new Jimp({width: 300, height: 300, color: 0x00000000});

    // Apparently caching these doesn't actually save performance time. They must already get cached internally by Jimp
    let imagesDir = process.cwd() + '/images/';
    let letterOverlay = await Jimp.read(imagesDir + 'Letter_Overlay.png');
    let stone =         await Jimp.read(imagesDir + 'stone2.png');
    let coal =          await Jimp.read(imagesDir + 'coal.png');
    let copper =        await Jimp.read(imagesDir + 'copper.png');
    let iron =          await Jimp.read(imagesDir + 'iron.png');
    let gold =          await Jimp.read(imagesDir + 'gold.png');
    let diamond =       await Jimp.read(imagesDir + 'diamond.png');

    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            generatedImage.blit({src: stone, x: x * 30, y: y * 30});
            
            let oreRNG = Math.random();
            if (oreRNG < this.oreChances.stone) {
                // it's stone
            } else if (oreRNG < this.oreChances.coal) {
                generatedImage.blit({src: coal, x: x * 30, y: y * 30});
            } else if (oreRNG < this.oreChances.copper) {
                generatedImage.blit({src: copper, x: x * 30, y: y * 30});
            } else if (oreRNG < this.oreChances.iron) {
                generatedImage.blit({src: iron, x: x * 30, y: y * 30});
            } else if (oreRNG < this.oreChances.gold) {
                generatedImage.blit({src: gold, x: x * 30, y: y * 30});
            } else if (oreRNG < this.oreChances.diamond) {
                generatedImage.blit({src: diamond, x: x * 30, y: y * 30});
            } else {
                message.reply(`Error generating cell ${x},${y}`);
            }
        }
    }
    
    generatedImage.blit({src: letterOverlay, x: 0, y: 0});
    let buffer = await generatedImage.getBuffer("image/png");

    let generationTime = performance.now() - generationStart;
    await message.reply({content: `Generated mine image in ${generationTime.toFixed(2)} ms`,files: [buffer]});
}