import 'package:flutter/material.dart';

class PrayerItem extends StatelessWidget {
  final String name;
  final String time;
  final bool isActive;

  const PrayerItem({
    super.key,
    required this.name,
    required this.time,
    required this.isActive,
  });

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: isActive ? 1.0 : 0.6,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            name,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: Color(0xFFECFDF5), // Emerald-50
            ),
          ),
          const SizedBox(height: 4),
          Text(
            time,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isActive ? const Color(0xFFFFD700) : Colors.white,
            ),
          ),
          if (isActive)
            Container(
              margin: const EdgeInsets.only(top: 4),
              width: 4,
              height: 4,
              decoration: const BoxDecoration(
                color: Color(0xFFFFD700),
                shape: BoxShape.circle,
              ),
            ),
        ],
      ),
    );
  }
}
