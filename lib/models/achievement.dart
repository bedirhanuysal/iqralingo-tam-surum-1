class Achievement {
  final int id;
  final String title;
  final String desc;
  final String icon;
  final String color;
  final String borderColor;
  final String status;
  final int progress;
  final int? current;
  final int? target;

  Achievement({
    required this.id,
    required this.title,
    required this.desc,
    required this.icon,
    required this.color,
    required this.borderColor,
    required this.status,
    required this.progress,
    this.current,
    this.target,
  });

  factory Achievement.fromJson(Map<String, dynamic> json) {
    return Achievement(
      id: json['id'],
      title: json['title'],
      desc: json['desc'],
      icon: json['icon'],
      color: json['color'],
      borderColor: json['borderColor'],
      status: json['status'],
      progress: json['progress'],
      current: json['current'],
      target: json['target'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'desc': desc,
      'icon': icon,
      'color': color,
      'borderColor': borderColor,
      'status': status,
      'progress': progress,
      'current': current,
      'target': target,
    };
  }
}
