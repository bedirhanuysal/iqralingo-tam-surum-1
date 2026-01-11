import 'package:flutter/material.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../services/gemini_service.dart';

class GeminiChatScreen extends StatefulWidget {
  const GeminiChatScreen({super.key});

  @override
  State<GeminiChatScreen> createState() => _GeminiChatScreenState();
}

class _GeminiChatScreenState extends State<GeminiChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Message> _messages = [];
  final List<Content> _history = [];
  bool _isLoading = false;
  late final GeminiService _geminiService;

  @override
  void initState() {
    super.initState();
    // TODO: Use real API key from secure storage or env
    _geminiService = GeminiService('YOUR_API_KEY_HERE');
    _addInitialMessage();
  }

  void _addInitialMessage() {
    setState(() {
      _messages.add(
        Message(
          text:
              "Selam! Ben IqraLingo asistanın. Kuran-ı Kerim, Arapça veya dini konularda sana nasıl yardımcı olabilirim?",
          isUser: false,
        ),
      );
    });
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    _controller.clear();
    setState(() {
      _messages.add(Message(text: text, isUser: true));
      _isLoading = true;
    });

    final response = await _geminiService.getResponse(text, _history);

    // Update history
    _history.add(Content.text(text));
    _history.add(Content.model([TextPart(response)]));

    if (mounted) {
      setState(() {
        _messages.add(Message(text: response, isUser: false));
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F4),
      appBar: AppBar(
        title: const Text(
          'IqraLingo Asistan',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return _buildMessageBubble(message);
              },
            ),
          ),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Message message) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: message.isUser ? const Color(0xFF0F5132) : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: Radius.circular(message.isUser ? 20 : 4),
            bottomRight: Radius.circular(message.isUser ? 4 : 20),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Text(
          message.text,
          style: TextStyle(
            color: message.isUser ? Colors.white : const Color(0xFF1C1917),
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE7E5E4))),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F4),
                borderRadius: BorderRadius.circular(24),
              ),
              child: TextField(
                controller: _controller,
                decoration: const InputDecoration(
                  hintText: 'Bir şeyler sor...',
                  border: InputBorder.none,
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            onPressed: _sendMessage,
            icon: const Icon(Icons.send, color: Color(0xFF0F5132)),
          ),
        ],
      ),
    );
  }
}

class Message {
  final String text;
  final bool isUser;

  Message({required this.text, required this.isUser});
}
