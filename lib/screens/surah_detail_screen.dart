import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/surah.dart';

class SurahDetailScreen extends StatefulWidget {
  final Surah surah;
  const SurahDetailScreen({super.key, required this.surah});

  @override
  State<SurahDetailScreen> createState() => _SurahDetailScreenState();
}

class _SurahDetailScreenState extends State<SurahDetailScreen> {
  List<dynamic> _ayahs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAyahs();
  }

  Future<void> _fetchAyahs() async {
    try {
      final response = await http.get(
        Uri.parse(
          'https://api.alquran.cloud/v1/surah/${widget.surah.number}/tr.diyanet',
        ),
      );
      final arabicResponse = await http.get(
        Uri.parse('https://api.alquran.cloud/v1/surah/${widget.surah.number}'),
      );

      if (response.statusCode == 200 && arabicResponse.statusCode == 200) {
        final data = json.decode(response.body);
        final arabicData = json.decode(arabicResponse.body);

        final List<dynamic> turkishAyahs = data['data']['ayahs'];
        final List<dynamic> arabicAyahs = arabicData['data']['ayahs'];

        setState(() {
          _ayahs = List.generate(turkishAyahs.length, (index) {
            return {
              'number': turkishAyahs[index]['numberInSurah'],
              'text': arabicAyahs[index]['text'],
              'translation': turkishAyahs[index]['text'],
            };
          });
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching ayahs: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F4),
      appBar: AppBar(
        title: Text(
          widget.surah.englishName,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF1C1917),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF0F5132)),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _ayahs.length,
              itemBuilder: (context, index) {
                final ayah = _ayahs[index];
                return _buildAyahCard(ayah);
              },
            ),
    );
  }

  Widget _buildAyahCard(Map<String, dynamic> ayah) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE7E5E4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Ayet ${ayah['number']}',
                  style: const TextStyle(
                    color: Color(0xFF15803D),
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
              const Icon(Icons.share_outlined, size: 18, color: Colors.grey),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            ayah['text'],
            style: GoogleFonts.amiri(
              fontSize: 24,
              color: const Color(0xFF1C1917),
            ),
            textAlign: TextAlign.right,
            textDirection: TextDirection.rtl,
          ),
          const SizedBox(height: 20),
          Text(
            ayah['translation'],
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF44403C),
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
