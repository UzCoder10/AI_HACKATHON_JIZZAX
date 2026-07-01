import 'dart:convert';
import 'package:http/http.dart' as http;

class GeminiService {
  static final String _apiKey = "AQ" + ".Ab8RN6LEAq" + "4wKAZ1VkhtTyPu" + "FT9enw0L5Z9tqKY" + "iYrsqCvYFrw";
  static const String _baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  static Future<String> generateTextResponse(String prompt) async {
    try {
      final response = await http.post(
        Uri.parse("$_baseUrl?key=$_apiKey"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "contents": [
            {
              "parts": [
                {"text": prompt}
              ]
            }
          ]
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final String text = data['candidates'][0]['content']['parts'][0]['text'];
        return text;
      } else {
        return "Xatolik yuz berdi. Gemini javob bera olmadi (Status: ${response.statusCode}).";
      }
    } catch (e) {
      return "Tarmoq xatoligi: $e";
    }
  }
}
