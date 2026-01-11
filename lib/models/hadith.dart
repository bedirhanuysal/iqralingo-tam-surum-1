class Hadith {
  final String text;
  final String source;

  Hadith({required this.text, required this.source});

  factory Hadith.fromJson(Map<String, dynamic> json) {
    return Hadith(
      text: json['text'],
      source: json['source'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'text': text,
      'source': source,
    };
  }
}
