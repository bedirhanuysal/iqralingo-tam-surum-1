import 'package:flutter/material.dart';
import 'gemini_chat_screen.dart';
import 'hatim_screen.dart';
import 'zikirmatik_screen.dart';
import '../widgets/feature_circle.dart';
import '../widgets/prayer_item.dart';
import '../data/app_data.dart';
import '../models/hadith.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';

import '../services/prayer_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Hadith _dailyHadith;
  PrayerTimes? _prayerTimes;
  bool _isLoadingPrayers = true;

  @override
  void initState() {
    super.initState();
    // Simple logic to pick a hadith based on the day of the year
    final dayOfYear = DateTime.now()
        .difference(DateTime(DateTime.now().year, 1, 1))
        .inDays;
    _dailyHadith =
        AppData.hadithDatabase[dayOfYear % AppData.hadithDatabase.length];
    _fetchPrayerTimes();
  }

  Future<void> _fetchPrayerTimes() async {
    final service = PrayerService();
    final times = await service.getPrayerTimes(
      'Istanbul',
      'Turkey',
    ); // Default city
    if (mounted) {
      setState(() {
        _prayerTimes = times;
        _isLoadingPrayers = false;
      });
    }
  }

  Widget _buildStatPill(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final user = appState.user;
    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Top Header with Islamic Pattern (Simulated with Color)
            Container(
              padding: const EdgeInsets.only(
                top: 60,
                bottom: 40,
                left: 24,
                right: 24,
              ),
              decoration: const BoxDecoration(
                color: Color(0xFF0F5132),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(40),
                  bottomRight: Radius.circular(40),
                ),
              ),
              child: Column(
                children: [
                  // App Bar / Name
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'IqraLingo',
                            style: TextStyle(
                              color: Color(0xFFFFD700),
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Serif',
                            ),
                          ),
                          Text(
                            'Modern İslami Yaşam',
                            style: TextStyle(
                              color: Color(0xFFD1FAE5),
                              fontSize: 10,
                              letterSpacing: 2,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.notifications_outlined,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  // Prayer Times
                  _isLoadingPrayers
                      ? const Center(
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : _prayerTimes == null
                      ? const Text(
                          'Vakitler yüklenemedi',
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            PrayerItem(
                              name: 'İmsak',
                              time: _prayerTimes!.imsak,
                              isActive: false,
                            ),
                            PrayerItem(
                              name: 'Güneş',
                              time: _prayerTimes!.sunrise,
                              isActive: false,
                            ),
                            PrayerItem(
                              name: 'Öğle',
                              time: _prayerTimes!.dhuhr,
                              isActive: true,
                            ),
                            PrayerItem(
                              name: 'İkindi',
                              time: _prayerTimes!.asr,
                              isActive: false,
                            ),
                            PrayerItem(
                              name: 'Akşam',
                              time: _prayerTimes!.maghrib,
                              isActive: false,
                            ),
                            PrayerItem(
                              name: 'Yatsı',
                              time: _prayerTimes!.isha,
                              isActive: false,
                            ),
                          ],
                        ),
                ],
              ),
            ),
            // Header Stats (Optional: Hearts, Streak, Points)
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildStatPill(
                    Icons.favorite,
                    '${user.hearts}',
                    const Color(0xFFF43F5E),
                  ),
                  _buildStatPill(
                    Icons.local_fire_department,
                    '${user.streak}',
                    const Color(0xFFF59E0B),
                  ),
                  _buildStatPill(
                    Icons.star,
                    '${user.points}',
                    const Color(0xFFFACC15),
                  ),
                ],
              ),
            ),

            // Main Content
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Start Lesson Card
                  GestureDetector(
                    onTap: () => appState.setTabIndex(1),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFF5F5F4)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF3C7), // Amber-100
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Icon(
                              Icons.school,
                              color: Color(0xFFB45309),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Derse Başla',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                Text(
                                  'Kaldığın yerden devam et',
                                  style: TextStyle(
                                    color: Colors.grey[500],
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(
                            Icons.chevron_right,
                            color: Color(0xFFA8A29E),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Features Horizontal List
                  const Text(
                    'Özellikler',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F5132),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        FeatureCircle(
                          icon: Icons.book,
                          label: 'Kuran',
                          backgroundColor: const Color(0xFFF0FDF4),
                          iconColor: const Color(0xFF15803D),
                          onTap: () {
                            appState.setTabIndex(2);
                          },
                        ),
                        const SizedBox(width: 16),
                        FeatureCircle(
                          icon: Icons.school,
                          label: 'Dersler',
                          backgroundColor: const Color(0xFFFFF7ED),
                          iconColor: const Color(0xFFC2410C),
                          onTap: () {
                            appState.setTabIndex(1);
                          },
                        ),
                        const SizedBox(width: 16),
                        FeatureCircle(
                          icon: Icons.fingerprint_rounded,
                          label: 'Zikirmatik',
                          backgroundColor: const Color(0xFFF0FDF4),
                          iconColor: const Color(0xFF15803D),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const ZikirmatikScreen(),
                              ),
                            );
                          },
                        ),
                        const SizedBox(width: 16),
                        FeatureCircle(
                          icon: Icons.explore,
                          label: 'Kıble',
                          backgroundColor: const Color(0xFFF5F5F4),
                          iconColor: const Color(0xFF44403C),
                          onTap: () {
                            // TODO: Implement Qibla
                          },
                        ),
                        const SizedBox(width: 16),
                        FeatureCircle(
                          icon: Icons.chat_bubble,
                          label: 'Asistan',
                          backgroundColor: const Color(0xFFFAF5FF),
                          iconColor: const Color(0xFF7E22CE),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const GeminiChatScreen(),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Last Read / Quran Card
                  Container(
                    width: double.infinity,
                    height: 180,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F5132),
                      borderRadius: BorderRadius.circular(24),
                      // image: const DecorationImage(
                      //   image: NetworkImage(
                      //     'https://www.transparenttextures.com/patterns/black-paper.png',
                      //   ), // Placeholder pattern
                      //   repeat: ImageRepeat.repeat,
                      //   opacity: 0.1,
                      // ),
                    ),
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'SAYFA ${appState.lastReadPage}',
                          style: const TextStyle(
                            color: Color(0xFF34D399),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          appState.lastReadSurahName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Serif',
                          ),
                        ),
                        Text(
                          'Cüz ${appState.lastReadJuz}',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                        const Spacer(),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const HatimScreen(),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFF0F5132),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Devam Et',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Daily Hadith
                  const Text(
                    'Günün Hadisi',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F5132),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF1F2), // Rose-50
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFFFE4E6)),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          '“',
                          style: TextStyle(
                            fontSize: 64,
                            color: Color(0xFFFDA4AF),
                            fontFamily: 'Serif',
                            height: 0.5,
                          ),
                        ),
                        Text(
                          _dailyHadith.text,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 16,
                            fontStyle: FontStyle.italic,
                            color: Color(0xFF881337),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const CircleAvatar(
                              radius: 8,
                              backgroundColor: Color(0xFFF43F5E),
                              child: Icon(
                                Icons.info_outline,
                                size: 10,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _dailyHadith.source,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF9F1239),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
