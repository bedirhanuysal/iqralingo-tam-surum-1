import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'dart:convert';
import '../providers/app_state.dart';

class QuranPageWidget extends StatefulWidget {
  final int pageNumber;

  const QuranPageWidget({super.key, required this.pageNumber});

  @override
  State<QuranPageWidget> createState() => _QuranPageWidgetState();
}

class _QuranPageWidgetState extends State<QuranPageWidget> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _ayahs = [];
  Map<String, dynamic>? _pageMeta;

  @override
  void initState() {
    super.initState();
    _fetchPageData();
  }

  Future<void> _fetchPageData() async {
    try {
      final response = await http.get(
        Uri.parse(
          'http://api.alquran.cloud/v1/page/${widget.pageNumber}/quran-uthmani',
        ),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['code'] == 200) {
          final pageData = data['data'];

          if (mounted) {
            setState(() {
              _ayahs = pageData['ayahs'];
              if (_ayahs.isNotEmpty) {
                _pageMeta = {
                  'surah': _ayahs.first['surah']['name'],
                  'surahEnglish': _ayahs.first['surah']['englishName'],
                  'juz': _ayahs.first['juz'],
                  'page': widget.pageNumber,
                };
              }
              _isLoading = false;
            });

            // Update app state with reading details
            if (_ayahs.isNotEmpty) {
              final appState = Provider.of<AppState>(context, listen: false);
              appState.updateLastReadDetails(
                _ayahs.first['surah']['englishName'],
                _ayahs.first['juz'],
              );
            }
          }
        } else {
          throw Exception('API Error');
        }
      } else {
        throw Exception('Network Error');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Hata oluştu. Lütfen internetinizi kontrol edin.';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF0F5132)),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: Colors.red, size: 48),
            const SizedBox(height: 16),
            Text(_error!, style: const TextStyle(color: Colors.grey)),
            TextButton(
              onPressed: () {
                setState(() {
                  _isLoading = true;
                  _error = null;
                });
                _fetchPageData();
              },
              child: const Text('Tekrar Dene'),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        // Üst Bilgi Çubuğu
        Container(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
          color: const Color(0xFFF5F5F4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Cüz ${_pageMeta?['juz'] ?? '-'}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F5132),
                ),
              ),
              Text(
                'Sayfa ${widget.pageNumber}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(
                _pageMeta?['surah'] ?? '', // Arapça sure ismi
                style: GoogleFonts.amiri(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                textDirection: TextDirection.rtl,
              ),
            ],
          ),
        ),

        // Ayetler
        Expanded(
          child: Container(
            color: const Color(0xFFFFFBEB), // Kağıt rengi
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: RichText(
                textAlign: TextAlign.justify,
                textDirection: TextDirection.rtl,
                text: TextSpan(
                  children: _ayahs.map<InlineSpan>((ayah) {
                    final text = ayah['text'];
                    final number = ayah['numberInSurah'];

                    // Besmele kontrolü (Basitçe, metnin başında varsa ve numara 1 ise belki ayırabiliriz,
                    // şimdilik direk gösteriyoruz çünkü font güzel render ediyor)

                    return TextSpan(
                      children: [
                        TextSpan(
                          text: '$text ',
                          style: GoogleFonts.amiri(
                            fontSize: 22,
                            color: Colors.black,
                            height: 1.8,
                          ),
                        ),
                        WidgetSpan(
                          alignment: PlaceholderAlignment.middle,
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: 25,
                            height: 25,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: const Color(0xFF0F5132),
                                width: 1,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                '$number',
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: Color(0xFF0F5132),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const TextSpan(text: '  '),
                      ],
                    );
                  }).toList(),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
