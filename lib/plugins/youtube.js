const fs = require('fs');
const Config = require('../../config');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { 
    anya,
    youtube,
    UI,
    getBuffer,
    getRandom,
    formatNumber,
    formatRuntime,
    formatDate,
    pickRandom,
} = require('../lib');
const emoji = ["👉🏻", "🎸", "🌚", "✨", "🍁", "🌟", "❤️", "🔖", "🦋", "⚜️", "🗿", "✅", "💟", "🎃", "🍓", "🍇"];
const symbol = ["⭔", "❃", "❁", "✬", "⛦", "◌", "⌯", "⎔", "▢", "▣", "◈", "֍", "֎", "࿉", "۞", "⎆", "⎎"];
                    
//༺─────────────────────────────────────

anya({
    name: "ytsearch",
    alias: ['yts', 'yt', 'youtube', 'play'],
    react: "🎈",
    need: "query",
    category: "download",
    desc: "Search videos on YouTube",
    filename: __filename
}, async (anyaV2, pika, { args, prefix, command }) => {
    if (!args[0]) return pika.reply("_Enter a query to search!_");
    const text = args.join(" ");
    if (youtube.isYouTubeUrl(text)) return pika.reply("_Use `" + prefix + "ytv2 <url>` for URLs_");
    try {
        const info = await youtube.search(text, "videos");
        if (info.length < 1) return pika.reply("_❌ No Videos Found!_");
        const ui = await UI.findOne({ id: "userInterface" }) || (await new UI({ id: "userInterface" }).save());
        const emojis = pickRandom(emoji);
        if (ui.buttons) {
            const buttonsArray = [];
            for (let i = 0; i < Math.min(info.length, 24); i++) {
                const item = info[i];
                buttonsArray.push(`{\"header\":\"${emojis} ${item.title}\",\"title\":\"${item.views ? formatNumber(item.views) : "UNKNOWN"} views | ${item.timestamp}min\",\"description\":\"channel: ${item.author.name}\",\"id\":\"${prefix}ytsqualityandformateselector ${item.url}\"}`);
            }
            const caption = "*📝 Search Term:* " + text + "\n\n*🥵 User:* @" + pika.sender.split("@")[0] + "\n*🦋 Bot:* " + Config.botname + "\n*🌊 Results:* " + info.length + " found!";
            return await anyaV2.sendButtonImage(pika.chat, {
                image: await getBuffer("https://i.ibb.co/wcxrZVh/hero.png"),
                caption: caption,
                footer: Config.footer,
                buttons: [
                    {
                        "name": "single_select",
                        "buttonParamsJson": `{\"title\":\"Choose Video ${emojis}\",\"sections\":[{\"title\":\"✨ 𝗖𝗵𝗼𝗼𝘀𝗲 𝘆𝗼𝘂𝗿 𝗳𝗮𝘃. 𝘃𝗶𝗱𝗲𝗼 ✨\",\"highlight_label\":\"Anya YT Engine\",\"rows\":[${buttonsArray.join(",")}]}]}`
                    },
                    {
                        "name": "cta_url",
                        "buttonParamsJson": `{\"display_text\":\"Website ⚡\",\"url\":\"${Config.socialLink}\",\"merchant_url\":\"${Config.socialLink}\"}`
                    },
                    {
                        "name": "quick_reply",
                        "buttonParamsJson": `{\"display_text\":\"Explore more ✨\",\"id\":\"${prefix}list\"}`
                    }],
                contextInfo: { mentionedJid: [pika.sender] }
            }, { quoted: pika });
        } else {
            let caption = emojis + " _Reply with a number to get the video_\n" + emojis + " _Example: 3_\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n";
            const emojis2 = pickRandom(emoji);
            for (let i = 0; i < Math.min(info.length, 24); i++) {
                const item = info[i];
                caption += `*${emojis2} ${i + 1}. ${item.title}*\n_👁️‍🗨️ Views: ${item.views ? formatNumber(item.views) : "UNKNOWN"}_\n_⏳ Duration: ${item.timestamp}min_\n_🌟 Uploaded: ${item.ago}_\n_👑 Author: ${item.author.name}_\n_🔗 ${item.url} ;_\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n`;
            }
            caption += "> _ID: QA06_\n> " + Config.footer;
            return await anyaV2.sendMessage(pika.chat, {
                text: caption.trim(),
                contextInfo: {
                    externalAdReply: {
                        showAdAttribution: true,
                        title: `${Config.botname} YOUTUBE Engine`,
                        body: 'Reply with a number to download audio/video',
                        thumbnailUrl: "https://i.ibb.co/wcxrZVh/hero.png",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: pika });
        }
    } catch (err) {
        console.error("ERROR:", err);
        return pika.reply("ERROR: " + err.message);
    }
});

//༺─────────────────────────────────────

anya({
    name: "ytsqualityandformateselector",
    react: "✨",
    notCmd: true,
    filename: __filename
}, async (anyaV2, pika, { args, prefix, command }) => {
    if (!args[0]) return pika.reply("_Enter a query to search!_");
    if (!youtube.isYouTubeUrl(args[0])) return pika.reply("_Using this command not allowed!_");
    try {
        const info = await youtube.downloadYtVideo(args[0]);
        if (!info.status) return pika.reply("_❌No video Found!_");
        const symbols = pickRandom(symbol);
        const emojis = pickRandom(emoji);
        const ui = await UI.findOne({ id: "userInterface" }) || (await new UI({ id: "userInterface" }).save());
        if (ui.buttons) {
            const caption = `
*⌈⭔ ANYA YOUTUBE ENGINE ⭔⌋*

*📝 Title:* ${info.title}

*✨ Likes:* ${formatNumber(info.likes)} _likes_
*👁️‍🗨️ Views:* ${formatNumber(info.views)} _views_
*⏳ Duration:* ${formatRuntime(info.duration)}
*🔖 Uploaded On:* ${formatDate(info.uploadedOn).date}
*🍁 Channel:* ${info.author.user}
            `;
            const buttonsArray = [
                `{\"header\":\"${emojis} video\",\"title\":\"𝘵𝘢𝘱 𝘩𝘦𝘳𝘦 𝘵𝘰 𝘥𝘰𝘸𝘯𝘭𝘰𝘢𝘥\",\"description\":\"\",\"id\":\"${prefix}ytv2 ${info.url} 360p\"}`,
                `{\"header\":\"${emojis} video (document)\",\"title\":\"𝘵𝘢𝘱 𝘩𝘦𝘳𝘦 𝘵𝘰 𝘥𝘰𝘸𝘯𝘭𝘰𝘢𝘥\",\"description\":\"\",\"id\":\"${prefix}ytvdoc ${info.url}\"}`,
                `{\"header\":\"${emojis} audio\",\"title\":\"𝘵𝘢𝘱 𝘩𝘦𝘳𝘦 𝘵𝘰 𝘥𝘰𝘸𝘯𝘭𝘰𝘢𝘥 𝘵𝘩𝘪𝘴 𝘢𝘶𝘥𝘪𝘰\",\"description\":\"\",\"id\":\"${prefix}yta2 ${info.url} mp3\"}`,
                `{\"header\":\"${emojis} audio (document)\",\"title\":\"𝘵𝘢𝘱 𝘩𝘦𝘳𝘦 𝘵𝘰 𝘥𝘰𝘸𝘯𝘭𝘰𝘢𝘥 𝘵𝘩𝘪𝘴 𝘢𝘶𝘥𝘪𝘰\",\"description\":\"\",\"id\":\"${prefix}ytadoc ${info.url}\"}`
            ];
            return await anyaV2.sendButtonText(pika.chat, {
                text: caption.trim(),
                footer: Config.footer,
                buttons: [
                    {
                        "name": "single_select",
                        "buttonParamsJson": `{\"title\":\"Choose Formats 👀\",\"sections\":[{\"title\":\"🔖 𝗖𝗵𝗼𝗼𝘀𝗲 𝘆𝗼𝘂𝗿 𝗱𝗲𝘀𝗶𝗿𝗲𝗱 𝗳𝗼𝗿𝗺𝗮𝘁 🔖\",\"highlight_label\":\"Anya YT Engine\",\"rows\":[${buttonsArray.join(",")}]}]}`
                    },
                    {
                        "name": "cta_url",
                        "buttonParamsJson": `{\"display_text\":\"Watch video ❤️\",\"url\":\"${info.url}\",\"merchant_url\":\"${info.url}\"}`
                    },
                    {
                        "name": "quick_reply",
                        "buttonParamsJson": `{\"display_text\":\"Get lyrics 🎸\",\"id\":\"${prefix}lyrics ${info.title}\"}`
                    }
                ],
            }, { quoted: pika });
        } else {
            let caption = "`Reply a number to select:`\n\n";
            caption += `*1 ${symbols} video*\n`;
            caption += `*2 ${symbols} video* _(📄document)_\n`;
            caption += `*3 ${symbols} audio*\n`;
            caption += `*4 ${symbols} audio* _(📄document)_\n\n`;
            caption += `> VID: ${info.videoId}\n`;
            caption += `> _ID: QA34_`;
            return await anyaV2.sendMessage(pika.chat, {
                image: await getBuffer(info.thumbnail.url),
                caption: caption.trim()
            }, { quoted: pika });
        }
    } catch (err) {
        console.error("ERROR:", err);
        return pika.reply("ERROR: " + err.message);
    }
});

//༺─────────────────────────────────────

anya({
    name: "ytvideo",
    alias: ['ytv'],
    react: "🔖",
    need: "query",
    category: "download",
    desc: "Download videos using query",
    filename: __filename
}, async (anyaV2, pika, { args, prefix, command }) => {
    if (!args[0]) return pika.reply("_Enter a search term!_");
    if (youtube.isYouTubeUrl(args[0])) return pika.reply("_Use `" + prefix + command  + "2 <url>` for URLs_");
    try {
        const text = args.join(" ");
        const search = await youtube.search(text, "videos");
        const top8Videos = search.slice(0, 8);
        const random = pickRandom(top8Videos);
        const info = await youtube.downloadYtVideo(random.url);
        if (!info.status) return pika.reply("_❌No video Found!_");
        const ui = await UI.findOne({ id: "userInterface" }) || (await new UI({ id: "userInterface" }).save());
            if (ui.buttons) {
                const caption = `
*⌈⭔ ANYA YTDL ENGINE ⭔⌋*

*📝 Title:* ${info.title}

*👁️‍🗨️ Views:* ${formatNumber(info.views)} _views_
*🔖 Uploaded On:* ${formatDate(info.uploadedOn).date}

_Click the button below to choose *video* formats_
`;
                return await anyaV2.sendButtonText(pika.chat, {
                    text: caption.trim(),
                    footer: Config.footer,
                    buttons: [
                        {
                            "name": "quick_reply",
                            "buttonParamsJson": `{\"display_text\":\"Get Video 🎦\",\"id\":\"${prefix}ytv2 ${info.url} 360p\"}`
                        },
                        {
                            "name": "quick_reply",
                            "buttonParamsJson": `{\"display_text\":\"Get Document 📄\",\"id\":\"${prefix}ytvdoc ${info.url}\"}`
                        },
                        {
                            "name": "cta_url",
                            "buttonParamsJson": `{\"display_text\":\"Watch on YouTube ❤️\",\"url\":\"${info.url}\",\"merchant_url\":\"${info.url}\"}`
                        },
                        {
                            "name": "quick_reply",
                            "buttonParamsJson": `{\"display_text\":\"Get lyrics ✨\",\"id\":\"${prefix}lyrics ${info.title}\"}`
                        }
                    ]
                }, { quoted: pika });
            } else {
                let caption = "";
                const symbols = pickRandom(symbol);
                caption += `*🌟 Title:* ${info.title}\n\n`;
                caption += `> Views: ${formatNumber(info.views)}\n`;
                caption += `> Duration: ${formatRuntime(info.duration)}\n\n`;
                caption += "`Reply a number to select:`\n\n";
                caption += `*1 ${symbols} video*\n`;
                caption += `*2 ${symbols} video* _(📄document)_\n\n`;
                caption += `> VID: ${info.videoId}\n`;
                caption += `> _ID: QA05_`;

                return await anyaV2.sendMessage(pika.chat, {
                    image: await getBuffer(info.thumbnail.url),
                    caption: caption.trim()
                }, { quoted: pika });
            }
//        }
    } catch (err) {
        console.error("ERROR:", err);
        return pika.reply("ERROR: " + err.message);
    }
});

//༺─────────────────────────────────────

anya({
    name: "ytaudio",
    alias: ['yta', 'song', 'music'],
    react: "🔖",
    need: "query",
    category: "download",
    desc: "Download audio/songs using query",
    filename: __filename
}, async (anyaV2, pika, { args, prefix, command }) => {
    if (!args[0]) return pika.reply("_Enter a search term!_");
    if (youtube.isYouTubeUrl(args[0])) return pika.reply(`_Use \`${prefix + command}2 <url>\` for URLs_`);

    try {
        const text = args.join(" ");
        const search = await youtube.search(text, "videos");
        const top8Videos = search.slice(0, 8);
        const random = pickRandom(top8Videos);
        const info = await youtube.downloadYtAudio(random.url);
        if (!info.status) return pika.reply("_❌No Audio/Song Found!_");
        const ui = await UI.findOne({ id: "userInterface" }) || (await new UI({ id: "userInterface" }).save());
        if (ui.buttons) {
                const caption = `
*⌈⭔ ANYA YTDL ENGINE ⭔⌋*

*📝 Title:* ${info.title}

*👁️‍🗨️ Views:* ${formatNumber(info.views)} _views_
*🔖 Uploaded On:* ${formatDate(info.uploadedOn).date}

_Click the button below to choose *audio* formats_
`;
                return await anyaV2.sendButtonText(pika.chat, {
                    text: caption.trim(),
                    footer: Config.footer,
                    buttons: [
                        {
                            "name": "quick_reply",
                            "buttonParamsJson": `{\"display_text\":\"Get Audio 🔊\",\"id\":\"${prefix}yta2 ${info.url} mp3\"}`
                        },
                        {
                            "name": "quick_reply",
                            "buttonParamsJson": `{\"display_text\":\"Get Document 📄\",\"id\":\"${prefix}ytadoc ${info.url}\"}`
                        },
                        {
                            "name": "cta_url",
                            "buttonParamsJson": `{\"display_text\":\"Watch on YouTube ❤️\",\"url\":\"${info.url}\",\"merchant_url\":\"${info.url}\"}`
                        },
                        {
                            "name": "quick_reply",
                            "buttonParamsJson": `{\"display_text\":\"Get lyrics ✨\",\"id\":\"${prefix}lyrics ${info.title}\"}`
                        }
                    ]
                }, { quoted: pika });
            } else {
                let caption = "";
                const symbols = pickRandom(symbol);
                caption += `*🌟 Title:* ${info.title}\n\n`;
                caption += `> Views: ${formatNumber(info.views)}\n`;
                caption += `> Duration: ${formatRuntime(info.duration)}\n\n`;
                caption += "`Reply a number to select:`\n\n";
                caption += `*1 ${symbols} audio*\n`;
                caption += `*2 ${symbols} audio* _(📄document)_\n\n`;
                caption += `> VID: ${info.videoId}\n`;
                caption += `> _ID: QA04_`;

                return await anyaV2.sendMessage(pika.chat, {
                    image: await getBuffer(info.thumbnail.url),
                    caption: caption.trim()
                }, { quoted: pika });
            }
    } catch (err) {
        console.error("ERROR:", err);
        return pika.reply("ERROR: " + err.message);
    }
});

//༺─────────────────────────────────────

anya({
    name: "ytvideo2",
    alias: ['ytv2'],
    react: "🌟",
    need: "url",
    category: "download",
    desc: "Download videos using url",
    filename: __filename
}, async (anyaV2, pika, { args, prefix, command }) => {
    if (!args[0]) return pika.reply("_Enter a YouTube video url to search!_");
    if (!youtube.isYouTubeUrl(args[0])) return pika.reply("_Use `" + prefix + "ytvideo <query>` for queries_");
    try {
        const info = await youtube.downloadYtVideo(args[0]);
        if (!info.status) return pika.reply("_❌No video Found!_");
        const ui = await UI.findOne({ id: "userInterface" }) || (await new UI({ id: "userInterface" }).save());
        const emojis = pickRandom(emoji);
        if (/360p/.test(args[1])) {
            const { key } = await pika.keyMsg(Config.message.wait);
            const caption = `
*⌈⭔ ANYA YTDL ENGINE ⭔⌋*

*📝 Title:* ${info.title}

*✨ Likes:* ${formatNumber(info.likes)} _likes_
*👁️‍🗨️ Views:* ${formatNumber(info.views)} _views_
*⏳ Duration:* ${formatRuntime(info.duration)}
*🔖 Uploaded On:* ${formatDate(info.uploadedOn).date}
*🍁 Channel:* ${info.author.user}
`;
            if (ui.buttons) {
                return await anyaV2.sendButtonVideo(pika.chat, {
                    video: await getBuffer(info.videoUrl[0].url),
                    caption: caption.trim(),
                    footer: Config.footer,
                    buttons: [
                        {
                            "name": "cta_url",
                            "buttonParamsJson": `{\"display_text\":\"Get on YouTube ❤️\",\"url\":\"${info.url}\",\"merchant_url\":\"${info.url}\"}`
                        },
                        {
                            "name": "quick_reply",
                            "buttonParamsJson": `{\"display_text\":\"Explore more ✨\",\"id\":\"${prefix}list\"}`
                        }
                    ],
                    contextInfo: { mentionedJid: [pika.sender] }
                }, { quoted: pika })
                .then(() => pika.edit("> ✅ Video proceeded!", key));
            } else {
                return await anyaV2.sendMessage(pika.chat, {
                    video: await getBuffer(info.videoUrl[0].url),
                    caption: caption.trim()
                }, { quoted: pika })
                .then(() => pika.edit("> ✅ Video proceeded!", key));
            }
        } else {
            const buttonsArray = [
                `{\"header\":\"${emojis} video\",\"title\":\"𝘵𝘢𝘱 𝘩𝘦𝘳𝘦 𝘵𝘰 𝘥𝘰𝘸𝘯𝘭𝘰𝘢𝘥\",\"description\":\"\",\"id\":\"${prefix}ytv2 ${info.url} 360p\"}`,
                `{\"header\":\"${emojis} video (document)\",\"title\":\"𝘵𝘢𝘱 𝘩𝘦𝘳𝘦 𝘵𝘰 𝘥𝘰𝘸𝘯𝘭𝘰𝘢𝘥\",\"description\":\"\",\"id\":\"${prefix}ytvdoc ${info.url}\"}`
            ];

            if (ui.buttons) {
                const caption = `
*⌈⭔ ANYA YTDL ENGINE ⭔⌋*

*📝 Title:* ${info.title}
*👁️‍🗨️ Views:* ${formatNumber(info.views)} _views_
*🔖 Uploaded On:* ${formatDate(info.uploadedOn).date}
`;
                return await anyaV2.sendButtonText(pika.chat, {
                    text: caption.trim(),
                    footer: Config.footer,
                    buttons: [
                        {
                            "name": "single_select",
                            "buttonParamsJson": `{\"title\":\"Choose Format ⚜️\",\"sections\":[{\"title\":\"✨ 𝗖𝗵𝗼𝗼𝘀𝗲 𝘆𝗼𝘂𝗿 𝗱𝗲𝘀𝗶𝗿𝗲𝗱 𝗳𝗼𝗿𝗺𝗮𝘁𝘀 ✨\",\"highlight_label\":\"Anya YT Engine\",\"rows\":[${buttonsArray.join(",")}]}]}`
                        },
                        {
                            "name": "cta_url",
                            "buttonParamsJson": `{\"display_text\":\"Watch on YouTube ❤️\",\"url\":\"${info.url}\",\"merchant_url\":\"${info.url}\"}`
                        },
                        {
                            "name": "quick_reply",
                            "buttonParamsJson": `{\"display_text\":\"Get lyrics ✨\",\"id\":\"${prefix}lyrics ${info.title}\"}`
                        }
                    ]
                }, { quoted: pika });
            } else {
                let caption = "";
                const symbols = pickRandom(symbol);
                caption += `*🌟 Title:* ${info.title}\n\n`;
                caption += `> Views: ${formatNumber(info.views)}\n`;
                caption += `> Duration: ${formatRuntime(info.duration)}\n\n`;
                caption += "`Reply a number to select:`\n\n";
                caption += `*1 ${symbols} video*\n`;
                caption += `*2 ${symbols} video* _(📄document)_\n\n`;
                caption += `> VID: ${info.videoId}\n`;
                caption += `> _ID: QA05_`;

                return await anyaV2.sendMessage(pika.chat, {
                    image: await getBuffer(info.thumbnail.url),
                    caption: caption.trim()
                }, { quoted: pika });
            }
        }
    } catch (err) {
        console.error("ERROR:", err);
        return pika.reply("ERROR: " + err.message);
    }
});

//༺─────────────────────────────────────

anya({
    name: "ytaudio2",
    alias: ['yta2', 'song2', 'music2'],
    react: "🔖",
    need: "url",
    category: "download",
    desc: "Download audio/songs using url",
    filename: __filename
}, async (anyaV2, pika, { args, prefix, command }) => {
    if (!args[0]) return pika.reply("_Enter a search term!_");
    if (!youtube.isYouTubeUrl(args[0])) return pika.reply(`_Use \`${prefix}ytaudio <query>\` for queries_`);
    try {
        const info = await youtube.downloadYtAudio(args[0]);
        if (!info.status) return pika.reply("_❌No Audio/Song Found!_");
        const emojis = pickRandom(emoji);
        if (/mp3/.test(args[1])) {
        const { key } = await pika.keyMsg(Config.message.wait);
        const tempDir = path.join(__dirname, '../../.temp');
        const outputFilePath = path.join(tempDir, getRandom(8));
        const file = await new Promise((resolve, reject) => {
            ffmpeg(info.audioUrl)
                .audioFrequency(44100)
                .audioChannels(2)
                .audioBitrate(128)
                .audioCodec('libmp3lame')
                .audioQuality(5)
                .toFormat('mp3')
                .save(outputFilePath)
                .on('end', () => resolve(outputFilePath))
                .on('error', reject);
        });
        const buffer = fs.readFileSync(outputFilePath);

            await anyaV2.sendMessage(pika.chat, {
                audio: buffer,
                mimetype: 'audio/mp4',
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: "𝗔𝗻𝘆𝗮 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗘𝗻𝗴𝗶𝗻𝗲",
                        body: info.title,
                        thumbnail: await getBuffer(info.thumbnail.url),
                        showAdAttribution: true,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: pika }).then(() => pika.edit("> ✅ Audio proceeded!", key));
   
        fs.unlinkSync(outputFilePath);
      } else {
        const ui = await UI.findOne({ id: "userInterface" }) || (await new UI({ id: "userInterface" }).save());
            const buttonsArray = [
                `{\"header\":\"${emojis} audio\",\"title\":\"𝘵𝘢𝘱 𝘩𝘦𝘳𝘦 𝘵𝘰 𝘥𝘰𝘸𝘯𝘭𝘰𝘢𝘥\",\"description\":\"\",\"id\":\"${prefix}yta2 ${info.url} mp3\"}`,
                `{\"header\":\"${emojis} audio (document)\",\"title\":\"𝘵𝘢𝘱 𝘩𝘦𝘳𝘦 𝘵𝘰 𝘥𝘰𝘸𝘯𝘭𝘰𝘢𝘥\",\"description\":\"\",\"id\":\"${prefix}ytadoc ${info.url}\"}`
            ];

            if (ui.buttons) {
                const caption = `
*⌈⭔ ANYA YTDL ENGINE ⭔⌋*

*📝 Title:* ${info.title}
*👁️‍🗨️ Views:* ${formatNumber(info.views)} _views_
*🔖 Uploaded On:* ${formatDate(info.uploadedOn).date}
`;
                return await anyaV2.sendButtonText(pika.chat, {
                    text: caption.trim(),
                    footer: Config.footer,
                    buttons: [
                        {
                            "name": "single_select",
                            "buttonParamsJson": `{\"title\":\"Choose Format ⚜️\",\"sections\":[{\"title\":\"✨ 𝗖𝗵𝗼𝗼𝘀𝗲 𝘆𝗼𝘂𝗿 𝗱𝗲𝘀𝗶𝗿𝗲𝗱 𝗳𝗼𝗿𝗺𝗮𝘁𝘀 ✨\",\"highlight_label\":\"Anya YT Engine\",\"rows\":[${buttonsArray.join(",")}]}]}`
                        },
                        {
                            "name": "cta_url",
                            "buttonParamsJson": `{\"display_text\":\"Watch on YouTube ❤️\",\"url\":\"${info.url}\",\"merchant_url\":\"${info.url}\"}`
                        },
                        {
                            "name": "quick_reply",
                            "buttonParamsJson": `{\"display_text\":\"Get lyrics ✨\",\"id\":\"${prefix}lyrics ${info.title}\"}`
                        }
                    ]
                }, { quoted: pika });
            } else {
                let caption = "";
                const symbols = pickRandom(symbol);
                caption += `*🌟 Title:* ${info.title}\n\n`;
                caption += `> Views: ${formatNumber(info.views)}\n`;
                caption += `> Duration: ${formatRuntime(info.duration)}\n\n`;
                caption += "`Reply a number to select:`\n\n";
                caption += `*1 ${symbols} audio*\n`;
                caption += `*2 ${symbols} audio* _(📄document)_\n\n`;
                caption += `> VID: ${info.videoId}\n`;
                caption += `> _ID: QA04_`;

                return await anyaV2.sendMessage(pika.chat, {
                    image: await getBuffer(info.thumbnail.url),
                    caption: caption.trim()
                }, { quoted: pika });
            }
      }
    } catch (err) {
        console.error("ERROR:", err);
        return pika.reply("ERROR: " + err.message);
    }
});

//༺─────────────────────────────────────

anya({
    name: "ytvdoc",
    alias: ['ytvdocument'],
    react: "📄",
    need: "url",
    category: "download",
    desc: "Download video documents using url",
    filename: __filename
}, async (anyaV2, pika, { args, prefix, command }) => {
    if (!args[0]) return pika.reply("_Enter a YouTube video URL to search!_");
    if (!youtube.isYouTubeUrl(args[0])) return pika.reply("_Use `" + prefix + "ytvideo <query>` for queries_");

    const { key } = await pika.keyMsg(Config.message.wait);
    try {
        const info = await youtube.downloadYtVideo(args[0]);
        if (!info.status) return pika.edit("_❌No video Found!_", key);

        const caption = `
*⌈⭔ ANYA YTDL ENGINE ⭔⌋*

*📝 Title:* ${info.title}

*✨ Likes:* ${formatNumber(info.likes)} _likes_
*👁️‍🗨️ Views:* ${formatNumber(info.views)} _views_
*⏳ Duration:* ${formatRuntime(info.duration)}
*🔖 Uploaded On:* ${formatDate(info.uploadedOn).date}
*🍁 Channel:* ${info.author.user}
`;

        await anyaV2.sendMessage(pika.chat, {
                document: await getBuffer(info.videoUrl[0].url),
                caption: caption,
                fileName: info.videoId + '.mp4',
                mimetype: "video/mp4",
                contextInfo: {
                    externalAdReply: {
                        title: "𝗔𝗻𝘆𝗮 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗘𝗻𝗴𝗶𝗻𝗲",
                        body: info.title,
                        thumbnail: await getBuffer(info.thumbnail.url),
                        showAdAttribution: true,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: pika }).then(() => pika.edit("> ✅ Video doc proceeded!", key));
    } catch (err) {
        console.error("ERROR:", err);
        return pika.edit("ERROR: " + err.message, key);
    }
});

//༺─────────────────────────────────────

anya({
    name: "ytadoc",
    alias: ['ytadocument'],
    react: "📄",
    need: "url",
    category: "download",
    desc: "Download audio/songs documents using url",
    filename: __filename
}, async (anyaV2, pika, { args, prefix, command }) => {
    if (!args[0]) return pika.reply("_Enter a search term!_");
    if (!youtube.isYouTubeUrl(args[0])) return pika.reply(`_Use \`${prefix}ytaudio <query>\` for queries_`);
    const { key } = await pika.keyMsg(Config.message.wait);
    try {
        const info = await youtube.downloadYtAudio(args[0]);
        if (!info.status) return pika.edit("_❌No Audio/Song Found!_", key);
        const tempDir = path.join(__dirname, '../../.temp');
        const outputFilePath = path.join(tempDir, getRandom(8));
        const file = await new Promise((resolve, reject) => {
            ffmpeg(info.audioUrl)
                .audioFrequency(44100)
                .audioChannels(2)
                .audioBitrate(128)
                .audioCodec('libmp3lame')
                .audioQuality(5)
                .toFormat('mp3')
                .save(outputFilePath)
                .on('end', () => resolve(outputFilePath))
                .on('error', reject);
        });
        const buffer = fs.readFileSync(outputFilePath);
            
        await anyaV2.sendMessage(pika.chat,{
            document: buffer,
            caption: "*Title:* " + info.title,
            fileName: `${info.videoId}.mp3`,
            mimetype: "audio/mp3",
            contextInfo: {
                externalAdReply: {
                    title: "𝗔𝗻𝘆𝗮 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗘𝗻𝗴𝗶𝗻𝗲",
                    body: info.title,
                    thumbnail: await getBuffer(info.thumbnail.url),
                    showAdAttribution: true,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        },{ quoted: pika }).then(() => pika.edit("> ✅ Audio doc proceeded!", key));
   
        fs.unlinkSync(outputFilePath);
    } catch (err) {
        console.error("ERROR:", err);
        return pika.edit("ERROR: " + err.message, key);
    }
});
