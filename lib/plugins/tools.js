const Config = require('../../config');
const axios = require('axios');
const fs = require('fs');
const {
    anya,
    listall,
    writeExif,
    UI
} = require('../lib');
const numFancyAliases = 59; /* How many copies needed for "fancy" plugin alias (eg: fancy1, fancy2... fancy59) */

//༺─────────────────────────────────────

anya(
    {
        name: "readmore",
        react: "❤️",
        need: "text",
        category: "tools",
        desc: "Shorten the text message",
        filename: __filename
    },
    async (anyaV2, pika, { args }) => {
        if (!args[0] && !pika.quoted?.text) return pika.reply("_❗Reply an image with a caption_");
        const quoted = pika.quoted ? pika.quoted.text : args.join(" ");
        return await pika.reply(quoted.replace(/\+/g, (String.fromCharCode(8206)).repeat(4001)));
    }
)

//༺─────────────────────────────────────

anya(
    {
        name: "fliptxt",
        alias: ['fliptext'],
        react: "❤️",
        need: "text",
        category: "tools",
        desc: "Flip the given text",
        filename: __filename
    },
    async (anyaV2, pika, { args }) => {
        const text = args[0] || pika.quoted?.text;
        if (!text) return pika.reply("_❗Reply with or provide some text to flip!_");
        const flipped = text.split('').reverse().join('');
        await pika.reply(flipped);
    }
);


//༺─────────────────────────────────────

