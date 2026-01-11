class LessonLevel {
  final String id;
  final String type;
  final String label;
  final int? group;
  final String? subType;

  LessonLevel({
    required this.id,
    required this.type,
    required this.label,
    this.group,
    this.subType,
  });

  factory LessonLevel.fromJson(Map<String, dynamic> json) {
    return LessonLevel(
      id: json['id'],
      type: json['type'],
      label: json['label'],
      group: json['group'],
      subType: json['subType'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'label': label,
      'group': group,
      'subType': subType,
    };
  }
}

class Unit {
  final int id;
  final String title;
  final String desc;
  final String color;
  final List<LessonLevel> levels;

  Unit({
    required this.id,
    required this.title,
    required this.desc,
    required this.color,
    required this.levels,
  });

  factory Unit.fromJson(Map<String, dynamic> json) {
    return Unit(
      id: json['id'],
      title: json['title'],
      desc: json['desc'],
      color: json['color'],
      levels: (json['levels'] as List)
          .map((l) => LessonLevel.fromJson(l))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'desc': desc,
      'color': color,
      'levels': levels.map((l) => l.toJson()).toList(),
    };
  }
}
