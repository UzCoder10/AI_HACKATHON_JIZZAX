import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/theme.dart';
import 'controllers/app_state.dart';
import 'controllers/age_tier_controller.dart';
import 'views/auth/khan_onboarding.dart';
import 'views/home/adaptive_home_tab.dart';
import 'views/chat/chat_tab.dart';
import 'views/shorts/educational_feed.dart';
import 'views/achievements/achievements_tab.dart';
import 'views/parent/parent_tab.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint("Firebase initialization failed: $e. Running in offline/fallback mode.");
  }
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppState()),
        ChangeNotifierProvider(create: (_) => AgeTierController()),
      ],
      child: const NiholApp(),
    ),
  );
}

class NiholApp extends StatelessWidget {
  const NiholApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Nihol",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: AppTheme.white,
        useMaterial3: true,
      ),
      home: const AuthWrapper(),
    );
  }
}

// =========================================================================
// GLOBAL SESSION MANAGEMENT AUTH WRAPPER
// =========================================================================
class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);

    // If parent has not completed the onboarding flow, show onboarding
    if (!appState.hasOnboarded) {
      return KhanOnboarding(appState: appState);
    }
    
    return MainNavigationLayout(appState: appState);
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
class MainNavigationLayout extends StatefulWidget {
  final AppState appState;

  const MainNavigationLayout({super.key, required this.appState});

  @override
  State<MainNavigationLayout> createState() => _MainNavigationLayoutState();
}

class _MainNavigationLayoutState extends State<MainNavigationLayout> {
  bool _isDeflectionLocked = false;
  String _unlockPinInput = "";
  String _unlockError = "";

  void _onPinKeyTap(String val) {
    setState(() {
      _unlockError = "";
      if (_unlockPinInput.length < 4) {
        _unlockPinInput += val;
      }
      if (_unlockPinInput.length == 4) {
        if (_unlockPinInput == widget.appState.parentPin) {
          _isDeflectionLocked = false;
          _unlockPinInput = "";
        } else {
          _unlockPinInput = "";
          _unlockError = "PIN xato. Qayta urinib ko'ring!";
        }
      }
    });
  }

