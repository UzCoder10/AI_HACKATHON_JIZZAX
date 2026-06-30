import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';
import '../../controllers/age_tier_controller.dart';
import '../game/adaptive_logic_games.dart';
import '../game/building_game_tab.dart';
import 'drawing_quest_screen.dart';

// =========================================================================
// KODI THE BEAR (UZBEK PET AVATAR) PAINTER
// =========================================================================
class KodiPainter extends CustomPainter {
  final double blinkVal;
  final double waveVal;
  final AgeTier tier;

  KodiPainter({
    required this.blinkVal,
    required this.waveVal,
    required this.tier,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final double cx = size.width / 2;
    final double cy = size.height / 2 + 10;
    final double r = size.width * 0.35;

    final pBear = Paint()..color = const Color(0xFFC78248)..style = PaintingStyle.fill;
    final pMuzzle = Paint()..color = const Color(0xFFF3C598)..style = PaintingStyle.fill;
    final pBorder = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.stroke..strokeWidth = 3.0;

    // Ears
    canvas.drawCircle(Offset(cx - r * 0.8, cy - r * 0.8), r * 0.35, pBear);
    canvas.drawCircle(Offset(cx - r * 0.8, cy - r * 0.8), r * 0.35, pBorder);
    canvas.drawCircle(Offset(cx - r * 0.8, cy - r * 0.8), r * 0.18, pMuzzle);

    canvas.drawCircle(Offset(cx + r * 0.8, cy - r * 0.8), r * 0.35, pBear);
    canvas.drawCircle(Offset(cx + r * 0.8, cy - r * 0.8), r * 0.35, pBorder);
    canvas.drawCircle(Offset(cx + r * 0.8, cy - r * 0.8), r * 0.18, pMuzzle);

    // Head
    canvas.drawCircle(Offset(cx, cy), r, pBear);
    canvas.drawCircle(Offset(cx, cy), r, pBorder);

    // Uzbek Do'ppi (Skullcap) on Bear's head
    final pathDoppi = Path();
    pathDoppi.moveTo(cx - r * 0.6, cy - r * 0.7);
    pathDoppi.quadraticBezierTo(cx, cy - r * 1.1, cx + r * 0.6, cy - r * 0.7);
    pathDoppi.quadraticBezierTo(cx, cy - r * 0.5, cx - r * 0.6, cy - r * 0.7);
    pathDoppi.close();

    final pDoppi = Paint()..color = const Color(0xFF0F5227)..style = PaintingStyle.fill; // Green Do'ppi
    canvas.drawPath(pathDoppi, pDoppi);
    canvas.drawPath(pathDoppi, pBorder);

    // Embroidered dots on Do'ppi
    final pDot = Paint()..color = AppTheme.white..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(cx - r * 0.25, cy - r * 0.78), 3, pDot);
    canvas.drawCircle(Offset(cx, cy - r * 0.83), 3, pDot);
    canvas.drawCircle(Offset(cx + r * 0.25, cy - r * 0.78), 3, pDot);

    // Eyes
    final double eyeR = r * 0.12;
    final double leftEyeX = cx - r * 0.35;
    final double rightEyeX = cx + r * 0.35;
    final double eyeY = cy - r * 0.05;

    final pEye = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.fill;
    if (blinkVal > 0.85) {
      // Blinking (closed eye curve)
      final pBlink = Paint()
        ..color = AppTheme.darkPurpleBorder
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0
        ..strokeCap = StrokeCap.round;
      canvas.drawArc(Rect.fromCircle(center: Offset(leftEyeX, eyeY), radius: eyeR), 0, math.pi, false, pBlink);
      canvas.drawArc(Rect.fromCircle(center: Offset(rightEyeX, eyeY), radius: eyeR), 0, math.pi, false, pBlink);
    } else {
      canvas.drawCircle(Offset(leftEyeX, eyeY), eyeR, pEye);
      canvas.drawCircle(Offset(rightEyeX, eyeY), eyeR, pEye);
      // Highlights
      canvas.drawCircle(Offset(leftEyeX - 2, eyeY - 2), 2, pDot);
      canvas.drawCircle(Offset(rightEyeX - 2, eyeY - 2), 2, pDot);
    }

    // Muzzle
    canvas.drawOval(Rect.fromCenter(center: Offset(cx, cy + r * 0.3), width: r * 0.65, height: r * 0.45), pMuzzle);
    canvas.drawOval(Rect.fromCenter(center: Offset(cx, cy + r * 0.3), width: r * 0.65, height: r * 0.45), pBorder);

    // Nose
    canvas.drawOval(Rect.fromCenter(center: Offset(cx, cy + r * 0.22), width: r * 0.25, height: r * 0.16), pEye);

    // Mouth
    final pMouth = Paint()
      ..color = AppTheme.darkPurpleBorder
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(Rect.fromCircle(center: Offset(cx - r * 0.08, cy + r * 0.32), radius: r * 0.1), 0, math.pi, false, pMouth);
    canvas.drawArc(Rect.fromCircle(center: Offset(cx + r * 0.08, cy + r * 0.32), radius: r * 0.1), 0, math.pi, false, pMouth);

    // Waving Paw
    canvas.save();
    canvas.translate(cx + r * 0.9, cy + r * 0.3);
    final double waveAngle = math.sin(waveVal * math.pi * 4) * 0.25;
    canvas.rotate(waveAngle);
    
    // Paw body
    canvas.drawOval(Rect.fromCenter(center: const Offset(15, -15), width: r * 0.45, height: r * 0.35), pBear);
    canvas.drawOval(Rect.fromCenter(center: const Offset(15, -15), width: r * 0.45, height: r * 0.35), pBorder);
    // Paw pad
    canvas.drawCircle(const Offset(15, -15), r * 0.1, pMuzzle);

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class AnimatedKodiAvatar extends StatefulWidget {
  final AgeTier tier;
  const AnimatedKodiAvatar({super.key, required this.tier});

  @override
  State<AnimatedKodiAvatar> createState() => _AnimatedKodiAvatarState();
}

class _AnimatedKodiAvatarState extends State<AnimatedKodiAvatar> with TickerProviderStateMixin {
  late final AnimationController _blinkController;
  late final AnimationController _waveController;

  @override
  void initState() {
    super.initState();
    _blinkController = AnimationController(vsync: this, duration: const Duration(seconds: 4))
      ..repeat();
    _waveController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1000));
  }

