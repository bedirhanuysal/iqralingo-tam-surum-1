import 'package:google_generative_ai/google_generative_ai.dart';

class GeminiService {
  final String apiKey;
  late final GenerativeModel _model;

  GeminiService(this.apiKey) {
    _model = GenerativeModel(model: 'gemini-1.5-flash', apiKey: apiKey);
  }

  Future<String> getResponse(String prompt, List<Content> history) async {
    try {
      final chat = _model.startChat(history: history);
      final response = await chat.sendMessage(Content.text(prompt));
      return response.text ?? "Üzgünüm, bir hata oluştu.";
    } catch (e) {
      return "Hata: ${e.toString()}";
    }
  }
}
