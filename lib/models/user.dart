class UserProfile {
  final String name;
  final String email;
  final String level;
  final String joined;
  final String avatarColor;
  final int points;
  final int streak;
  final int hearts;

  UserProfile({
    required this.name,
    required this.email,
    required this.level,
    required this.joined,
    required this.avatarColor,
    required this.points,
    required this.streak,
    required this.hearts,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      name: json['name'],
      email: json['email'],
      level: json['level'],
      joined: json['joined'],
      avatarColor: json['avatarColor'],
      points: json['points'],
      streak: json['streak'],
      hearts: json['hearts'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'level': level,
      'joined': joined,
      'avatarColor': avatarColor,
      'points': points,
      'streak': streak,
      'hearts': hearts,
    };
  }
}