const screenshot = ['ss', 'ss2', 'ss3'];
    screenshot.forEach(ss => {
        anya({
            name: ss,
            alias: ['screenshot'],
            react: "📸",
            need: "url",
            category: "tools",
            desc: "Take a screenshot of various websites",
            cooldown: 8,
            filename: __filename
        },
        async (anyaV2, pika, { args, command }) => {
            if (args.length < 1) return pika.reply("_Enter an url to get screenshot_");
            if (!/http|https/.test(args.join(" ").toLowerCase())) return pika.reply("*❎ Invalid Url, enter a valid url*");
            const { key } = await pika.keyMsg(Config.message.wait);
            let dimensions;
            
            //-----------------------
            if (/2/.test(command)) {
                dimensions = "768x1024";
            } else if (/3/.test(command)) {
                dimensions = "360x720";
            } else dimensions = "1920x1080";
            //-----------------------
            
            axios.get(`https://api.screenshotmachine.com?key=81d99b&url=${args[0]}&dimension=${dimensions}&format=jpg&cacheLimit=0&delay=2000&zoom=200`, {
                headers: {
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
                        "cookie": "mid=XBXl1AALAAEbFoAEfNjZlMMG9dwX; ig_did=91E66A48-5AA2-445D-BFE6-84DC4456DE8F; fbm_124024574287414=base_domain=.instagram.com; ig_nrcb=1; shbid=\"12737\0544008624962\0541656157971:01f72a5102dc07af6845adf923ca70eb86e81ab95fa9dbfdaf157c9eef0e82fd1f10fe23\"; shbts=\"1624621971\0544008624962\0541656157971:01f74841fba8e77a0066b47ea891dec8fba6fdf9216c0816f9fb3532292f769828800ae2\"; fbsr_124024574287414=86D8femzH4_KFW4hd3Z6XFdowU6lG-uXsXRQDNl44VM.eyJ1c2VyX2lkIjoiMTAwMDA0Njc2MDc4Nzg5IiwiY29kZSI6IkFRQngzXzVOejdwVnBwby1LRGRUdEYxUFlzcUdDQXJjcmJfb05HaWFvYkNvOGtLN2paam50bHpvMTNOakFnTzVKOHQ5M0V3U3dvNkRtZ0RiY1l1Z3dQSTIybnExOUxLd3lpZTVfZll0bkNXZXBuM1hoYWFLX0w2R0pZaUpzaDBOTDBhb3pmTVBkRTVQRC12X3FnbUgxLXZYdGVmcHhfaFU0aUZNZVMxNHhFUk5OblJyMmxYTUpDa2RFYTdISXNCR2swdHhaaGF0NUt4UDR3cWZTamRwcVFfQ19sa1RUek5fU0taUTYtMjlzTkdnLUVWb3oxMUZWc3Q2OEx2ZnlIY0V0eFp0ZUxacXpiWmh6MzZrVl83VmFGd0FqVnVkTGFQN2VzT3ZRcmlTQ2pLUE5XbVcyNWhudzIzejJBSnVURW00YWR1cmN6a3ZLWU1icTd2SnN0SVdJV09RIiwib2F1dGhfdG9rZW4iOiJFQUFCd3pMaXhuallCQUJBZmJuQ3haQzZMd3h4MDFJV2MyZ3dsQ3k3Qmp0b05UNUY0WDY2NHBrUzRQeERNVXRsdmhWWkI3SXE0MGsyZ2hJQm55RHRPcW5iVjlPbUNiWGhyTFBaQUhBQjFzVFpBdHF6RFEzVTROUkhOU1V6MFVXWkNtTEdLcDNNWDRoazVIOURLbERHN0QwUlhZNHY4dHBCdVNNYjN4dnBTRGtQcHdYRlBXVU82VCIsImFsZ29yaXRobSI6IkhNQUMtU0hBMjU2IiwiaXNzdWVkX2F0IjoxNjI0NjIxOTgxfQ; fbsr_124024574287414=86D8femzH4_KFW4hd3Z6XFdowU6lG-uXsXRQDNl44VM.eyJ1c2VyX2lkIjoiMTAwMDA0Njc2MDc4Nzg5IiwiY29kZSI6IkFRQngzXzVOejdwVnBwby1LRGRUdEYxUFlzcUdDQXJjcmJfb05HaWFvYkNvOGtLN2paam50bHpvMTNOakFnTzVKOHQ5M0V3U3dvNkRtZ0RiY1l1Z3dQSTIybnExOUxLd3lpZTVfZll0bkNXZXBuM1hoYWFLX0w2R0pZaUpzaDBOTDBhb3pmTVBkRTVQRC12X3FnbUgxLXZYdGVmcHhfaFU0aUZNZVMxNHhFUk5OblJyMmxYTUpDa2RFYTdISXNCR2swdHhaaGF0NUt4UDR3cWZTamRwcVFfQ19sa1RUek5fU0taUTYtMjlzTkdnLUVWb3oxMUZWc3Q2OEx2ZnlIY0V0eFp0ZUxacXpiWmh6MzZrVl83VmFGd0FqVnVkTGFQN2VzT3ZRcmlTQ2pLUE5XbVcyNWhudzIzejJBSnVURW00YWR1cmN6a3ZLWU1icTd2SnN0SVdJV09RIiwib2F1dGhfdG9rZW4iOiJFQUFCd3pMaXhuallCQUJBZmJuQ3haQzZMd3h4MDFJV2MyZ3dsQ3k3Qmp0b05UNUY0WDY2NHBrUzRQeERNVXRsdmhWWkI3SXE0MGsyZ2hJQm55RHRPcW5iVjlPbUNiWGhyTFBaQUhBQjFzVFpBdHF6RFEzVTROUkhOU1V6MFVXWkNtTEdLcDNNWDRoazVIOURLbERHN0QwUlhZNHY4dHBCdVNNYjN4dnBTRGtQcHdYRlBXVU82VCIsImFsZ29yaXRobSI6IkhNQUMtU0hBMjU2IiwiaXNzdWVkX2F0IjoxNjI0NjIxOTgxfQ; csrftoken=PpiPMEl0R2pAwThsw4NXynO6cVIXHZDo; ds_user_id=38316792800; sessionid=38316792800:rQj5Tr3g5zkg7b:4; rur=\"RVA\05438316792800\0541656158332:01f759cf624bef147397144805bb4c26f6c8b36a232e0f5738c570ee492f6b629f84f6e5\""
                },
                responseType: 'arraybuffer'
            })
            .then(async ({data}) => {
                return await anyaV2.sendMessage(pika.chat, {
                    image: data,
                    caption: `*🔗𝚄𝚛𝚕:* ${args[0]}\n\n> ${Config.footer}`
                }, { quoted:pika })
            .then(()=> pika.deleteMsg(key))
            .catch((err)=> {
                console.error(err);
                pika.edit(Config.message.error, key);
            });
        });
    });
  }
)

//༺─────────────────────────────────────༻

