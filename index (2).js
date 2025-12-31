const { Client } = require("discord.js-selfbot-v13");
const express = require("express");
const fs = require("fs");
const app = express();

// --- 📂 VERİ YÖNETİMİ ---
const INV_FILE = "./inv.json";
const STATS_FILE = "./stats.json";

let db_inv = { gemEnvanter: {} };
let db_stats = {};

const verileriYukle = () => {
    try {
        if (fs.existsSync(INV_FILE)) db_inv = JSON.parse(fs.readFileSync(INV_FILE, "utf8"));
        if (fs.existsSync(STATS_FILE)) db_stats = JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
    } catch (e) { console.log("⚠️ Veri dosyaları okunurken hata; yeni veriler oluşturulacak."); }
};
verileriYukle();

const invKaydet = () => fs.writeFileSync(INV_FILE, JSON.stringify(db_inv, null, 2));
const statsKaydet = () => fs.writeFileSync(STATS_FILE, JSON.stringify(db_stats, null, 2));

// --- ⚙️ AYARLAR ---
const KANAL_IDLERI = ["1454212196371267856", "1455537701859360870", "1455537767458148385"];
const SAHIP_ID = "877946035408891945";
const nadirlikDegeri = { 'u': 1, 'c': 2, 'r': 3, 'e': 4, 'm': 5, 'l': 6, 'f': 7 };
const fiyatlar = { C: 1, U: 3, R: 10, E: 250, M: 5000, L: 15000, F: 250000, S: 6000 };

const hayvanListesi = {
    C: ["bee", "snail", "bug", "beetle", "butterfly"],
    U: ["chick", "mouse", "rabbit", "chicken"],
    R: ["sheep", "pig", "cow", "dog", "cat"],
    E: ["crocodile", "tiger", "penguin", "elephant"],
    M: ["dragon", "unicorn", "snowman", "ghost"],
    L: ["deer", "fox", "lion", "owl"],
    F: ["boar", "eagle", "frog", "wolf"]
};

const ogutler = ["Sabır, acıdır ama meyvesi tatlıdır.", "Zamanı geri alamazsın, iyi kullan.", "Başarı, hazırlık ve fırsatın buluştuğu yerdir."];

// --- 🔑 TOKEN BAŞLATICI ---
const tokens = [
    process.env.TOKEN1, process.env.TOKEN2, process.env.TOKEN3, process.env.TOKEN4, process.env.TOKEN5
].filter(t => t);

