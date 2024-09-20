const mongoose = require('mongoose');
const axios = require('axios');
const parser = require('@babel/parser');

const Schema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    url: { type: String }
});

const Plugins = mongoose.model('plugins', Schema);

//༺─────────────────────────────────────

const installPlugins = async (rawUrl) => {
    const url = rawUrl.toLowerCase();
    const filename = url.split("/").pop().split(".js")[0];

    try {
        /**
         * Check is the give url is valid..?
         */
        const response = await axios.get(url);
        const code = response.data;

        /**
         * Test if any syntax error
         */
        try {
            parser.parse(code, { sourceType: 'module' });
        } catch (syntaxError) {
            return {
                status: 400,
                statusEmoji: "⚠️",
                message: "Syntax Error: " + syntaxError.message,
                filename: filename,
                url: url
            };
        }
        
        if (/pikabotz/.test(url)) {
            const plugin = new Plugins({ id: filename, url: url });
            await plugin.save();
            return {
                status: 200,
                statusEmoji: "✅",
                message: "Valid plugin saved.",
                filename: filename,
                url: url
            };
        } else {
            return {
                status: 401,
                statusEmoji: "⚠️",
                message: "Unauthorized, this plugin does not belong to `PikaBotz`.",
                filename: filename,
                url: url
            };
        }
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return {
                status: 404,
                statusEmoji: "❓",
                message: "Plugin Url not found.",
                filename: filename,
                url: url
            };
        }
        console.log("Plugin Url Fetching error", err);
        return {
            status: 500,
            statusEmoji: "❌",
            message: "Internal Server Error",
            filename: filename,
            url: url
        };
    }
}

//༺─────────────────────────────────────

const deletePlugins = async (idOrUrl) => {
    let result;
    let filename;
    try {
        
        /**
         * Raw url
         */
        const raw = idOrUrl.toLowerCase();
        if (/^https:\/\/gist\.githubusercontent\.com\/pikabotz\//.test(raw)) {
            result = await Plugins.findOneAndDelete({ url: raw });
            filename = raw.split("/").pop().split(".js")[0];
        } else {
            filename = raw.split(".js")[0];
            result = await Plugins.findOneAndDelete({ id: filename });
        }        
        if (result) {
            return {
                status: 200,
                statusEmoji: "✅",
                message: "Plugin successfully deleted.",
                filename: filename
            };
        } else {
            return {
                status: 404,
                statusEmoji: "❓",
                message: "Plugin not found.",
                filename: filename
            };
        }
    } catch (err) {
        console.log("Plugin Deletion error", err);
        return {
            status: 500,
            statusEmoji: "❌",
            message: "Internal Server Error",
            filename: filename
        };
    }
}

module.exports = { Plugins, installPlugins, deletePlugins };
