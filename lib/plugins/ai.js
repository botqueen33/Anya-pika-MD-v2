const Config = require('../../config');
const {
    anya,
    getBuffer,
    pickRandom,
    formatNumber,
    aiArtGenerator
} = require('../lib');
const axios = require('axios');

//༺─────────────────────────────────────

anya(
        {
            name: "aipic",
            alias: ['aiimg'],
            react: "✨",
            need: "text",
            category: "ai",
            desc: "Create images using artificial intelligence",
            cooldown: 8,
            filename: __filename
        },
    async (anyaV2, pika, { args }) => {
        if (!args[0]) return pika.reply("_❕Enter some texts to create!_");
        const { key } = await pika.keyMsg("```Creating...```");
        const text = args.join(" ");
        axios.get("https://sms-bomb.vercel.app/api/aipic.php?prompt=" + encodeURIComponent(text))
        .then(async ({data}) => {
            return await anyaV2.sendMessage(pika.chat, {
                image: await getBuffer(data),
                caption: "> " + Config.footer
            }, {quoted:pika})
            .then(() => pika.edit("> Created AI Image!", key));
        })
        .catch(async err => {
            console.error(err);
            await pika.deleteMsg(key);
            return await anyaV2.sendReactionMedia(pika.chat, {
                reaction: "cry",
                caption: Config.message.error
            }, { quoted:pika });
        });
});

//༺─────────────────────────────────────

anya(
        {
            name: "aiart",
            react: "✨",
            need: "text",
            category: "ai",
            desc: "Create images using artificial intelligence",
            cooldown: 8,
            filename: __filename
        },
    async (anyaV2, pika, { args }) => {
        if (!args[0]) return pika.reply("_❕Enter some texts to create!_");
        const { key } = await pika.keyMsg("```Creating...```");
        const text = args.join(" ");
        aiArtGenerator(text)
        .then(async (response) => {
            if (!response) return pika.edit("_❌No results found!_");
            return await anyaV2.sendMessage(pika.chat, {
                image: Buffer.from(response),
                caption: "> " + Config.footer
            }, {quoted:pika})
            .then(() => pika.edit("> Created AI Image!", key));
        })
        .catch(async err => {
            console.error(err);
            await pika.deleteMsg(key);
            return await anyaV2.sendReactionMedia(pika.chat, {
                reaction: "cry",
                caption: Config.message.error
            }, { quoted:pika });
        });
});

//༺─────────────────────────────────────

anya(
        {
            name: "pixabay",
            react: "✨",
            need: "text",
            category: "ai",
            desc: "Search ai generated images",
            cooldown: 8,
            filename: __filename
        },
    async (anyaV2, pika, { args }) => {
        if (!args[0]) return pika.reply("_❕Enter some texts to search!_");
        const { key } = await pika.keyMsg("```Searching...```");
        const text = args.join(" ");
        axios.get("https://pixabay.com/api/?key=36545097-d5df6c20dfd41fe6ace3f8fa0&per_page=50&q=" + encodeURIComponent(text))
        .then(async ({data}) => {
            if (data.hits.length < 1) return pika.edit("❌ No results found!");
            const random = pickRandom(data.hits); 
            return await anyaV2.sendMessage(pika.chat, {
                image: await getBuffer(random.largeImageURL),
                caption: `
*👤 Creator:* ${random.user}
*👁️‍🗨️ Views:* _${formatNumber(random.views)}_
*↘️ Downloads:* _${formatNumber(random.downloads)}_
*👍🏻 Likes:* _${formatNumber(random.likes)}_
*💬 Comments:* _${formatNumber(random.comments)}_

> ${Config.footer}`.trim()
            }, {quoted:pika})
            .then(() => pika.edit("> ✅ Searched AI generated images!", key));
        })
        .catch(async err => {
            console.error(err);
            await pika.deleteMsg(key);
            return await anyaV2.sendReactionMedia(pika.chat, {
                reaction: "cry",
                caption: Config.message.error
            }, { quoted:pika });
        });
}); 
