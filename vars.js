// Used for developer commands. Though if I remember right, I switched to just 
// checking if the caller had admin permission. I'd need to check for references to this
global.devs = [
    '292447249672175618'
];


// These are all the custom emotes I uploaded for only the bot to use
global.emojis = {
    kaching: "<:kaching:1291993493081690162>",
    no:      "<:no:1292262411054743624>",
    sadPepe: "<:sadPepe:1292262374396526593>",
    stopp:   "<:stopp:1292262668794724447>",
    tbhfam:  "<:tbhfam:1292262388917342313>",

    stone:   "<:stone:1292614998127939735>",
    coal:    "<:coal:1292615077253480449>",
    copper:  "<:copper:1292615063076733008>",
    iron:    "<:iron:1292615013911232685>",
    gold:    "<:gold:1292615030017228910>",
    diamond: "<:diamond:1292615044898623489>",
}


// When the bot comes online, it'll log startup time here. Errors may also be reported here
global.startChannel = "1291986736876097632";


// A random string is picked when a dev runs the restart command
global.restartCommandResponses = [
    `You're really busting my balls over here ${emojis.no}`,
    `Please end my suffering and just run the stop command ${emojis.sadPepe}`, // There's no stop command because I'm evil >:)
    `Leave me alone ${emojis.stopp}`
];


// Bot's response to a non-dev trying to run the restart command
global.restartCommandNoAccess = `If only you could do that ${emojis.tbhfam}`;