anya(
      {
        name: "take",
        alias: ['stealsticker', 'steal'],
        react: "💫",
        need: "media",
        category: "tools",
        desc: "Steal stickers",
        filename: __filename
}, async (anyaV2, pika, { args, prefix, command }) => {
    const quoted = pika.quoted || pika;
    const mime = quoted.mimetype || pika.mtype;
    if (!/webp|image|video/.test(mime)) return pika.reply(`_Tag or reply an image/video/sticker with caption \`${prefix + command}\`_`);
    const text = args.join(" ");
    const packname = args.length > 0 ? text.split('|').map(item => item.trim())[0] : Config.packname;
    const author = args.length > 0 ? text.split('|').map(item => item.trim()).slice(1).join('|') || '' : Config.author;
    const media = await quoted.download();
    switch (true) {
        case /webp/.test(mime):
            const metadata = { packname: packname, author: author, categories: ["😎", "🔥"] };
            const mediaData = { mimetype: "webp", data: media };
            const bufferPath = await writeExif(mediaData, metadata);     
            await anyaV2.sendMessage(pika.chat, { sticker: { url: bufferPath } }, { quoted: pika });
            fs.promises.unlink(bufferPath);
            break;
        case /image|webp/.test(mime):
            await anyaV2.sendImageAsSticker(pika.chat, media, pika, { packname, author });
            break;
        case /video/.test(mime):
            if ((quoted.msg || pika.quoted).seconds > 11) return pika.reply("_‼️Video length should be between `1-9` seconds!_");
            await anyaV2.sendVideoAsSticker(pika.chat, media, pika, { packname, author });
            break;
    }
});

//༺─────────────────────────────────────༻

anya({ name: "tinyurl", alias: ['tiny'], react: "🤏🏻", need: "url", category: "tools", desc: "Shorten urls", cooldown: 15, filename: __filename },
     async (anyaV2, pika, { args, prefix, command }) => {
        if (args.length < 1) return pika.reply(`*${Config.themeemoji} Example:* ${prefix + command} https://github.com/PikaBotz/Anya_v2-MD`);
        if (!/^https?:\/\//i.test(args[0].toLowerCase())) return pika.reply("*❎ Invalid url!*");
        axios.get(`https://tinyurl.com/api-create.php?url=${args[0].toLowerCase()}`)
        .then(({ data })=> pika.reply(`*✅ Successfully made your link tiny:-* ${data}`))
        .catch(err=> {
            console.error(err);
            pika.reply(Config.message.error);
        });
     }
)

//༺─────────────────────────────────────༻

anya({
    name: "fancy",
    alias: Array.from({ length: numFancyAliases }, (_, i) => `fancy${i + 1}`),
    react: "💖",
    need: "text",
    category: "tools",
    desc: "Stylish texts",
    filename: __filename
}, async (anyaV2, pika, { args, prefix, command }) => {
    let c = 1;
    let styler = `
═════════════════════════
            ░▒▓ \`Sexy Text\` ▓▒░
═════════════════════════\n\n`;
    styler += `*${Config.themeemoji}Example:* ${prefix}fancy58 ${args.length > 0 ? args.join(" ") : "Hentai"}\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n`;
    const preview = args.length > 0 ? args.join(" ") : "Preview Text";
    for (const i of listall(preview)) {
        styler += `${c++}. ${i}\n`;
    }
    const footer = `\n\n> ${Config.footer}`;
    if (command === "fancy") {
        const ui = await UI.findOne({ id: "userInterface" }) || (await new UI({ id: "userInterface" }).save());
        if (ui.buttons) {
            const buttonsArray = [];
            for (let num = 1; num <= numFancyAliases; num++) {
                buttonsArray.push(`{\"header\":\"${num}. ${listall(preview)[num - 1]}\",\"title\":\"\",\"description\":\"click here to get this style\",\"id\":\"${prefix}fancy${num} ${preview}\"}`);
            }
            return await anyaV2.sendButtonText(pika.chat, {
                text: styler.trim(),
                footer: Config.footer,
                buttons: [{ "name": "single_select", "buttonParamsJson": `{\"title\":\"Quick Create 🌟\",\"sections\":[{\"title\":\"🍁 𝗖𝗵𝗼𝗼𝘀𝗲 𝗬𝗼𝘂𝗿 𝗦𝘁𝘆𝗹𝗲 🍁\",\"highlight_label\":\"${Config.botname}\",\"rows\":[${buttonsArray.join(",")}]}]}` }]
            }, { quoted: pika });
        } else {
            pika.reply(styler.trim() + footer);
        }
    } else {
        return pika.reply(listall(args.length > 0 ? args.join(" ") : "Enter Some Texts")[Number(command.split("fancy")[1]) - 1]);
    }
});
