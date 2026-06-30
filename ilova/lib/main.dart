import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'controllers/app_state.dart';
import 'views/home/home_tab.dart';
import 'views/chat/chat_tab.dart';
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
          : OnboardingScreen(appState: _appState),
    );
  }
}

// =========================================================================
// ONBOARDING SCREEN WALKTHROUGH
// =========================================================================
class OnboardingScreen extends StatefulWidget {
  final AppState appState;

  const OnboardingScreen({super.key, required this.appState});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  final List<Map<String, String>> _slides = [
    {
      "title": "Xush Kelibsiz!",
      "body": "Smart Edu Uzbekistan — 7-12 yoshli bolalar uchun mo‘ljallangan allomalar suhbatdoshidir. Zero emotsional bog‘liqlik, 100% xavfsiz bilim zanjiri!",
    },
    {
      "title": "Buyuk Allomalar Suhbatdoshi",
      "body": "Mirzo Ulug‘bek, Ibn Sino va boshqa buyuk allomalarimiz bilan savol-javoblar orqali o‘z bilimingizni boyiting va yulduzchalarni to‘plang!",
    },
    {
      "title": "Ota-onalar Nazorati",
      "body": "Xavfsizlik tizimi va hisobotlar yordamida farzandingiz faolligi va ruhiy holatini haftalik kuzatib boring.",
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              // Skip button
              Align(
                alignment: Alignment.topRight,
                child: TextButton(
                  onPressed: () => widget.appState.completeOnboarding(),
                  child: Text(
                    "O‘tkazib yuborish",
                    style: AppTheme.bodyMedium.copyWith(color: AppTheme.mandarin),
                  ),
                ),
              ),
              
              // Pages
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: (index) {
                    setState(() {
                      _currentIndex = index;
                    });
                  },
                  itemCount: _slides.length,
                  itemBuilder: (context, index) {
                    final slide = _slides[index];
                    final activeColor = index == 0
                        ? AppTheme.cyan
                        : index == 1
                            ? AppTheme.yellow
                            : AppTheme.magenta;

                    return Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: AppTheme.vibrant3DBoxDecoration(
                            color: activeColor,
                            radius: 24,
                            borderColor: AppTheme.getBorderColorFor(activeColor),
                            shadowColor: AppTheme.getBorderColorFor(activeColor),
                          ),
                          child: Icon(
                            index == 0
                                ? Icons.rocket_launch_rounded
                                : index == 1
                                    ? Icons.forum_rounded
                                    : Icons.shield_rounded,
                            color: AppTheme.white,
                            size: 38,
                          ),
                        ),
                        const SizedBox(height: 32),
                        Text(
                          slide["title"]!,
                          style: AppTheme.headerLarge,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          slide["body"]!,
                          style: AppTheme.bodyLarge,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    );
                  },
                ),
              ),
              
              // Slide indicator bullets
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_slides.length, (index) {
                  final bool isActive = _currentIndex == index;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 6),
                    width: isActive ? 24 : 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: isActive ? AppTheme.mandarin : Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(color: AppTheme.darkPurpleBorder, width: 1.5),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 32),
              
              // Action Button
              GestureDetector(
                onTap: () {
                  if (_currentIndex == _slides.length - 1) {
                    widget.appState.completeOnboarding();
                  } else {
                    _pageController.nextPage(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeOut,
                    );
                  }
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: AppTheme.vibrant3DBoxDecoration(
                    color: _currentIndex == _slides.length - 1 ? AppTheme.cyan : AppTheme.white,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    _currentIndex == _slides.length - 1 ? "Boshlash!" : "Keyingisi",
                    style: AppTheme.headerMedium.copyWith(
                      color: _currentIndex == _slides.length - 1 ? AppTheme.white : AppTheme.darkPurple,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// =========================================================================
// MAIN NAVIGATION LAYOUT & CUSTOM BOTTOM BAR
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
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
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
            _buildNavItem(2, Icons.military_tech_rounded, "Yutuqlar"),
            _buildNavItem(3, Icons.shield_rounded, "Ota-ona"),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final bool isActive = appState.activeTab == index;
    final Color activeColor = index == 0
        ? AppTheme.cyan
        : index == 1
            ? AppTheme.yellow
            : index == 2
                ? AppTheme.magenta
                : AppTheme.cyan;

    return GestureDetector(
      onTap: () => appState.changeTab(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 14),
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
              color: isActive ? AppTheme.white : AppTheme.darkPurple.withOpacity(0.7),
              size: 20,
            ),
            if (isActive) ...[
              const SizedBox(width: 4),
              Text(
                label,
                style: AppTheme.fontHeader.copyWith(
                  fontSize: 11,
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
