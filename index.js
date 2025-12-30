const { Client } = require("discord.js-selfbot-v13");
const express = require("express");
const client = new Client({ checkUpdate: false });
const app = express();

// --- AYARLAR ---
const KANAL_IDLERI = ["1454212196371267856", "1455537701859360870", "1455537767458148385"]; // 3 adet kanal ID'si buraya
const SAHIP_ID = "877946035408891945"; 
let calisiyorMu = false;
let anaTimer;

// Veri Takibi ve Satış Fiyatları
let istatistik = {
    C: 0, U: 0, R: 0, E: 0, M: 0, L: 0, F: 0, S: 0,
    toplamPara: 0
};

const fiyatlar = {
    C: 1, U: 3, R: 10, E: 250, M: 5000, L: 15000, F: 250000, S: 6000
};

// Hayvan İsim Listesi (İsimlerden Algılama İçin)
const hayvanListesi = {
    C: ["bee", "bug", "snail", "beetle", "butterfly", "arı", "böcek", "salyangoz"],
    U: ["chick", "mouse", "chicken", "rabbit", "chipmunk", "civciv", "fare", "tavşan"],
    R: ["sheep", "pig", "cow", "dog", "cat", "koyun", "domuz", "inek"],
    E: ["crocodile", "tiger", "penguin", "elephant", "whale", "timsah", "kaplan"],
    M: ["dragon", "unicorn", "snowman", "ghost", "dove", "ejderha", "hayalet"],
    L: ["deer", "fox", "lion", "owl", "squid", "geyik", "tilki", "aslan"],
    F: ["boar", "eagle", "frog", "gorilla", "wolf", "kartal", "kurbağa", "kurt"]
};

