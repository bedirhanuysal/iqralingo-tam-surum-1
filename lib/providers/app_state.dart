import 'package:flutter/material.dart';
import '../models/user.dart';
import '../data/app_data.dart';

class AppState extends ChangeNotifier {
  UserProfile _user = AppData.mockUser;
  final List<String> _completedLevels = [];
  int _currentTabIndex = 0;
  int _lastReadPage = 1; // Default to page 1
  String _lastReadSurahName = 'Fatiha';
  int _lastReadJuz = 1;

  UserProfile get user => _user;
  List<String> get completedLevels => _completedLevels;
  int get currentTabIndex => _currentTabIndex;
  int get lastReadPage => _lastReadPage;
  String get lastReadSurahName => _lastReadSurahName;
  int get lastReadJuz => _lastReadJuz;

  void setTabIndex(int index) {
    _currentTabIndex = index;
    notifyListeners();
  }

  void setLastReadPage(int page) {
    _lastReadPage = page;
    notifyListeners();
  }

  void updateLastReadDetails(String surahName, int juz) {
    _lastReadSurahName = surahName;
    _lastReadJuz = juz;
    notifyListeners(); // Sayfa numarasını değiştirmeden sadece detayı güncellemek istersek
  }

  int get hearts => _user.hearts;
  int get points => _user.points;
  int get streak => _user.streak;

  void completeLevel(String levelId, int pointsEarned) {
    if (!_completedLevels.contains(levelId)) {
      _completedLevels.add(levelId);
      _user = UserProfile(
        name: _user.name,
        email: _user.email,
        level: _user.level,
        joined: _user.joined,
        avatarColor: _user.avatarColor,
        points: _user.points + pointsEarned,
        streak: _user.streak, // Streak logic could be more complex
        hearts: _user.hearts,
      );
      notifyListeners();
    }
  }

  void loseHeart() {
    if (_user.hearts > 0) {
      _user = UserProfile(
        name: _user.name,
        email: _user.email,
        level: _user.level,
        joined: _user.joined,
        avatarColor: _user.avatarColor,
        points: _user.points,
        streak: _user.streak,
        hearts: _user.hearts - 1,
      );
      notifyListeners();
    }
  }

  void resetHearts() {
    _user = UserProfile(
      name: _user.name,
      email: _user.email,
      level: _user.level,
      joined: _user.joined,
      avatarColor: _user.avatarColor,
      points: _user.points,
      streak: _user.streak,
      hearts: 5,
    );
    notifyListeners();
  }
}
