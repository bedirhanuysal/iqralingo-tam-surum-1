import 'package:flutter/material.dart';
import 'screens/dashboard_screen.dart';
import 'screens/course_screen.dart';
import 'screens/quran_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/gemini_chat_screen.dart';

import 'package:provider/provider.dart';
import 'providers/app_state.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (context) => AppState(),
      child: const IqraLingoApp(),
    ),
  );
}

class IqraLingoApp extends StatelessWidget {
  const IqraLingoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'IqraLingo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F5132),
          primary: const Color(0xFF0F5132),
          secondary: const Color(0xFF20C997),
          surface: const Color(0xFFF5F5F4),
        ),
        fontFamily: 'Roboto',
      ),
      home: const MainAppLayout(),
    );
  }
}

class MainAppLayout extends StatefulWidget {
  const MainAppLayout({super.key});

  @override
  State<MainAppLayout> createState() => _MainAppLayoutState();
}

class _MainAppLayoutState extends State<MainAppLayout> {
  final List<Widget> _screens = [
    const DashboardScreen(),
    const CourseScreen(),
    const QuranScreen(),
    const ProfileScreen(),
  ];

  void _onItemTapped(int index, AppState appState) {
    appState.setTabIndex(index);
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final selectedIndex = appState.currentTabIndex;

    return Scaffold(
      body: IndexedStack(index: selectedIndex, children: _screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 40,
              offset: const Offset(0, -10),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: selectedIndex,
          onTap: (index) => _onItemTapped(index, appState),
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          unselectedItemColor: Colors.grey[400],
          selectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
          unselectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w500,
            fontSize: 12,
          ),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Ana Sayfa',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.school_outlined),
              activeIcon: Icon(Icons.school),
              label: 'Dersler',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.book_outlined),
              activeIcon: Icon(Icons.book),
              label: 'Kuran',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profil',
            ),
          ],
        ),
      ),
      floatingActionButton: selectedIndex == 0
          ? FloatingActionButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const GeminiChatScreen(),
                  ),
                );
              },
              backgroundColor: const Color(0xFF0F5132),
              shape: const CircleBorder(),
              child: const Icon(Icons.message_outlined, color: Colors.white),
            )
          : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }
}