  @override
  void dispose() {
    _blinkController.dispose();
    _waveController.dispose();
    super.dispose();
  }

  void _triggerWave() {
    if (!_waveController.isAnimating) {
      _waveController.forward(from: 0.0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _triggerWave,
      child: AnimatedBuilder(
        animation: Listenable.merge([_blinkController, _waveController]),
        builder: (context, child) {
          double blinkVal = 0.0;
          if (_blinkController.value > 0.93) {
            blinkVal = 1.0;
          }
          return CustomPaint(
            size: const Size(120, 110),
            painter: KodiPainter(
              blinkVal: blinkVal,
              waveVal: _waveController.value,
              tier: widget.tier,
            ),
          );
        },
      ),
    );
  }
}

// =========================================================================
// ROADMAP PATH CUSTOM PAINTER
// =========================================================================
class RoadmapPainter extends CustomPainter {
  final AgeTier tier;
  final int activeIndex;

  RoadmapPainter({required this.tier, required this.activeIndex});

  @override
  void paint(Canvas canvas, Size size) {
    final double w = size.width;
    final double h = size.height;

    // Define standard path matching the nodes
    final path = Path();
    path.moveTo(w * 0.2, h * 0.85);
    path.cubicTo(w * 0.8, h * 0.72, w * 0.8, h * 0.62, w * 0.35, h * 0.52);
    path.cubicTo(w * 0.05, h * 0.42, w * 0.4, h * 0.28, w * 0.75, h * 0.22);
    path.lineTo(w * 0.5, h * 0.08);

    Color roadColor = AppTheme.pastelGold;
    Color dashedColor = AppTheme.yellow;
    if (tier == AgeTier.toddler) {
      roadColor = const Color(0xFFCEF5E8);
      dashedColor = AppTheme.mintGreen;
    } else if (tier == AgeTier.intermediate) {
      roadColor = const Color(0xFFD6F2FE);
      dashedColor = AppTheme.marineBlue;
    } else {
      roadColor = const Color(0xFFFFEAD9);
      dashedColor = AppTheme.mandarin;
    }

    final pShadow = Paint()
      ..color = AppTheme.getBorderColorFor(roadColor)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 32.0
      ..strokeCap = StrokeCap.round;

    final pRoad = Paint()
      ..color = roadColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 26.0
      ..strokeCap = StrokeCap.round;

    final pDashed = Paint()
      ..color = dashedColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round;

    // Draw shadow path
    canvas.drawPath(path, pShadow);
    // Draw road path
    canvas.drawPath(path, pRoad);

    // Draw center dotted indicator lines
    final pathMetrics = path.computeMetrics();
    for (final metric in pathMetrics) {
      double distance = 0.0;
      while (distance < metric.length) {
        final extract = metric.extractPath(distance, distance + 8);
        canvas.drawPath(extract, pDashed);
        distance += 24.0;
      }
    }

    // Draw Biome Decoratives
    _drawBiomeDecorations(canvas, size);
  }

