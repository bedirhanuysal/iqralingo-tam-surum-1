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

const apiKey = ""; // API anahtarı runtime'da enjekte edilir

const callGemini = async (prompt, systemInstruction = "") => {
  if (!apiKey) {
      await new Promise(r => setTimeout(r, 1000));
      return "Bu bir demo yanıtıdır. API anahtarı yapılandırıldığında gerçek yapay zeka yanıtları alacaksınız.";
  }

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
  { id: 1, char: "ا", name: "Elif", sound: "", group: 1, isThick: false },
  { id: 2, char: "ب", name: "Be", sound: "b", group: 1, isThick: false },
  { id: 3, char: "ت", name: "Te", sound: "t", group: 1, isThick: false },
  { id: 4, char: "ث", name: "Se", sound: "s", group: 2, isThick: false },
  { id: 5, char: "ج", name: "Cim", sound: "c", group: 2, isThick: false },
  { id: 6, char: "ح", name: "Ha", sound: "h", group: 2, isThick: false },
  { id: 7, char: "خ", name: "Hı", sound: "h", group: 3, isThick: true },
  { id: 8, char: "د", name: "Dal", sound: "d", group: 3, isThick: false },
  { id: 9, char: "ذ", name: "Zel", sound: "z", group: 3, isThick: false },
  { id: 10, char: "ر", name: "Ra", sound: "r", group: 4, isThick: false },
  { id: 11, char: "ز", name: "Ze", sound: "z", group: 4, isThick: false },
  { id: 12, char: "س", name: "Sin", sound: "s", group: 4, isThick: false },
  { id: 13, char: "ش", name: "Şın", sound: "ş", group: 5, isThick: false },
  { id: 14, char: "ص", name: "Sad", sound: "s", group: 5, isThick: true },
  { id: 15, char: "ض", name: "Dad", sound: "d", group: 5, isThick: true },
  { id: 16, char: "ط", name: "Tı", sound: "t", group: 6, isThick: true },
  { id: 17, char: "ظ", name: "Zı", sound: "z", group: 6, isThick: true },
  { id: 18, char: "ع", name: "Ayn", sound: "", group: 6, isThick: false },
  { id: 19, char: "غ", name: "Gayn", sound: "ğ", group: 7, isThick: true },
  { id: 20, char: "ف", name: "Fe", sound: "f", group: 7, isThick: false },
  { id: 21, char: "ق", name: "Kaf", sound: "k", group: 7, isThick: true },
  { id: 22, char: "ك", name: "Kef", sound: "k", group: 8, isThick: false },
  { id: 23, char: "ل", name: "Lam", sound: "l", group: 8, isThick: false },
  { id: 24, char: "م", name: "Mim", sound: "m", group: 8, isThick: false },
  { id: 25, char: "ن", name: "Nun", sound: "n", group: 9, isThick: false },
  { id: 26, char: "و", name: "Vav", sound: "v", group: 9, isThick: false },
  { id: 27, char: "ه", name: "He", sound: "h", group: 9, isThick: false },
  { id: 28, char: "ي", name: "Ye", sound: "y", group: 9, isThick: false }
];

const WORDS_DATABASE = {
    easy: [
        { id: 'w1', arabic: 'أَبَ', reading: 'Ebe' },
        { id: 'w2', arabic: 'أَخَ', reading: 'Eha' },
        { id: 'w3', arabic: 'بَدَ', reading: 'Bede' },
        { id: 'w4', arabic: 'زَرَ', reading: 'Zera' },
        { id: 'w5', arabic: 'رَبَ', reading: 'Rabe' },
        { id: 'w6', arabic: 'دَرَسَ', reading: 'Derese' },
        { id: 'w7', arabic: 'وَرَدَ', reading: 'Verede' },
        { id: 'w8', arabic: 'أَذَنَ', reading: 'Ezene' },
    ],
    hard: [
        { id: 'w11', arabic: 'مَسْجِدُ', reading: 'Mescidu' },
        { id: 'w12', arabic: 'كِتَابٌ', reading: 'Kitabun' },
        { id: 'w13', arabic: 'مَدْرَسَةٌ', reading: 'Medresetun' },
        { id: 'w14', arabic: 'قَلَمٌ', reading: 'Kalemun' },
        { id: 'w15', arabic: 'كُرْسِيٌّ', reading: 'Kursiyyun' },
        { id: 'w16', arabic: 'طَالِبٌ', reading: 'Talibun' },
    ]
};

