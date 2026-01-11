import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/quran_page_widget.dart';

class HatimScreen extends StatefulWidget {
  const HatimScreen({super.key});

  @override
  State<HatimScreen> createState() => _HatimScreenState();
}

class _HatimScreenState extends State<HatimScreen> {
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    final appState = Provider.of<AppState>(context, listen: false);
    // PageView uses 0-based index but Quran pages are 1-based (1-604)
    _pageController = PageController(initialPage: appState.lastReadPage - 1);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F4),
      body: Column(
        children: [
          // Info Bar
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            color: const Color(0xFF15803D), // Green-700
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Sadece burası güncellensin diye Consumer kullanıyoruz
                Consumer<AppState>(
                  builder: (context, appState, child) {
                    return Text(
                      'Son Okunan: Sayfa ${appState.lastReadPage}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    );
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.bookmark, color: Colors.white),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Sayfa kaydedildi')),
                    );
                  },
                  tooltip: 'Şu anki sayfayı kaydet',
                ),
              ],
            ),
          ),
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              reverse: true, // RTL reading direction
              itemCount: 604,
              onPageChanged: (index) {
                // Burada listen: false önemli, yoksa infinite loop veya gereksiz rebuild olabilir
                // Gerçi setLastReadPage notifyListeners çağırır ama PageView'ı rebuild etmezsek sorun olmaz.
                Provider.of<AppState>(
                  context,
                  listen: false,
                ).setLastReadPage(index + 1);
              },
              itemBuilder: (context, index) {
                // Sayfa numaraları 1'den başlar
                return QuranPageWidget(pageNumber: index + 1);
              },
            ),
          ),
        ],
      ),
    );
  }
}
