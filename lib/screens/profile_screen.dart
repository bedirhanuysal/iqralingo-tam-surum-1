import 'package:flutter/material.dart';
import '../data/app_data.dart';
import '../models/achievement.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = AppData.mockUser;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F4),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header
            Stack(
              children: [
                Container(
                  height: 300,
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF0F5132), Color(0xFF064E3B)],
                    ),
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(40),
                      bottomRight: Radius.circular(40),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 60, left: 24, right: 24),
                  child: Column(
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Avatar
                          Stack(
                            children: [
                              Container(
                                width: 90,
                                height: 90,
                                decoration: BoxDecoration(
                                  color: Color(int.parse(user.avatarColor)),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white.withOpacity(0.3),
                                    width: 3,
                                  ),
                                ),
                                child: const Center(
                                  child: Icon(
                                    Icons.person,
                                    size: 48,
                                    color: Colors.white60,
                                  ),
                                ),
                              ),
                              Positioned(
                                bottom: 0,
                                right: 0,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.edit,
                                    size: 14,
                                    color: Color(0xFF0F5132),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 20),
                          // User Info
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      user.name,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const Icon(
                                      Icons.settings,
                                      color: Colors.white,
                                      size: 24,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    const Icon(
                                      Icons.emoji_events,
                                      color: Color(0xFFFFD700),
                                      size: 16,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      user.level,
                                      style: TextStyle(
                                        color: Colors.white.withOpacity(0.9),
                                        fontSize: 14,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Wrap(
                                  spacing: 8,
                                  children: [
                                    _buildSmallTag(
                                      'ÖĞRENCİ',
                                      const Color(0xFF34D399),
                                    ),
                                    _buildSmallTag(
                                      user.joined,
                                      const Color(0xFFD1FAE5),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 40),
                      // Stats Card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(30),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatItem(
                              'Puan',
                              '${user.points}',
                              Icons.star,
                              const Color(0xFFFACC15),
                            ),
                            _buildDivider(),
                            _buildStatItem(
                              'Gün Seri',
                              '${user.streak}',
                              Icons.local_fire_department,
                              const Color(0xFFF97316),
                            ),
                            _buildDivider(),
                            _buildStatItem(
                              'Rozet',
                              '3',
                              Icons.emoji_events,
                              const Color(0xFF3B82F6),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),

            // Content
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Premium Plans
                  const Row(
                    children: [
                      Icon(Icons.workspace_premium, color: Color(0xFFFFD700)),
                      SizedBox(width: 8),
                      Text(
                        'Premium Planlar',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildPlanCard(
                          'Temel Paket',
                          '24,99 ₺',
                          'Reklamsız Deneyim',
                          Colors.blue[50]!,
                          Colors.blue[600]!,
                          false,
                        ),
                        const SizedBox(width: 16),
                        _buildPlanCard(
                          'Pro Paket',
                          '49,99 ₺',
                          'Sınırsız Her Şey',
                          const Color(0xFF1C1917),
                          const Color(0xFFFFD700),
                          true,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Achievements
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(
                            Icons.emoji_events_outlined,
                            color: Color(0xFF0F5132),
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Başarılar',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      TextButton(
                        onPressed: () {},
                        child: const Text(
                          'Tümünü Gör',
                          style: TextStyle(color: Colors.grey, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: AppData.allAchievements
                          .map((ach) => _buildAchievementCard(ach))
                          .toList(),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Settings Menu
                  const Row(
                    children: [
                      Icon(Icons.settings_outlined, color: Color(0xFF0F5132)),
                      SizedBox(width: 8),
                      Text(
                        'Ayarlar',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE7E5E4)),
                    ),
                    child: Column(
                      children: [
                        _buildSettingsItem(
                          Icons.notifications_none,
                          'Hatırlatıcılar',
                          'Namaz ve ders bildirimleri',
                          Colors.blue[50]!,
                          Colors.blue[600]!,
                          true,
                        ),
                        const Divider(height: 1, indent: 64),
                        _buildSettingsItem(
                          Icons.volume_up_outlined,
                          'Ses Efektleri',
                          'Uygulama içi sesler',
                          Colors.purple[50]!,
                          Colors.purple[600]!,
                          true,
                        ),
                        const Divider(height: 1, indent: 64),
                        _buildSettingsItem(
                          Icons.favorite_border,
                          'Geliştiriciye Destek Ol',
                          'Sadaka-i Cariye / Bağış',
                          const Color(0xFFFFF1F2),
                          Colors.pink[500]!,
                          false,
                          isButton: true,
                        ),
                        const Divider(height: 1, indent: 64),
                        _buildSettingsItem(
                          Icons.logout,
                          'Çıkış Yap',
                          '',
                          Colors.grey[100]!,
                          Colors.grey[500]!,
                          false,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildStatItem(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Column(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(15),
          ),
          child: Icon(icon, color: color, size: 22),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
            color: Color(0xFF1C1917),
          ),
        ),
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
            letterSpacing: 1,
          ),
        ),
      ],
    );
  }

  Widget _buildDivider() {
    return Container(width: 1, height: 40, color: Colors.grey[200]);
  }

  Widget _buildPlanCard(
    String title,
    String price,
    String desc,
    Color bgColor,
    Color textColor,
    bool isPro,
  ) {
    return Container(
      width: 180,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: isPro
            ? [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ]
            : [],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: isPro ? const Color(0xFFFFD700) : Colors.blue[100],
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isPro ? Icons.workspace_premium : Icons.bolt,
                  color: isPro ? Colors.black : Colors.blue[600],
                  size: 20,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: isPro ? Colors.white : Colors.black,
                      ),
                    ),
                    Text(
                      desc,
                      style: TextStyle(
                        fontSize: 8,
                        color: isPro ? Colors.white70 : Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                price,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                  color: isPro ? Colors.white : Colors.black,
                ),
              ),
              Text(
                '/Ay',
                style: TextStyle(
                  fontSize: 10,
                  color: isPro ? Colors.white60 : Colors.grey,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 32,
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: isPro
                    ? const Color(0xFFFFD700)
                    : Colors.grey[100],
                foregroundColor: isPro ? Colors.black : Colors.black87,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: EdgeInsets.zero,
              ),
              child: const Text(
                'SEÇ',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAchievementCard(Achievement ach) {
    final bgColor = Color(
      int.parse(ach.color.replaceAll('0x', 'FF'), radix: 16),
    ).withOpacity(1.0);
    final borderColor = Color(
      int.parse(ach.borderColor.replaceAll('0x', 'FF'), radix: 16),
    ).withOpacity(1.0);

    return Container(
      width: 140,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(ach.icon, style: const TextStyle(fontSize: 24)),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            ach.title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            textAlign: TextAlign.center,
          ),
          Text(
            ach.desc,
            style: const TextStyle(fontSize: 9, color: Colors.grey),
            textAlign: TextAlign.center,
          ),
          if (ach.status == 'in_progress') ...[
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: ach.progress / 100,
                backgroundColor: Colors.grey[200],
                valueColor: const AlwaysStoppedAnimation<Color>(
                  Color(0xFF10B981),
                ),
                minHeight: 4,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${ach.current}/${ach.target}',
              style: const TextStyle(
                fontSize: 8,
                fontWeight: FontWeight.bold,
                color: Color(0xFF059669),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSettingsItem(
    IconData icon,
    String title,
    String subtitle,
    Color iconBg,
    Color iconColor,
    bool hasSwitch, {
    bool isButton = false,
  }) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: iconBg,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Text(
        title,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
      ),
      subtitle: subtitle.isNotEmpty
          ? Text(
              subtitle,
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            )
          : null,
      trailing: hasSwitch
          ? Switch(
              value: true,
              onChanged: (v) {},
              activeThumbColor: const Color(0xFF10B981),
            )
          : isButton
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.coffee, size: 12, color: Color(0xFFE11D48)),
                  SizedBox(width: 4),
                  Text(
                    'Ismarla',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFE11D48),
                    ),
                  ),
                ],
              ),
            )
          : const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
      onTap: () {},
    );
  }
}
