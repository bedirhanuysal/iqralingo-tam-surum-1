import 'package:flutter/material.dart';

class FeatureCircle extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color backgroundColor;
  final Color iconColor;
  final VoidCallback onTap;

  const FeatureCircle({
    super.key,
    required this.icon,
    required this.label,
    required this.backgroundColor,
    required this.iconColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: backgroundColor,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: iconColor, size: 28),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: Color(0xFF57534E), // Stone-600
            ),
          ),
        ],
      ),
    );
  }
}
