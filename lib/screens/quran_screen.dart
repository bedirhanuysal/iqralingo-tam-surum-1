import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/surah.dart';
import 'surah_detail_screen.dart';
import 'hatim_screen.dart';

class QuranScreen extends StatefulWidget {
  const QuranScreen({super.key});

  @override
  State<QuranScreen> createState() => _QuranScreenState();
}

class _QuranScreenState extends State<QuranScreen> {
  List<Surah> _surahs = [];
  List<Surah> _filteredSurahs = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchSurahs();
  }

  Future<void> _fetchSurahs() async {
    try {
      final response = await http.get(
        Uri.parse('https://api.alquran.cloud/v1/surah'),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['code'] == 200) {
          final List<dynamic> surahList = data['data'];
          setState(() {
            _surahs = surahList.map((s) => Surah.fromJson(s)).toList();
            _filteredSurahs = _surahs;
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching surahs: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _filterSurahs(String query) {
    setState(() {
      _filteredSurahs = _surahs.where((s) {
        return s.englishName.toLowerCase().contains(query.toLowerCase()) ||
            s.englishNameTranslation.toLowerCase().contains(
              query.toLowerCase(),
            ) ||
            s.number.toString().contains(query);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFFF5F5F4),
        body: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.only(
                top: 60,
                bottom: 24,
                left: 24,
                right: 24,
              ),
              decoration: const BoxDecoration(
                color: Color(0xFF0F5132),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
              child: Column(
                children: [
                  const Text(
                    'Kuran-ı Kerim',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const TabBar(
                    indicatorColor: Color(0xFFFACC15),
                    indicatorWeight: 3,
                    labelStyle: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                    unselectedLabelStyle: TextStyle(
                      fontWeight: FontWeight.normal,
                      fontSize: 16,
                    ),
                    tabs: [
                      Tab(text: 'Sureler'),
                      Tab(text: 'Hatim'),
                    ],
                  ),
                ],
              ),
            ),

            // Tab Contents
            Expanded(
              child: TabBarView(
                children: [
                  // Tab 1: Sureler Listesi (Existing Code)
                  Column(
                    children: [
                      // Search Bar
                      Container(
                        margin: const EdgeInsets.all(16),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey.shade300),
                        ),
                        child: TextField(
                          controller: _searchController,
                          onChanged: _filterSurahs,
                          style: const TextStyle(color: Colors.black87),
                          decoration: const InputDecoration(
                            icon: Icon(Icons.search, color: Colors.grey),
                            hintText: 'Sure ara (Örn: Fatiha)...',
                            hintStyle: TextStyle(color: Colors.grey),
                            border: InputBorder.none,
                          ),
                        ),
                      ),

                      Expanded(
                        child: _isLoading
                            ? const Center(
                                child: CircularProgressIndicator(
                                  color: Color(0xFF0F5132),
                                ),
                              )
                            : _filteredSurahs.isEmpty
                            ? const Center(child: Text('Sure bulunamadı'))
                            : ListView.builder(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                                itemCount: _filteredSurahs.length,
                                itemBuilder: (context, index) {
                                  final surah = _filteredSurahs[index];
                                  return _buildSurahCard(surah);
                                },
                              ),
                      ),
                    ],
                  ),

                  // Tab 2: Hatim Screen
                  const HatimScreen(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSurahCard(Surah surah) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF5F5F4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => SurahDetailScreen(surah: surah),
            ),
          );
        },
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: const Color(0xFFECFDF5),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Text(
              '${surah.number}',
              style: const TextStyle(
                color: Color(0xFF059669),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        title: Text(
          surah.englishName,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Color(0xFF1C1917),
          ),
        ),
        subtitle: Text(
          '${surah.englishNameTranslation} • ${surah.numberOfAyahs} Ayet',
          style: TextStyle(color: Colors.grey[500], fontSize: 12),
        ),
        trailing: Text(
          surah.name.replaceAll('سورة', '').trim(),
          style: GoogleFonts.amiri(
            fontSize: 18,
            color: const Color(0xFF1C1917),
          ),
          textDirection: TextDirection.rtl,
        ),
      ),
    );
  }
}
