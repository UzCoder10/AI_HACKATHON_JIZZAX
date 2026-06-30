import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';

class AvatarThemeShopScreen extends StatefulWidget {
  final AppState appState;

  const AvatarThemeShopScreen({super.key, required this.appState});

  @override
  State<AvatarThemeShopScreen> createState() => _AvatarThemeShopScreenState();
}

class _AvatarThemeShopScreenState extends State<AvatarThemeShopScreen> {
  final List<Map<String, dynamic>> _shopAvatars = [
    {"role": "child", "label": "Oddiy bola", "cost": 0},
    {"role": "astronomer", "label": "Astronom", "cost": 4},
    {"role": "doctor", "label": "Yosh Shifokor", "cost": 8},
    {"role": "commander", "label": "Sarkarda", "cost": 12},
  ];

  @override
  Widget build(BuildContext context) {
    final state = widget.appState;

    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        title: Text("Mavzular va Avatarlar", style: AppTheme.headerMedium),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.darkBlue),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Current Star Balance
            Container(
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.neonDecoration(color: AppTheme.pastelGold),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Mening yulduzlarim:", style: AppTheme.headerSmall),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, color: AppTheme.darkBlue, size: 24),
                      const SizedBox(width: 6),
                      Text("${state.stars}", style: AppTheme.headerMedium.copyWith(color: AppTheme.magenta)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Avatars Section
            Text("Profil Avatarlari (Vector)", style: AppTheme.headerMedium),
            const SizedBox(height: 10),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _shopAvatars.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                childAspectRatio: 0.9,
              ),
              itemBuilder: (context, index) {
                final avatar = _shopAvatars[index];
                final String role = avatar["role"];
                final String label = avatar["label"];
                final int cost = avatar["cost"];

                final bool isUnlocked = state.unlockedAvatarRoles.contains(role);
                final bool isSelected = state.selectedAvatarRole == role;

                return GestureDetector(
                  onTap: () {
                    if (isSelected) return;
                    if (isUnlocked) {
                      state.selectAvatarRole(role);
                      setState(() {});
                    } else {
                      if (state.stars >= cost) {
                        state.unlockAvatarRole(role, cost);
                        setState(() {});
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text("$label muvaffaqiyatli ochildi!")),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Yulduzchalaringiz yetarli emas!")),
                        );
                      }
                    }
                  },
                  child: Container(
                    decoration: AppTheme.neonDecoration(
                      color: isSelected ? AppTheme.pastelMint : AppTheme.white,
                      borderWidth: isSelected ? 3.5 : 2,
                      shadowOffset: const Offset(3, 3),
                    ),
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: isSelected ? AppTheme.cyan : Colors.grey.shade200,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.darkBlue, width: 2),
                          ),
                          alignment: Alignment.center,
                          child: Icon(
                            state.getAvatarIcon(role),
                            color: AppTheme.darkBlue,
                            size: 24,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(label, style: AppTheme.headerSmall.copyWith(fontSize: 12)),
                        const SizedBox(height: 4),
                        if (isSelected)
                          Text("Tanlangan", style: AppTheme.bodySmall.copyWith(color: AppTheme.cyan, fontWeight: FontWeight.bold))
                        else if (isUnlocked)
                          Text("Ochiq", style: AppTheme.bodySmall.copyWith(color: Colors.green))
                        else
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.star_rounded, size: 12, color: AppTheme.darkBlue),
                              const SizedBox(width: 2),
                              Text("$cost", style: AppTheme.fontHeader.copyWith(fontSize: 10)),
                            ],
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
