import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ZikirmatikScreen extends StatefulWidget {
  const ZikirmatikScreen({super.key});

  @override
  State<ZikirmatikScreen> createState() => _ZikirmatikScreenState();
}

class _ZikirmatikScreenState extends State<ZikirmatikScreen> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
    HapticFeedback.mediumImpact();
  }

  void _resetCounter() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sıfırla'),
        content: const Text('Sayacı sıfırlamak istediğinize emin misiniz?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                _counter = 0;
              });
              Navigator.pop(context);
              HapticFeedback.lightImpact();
            },
            child: const Text('Sıfırla', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F4),
      appBar: AppBar(
        title: const Text(
          'Zikirmatik',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Counter Display Area
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(40),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const Text(
                    'ZİKİR SAYISI',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _counter.toString().padLeft(4, '0'),
                    style: const TextStyle(
                      fontSize: 72,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Courier', // Monospace font for digital look
                      color: Color(0xFF0F5132),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 60),

            // Main Increment Button
            GestureDetector(
              onTap: _incrementCounter,
              child: Container(
                width: 220,
                height: 220,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF0F5132),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F5132).withOpacity(0.3),
                      blurRadius: 30,
                      spreadRadius: 5,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 170,
                      height: 170,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white.withOpacity(0.1),
                          width: 15,
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.touch_app_rounded,
                          size: 60,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 40),

            // Action Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  onPressed: _resetCounter,
                  icon: const Icon(Icons.refresh_rounded),
                  iconSize: 32,
                  color: Colors.grey[600],
                  tooltip: 'Sıfırla',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