const PRAYERS_DATABASE = [
    { id: 'p1', arabic: 'سُبْحَانَ الله', reading: 'Subhanallah' },
    { id: 'p2', arabic: 'الْحَمْدُ لِلَّه', reading: 'Elhamdulillah' },
    { id: 'p3', arabic: 'اللهُ أَكْبَر', reading: 'Allahu Ekber' },
    { id: 'p4', arabic: 'بِسْمِ الله', reading: 'Bismillah' },
    { id: 'p5', arabic: 'لَا إِلَهَ إِلَّا الله', reading: 'La İlahe İllallah' },
    { id: 'p6', arabic: 'مَا شَاءَ الله', reading: 'Maşallah' },
    { id: 'p7', arabic: 'أَسْتَغْفِرُ الله', reading: 'Estağfirullah' },
    { id: 'p8', arabic: 'جَزَاكَ اللهُ خَيْرًا', reading: 'Cezakallahu Hayran' },
    { id: 'p9', arabic: 'بَارَكَ اللهُ فِيك', reading: 'Barakallahu Fik' },
    { id: 'p10', arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيم', reading: 'Subhane Rabbiyel Azim' },
    { id: 'p11', arabic: 'سُبْحَانَكَ اللَّهُمَّ', reading: 'Sübhaneke Allahümme' },
    { id: 'p12', arabic: 'اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَم۪ينَ', reading: 'Elhamdulillahi Rabbil Alemin' }
];

const CURRICULUM = [
  { 
    id: 1, 
    title: "1. Ünite: Harfleri Öğreniyorum", 
    desc: "Kuran alfabesindeki 28 harfi tanıyalım.", 
    color: "bg-emerald-500", 
    levels: [
        { id: 'u1_intro', type: "instruction", contentId: "u1_intro", label: "Bilgi Kartı" },
        { id: 'u1_l1', type: "letters", group: 1, label: "Elif - Te" },
        { id: 'u1_l2', type: "letters", group: 2, label: "Se - Ha" },
        { id: 'u1_l3', type: "letters", group: 3, label: "Hı - Zel" },
        { id: 'u1_l4', type: "letters", group: 4, label: "Ra - Sin" },
        { id: 'u1_l5', type: "letters", group: 5, label: "Şın - Dad" },
        { id: 'u1_l6', type: "letters", group: 6, label: "Tı - Ayn" },
        { id: 'u1_l7', type: "letters", group: 7, label: "Gayn - Kaf" },
        { id: 'u1_l8', type: "letters", group: 8, label: "Kef - Mim" },
        { id: 'u1_l9', type: "letters", group: 9, label: "Nun - Ye" },
        { id: 'u1_quiz', type: "quiz_unit1", label: "1. Ünite Sınavı" },
    ]
  },
  { 
    id: 2, 
    title: "2. Ünite: Harf Konumları", 
    desc: "Harflerin kelime içindeki şekillerini öğrenelim.", 
    color: "bg-cyan-500", 
    levels: [
        { id: 'u2_intro', type: "instruction", contentId: "u2_intro", label: "Bilgi Kartı" },
        { id: 'u2_l1', type: "position_group", group: 1, label: "Konumlar: 1" },
        { id: 'u2_l2', type: "position_group", group: 2, label: "Konumlar: 2" },
        { id: 'u2_l3', type: "position_group", group: 3, label: "Konumlar: 3" },
        { id: 'u2_l4', type: "position_group", group: 4, label: "Konumlar: 4" },
        { id: 'u2_l5', type: "position_group", group: 5, label: "Konumlar: 5" },
        { id: 'u2_l6', type: "position_group", group: 6, label: "Konumlar: 6" },
        { id: 'u2_l7', type: "position_group", group: 7, label: "Konumlar: 7" },
        { id: 'u2_l8', type: "position_group", group: 8, label: "Konumlar: 8" },
        { id: 'u2_l9', type: "position_group", group: 9, label: "Konumlar: 9" },
        { id: 'u2_quiz', type: "quiz_unit2", label: "2. Ünite Sınavı" },
    ]
  },
  { 
    id: 3, 
    title: "3. Ünite: Harekeler", 
    desc: "Harfleri okumaya başlayalım.", 
    color: "bg-teal-500", 
    levels: [
        { id: 'u3_intro', type: "instruction", contentId: "u3_intro", label: "Bilgi Kartı" },
        { id: 'u3_l1', type: "hareke_group", group: 1, label: "Harekeler: 1" },
        { id: 'u3_l2', type: "hareke_group", group: 2, label: "Harekeler: 2" },
        { id: 'u3_l3', type: "hareke_group", group: 3, label: "Harekeler: 3" },
        { id: 'u3_l4', type: "hareke_group", group: 4, label: "Harekeler: 4" },
        { id: 'u3_l5', type: "hareke_group", group: 5, label: "Harekeler: 5" },
        { id: 'u3_l6', type: "hareke_group", group: 6, label: "Harekeler: 6" },
        { id: 'u3_l7', type: "hareke_group", group: 7, label: "Harekeler: 7" },
        { id: 'u3_l8', type: "hareke_group", group: 8, label: "Harekeler: 8" },
        { id: 'u3_l9', type: "hareke_group", group: 9, label: "Harekeler: 9" },
        { id: 'u3_quiz', type: "quiz_unit3", label: "3. Ünite Sınavı" },
    ]
  },
  {
    id: 4,
    title: "4. Ünite: Kelime Okuma",
    desc: "Harfleri birleştirip kelimeler oluşturalım.",
    color: "bg-indigo-500", 
    levels: [
        { id: 'u4_intro', type: "instruction", contentId: "u4_intro", label: "Bilgi Kartı" },
        { id: 'u4_l1', type: "combination_easy", subType: '2letter', label: "Kolay - 1" },
        { id: 'u4_l2', type: "combination_easy", subType: '2letter', label: "Kolay - 2" },
        { id: 'u4_l3', type: "combination_easy", subType: '2letter', label: "Kolay - 3" },
        { id: 'u4_l4', type: "combination_easy", subType: '2letter', label: "Kolay - 4" },
        { id: 'u4_l5', type: "combination_easy", subType: '2letter', label: "Kolay - 5" },
        { id: 'u4_l6', type: "combination_hard", label: "Zor - 1" },
        { id: 'u4_l7', type: "combination_hard", label: "Zor - 2" },
        { id: 'u4_l8', type: "combination_hard", label: "Zor - 3" },
        { id: 'u4_l9', type: "combination_hard", label: "Zor - 4" },
        { id: 'u4_quiz', type: "quiz_unit4", label: "4. Ünite Sınavı" },
    ]
  },
  {
    id: 5,
    title: "5. Ünite: Tecvid Kuralları",
    desc: "Uzatma işaretleri ve okuma kuralları.",
    color: "bg-violet-500", 
    levels: [
        { id: 'u5_intro', type: "instruction", contentId: "u5_intro", label: "Bilgi Kartı" },
        { id: 'u5_l1', type: "combination_hard", label: "Med Harfleri" },
        { id: 'u5_l2', type: "combination_hard", label: "Cezm" },
        { id: 'u5_l3', type: "combination_hard", label: "Şedde" },
        { id: 'u5_l4', type: "combination_hard", label: "Tenvin" },
        { id: 'u5_l5', type: "combination_hard", label: "Çeker" },
        { id: 'u5_l6', type: "combination_hard", label: "Uygulama 1" },
        { id: 'u5_l7', type: "combination_hard", label: "Uygulama 2" },
        { id: 'u5_quiz', type: "quiz_unit5", label: "5. Ünite Sınavı" },
    ]
  },
  {
    id: 6,
    title: "6. Ünite: Dualar ve Sureler",
    desc: "Namaz surelerini ve duaları öğrenelim.",
    color: "bg-rose-500", 
    levels: [
        { id: 'u6_intro', type: "instruction", contentId: "u6_intro", label: "Bilgi Kartı" },
        { id: 'u6_l1', type: "prayers_common", label: "Sübhâneke" },
        { id: 'u6_l2', type: "prayers_common", label: "Fatiha" },
        { id: 'u6_l3', type: "prayers_common", label: "Kevser" },
        { id: 'u6_l4', type: "prayers_common", label: "İhlas" },
        { id: 'u6_l5', type: "prayers_common", label: "Felak" },
        { id: 'u6_l6', type: "prayers_common", label: "Nas" },
        { id: 'u6_l7', type: "prayers_common", label: "Ettehiyyatü" },
        { id: 'u6_l8', type: "prayers_common", label: "Salli-Barik" },
        { id: 'u6_l9', type: "prayers_common", label: "Rabbena" },
        { id: 'u6_quiz', type: "quiz_unit6", label: "6. Ünite Sınavı" },
    ]
  }
];

// --- 3. DERS OLUŞTURUCU MANTIĞI ---

const generateLesson = (levelConfig) => {
  let questions = [];
  let lessonTitle = "";
  
  // 1. Instruction Level Handling
  if (levelConfig.type === 'instruction') {
      const info = INSTRUCTIONS_DATABASE[levelConfig.contentId];
      return {
          id: levelConfig.id,
          title: info.title,
          type: 'instruction',
          content: info.content,
          questions: [] // No questions for instructions
      };
  }

  // 2. Vocabulary Levels
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
      return { id: levelConfig.id, title: lessonTitle, levelInfo: levelConfig, questions: questions };
  }

  // 3. Prayer Levels
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
      return { id: levelConfig.id, title: lessonTitle, levelInfo: levelConfig, questions: questions };
  }

  // 4. Position Group (Unit 2 Fix)
  if (levelConfig.type === 'position_group') {
    const lettersInUnit = ALPHABET.filter(l => l.group === levelConfig.group);
    lessonTitle = levelConfig.label;
    
    if (lettersInUnit.length === 0) return { id: levelConfig.id, title: "Ders", levelInfo: levelConfig, questions: [] };

    lettersInUnit.forEach(target => {
       const positions = ['start', 'middle', 'end'];
       positions.forEach(pos => {
           let visual = target.char;
           let posLabel = "";
           const isNonConnector = [1, 8, 9, 10, 11, 26].includes(target.id);
           
           if (pos === 'start') {
               visual = target.char + (isNonConnector ? "" : "ـ");
               posLabel = "Başta";
           } else if (pos === 'middle') {
               visual = "ـ" + target.char + (isNonConnector ? "" : "ـ");
               posLabel = "Ortada";
           } else {
               visual = "ـ" + target.char;
               posLabel = "Sonda";
           }

           const distractors = ALPHABET.filter(l => l.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
           const options = [target, ...distractors].sort(() => 0.5 - Math.random()).map(l => ({ id: l.id, text: l.name, isTextAnswer: true }));
           
           questions.push({ 
               id: `pos_${target.id}_${pos}`, 
               type: "visual_to_text", 
               prompt: `Bu şekil hangi harftir? (${posLabel})`, 
               correctId: target.id, 
               mainVisual: visual, 
               options: options 
           });
       });
    });
    return { id: levelConfig.id, title: lessonTitle, levelInfo: levelConfig, questions: questions.sort(() => 0.5 - Math.random()) };
  }

  // 5. Hareke Group (Unit 3 Fix)
  if (levelConfig.type === 'hareke_group') {
    const lettersInUnit = ALPHABET.filter(l => l.group === levelConfig.group);
    lessonTitle = levelConfig.label;
    
    // Harekeler: Üstün (E/A), Esre (İ/I), Ötre (Ü/U)
    // Kalın harfler: 7(Hı), 14(Sad), 15(Dad), 16(Tı), 17(Zı), 19(Gayn), 21(Kaf)
    const harekeler = [
        { sign: '\u064E', name: 'Üstün', soundThin: 'e', soundThick: 'a' },
        { sign: '\u0650', name: 'Esre', soundThin: 'i', soundThick: 'ı' },
        { sign: '\u064F', name: 'Ötre', soundThin: 'ü', soundThick: 'u' }
    ];

    lettersInUnit.forEach(target => {
        // Her harf için rastgele bir hareke seç
        const h = harekeler[Math.floor(Math.random() * harekeler.length)];
        const visual = target.char + h.sign;
        
        // Ses oluşturma: Harfin temel sesi + Hareke sesi
        // Örnek: 'b' + 'e' = 'be', 'k' + 'a' = 'ka'
        const vowel = target.isThick ? h.soundThick : h.soundThin;
        const correctReading = (target.sound + vowel).toUpperCase(); // "BE", "KA" gibi

        // Yanlış cevaplar üretme (Farklı harf + aynı hareke VEYA Aynı harf + farklı hareke)
        const distractors = [];
        
        // 1. Yanlış: Farklı bir harf, aynı hareke
        const randomWrongLetter = ALPHABET.filter(l => l.id !== target.id)[Math.floor(Math.random() * (ALPHABET.length - 1))];
        const wrongVowel1 = randomWrongLetter.isThick ? h.soundThick : h.soundThin;
        distractors.push({ id: 991, text: (randomWrongLetter.sound + wrongVowel1).toUpperCase(), isTextAnswer: true });

        // 2. Yanlış: Aynı harf, farklı hareke
        const wrongHareke = harekeler.find(xh => xh.name !== h.name) || harekeler[0];
        const wrongVowel2 = target.isThick ? wrongHareke.soundThick : wrongHareke.soundThin;
        distractors.push({ id: 992, text: (target.sound + wrongVowel2).toUpperCase(), isTextAnswer: true });

        // 3. Yanlış: Tamamen rastgele
        const randomWrongLetter2 = ALPHABET.filter(l => l.id !== target.id)[Math.floor(Math.random() * (ALPHABET.length - 1))];
        distractors.push({ id: 993, text: (randomWrongLetter2.sound + 'a').toUpperCase(), isTextAnswer: true }); // Basit bir yanlış

        const correctOption = { id: target.id, text: correctReading, isTextAnswer: true };
        const options = [correctOption, ...distractors].sort(() => 0.5 - Math.random());

        questions.push({
            id: `har_${target.id}_${h.name}`,
            type: "visual_to_text", // Harekeli harf göster, okunuşu seç
            prompt: `Bu harf nasıl okunur? (${h.name})`,
            correctId: target.id,
            mainVisual: visual,
            options: options
        });
    });

    return { id: levelConfig.id, title: lessonTitle, levelInfo: levelConfig, questions: questions.sort(() => 0.5 - Math.random()) };
  }

  // 6. Quiz Handling
  if (levelConfig.type.startsWith('quiz')) {
      lessonTitle = levelConfig.label;
      const quizQuestionsCount = 10;
      let targetPool = [];

      if (levelConfig.type === 'quiz_unit1') {
          targetPool = ALPHABET.map(l => ({...l, type: 'letter'}));
      } else if (levelConfig.type === 'quiz_unit2') {
          targetPool = ALPHABET.map(l => ({...l, type: 'position'}));
      } else if (levelConfig.type === 'quiz_unit3') {
          targetPool = ALPHABET.map(l => ({...l, type: 'hareke'}));
      } else if (levelConfig.type === 'quiz_unit4' || levelConfig.type === 'quiz_unit5') {
          targetPool = [...WORDS_DATABASE.easy, ...WORDS_DATABASE.hard].map(w => ({...w, type: 'word'}));
      } else {
          targetPool = PRAYERS_DATABASE.map(p => ({...p, type: 'prayer'}));
      }

      const shuffledPool = targetPool.sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < quizQuestionsCount; i++) {
          const target = shuffledPool[i % shuffledPool.length];
          let options = [];
          
          if (target.type === 'letter') {
             const distractors = ALPHABET.filter(l => l.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
             options = [target, ...distractors].sort(() => 0.5 - Math.random()).map(l => ({ id: l.id, text: l.name, isTextAnswer: true }));
             questions.push({ id: `quiz_q_${i}`, type: "visual_to_text", prompt: "Bu harf hangisidir?", correctId: target.id, mainVisual: target.char, options: options });
          } 
          else if (target.type === 'hareke') {
             // Quiz içinde hareke sorusu
             const h = { sign: '\u064E', name: 'Üstün', soundThin: 'e', soundThick: 'a' }; // Basitlik için sadece üstün soralım quizde
             const visual = target.char + h.sign;
             const vowel = target.isThick ? h.soundThick : h.soundThin;
             const correctReading = (target.sound + vowel).toUpperCase();
             const distractors = [1,2,3].map(n => ({ id: 990+n, text: '...', isTextAnswer: true })); // Basitleştirildi
             const correctOption = { id: target.id, text: correctReading, isTextAnswer: true };
             // (Daha detaylı quiz mantığı generateLesson içindeki hareke bloğuyla aynı kurulabilir)
             // Hızlıca düzeltmek için harf sorusuna fallback yapıyorum bu örnekte karmaşıklığı önlemek için
             const dists = ALPHABET.filter(l => l.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
             options = [target, ...dists].sort(() => 0.5 - Math.random()).map(l => ({ id: l.id, text: l.name, isTextAnswer: true }));
             questions.push({ id: `quiz_q_${i}`, type: "visual_to_text", prompt: "Bu harf hangisidir?", correctId: target.id, mainVisual: target.char, options: options });
          }
          else {
             // Word or Prayer
             const poolSource = target.type === 'word' ? [...WORDS_DATABASE.easy, ...WORDS_DATABASE.hard] : PRAYERS_DATABASE;
             const distractors = poolSource.filter(w => w.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3).map(w => ({ id: w.id, text: w.reading, isTextAnswer: true }));
             const correctOption = { id: target.id, text: target.reading, isTextAnswer: true };
             options = [correctOption, ...distractors].sort(() => 0.5 - Math.random());
             questions.push({ id: `quiz_q_${i}`, type: "visual_match_rev", prompt: "Bu ifade nasıl okunur?", correctId: target.id, mainVisual: target.arabic, options: options });
          }
      }
      return { id: levelConfig.id, title: lessonTitle, levelInfo: levelConfig, questions: questions };
  }

  // 7. Fallback Generic Letters (Unit 1)
  if (levelConfig.type === 'letters') {
    const lettersInUnit = ALPHABET.filter(l => l.group === levelConfig.group);
    lessonTitle = levelConfig.label;
    lettersInUnit.forEach(target => {
      const otherLetters = ALPHABET.filter(l => l.id !== target.id);
      const distractors = otherLetters.sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [target, ...distractors].sort(() => 0.5 - Math.random()).map(l => ({ id: l.id, text: l.name, isTextAnswer: true }));
      questions.push({ id: `q_${target.id}_rev`, type: "visual_to_text", prompt: `Bu harfin ismi nedir?`, correctId: target.id, mainVisual: target.char, options: options });
    });
    return { id: levelConfig.id, title: lessonTitle, levelInfo: levelConfig, questions: questions.sort(() => 0.5 - Math.random()) };
  }

  return {
    id: levelConfig.id,
    title: "Ders",
    levelInfo: levelConfig,
    questions: []
  };
};

// ============================================================================================
// 4. YARDIMCI BİLEŞENLER
// ============================================================================================

function HocaIcon({ size=28, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M12 11a4 4 0 0 0 4 2.5" /> {/* Beard Right */}
      <path d="M8 13.5A4 4 0 0 0 12 11" /> {/* Beard Left */}
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /> {/* Body */}
      <path d="M8 3.5A4 4 0 0 1 12 2a4 4 0 0 1 4 1.5" /> {/* Turban Top */}
    </svg>
  )
}

function NavItem({ icon, isActive, onClick, label }) {
  return <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-12 transition-colors ${isActive ? 'text-[#0F5132] bg-emerald-50 rounded-full p-1' : 'text-stone-400'}`}>{icon}
  <span className="text-[10px] font-medium">{label}</span>
  </button>;
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
          Kuran Öğreniyorum
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
             <label className="text-xs font-bold text-stone-500 block mb-2 text-center">Pusulayı Döndür (Simülasyon)</label>
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
          
          <button 
             onClick={increment}
             className="w-32 h-32 rounded-full bg-[#0F5132] text-white shadow-xl flex items-center justify-center active:scale-95 transition-all active:shadow-inner border-4 border-[#198754]"
          >
             <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-white/30 mb-1"></div>
                <span className="font-bold text-lg">Çek</span>
             </div>
          </button>

          <div className="flex gap-4">
             <button onClick={reset} className="p-4 bg-white text-stone-600 rounded-full shadow-md hover:bg-stone-50">
                <RotateCcw size={20} />
             </button>
             <button className="p-4 bg-white text-stone-600 rounded-full shadow-md hover:bg-stone-50">
                <Settings size={20} />
             </button>
          </div>
      </div>
    </div>
  );
}

// 2. Quran Screen (API Integrated with List and Read View)
function QuranScreen({ onBack }) {
    const [surahList, setSurahList] = useState([]);
    const [selectedSurah, setSelectedSurah] = useState(null); // Full surah metadata
    const [surahContent, setSurahContent] = useState(null); // Ayah data
    const [loading, setLoading] = useState(false);

    // Initial Fetch: List of Surahs
    useEffect(() => {
        const fetchSurahs = async () => {
            setLoading(true);
            try {
                const res = await fetch('https://api.alquran.cloud/v1/surah');
                const data = await res.json();
                if (data.code === 200) {
                    setSurahList(data.data);
                }
            } catch (e) {
                console.error("Surah listesi alınamadı", e);
            } finally {
                setLoading(false);
            }
        };
        fetchSurahs();
    }, []);

    // Detail Fetch: Selected Surah
    const handleSurahClick = async (surah) => {
        setSelectedSurah(surah);
        setLoading(true);
        try {
            // Fetch both Arabic (quran-uthmani) and Turkish Transliteration (tr.transliteration)
            const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,tr.transliteration`);
            const data = await res.json();
            if (data.code === 200 && data.data.length >= 2) {
                const arabicData = data.data[0];
                const transData = data.data[1];
                
                // Merge arrays
                const mergedContent = arabicData.ayahs.map((ayah, index) => ({
                    ...ayah,
                    transliteration: transData.ayahs[index].text
                }));
                
                setSurahContent({ ...arabicData, ayahs: mergedContent });
            }
        } catch (e) {
            console.error("Sure içeriği alınamadı", e);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (selectedSurah) {
            setSelectedSurah(null);
            setSurahContent(null);
        } else {
            onBack();
        }
    };

    return (
        <div className="flex flex-col h-full bg-stone-50">
            <div className="bg-[#0F5132] text-white p-6 pb-8 rounded-b-[30px] shadow-lg sticky top-0 z-10">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={handleBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold truncate">{selectedSurah ? selectedSurah.englishName : "Kuran-ı Kerim"}</h1>
                </div>
                {!selectedSurah && (
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl flex items-center gap-2 mt-2">
                        <BookOpen size={20} className="text-emerald-200 ml-2" />
                        <input type="text" placeholder="Sure ara..." className="bg-transparent border-none outline-none text-white placeholder-emerald-200/70 w-full" />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
                {loading && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-[#0F5132]" size={40} />
                    </div>
                )}

                {/* LIST VIEW */}
                {!selectedSurah && !loading && (
                    <div className="space-y-3">
                        {surahList.map((s) => (
                            <div key={s.number} onClick={() => handleSurahClick(s)} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99] transition-transform">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center font-bold text-[#0F5132] text-sm rotate-45 border border-stone-200">
                                        <span className="-rotate-45">{s.number}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-800">{s.englishName}</h3>
                                        <div className="flex gap-2 text-xs text-stone-500">
                                            <span>{s.revelationType === 'Meccan' ? 'Mekke' : 'Medine'}</span>
                                            <span>•</span>
                                            <span>{s.numberOfAyahs} Ayet</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <span className="text-xl font-serif text-[#0F5132] arabic-text">{s.name.replace('sūrat', '')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* READING VIEW */}
                {selectedSurah && !loading && surahContent && (
                    <div className="space-y-6">
                        {/* Bismillah (Except At-Tawba #9) */}
                        {selectedSurah.number !== 9 && (
                            <div className="text-center py-6 bg-[#0F5132]/5 rounded-2xl border border-[#0F5132]/10">
                                <span className="text-3xl font-serif text-[#0F5132] arabic-text">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
                            </div>
                        )}
                        
                        {surahContent.ayahs.map((ayah) => (
                            <div key={ayah.number} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                                <div className="flex justify-between items-start mb-4 border-b border-stone-50 pb-2">
                                    <span className="bg-stone-100 text-stone-500 text-xs px-2 py-1 rounded-md font-bold">{selectedSurah.number}:{ayah.numberInSurah}</span>
                                    <div className="flex gap-3">
                                        <button className="text-stone-300 hover:text-[#0F5132]"><PlayCircle size={18} /></button>
                                        <button className="text-stone-300 hover:text-[#0F5132]"><Bookmark size={18} /></button>
                                    </div>
                                </div>
                                <p className="text-right text-3xl leading-[2.5] font-serif text-stone-800 arabic-text dir-rtl mb-4">
                                    {ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim()} {/* Remove duplicate bismillah in API text if present */}
                                </p>
                                <p className="text-left text-sm text-stone-500 italic leading-relaxed border-t border-stone-50 pt-2">
                                    {ayah.transliteration}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// 3. Gemini Chat Screen (Modified to accept messages as props)
function GeminiChatScreen({ onBack, messages, setMessages, onReset }) {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { id: Date.now(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        const replyText = await callGemini(input, "Sen yardımsever ve bilgili bir İslami asistansın. Kullanıcının sorularını Kuran ve Sünnet ışığında cevapla.");
        
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: replyText }]);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-stone-50">
            <div className="bg-white border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={onBack}><ArrowLeft size={24} className="text-stone-600"/></button>
                    <div className="w-10 h-10 rounded-full bg-[#0F5132] flex items-center justify-center text-white">
                        <HocaIcon size={20} color="white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-stone-800">Bilge Hoca</h2>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-stone-500">Çevrimiçi</span>
                        </div>
                    </div>
                </div>
                 <button onClick={onReset} className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 transition-colors" title="Yeni Sohbet">
                    <RefreshCw size={20} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-[#0F5132] text-white rounded-br-none' : 'bg-white border border-stone-100 shadow-sm rounded-bl-none text-stone-800'}`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                         <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                             <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-75"></div>
                             <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-150"></div>
                         </div>
                    </div>
                )}
                <div ref={bottomRef}></div>
            </div>

            <div className="p-4 bg-white border-t border-stone-200">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-stone-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                        placeholder="Bir soru sor..." 
                    />
                    <button onClick={handleSend} disabled={loading} className="p-3 bg-[#0F5132] text-white rounded-xl hover:bg-[#0a3622] disabled:opacity-50">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// 4. ElifBa Tree (Snake / Duolingo Style Map)
function ElifBaTree({ startLevelFlow, onBack, completedLevels, stats }) {
    return (
        <div className="flex flex-col h-full bg-white relative overflow-hidden">
            <div className="bg-[#0F5132] text-white p-6 pb-8 rounded-b-[30px] shadow-xl sticky top-0 z-30">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><ArrowLeft size={24} /></button>
                    <h1 className="text-xl font-bold">Ders Haritası</h1>
                    <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-sm">{stats.points}</span>
                    </div>
                </div>
                <div className="flex justify-between items-end px-2">
                    <div>
                         <p className="text-emerald-100 text-sm mb-1">Toplam İlerleme</p>
                         <h2 className="text-3xl font-bold">{completedLevels.length} / 60</h2>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-32 relative z-10 bg-[#e5e7eb]"> {/* Light gray bg */}
                
                {CURRICULUM.map((unit, unitIndex) => (
                    <div key={unit.id} className="mb-8">
                        {/* Unit Header */}
                        <div className={`${unit.color} text-white p-4 rounded-xl shadow-md mb-8 text-center mx-2 sticky top-4 z-20`}>
                            <h3 className="font-bold text-lg">{unit.title}</h3>
                            <p className="text-xs opacity-90">{unit.desc}</p>
                        </div>

                        {/* Levels in Snake Shape */}
                        <div className="flex flex-col items-center gap-6 relative pb-8">
                             {unit.levels.map((level, idx) => {
                                const isCompleted = completedLevels.includes(level.id);
                                const isLocked = false;
                                const isInstruction = level.type === 'instruction';
                                
                                // Snake Offset Logic: Center -> Right -> Center -> Left
                                // 0: 0, 1: 60, 2: 0, 3: -60
                                const offset = (idx % 2 === 0) ? 0 : (idx % 4 === 1 ? 60 : -60);
                                
                                return (
                                    <div key={level.id} 
                                         className="relative flex justify-center w-full"
                                         style={{ transform: `translateX(${offset}px)` }}>
                                        
                                        {/* Simple connector line logic (optional visual aid) */}
                                        {idx < unit.levels.length - 1 && (
                                            <div className="absolute top-10 left-1/2 w-16 h-20 -z-10 pointer-events-none" style={{
                                                transform: `translateX(-50%)`,
                                            }}>
                                                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="overflow-visible">
                                                    <path d={`M50,20 Q${(idx % 4 === 0 ? 100 : (idx % 4 === 1 ? 0 : (idx % 4 === 2 ? -50 : 100)))},60 ${ (idx % 2 === 0 ? (idx % 4 === 0 ? 100 : -100) : 0 ) + 50 },100`} 
                                                          stroke="#cbd5e1" strokeWidth="8" strokeDasharray="10 10" fill="none" />
                                                </svg>
                                            </div>
                                        )}

                                        <div className="flex flex-col items-center gap-2 cursor-pointer group transition-transform hover:scale-105 active:scale-95"
                                             onClick={() => !isLocked && startLevelFlow(level)}>
                                            
                                            {/* 3D Button Effect */}
                                            <div className="relative">
                                                <div className={`w-20 h-20 rounded-full absolute top-2 left-0 z-0
                                                    ${isCompleted ? 'bg-yellow-600' : isLocked ? 'bg-stone-300' : (isInstruction ? 'bg-blue-600' : 'bg-emerald-600')}
                                                `}></div>
                                                <div className={`w-20 h-20 rounded-full flex items-center justify-center z-10 relative border-4
                                                    ${isCompleted 
                                                        ? 'bg-yellow-400 border-yellow-500' 
                                                        : isLocked 
                                                            ? 'bg-stone-200 border-stone-300' 
                                                            : (isInstruction ? 'bg-blue-500 border-blue-400' : 'bg-emerald-500 border-emerald-400')
                                                    }
                                                `}>
                                                    {isInstruction ? <Lightbulb size={32} className="text-white fill-white/20" /> :
                                                     isCompleted 
                                                        ? <Star size={40} className="text-white fill-white drop-shadow-md" /> 
                                                        : isLocked 
                                                            ? <Lock size={32} className="text-stone-400" /> 
                                                            : <Star size={40} className="text-white/40" />
                                                    }
                                                    
                                                    {isCompleted && (
                                                        <div className="absolute -top-1 -right-1 bg-white text-yellow-500 rounded-full p-1 shadow-sm border-2 border-yellow-100">
                                                            <Check size={14} strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Label */}
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-stone-300 rounded-lg top-1"></div>
                                                <span className="relative block text-xs font-bold text-stone-600 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm max-w-[120px] text-center leading-tight">
                                                    {level.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                             })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 5. Unit Intro / Instruction Screen
function UnitIntroScreen({ lessonData, onStartLesson, onBack }) {
    if (!lessonData) return null;

    if (lessonData.type === 'instruction') {
        return (
            <div className="h-full flex flex-col bg-white">
                <div className="h-1/3 bg-blue-600 relative flex items-center justify-center rounded-b-[40px] shadow-2xl overflow-hidden">
                     <div className="absolute inset-0 islamic-pattern opacity-20"></div>
                     <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-white/20 rounded-full text-white"><X size={24}/></button>
                     <div className="text-center z-10 p-6">
                         <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-white/10">
                            <Lightbulb size={40} className="text-white" />
                         </div>
                         <h1 className="text-2xl font-bold text-white mb-1">{lessonData.title}</h1>
                     </div>
                </div>
                <div className="flex-1 p-8 flex flex-col items-center">
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 shadow-sm w-full mb-8 flex-1 overflow-y-auto">
                        <p className="text-lg text-stone-700 leading-relaxed whitespace-pre-wrap">{lessonData.content}</p>
                    </div>
                    <button onClick={onStartLesson} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-transform active:scale-95">
                        Tamamla
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="h-1/2 bg-[#0F5132] relative flex items-center justify-center rounded-b-[40px] shadow-2xl overflow-hidden">
                 <div className="absolute inset-0 islamic-pattern opacity-20"></div>
                 <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-white/20 rounded-full text-white"><X size={24}/></button>
                 <div className="text-center z-10 p-6">
                     <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/10">
                        <BookOpen size={48} className="text-white" />
                     </div>
                     <h1 className="text-3xl font-bold text-white mb-2">{lessonData.title}</h1>
                     <p className="text-emerald-100">{lessonData.questions.length} Soru • ~3 Dakika</p>
                 </div>
            </div>
            <div className="flex-1 p-8 flex flex-col items-center justify-between">
                <div className="space-y-4 w-full">
                    <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><Zap size={20}/></div>
                        <div>
                            <h4 className="font-bold text-stone-800">Hızlı Öğrenme</h4>
                            <p className="text-xs text-stone-500">Görsel ve işitsel hafıza teknikleri.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Volume2 size={20}/></div>
                        <div>
                            <h4 className="font-bold text-stone-800">Sesli Telaffuz</h4>
                            <p className="text-xs text-stone-500">Doğru okunuşu dinle ve tekrar et.</p>
                        </div>
                    </div>
                </div>
                <button onClick={onStartLesson} className="w-full bg-[#0F5132] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-800 transition-transform active:scale-95">
                    Derse Başla
                </button>
            </div>
        </div>
    );
}

// 6. Lesson Screen (Oyun Döngüsü)
function LessonScreen({ lessonData, onComplete, onExit, loseHeart, hearts }) {
    // If instruction type, immediately complete (handled in UnitIntro mostly, but safe guard here)
    if (lessonData.type === 'instruction') {
        useEffect(() => { onComplete(50); }, []);
        return null; 
    }

    const [questions, setQuestions] = useState(lessonData.questions);
    const [qIndex, setQIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, correct, wrong
    const [progress, setProgress] = useState(0);

    const question = questions[qIndex];

    const handleOptionClick = (optionId) => {
        if (status !== 'idle') return;
        setSelectedOption(optionId);
        
        if (optionId === question.correctId) {
            setStatus('correct');
            new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3').play().catch(() => {}); 
        } else {
            setStatus('wrong');
            loseHeart();
            // Mistake Logic: Add clone of question to the end of the array to retry later
            setQuestions(prev => [...prev, { ...question, id: question.id + '_retry_' + Date.now() }]);
        }
    };

    const handleNext = () => {
        if (qIndex + 1 < questions.length) {
            setQIndex(qIndex + 1);
            setSelectedOption(null);
            setStatus('idle');
            // Recalculate progress based on original length or new length? 
            // Usually simpler to just step forward visually. 
            // Let's make progress bar show relative position.
            setProgress(((qIndex + 1) / questions.length) * 100);
        } else {
            onComplete(100); // 100 XP
        }
    };

    if (hearts === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-stone-50 p-6 text-center">
                <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Heart size={48} fill="currentColor" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 mb-2">Canların Bitti!</h2>
                <p className="text-stone-500 mb-8">Biraz dinlen veya pratik yaparak can kazan.</p>
                <button onClick={onExit} className="bg-stone-800 text-white px-8 py-3 rounded-xl font-bold">Ana Sayfaya Dön</button>
            </div>
        );
    }

    // Dynamic Text Sizing for Long Content (Fixed for long prayers)
    const isVeryLongText = question.mainVisual && question.mainVisual.length > 20;
    const isLongText = question.mainVisual && question.mainVisual.length > 8;
    
    // Default size is 5xl, reduce for longer texts
    const textSizeClass = isVeryLongText ? 'text-3xl leading-relaxed' : (isLongText ? 'text-4xl leading-relaxed' : 'text-5xl leading-relaxed');

    return (
        <div className="h-full flex flex-col bg-white relative">
            {/* Header */}
            <div className="px-4 py-4 flex items-center gap-4 border-b border-stone-100">
                <button onClick={onExit}><X size={24} className="text-stone-400" /></button>
                <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0F5132] transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex items-center gap-1 text-rose-500 font-bold">
                    <Heart size={20} fill="currentColor" />
                    <span>{hearts}</span>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 flex flex-col items-center p-6 overflow-y-auto pb-32">
                <h2 className="text-xl font-bold text-stone-700 mb-8 text-center">{question.prompt}</h2>
                
                {question.mainVisual && (
                    <div className="w-full max-w-xs min-h-[160px] p-6 border-2 border-dashed border-stone-200 rounded-3xl flex items-center justify-center mb-10 bg-stone-50 text-center">
                        <span className={`${textSizeClass} font-serif text-stone-800 arabic-text`}>{question.mainVisual}</span>
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 w-full">
                    {question.options.map((opt) => {
                        let btnStyle = "bg-white border-2 border-stone-200 text-stone-700 hover:bg-stone-50";
                        if (status !== 'idle') {
                            if (opt.id === question.correctId) btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-700";
                            else if (opt.id === selectedOption) btnStyle = "bg-rose-100 border-rose-500 text-rose-700";
                            else btnStyle = "bg-stone-50 border-stone-100 text-stone-300";
                        }

                        return (
                            <button 
                                key={opt.id}
                                onClick={() => handleOptionClick(opt.id)}
                                disabled={status !== 'idle'}
                                className={`p-6 rounded-2xl font-bold text-xl shadow-sm transition-all active:scale-95 ${btnStyle} flex flex-col items-center justify-center min-h-[120px]`}
                            >
                                {opt.char ? <span className="text-3xl arabic-text mb-1">{opt.char}</span> : null}
                                {opt.text}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Sheet Feedback */}
            {status !== 'idle' && (
                <div className={`fixed bottom-0 left-0 right-0 p-6 rounded-t-3xl border-t-2 animate-fade-in-up z-50 flex flex-col gap-4 max-w-md mx-auto
                    ${status === 'correct' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}
                `}>
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {status === 'correct' ? <Check size={20} /> : <X size={20} />}
                        </div>
                        <span className={`font-bold text-lg ${status === 'correct' ? 'text-emerald-800' : 'text-rose-800'}`}>
                            {status === 'correct' ? 'Harika! Doğru Cevap.' : 'Üzgünüm, Yanlış Cevap. Sonra tekrar soracağım.'}
                        </span>
                    </div>
                    <button 
                        onClick={handleNext}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg ${status === 'correct' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                    >
                        Devam Et
                    </button>
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------------------------
// MEVCUT KOD (PROFILE VE DASHBOARD)
// -------------------------------------------------------------------------

function ProfileScreen({ stats, user, onLoginClick, onLogout }) {
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const ALL_ACHIEVEMENTS = [
    { id: 1, title: "Hızlı Başlangıç", desc: "İlk 100 Puan", icon: "🚀", color: "from-yellow-50 to-orange-50", borderColor: "border-yellow-100", status: "completed", progress: 100 },
    { id: 2, title: "İlk Ders", desc: "Elif-Ba Tamamlandı", icon: "📖", color: "from-emerald-50 to-teal-50", borderColor: "border-emerald-100", status: "completed", progress: 100 },
    { id: 4, title: "7 Gün Seri", desc: "7 gün üst üste", icon: "🔥", color: "bg-stone-50", borderColor: "border-stone-200", status: "in_progress", progress: 42, current: 3, target: 7 },
  ];

  const PremiumPlansSection = () => (
    <div>
        <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 text-lg"><Crown size={20} className="text-yellow-500"/> Premium Planlar</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
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
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-center">
                    <div className="flex justify-center gap-8 mb-4 opacity-50">
                        <div className="flex flex-col items-center"><Star className="text-yellow-500 mb-1" /> <span className="font-bold text-stone-800">{stats.points}</span></div>
                        <div className="flex flex-col items-center"><Flame className="text-orange-500 mb-1" /> <span className="font-bold text-stone-800">{stats.streak}</span></div>
                    </div>
                    <p className="text-xs text-stone-400">Bu istatistikler sadece bu cihaza özeldir.</p>
                </div>
                <PremiumPlansSection />
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-stone-50 animate-fade-in scrollbar-hide">
       <div className="relative bg-gradient-to-br from-[#0F5132] to-[#064e3b] text-white pt-12 pb-36 px-6 rounded-b-[40px] shadow-2xl overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-10"></div>
          <div className="flex items-center gap-5 relative z-10">
             <div className="relative group cursor-pointer">
                <div className={`w-24 h-24 rounded-full ${user.avatarColor} border-[3px] border-white/30 group-hover:border-white/50 transition-colors flex items-center justify-center shadow-lg backdrop-blur-sm`}>
                    <User size={48} strokeWidth={1.5} />
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
                </div>
                <div className="flex flex-wrap gap-2">
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
             <div className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm"><Flame size={24} fill="currentColor" /></div>
                <span className="font-bold text-stone-800 text-xl tracking-tight mt-1">{stats.streak}</span>
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Gün Seri</span>
             </div>
          </div>
       </div>

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


// --- RESTORED COMPONENTS FROM PREVIOUS COMMIT ---


function ElifBaTree({ startLevelFlow, onBack, completedLevels, stats }) {
  const allLevelsOrder = CURRICULUM.flatMap(u => u.levels.map(l => l.id));

  return (
    <div className="flex flex-col min-h-full pb-12 bg-stone-50">
      <div className="px-4 py-4 bg-white sticky top-0 z-40 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><ArrowLeft size={24} className="text-stone-500" /></button>
            <h2 className="text-xl font-bold text-stone-800">Dersler</h2>
         </div>
         <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 min-w-[60px] justify-center">
                <Heart size={18} className="text-rose-500 fill-rose-500" />
                <span className="font-bold text-rose-600 text-sm">{stats.hearts}</span>
            </div>
            <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                <Flame size={18} className="text-orange-500 fill-orange-500" />
                <span className="font-bold text-orange-600 text-sm">{stats.streak}</span>
            </div>
         </div>
      </div>
      <div className="flex-1 flex flex-col items-center w-full animate-fade-in pb-10 mt-4">
        {CURRICULUM.map((unit) => (
          <div key={unit.id} className="w-full relative px-4 mb-8">
            <div className={`w-full p-5 rounded-2xl ${unit.color} text-white shadow-lg flex justify-between items-center mb-8 relative overflow-hidden`}>
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-4 -mt-4"></div>
               <div className="relative z-10"><h3 className="font-bold text-xl">{unit.title}</h3><p className="text-white/80 text-xs mt-1">{unit.desc}</p></div>
               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><BookOpen size={20} /></div>
            </div>
            <div className="relative w-full max-w-sm mx-auto flex flex-col items-center gap-8">
              {unit.levels.map((level, lIdx) => {
                const currentLevelGlobalIndex = allLevelsOrder.indexOf(level.id);
                const prevLevelId = currentLevelGlobalIndex > 0 ? allLevelsOrder[currentLevelGlobalIndex - 1] : null;
                const isLocked = false; 
                const isCompleted = completedLevels.includes(level.id);
                const isActive = !isLocked && !isCompleted;
                const offset = (lIdx % 2 === 0) ? -30 : 30;
                const isQuiz = level.type.startsWith('quiz');

                return (
                  <div key={level.id} className="relative z-0 transform transition-transform hover:scale-105" style={{ transform: `translateX(${isQuiz ? 0 : offset}px)` }}>
                    <button 
                      onClick={() => (!isLocked && stats.hearts > 0) ? startLevelFlow(level) : null}
                      disabled={isLocked || stats.hearts === 0}
                      className={`w-20 h-20 rounded-full flex items-center justify-center border-[6px] shadow-xl transition-all relative overflow-hidden ${isLocked ? 'bg-stone-200 border-stone-300 text-stone-400 cursor-not-allowed grayscale' : isCompleted ? 'bg-[#ffd700] border-orange-300 text-white' : isQuiz ? `bg-white border-rose-500 text-rose-500` : `bg-white border-[#20c997] text-[#0F5132]`}`}
                    >
                        {isLocked ? <Lock size={28} /> : isCompleted ? <CheckCircle size={32} fill="white" className="text-orange-500" /> : isQuiz ? <Trophy size={32} fill="currentColor" className="animate-pulse" /> : <Star size={32} fill="currentColor" />}
                    </button>
                    {!isLocked && <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-sm border border-stone-100 whitespace-nowrap z-20"><span className="text-[10px] font-bold uppercase text-stone-600">{level.label}</span></div>}
                    {isActive && stats.hearts > 0 && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 flex items-center animate-bounce z-20 pointer-events-none">
                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-[#0F5132] mr-[-1px]"></div>
                            <div className="bg-[#0F5132] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-white/20 whitespace-nowrap tracking-wider">BAŞLA</div>
                        </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UnitIntroScreen({ lessonData, onStartLesson, onBack }) {
  const isPositionLesson = lessonData.levelInfo.type.startsWith('position');
  const isHarekeLesson = lessonData.levelInfo.type.startsWith('hareke');
  const isQuiz = lessonData.levelInfo.type.startsWith('quiz');
  const lettersToShow = (isPositionLesson || isHarekeLesson) ? (lessonData.letters && lessonData.letters.length > 0 ? lessonData.letters : ALPHABET.filter(l => l.group === lessonData.levelInfo.group)) : (lessonData.letters || []);

  return (
    <div className="flex flex-col h-full bg-stone-50 animate-fade-in scrollbar-hide">
        <div className="px-4 py-4 bg-white sticky top-0 z-10 shadow-sm flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><ArrowLeft size={24} className="text-stone-500" /></button>
            <h2 className="text-xl font-bold text-stone-800">{isQuiz ? "Ünite Sınavı" : "Ders Hazırlığı"}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Info className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                <div>
                    <h3 className="font-bold text-emerald-800 text-sm mb-1">{isQuiz ? "Sınav Hakkında" : "Ders İçeriği"}</h3>
                    <p className="text-emerald-700 text-xs">
                        {isQuiz ? "Bu sınavda ünitede öğrendiğiniz tüm konular test edilecektir. Başarılar!" : isPositionLesson ? "Aşağıdaki tabloda bu gruptaki harflerin kelime başı, ortası ve sonundaki değişimlerini inceleyebilirsiniz." : isHarekeLesson ? "Harekeler, harflerin nasıl okunacağını belirler. Üstün (E/A), Esre (İ/I) ve Ötre (Ü/U) sesleri verir." : `Bu bölümde ${lessonData.levelInfo.label} konusunu işleyeceğiz.`}
                    </p>
                </div>
            </div>

            {!isQuiz && (
                isHarekeLesson ? (
                    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-4">
                        <div className="grid grid-cols-4 gap-1 bg-stone-50 p-3 text-center text-[10px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-100 sticky top-0"><div>Harf</div><div>Üstün</div><div>Esre</div><div>Ötre</div></div>
                        <div className="divide-y divide-stone-100">
                            {lettersToShow.map((l) => {
                                const soundUstun = (l.latin || "") + (l.isThick ? "A" : "E");
                                const soundEsre = (l.latin || "") + (l.isThick ? "I" : "İ");
                                const soundOtre = (l.latin || "") + (l.isThick ? "U" : "Ü");
                                return (
                                    <div key={l.id} className="grid grid-cols-4 gap-1 items-center text-center py-4 hover:bg-emerald-50/30 transition-colors">
                                        <div className="text-2xl font-serif text-stone-800">{l.char}</div>
                                        <div className="flex flex-col items-center justify-center"><div className="text-2xl font-serif text-[#0F5132]">{l.char}َ</div><div className="text-[10px] font-bold text-stone-400 opacity-60 uppercase tracking-wide">{soundUstun}</div></div>
                                        <div className="flex flex-col items-center justify-center"><div className="text-2xl font-serif text-[#0F5132]">{l.char}ِ</div><div className="text-[10px] font-bold text-stone-400 opacity-60 uppercase tracking-wide">{soundEsre}</div></div>
                                        <div className="flex flex-col items-center justify-center"><div className="text-2xl font-serif text-[#0F5132]">{l.char}ُ</div><div className="text-[10px] font-bold text-stone-400 opacity-60 uppercase tracking-wide">{soundOtre}</div></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : isPositionLesson ? (
                    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-4">
                        <div className="grid grid-cols-5 gap-1 bg-stone-50 p-3 text-center text-[10px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-100 sticky top-0"><div>Harf</div><div>Yalın</div><div>Başta</div><div>Ortada</div><div>Sonda</div></div>
                        <div className="divide-y divide-stone-100">
                            {lettersToShow.map((l) => (
                                <div key={l.id} className="grid grid-cols-5 gap-1 items-center text-center py-3 hover:bg-emerald-50/30 transition-colors">
                                    <div className="text-xs font-bold text-stone-600">{l.name}</div>
                                    <div className="font-serif text-xl text-stone-800">{l.char}</div>
                                    <div className="font-serif text-xl text-[#0F5132]">{l.char}ـ</div>
                                    <div className="font-serif text-xl text-[#0F5132]">ـ{l.char}ـ</div>
                                    <div className="font-serif text-xl text-[#0F5132]">ـ{l.char}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {lettersToShow.map((letter) => (
                            <div key={letter.id} className={`bg-white p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 shadow-sm ${letter.isThick ? 'border-amber-200 bg-amber-50/50' : 'border-stone-100'}`}>
                                <div className="text-6xl font-serif text-stone-800">{letter.char}</div>
                                <div className="text-center"><p className="font-bold text-stone-900">{letter.name}</p>{letter.isThick && <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">KALIN</span>}</div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
        <div className="p-6 bg-white border-t border-stone-100">
            <button onClick={onStartLesson} className="w-full bg-[#0F5132] hover:bg-[#0a3622] text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                {isQuiz ? "Sınava Başla" : "Derse Başla"} <ArrowRight size={20} />
            </button>
        </div>
    </div>
  );
}

function LessonScreen({ lessonData, onComplete, onExit, loseHeart, hearts, timeToNextHeart }) {
  const [questionsQueue, setQuestionsQueue] = useState(lessonData.questions);
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hint, setHint] = useState(null);
  const [loadingHint, setLoadingHint] = useState(false);
  
  const currentQ = questionsQueue[qIndex];
  // Calculate progress safely
  const progress = questionsQueue.length > 0 ? (qIndex / questionsQueue.length) * 100 : 0;

  const playAudio = () => { setIsPlaying(true); setTimeout(() => setIsPlaying(false), 1000); };
  
  useEffect(() => { 
      if (currentQ && (currentQ.type === 'audio_match' || !currentQ.mainVisual)) {
          playAudio(); 
      }
      setHint(null); 
  }, [qIndex, currentQ]);

  const getAIHint = async () => {
    if (loadingHint || hint) return;
    setLoadingHint(true);
    const lName = currentQ.letterName || "Bilinmeyen";
    const lChar = currentQ.letterChar || "?";
    const prompt = `Harf/Kelime: ${lName} (${lChar}). Mahreci veya okunuşu hakkında kısa bilgi ver.`;
    const hintText = await callGemini(prompt);
    setHint(hintText);
    setLoadingHint(false);
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    if (selectedOption === currentQ.correctId) { setFeedback('correct'); } 
    else { setFeedback('wrong'); loseHeart(); setQuestionsQueue(prev => [...prev, { ...currentQ, id: currentQ.id + '_retry' }]); }
  };

  const handleNext = () => {
    setFeedback(null); setSelectedOption(null);
    if (qIndex < questionsQueue.length - 1) setQIndex(qIndex + 1); else onComplete(20);
  };

  if (!currentQ) return null;

  if (hearts === 0) return <div className="h-full flex flex-col items-center justify-center bg-stone-900 text-white p-8 text-center"><Heart size={80} className="text-stone-700 mb-6" /><h2 className="text-3xl font-bold mb-2">Canın Kalmadı!</h2><p className="text-stone-400 mb-8">{formatTime(timeToNextHeart)} sonra dolacak.</p><button onClick={onExit} className="w-full bg-stone-700 py-4 rounded-xl font-bold">Çıkış</button></div>;

  return (
    <div className="flex flex-col h-full bg-white relative animate-fade-in scrollbar-hide">
      <div className="px-4 py-6 flex items-center gap-4">
        <button onClick={onExit}><X size={24} className="text-stone-400" /></button>
        <div className="flex-1 h-4 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-[#0F5132] transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
        <div className="flex items-center gap-1"><Heart size={24} className="text-rose-500 fill-rose-500" /><span className="font-bold text-rose-500 text-xl">{hearts}</span></div>
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
        <button onClick={getAIHint} className="absolute top-4 right-4 flex items-center gap-2 text-xs font-bold text-[#0F5132] bg-emerald-50 px-3 py-2 rounded-xl"><Sparkles size={16} />{loadingHint ? "..." : "İpucu"}</button>
        {hint && <div className="mb-6 bg-white border-2 border-emerald-100 p-4 rounded-2xl text-sm text-stone-700 max-w-xs">{hint}</div>}
        <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">{currentQ.prompt}</h2>
        
        {currentQ.mainVisual ? (
            <div className="w-full max-w-[280px] h-64 bg-emerald-50 rounded-3xl border-4 border-emerald-100 flex items-center justify-center mb-10 shadow-sm px-4 overflow-hidden">
                <span className={`font-serif text-stone-800 text-center leading-relaxed ${currentQ.mainVisual.length > 6 ? 'text-6xl' : 'text-8xl'}`}>
                    {currentQ.mainVisual}
                </span>
            </div>
        ) : (
            <button onClick={playAudio} className={`w-32 h-32 rounded-3xl shadow-lg flex items-center justify-center text-white mb-10 transition-all ${isPlaying ? 'bg-[#0F5132] scale-105' : 'bg-[#20c997] hover:bg-[#1baa80]'}`}><Volume2 size={48} /></button>
        )}

        <div className="grid grid-cols-2 gap-4 w-full">
          {currentQ.options.map((opt) => (
            <button 
                key={opt.id} 
                onClick={() => !feedback && setSelectedOption(opt.id)} 
                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${selectedOption === opt.id ? 'border-[#0F5132] bg-emerald-50 text-[#0F5132]' : 'border-stone-200 bg-white text-stone-700'} ${feedback === 'correct' && opt.id === currentQ.correctId ? '!bg-emerald-100 !border-emerald-600 !text-emerald-800' : ''} ${feedback === 'wrong' && opt.id === selectedOption ? '!bg-rose-100 !border-rose-500 !text-rose-700' : ''}`}
            >
                {opt.isTextAnswer ? (
                    <span className="text-3xl font-bold">{opt.text}</span>
                ) : (
                    <>
                        <span className="text-5xl font-serif mb-2">{opt.char}</span>
                        {opt.text && <span className="text-lg font-bold opacity-40">{opt.text}</span>}
                    </>
                )}
            </button>
          ))}
        </div>
      </div>
      <div className={`p-6 border-t ${feedback ? (feedback === 'correct' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100') : 'bg-white border-stone-100'}`}>
        {feedback ? (
          <div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm ${feedback === 'correct' ? 'text-emerald-500' : 'text-rose-500'}`}>{feedback === 'correct' ? <CheckCircle size={32} /> : <RefreshCw size={32} />}</div><div><h4 className={`font-bold text-lg ${feedback === 'correct' ? 'text-emerald-800' : 'text-rose-800'}`}>{feedback === 'correct' ? 'Harika!' : 'Hata'}</h4></div></div><button onClick={handleNext} className={`px-8 py-3 rounded-xl font-bold text-white shadow-md ${feedback === 'correct' ? 'bg-[#0F5132]' : 'bg-rose-500'}`}>DEVAM</button></div>
        ) : (
          <button onClick={handleCheck} disabled={!selectedOption} className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-md ${selectedOption ? 'bg-[#0F5132]' : 'bg-stone-200 cursor-not-allowed'}`}>KONTROL ET</button>
        )}
      </div>
    </div>
  );
}

function GeminiChatScreen({ onBack }) {
  const [messages, setMessages] = useState([{ id: 1, sender: 'bot', text: 'Selamünaleyküm! Ben Bilge Hoca.' }]);
  const [inputText, setInputText] = useState('');
  const handleSend = async () => { if(!inputText.trim()) return; setMessages(p => [...p, {id: Date.now(), sender:'user', text:inputText}]); setInputText(''); const res = await callGemini(inputText); setMessages(p => [...p, {id: Date.now()+1, sender:'bot', text:res}]); };
  return (
    <div className="flex flex-col h-full bg-stone-50 scrollbar-hide">
      <div className="px-4 py-4 bg-white sticky top-0 z-10 shadow-sm flex items-center gap-3"><button onClick={onBack}><ArrowLeft className="text-stone-500" /></button><h2 className="text-lg font-bold text-stone-800">Bilge Hoca</h2></div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">{messages.map(m => <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-[#0F5132] text-white' : 'bg-white border text-stone-800'}`}>{m.text}</div></div>)}</div>
      <div className="p-4 bg-white border-t flex gap-2"><input value={inputText} onChange={e=>setInputText(e.target.value)} className="flex-1 border rounded-xl px-4 py-2" placeholder="Sor..." /><button onClick={handleSend} className="bg-[#0F5132] text-white p-2 rounded-xl"><Send /></button></div>
    </div>
  );
}

function ZikirmatikScreen({ onBack }) {
    const [count, setCount] = useState(0);
    return (
        <div className="flex flex-col h-full bg-[#0F5132] text-white relative overflow-hidden">
            <div className="absolute inset-0 islamic-pattern opacity-10"></div>
            <div className="relative z-10 flex flex-col h-full p-6">
                <div className="pt-6 flex items-center justify-between"><button onClick={onBack} className="p-2 bg-white/10 rounded-full"><ArrowLeft /></button><h2 className="text-xl font-bold">Zikirmatik</h2><button onClick={() => setCount(0)} className="p-2 bg-white/10 rounded-full"><RotateCcw /></button></div>
                <div className="flex-1 flex flex-col items-center justify-center gap-8"><div className="w-64 h-24 bg-black/40 rounded-xl flex items-center justify-center text-6xl font-mono">{count}</div><button onClick={() => setCount(c => c + 1)} className="w-48 h-48 rounded-full bg-[#20c997] shadow-xl border-8 border-white/20 active:scale-95"></button></div>
            </div>
        </div>
    );
}

function SurahDetail({ surah, onBack }) {
  const [versesData, setVersesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurahDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,tr.diyanet`);
        const data = await response.json();
        if (data.code === 200 && data.data.length === 2) {
          const arabicVerses = data.data[0].ayahs;
          const turkishVerses = data.data[1].ayahs;
          const combined = arabicVerses.map((ayah, index) => ({
            number: ayah.numberInSurah,
            arabic: ayah.text,
            turkish: turkishVerses[index] ? turkishVerses[index].text : "Meal bulunamadı",
            audio: ayah.audio 
          }));
          setVersesData(combined);
        }
      } catch (error) {
        console.error("Sure detayları alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahDetails();
  }, [surah]);

  return (
    <div className="flex flex-col h-full bg-stone-50 animate-fade-in">
      <div className="px-4 py-4 bg-white sticky top-0 z-20 shadow-sm flex items-center justify-between border-b border-stone-100">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><ArrowLeft size={24} className="text-stone-600" /></button>
            <div><h2 className="text-lg font-bold text-stone-800">{surah.name} Suresi</h2><p className="text-xs text-stone-500">{surah.englishNameTranslation} • {surah.numberOfAyahs} Ayet</p></div>
         </div>
         <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 font-bold border border-emerald-100">{surah.number}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
         {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4"><Loader2 size={32} className="animate-spin text-emerald-600" /><p className="text-sm text-stone-400">Ayetler Diyanet'ten alınıyor...</p></div>
         ) : (
            <div className="space-y-6 pb-20">
               {surah.number !== 9 && (<div className="text-center py-6"><span className="text-3xl font-serif text-stone-800">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span></div>)}
               {versesData.map((verse) => (
                  <div key={verse.number} className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
                     <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="w-8 h-8 flex-shrink-0 bg-stone-100 rounded-full flex items-center justify-center text-xs font-bold text-stone-500 mt-1">{verse.number}</div>
                        <p className="text-right text-2xl font-serif leading-loose text-stone-800" dir="rtl">{verse.arabic}</p>
                     </div>
                     <div className="pt-4 border-t border-stone-50"><p className="text-stone-600 text-sm leading-relaxed">{verse.turkish}</p></div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
}

function QuranScreen({ onBack }) {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        if (data.code === 200) { setSurahs(data.data); }
      } catch (error) { console.error("Sure listesi alınamadı:", error); } finally { setLoading(false); }
    };
    fetchSurahs();
  }, []);

  const filteredSurahs = surahs.filter(s => s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || s.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) || String(s.number).includes(searchQuery));

  if (selectedSurah) { return <SurahDetail surah={selectedSurah} onBack={() => setSelectedSurah(null)} />; }

  return (
    <div className="flex flex-col h-full bg-stone-50 animate-fade-in">
       <div className="px-6 py-6 bg-[#0F5132] text-white sticky top-0 z-10 shadow-lg rounded-b-[30px]">
            <div className="flex items-center gap-4 mb-6"><button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><ArrowLeft size={24} /></button><h1 className="text-2xl font-bold">Kuran-ı Kerim</h1></div>
            <div className="relative">
                <input type="text" placeholder="Sure ara (Örn: Fatiha)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                <div className="absolute left-3 top-3.5 text-white/50"><BookOpen size={18} /></div>
            </div>
       </div>
       <div className="flex-1 overflow-y-auto p-4 pt-6 scrollbar-hide">
          {loading ? (
             <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>
          ) : (
             <div className="space-y-3 pb-20">
                {filteredSurahs.map((surah) => (
                   <div key={surah.number} onClick={() => setSelectedSurah(surah)} className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">{surah.number}</div>
                         <div><h3 className="font-bold text-stone-800">{surah.englishName}</h3><p className="text-xs text-stone-500">{surah.englishNameTranslation} • {surah.numberOfAyahs} Ayet</p></div>
                      </div>
                      <div className="text-right"><span className="font-serif text-xl text-stone-800 group-hover:text-emerald-600 transition-colors">{surah.name.replace('سورة', '')}</span></div>
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
}



// --- END RESTORED COMPONENTS ---


function DashboardContent({ setView, completedLevels }) {
  const [prayerTimes, setPrayerTimes] = useState({
    Imsak: "--:--", Gunes: "--:--", Ogle: "--:--", Ikindi: "--:--", Aksam: "--:--", Yatsi: "--:--"
  });
  const [nextPrayer, setNextPrayer] = useState({ name: 'Vakit', remaining: 0 });
  const [loading, setLoading] = useState(false);
  const [dailyHadith, setDailyHadith] = useState(null);

  // Set Daily Hadith based on day of year
  useEffect(() => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const hadith = HADITHS_DATABASE[dayOfYear % HADITHS_DATABASE.length];
    setDailyHadith(hadith);
  }, []);

  useEffect(() => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const hadith = HADITHS_DATABASE[dayOfYear % HADITHS_DATABASE.length];
    setDailyHadith(hadith);
  }, []);

  // Fake API data to simulate prayer times without cors issues in preview
  useEffect(() => {
    setPrayerTimes({
        Imsak: "05:42", Gunes: "07:12", Ogle: "13:08", Ikindi: "15:52", Aksam: "18:54", Yatsi: "20:18"
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (prayerTimes.Imsak === "--:--") return;
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
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
      const totalSecondsNow = currentMinutes * 60 + now.getSeconds();
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
                 <span>İstanbul, Parçalı Bulutlu 24°C</span>
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

// -------------------------------------------------------------------------
// ANA YAPI
// -------------------------------------------------------------------------

function MainAppLayout({ view, setView, stats, startLevelFlow, completedLevels, user, onLoginClick, onLogout }) {
  const isDashboard = view === 'dashboard';

  return (
    <div className="flex flex-col h-full bg-white">
      <main className="flex-1 overflow-y-auto bg-white scrollbar-hide relative">
        {view === 'dashboard' && <DashboardContent setView={setView} />}
        {view === 'elifba' && <ElifBaTree startLevelFlow={startLevelFlow} onBack={() => setView('dashboard')} completedLevels={completedLevels} stats={stats} />}
        {view === 'quran' && <QuranScreen onBack={() => setView('dashboard')} />}
        {view === 'zikirmatik' && <ZikirmatikScreen onBack={() => setView('dashboard')} />}
        {view === 'qibla' && <QiblaScreen onBack={() => setView('dashboard')} />}
        {view === 'saves' && <div className="p-8 text-center text-stone-500">Ezberler (Yakında)</div>}
        {view === 'profile' && <ProfileScreen stats={stats} user={user} onLoginClick={onLoginClick} onLogout={onLogout} />}
        {view === 'chat' && <GeminiChatScreen onBack={() => setView('dashboard')} />}
      </main>

      <nav className="bg-white border-t border-stone-100 px-2 py-2 flex justify-around items-end pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30 h-20">
        <NavItem icon={<Home size={22} />} isActive={view === 'dashboard'} onClick={() => setView('dashboard')} label="Ana Sayfa" />
        <NavItem icon={<GraduationCap size={22} />} isActive={view === 'elifba'} onClick={() => setView('elifba')} label="Dersler" />
        
        {/* CENTER BIG BUTTON: BILGE HOCA (CHAT) */}
        <div className="relative -top-6">
            <button 
                onClick={() => setView('chat')}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-transform hover:scale-105 ${view === 'chat' ? 'bg-[#0F5132] text-white' : 'bg-[#0F5132] text-white'}`}
            >
                <HocaIcon size={32} color="white" />
            </button>
        </div>

        {/* SIDE BUTTON: QURAN */}
        <NavItem icon={<BookOpen size={22} />} isActive={view === 'quran'} onClick={() => setView('quran')} label="Kuran" />
        <NavItem icon={<User size={22} />} isActive={view === 'profile'} onClick={() => setView('profile')} label="Profil" />
      </nav>
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
      default: return <SplashScreen />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 font-sans text-stone-800 max-w-md mx-auto border-x border-stone-200 shadow-2xl overflow-hidden relative">
      <style>{globalStyles}</style>
      <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
      {renderScreen()}
    </div>
  );
}