const ogutler = [
    




    "Hayat, senin ona baktığın pencere kadardır; eğer penceren kirliyse dışarıdaki çiçeklerin güzelliğini asla göremezsin.",
    "Gerçek güç, birini alt etmek değil, öfkelendiğinde kendi kendine hakim olabilme yetisidir.",
    "Yolun nereye varacağını düşünmek yerine, yolculuğun kendisine odaklan; çünkü hayat bir süreçtir.",
    "Başkalarının senin hakkında ne düşündüğü, senin kim olduğunu değil, onların kim olduğunu gösterir.",
    "Zirveye çıkmak zordur ama orada kalmak, oraya çıkmaktan çok daha büyük bir karakter sınavıdır.",
    "Bir kitap nasıl kapağına bakılarak yargılanmazsa, bir insan da sadece dış görünüşüne bakılarak tanınmaz.",
    "Hayatta en büyük risk, hiçbir zaman risk almamaktır; durağan bir su en çabuk kirlenen sudur.",
    "Geçmiş bir hatıradır, gelecek bir hayal; elinde olan tek gerçeklik, şu an içinde bulunduğun saniyedir.",
    "Karakterin, kimsenin seni izlemediği anlarda ne yaptığınla belirlenir; dürüstlük sessiz bir eylemdir.",
    "Rüzgarın yönünü değiştiremezsin ama yelkenlerini ona göre ayarlayarak istediğin limana varabilirsin.",
    "Bilgi sana sadece ne söyleyeceğini öğretir, bilgelik ise ne zaman susman gerektiğini fısıldar.",
    "Küçük hesaplar yapanlar, büyük başarıların getirdiği huzuru asla tadamazlar.",
    "Başarı, her düştüğünde bir kez daha ayağa kalkabilme inadının toplamıdır.",
    "Kendi iç huzurunu bulamayan bir insan, dünyayı gezse bile aradığı sükuneti hiçbir yerde bulamaz.",
    "Sözlerin bir ok gibidir; ağzından çıkana kadar sen ona hakimsin, çıktıktan sonra o sana hakimdir.",
    "Hayat bir ayna gibidir; sen ona gülümserse o da sana gülümser, sen ona sırtını dönersen o da seni unutur.",
    "En büyük yalnızlık, kalabalıklar içinde seni anlamayan insanların arasında kalmaktır.",
    "Başkalarının ışığını söndürerek kendi yolunu aydınlatamazsın; her parlaklık kendi kaynağına muhtaçtır.",
    "Zaman, harcayabileceğin en değerli hazinedir; onu başkalarının hayatlarını tartışarak israf etme.",
    "Bir insanın kalitesi, kendisinden daha güçsüz olanlara nasıl davrandığıyla ölçülür.",
    "Hayallerin, korkularından daha büyük olduğu sürece her türlü engeli aşacak gücü kendinde bulursun.",
    "Affetmek bir zayıflık değil, ruhunu geçmişin zincirlerinden kurtaran en büyük özgürlüktür.",
    "Eleştiri bir armağandır; doğruysa geliştirir, yanlışsa karakterini test eder.",
    "Hayat kısa değildir; sadece biz onun çok fazla vaktini boşa harcamayı tercih ederiz.",
    "Bir dostun kalbini kırmak, yıllarca emek vererek kurduğun bir sarayı tek bir kibritle yakmaya benzer.",
    "Sabır, pasif bir bekleyiş değil, geleceğe olan inancını her gün taze tutma sanatıdır.",
    "Dünyayı değiştirmek istiyorsan, işe önce kendi sabahlarını ve alışkanlıklarını değiştirerek başlamalısın.",
    "Her zorluk, aslında içinde bir fırsat barındırır; yeter ki bakış açını değiştirmeyi başar.",
    "İyilik yapmak için fırsat bekleme; bazen bir tebessüm, binlerce kelimeden daha derin iz bırakır.",
    "Başarıya giden asansör bozuk olabilir ama merdivenler her zaman yerindedir ve seni daha dayanıklı yapar.",
    "Kendi değerini başkalarının onayına bağlarsan, her zaman onların kölesi olarak kalırsın.",
    "Hayatın amacı, sadece nefes almak değil, nefesini kesecek kadar güzel anlar biriktirmektir.",
    "Hiçbir başarı tesadüf değildir; arkasında uykusuz geceler ve ter akıtılmış sabahlar vardır.",
    "Kendine güvenmek, herkesin seni seveceğine inanmak değil, sevilmediğinde de ayakta kalabilmektir.",
    "Zeka seni öne geçirir ama nezaket seni kalıcı kılar ve insanların gönlünde yer açar.",
    "Geçmişin pişmanlıkları ve geleceğun kaygıları, bugünün güzelliğini çalan iki büyük hırsızdır.",
    "En büyük savaş, insanın kendi içindeki karanlıkla ve tembellikle verdiği savaştır.",
    "Hayat, sana sunulan bir seçenekler bütünüdür; verdiğin her karar, senin gelecekteki silüetindir.",
    "Kimseyi değiştiremezsin; sadece kendin değişerek başkalarına ilham kaynağı olabilirsin.",
    "Büyük beyinler fikirleri, orta beyinler olayları, küçük beyinler ise insanları tartışır.",
    "Umut, en zifiri karanlıkta bile gökyüzünde bir yıldızın olduğunu bilme cesaretidir.",
    "Tecrübe, hayatta yediğin kazıkların toplamına verilen en kibar isimdir; onlardan ders çıkar.",
    "Bir insanın gerçek gücü, zor zamanlarda sergilediği sükunet ve gösterdiği iradedir.",
    "Hayatta her şeyin bir sonu vardır; bu yüzden hem acıların hem"
];

// --- UPTIME SUNUCUSU ---
app.get("/", (req, res) => res.send("Bot 7/24 Aktif!"));
app.listen(3000, () => console.log("Uptime sunucusu 3000 portunda hazır."));

client.on("ready", () => {
    console.log(`✅ ${client.user.username} Giriş Yaptı!`);
    console.log("Komutlar: .başlat | .dur | .istatistik");
});

