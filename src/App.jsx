import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, BookOpen, GraduationCap, User, PlayCircle, Bookmark, Star, Moon, 
  ArrowRight, Mail, Lock, Eye, EyeOff, Clock, ChevronDown, ChevronUp, MapPin, 
  Loader2, ArrowLeft, RotateCcw, CheckCircle, Heart, Flame, Diamond, Volume2, 
  X, RefreshCw, MessageSquare, Sparkles, Send, Info, CloudSun, Wind, Quote, 
  Trophy, Compass, Settings, Bell, LogOut, Award, Edit3, Calendar, Crown, Coffee, Gift, Zap, ShieldCheck, UserPlus, LogIn
} from 'lucide-react';

// ============================================================================================
// 1. AYARLAR VE YARDIMCI FONKSİYONLAR
// ============================================================================================

const apiKey = ""; // API anahtarı

const callGemini = async (prompt, systemInstruction = "") => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`API Hatası: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Şu an cevap veremiyorum.";
  } catch (error) {
    console.warn("Gemini API Hatası:", error);
    return "Bağlantı hatası oluştu.";
  }
};

const globalStyles = `
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  .islamic-pattern {
      background-color: #047857;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23065f46' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  @keyframes fade-in-up {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.3s ease-out forwards;
  }
`;

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ============================================================================================
// 2. VERİ TABANI (GENİŞLETİLMİŞ HADİS LİSTESİ)
// ============================================================================================

const HADITHS_DATABASE = [
  { text: "Ameller niyetlere göredir.", source: "Buhari" },
  { text: "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.", source: "Buhari" },
  { text: "Sizin en hayırlınız, Kuran'ı öğrenen ve öğretendir.", source: "Tirmizi" },
  { text: "Temizlik imanın yarısıdır.", source: "Müslim" },
  { text: "Namaz dinin direğidir.", source: "Tirmizi" },
  { text: "Cennet annelerin ayakları altındadır.", source: "Nesai" },
  { text: "Müslüman, elinden ve dilinden diğer Müslümanların emin olduğu kimsedir.", source: "Buhari" },
  { text: "Hayra vesile olan, hayrı yapan gibidir.", source: "Tirmizi" },
  { text: "İki günü eşit olan ziyandadır.", source: "Hadis-i Şerif" },
  { text: "Güzel söz sadakadır.", source: "Buhari" },
  { text: "Komşusu açken tok yatan bizden değildir.", source: "Hakim" },
  { text: "İlim Çin'de de olsa gidip alınız.", source: "Taberani" },
  { text: "Veren el, alan elden üstündür.", source: "Buhari" },
  { text: "Hiçbir baba, çocuğuna güzel terbiyeden daha kıymetli bir miras bırakmamıştır.", source: "Tirmizi" },
  { text: "Merhamet etmeyene merhamet olunmaz.", source: "Buhari" },
  { text: "Tebessüm sadakadır.", source: "Tirmizi" },
  { text: "Kim bir hayır işlerse, kendisine onun on misli vardır.", source: "En'am Suresi" },
  { text: "Dua müminin silahıdır.", source: "Hakim" },
  { text: "Sabır, kurtuluşun anahtarıdır.", source: "Hadis-i Şerif" },
  { text: "Öfke şeytandandır.", source: "Ebu Davud" },
  { text: "Kişi sevdiği ile beraberdir.", source: "Buhari" },
  { text: "Hediyeleşin, birbirinizi sevin.", source: "Buhari" },
  { text: "Mümin, bir delikten iki defa ısırılmaz.", source: "Buhari" },
  { text: "Haset, ateşin odunu yediği gibi iyilikleri yer bitirir.", source: "Ebu Davud" },
  { text: "İnsanların en hayırlısı, insanlara faydalı olandır.", source: "Taberani" },
  { text: "Bizi aldatan bizden değildir.", source: "Müslim" },
  { text: "Zenginlik mal çokluğu değil, gönül tokluğudur.", source: "Buhari" },
  { text: "Doğruluk iyiliğe, iyilik cennete götürür.", source: "Buhari" },
  { text: "Yalan kötülüğe, kötülük cehenneme götürür.", source: "Buhari" },
  { text: "İşçinin hakkını alnının teri kurumadan veriniz.", source: "İbn Mace" },
  { text: "Mazlumun bedduasından sakının.", source: "Buhari" },
  { text: "Her zorlukla beraber bir kolaylık vardır.", source: "İnşirah Suresi" },
  { text: "Allah güzeldir, güzelliği sever.", source: "Müslim" },
  { text: "Sıla-i rahim (akraba ziyareti) ömrü uzatır.", source: "Tirmizi" },
  { text: "Kim susarsa kurtulur.", source: "Tirmizi" },
  { text: "Utanmadıktan sonra dilediğini yap.", source: "Buhari" },
  { text: "Acele şeytandan, teenni Allah'tandır.", source: "Tirmizi" },
  { text: "Dünya müminin zindanı, kafirin cennetidir.", source: "Müslim" },
  { text: "İlim öğrenmek her Müslüman erkek ve kadına farzdır.", source: "İbn Mace" },
  { text: "Beşikten mezara kadar ilim öğreniniz.", source: "Hadis-i Şerif" },
  { text: "Müminlerin iman bakımından en mükemmeli, ahlakı en güzel olanıdır.", source: "Tirmizi" },
  { text: "Kim Allah'a ve ahiret gününe inanıyorsa ya hayır söylesin ya da sussun.", source: "Buhari" },
  { text: "Müslüman müslümanın kardeşidir. Ona zulmetmez.", source: "Buhari" },
  { text: "Kim bir müslümanın sıkıntısını giderirse, Allah da onun sıkıntısını giderir.", source: "Müslim" },
  { text: "Allah, yumuşak huylu kimseleri sever.", source: "Müslim" },
  { text: "Sadaka verin, hastalarınızı sadaka ile tedavi edin.", source: "Taberani" },
  { text: "Hata yapanların en hayırlısı tövbe edenlerdir.", source: "Tirmizi" },
  { text: "Allah'ın rızası anne babanın rızasındadır.", source: "Tirmizi" },
  { text: "Cemaatte rahmet, ayrılıkta azap vardır.", source: "Hadis-i Şerif" },
  { text: "Bir saat tefekkür, bir sene nafile ibadetten hayırlıdır.", source: "Hadis-i Şerif" },
  { text: "Yarım hurma ile de olsa kendinizi ateşten koruyun.", source: "Buhari" },
  { text: "İnsanlara merhamet etmeyene Allah merhamet etmez.", source: "Müslim" },
  { text: "Gıybet, kardeşinin ölü etini yemek gibidir.", source: "Hucurat Suresi" },
  { text: "Söz taşıyan cennete giremez.", source: "Buhari" },
  { text: "Kuran okuyunuz. O, sahibine şefaatçi olacaktır.", source: "Müslim" },
  { text: "Sizin en hayırlınız, ailesine karşı en hayırlı olandır.", source: "Tirmizi" },
  { text: "Allah temizdir, temizliği sever.", source: "Tirmizi" },
  { text: "Namazın anahtarı temizliktir.", source: "Tirmizi" },
  { text: "Suizandan sakının.", source: "Buhari" },
  { text: "Birbirinizin kusurlarını araştırmayın.", source: "Hucurat Suresi" },
  { text: "Birbirinize haset etmeyin.", source: "Müslim" },
  { text: "Birbirinize sırt çevirmeyin.", source: "Müslim" },
  { text: "Ey Allah'ın kulları! Kardeş olun.", source: "Müslim" },
  { text: "Kim bir hayra öncülük ederse, o hayrı yapanın ecri gibi alır.", source: "Müslim" },
  { text: "Allah katında amellerin en sevimlisi, az da olsa devamlı olanıdır.", source: "Buhari" },
  { text: "İki nimet vardır: Sağlık ve boş vakit.", source: "Buhari" },
  { text: "Hastalık gelmeden önce sağlığın kıymetini bil.", source: "Hakim" },
  { text: "Kibir, hakkı inkar etmek ve insanları küçük görmektir.", source: "Müslim" },
  { text: "Kalbinde zerre kadar kibir olan cennete giremez.", source: "Müslim" },
  { text: "Tevazu göstereni Allah yüceltir.", source: "Müslim" },
  { text: "Sadaka malı eksiltmez.", source: "Müslim" },
  { text: "Affedenin izzeti artar.", source: "Müslim" },
  { text: "Rızkın onda dokuzu ticarettendir.", source: "Hadis-i Şerif" },
  { text: "Helal belli, haram bellidir.", source: "Buhari" },
  { text: "Şüpheli şeylerden sakınan dinini korur.", source: "Buhari" },
  { text: "Her doğan, İslam fıtratı üzerine doğar.", source: "Buhari" },
  { text: "Müminler, bir vücudun azaları gibidir.", source: "Müslim" },
  { text: "Haya imandandır.", source: "Buhari" },
  { text: "Mümin, rüzgar estikçe eğilen ekin gibidir, yıkılmaz.", source: "Buhari" },
  { text: "Münafığın alameti üçtür: Yalan söyler, sözünde durmaz, emanete hıyanet eder.", source: "Buhari" },
  { text: "Allah sizin kalplerinize bakar.", source: "Müslim" },
  { text: "Ameller sonuçlarına göre değerlendirilir.", source: "Buhari" },
  { text: "Kişi arkadaşının dini üzerinedir.", source: "Tirmizi" },
  { text: "İyi arkadaş misk taşıyan gibidir.", source: "Buhari" },
  { text: "Danışan pişman olmaz.", source: "Taberani" },
  { text: "Namaz gözümün nurudur.", source: "Nesai" },
  { text: "Oruç kalkandır.", source: "Buhari" },
  { text: "Dua ibadetin özüdür.", source: "Tirmizi" },
  { text: "Allah ısrarla dua edenleri sever.", source: "Beyhaki" },
  { text: "Acele etmediğiniz sürece duanız kabul olunur.", source: "Buhari" },
  { text: "Cennet cömertler yurdudur.", source: "Deylemi" },
  { text: "Cimri Allah'a uzak, cehenneme yakındır.", source: "Tirmizi" },
  { text: "Sadaka belayı defeder.", source: "Tirmizi" },
  { text: "Gülümsemek sadakadır.", source: "Tirmizi" },
  { text: "İlim müminin yitik malıdır.", source: "Tirmizi" },
  { text: "Hikmet müminin yitik malıdır.", source: "Tirmizi" },
  { text: "Alimler peygamberlerin varisleridir.", source: "Tirmizi" },
  { text: "Faydasız ilimden Allah'a sığınırım.", source: "Müslim" },
  { text: "Allah'ım ilmimi artır.", source: "Taha Suresi" },
  { text: "Kur'an'ı sesinizle süsleyin.", source: "Ebu Davud" },
  { text: "Evlerinizi kabirlere çevirmeyin.", source: "Müslim" },
  { text: "Yasin, Kur'an'ın kalbidir.", source: "Tirmizi" },
  { text: "Fatiha her derde şifadır.", source: "Darimi" },
  { text: "Namazın ilk vakti Allah'ın rızasıdır.", source: "Tirmizi" },
  { text: "Kulun Rabbine en yakın olduğu an secde anıdır.", source: "Müslim" },
  { text: "Namaz müminin miracıdır.", source: "Hadis-i Şerif" },
  { text: "Namaz cennetin anahtarıdır.", source: "Tirmizi" },
  { text: "Mümin müminin aynasıdır.", source: "Ebu Davud" },
  { text: "Din samimiyettir.", source: "Müslim" },
  { text: "İslam güzel ahlaktır.", source: "Kenzu'l-Ummal" },
  { text: "Dünya sevgisi her hatanın başıdır.", source: "Beyhaki" },
  { text: "Kanaat tükenmez bir hazinedir.", source: "Taberani" },
  { text: "Tedbir gibi akıl yoktur.", source: "İbn Mace" },
  { text: "Güzel ahlak gibi asalet yoktur.", source: "İbn Mace" },
  { text: "Ticarette bereket vardır.", source: "Müslim" },
  { text: "Uyku ölümün kardeşidir.", source: "Beyhaki" },
  { text: "Lezzetleri yıkan ölümü çokça hatırlayın.", source: "Tirmizi" },
  { text: "Nasıl yaşarsanız öyle ölürsünüz.", source: "Hadis-i Şerif" },
  { text: "Kişi sevdiği ile haşrolunur.", source: "Taberani" },
  { text: "Allah'ım beni bağışla ve merhamet et.", source: "Müslim" },
  { text: "Rabbimiz bize dünyada ve ahirette iyilik ver.", source: "Bakara Suresi" },
  { text: "Zulüm, kıyamet günü karanlıktır.", source: "Buhari" },
  { text: "İyilik, yüzü güldürür, kalbi ferahlatır.", source: "İbn Abbas" },
  { text: "En hayırlı ev, içinde yetime iyilik yapılan evdir.", source: "İbn Mace" },
  { text: "Sabır, imanın yarısıdır.", source: "Ebu Nuaym" },
  { text: "Şükür, imanın yarısıdır.", source: "Ebu Nuaym" },
  { text: "Dua, rahmet kapılarını açar.", source: "Tirmizi" },
  { text: "Sadaka ömrü uzatır.", source: "Taberani" },
  { text: "Sıla-i rahim, rızkı bollaştırır.", source: "Buhari" },
  { text: "Anne babasına iyilik edenin ömrü bereketli olur.", source: "Tirmizi" },
  { text: "Cennet cömertlerin yurdudur.", source: "Taberani" },
  { text: "Tevazu, kişiyi yüceltir.", source: "Müslim" },
  { text: "Kibir, insanı alçaltır.", source: "Müslim" },
  { text: "Öfke, imanı bozar.", source: "Beyhaki" },
  { text: "Haset, iyilikleri yakar.", source: "Ebu Davud" },
  { text: "Yalan, rızkı azaltır.", source: "Müslim" },
  { text: "Doğruluk, kalbe huzur verir.", source: "Tirmizi" },
  { text: "Emanete ihanet nifak alametidir.", source: "Buhari" },
  { text: "Sözünde durmak imandandır.", source: "Müslim" },
  { text: "İlim, rütbelerin en yücesidir.", source: "Hz. Ali" },
  { text: "Cahillik, en büyük fakirliktir.", source: "Hz. Ali" },
  { text: "Akıl, en büyük zenginliktir.", source: "Hz. Ali" },
  { text: "Güzel ahlak, en iyi dosttur.", source: "Hz. Ali" },
  { text: "İstişare, başarının anahtarıdır.", source: "Hz. Ali" },
  { text: "Sabır, zaferin ilk adımıdır.", source: "Hz. Ali" },
  { text: "Adalet, mülkün temelidir.", source: "Hz. Ömer" },
  { text: "İyilik yap, karşılık bekleme.", source: "Hz. Ali" },
  { text: "Merhamet, kalbin cilasıdır.", source: "Hz. Mevlana" },
  { text: "Sevgi, her derdin ilacıdır.", source: "Hz. Mevlana" },
  { text: "Dostluk, en büyük hazinedir.", source: "Hz. Ali" },
  { text: "Kardeşlik, zor günde belli olur.", source: "Atasözü" },
  { text: "Birlik, güçtür.", source: "Atasözü" },
  { text: "Ayrılık, azaptır.", source: "Hadis-i Şerif" },
  { text: "Barış, en büyük nimettir.", source: "Hadis-i Şerif" },
  { text: "Selam, sevginin anahtarıdır.", source: "Müslim" },
  { text: "Teşekkür, nimetin artmasına vesiledir.", source: "İbrahim Suresi" },
  { text: "Hamd, her işin başıdır.", source: "Ebu Davud" },
  { text: "Tövbe, günahları siler.", source: "İbn Mace" },
  { text: "İstiğfar, rızkı açar.", source: "Ebu Davud" },
  { text: "Zikir, kalbi diriltir.", source: "Tirmizi" },
  { text: "Kuran, ruhun gıdasıdır.", source: "Hadis-i Şerif" },
  { text: "Namaz, kalbin nurudur.", source: "Müslim" },
  { text: "Oruç, bedenin zekatıdır.", source: "İbn Mace" },
  { text: "Hac, mahşerin provasıdır.", source: "Hadis-i Şerif" },
  { text: "Zekat, malı temizler.", source: "Tirmizi" },
  { text: "Sadaka, Allah'ın gazabını söndürür.", source: "Tirmizi" },
  { text: "İyilik, ömrü uzatır.", source: "Tirmizi" },
  { text: "Kötülük, sahibine döner.", source: "Fatır Suresi" },
  { text: "Sabreden zafere erer.", source: "Atasözü" },
  { text: "Çalışan kazanır.", source: "Atasözü" },
  { text: "Emek olmadan yemek olmaz.", source: "Atasözü" },
  { text: "İlim, müminin yitiğidir.", source: "Tirmizi" },
  { text: "Hikmet, müminin süsüdür.", source: "Hadis-i Şerif" },
  { text: "Edep, aklın dış görünüşüdür.", source: "Hz. Mevlana" },
  { text: "Haya, imanın süsüdür.", source: "Müslim" },
  { text: "Vefa, imandandır.", source: "Müslim" },
  { text: "Ahde vefa, dinin direğidir.", source: "Müslim" },
  { text: "Söz gümüşse sükut altındır.", source: "Atasözü" },
  { text: "Dilin kemiği yoktur ama kemik kırar.", source: "Atasözü" },
  { text: "Tatlı dil yılanı deliğinden çıkarır.", source: "Atasözü" },
  { text: "Kalp kırma, Allah'ı incitirsin.", source: "Yunus Emre" },
  { text: "Yaratılanı hoş gör, Yaratandan ötürü.", source: "Yunus Emre" },
  { text: "Sevelim, sevilelim, dünya kimseye kalmaz.", source: "Yunus Emre" },
  { text: "İlim ilim bilmektir, ilim kendin bilmektir.", source: "Yunus Emre" },
  { text: "Bana bir harf öğretenin kırk yıl kölesi olurum.", source: "Hz. Ali" },
  { text: "İlim, servetten hayırlıdır. İlim seni korur, serveti sen korursun.", source: "Hz. Ali" },
  { text: "Cömertlik, cennet ağaçlarından bir ağaçtır.", source: "Hadis-i Şerif" },
  { text: "Cimrilik, cehennem ağaçlarından bir ağaçtır.", source: "Hadis-i Şerif" }
];

const ALPHABET = [
  { id: 1, char: "ا", name: "Elif", latin: "", group: 1, isThick: false },
  { id: 2, char: "ب", name: "Be", latin: "B", group: 1, isThick: false },
  { id: 3, char: "ت", name: "Te", latin: "T", group: 1, isThick: false },
  { id: 4, char: "ث", name: "Se", latin: "S", group: 1, isThick: false },
  { id: 5, char: "ج", name: "Cim", latin: "C", group: 1, isThick: false },
  { id: 6, char: "ح", name: "Ha", latin: "H", group: 2, isThick: false },
  { id: 7, char: "خ", name: "Hı", latin: "H", group: 2, isThick: true },
  { id: 8, char: "د", name: "Dal", latin: "D", group: 2, isThick: false },
  { id: 9, char: "ذ", name: "Zel", latin: "Z", group: 2, isThick: false },
  { id: 10, char: "ر", name: "Ra", latin: "R", group: 2, isThick: false },
  { id: 11, char: "ز", name: "Ze", latin: "Z", group: 3, isThick: false },
  { id: 12, char: "س", name: "Sin", latin: "S", group: 3, isThick: false },
  { id: 13, char: "ش", name: "Şın", latin: "Ş", group: 3, isThick: false },
  { id: 14, char: "ص", name: "Sad", latin: "S", group: 3, isThick: true },
  { id: 15, char: "ض", name: "Dad", latin: "D", group: 3, isThick: true },
  { id: 16, char: "ط", name: "Tı", latin: "T", group: 4, isThick: true },
  { id: 17, char: "ظ", name: "Zı", latin: "Z", group: 4, isThick: true },
  { id: 18, char: "ع", name: "Ayn", latin: "", group: 4, isThick: false }, 
  { id: 19, char: "غ", name: "Gayn", latin: "Ğ", group: 4, isThick: true },
  { id: 20, char: "ف", name: "Fe", latin: "F", group: 4, isThick: false },
  { id: 21, char: "ق", name: "Kaf", latin: "K", group: 5, isThick: true },
  { id: 22, char: "ك", name: "Kef", latin: "K", group: 5, isThick: false },
  { id: 23, char: "ل", name: "Lam", latin: "L", group: 5, isThick: false },
  { id: 24, char: "م", name: "Mim", latin: "M", group: 5, isThick: false },
  { id: 25, char: "ن", name: "Nun", latin: "N", group: 6, isThick: false },
  { id: 26, char: "و", name: "Vav", latin: "V", group: 6, isThick: false },
  { id: 27, char: "ه", name: "He", latin: "H", group: 6, isThick: false },
  { id: 28, char: "ي", name: "Ye", latin: "Y", group: 6, isThick: false }
];

const WORDS_DATABASE = {
    easy: [
        { id: 'w1', arabic: 'أَبَ', reading: 'Ebe' },
        { id: 'w2', arabic: 'أَخَ', reading: 'Eha' },
        { id: 'w3', arabic: 'بَدَ', reading: 'Bede' },
        { id: 'w4', arabic: 'زَرَ', reading: 'Zera' },
        { id: 'w5', arabic: 'رَبَ', reading: 'Rabe' },
        { id: 'w6', arabic: 'كَتَبَ', reading: 'Ketebe' },
        { id: 'w7', arabic: 'ذَهَبَ', reading: 'Zehebe' },
        { id: 'w8', arabic: 'خَرَجَ', reading: 'Harace' },
        { id: 'w9', arabic: 'سَجَدَ', reading: 'Secede' },
        { id: 'w10', arabic: 'قَرَأَ', reading: 'Karae' }
    ],
    hard: [
        { id: 'w11', arabic: 'مَسْجِدُ', reading: 'Mescidu' },
        { id: 'w12', arabic: 'كِتَابٌ', reading: 'Kitabun' },
        { id: 'w13', arabic: 'مَدْرَسَةٌ', reading: 'Medresetun' },
        { id: 'w14', arabic: 'قَلَمٌ', reading: 'Kalemun' },
        { id: 'w15', arabic: 'شَمْسٌ', reading: 'Şemsun' },
        { id: 'w16', arabic: 'قَمَرٌ', reading: 'Kamerun' },
        { id: 'w17', arabic: 'بَيْتٌ', reading: 'Beytun' },
        { id: 'w18', arabic: 'وَلَدٌ', reading: 'Veledun' }
    ]
};

const PRAYERS_DATABASE = [
    { id: 'p1', arabic: 'سُبْحَانَ الله', reading: 'Subhanallah' },
    { id: 'p2', arabic: 'الْحَمْدُ لِلَّه', reading: 'Elhamdulillah' },
    { id: 'p3', arabic: 'اللهُ أَكْبَر', reading: 'Allahu Ekber' },
    { id: 'p4', arabic: 'بِسْمِ الله', reading: 'Bismillah' },
    { id: 'p5', arabic: 'آَمِين', reading: 'Amin' },
    { id: 'p6', arabic: 'مَاشَاءَ الله', reading: 'Maşallah' },
    { id: 'p7', arabic: 'إِنْ شَاءَ الله', reading: 'İnşallah' },
    { id: 'p8', arabic: 'جَزَاكَ اللهُ خَيْرًا', reading: 'Cezakallahu Hayran' },
    { id: 'p9', arabic: 'اَلسَّلَامُ عَلَيْكُمْ', reading: 'Esselamu Aleyküm' },
    { id: 'p10', arabic: 'وَعَلَيْكُمُ السَّلَام', reading: 'Ve Aleyküm Selam' }
];

const CURRICULUM = [
  { 
    id: 1, 
    title: "1. Ünite: Harfleri Öğreniyorum", 
    desc: "Kuran alfabesindeki 28 harfi tanıyalım.", 
    color: "bg-emerald-600", 
    levels: [
        { id: 'u1_l1', type: "letters", group: 1, label: "Elif - Cim" },
        { id: 'u1_l2', type: "letters", group: 2, label: "Ha - Ra" },
        { id: 'u1_l3', type: "letters", group: 3, label: "Ze - Dad" },
        { id: 'u1_l4', type: "letters", group: 4, label: "Tı - Fe" },
        { id: 'u1_l5', type: "letters", group: 5, label: "Kaf - Mim" },
        { id: 'u1_l6', type: "letters", group: 6, label: "Nun - Ye" },
        { id: 'u1_quiz', type: "quiz_unit1", label: "1. Ünite Sınavı" },
    ]
  },
  { 
    id: 2, 
    title: "2. Ünite: Harf Konumları", 
    desc: "Harflerin kelime içindeki şekillerini öğrenelim.", 
    color: "bg-cyan-600", 
    levels: [
        { id: 'u2_l1', type: "position_group", group: 1, label: "Konumlar: Elif - Cim" },
        { id: 'u2_l2', type: "position_group", group: 2, label: "Konumlar: Ha - Ra" },
        { id: 'u2_l3', type: "position_group", group: 3, label: "Konumlar: Ze - Dad" },
        { id: 'u2_l4', type: "position_group", group: 4, label: "Konumlar: Tı - Fe" },
        { id: 'u2_l5', type: "position_group", group: 5, label: "Konumlar: Kaf - Mim" },
        { id: 'u2_l6', type: "position_group", group: 6, label: "Konumlar: Nun - Ye" },
        { id: 'u2_quiz', type: "quiz_unit2", label: "2. Ünite Sınavı" },
    ]
  },
  { 
    id: 3, 
    title: "3. Ünite: Harekeler", 
    desc: "Harfleri okumaya başlayalım.", 
    color: "bg-teal-600", 
    levels: [
        { id: 'u3_l1', type: "hareke_group", group: 1, label: "Harekeler: Elif - Cim" },
        { id: 'u3_l2', type: "hareke_group", group: 2, label: "Harekeler: Ha - Ra" },
        { id: 'u3_l3', type: "hareke_group", group: 3, label: "Harekeler: Ze - Dad" },
        { id: 'u3_l4', type: "hareke_group", group: 4, label: "Harekeler: Tı - Fe" },
        { id: 'u3_l5', type: "hareke_group", group: 5, label: "Harekeler: Kaf - Mim" },
        { id: 'u3_l6', type: "hareke_group", group: 6, label: "Harekeler: Nun - Ye" },
        { id: 'u3_quiz', type: "quiz_unit3", label: "3. Ünite Sınavı" },
    ]
  },
  {
    id: 4,
    title: "4. Ünite: Basit Birleşimler",
    desc: "Harfleri birleştirip kelimeler oluşturalım.",
    color: "bg-indigo-600",
    levels: [
        { id: 'u4_l1', type: "combination_easy", subType: '2letter', label: "2 Harfli Kelimeler" },
        { id: 'u4_l2', type: "combination_easy", subType: '3letter', label: "3 Harfli Kelimeler" },
        { id: 'u4_l3', type: "combination_easy", subType: 'mixed', label: "Karışık Pratik 1" },
        { id: 'u4_l4', type: "combination_easy", subType: 'mixed', label: "Karışık Pratik 2" },
        { id: 'u4_l5', type: "combination_easy", subType: 'mixed', label: "Karışık Pratik 3" },
        { id: 'u4_quiz', type: "quiz_unit4", label: "4. Ünite Sınavı" },
    ]
  },
  {
    id: 5,
    title: "5. Ünite: İleri Birleşimler",
    desc: "Daha uzun ve zorlu kelimeleri okuyalım.",
    color: "bg-violet-600",
    levels: [
        { id: 'u5_l1', type: "combination_hard", label: "Uzun Kelimeler 1" },
        { id: 'u5_l2', type: "combination_hard", label: "Uzun Kelimeler 2" },
        { id: 'u5_l3', type: "combination_hard", label: "Uzun Kelimeler 3" },
        { id: 'u5_l4', type: "combination_hard", label: "Zorlu Okuma" },
        { id: 'u5_quiz', type: "quiz_unit5", label: "5. Ünite Sınavı" },
    ]
  },
  {
    id: 6,
    title: "6. Ünite: Kısa Dualar",
    desc: "Günlük zikir ve duaları öğrenelim.",
    color: "bg-pink-600",
    levels: [
        { id: 'u6_l1', type: "prayers_common", label: "Günlük Zikirler" },
        { id: 'u6_l2', type: "prayers_common", label: "Kısa İfadeler" },
        { id: 'u6_quiz', type: "quiz_unit6", label: "6. Ünite Sınavı" },
    ]
  }
];

// --- 3. DERS OLUŞTURUCU MANTIĞI ---

const generateLesson = (levelConfig) => {
  let questions = [];
  let lessonTitle = "";
  let lettersInUnit = []; 
  
  if (levelConfig.type === 'combination_easy' || levelConfig.type === 'combination_hard') {
      lessonTitle = levelConfig.label;
      let wordPool = (levelConfig.type === 'combination_easy') ? [...WORDS_DATABASE.easy] : [...WORDS_DATABASE.hard];
      const selectedWords = wordPool.sort(() => 0.5 - Math.random()).slice(0, 5);
      selectedWords.forEach(word => {
          const distractors = wordPool.filter(w => w.id !== word.id).sort(() => 0.5 - Math.random()).slice(0, 3).map(w => ({ id: w.id, text: w.reading, isTextAnswer: true }));
          const correctOption = { id: word.id, text: word.reading, isTextAnswer: true };
          const options = [correctOption, ...distractors].sort(() => 0.5 - Math.random());
          questions.push({ id: `w_${word.id}`, type: "visual_match_rev", prompt: "Bu kelime nasıl okunur?", correctId: word.id, mainVisual: word.arabic, options: options });
      });
      return { id: levelConfig.id, title: lessonTitle, levelInfo: levelConfig, letters: [], questions: questions };
  }

  if (levelConfig.type === 'prayers_common') {
      lessonTitle = levelConfig.label;
      const pool = PRAYERS_DATABASE; 
      const selectedPrayers = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);
      selectedPrayers.forEach(prayer => {
          const distractors = pool.filter(p => p.id !== prayer.id).sort(() => 0.5 - Math.random()).slice(0, 3).map(p => ({ id: p.id, text: p.reading, isTextAnswer: true }));
          const correctOption = { id: prayer.id, text: prayer.reading, isTextAnswer: true };
          const options = [correctOption, ...distractors].sort(() => 0.5 - Math.random());
          questions.push({ id: `pr_${prayer.id}`, type: "visual_match_rev", prompt: "Bu ifade nasıl okunur?", correctId: prayer.id, mainVisual: prayer.arabic, options: options });
      });
      return { id: levelConfig.id, title: lessonTitle, levelInfo: levelConfig, letters: [], questions: questions };
  }

  const isQuiz = levelConfig.type.startsWith('quiz');
  if (isQuiz) {
      lessonTitle = levelConfig.label;
      const quizQuestionsCount = 10;
      const shuffledAlphabet = [...ALPHABET].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < quizQuestionsCount; i++) {
          const target = shuffledAlphabet[i % shuffledAlphabet.length];
          const distractors = ALPHABET.filter(l => l.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
          
          if (levelConfig.type === 'quiz_unit1') {
              const isReverse = Math.random() > 0.5;
              if (isReverse) {
                  const options = [target, ...distractors].sort(() => 0.5 - Math.random()).map(l => ({ id: l.id, text: l.name, isTextAnswer: true }));
                  questions.push({ id: `quiz1_${i}`, type: "visual_to_text", prompt: "Bu harfin ismi nedir?", correctId: target.id, mainVisual: target.char, options: options });
              } else {
                  const options = [target, ...distractors].sort(() => 0.5 - Math.random());
                  questions.push({ id: `quiz1_${i}`, type: "audio_match", prompt: `Hangi harf '${target.name}' sesini verir?`, correctId: target.id, letterName: target.name, letterChar: target.char, isThick: target.isThick, audioUrl: `...`, options: options });
              }
          } 
          else if (levelConfig.type === 'quiz_unit2') {
              const modes = ['start', 'middle', 'end'];
              const mode = modes[Math.floor(Math.random() * modes.length)];
              let formChar = target.char;
              let posName = "";
              if(mode === 'start') { formChar = target.char + "ـ"; posName = "Başta"; }
              else if(mode === 'middle') { formChar = "ـ" + target.char + "ـ"; posName = "Ortada"; }
              else { formChar = "ـ" + target.char; posName = "Sonda"; }
              const isReverse = Math.random() > 0.5;
              if (isReverse) {
                  const options = [target, ...distractors].sort(() => 0.5 - Math.random()).map(l => ({ id: l.id, text: l.name, isTextAnswer: true }));
                  questions.push({ id: `quiz2_${i}`, type: "visual_match_rev", prompt: `Bu şekil (${posName}) hangi harftir?`, correctId: target.id, mainVisual: formChar, options: options });
              } else {
                  const options = [target, ...distractors].sort(() => 0.5 - Math.random());
                  questions.push({ id: `quiz2_${i}`, type: "visual_match", prompt: `Bu şekil hangi harfin ${posName.toUpperCase()} halidir?`, correctId: target.id, mainVisual: formChar, options: options });
              }
          }
          else if (levelConfig.type === 'quiz_unit3') {
              const harekeTypes = [{ type: 'ustun', label: 'Üstün', sign: '\u064E' }, { type: 'esre', label: 'Esre', sign: '\u0650' }, { type: 'otre', label: 'Ötre', sign: '\u064F' }];
              const selectedHareke = harekeTypes[Math.floor(Math.random() * harekeTypes.length)];
              let vowelSound = "";
              if (selectedHareke.type === 'ustun') vowelSound = target.isThick ? "A" : "E";
              else if (selectedHareke.type === 'esre') vowelSound = target.isThick ? "I" : "İ";
              else vowelSound = target.isThick ? "U" : "Ü";
              const correctPronunciation = target.latin ? `${target.latin}${vowelSound}` : vowelSound;
              const visualChar = target.char + selectedHareke.sign;
              const isReverse = Math.random() > 0.5;
              if (isReverse) {
                  const distractor1 = ALPHABET.filter(l => l.id !== target.id)[0];
                  const visualDistractor = distractor1.char + selectedHareke.sign;
                  const wrongHareke = harekeTypes.find(h => h.type !== selectedHareke.type) || harekeTypes[0];
                  const visualDistractor2 = target.char + wrongHareke.sign;
                  const visualDistractor3 = distractor1.char + wrongHareke.sign;
                  const options = [{ id: target.id, char: visualChar }, { id: 991, char: visualDistractor }, { id: 992, char: visualDistractor2 }, { id: 993, char: visualDistractor3 }].sort(() => 0.5 - Math.random());
                  questions.push({ id: `quiz3_${i}`, type: "sound_to_visual", prompt: `"${correctPronunciation}" sesi hangisidir?`, correctId: target.id, mainVisual: null, options: options });
              } else {
                  const wrongVowel = vowelSound === "A" || vowelSound === "E" ? (target.isThick ? "U" : "Ü") : (target.isThick ? "A" : "E");
                  const wrongPronunciation = target.latin ? `${target.latin}${wrongVowel}` : wrongVowel;
                  questions.push({ id: `quiz3_${i}`, type: "hareke_match", prompt: `Bu harf ve hareke nasıl okunur?`, correctId: 1, mainVisual: visualChar, options: [{ id: 1, char: target.char, text: correctPronunciation, isTextAnswer: true }, { id: 2, char: target.char, text: wrongPronunciation, isTextAnswer: true }].sort(() => 0.5 - Math.random()) });
              }
          }
          else if (levelConfig.type === 'quiz_unit4' || levelConfig.type === 'quiz_unit5') {
              const pool = levelConfig.type === 'quiz_unit4' ? WORDS_DATABASE.easy : WORDS_DATABASE.hard;
              const targetWord = pool[Math.floor(Math.random() * pool.length)];
              const distractorWords = pool.filter(w => w.id !== targetWord.id).sort(() => 0.5 - Math.random()).slice(0, 3);
              const options = [targetWord, ...distractorWords].sort(() => 0.5 - Math.random()).map(w => ({ id: w.id, text: w.reading, isTextAnswer: true }));
              questions.push({
                  id: `quiz_${levelConfig.type}_${i}`,
                  type: "visual_match_rev",
                  prompt: "Bu kelimenin okunuşu nedir?",
                  correctId: targetWord.id,
                  mainVisual: targetWord.arabic,
                  options: options
              });
          }
          else if (levelConfig.type === 'quiz_unit6') {
              const pool = PRAYERS_DATABASE;
              const targetPrayer = pool[Math.floor(Math.random() * pool.length)];
              const distractorPrayers = pool.filter(p => p.id !== targetPrayer.id).sort(() => 0.5 - Math.random()).slice(0, 3);
              const options = [targetPrayer, ...distractorPrayers].sort(() => 0.5 - Math.random()).map(p => ({ id: p.id, text: p.reading, isTextAnswer: true }));
              questions.push({
                  id: `quiz_unit6_${i}`,
                  type: "visual_match_rev",
                  prompt: "Bu duanın okunuşu nedir?",
                  correctId: targetPrayer.id,
                  mainVisual: targetPrayer.arabic,
                  options: options
              });
          }
      }
      return { id: levelConfig.id, title: lessonTitle, levelInfo: levelConfig, letters: [], questions: questions };
  }

  if (levelConfig.type === 'letters') {
    lettersInUnit = ALPHABET.filter(l => l.group === levelConfig.group);
    lessonTitle = `${levelConfig.label} Harfleri`;
    lettersInUnit.forEach(target => {
      const otherLetters = ALPHABET.filter(l => l.id !== target.id);
      const distractors = otherLetters.sort(() => 0.5 - Math.random()).slice(0, 3);
      const isReverse = Math.random() > 0.5;
      if (isReverse) {
          const options = [target, ...distractors].sort(() => 0.5 - Math.random()).map(l => ({ id: l.id, text: l.name, isTextAnswer: true }));
          questions.push({ id: `q_${target.id}_rev`, type: "visual_to_text", prompt: `Bu harfin ismi nedir?`, correctId: target.id, mainVisual: target.char, options: options });
      } else {
          const options = [target, ...distractors].sort(() => 0.5 - Math.random());
          questions.push({ id: `q_${target.id}`, type: "audio_match", prompt: `Hangi harf '${target.name}' sesini verir?`, correctId: target.id, letterName: target.name, letterChar: target.char, isThick: target.isThick, audioUrl: `...`, options: options });
      }
    });
  } 
  else if (levelConfig.type === 'position_group') {
    lessonTitle = levelConfig.label;
    lettersInUnit = ALPHABET.filter(l => l.group === levelConfig.group);
    lettersInUnit.forEach(target => {
        let formChar = target.char;
        let questionText = "";
        let positionName = "";
        const modes = ['start', 'middle', 'end'];
        const mode = modes[Math.floor(Math.random() * modes.length)];
        if(mode === 'start') { formChar = target.char + "ـ"; questionText = "Bu şekil hangi harfin BAŞTA halidir?"; positionName = "Başta"; }
        else if(mode === 'middle') { formChar = "ـ" + target.char + "ـ"; questionText = "Bu şekil hangi harfin ORTADA halidir?"; positionName = "Ortada"; }
        else { formChar = "ـ" + target.char; questionText = "Bu şekil hangi harfin SONDA halidir?"; positionName = "Sonda"; }
        const distractors = ALPHABET.filter(l => l.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
        const isReverse = Math.random() > 0.5;
        if (isReverse) {
             const options = [target, ...distractors].sort(() => 0.5 - Math.random()).map(l => ({ id: l.id, text: l.name, isTextAnswer: true }));
            questions.push({ id: `p_${target.id}_${mode}_rev`, type: "visual_match_rev", prompt: `Bu şekil (${positionName}) hangi harftir?`, correctId: target.id, mainVisual: formChar, options: options });
        } else {
            const options = [target, ...distractors].sort(() => 0.5 - Math.random());
            questions.push({ id: `p_${target.id}_${mode}`, type: "visual_match", prompt: questionText, correctId: target.id, mainVisual: formChar, letterName: target.name, letterChar: target.char, options: options });
        }
    });
  }
  else if (levelConfig.type === 'hareke_group') {
    lessonTitle = levelConfig.label;
    lettersInUnit = ALPHABET.filter(l => l.group === levelConfig.group);
    lettersInUnit.forEach(target => {
        const harekeTypes = [{ type: 'ustun', label: 'Üstün', sign: '\u064E' }, { type: 'esre', label: 'Esre', sign: '\u0650' }, { type: 'otre', label: 'Ötre', sign: '\u064F' }];
        const selectedHareke = harekeTypes[Math.floor(Math.random() * harekeTypes.length)];
        let vowelSound = "";
        if (selectedHareke.type === 'ustun') vowelSound = target.isThick ? "A" : "E";
        else if (selectedHareke.type === 'esre') vowelSound = target.isThick ? "I" : "İ";
        else vowelSound = target.isThick ? "U" : "Ü";
        const correctPronunciation = target.latin ? `${target.latin}${vowelSound}` : vowelSound;
        const visualChar = target.char + selectedHareke.sign;
        const isReverse = Math.random() > 0.5;
        if (isReverse) {
            const distractor1 = ALPHABET.filter(l => l.id !== target.id)[0];
            const visualDistractor = distractor1.char + selectedHareke.sign; 
            const wrongHareke = harekeTypes.find(h => h.type !== selectedHareke.type) || harekeTypes[0];
            const visualDistractor2 = target.char + wrongHareke.sign;
            const visualDistractor3 = distractor1.char + wrongHareke.sign;
            const options = [{ id: target.id, char: visualChar }, { id: 991, char: visualDistractor }, { id: 992, char: visualDistractor2 }, { id: 993, char: visualDistractor3 }].sort(() => 0.5 - Math.random());
            questions.push({ id: `h_${target.id}_${selectedHareke.type}_rev`, type: "sound_to_visual", prompt: `"${correctPronunciation}" sesi hangisidir?`, correctId: target.id, mainVisual: null, options: options });
        } else {
            const wrongVowel = vowelSound === "A" || vowelSound === "E" ? (target.isThick ? "U" : "Ü") : (target.isThick ? "A" : "E");
            const wrongPronunciation = target.latin ? `${target.latin}${wrongVowel}` : wrongVowel;
            questions.push({ id: `h_${target.id}_${selectedHareke.type}`, type: "hareke_match", prompt: `Bu harf ve hareke nasıl okunur?`, correctId: 1, letterName: target.name, letterChar: target.char, isThick: target.isThick, mainVisual: visualChar, options: [{ id: 1, char: target.char, text: correctPronunciation, isTextAnswer: true }, { id: 2, char: target.char, text: wrongPronunciation, isTextAnswer: true }].sort(() => 0.5 - Math.random()) });
        }
    });
  }

  return {
    id: levelConfig.id,
    title: lessonTitle,
    levelInfo: levelConfig,
    letters: lettersInUnit,
    questions: questions.sort(() => 0.5 - Math.random())
  };
};

// ============================================================================================
// 4. YARDIMCI BİLEŞENLER
// ============================================================================================

function NavItem({ icon, isActive, onClick, label }) {
  return <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-12 transition-colors ${isActive ? 'text-[#0F5132] bg-emerald-50 rounded-full p-1' : 'text-stone-400'}`}>{icon}</button>;
}