  void _drawBiomeDecorations(Canvas canvas, Size size) {
    final random = math.Random(101); // Stable seed
    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    List<String> emojis = ["🌸", "🍎", "🍃", "🍓"];
    if (tier == AgeTier.intermediate) emojis = ["🪐", "🚀", "⭐️", "☄️"];
    if (tier == AgeTier.advanced) emojis = ["🕌", "📜", "🛡️", "🏛️"];

    for (int i = 0; i < 8; i++) {
      final double rx = random.nextDouble() * size.width;
      final double ry = random.nextDouble() * size.height;

      // Keep decorative items off the path centers
      if ((rx - size.width * 0.5).abs() < 50) continue;

      textPainter.text = TextSpan(
        text: emojis[i % emojis.length],
        style: const TextStyle(fontSize: 22),
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(rx, ry));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// =========================================================================
// ADAPTIVE HOME TAB VIEW
// =========================================================================
class AdaptiveHomeTab extends StatefulWidget {
  final AppState appState;
  const AdaptiveHomeTab({super.key, required this.appState});

  @override
  State<AdaptiveHomeTab> createState() => _AdaptiveHomeTabState();
}

class _AdaptiveHomeTabState extends State<AdaptiveHomeTab> with TickerProviderStateMixin {
  late final AnimationController _bounceController;

  @override
  void initState() {
    super.initState();
    _bounceController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _bounceController.dispose();
    super.dispose();
  }

  Offset _getNodeOffset(int index, Size size) {
    final double w = size.width;
    final double h = size.height;
    switch (index) {
      case 0:
        return Offset(w * 0.2, h * 0.85);
      case 1:
        return Offset(w * 0.72, h * 0.68);
      case 2:
        return Offset(w * 0.35, h * 0.52);
      case 3:
        return Offset(w * 0.73, h * 0.32);
      case 4:
        return Offset(w * 0.5, h * 0.08);
      default:
        return Offset(w * 0.5, h * 0.5);
    }
  }

  void _onNodeTap(int index, AgeTier tier) {
    final ageController = Provider.of<AgeTierController>(context, listen: false);
    if (index > ageController.activeNodeIndex) {
      // Locked state alert
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Ushbu bosqich qulflangan! Oldingi topshiriqni bajaring. 🔒"),
          backgroundColor: AppTheme.appleRed,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    if (tier == AgeTier.toddler) {
      if (index == 0) {
        // Counting game
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const AdaptiveLogicGames(initialGameIndex: 0)),
        );
      } else if (index == 1) {
        // Canvas drawing
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => DrawingQuestScreen(appState: widget.appState)),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Ushbu kvest yakunlandi!")),
        );
      }
    } else if (tier == AgeTier.intermediate) {
      if (index == 0) {
        // Phonics dragging matching
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const AdaptiveLogicGames(initialGameIndex: 1)),
        );
      } else if (index == 1) {
        // Drawing quest
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => DrawingQuestScreen(appState: widget.appState)),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Yangi kvest tez orada qo'shiladi!")),
        );
      }
    } else {
      // Advanced
      if (index == 0) {
        // 3D Isometric building game
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => BuildingGameTab(appState: widget.appState)),
        );
      } else if (index == 1) {
        // Drawing quest
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => DrawingQuestScreen(appState: widget.appState)),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Super kvest yakunlandi!")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final ageController = Provider.of<AgeTierController>(context);
    final tier = ageController.activeTier;
    final accentColor = ageController.getAccentColor();
    final size = MediaQuery.of(context).size;
    final double roadmapHeight = size.height * 0.95;

    return Scaffold(
      backgroundColor: ageController.getBiomeBgColor(),
      body: SafeArea(
        child: Column(
          children: [
            // Top Interactive Character Header
            _buildInteractiveHeader(tier, accentColor, ageController),

            // Continuous Roadmap Path View
            Expanded(
              child: SingleChildScrollView(
                child: SizedBox(
                  height: roadmapHeight,
                  width: double.infinity,
                  child: Stack(
                    children: [
                      // Roadmap Line CustomPainter
                      Positioned.fill(
                        child: CustomPaint(
                          painter: RoadmapPainter(
                            tier: tier,
                            activeIndex: ageController.activeNodeIndex,
                          ),
                        ),
                      ),

                      // Circular Activity Nodes
                      ...List.generate(5, (index) {
                        final pos = _getNodeOffset(index, Size(size.width, roadmapHeight));
                        final bool isLocked = index > ageController.activeNodeIndex;
                        final bool isActive = index == ageController.activeNodeIndex;

                        return Positioned(
                          left: pos.dx - 32,
                          top: pos.dy - 32,
                          child: AnimatedBuilder(
                            animation: _bounceController,
                            builder: (context, child) {
                              double bounceOffset = 0.0;
                              if (isActive) {
                                bounceOffset = math.sin(_bounceController.value * math.pi) * 8;
                              }
                              return Transform.translate(
                                offset: Offset(0, -bounceOffset),
                                child: child,
                              );
                            },
                            child: GestureDetector(
                              onTap: () => _onNodeTap(index, tier),
                              child: Container(
                                width: 64,
                                height: 64,
                                decoration: AppTheme.vibrant3DBoxDecoration(
                                  color: isLocked 
                                      ? Colors.grey.shade300 
                                      : (isActive ? AppTheme.yellow : accentColor),
                                  radius: 20,
                                  shadowOffset: const Offset(3, 3),
                                ),
                                alignment: Alignment.center,
                                child: isLocked 
                                    ? const Icon(Icons.lock_rounded, color: Colors.grey, size: 24)
                                    : Text(
                                        "${index + 1}",
                                        style: AppTheme.headerMedium.copyWith(color: AppTheme.white, fontSize: 20),
                                      ),
                              ),
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInteractiveHeader(AgeTier tier, Color accentColor, AgeTierController controller) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: const BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(32),
        ),
        boxShadow: [
          BoxShadow(color: AppTheme.pastelPeach, offset: Offset(0, 4), blurRadius: 0),
        ],
      ),
      child: Row(
        children: [
          // Animated Kodi Avatar skullcap bear
          AnimatedKodiAvatar(tier: tier),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Kodi Olamida",
                  style: AppTheme.headerMedium.copyWith(color: AppTheme.darkPurple),
                ),
                Text(
                  "Biome: ${controller.getBiomeName()}",
                  style: AppTheme.bodySmall.copyWith(color: accentColor, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          
          // Next Level Progression trigger (Cheat/Helper button for child)
          GestureDetector(
            onTap: () {
              controller.advanceNode();
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: AppTheme.mintGreen,
                radius: 16,
                borderWidth: 2,
                shadowOffset: const Offset(2, 2),
              ),
              child: Row(
                children: [
                  Text("Keyingi", style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 12)),
                  const Icon(Icons.arrow_forward_rounded, color: AppTheme.white, size: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