tokens.forEach((token, index) => {
    const client = new Client({ checkUpdate: false });
    let calisiyorMu = false;
    let anaTimer;

    client.on("ready", async () => {
        const myID = client.user.id;
        console.log(`✅ [${client.user.username}] Aktif (ID: ${myID})`);

        // Her token için bağımsız stats alanı oluştur
        if (!db_stats[myID]) {
            db_stats[myID] = { C: 0, U: 0, R: 0, E: 0, M: 0, L: 0, F: 0, S: 0, toplamPara: 0 };
            statsKaydet();
        }

        // Web sunucusu (İlk bot üzerinden)
        if (index === 0) {
            app.get("/", (req, res) => res.send("OwO Otomasyon Sistemi Aktif!"));
            app.listen(3000);
        }

        // 📦 YENİDEN BAŞLATMADA OTOMATİK ENVANTER GÜNCELLEME
        const kanal = client.channels.cache.get(KANAL_IDLERI[0]);
        if (kanal) {
            console.log(`🔄 [${client.user.username}] Envanter verisi çekiliyor...`);
            setTimeout(() => { kanal.send("winv"); }, (index + 1) * 7000); // Tokenlar arası çakışmayı önlemek için gecikmeli
        }
    });

    client.on("messageCreate", async (message) => {
        const myID = client.user.id;
        const content = message.content ? message.content.toLowerCase() : "";

        // Sadece OwO Bot (408785106942164992) mesajlarını dinle
        if (message.author.id === '408785106942164992') {
            
            // 🛡️ GÜVENLİK (Captcha / DM)
            if (content.includes("verify") || content.includes("captcha") || message.channel.type === 'DM') {
                calisiyorMu = false;
                clearTimeout(anaTimer);
                const sahip = await client.users.fetch(SAHIP_ID);
                return sahip.send(`🚨 **DİKKAT:** ${client.user.username} durduruldu! Doğrulama gerekiyor.`);
            }

            // 📊 HAYVAN VE PARA TAKİBİ (Token'a Özel)
            if (content.includes("you found")) {
                let degisim = false;
                for (let n in hayvanListesi) {
                    hayvanListesi[n].forEach(h => {
                        if (content.includes(h)) {
                            db_stats[myID][n] = (db_stats[myID][n] || 0) + 1;
                            db_stats[myID].toplamPara = (db_stats[myID].toplamPara || 0) + fiyatlar[n];
                            degisim = true;
                        }
                    });
                }
                if (degisim) statsKaydet();
            }

            // 📦 ENVANTER KAYDI (winv çıktısını her token için ayrı kaydeder)
            if (content.includes("inventory")) {
                const gemRegex = /`(\d+)`[\s\S]*?([ucremlf])gem(\d+)[\s\S]*?`(\d+)`/gi;
                let matches, list = [];
                while ((matches = gemRegex.exec(message.content)) !== null) {
                    list.push({
                        id: matches[1], 
                        tip: matches[3], 
                        adet: parseInt(matches[4]), 
                        guc: nadirlikDegeri[matches[2]] || 0
                    });
                }
                if (list.length > 0) {
                    db_inv.gemEnvanter[myID] = list;
                    invKaydet();
                    console.log(`💾 [${client.user.username}] Envanter güncellendi.`);
                }
            }

            // 💎 GEM KONTROLÜ (Her Hunt veya WH sonrası eksikleri doldurur)
            if (content.includes("found a") || content.includes("empowered by") || content.includes("inventory")) {
                let eksikler = [];
                if (!message.content.includes("gem1")) eksikler.push("1");
                if (!message.content.includes("gem3")) eksikler.push("3");
                if (!message.content.includes("gem4")) eksikler.push("4");
                
                if (eksikler.length > 0) {
                    akilliGemKullan(client, message.channel, eksikler);
                }
            }
        }

        // 👑 SAHİP KOMUTLARI
        if (message.author.id !== SAHIP_ID) return;

        if (content === ".başlat") {
            if (calisiyorMu) return;
            calisiyorMu = true;
            otomasyon(client);
            message.reply(`▶️ **${client.user.username}** başlatıldı.`);
        }

        if (content === ".dur") {
            calisiyorMu = false;
            clearTimeout(anaTimer);
            message.reply(`🛑 **${client.user.username}** durduruldu.`);
        }

        if (content === ".zoo") {
            const d = db_stats[myID] || {};
            let msg = `📊 **İstatistik: ${client.user.username}**\n`;
            ["C","U","R","E","M","L","F"].forEach(n => msg += `**${n}:** ${d[n] || 0} | `);
            msg += `\n💰 **Toplam Değer:** ${d.toplamPara || 0} Cowoncy`;
            message.reply(msg);
        }
    });

    // --- 🧠 AKILLI GEM SİSTEMİ ---
    async function akilliGemKullan(bot, kanal, tipler) {
        let envanterim = db_inv.gemEnvanter[bot.user.id];
        if (!envanterim) return;

        let takilacaklar = [];
        tipler.forEach(tip => {
            // Elimizdeki en güçlü gem'i seçer
            let aday = envanterim
                .filter(g => g.tip === tip && g.adet > 0)
                .sort((a,b) => b.guc - a.guc)[0];
            
            if (aday) {
                takilacaklar.push(aday.id);
                aday.adet--; // Sanal olarak azalt ki aynı anda aynı ID'yi seçmesin
            }
        });

        if (takilacaklar.length > 0) {
            setTimeout(() => {
                kanal.send(`wuse ${takilacaklar.join(" ")}`);
                invKaydet(); // Adet düştüğü için kaydet
            }, 3500);
        }
    }

    // --- 🔄 OTOMASYON DÖNGÜSÜ ---
    function otomasyon(bot) {
        if (!calisiyorMu) return;
        const kanal = bot.channels.cache.get(KANAL_IDLERI[0]);
        if (!kanal) return;

        // 1. Hunt & Battle
        kanal.send("owo h");
        setTimeout(() => { if (calisiyorMu) kanal.send("owo b"); }, 7500);

        // 2. Şaşırtma (Pray) %25 Şans
        if (Math.random() < 0.25) {
            setTimeout(() => { if (calisiyorMu) kanal.send("owo pray"); }, 11000);
        }

        // 3. Şaşırtma (Mesaj/Öğüt) %15 Şans
        if (Math.random() < 0.15) {
            setTimeout(() => {
                if (calisiyorMu) {
                    const rKanal = bot.channels.cache.get(KANAL_IDLERI[Math.floor(Math.random()*KANAL_IDLERI.length)]);
                    rKanal.send(ogutler[Math.floor(Math.random()*ogutler.length)]);
                }
            }, 15000);
        }

        // 4. Periyodik WH (Gem Kontrolü İçin) %10 Şans
        if (Math.random() < 0.10) {
            setTimeout(() => { if (calisiyorMu) kanal.send("wh"); }, 18000);
        }

        anaTimer = setTimeout(() => otomasyon(bot), Math.floor(Math.random() * 5000) + 21000);
    }

    client.login(token).catch(e => console.error(`❌ [${token.slice(0,15)}...] Login Hatası!`));
});