function PrayerItem({ name, time, active }) {
    return (
        <div className={`flex flex-col items-center gap-1 px-2 ${active ? 'opacity-100 scale-110' : 'opacity-60'}`}>
            <span className="text-[10px] font-medium text-emerald-50">{name}</span>
            <span className={`text-xs font-bold ${active ? 'text-[#ffd700]' : 'text-white'}`}>{time}</span>
            {active && <div className="w-1 h-1 bg-amber-300 rounded-full mt-1"></div>}
        </div>
    );
}

function FeatureCircle({ icon, label, color, onClick }) {
    return (
        <div onClick={onClick} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm ${color} group-hover:scale-105 transition-transform`}>
                {icon}
            </div>
            <span className="text-xs font-medium text-stone-600">{label}</span>
        </div>
    );
}

function CategoryCard({ icon, title, subtitle, color, onClick }) {
  return (
    <div onClick={onClick} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer active:scale-95">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>{icon}</div>
      <div><h4 className="font-bold text-stone-800 text-md">{title}</h4><p className="text-xs text-stone-500 mt-0.5 font-medium">{subtitle}</p></div>
    </div>
  );
}

function PrayerTimeRow({ name, time, isActive }) {
    return (
        <div className={`flex items-center justify-between p-2 rounded-lg ${isActive ? 'bg-indigo-50' : 'hover:bg-stone-50'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-600' : 'bg-stone-200'}`}></div>
                <span className={`text-sm font-medium ${isActive ? 'text-indigo-900 font-bold' : 'text-stone-600'}`}>{name}</span>
            </div>
            <span className={`text-sm font-mono ${isActive ? 'text-indigo-700 font-bold' : 'text-stone-500'}`}>{time}</span>
        </div>
    );
}

function AuthModal({ onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin({
        name: isLogin ? "Kullanıcı" : name || "Yeni Öğrenci",
        level: "Başlangıç",
        joined: "Şimdi",
        avatarColor: "bg-emerald-100 text-emerald-600"
      });
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
       <div className="bg-white w-full max-w-sm rounded-3xl p-8 relative shadow-2xl animate-fade-in-up">
          <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={24} /></button>
          
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus size={32} />
             </div>
             <h2 className="text-2xl font-bold text-stone-800">{isLogin ? "Tekrar Hoşgeldin!" : "Aramıza Katıl"}</h2>
             <p className="text-sm text-stone-500 mt-1">{isLogin ? "Kaldığın yerden devam et." : "Kuran öğrenme yolculuğuna başla."}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             {!isLogin && (
                <div>
                   <label className="text-xs font-bold text-stone-500 ml-1">İsim</label>
                   <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Adın" />
                </div>
             )}
             <div>
                <label className="text-xs font-bold text-stone-500 ml-1">E-posta</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="ornek@mail.com" />
             </div>
             <div>
                <label className="text-xs font-bold text-stone-500 ml-1">Şifre</label>
                <input type="password" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="••••••" />
             </div>

             <button disabled={loading} className="w-full bg-[#0F5132] hover:bg-[#0a3622] text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6">
                {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
             </button>
          </form>

          <div className="mt-6 text-center">
             <p className="text-sm text-stone-500">
                {isLogin ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
                <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-[#0F5132] hover:underline">
                   {isLogin ? "Kayıt Ol" : "Giriş Yap"}
                </button>
             </p>
          </div>
       </div>
    </div>
  );
}

// ============================================================================================
// 5. EKRAN BİLEŞENLERİ
// ============================================================================================

function SplashScreen() {
  return (
    <div className="h-full w-full islamic-pattern flex flex-col items-center justify-center text-white relative">
      <div className="flex flex-col items-center z-10 animate-bounce">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-full border-2 border-[#20c997]">
            <BookOpen size={64} className="text-[#20c997]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 mt-6 font-serif text-[#ffd700] drop-shadow-md text-center px-4">
          Kuran-ı Kerim'i Öğreniyorum
        </h1>
        <p className="text-emerald-100 opacity-90 text-sm tracking-[0.2em] uppercase">Modern İslami Yaşam</p>
      </div>
      <div className="mt-12 flex flex-col items-center gap-2">
        <Loader2 size={32} className="animate-spin text-[#ffd700]" />
      </div>
    </div>
  );
}

function QiblaScreen({ onBack }) {
  const [compassHeading, setCompassHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(153);
  const KAABA_LAT = 21.422487;
  const KAABA_LNG = 39.826206;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        const qibla = calculateQiblaAngle(latitude, longitude);
        setQiblaAngle(qibla);
      }, error => {
        console.warn("Konum alınamadı, varsayılan (İstanbul) kullanılıyor.");
      });
    }

    const handleOrientation = (event) => {
      let heading = event.alpha;
      if (typeof event.webkitCompassHeading !== "undefined") {
        heading = event.webkitCompassHeading;
      }
      if (heading !== null) {
        setCompassHeading(heading);
      }
    };
    
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  const calculateQiblaAngle = (lat, lng) => {
    const PI = Math.PI;
    const latk = KAABA_LAT * PI / 180.0;
    const longk = KAABA_LNG * PI / 180.0;
    const phi = lat * PI / 180.0;
    const lambda = lng * PI / 180.0;
    const y = Math.sin(longk - lambda);
    const x = Math.cos(phi) * Math.tan(latk) - Math.sin(phi) * Math.cos(longk - lambda);
    let angle = Math.atan2(y, x) * 180.0 / PI;
    return (angle + 360) % 360;
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 overflow-hidden">
      <div className="px-6 py-6 bg-[#0F5132] text-white shadow-lg rounded-b-[30px] z-10">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><ArrowLeft size={24} /></button>
          <h1 className="text-2xl font-bold">Kıble Pusulası</h1>
        </div>
        <p className="text-xs text-emerald-100 opacity-80 pl-12">Kabe yönünü bulmak için telefonunuzu düz tutun.</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="relative w-72 h-72 rounded-full border-8 border-stone-200 shadow-2xl bg-white flex items-center justify-center transition-transform duration-300 ease-out" 
             style={{ transform: `rotate(${-compassHeading}deg)` }}>
           <div className="absolute top-2 text-stone-400 font-bold text-lg">N</div>
           <div className="absolute bottom-2 text-stone-400 font-bold text-lg">S</div>
           <div className="absolute left-3 text-stone-400 font-bold text-lg">W</div>
           <div className="absolute right-3 text-stone-400 font-bold text-lg">E</div>
           <div className="w-2 h-32 bg-red-500 rounded-full absolute top-4 z-10 origin-bottom" style={{ transform: 'translateY(-50%)' }}></div>
           <div className="w-2 h-32 bg-stone-300 rounded-full absolute bottom-4 z-10 origin-top" style={{ transform: 'translateY(50%)' }}></div>
           <div className="w-6 h-6 bg-stone-800 rounded-full absolute z-20 border-4 border-white"></div>
           <div className="absolute w-full h-full flex justify-center" style={{ transform: `rotate(${qiblaAngle}deg)` }}>
              <div className="flex flex-col items-center -mt-10">
                 <div className="w-12 h-12 bg-[#0F5132] rounded-lg rotate-45 flex items-center justify-center shadow-lg border-2 border-amber-400 animate-pulse">
                     <div className="w-8 h-8 border border-amber-400/50"></div>
                 </div>
                 <div className="h-20 w-0.5 bg-emerald-500/50 mt-2"></div>
              </div>
           </div>
        </div>
        <div className="mt-12 w-full max-w-xs bg-white p-4 rounded-xl shadow-sm border border-stone-100">
             <label className="text-xs font-bold text-stone-500 block mb-2 text-center">Pusulayı Döndür (Test)</label>
             <input type="range" min="0" max="360" value={compassHeading} onChange={(e) => setCompassHeading(parseInt(e.target.value))} className="w-full accent-emerald-600 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer" />
             <div className="flex justify-between text-xs text-stone-400 mt-1"><span>0°</span><span>180°</span><span>360°</span></div>
        </div>
        <div className="mt-6 text-center">
             <div className="text-3xl font-bold text-stone-800">{Math.round(qiblaAngle)}°</div>
             <p className="text-sm text-stone-500">Kıble Açısı</p>
        </div>
      </div>
    </div>
  );
}

// 20+ Achievement Definitions
const ALL_ACHIEVEMENTS = [
    // Completed
    { id: 1, title: "Hızlı Başlangıç", desc: "İlk 100 Puan", icon: "🚀", color: "from-yellow-50 to-orange-50", borderColor: "border-yellow-100", status: "completed", progress: 100 },
    { id: 2, title: "İlk Ders", desc: "Elif-Ba Tamamlandı", icon: "📖", color: "from-emerald-50 to-teal-50", borderColor: "border-emerald-100", status: "completed", progress: 100 },
    { id: 3, title: "Meraklı", desc: "5 Farklı Ders Yap", icon: "🧐", color: "from-blue-50 to-indigo-50", borderColor: "border-blue-100", status: "completed", progress: 100 },
    
    // In Progress
    { id: 4, title: "7 Gün Seri", desc: "7 gün üst üste", icon: "🔥", color: "bg-stone-50", borderColor: "border-stone-200", status: "in_progress", progress: 42, current: 3, target: 7 },
    { id: 5, title: "Kelime Avcısı", desc: "50 Kelime Öğren", icon: "🏹", color: "bg-stone-50", borderColor: "border-stone-200", status: "in_progress", progress: 60, current: 30, target: 50 },
    { id: 6, title: "Kuran Bülbülü", desc: "10 Sayfa Oku", icon: "🦜", color: "bg-stone-50", borderColor: "border-stone-200", status: "in_progress", progress: 20, current: 2, target: 10 },
    
    // Locked
    { id: 7, title: "30 Gün Seri", desc: "Bir ay boyunca", icon: "📆", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 10, current: 3, target: 30 },
    { id: 8, title: "Sabah Kuşu", desc: "08:00'den önce", icon: "🌅", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
    { id: 9, title: "Gece Kuşu", desc: "23:00'den sonra", icon: "🦉", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
    { id: 10, title: "Mükemmeliyetçi", desc: "Hatasız Ders", icon: "🎯", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
    { id: 11, title: "Hafız Adayı", desc: "1 Sure Ezberle", icon: "🧠", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
    { id: 12, title: "1000 Puan", desc: "Toplam XP", icon: "⭐", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
    { id: 13, title: "5000 Puan", desc: "Toplam XP", icon: "🌟", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
    { id: 14, title: "Ünite 1 Ustası", desc: "Tüm yıldızlar", icon: "🥇", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
    { id: 15, title: "Ünite 2 Ustası", desc: "Tüm yıldızlar", icon: "🥈", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
    { id: 16, title: "Sosyal Kelebek", desc: "Arkadaşınla Paylaş", icon: "🦋", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
    { id: 17, title: "Destekçi", desc: "Premium Üye", icon: "💖", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
    { id: 18, title: "Zikirmatik", desc: "1000 Tesbihat", icon: "📿", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
    { id: 19, title: "Kıble Kaşifi", desc: "Kıbleyi Bul", icon: "🧭", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
    { id: 20, title: "Tecvid Ustası", desc: "Tecvid Bitir", icon: "🎓", color: "bg-stone-50", borderColor: "border-stone-200", status: "locked", progress: 0, current: 0, target: 1 },
];

function ProfileScreen({ stats, user, onLoginClick, onLogout }) {
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  // PREMIUM PLANS COMPONENT (Reusable)
  const PremiumPlansSection = () => (
    <div>
        <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 text-lg"><Crown size={20} className="text-yellow-500"/> Premium Planlar</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
        
        {/* Plan 1: Basic */}
        <div className="min-w-[200px] bg-white border border-stone-200 rounded-2xl p-4 shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Zap size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-stone-800">Temel Paket</h4>
                    <p className="text-[10px] text-stone-500">Reklamsız Deneyim</p>
                </div>
            </div>
            <div className="mb-4">
                <span className="text-2xl font-bold text-stone-800">24,99 ₺</span>
                <span className="text-xs text-stone-400">/Ay</span>
            </div>
            <button className="w-full py-2 rounded-lg bg-stone-100 text-stone-600 font-bold text-xs hover:bg-stone-200 transition-colors">
                SEÇ
            </button>
        </div>

        {/* Plan 2: Pro (Recommended) */}
        <div className="min-w-[220px] bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-4 shadow-lg relative group hover:shadow-xl transition-shadow text-white border border-stone-700">
            <div className="absolute top-0 right-0 bg-yellow-500 text-stone-900 text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl">
                ÖNERİLEN
            </div>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500 text-stone-900 flex items-center justify-center">
                    <Crown size={20} fill="currentColor" />
                </div>
                <div>
                    <h4 className="font-bold text-white">Pro Paket</h4>
                    <p className="text-[10px] text-stone-400">Sınırsız Her Şey</p>
                </div>
            </div>
            <div className="mb-4">
                <span className="text-2xl font-bold text-white">49,99 ₺</span>
                <span className="text-xs text-stone-400">/Ay</span>
            </div>
            <button className="w-full py-2 rounded-lg bg-yellow-500 text-stone-900 font-bold text-xs hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20">
                SEÇ
            </button>
        </div>
        </div>
    </div>
  );

  // If user is null, show Guest View
  if (!user) {
    return (
        <div className="flex flex-col min-h-full bg-stone-50 animate-fade-in scrollbar-hide">
            <div className="bg-[#0F5132] text-white pt-12 pb-16 px-6 rounded-b-[40px] shadow-lg text-center relative overflow-hidden">
                <div className="absolute inset-0 islamic-pattern opacity-10"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-4 border-4 border-white/20">
                        <User size={48} className="opacity-80" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Misafir Öğrenci</h2>
                    <p className="text-emerald-100 text-sm max-w-xs mx-auto mb-6">İlerlemeni kaydetmek, farklı cihazlardan erişmek ve başarılarını görmek için aramıza katıl.</p>
                    <button onClick={onLoginClick} className="bg-white text-[#0F5132] px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-50 transition-colors flex items-center gap-2">
                        <LogIn size={20} /> Giriş Yap / Kayıt Ol
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Local Stats */}
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-center">
                    <div className="flex justify-center gap-8 mb-4 opacity-50">
                        <div className="flex flex-col items-center"><Star className="text-yellow-500 mb-1" /> <span className="font-bold text-stone-800">{stats.points}</span></div>
                        <div className="flex flex-col items-center"><Flame className="text-orange-500 mb-1" /> <span className="font-bold text-stone-800">{stats.streak}</span></div>
                    </div>
                    <p className="text-xs text-stone-400">Bu istatistikler sadece bu cihaza özeldir.</p>
                </div>

                {/* Premium Plans (Visible for Guest) */}
                <PremiumPlansSection />

                 {/* Support Section (Visible for Guest) */}
                 <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    <button className="w-full p-4 flex items-center justify-between hover:bg-rose-50/50 transition-colors text-left group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-100 transition-colors"><Heart size={18} fill="currentColor" /></div>
                            <div>
                                <span className="text-sm font-bold text-rose-600 block">Geliştiriciye Destek Ol</span>
                                <span className="text-xs text-rose-400">Sadaka-i Cariye / Bağış</span>
                            </div>
                        </div>
                        <div className="bg-rose-100 text-rose-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                            <Coffee size={12} /> Ismarla
                        </div>
                    </button>
                </div>

                {/* Locked Sections */}
                <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-white border border-stone-100 rounded-xl opacity-60 grayscale">
                        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400"><Award size={20} /></div>
                        <div className="flex-1"><h4 className="font-bold text-stone-700">Başarılar</h4><p className="text-xs text-stone-400">Giriş yapınca açılır</p></div>
                        <Lock size={16} className="text-stone-300" />
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white border border-stone-100 rounded-xl opacity-60 grayscale">
                        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400"><Settings size={20} /></div>
                        <div className="flex-1"><h4 className="font-bold text-stone-700">Ayarlar</h4><p className="text-xs text-stone-400">Giriş yapınca açılır</p></div>
                        <Lock size={16} className="text-stone-300" />
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // Logged In View
  return (
    <div className="flex flex-col min-h-full bg-stone-50 animate-fade-in scrollbar-hide">
       {/* Header Revised */}
       <div className="relative bg-gradient-to-br from-[#0F5132] to-[#064e3b] text-white pt-12 pb-36 px-6 rounded-b-[40px] shadow-2xl overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 islamic-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
          
          <div className="flex items-center gap-5 relative z-10">
             <div className="relative group cursor-pointer">
                <div className={`w-24 h-24 rounded-full ${user.avatarColor} border-[3px] border-white/30 group-hover:border-white/50 transition-colors flex items-center justify-center shadow-lg backdrop-blur-sm`}>
                    <User size={48} strokeWidth={1.5} />
                </div>
                <div className="absolute bottom-0 right-0 bg-white text-emerald-700 p-2 rounded-full shadow-lg hover:bg-stone-50 transition-transform active:scale-90 border border-stone-100">
                    <Edit3 size={14} />
                </div>
             </div>
             
             <div className="flex-1">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight leading-tight">{user.name}</h2>
                        <div className="flex items-center gap-2 mt-1 mb-3">
                            <Award size={16} className="text-yellow-400 fill-yellow-400" />
                            <p className="text-emerald-50 text-sm font-medium tracking-wide">{user.level}</p>
                        </div>
                    </div>
                    <button className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-md border border-white/5">
                        <Settings size={20} />
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                   <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                       <span className="text-[10px] font-bold tracking-wider uppercase text-white/90">Öğrenci</span>
                   </div>
                   <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5 flex items-center gap-2">
                       <Calendar size={12} className="text-emerald-200" />
                       <span className="text-[10px] font-medium text-emerald-100">{user.joined}</span>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Stats Grid Revised */}
       <div className="px-6 -mt-16 relative z-20 mb-8">
          <div className="bg-white p-5 rounded-3xl shadow-xl border border-stone-100 flex justify-between items-center">
             <div className="flex-1 flex flex-col items-center gap-1.5 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform duration-300 shadow-sm"><Star size={24} fill="currentColor" className="drop-shadow-sm" /></div>
                <span className="font-bold text-stone-800 text-xl tracking-tight mt-1">{stats.points}</span>
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Puan</span>
             </div>
             <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-stone-200 to-transparent"></div>
             <div className="flex-1 flex flex-col items-center gap-1.5 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform duration-300 shadow-sm"><Flame size={24} fill="currentColor" className="drop-shadow-sm" /></div>
                <span className="font-bold text-stone-800 text-xl tracking-tight mt-1">{stats.streak}</span>
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Gün Seri</span>
             </div>
             <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-stone-200 to-transparent"></div>
             <div className="flex-1 flex flex-col items-center gap-1.5 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-300 shadow-sm"><Trophy size={24} fill="currentColor" className="drop-shadow-sm" /></div>
                <span className="font-bold text-stone-800 text-xl tracking-tight mt-1">3</span>
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Rozet</span>
             </div>
          </div>
       </div>

       {/* Content */}
       <div className="p-6 space-y-8 pb-24 pt-0">
          
          {/* PREMIUM PLANS (Reusable) */}
          <PremiumPlansSection />

          {/* Achievements */}
          <div>
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-800 flex items-center gap-2 text-lg"><Award size={20} className="text-[#0F5132]"/> Başarılar</h3>
                <button onClick={() => setShowAchievementsModal(true)} className="text-xs font-bold text-stone-400 hover:text-[#0F5132] transition-colors">Tümünü Gör</button>
             </div>
             
             {/* Horizontal Scroll (Top 5) */}
             <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                {ALL_ACHIEVEMENTS.slice(0, 5).map(ach => (
                    <div key={ach.id} className={`min-w-[140px] border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center shadow-sm group transition-all relative overflow-hidden ${ach.status === 'locked' ? 'bg-stone-50 border-stone-200 opacity-80' : `bg-gradient-to-br ${ach.color} ${ach.borderColor}`}`}>
                        {ach.status !== 'completed' && ach.status !== 'locked' && (
                            <div className="absolute bottom-0 left-0 h-1 bg-stone-200 w-full">
                                <div className="h-full bg-emerald-500" style={{ width: `${(ach.current / ach.target) * 100}%` }}></div>
                            </div>
                        )}

                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-sm ${ach.status === 'locked' ? 'bg-white text-stone-300 grayscale' : 'bg-white group-hover:scale-110 transition-transform'}`}>
                            {ach.status === 'locked' ? <Lock size={20} /> : ach.icon}
                        </div>
                        
                        <div>
                            <span className={`text-sm font-bold block leading-tight mb-1 ${ach.status === 'locked' ? 'text-stone-500' : 'text-stone-800'}`}>{ach.title}</span>
                            <span className="text-[10px] text-stone-400 font-medium block leading-tight">{ach.desc}</span>
                            {ach.status !== 'completed' && ach.target && (
                                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">{ach.current}/{ach.target}</span>
                            )}
                        </div>
                    </div>
                ))}
             </div>
          </div>

          {/* Settings Menu */}
          <div>
             <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2 text-lg"><Settings size={20} className="text-[#0F5132]"/> Ayarlar</h3>
             <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50 overflow-hidden">
                <div className="p-4 flex items-center justify-between group hover:bg-stone-50 transition-colors cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Bell size={18} /></div>
                      <div>
                          <span className="text-sm font-bold text-stone-700 block">Hatırlatıcılar</span>
                          <span className="text-xs text-stone-400">Namaz ve ders bildirimleri</span>
                      </div>
                   </div>
                   <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"></div></div>
                </div>
                <div className="p-4 flex items-center justify-between group hover:bg-stone-50 transition-colors cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Volume2 size={18} /></div>
                      <div>
                          <span className="text-sm font-bold text-stone-700 block">Ses Efektleri</span>
                          <span className="text-xs text-stone-400">Uygulama içi sesler</span>
                      </div>
                   </div>
                   <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"></div></div>
                </div>
                
                {/* NEW: Support / Sadaka-i Cariye Option */}
                <button className="w-full p-4 flex items-center justify-between hover:bg-rose-50/50 transition-colors text-left group border-t border-stone-100">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-100 transition-colors"><Heart size={18} fill="currentColor" /></div>
                      <div>
                          <span className="text-sm font-bold text-rose-600 block">Geliştiriciye Destek Ol</span>
                          <span className="text-xs text-rose-400">Sadaka-i Cariye / Bağış</span>
                      </div>
                   </div>
                   <div className="bg-rose-100 text-rose-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                      <Coffee size={12} /> Ismarla
                   </div>
                </button>

                <button onClick={onLogout} className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left group border-t border-stone-100">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center group-hover:bg-stone-200 transition-colors"><LogOut size={18} /></div>
                      <span className="text-sm font-bold text-stone-500">Çıkış Yap</span>
                   </div>
                   <ArrowRight size={18} className="text-stone-300 group-hover:text-stone-400 transition-colors" />
                </button>
             </div>
          </div>
       </div>

       {/* All Achievements Modal */}
       {showAchievementsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
           <div className="bg-white w-full max-w-md h-[80vh] rounded-3xl p-6 overflow-y-auto relative animate-fade-in-up flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 border-b border-stone-100">
                 <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2"><Award className="text-[#0F5132]" /> Tüm Başarılar</h3>
                 <button onClick={() => setShowAchievementsModal(false)} className="bg-stone-100 p-2 rounded-full hover:bg-stone-200"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 pb-4">
                 {ALL_ACHIEVEMENTS.map(ach => (
                    <div key={ach.id} className={`border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center shadow-sm relative overflow-hidden ${ach.status === 'locked' ? 'bg-stone-50 border-stone-200 opacity-80' : `bg-gradient-to-br ${ach.color} ${ach.borderColor}`}`}>
                        {/* ... Achievement Card Content ... */}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-sm ${ach.status === 'locked' ? 'bg-white text-stone-300 grayscale' : 'bg-white'}`}>
                            {ach.status === 'locked' ? <Lock size={20} /> : ach.icon}
                        </div>
                        
                        <div>
                            <span className={`text-sm font-bold block leading-tight mb-1 ${ach.status === 'locked' ? 'text-stone-500' : 'text-stone-800'}`}>{ach.title}</span>
                            <span className="text-[10px] text-stone-500 font-medium block leading-tight">{ach.desc}</span>
                            {ach.status !== 'completed' && ach.target && (
                                <div className="mt-2 bg-white/50 px-2 py-0.5 rounded-md inline-block">
                                    <span className="text-[10px] text-emerald-700 font-bold">{ach.current}/{ach.target}</span>
                                </div>
                            )}
                            {ach.status === 'completed' && <span className="text-[10px] text-emerald-600 font-bold mt-2 block bg-white/50 px-2 py-0.5 rounded-md">Tamamlandı!</span>}
                        </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
       )}
    </div>
  );
}

function DashboardContent({ setView, completedLevels }) {
  const [prayerTimes, setPrayerTimes] = useState({
    Imsak: "--:--", Gunes: "--:--", Ogle: "--:--", Ikindi: "--:--", Aksam: "--:--", Yatsi: "--:--"
  });
  const [nextPrayer, setNextPrayer] = useState({ name: 'Vakit', remaining: 0 });
  const [locationInfo, setLocationInfo] = useState({ city: "İstanbul", weather: "Parçalı Bulutlu 24°C" });
  const [loading, setLoading] = useState(false);
  const [dailyHadith, setDailyHadith] = useState(null);

  // Set Daily Hadith based on day of year
  useEffect(() => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const hadith = HADITHS_DATABASE[dayOfYear % HADITHS_DATABASE.length];
    setDailyHadith(hadith);
  }, []);

  useEffect(() => {
    const fetchData = async (lat, lon) => {
      setLoading(true);
      try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const dateStr = `${dd}-${mm}-${yyyy}`;

        const apiRes = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=13`);
        const data = await apiRes.json();
        
        if (data.code === 200) {
           const t = data.data.timings;
           setPrayerTimes({
             Imsak: t.Fajr, Gunes: t.Sunrise, Ogle: t.Dhuhr, Ikindi: t.Asr, Aksam: t.Maghrib, Yatsi: t.Isha
           });
           setLocationInfo({ city: "Konumunuz", weather: "Açık 21°C" }); 
        }
      } catch (err) {
        console.error("Veri hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchData(pos.coords.latitude, pos.coords.longitude),
        (err) => {
            console.log("Konum alınamadı, İstanbul varsayılıyor.");
            fetchData(41.0082, 28.9784); 
        }
      );
    } else {
        fetchData(41.0082, 28.9784);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (prayerTimes.Imsak === "--:--") return;
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      const times = [
        { name: 'İmsak', time: prayerTimes.Imsak }, { name: 'Güneş', time: prayerTimes.Gunes }, { name: 'Öğle', time: prayerTimes.Ogle },
        { name: 'İkindi', time: prayerTimes.Ikindi }, { name: 'Akşam', time: prayerTimes.Aksam }, { name: 'Yatsı', time: prayerTimes.Yatsi }
      ];
      const timeObjects = times.map(t => {
        const [h, m] = t.time.split(':').map(Number);
        return { ...t, minutes: h * 60 + m };
      }).sort((a, b) => a.minutes - b.minutes);

      let next = timeObjects.find(t => t.minutes > currentMinutes);
      let targetMinutes = 0;
      let nextName = "";

      if (next) {
        nextName = next.name;
        targetMinutes = next.minutes;
      } else {
        nextName = 'İmsak';
        targetMinutes = timeObjects[0].minutes + 24 * 60;
      }
      const totalSecondsNow = currentMinutes * 60 + currentSeconds;
      const totalSecondsTarget = targetMinutes * 60;
      let diff = totalSecondsTarget - totalSecondsNow;
      setNextPrayer({ name: nextName, remaining: diff });
    }, 1000);
    return () => clearInterval(timer);
  }, [prayerTimes]);

  const formatCountdown = (s) => {
      if (s < 0) return "00:00:00";
      const h = Math.floor(s / 3600).toString().padStart(2, '0');
      const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
      const sec = (s % 60).toString().padStart(2, '0');
      return `${h}:${m}:${sec}`;
  };

  return (
    <div className="min-h-full bg-white animate-fade-in pb-24">
      <div className="relative islamic-pattern text-white pb-16 pt-12 px-6 rounded-b-[40px] shadow-xl overflow-hidden transition-all duration-500">
         <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
         <div className="absolute top-[20px] right-[-20px] w-60 h-60 bg-[#20c997]/20 rounded-full blur-3xl"></div>
         <div className="relative z-10 text-center">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-white" size={32} /></div>
            ) : (
              <>
                <p className="text-[#20c997] text-xs font-bold uppercase tracking-widest mb-2">
                  {nextPrayer.name} Vaktine Kalan
                </p>
                <div className="text-6xl font-mono font-bold text-white tracking-tighter drop-shadow-sm mb-6 tabular-nums">
                    {formatCountdown(nextPrayer.remaining)}
                </div>
              </>
            )}
            <div className="flex justify-between items-center bg-[#0a3622]/50 backdrop-blur-sm p-3 rounded-2xl border border-white/10 overflow-x-auto">
                <PrayerItem name="İmsak" time={prayerTimes.Imsak} active={nextPrayer.name === 'İmsak'} />
                <PrayerItem name="Güneş" time={prayerTimes.Gunes} active={nextPrayer.name === 'Güneş'} />
                <PrayerItem name="Öğle" time={prayerTimes.Ogle} active={nextPrayer.name === 'Öğle'} />
                <PrayerItem name="İkindi" time={prayerTimes.Ikindi} active={nextPrayer.name === 'İkindi'} />
                <PrayerItem name="Akşam" time={prayerTimes.Aksam} active={nextPrayer.name === 'Akşam'} />
                <PrayerItem name="Yatsı" time={prayerTimes.Yatsi} active={nextPrayer.name === 'Yatsı'} />
            </div>
            <div className="mt-4 flex justify-center items-center gap-2 text-xs text-emerald-100/70">
                {loading ? <Loader2 size={12} className="animate-spin"/> : <CloudSun size={14} />}
                <span>{locationInfo.city}, {locationInfo.weather}</span>
            </div>
         </div>
      </div>
      <div className="relative -mt-8 px-6 mb-8 cursor-pointer" onClick={() => setView('elifba')}>
         <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-amber-100 flex items-center justify-between transform translate-y-2 hover:translate-y-1 transition-transform group">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <GraduationCap size={24} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-stone-800">Derse Başla</h3>
                    <p className="text-xs text-stone-500">Kaldığın yerden devam et</p>
                </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <PlayCircle size={20} fill="currentColor" className="opacity-80" />
            </div>
         </div>
      </div>
      <div className="pl-6 mb-8">
        <h3 className="font-bold text-[#0F5132] mb-4 text-sm px-1">Özellikler</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 pr-10 scrollbar-hide">
            <FeatureCircle icon={<BookOpen size={24} />} label="Kuran" color="bg-emerald-100 text-emerald-700" onClick={() => setView('quran')} />
            <FeatureCircle icon={<GraduationCap size={24} />} label="Dersler" color="bg-indigo-100 text-indigo-700" onClick={() => setView('elifba')} />
            <FeatureCircle icon={<Moon size={24} />} label="Tesbih" color="bg-teal-100 text-teal-700" onClick={() => setView('zikirmatik')} />
            <FeatureCircle icon={<MapPin size={24} />} label="Kıble" color="bg-amber-100 text-amber-700" onClick={() => setView('qibla')} />
            <FeatureCircle icon={<MessageSquare size={24} />} label="Asistan" color="bg-blue-100 text-blue-700" onClick={() => setView('chat')} />
            <FeatureCircle icon={<Bookmark size={24} />} label="Ezber" color="bg-rose-100 text-rose-700" onClick={() => setView('saves')} />
        </div>
      </div>
      <div className="px-6 mb-8">
        <h3 className="font-bold text-[#0F5132] mb-4 text-sm px-1">Son Okunan</h3>
        <div className="bg-gradient-to-r from-[#0F5132] to-[#198754] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden flex items-center justify-between group cursor-pointer" onClick={() => setView('quran')}>
            <div className="relative z-10 w-1/2">
                <span className="text-[10px] uppercase tracking-widest text-[#20c997] font-bold mb-1 block">Sayfa 42</span>
                <h2 className="text-2xl font-serif font-bold mb-1">Bakara</h2>
                <p className="text-xs text-emerald-100 opacity-80 mb-4">Ayet 255</p>
                <button className="bg-white text-[#0F5132] px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-emerald-50 transition-colors">
                    Devam Et
                </button>
            </div>
            <div className="w-24 h-32 bg-[#0a3622] rounded-r-md rounded-l-sm shadow-2xl transform rotate-y-12 rotate-6 border-l-4 border-[#eec046] flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20 pointer-events-none"></div>
                 <div className="w-16 h-16 border-2 border-[#eec046] rounded-full flex items-center justify-center opacity-50">
                    <div className="w-12 h-12 border border-[#eec046] rounded-full"></div>
                 </div>
            </div>
        </div>
      </div>
      <div className="px-6 mb-8">
         <h3 className="font-bold text-[#0F5132] mb-4 text-sm px-1">Günün Hadisi</h3>
         <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 relative">
            <Quote className="absolute top-4 right-4 text-rose-200" size={40} />
            {dailyHadith && (
                <>
                <p className="text-sm font-medium text-stone-700 italic leading-relaxed relative z-10">
                    "{dailyHadith.text}"
                </p>
                <div className="mt-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-rose-200 rounded-full flex items-center justify-center text-rose-700 text-xs font-bold"><Info size={12} /></div>
                    <span className="text-xs font-bold text-rose-700">{dailyHadith.source}</span>
                </div>
                </>
            )}
         </div>
      </div>
    </div>
  );
}

// --- 6. UYGULAMA GİRİŞ NOKTASI (EN SONDA) ---

function MainAppLayout({ view, setView, stats, startLevelFlow, completedLevels, user, onLoginClick, onLogout }) {
  const isDashboard = view === 'dashboard';

  return (
    <div className="flex flex-col h-full bg-white">
      <main className="flex-1 overflow-y-auto bg-white scrollbar-hide relative">
        {view === 'dashboard' && <DashboardContent setView={setView} completedLevels={completedLevels} />}
        {view === 'elifba' && <ElifBaTree startLevelFlow={startLevelFlow} onBack={() => setView('dashboard')} completedLevels={completedLevels} stats={stats} />}
        {view === 'quran' && <QuranScreen onBack={() => setView('dashboard')} />}
        {view === 'zikirmatik' && <ZikirmatikScreen onBack={() => setView('dashboard')} />}
        {view === 'qibla' && <QiblaScreen onBack={() => setView('dashboard')} />}
        {view === 'saves' && <div className="p-8 text-center text-stone-500">Ezberler (Yakında)</div>}
        {view === 'profile' && <ProfileScreen stats={stats} user={user} onLoginClick={onLoginClick} onLogout={onLogout} />}
        {view === 'chat' && <GeminiChatScreen onBack={() => setView('dashboard')} />}
      </main>

      <nav className="bg-white border-t border-stone-100 px-2 py-2 flex justify-around items-center pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30">
        <NavItem icon={<Home size={22} />} isActive={view === 'dashboard'} onClick={() => setView('dashboard')} label="Ana Sayfa" />
        <NavItem icon={<GraduationCap size={22} />} isActive={view === 'elifba'} onClick={() => setView('elifba')} label="Dersler" />
        <div className="w-12"></div> 
        <NavItem icon={<BookOpen size={22} />} isActive={view === 'quran'} onClick={() => setView('quran')} label="Kuran" />
        <NavItem icon={<User size={22} />} isActive={view === 'profile'} onClick={() => setView('profile')} label="Profil" />
      </nav>

      {isDashboard && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40">
            <button 
                onClick={() => setView('chat')}
                className="w-16 h-16 rounded-full bg-[#0F5132] text-white flex items-center justify-center shadow-lg border-4 border-white hover:scale-105 transition-transform"
            >
                <MessageSquare size={28} />
            </button>
          </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [hearts, setHearts] = useState(5);
  const [timeToNextHeart, setTimeToNextHeart] = useState(0); 
  const [streak, setStreak] = useState(12);
  const [points, setPoints] = useState(1240);
  const [appView, setAppView] = useState('dashboard');
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [user, setUser] = useState(null); // null means guest
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('app'); 
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (hearts >= 5) {
        setTimeToNextHeart(0);
        return;
    }
    if (timeToNextHeart === 0) setTimeToNextHeart(600);

    const timer = setInterval(() => {
      setTimeToNextHeart((prev) => {
        if (prev <= 1) {
          setHearts((h) => Math.min(h + 1, 5));
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hearts]); 

  const startLevelFlow = (levelConfig) => {
    const lessonData = generateLesson(levelConfig);
    setActiveLesson(lessonData);
    setCurrentScreen('unit_intro');
  };

  const handleLessonComplete = (earnedPoints) => {
    setPoints(prev => prev + earnedPoints);
    if (activeLesson) {
        const levelId = activeLesson.id;
        if (!completedLevels.includes(levelId)) {
            setCompletedLevels(prev => [...prev, levelId]);
        }
    }
    setCurrentScreen('app');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash': return <SplashScreen />;
      case 'app': 
        return (
          <>
            <MainAppLayout 
                view={appView} 
                setView={setAppView} 
                stats={{ hearts, streak, points, timeToNextHeart }} 
                startLevelFlow={startLevelFlow}
                completedLevels={completedLevels}
                user={user}
                onLoginClick={() => setShowAuthModal(true)}
                onLogout={handleLogout}
            />
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />}
          </>
        );
      case 'unit_intro':
        return <UnitIntroScreen 
                  lessonData={activeLesson}
                  onStartLesson={() => setCurrentScreen('lesson')}
                  onBack={() => setCurrentScreen('app')}
               />;
      case 'lesson': 
        return <LessonScreen 
                  lessonData={activeLesson}
                  onComplete={handleLessonComplete}
                  onExit={() => setCurrentScreen('app')}
                  loseHeart={() => setHearts(h => Math.max(0, h - 1))}
                  hearts={hearts}
                  timeToNextHeart={timeToNextHeart}
               />;
      case 'gemini_chat':
        return <GeminiChatScreen onBack={() => setCurrentScreen('app')} />;
      default: return <SplashScreen />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 font-sans text-stone-800 max-w-md mx-auto border-x border-stone-200 shadow-2xl overflow-hidden relative">
      <style>{globalStyles}</style>
      {renderScreen()}
    </div>
  );
}