  void _onDeleteTap() {
    setState(() {
      if (_unlockPinInput.isNotEmpty) {
        _unlockPinInput = _unlockPinInput.substring(0, _unlockPinInput.length - 1);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final ageController = Provider.of<AgeTierController>(context);

    // Sandbox deflection monitoring loop simulation
    if (ageController.sandboxBlockerActive && 
        (widget.appState.activeTab == 1 || widget.appState.activeTab == 2 || widget.appState.activeTab == 3)) {
      if (!_isDeflectionLocked) {
        SchedulerBinding.instance.addPostFrameCallback((_) {
          widget.appState.changeTab(0);
          setState(() {
            _isDeflectionLocked = true;
          });
        });
      }
    }

    return Scaffold(
      backgroundColor: AppTheme.porcelain,
      body: Stack(
        children: [
          Column(
            children: [
              Expanded(
                child: IndexedStack(
                  index: widget.appState.activeTab,
                  children: [
                    AdaptiveHomeTab(appState: widget.appState),
                    ChatTab(appState: widget.appState),
                    EducationalFeed(appState: widget.appState),
                    AchievementsTab(appState: widget.appState),
                    ParentTab(appState: widget.appState),
                  ],
                ),
              ),
              _buildCustomBottomBar(context),
            ],
          ),

          if (_isDeflectionLocked)
            _buildLockOverlay(),
        ],
      ),
    );
  }

  Widget _buildLockOverlay() {
    return Positioned.fill(
      child: Container(
        color: Colors.black.withAlpha(220),
        child: Center(
          child: SingleChildScrollView(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 28),
              padding: const EdgeInsets.all(24),
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: AppTheme.white,
                radius: 28,
                borderColor: AppTheme.appleRed,
                shadowOffset: const Offset(4, 4),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.shield_rounded, size: 54, color: AppTheme.appleRed),
                  const SizedBox(height: 12),
                  Text("Kiddos Shield Faol! 🔒", style: AppTheme.headerMedium),
                  const SizedBox(height: 6),
                  const Text(
                    "Tashqi ilovalarni bloklash rejimi yoqilgan. Sahifani o'zgartirish yoki chiqish uchun PIN kodni kiriting (Standart: 2026):",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: AppTheme.darkPurple),
                  ),
                  const SizedBox(height: 20),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(4, (index) {
                      final bool isFilled = index < _unlockPinInput.length;
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 6),
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          color: isFilled ? AppTheme.appleRed : Colors.grey.shade200,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppTheme.darkPurpleBorder, width: 2),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 8),
                  if (_unlockError.isNotEmpty)
                    Text(
                      _unlockError,
                      style: AppTheme.bodySmall.copyWith(color: AppTheme.appleRed, fontWeight: FontWeight.bold),
                    ),
                  const SizedBox(height: 24),

                  Container(
                    constraints: const BoxConstraints(maxWidth: 280),
                    child: GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: 12,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 1.4,
                      ),
                      itemBuilder: (context, index) {
                        if (index == 9) {
                          return const SizedBox.shrink();
                        }
                        if (index == 10) {
                          return _buildPinButton("0");
                        }
                        if (index == 11) {
                          return GestureDetector(
                            onTap: _onDeleteTap,
                            child: Container(
                              decoration: AppTheme.vibrant3DBoxDecoration(
                                color: AppTheme.white,
                                radius: 12,
                                shadowOffset: const Offset(2, 2),
                                borderColor: AppTheme.darkAppleRed,
                                shadowColor: AppTheme.appleRed,
                              ),
                              alignment: Alignment.center,
                              child: const Icon(Icons.backspace_rounded, color: AppTheme.appleRed, size: 20),
                            ),
                          );
                        }
                        final numValue = (index + 1).toString();
                        return _buildPinButton(numValue);
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _isDeflectionLocked = false;
                        _unlockPinInput = "";
                      });
                    },
                    child: const Text("Orqaga (Bosh sahifa)", style: TextStyle(color: Colors.grey)),
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPinButton(String val) {
    return GestureDetector(
      onTap: () => _onPinKeyTap(val),
      child: Container(
        decoration: AppTheme.vibrant3DBoxDecoration(
          color: AppTheme.white,
          radius: 12,
          shadowOffset: const Offset(2, 2),
          borderColor: AppTheme.darkAppleRed,
          shadowColor: AppTheme.appleRed,
        ),
        alignment: Alignment.center,
        child: Text(val, style: AppTheme.headerMedium.copyWith(color: AppTheme.appleRed, fontSize: 16)),
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
                isActive: widget.appState.activeTab == 0,
                activeColor: accentColor,
                onTap: () => widget.appState.changeTab(0),
              ),
            if (visibleTabIndices.contains(1))
              BouncyNavItem(
                index: 1,
                icon: Icons.forum_rounded,
                label: "Suhbatlar",
                isActive: widget.appState.activeTab == 1,
                activeColor: accentColor,
                onTap: () => widget.appState.changeTab(1),
              ),
            if (visibleTabIndices.contains(2))
              BouncyNavItem(
                index: 2,
                icon: Icons.play_circle_outline_rounded,
                label: "Shorts",
                isActive: widget.appState.activeTab == 2,
                activeColor: accentColor,
                onTap: () => widget.appState.changeTab(2),
              ),
            if (visibleTabIndices.contains(3))
              BouncyNavItem(
                index: 3,
                icon: Icons.military_tech_rounded,
                label: "Yutuqlar",
                isActive: widget.appState.activeTab == 3,
                activeColor: accentColor,
                onTap: () => widget.appState.changeTab(3),
              ),
            if (visibleTabIndices.contains(4))
              BouncyNavItem(
                index: 4,
                icon: Icons.shield_rounded,
                label: "Ota-ona",
                isActive: widget.appState.activeTab == 4,
                activeColor: accentColor,
                onTap: () => widget.appState.changeTab(4),
              ),
          ],
        ),
      ),
    );
  }
}
