import 'dart:convert';
import 'package:http/http.dart' as http;

class PrayerTimes {
  final String imsak;
  final String fajar;
  final String sunrise;
  final String dhuhr;
  final String asr;
  final String sunset;
  final String maghrib;
  final String isha;
  final String midnight;

  PrayerTimes({
    required this.imsak,
    required this.fajar,
    required this.sunrise,
    required this.dhuhr,
    required this.asr,
    required this.sunset,
    required this.maghrib,
    required this.isha,
    required this.midnight,
  });

  factory PrayerTimes.fromJson(Map<String, dynamic> json) {
    return PrayerTimes(
      imsak: json['Imsak'],
      fajar: json['Fajr'],
      sunrise: json['Sunrise'],
      dhuhr: json['Dhuhr'],
      asr: json['Asr'],
      sunset: json['Sunset'],
      maghrib: json['Maghrib'],
      isha: json['Isha'],
      midnight: json['Midnight'],
    );
  }
}

class PrayerService {
  static const String baseUrl = 'https://api.aladhan.com/v1/timingsByCity';

  Future<PrayerTimes?> getPrayerTimes(String city, String country) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl?city=$city&country=$country&method=13'),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['code'] == 200) {
          return PrayerTimes.fromJson(data['data']['timings']);
        }
      }
    } catch (e) {
      print('Error fetching prayer times: $e');
    }
    return null;
  }
}
