import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'controllers/app_state.dart';
import 'views/auth/onboarding_wizard.dart';
import 'views/home/home_tab.dart';
import 'views/chat/chat_tab.dart';
import 'views/shorts/shorts_tab.dart';
import 'views/achievements/achievements_tab.dart';
import 'views/parent/parent_tab.dart';

void main() {
  runApp(const SmartEduApp());
}

class SmartEduApp extends StatefulWidget {
  const SmartEduApp({super.key});

  @override
  State<SmartEduApp> createState() => _SmartEduAppState();
}

class _SmartEduAppState extends State<SmartEduApp> {
  final AppState _appState = AppState();

  @override
  void initState() {
    super.initState();
    _appState.addListener(_rebuild);
  }

  @override
  void dispose() {
    _appState.removeListener(_rebuild);
    super.dispose();
  }

  void _rebuild() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Smart Edu Uzbekistan",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: AppTheme.white,
        useMaterial3: true,
      ),
      home: _appState.hasOnboarded
          ? MainNavigationLayout(appState: _appState)
          : OnboardingWizard(appState: _appState),
    );
  }
}

// =========================================================================
// MAIN NAVIGATION LAYOUT & CUSTOM BOTTOM BAR (5 TABS)
// =========================================================================
class MainNavigationLayout extends StatelessWidget {
  final AppState appState;

  const MainNavigationLayout({super.key, required this.appState});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.porcelain,
      body: Column(
        children: [
          Expanded(
            child: IndexedStack(
              index: appState.activeTab,
              children: [
                HomeTab(appState: appState),
                ChatTab(appState: appState),
                ShortsTab(appState: appState),
                AchievementsTab(appState: appState),
                ParentTab(appState: appState),
              ],
            ),
          ),
          _buildCustomBottomBar(),
        ],
      ),
    );
  }

  Widget _buildCustomBottomBar() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
      decoration: const BoxDecoration(
        color: AppTheme.white,
        border: Border(top: BorderSide(color: AppTheme.pastelPeach, width: 3)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(0, Icons.home_rounded, "Bosh sahifa"),
            _buildNavItem(1, Icons.forum_rounded, "Suhbatlar"),
            _buildNavItem(2, Icons.play_circle_outline_rounded, "Shorts"),
            _buildNavItem(3, Icons.military_tech_rounded, "Yutuqlar"),
            _buildNavItem(4, Icons.shield_rounded, "Ota-ona"),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final bool isActive = appState.activeTab == index;
    
    // Colorful capsule selection colors
    final Color activeColor = index == 0
        ? AppTheme.cyan
        : index == 1
            ? AppTheme.yellow
            : index == 2
                ? AppTheme.mintGreen
                : index == 3
                    ? AppTheme.magenta
                    : AppTheme.cyan;

    return GestureDetector(
      onTap: () => appState.changeTab(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
        decoration: isActive
            ? AppTheme.vibrant3DBoxDecoration(
                color: activeColor,
                radius: 16,
                borderWidth: 2,
                shadowOffset: const Offset(2, 2),
                borderColor: AppTheme.getBorderColorFor(activeColor),
                shadowColor: AppTheme.getBorderColorFor(activeColor),
              )
            : const BoxDecoration(color: Colors.transparent),
        child: Row(
          children: [
            Icon(
              icon,
              color: isActive ? AppTheme.white : AppTheme.darkPurple.withAlpha(178),
              size: 20,
            ),
            if (isActive) ...[
              const SizedBox(width: 4),
              Text(
                label,
                style: AppTheme.fontHeader.copyWith(
                  fontSize: 10,
                  color: AppTheme.white,
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
