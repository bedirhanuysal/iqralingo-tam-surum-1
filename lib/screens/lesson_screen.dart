import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/curriculum.dart';
import '../models/alphabet_symbol.dart';
import '../models/word.dart';
import '../data/app_data.dart';
import '../providers/app_state.dart';
import 'package:provider/provider.dart';
import 'package:audioplayers/audioplayers.dart';
import '../models/prayer.dart';
import 'dart:async';

enum LessonPhase { learning, quiz }

enum QuestionType { sound, identifyForm, selectForm }

class LessonScreen extends StatefulWidget {
  final LessonLevel level;
  const LessonScreen({super.key, required this.level});

  @override
  State<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends State<LessonScreen> {
  LessonPhase _currentPhase = LessonPhase.learning;
  final AudioPlayer _audioPlayer = AudioPlayer();

  // Quiz states
  int _currentQuestionIndex = 0;
  List<AlphabetSymbol> _quizQuestions = [];
  AlphabetSymbol? _correctAnswer;
  List<AlphabetSymbol> _options = [];

  List<Word> _quizWords = [];
  Word? _correctWord;
  List<Word> _wordOptions = [];

  bool? _isCorrect;
  int _score = 0;

  QuestionType _currentQuestionType = QuestionType.sound;
  int _targetPositionIndex = 0; // 0: yalın, 1: başta, 2: ortada, 3: sonda
  List<String> _questionTypes = [];
  String _currentHarekeType = '';

  // Prayer states
  int _activeWordIndex = -1;
  Timer? _guideTimer;
  bool _isPlaying = false;

  @override
  void initState() {
    super.initState();
    // Initialize current hareke type for learning phase audio mapping
    if (widget.level.id.startsWith('u3')) {
      _currentHarekeType = widget.level.type;
    }
    if (widget.level.type.startsWith('quiz_unit')) {
      _currentPhase = LessonPhase.quiz;
      _generateQuizQuestions();
    }
  }

  @override
  void dispose() {
    _guideTimer?.cancel();
    _audioPlayer.dispose();
    super.dispose();
  }

  void _generateQuizQuestions() {
    if (widget.level.type == 'quiz_unit3') {
      final unit3Pool = AppData.alphabet.where((l) => l.id != 28).toList();
      final types = [
        'hareke_ustun',
        'hareke_esre',
        'hareke_otre',
        'tanwin_ustun',
        'tanwin_esre',
        'tanwin_otre',
        'sedde',
        'cezim',
        'med',
      ];

      _quizQuestions = [];
      _questionTypes = [];

      final random = DateTime.now().millisecondsSinceEpoch;
      for (int i = 0; i < 35; i++) {
        final symbol = unit3Pool[(random + i * 13) % unit3Pool.length];
        final type = types[(random + i * 7) % types.length];
        _quizQuestions.add(symbol);
        _questionTypes.add(type);
      }

      // Shuffle together
      List<int> indices = List.generate(35, (index) => index)..shuffle();
      List<AlphabetSymbol> shuffledQuestions = [];
      List<String> shuffledTypes = [];
      for (int i in indices) {
        shuffledQuestions.add(_quizQuestions[i]);
        shuffledTypes.add(_questionTypes[i]);
      }
      _quizQuestions = shuffledQuestions;
      _questionTypes = shuffledTypes;
    } else {
      if (widget.level.type == 'words_group') {
        final pool =
            AppData.wordsDatabase[widget.level.id] ??
            AppData.wordsDatabase['u4_l1'] ??
            [];
        _quizWords = List.from(pool)..shuffle();
        if (_quizWords.length > 25) _quizWords = _quizWords.sublist(0, 25);
        _loadNextQuestion();
        return;
      } else if (widget.level.type == 'quiz_unit4') {
        final pool = [
          ...(AppData.wordsDatabase['u4_l1'] ?? []),
          ...(AppData.wordsDatabase['u4_l2'] ?? []),
          ...(AppData.wordsDatabase['u4_l3'] ?? []),
          ...(AppData.wordsDatabase['u4_l4'] ?? []),
        ];
        _quizWords = List.from(pool)..shuffle();
        if (_quizWords.length > 35) _quizWords = _quizWords.sublist(0, 35);
        _loadNextQuestion();
        return;
      }

      final List<AlphabetSymbol> pool =
          widget.level.type.startsWith('quiz_unit')
          ? AppData.alphabet
          : (widget.level.id.startsWith('u3')
                ? AppData.alphabet
                : AppData.alphabet
                      .where((l) => l.group == widget.level.group)
                      .toList());

      _quizQuestions = List.from(pool)..shuffle();

      // For position_group or Unit 3 (excluding unit final), ask all relevant letters
      if (widget.level.type == 'position_group' ||
          (widget.level.id.startsWith('u3') &&
              !widget.level.type.startsWith('quiz'))) {
        // Exclude Lamelif for Unit 3 harekeler if needed
        if (widget.level.id.startsWith('u3')) {
          _quizQuestions = _quizQuestions.where((l) => l.id != 28).toList();
        }
      } else if (_quizQuestions.length > 5 &&
          !widget.level.type.startsWith('quiz_unit')) {
        _quizQuestions = _quizQuestions.sublist(0, 5);
      } else if (widget.level.type.startsWith('quiz_unit')) {
        _quizQuestions = _quizQuestions.sublist(
          0,
          10,
        ); // 10 questions for unit final
      }
    }
    _loadNextQuestion();
  }

  void _loadNextQuestion() {
    if (widget.level.type == 'words_group' ||
        widget.level.id.startsWith('u4')) {
      if (_currentQuestionIndex < _quizWords.length) {
        _correctWord = _quizWords[_currentQuestionIndex];
        final List<Word> pool = widget.level.id.startsWith('u4')
            ? [
                ...(AppData.wordsDatabase['u4_l1'] ?? []),
                ...(AppData.wordsDatabase['u4_l2'] ?? []),
                ...(AppData.wordsDatabase['u4_l3'] ?? []),
                ...(AppData.wordsDatabase['u4_l4'] ?? []),
              ]
            : (AppData.wordsDatabase[widget.level.id] ??
                  AppData.wordsDatabase['u4_l1'] ??
                  []);
        List<Word> wrongOptions =
            pool.where((w) => w.id != _correctWord!.id).toList()..shuffle();

        _wordOptions = [
          _correctWord!,
          wrongOptions[0],
          wrongOptions[1],
          wrongOptions[2],
        ]..shuffle();

        _isCorrect = null;
        _currentQuestionType = QuestionType.sound;
      }
      return;
    }

    if (_currentQuestionIndex < _quizQuestions.length) {
      _correctAnswer = _quizQuestions[_currentQuestionIndex];
      final List<AlphabetSymbol> pool = AppData.alphabet;
      List<AlphabetSymbol> wrongOptions =
          pool.where((l) => l.id != _correctAnswer!.id).toList()..shuffle();

      _options = [
        _correctAnswer!,
        wrongOptions[0],
        wrongOptions[1],
        wrongOptions[2],
      ]..shuffle();

      _isCorrect = null;

      // Set current hareke type for Unit 3 mixed quiz
      if (widget.level.type == 'quiz_unit3') {
        _currentHarekeType = _questionTypes[_currentQuestionIndex];
      } else {
        _currentHarekeType = widget.level.type;
      }

      // Handle Unit 2 & 3 specific question types
      if (widget.level.id.startsWith('u3') &&
          !widget.level.type.startsWith('quiz')) {
        _currentQuestionType = QuestionType.sound;
      } else if (widget.level.type == 'quiz_unit3') {
        _currentQuestionType = QuestionType.sound;
      } else if (widget.level.type == 'position_group' ||
          widget.level.id.startsWith('u2')) {
        final random = DateTime.now().millisecond % 2;
        _currentQuestionType = random == 0
            ? QuestionType.identifyForm
            : QuestionType.selectForm;
        _targetPositionIndex =
            (DateTime.now().millisecond % 3) +
            1; // 1, 2, or 3 (Initial, Medial, Final)
      } else {
        _currentQuestionType = QuestionType.sound;
      }
    }
  }

  Future<void> _playSound(String? fileName) async {
    if (fileName == null) return;

    String finalFileName = fileName;

    // Explicit check for .mp3 suffix if not present
    if (!finalFileName.endsWith('.mp3')) {
      finalFileName += '.mp3';
    }

    // Map lesson types to audio prefixes
    if ((widget.level.id.startsWith('u3') ||
            widget.level.type == 'quiz_unit3') &&
        fileName != 'correct.mp3' &&
        fileName != 'wrong.mp3') {
      final symbol = AppData.alphabet.firstWhere(
        (l) => l.audio == fileName,
        orElse: () => AppData.alphabet[0],
      );
      String suffix = symbol.name.toLowerCase().replaceAll(' ', '_');

      // Manual mappings for specific letters provided by user
      Map<String, String> nameMappings = {
        'hı': 'hi',
        'şın': 'sin_noktali',
        'tı': 'ti',
        'zı': 'zi',
      };
      if (nameMappings.containsKey(suffix)) {
        suffix = nameMappings[suffix]!;
      }

      if (_currentHarekeType == 'hareke_ustun') {
        finalFileName = 'ustun_$suffix.mp3';
      } else if (_currentHarekeType == 'hareke_esre')
        finalFileName = 'esre_$suffix.mp3';
      else if (_currentHarekeType == 'hareke_otre')
        finalFileName = 'otre_$suffix.mp3';
      else if (_currentHarekeType == 'tanwin_ustun')
        finalFileName = 'iki_ustun_$suffix.mp3';
      else if (_currentHarekeType == 'tanwin_esre')
        finalFileName = 'iki_esre_$suffix.mp3';
      else if (_currentHarekeType == 'tanwin_otre')
        finalFileName = 'iki_otre_$suffix.mp3';
      else if (_currentHarekeType == 'sedde')
        finalFileName = 'sedde_$suffix.mp3';
      else if (_currentHarekeType == 'cezim')
        finalFileName = 'cezim_$suffix.mp3';
      else if (_currentHarekeType == 'med')
        finalFileName = 'med_$suffix.mp3';
    }

    try {
      debugPrint('Playing audio: assets/audio/$finalFileName');
      await _audioPlayer.stop();
      // Letting browser auto-detect mime-type for better resilience
      await _audioPlayer.play(AssetSource('audio/$finalFileName'));
    } catch (e) {
      debugPrint('Error playing audio ($finalFileName): $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F4),
      appBar: AppBar(
        title: Text(
          _currentPhase == LessonPhase.learning
              ? widget.level.label
              : 'Mini Test',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF1C1917),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Consumer<AppState>(
              builder: (context, appState, child) => Row(
                children: List.generate(
                  5,
                  (index) => Icon(
                    Icons.favorite,
                    size: 20,
                    color: index < appState.hearts
                        ? const Color(0xFFF43F5E)
                        : Colors.grey[300],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: _buildLessonContent(),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  Widget _buildLessonContent() {
    if (_currentPhase == LessonPhase.quiz) {
      return _buildQuizView();
    }

    if (widget.level.type == 'letters') {
      return _buildLettersLesson();
    } else if (widget.level.type == 'position_group') {
      return _buildPositionLesson();
    } else if (widget.level.type.startsWith('hareke_') ||
        widget.level.type.startsWith('tanwin_') ||
        widget.level.type == 'cezim') {
      return _buildHarekeLessonNew();
    } else if (widget.level.type == 'sedde') {
      return _buildSeddeLesson();
    } else if (widget.level.type == 'med') {
      return _buildMedLesson();
    } else if (widget.level.type == 'words_group' ||
        widget.level.type.contains('combination')) {
      return _buildWordsLesson();
    } else if (widget.level.type == 'prayer') {
      return _buildPrayerLesson();
    }
    return Center(
      child: Text('Ders içeriği yakında eklenecek: ${widget.level.label}'),
    );
  }

  Widget _buildQuizView() {
    final bool isWordQuiz =
        widget.level.type == 'words_group' || widget.level.id.startsWith('u4');
    if (isWordQuiz && _correctWord == null) return const SizedBox();
    if (!isWordQuiz && _correctAnswer == null) return const SizedBox();

    String questionText = 'Bu hangi harf?';
    if (isWordQuiz) {
      questionText = 'Bu hangi kelime?';
    }
    String positionLabel = '';
    if (_targetPositionIndex == 1) positionLabel = 'başta';
    if (_targetPositionIndex == 2) positionLabel = 'ortada';
    if (_targetPositionIndex == 3) positionLabel = 'sonda';

    if (_currentQuestionType == QuestionType.identifyForm) {
      questionText = 'Aşağıdaki form hangi harfe aittir?';
    } else if (_currentQuestionType == QuestionType.selectForm) {
      questionText =
          '${_correctAnswer!.name} harfinin ${positionLabel}ki halini seçiniz.';
    }

    return SingleChildScrollView(
      child: Column(
        children: [
          LinearProgressIndicator(
            value:
                (isWordQuiz
                    ? _currentQuestionIndex + 1
                    : _currentQuestionIndex + 1) /
                (isWordQuiz ? _quizWords.length : _quizQuestions.length),
            backgroundColor: Colors.grey[200],
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF0F5132)),
          ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  questionText,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                _buildQuizTargetSlot(),
                const SizedBox(height: 48),
                _buildQuizOptionsGrid(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuizTargetSlot() {
    if (_currentQuestionType == QuestionType.sound) {
      final audioToPlay = _correctWord != null
          ? (_correctWord!.audio ?? _correctWord!.id)
          : _correctAnswer!.audio;
      return GestureDetector(
        onTap: () => _playSound(audioToPlay),
        child: Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            color: const Color(0xFF0F5132),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0F5132).withOpacity(0.3),
                blurRadius: 20,
                spreadRadius: 5,
              ),
            ],
          ),
          child: const Icon(Icons.volume_up, color: Colors.white, size: 40),
        ),
      );
    } else if (_currentQuestionType == QuestionType.identifyForm) {
      String charToShow = _correctAnswer!.char;
      if (_targetPositionIndex == 1) {
        charToShow = _correctAnswer!.initial ?? _correctAnswer!.char;
      }
      if (_targetPositionIndex == 2) {
        charToShow = _correctAnswer!.medial ?? _correctAnswer!.char;
      }
      if (_targetPositionIndex == 3) {
        charToShow = _correctAnswer!.finalForm ?? _correctAnswer!.char;
      }

      return Container(
        width: 120,
        height: 120,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFE7E5E4)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15),
          ],
        ),
        child: Text(charToShow, style: GoogleFonts.amiri(fontSize: 64)),
      );
    } else {
      // selectForm shows Name or independent char
      return Container(
        width: 120,
        height: 120,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: const Color(0xFFFACC15).withOpacity(0.1),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFFACC15)),
        ),
        child: Text(
          _correctAnswer!.char,
          style: GoogleFonts.amiri(fontSize: 64),
        ),
      );
    }
  }

  Widget _buildQuizOptionsGrid() {
    final bool isWordQuiz =
        widget.level.type == 'words_group' || widget.level.id.startsWith('u4');
    final optionsCount = isWordQuiz ? _wordOptions.length : _options.length;

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.5,
      ),
      itemCount: optionsCount,
      itemBuilder: (context, index) {
        final option = isWordQuiz ? _wordOptions[index] : _options[index];
        final correctAns = isWordQuiz ? _correctWord : _correctAnswer;
        Widget optionContent;

        if (isWordQuiz) {
          optionContent = Text(
            (option as Word).arabic,
            style: GoogleFonts.amiri(fontSize: 24),
            textAlign: TextAlign.center,
          );
        } else if (widget.level.id.startsWith('u3') ||
            widget.level.type == 'quiz_unit3') {
          final symbolOption = option as AlphabetSymbol;
          final mark = _getMarkForType(_currentHarekeType);
          if (_currentHarekeType == 'cezim') {
            optionContent = _buildColorizedRichText(
              "اَ${symbolOption.char}$mark",
              28,
            );
          } else if (_currentHarekeType == 'sedde') {
            optionContent = _buildColorizedRichText(
              "اَ${symbolOption.char}ّ",
              28,
            );
          } else if (_currentHarekeType == 'med') {
            optionContent = Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildColorizedRichText("${symbolOption.char}ُو ", 18),
                _buildColorizedRichText("${symbolOption.char}ِي ", 18),
                _buildColorizedRichText("${symbolOption.char}َا", 18),
              ],
            );
          } else {
            optionContent = _buildColorizedRichText(
              "${symbolOption.char}$mark",
              32,
            );
          }
        } else {
          final symbolOption = option as AlphabetSymbol;
          String displayText = symbolOption.char;
          if (_currentQuestionType == QuestionType.selectForm) {
            if (_targetPositionIndex == 1) {
              displayText = symbolOption.initial ?? symbolOption.char;
            }
            if (_targetPositionIndex == 2) {
              displayText = symbolOption.medial ?? symbolOption.char;
            }
            if (_targetPositionIndex == 3) {
              displayText = symbolOption.finalForm ?? symbolOption.char;
            }
          }
          optionContent = Text(
            displayText,
            style: GoogleFonts.amiri(fontSize: 32),
          );
        }

