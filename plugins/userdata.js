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

class UserData {
    static users = new Map();
    static dataFolder = process.cwd() + '/userdata/users/';
    static templateUser = {
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
            lastMinedTimestamp: NaN,
            blocks: {}
        }
    }

    static get(id) {
        if (typeof id !== "string")
            throw new Error("Bad argument #1: Expected a string, got " + trueTypeof(id));
    
        let data = this.users.get(id);
        if (data)
            return data;
    
        try {
            let dataJson = JSON.parse(fs.readFileSync(this.dataFolder + id + '.json'));
            if (dataJson instanceof Object) {
                return new this(dataJson);
            }
        } catch (error) {
            return new this(id);
        }
    }

    constructor(data) {
        if (!(data instanceof Object) && typeof data !== "string")
            throw new Error("Expected an argment or string, got " + trueTypeof(data));

        Object.assign(this, this.constructor.templateUser);

        if (typeof data === "string") {
            this.id = data;
            this.createdTimestamp = Date.now();
        } else {
            Object.assign(this, data);
        }
        this.constructor.users.set(this.id, this);
    }

    get valid() {
        return typeof this.id === "string" && this.id !== "null";
    }

    get filePath() {
        return this.constructor.dataFolder + this.id + '.json';
    }

    save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this));
        } catch (err) {
            messageDevs(`Unable to save data for <@${this.id}>: \`\`\`\n${err.stack}\`\`\``);
        }
    }
}
exports.UserData = UserData;