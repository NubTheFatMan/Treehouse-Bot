exports.name = "User Data Manager";

exports.dataFolder = process.cwd() + '/userdata/users/';
exports.users = new Map(); // This holds all loaded user data

exports.templateUser = {
    id: "null",
    createdTimestamp: NaN,
    lastCommandTimestamp: NaN,
    inventory: {
        currency: 0,
        spentCurrency: 0,
        items: {}
    },
    mine: {
        generatedTimestamp: NaN,
        blocks: {}
    }
}

// Checks for a user's id in exports.users. If it doesn't exist, it reads
// the data folder for a file. If that doesn't exist, a new file is made.
exports.getUserData = (id) => {
    if (typeof id !== "string")
        throw new Error("Bad argument #1: Expected a string, got " + trueTypeof(id));

    let data = this.users.get(id);
    if (data)
        return data;

    try {
        let dataJson = JSON.parse(fs.readFileSync(this.dataFolder + id + '.json'));
        if (dataJson instanceof Object) {
            this.users.set(id, dataJson);
            return dataJson;
        }
    } catch (error) {
        let data = Object.assign({}, this.templateUser);
        data.id = id;
        data.createdTimestamp = Date.now();
        this.users.set(id, data);
        this.saveUserData(id);
        return data;
    }
}

exports.saveUserData = (id) => {
    if (typeof id !== "string")
        throw new Error("Bad argument #1: Expected a string, got " + trueTypeof(id));

    let data = this.users.get(id);
    if (!data)
        throw new Error("There is no data loaded in memory for " + id);

    try {
        fs.writeFileSync(this.dataFolder + id + '.json', JSON.stringify(data));
    } catch (err) {
        messageDevs(`Unable to save data for <@${id}>: \`\`\`\n${err.stack}\`\`\``);
    }
}