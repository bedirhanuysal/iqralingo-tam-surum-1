class Word {
  final String id;
  final String arabic;
  final String reading;
  final String? audio;

  Word({
    required this.id,
    required this.arabic,
    required this.reading,
    this.audio,
  });

  factory Word.fromJson(Map<String, dynamic> json) {
    return Word(
      id: json['id'],
      arabic: json['arabic'],
      reading: json['reading'],
      audio: json['audio'],
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'arabic': arabic, 'reading': reading, 'audio': audio};
  }
}
