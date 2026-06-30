import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme.dart';
import 'controllers/app_state.dart';
import 'controllers/age_tier_controller.dart';
import 'views/auth/khan_onboarding.dart';
import 'views/home/adaptive_home_tab.dart';
import 'views/chat/chat_tab.dart';
import 'views/shorts/shorts_tab.dart';
import 'views/achievements/achievements_tab.dart';
import 'views/parent/parent_tab.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppState()),
        ChangeNotifierProvider(create: (_) => AgeTierController()),
      ],
      child: const SmartEduApp(),
    ),
  );
}

class SmartEduApp extends StatelessWidget {
  const SmartEduApp({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    
    return MaterialApp(
      title: "Smart Edu Uzbekistan",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: AppTheme.white,
        useMaterial3: true,
      ),
      home: appState.hasOnboarded
          ? MainNavigationLayout(appState: appState)
          : KhanOnboarding(appState: appState),
    );
  }
}

// =========================================================================
// BOUNCY NAVIGATION ITEM (KHAN KIDS MECHANICS)
// =========================================================================
class BouncyNavItem extends StatefulWidget {
  final int index;
  final IconData icon;
  final String label;
  final bool isActive;
  final Color activeColor;
  final VoidCallback onTap;

  const BouncyNavItem({
    super.key,
    required this.index,
    required this.icon,
    required this.label,
    required this.isActive,
    required this.activeColor,
    required this.onTap,
  });

  @override
  State<BouncyNavItem> createState() => _BouncyNavItemState();
}

class _BouncyNavItemState extends State<BouncyNavItem> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _controller, curve: Curves.bounceOut),
    );

    if (widget.isActive) {
      _controller.forward();
    }
  }

  @override
  void didUpdateWidget(covariant BouncyNavItem oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive != oldWidget.isActive) {
      if (widget.isActive) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
          decoration: widget.isActive
              ? AppTheme.vibrant3DBoxDecoration(
                  color: widget.activeColor,
                  radius: 20,
                  borderWidth: 2,
                  shadowOffset: const Offset(2, 2),
                )
              : const BoxDecoration(color: Colors.transparent),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                widget.icon,
                color: widget.isActive ? AppTheme.white : AppTheme.darkPurple.withAlpha(178),
                size: 22,
              ),
              if (widget.isActive) ...[
                const SizedBox(width: 6),
                Text(
                  widget.label,
                  style: AppTheme.fontHeader.copyWith(
                    fontSize: 11,
                    color: AppTheme.white,
                  ),
                ),
              ]
            ],
          ),
        ),
      ),
    );
  }
}

// =========================================================================
// MAIN NAVIGATION LAYOUT & ADAPTIVE TOY BAR
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
                AdaptiveHomeTab(appState: appState),
                ChatTab(appState: appState),
                ShortsTab(appState: appState),
                AchievementsTab(appState: appState),
                ParentTab(appState: appState),
              ],
            ),
          ),
          _buildCustomBottomBar(context),
        ],
      ),
    );
  }

  Widget _buildCustomBottomBar(BuildContext context) {
    final ageController = Provider.of<AgeTierController>(context);
    final visibleTabIndices = ageController.getAdaptiveNavigationMenu();
    final accentColor = ageController.getAccentColor();

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      decoration: const BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(32),
          topRight: Radius.circular(32),
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.pastelPeach,
            offset: Offset(0, -4),
            blurRadius: 0,
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            if (visibleTabIndices.contains(0))
              BouncyNavItem(
                index: 0,
                icon: Icons.home_rounded,
                label: "Bosh sahifa",
                isActive: appState.activeTab == 0,
                activeColor: accentColor,
                onTap: () => appState.changeTab(0),
              ),
            if (visibleTabIndices.contains(1))
              BouncyNavItem(
                index: 1,
                icon: Icons.forum_rounded,
                label: "Suhbatlar",
                isActive: appState.activeTab == 1,
                activeColor: accentColor,
                onTap: () => appState.changeTab(1),
              ),
            if (visibleTabIndices.contains(2))
              BouncyNavItem(
                index: 2,
                icon: Icons.play_circle_outline_rounded,
                label: "Shorts",
                isActive: appState.activeTab == 2,
                activeColor: accentColor,
                onTap: () => appState.changeTab(2),
              ),
            if (visibleTabIndices.contains(3))
              BouncyNavItem(
                index: 3,
                icon: Icons.military_tech_rounded,
                label: "Yutuqlar",
                isActive: appState.activeTab == 3,
                activeColor: accentColor,
                onTap: () => appState.changeTab(3),
              ),
            if (visibleTabIndices.contains(4))
              BouncyNavItem(
                index: 4,
                icon: Icons.shield_rounded,
                label: "Ota-ona",
                isActive: appState.activeTab == 4,
                activeColor: accentColor,
                onTap: () => appState.changeTab(4),
              ),
          ],
        ),
      ),
    );
  }
}
