import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';
import 'avatar_theme_shop_screen.dart';

class AchievementsTab extends StatelessWidget {
  final AppState appState;

  const AchievementsTab({super.key, required this.appState});

  @override
  Widget build(BuildContext context) {
    final state = appState;
    final double levelProgress = (state.stars % 20) / 20.0;
    
    // Sleek Vector Trophies mapping (no emojis!)
    final List<Map<String, dynamic>> trophies = [
      {
        "name": "Koinot sayyohi",
        "desc": "Ulug‘bek bilan 5 marta gaplashing",
        "req": (state.scholarInteractions["ulugbek"] ?? 0) >= 5,
        "icon": Icons.rocket_rounded,
      },
      {
        "name": "Shifokor shogirdi",
        "desc": "Ibn Sino bilan 3 marta gaplashing",
        "req": (state.scholarInteractions["ibnsino"] ?? 0) >= 3,
        "icon": Icons.health_and_safety_rounded,
      },
      {
        "name": "Yosh sarkarda",
        "desc": "Temur bilan 5 marta gaplashing",
        "req": (state.scholarInteractions["temur"] ?? 0) >= 5,
        "icon": Icons.shield_rounded,
      },
      {
        "name": "Buyuk olim",
        "desc": "Jami 20 ta savol berish",
        "req": state.scholarInteractions.values.fold<int>(0, (prev, val) => prev + val) >= 20,
        "icon": Icons.military_tech_rounded,
      },
    ];

    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text("Yutuqlarim", style: AppTheme.headerMedium),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_bag_rounded, color: AppTheme.magenta, size: 28),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => AvatarThemeShopScreen(appState: state),
                ),
              );
            },
            tooltip: "Do‘kon",
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Level progress section
            Container(
              padding: const EdgeInsets.all(20),
              decoration: AppTheme.neonDecoration(color: AppTheme.pastelBlue),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Darajam", style: AppTheme.headerSmall),
                      Text("${state.currentLevel}-Level", style: AppTheme.headerMedium.copyWith(color: AppTheme.magenta)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text("Yulduzlarim soni: ${state.stars} ta", style: AppTheme.bodySmall),
                  const SizedBox(height: 12),
                  // Progress bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      height: 16,
                      decoration: BoxDecoration(
                        color: AppTheme.white,
                        border: Border.all(color: AppTheme.darkBlue, width: 2),
                      ),
                      child: Stack(
                        children: [
                          FractionallySizedBox(
                            widthFactor: levelProgress,
                            child: Container(color: AppTheme.magenta),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text("Keyingi darajaga yetish uchun yana ${(20 - (state.stars % 20))} ta yulduzcha kerak", style: AppTheme.bodySmall),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Continuous Usage Streak
            Container(
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.neonDecoration(color: AppTheme.pastelGold),
              child: Row(
                children: [
                  const Icon(Icons.bolt_rounded, color: AppTheme.yellow, size: 36),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("${state.streakDays} kunlik faollik!", style: AppTheme.headerSmall),
                        Text("Allomalar bilan har kuni suhbatlashing va yulduzlarni ko‘paytiring!", style: AppTheme.bodySmall),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Daily Quests Checklist
            Text("Kunlik Topshiriqlar", style: AppTheme.headerMedium),
            const SizedBox(height: 10),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: state.quests.length,
              itemBuilder: (context, index) {
                final quest = state.quests[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: AppTheme.neonDecoration(
                    color: AppTheme.white,
                    borderWidth: 2,
                    shadowOffset: const Offset(3, 3),
                  ),
                  child: Row(
                    children: [
                      Icon(quest.iconData, color: quest.isCompleted ? AppTheme.cyan : AppTheme.darkBlue, size: 24),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              quest.title,
                              style: AppTheme.headerSmall.copyWith(
                                fontSize: 13,
                                decoration: quest.isCompleted ? TextDecoration.lineThrough : null,
                              ),
                            ),
                            Text(quest.description, style: AppTheme.bodySmall),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: quest.isCompleted ? AppTheme.pastelMint : AppTheme.white,
                          border: Border.all(color: AppTheme.darkBlue, width: 1.5),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            if (quest.isCompleted) ...[
                              const Icon(Icons.check_rounded, color: AppTheme.cyan, size: 14),
                              const SizedBox(width: 4),
                            ],
                            Text(
                              "+${quest.rewardStars}",
                              style: AppTheme.fontHeader.copyWith(fontSize: 10, color: AppTheme.darkBlue),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 24),

            // Unlockable Digital Trophies Grid
            Text("Mening Ordenlarim (Trophies)", style: AppTheme.headerMedium),
            const SizedBox(height: 10),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: trophies.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                childAspectRatio: 0.9,
              ),
              itemBuilder: (context, index) {
                final t = trophies[index];
                final bool isUnlocked = t["req"];

                return Container(
                  decoration: AppTheme.neonDecoration(
                    color: isUnlocked ? AppTheme.pastelMint : Colors.grey.shade100,
                    radius: 20,
                  ),
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        t["icon"],
                        size: 36,
                        color: isUnlocked ? AppTheme.magenta : Colors.grey.shade400,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        t["name"],
                        style: AppTheme.headerSmall.copyWith(
                          fontSize: 12,
                          color: isUnlocked ? AppTheme.darkBlue : Colors.grey.shade600,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        t["desc"],
                        style: AppTheme.bodySmall.copyWith(fontSize: 8, color: Colors.grey.shade500),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
