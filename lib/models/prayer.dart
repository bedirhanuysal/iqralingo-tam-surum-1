class WordTimestamp {
  final String arabic;
  final int startMs;
  final int endMs;
  final bool isVerseEnd;
  final bool isNewLine;

  WordTimestamp({
    required this.arabic,
    required this.startMs,
    required this.endMs,
    this.isVerseEnd = false,
    this.isNewLine = false,
  });

  factory WordTimestamp.fromJson(Map<String, dynamic> json) {
    return WordTimestamp(
      arabic: json['arabic'],
      startMs: json['startMs'],
      endMs: json['endMs'],
      isVerseEnd: json['isVerseEnd'] ?? false,
      isNewLine: json['isNewLine'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'arabic': arabic,
      'startMs': startMs,
      'endMs': endMs,
      'isVerseEnd': isVerseEnd,
      'isNewLine': isNewLine,
    };
  }
}

class Prayer {
  final String id;
  final String title;
  final List<WordTimestamp> words;
  final String audioPath;
  final String? translation;
  final String? reading;

  Prayer({
    required this.id,
    required this.title,
    required this.words,
    required this.audioPath,
    this.translation,
    this.reading,
  });

  factory Prayer.fromJson(Map<String, dynamic> json) {
    return Prayer(
      id: json['id'],
      title: json['title'],
      words: (json['words'] as List)
          .map((w) => WordTimestamp.fromJson(w))
          .toList(),
      audioPath: json['audioPath'],
      translation: json['translation'],
      reading: json['reading'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'words': words.map((w) => w.toJson()).toList(),
      'audioPath': audioPath,
      'translation': translation,
      'reading': reading,
    };
  }
}
