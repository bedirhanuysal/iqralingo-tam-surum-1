class AlphabetSymbol {
  final int id;
  final String char;
  final String name;
  final String latin;
  final int group;
  final bool isThick;
  final String? initial;
  final String? medial;
  final String? finalForm;
  final String? audio;

  AlphabetSymbol({
    required this.id,
    required this.char,
    required this.name,
    required this.latin,
    required this.group,
    required this.isThick,
    this.initial,
    this.medial,
    this.finalForm,
    this.audio,
  });

  factory AlphabetSymbol.fromJson(Map<String, dynamic> json) {
    return AlphabetSymbol(
      id: json['id'],
      char: json['char'],
      name: json['name'],
      latin: json['latin'],
      group: json['group'],
      isThick: json['isThick'],
      initial: json['initial'],
      medial: json['medial'],
      finalForm: json['finalForm'],
      audio: json['audio'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'char': char,
      'name': name,
      'latin': latin,
      'group': group,
      'isThick': isThick,
      'initial': initial,
      'medial': medial,
      'finalForm': finalForm,
      'audio': audio,
    };
  }
}
