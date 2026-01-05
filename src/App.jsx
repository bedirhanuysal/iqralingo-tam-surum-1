import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, BookOpen, GraduationCap, User, PlayCircle, Bookmark, Star, Moon, 
  ArrowRight, Mail, Lock, Eye, EyeOff, Clock, ChevronDown, ChevronUp, MapPin, 
  Loader2, ArrowLeft, RotateCcw, CheckCircle, Heart, Flame, Diamond, Volume2, 
  X, RefreshCw, MessageSquare, Sparkles, Send, Info, CloudSun, Wind, Quote, 
  Trophy, Compass, Settings, Bell, LogOut, Award, Edit3, Calendar
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
`;

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ============================================================================================
// 2. VERİ TABANI
// ============================================================================================

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
// 4. YARDIMCI BİLEŞENLER (EN ÜSTTE TANIMLANSIN)
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

// ============================================================================================
// 5. EKRAN BİLEŞENLERİ (MAIN APP'TEN ÖNCE TANIMLANSIN)
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

function ProfileScreen({ stats }) {
  // Mock user data
  const user = {
    name: "Ahmet Yılmaz",
    level: "Orta Seviye",
    joined: "Ocak 2024",
    avatarColor: "bg-indigo-100 text-indigo-600"
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 animate-fade-in scrollbar-hide">
       {/* Header Revised */}
       <div className="relative bg-gradient-to-br from-[#0F5132] to-[#064e3b] text-white pt-12 pb-20 px-6 rounded-b-[40px] shadow-2xl overflow-hidden">
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
       <div className="px-6 -mt-12 relative z-20 mb-8">
          <div className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-stone-100 flex justify-between items-center">
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
          {/* Achievements */}
          <div>
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-800 flex items-center gap-2 text-lg"><Award size={20} className="text-[#0F5132]"/> Başarılar</h3>
                <button className="text-xs font-bold text-stone-400 hover:text-[#0F5132] transition-colors">Tümünü Gör</button>
             </div>
             
             <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                <div className="min-w-[120px] bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center shadow-sm group hover:shadow-md transition-shadow cursor-pointer">
                   <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">🚀</div>
                   <div>
                       <span className="text-sm font-bold text-stone-800 block">Hızlı Başlangıç</span>
                       <span className="text-[10px] text-stone-500 font-medium">İlk 100 Puan</span>
                   </div>
                </div>
                <div className="min-w-[120px] bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center shadow-sm group hover:shadow-md transition-shadow cursor-pointer">
                   <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">📖</div>
                   <div>
                       <span className="text-sm font-bold text-stone-800 block">İlk Ders</span>
                       <span className="text-[10px] text-stone-500 font-medium">Elif-Ba Tamamlandı</span>
                   </div>
                </div>
                <div className="min-w-[120px] bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center opacity-60 grayscale group hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
                   <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-stone-300 shadow-sm"><Lock size={24} /></div>
                   <div>
                       <span className="text-sm font-bold text-stone-400 block">7 Gün Seri</span>
                       <span className="text-[10px] text-stone-400 font-medium">Kilitli</span>
                   </div>
                </div>
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
                <button className="w-full p-4 flex items-center justify-between hover:bg-rose-50/50 transition-colors text-left group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 transition-colors"><LogOut size={18} /></div>
                      <span className="text-sm font-bold text-rose-600">Çıkış Yap</span>
                   </div>
                   <ArrowRight size={18} className="text-stone-300 group-hover:text-rose-300 transition-colors" />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}

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

function DashboardContent({ setView, completedLevels }) {
  const [prayerTimes, setPrayerTimes] = useState({
    Imsak: "--:--", Gunes: "--:--", Ogle: "--:--", Ikindi: "--:--", Aksam: "--:--", Yatsi: "--:--"
  });
  const [nextPrayer, setNextPrayer] = useState({ name: 'Vakit', remaining: 0 });
  const [locationInfo, setLocationInfo] = useState({ city: "İstanbul", weather: "Parçalı Bulutlu 24°C" });
  const [loading, setLoading] = useState(false);

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
            <p className="text-sm font-medium text-stone-700 italic leading-relaxed relative z-10">
                "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz."
            </p>
            <div className="mt-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-rose-200 rounded-full flex items-center justify-center text-rose-700 text-xs font-bold">Hz</div>
                <span className="text-xs font-bold text-rose-700">Muhammed (s.a.v)</span>
            </div>
         </div>
      </div>
    </div>
  );
}

// --- 6. UYGULAMA GİRİŞ NOKTASI (EN SONDA) ---

function MainAppLayout({ view, setView, stats, startLevelFlow, completedLevels }) {
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
        {view === 'profile' && <ProfileScreen stats={stats} />}
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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash': return <SplashScreen />;
      case 'auth': return <AuthScreen onLoginSuccess={() => setCurrentScreen('app')} />;
      case 'app': 
        return <MainAppLayout 
                  view={appView} 
                  setView={setAppView} 
                  stats={{ hearts, streak, points, timeToNextHeart }} 
                  startLevelFlow={startLevelFlow}
                  completedLevels={completedLevels} 
                />;
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