// --- ANA MESAJ DİNLEYİCİ ---
client.on("messageCreate", async (message) => {
    const content = message.content ? message.content.toLowerCase() : "";

    // 1. 🛡️ KRİTİK DM KORUMASI (Gizli Captcha)
    if (message.channel.type === 'DM' && message.author.id === '408785106942164992') {
        calisiyorMu = false;
        clearTimeout(anaTimer);
        console.log("🛑 OWO DM ATTI! SİSTEM GÜVENLİK İÇİN DURDURULDU.");

        try {
            const sahip = await client.users.fetch(SAHIP_ID);
            return sahip.send("🚨 **DİKKAT:** OwO sana DM gönderdi! Ban yememen için botu durdurdum. Lütfen hemen kontrol et.");
        } catch (e) { console.log("Sahibe DM gönderilemedi."); }
        return;
    }

    // 2. 🤖 OWO BOTU TAKİBİ (Captcha & İstatistik)
    if (message.author.id === '408785106942164992') {
        // Captcha Kontrolü
        const dogrulamaVarMi = content.includes("verify") || content.includes("captcha") || 
                               message.attachments.size > 0 || message.components.length > 0;

        if (dogrulamaVarMi) {
            calisiyorMu = false;
            clearTimeout(anaTimer);
            console.log("🛑 KANALDA CAPTCHA BELİRDİ! DURDURULDU.");
            const sahip = await client.users.fetch(SAHIP_ID);
            return sahip.send("🚨 **CAPTCHA UYARISI:** Kanalda doğrulama çıktı! Bot durduruldu.");
        }

        // Hayvan ve Para Takibi
        if (content.includes("you found")) {
            for (let nadirlik in hayvanListesi) {
                hayvanListesi[nadirlik].forEach(hayvan => {
                    if (content.includes(hayvan)) {
                        istatistik[nadirlik]++;
                        istatistik.toplamPara += fiyatlar[nadirlik];
                    }
                });
            }
        }
    }

    // 3. 👑 SAHİP KOMUTLARI
    if (message.author.id !== SAHIP_ID) return;

    if (message.content === ".başlat") {
        if (calisiyorMu) return message.reply("Bot zaten aktif.");
        calisiyorMu = true;
        message.reply("✅ Çoklu kanal ve DM koruma moduyla otomasyon başlatıldı.");
        message.channel.send("owo pray");
        baslatGelismişOtomasyon();
    }

    if (message.content === ".dur") {
        calisiyorMu = false;
        clearTimeout(anaTimer);
        message.reply("🛑 Otomasyon tamamen kapatıldı.");
    }

    if (message.content === ".zoo") {
        let rapor = "**📊 GÜNCEL AV İSTATİSTİKLERİ**\n";
        for (let r in fiyatlar) {
            rapor += `🔹 **${r}**: ${istatistik[r]} adet (${istatistik[r] * fiyatlar[r]} 💰)\n`;
        }
        rapor += `\n💰 **TOPLAM KAZANÇ:** ${istatistik.toplamPara} Cowoncy`;
        message.reply(rapor);
    }
});

// --- 🧠 GELİŞMİŞ ŞAŞIRTMA VE OTOMASYON ---
function yazimHatasiYap(komut) {
    const hatalar = ["ow h", "owo hht", "owo bbb", "oow b", "Owo h", "owob"];
    // %15 ihtimalle yanlış yazarak botu taklit etmeyi zorlaştırır
    return Math.random() < 0.15 ? hatalar[Math.floor(Math.random() * hatalar.length)] : komut;
}

function baslatGelismişOtomasyon() {
    if (!calisiyorMu) return;

    // 3 kanaldan birini rastgele seçerek spamı dağıt
    const secilenKanalID = KANAL_IDLERI[Math.floor(Math.random() * KANAL_IDLERI.length)];
    const kanal = client.channels.cache.get(secilenKanalID);
    if (!kanal) return;

    // 1. Ana Komut
    kanal.send(Math.random() < 0.2 ? "Owo" : "OwO");

    // 2. owo h (4-7 sn arası rastgele)
    setTimeout(() => {
        if (calisiyorMu) kanal.send(yazimHatasiYap("owo h"));
    }, Math.floor(Math.random() * 3000) + 4000);

    // 3. owo b (8-11 sn arası rastgele)
    setTimeout(() => {
        if (calisiyorMu) kanal.send(yazimHatasiYap("owo b"));
    }, Math.floor(Math.random() * 3000) + 8000);

    // 4. Farklı Kanala Rastgele Öğüt Atma (Şaşırtma)
    setTimeout(() => {
        if (calisiyorMu) {
            const ogutID = KANAL_IDLERI[Math.floor(Math.random() * KANAL_IDLERI.length)];
            const ogutKanal = client.channels.cache.get(ogutID);
            const ogut = ogutler[Math.floor(Math.random() * ogutler.length)];
            if (ogutKanal) ogutKanal.send(ogut);
        }
    }, Math.floor(Math.random() * 5000) + 12000);

    // 5. Rastgele Pray (%10 Şans)
    if (Math.random() < 0.1) {
        setTimeout(() => {
            if (calisiyorMu) kanal.send("owo pray");
        }, 15000);
    }

    // Ana Döngü: 25-45 saniye arası rastgele bir sonraki tur
    const sonraki = Math.floor(Math.random() * 15000) + 15000;
    anaTimer = setTimeout(baslatGelismişOtomasyon, sonraki);
}

client.login(process.env.TOKEN);
