import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../data/app_data.dart';
import '../models/curriculum.dart';
import 'lesson_screen.dart';

class CourseScreen extends StatelessWidget {
  const CourseScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final completedLevels = appState.completedLevels;
    final hearts = appState.hearts;
    final streak = appState.streak;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F4),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        title: const Text(
          'Dersler',
          style: TextStyle(
            color: Color(0xFF1C1917),
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          _buildStatItem(Icons.favorite, '$hearts', const Color(0xFFF43F5E)),
          const SizedBox(width: 8),
          _buildStatItem(
            Icons.local_fire_department,
            '$streak',
            const Color(0xFFF59E0B),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.only(bottom: 40),
        itemCount: AppData.curriculum.length,
        itemBuilder: (context, index) {
          final unit = AppData.curriculum[index];
          return _buildUnitSection(context, unit, completedLevels);
        },
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUnitSection(
    BuildContext context,
    Unit unit,
    List<String> completedLevels,
  ) {
    final unitColor = Color(int.parse(unit.color));

    return Column(
      children: [
        // Unit Header
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: unitColor,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: unitColor.withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        unit.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        unit.desc,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.menu_book, color: Colors.white),
                ),
              ],
            ),
          ),
        ),

        // Lesson Path
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: unit.levels.length,
          itemBuilder: (context, index) {
            final level = unit.levels[index];
            final isEven = index % 2 == 0;
            final isQuiz = level.type.startsWith('quiz');

            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 20.0),
              child: Center(
                child: Transform.translate(
                  offset: Offset(isQuiz ? 0 : (isEven ? -30 : 30), 0),
                  child: _buildFeatureCard(
                    context: context,
                    level: level,
                    unitColor: unitColor,
                    completedLevels: completedLevels,
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildFeatureCard({
    required BuildContext context,
    required LessonLevel level,
    required Color unitColor,
    required List<String> completedLevels,
  }) {
    final bool isCompleted = completedLevels.contains(level.id);
    final isQuiz = level.type.startsWith('quiz');

    // Sequential locking logic
    bool isLocked = false;
    if (level.id != 'u1_l1') {
      // Find the previous level in the entire curriculum
      String? prevLevelId;
      outerLoop:
      for (var unit in AppData.curriculum) {
        for (var l in unit.levels) {
          if (l.id == level.id) break outerLoop;
          prevLevelId = l.id;
        }
      }
      if (prevLevelId != null && !completedLevels.contains(prevLevelId)) {
        // isLocked = true; // Disabled for development
      }
    }

    final bool isActive = !isCompleted && !isLocked;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Stack(
          alignment: Alignment.center,
          clipBehavior: Clip.none,
          children: [
            // The Button
            GestureDetector(
              onTap: isLocked
                  ? null
                  : () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => LessonScreen(level: level),
                        ),
                      );
                    },
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: isLocked
                      ? Colors.grey[200]
                      : (isCompleted ? const Color(0xFFFFD700) : Colors.white),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isLocked
                        ? const Color(0xFFD6D3D1)
                        : (isCompleted
                              ? const Color(0xFFFDBA74)
                              : (isQuiz
                                    ? Colors.pink[500]!
                                    : const Color(0xFF10B981))),
                    width: 6,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Icon(
                  isLocked
                      ? Icons.lock
                      : (isCompleted
                            ? Icons.check
                            : (isQuiz ? Icons.emoji_events : Icons.star)),
                  size: 32,
                  color: isLocked
                      ? Colors.grey[400]
                      : (isCompleted
                            ? Colors.white
                            : (isQuiz
                                  ? Colors.pink[500]
                                  : const Color(0xFF065F46))),
                ),
              ),
            ),

            // "BAŞLA" Label
            if (isActive)
              Positioned(
                left: 90,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F5132),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withOpacity(0.2)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: const Text(
                    'BAŞLA',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFF5F5F4)),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4),
            ],
          ),
          child: Text(
            level.label.toUpperCase(),
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Color(0xFF57534E),
            ),
          ),
        ),
      ],
    );
  }
}