        return ElevatedButton(
          onPressed: _isCorrect != null
              ? null
              : () {
                  setState(() {
                    if (option == correctAns) {
                      _isCorrect = true;
                      _score++;
                      _playSound('correct.mp3');
                    } else {
                      _isCorrect = false;
                      Provider.of<AppState>(context, listen: false).loseHeart();
                      _playSound('wrong.mp3');
                    }
                  });
                },
          style: ElevatedButton.styleFrom(
            backgroundColor: _isCorrect != null
                ? (option == correctAns
                      ? Colors.green[100]
                      : (option != correctAns && _isCorrect == false
                            ? Colors.red[50]
                            : Colors.white))
                : Colors.white,
            foregroundColor: Colors.black,
            side: BorderSide(
              color: _isCorrect != null
                  ? (option == correctAns
                        ? Colors.green
                        : (option != correctAns && _isCorrect == false
                              ? Colors.red
                              : const Color(0xFFE7E5E4)))
                  : const Color(0xFFE7E5E4),
              width: 2,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            elevation: 0,
          ),
          child: optionContent,
        );
      },
    );
  }

  Widget _buildPositionLesson() {
    final groupLetters = AppData.alphabet
        .where((l) => l.group == widget.level.group)
        .toList();

    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: groupLetters.length,
      itemBuilder: (context, index) {
        final symbol = groupLetters[index];
        return _buildPositionCard(symbol);
      },
    );
  }

  Widget _buildPositionCard(AlphabetSymbol symbol) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE7E5E4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                symbol.name,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1C1917),
                ),
              ),
              IconButton(
                onPressed: () => _playSound(symbol.audio),
                icon: const Icon(Icons.volume_up, color: Color(0xFF0F5132)),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildFormItem('Sonda', symbol.finalForm ?? symbol.char),
              _buildFormItem('Ortada', symbol.medial ?? symbol.char),
              _buildFormItem('Başta', symbol.initial ?? symbol.char),
              _buildFormItem('Yalın', symbol.char),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLettersLesson() {
    final groupLetters = AppData.alphabet
        .where((l) => l.group == widget.level.group)
        .toList();

    return GridView.builder(
      padding: const EdgeInsets.all(24),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1,
      ),
      itemCount: groupLetters.length,
      itemBuilder: (context, index) {
        final symbol = groupLetters[index];
        return InkWell(
          onTap: () => _playSound(symbol.audio),
          child: _buildSymbolCard(symbol),
        );
      },
    );
  }

  Widget _buildSymbolCard(AlphabetSymbol symbol) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE7E5E4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(symbol.char, style: GoogleFonts.amiri(fontSize: 40)),
          const SizedBox(height: 4),
          Text(
            symbol.name,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.grey,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWordsLesson() {
    final words =
        AppData.wordsDatabase[widget.level.id] ??
        AppData.wordsDatabase['u4_l1'] ??
        [];

    // If it's words_group (Unit 4), use a grid layout as requested
    if (widget.level.type == 'words_group') {
      return GridView.builder(
        padding: const EdgeInsets.all(24),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.2,
        ),
        itemCount: words.length,
        itemBuilder: (context, index) {
          final word = words[index];
          return InkWell(
            onTap: () => _playSound(word.audio ?? word.id),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE7E5E4)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Center(child: _buildColorizedRichText(word.arabic, 24)),
            ),
          );
        },
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: words.length,
      itemBuilder: (context, index) {
        final word = words[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            onTap: () => _playSound(word.audio ?? word.id),
            title: _buildColorizedRichText(
              word.arabic,
              24,
              textAlign: TextAlign.right,
            ),
            subtitle: Text(word.reading),
            trailing: const Icon(Icons.volume_up),
          ),
        );
      },
    );
  }

  Widget _buildBottomBar() {
    String label = 'TAMAMLA VE DEVAM ET';
    final bool isWordQuiz =
        widget.level.type == 'words_group' || widget.level.id.startsWith('u4');

    if (_currentPhase == LessonPhase.learning &&
        (widget.level.type == 'letters' ||
            widget.level.type == 'position_group' ||
            widget.level.id.startsWith('u3') ||
            widget.level.type == 'words_group')) {
      label = 'ÖĞRENDİM, TESTE GEÇ';
    } else if (_currentPhase == LessonPhase.quiz) {
      if (_isCorrect == null) {
        return const SizedBox.shrink();
      }
      final int totalQuestions = isWordQuiz
          ? _quizWords.length
          : _quizQuestions.length;
      if (_currentQuestionIndex < totalQuestions - 1) {
        label = 'SONRAKİ SORU';
      } else {
        label = 'SONUÇLARI GÖR';
      }
    }

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE7E5E4))),
      ),
      child: ElevatedButton(
        onPressed: () {
          if (_currentPhase == LessonPhase.learning &&
              (widget.level.type == 'letters' ||
                  widget.level.type == 'position_group' ||
                  widget.level.id.startsWith('u3') ||
                  widget.level.type == 'words_group')) {
            setState(() {
              _currentPhase = LessonPhase.quiz;
              _generateQuizQuestions();
            });
          } else if (_currentPhase == LessonPhase.quiz) {
            final int totalQuestions = isWordQuiz
                ? _quizWords.length
                : _quizQuestions.length;
            if (_currentQuestionIndex < totalQuestions - 1) {
              setState(() {
                _currentQuestionIndex++;
                _loadNextQuestion();
              });
            } else {
              _showQuizResult();
            }
          } else {
            _completeLesson();
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF0F5132),
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 56),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
      ),
    );
  }

  void _showQuizResult() {
    final bool isWordQuiz =
        widget.level.type == 'words_group' || widget.level.id.startsWith('u4');
    final int totalQuestions = isWordQuiz
        ? _quizWords.length
        : _quizQuestions.length;

    final double successRate = (totalQuestions > 0)
        ? (_score / totalQuestions) * 100
        : 0;

    // Success threshold: Unit 1 Final %90, Unit 2 levels %80, Unit 3 levels %80, Others %60
    double threshold = 60;
    if (widget.level.id.startsWith('u1') &&
        widget.level.type.contains('quiz')) {
      threshold = 90;
    } else if (widget.level.id.startsWith('u2')) {
      threshold = 80;
    } else if (widget.level.id.startsWith('u3')) {
      threshold = 80;
    } else if (widget.level.id.startsWith('u4')) {
      threshold = 70; // Example threshold for Unit 4
    }

    final bool isPassed = successRate >= threshold;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Text(
          'Başarı Oranı: %${successRate.toInt()}\n${isPassed ? 'Harika iş çıkardın!' : 'Biraz daha çalışmalısın. %${threshold.toInt()} başarı gerekiyor.'}',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Dialog
              if (isPassed) {
                _completeLesson();
              } else {
                Navigator.pop(context); // Lesson
              }
            },
            child: Text(isPassed ? 'DEVAM ET' : 'TEKRAR DENE'),
          ),
        ],
      ),
    );
  }

  Widget _buildHarekeLessonNew() {
    final letters = AppData.alphabet.where((l) => l.id != 28).toList();
    final mark = _getMarkForType(widget.level.type);
    final bool isCezim = widget.level.type == 'cezim';

    return GridView.builder(
      padding: const EdgeInsets.all(24),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1,
      ),
      itemCount: letters.length,
      itemBuilder: (context, index) {
        final symbol = letters[index];
        final displayText = isCezim
            ? "اَ${symbol.char}$mark"
            : "${symbol.char}$mark";
        return InkWell(
          onTap: () => _playSound(symbol.audio),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE7E5E4)),
            ),
            child: Center(child: _buildColorizedRichText(displayText, 32)),
          ),
        );
      },
    );
  }

  Widget _buildFormItem(String label, String char) {
    return Column(
      children: [
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[500])),
        const SizedBox(height: 8),
        Text(char, style: GoogleFonts.amiri(fontSize: 32)),
      ],
    );
  }

  Widget _buildSeddeLesson() {
    final letters = AppData.alphabet.where((l) => l.id != 28).toList();

    return GridView.builder(
      padding: const EdgeInsets.all(24),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.8,
      ),
      itemCount: letters.length,
      itemBuilder: (context, index) {
        final symbol = letters[index];
        return InkWell(
          onTap: () => _playSound(symbol.audio),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE7E5E4)),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildColorizedRichText(
                  "اَ${symbol.char}ّ", // Elif with Fatha + Letter with Shadda
                  32,
                ),
                Text(
                  "e${symbol.name.toLowerCase()}e",
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildMedLesson() {
    final letters = AppData.alphabet.where((l) => l.id != 28).toList();

    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: letters.length,
      itemBuilder: (context, index) {
        final symbol = letters[index];
        return InkWell(
          onTap: () => _playSound(symbol.audio),
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE7E5E4)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildColorizedRichText("${symbol.char}ُو", 32), // Otre + Vav
                _buildColorizedRichText("${symbol.char}ِي", 32), // Esre + Ye
                _buildColorizedRichText("${symbol.char}َا", 32), // Ustun + Elif
                Text(
                  symbol.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _getMarkForType(String type) {
    switch (type) {
      case 'hareke_ustun':
        return 'َ';
      case 'hareke_esre':
        return 'ِ';
      case 'hareke_otre':
        return 'ُ';
      case 'tanwin_ustun':
        return 'ً';
      case 'tanwin_esre':
        return 'ٍ';
      case 'tanwin_otre':
        return 'ٌ';
      case 'cezim':
        return 'ْ';
      default:
        return '';
    }
  }

  void _completeLesson() {
    final appState = Provider.of<AppState>(context, listen: false);
    appState.completeLevel(widget.level.id, 10);
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${widget.level.label} tamamlandı! +10 Puan'),
        backgroundColor: const Color(0xFF0F5132),
      ),
    );
  }

  Widget _buildPrayerLesson() {
    final prayers = AppData.prayersDatabase[widget.level.id];
    if (prayers == null || prayers.isEmpty) {
      return const Center(child: Text('Dua verisi bulunamadı.'));
    }

    final prayer = prayers[0];

    // Kelimeleri satırlara böl
    List<List<int>> lines = [[]];
    for (int i = 0; i < prayer.words.length; i++) {
      lines.last.add(i);
      if (prayer.words[i].isNewLine && i < prayer.words.length - 1) {
        lines.add([]);
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 15,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Column(
                      children: lines.map((lineIndices) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12.0),
                          child: Wrap(
                            alignment: WrapAlignment.center,
                            spacing: 8,
                            runSpacing: 12,
                            direction: Axis.horizontal,
                            textDirection: TextDirection.rtl,
                            children: lineIndices.map((index) {
                              final word = prayer.words[index];
                              final isHighlighted = index == _activeWordIndex;

                              return Row(
                                mainAxisSize: MainAxisSize.min,
                                textDirection: TextDirection.rtl,
                                children: [
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 300),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isHighlighted
                                          ? Colors.blue.withOpacity(0.1)
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color: isHighlighted
                                            ? Colors.blue
                                            : Colors.transparent,
                                        width: 2,
                                      ),
                                    ),
                                    child: Text(
                                      word.arabic,
                                      textAlign: TextAlign.center,
                                      style: GoogleFonts.amiri(
                                        fontSize: 28,
                                        fontWeight: FontWeight.bold,
                                        color: isHighlighted
                                            ? Colors.blue
                                            : Colors.black87,
                                      ),
                                    ),
                                  ),
                                  if (word.isVerseEnd)
                                    Padding(
                                      padding: const EdgeInsets.only(
                                        right: 4.0,
                                      ),
                                      child: Text(
                                        '۝',
                                        style: GoogleFonts.amiri(
                                          fontSize: 24,
                                          color: Colors.orange.shade800,
                                        ),
                                      ),
                                    ),
                                ],
                              );
                            }).toList(),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 24),
                  if (prayer.reading != null)
                    Text(
                      prayer.reading!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 16,
                        fontStyle: FontStyle.italic,
                        color: Colors.black54,
                      ),
                    ),
                  if (prayer.translation != null) ...[
                    const SizedBox(height: 16),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.green.shade50.withOpacity(0.5),
                            Colors.blue.shade50.withOpacity(0.5),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: Colors.green.withOpacity(0.15),
                          width: 1.5,
                        ),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.auto_stories_outlined,
                                size: 18,
                                color: Colors.green.shade700,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                "TÜRKÇE MEALİ",
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.2,
                                  color: Colors.green.shade800,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            prayer.translation!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 15,
                              color: Colors.black87,
                              height: 1.6,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _isPlaying ? null : () => _startGuideMode(prayer),
            icon: Icon(_isPlaying ? Icons.hourglass_bottom : Icons.play_arrow),
            label: Text(
              _isPlaying ? 'Rehber Devam Ediyor...' : 'REHBERİ BAŞLAT',
            ),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Future<void> _startGuideMode(Prayer prayer) async {
    setState(() {
      _isPlaying = true;
      _activeWordIndex = 0;
    });

    for (int i = 0; i < prayer.words.length; i++) {
      if (!mounted || !_isPlaying) break;

      setState(() {
        _activeWordIndex = i;
      });

      final word = prayer.words[i];
      final duration = word.endMs - word.startMs;
      await Future.delayed(Duration(milliseconds: duration));
    }

    if (mounted) {
      setState(() {
        _isPlaying = false;
        _activeWordIndex = -1;
      });

      // Bittiğinde opsiyonel olarak bir geri bildirim verebiliriz
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Rehber tamamlandı! Şimdi kaydınızı alabilirsiniz.'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  Widget _buildColorizedRichText(
    String text,
    double fontSize, {
    TextAlign textAlign = TextAlign.center,
  }) {
    List<TextSpan> spans = [];

    // Unicode Hareke Kodları
    const String fatha = '\u064E'; // Üstün
    const String kasra = '\u0650'; // Esre
    const String damma = '\u064F'; // Ötre
    const String shadda = '\u0651'; // Şedde
    const String sukun = '\u0652'; // Cezim
    const String fathatan = '\u064B'; // İki Üstün
    const String kasratan = '\u064D'; // İki Esre
    const String dammatan = '\u064C'; // İki Ötre

    for (int i = 0; i < text.length; i++) {
      String char = text[i];
      Color color = Colors.black; // Varsayılan harf rengi

      if (char == fatha || char == fathatan) {
        color = Colors.blue; // Üstün - Mavi
      } else if (char == kasra || char == kasratan) {
        color = Colors.red; // Esre - Kırmızı
      } else if (char == damma || char == dammatan) {
        color = Colors.green; // Ötre - Yeşil
      } else if (char == shadda) {
        color = Colors.pink; // Şedde - Pembe
      } else if (char == sukun) {
        color = Colors.orange; // Cezim - Turuncu
      }

      spans.add(
        TextSpan(
          text: char,
          style: GoogleFonts.amiri(fontSize: fontSize, color: color),
        ),
      );
    }

    return RichText(
      textAlign: textAlign,
      text: TextSpan(children: spans),
      textDirection: TextDirection.rtl,
    );
  }
}
