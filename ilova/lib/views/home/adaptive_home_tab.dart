import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../models/data_models.dart';
import '../../controllers/app_state.dart';
import '../../controllers/age_tier_controller.dart';
import '../game/adaptive_logic_games.dart';
import '../game/building_game_tab.dart';
import 'drawing_quest_screen.dart';

// =========================================================================
// INTERACTIVE KODI THE BEAR AVATAR
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

    final pDoppi = Paint()..color = const Color(0xFF0F5227)..style = PaintingStyle.fill;
    canvas.drawPath(pathDoppi, pDoppi);
    canvas.drawPath(pathDoppi, pBorder);

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
    
    canvas.drawOval(Rect.fromCenter(center: const Offset(15, -15), width: r * 0.45, height: r * 0.35), pBear);
    canvas.drawOval(Rect.fromCenter(center: const Offset(15, -15), width: r * 0.45, height: r * 0.35), pBorder);
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
            size: const Size(110, 100),
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
// ROADMAP PATH PAINTER (WITH MULTI-BIOMES)
// =========================================================================
class RoadmapPainter extends CustomPainter {
  final AgeTier tier;
  final int activeIndex;

  RoadmapPainter({required this.tier, required this.activeIndex});

  @override
  void paint(Canvas canvas, Size size) {
    final double w = size.width;
    final double h = size.height;

    // Drawing the Winding Roadmap Path
    final path = Path();
    path.moveTo(w * 0.25, h * 0.9);
    path.cubicTo(w * 0.85, h * 0.76, w * 0.85, h * 0.64, w * 0.35, h * 0.54);
    path.cubicTo(w * 0.02, h * 0.42, w * 0.42, h * 0.26, w * 0.78, h * 0.2);
    path.lineTo(w * 0.5, h * 0.08);

    // Dynamic Biome road coloring
    Color roadColor = const Color(0xFFFFECE5);
    Color dashedColor = AppTheme.mandarin;
    if (tier == AgeTier.toddler) {
      roadColor = const Color(0xFFCEF5E8);
      dashedColor = AppTheme.mintGreen;
    } else if (tier == AgeTier.intermediate) {
      roadColor = const Color(0xFFD6F2FE);
      dashedColor = AppTheme.marineBlue;
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

    canvas.drawPath(path, pShadow);
    canvas.drawPath(path, pRoad);

    final pathMetrics = path.computeMetrics();
    for (final metric in pathMetrics) {
      double distance = 0.0;
      while (distance < metric.length) {
        final extract = metric.extractPath(distance, distance + 8);
        canvas.drawPath(extract, pDashed);
        distance += 24.0;
      }
    }

    _drawBiomeDecorations(canvas, size);
  }

  void _drawBiomeDecorations(Canvas canvas, Size size) {
    final random = math.Random(42);
    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    List<String> emojis = ["🌲", "🍓", "🍎", "🌸"];
    if (tier == AgeTier.intermediate) emojis = ["🏛️", "📜", "🎒", "🏺"];
    if (tier == AgeTier.advanced) emojis = ["🪐", "🚀", "🛰️", "🛸"];

    for (int i = 0; i < 12; i++) {
      final double rx = random.nextDouble() * size.width;
      final double ry = random.nextDouble() * size.height;

      // Ensure decorations don't sit on the roadmap line center
      if ((rx - size.width * 0.5).abs() < 60) continue;

      textPainter.text = TextSpan(
        text: emojis[i % emojis.length],
        style: const TextStyle(fontSize: 24),
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(rx, ry));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// =========================================================================
// LIVING NODE WIDGET WITH PULSE & PROGRESS
// =========================================================================
class LivingNode extends StatefulWidget {
  final int index;
  final bool isLocked;
  final bool isActive;
  final Color activeColor;
  final VoidCallback onTap;

  const LivingNode({
    super.key,
    required this.index,
    required this.isLocked,
    required this.isActive,
    required this.activeColor,
    required this.onTap,
  });

  @override
  State<LivingNode> createState() => _LivingNodeState();
}

class _LivingNodeState extends State<LivingNode> with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );
    if (widget.isActive) {
      _pulseController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double percent = widget.isLocked ? 0.0 : (widget.isActive ? 50.0 : 100.0);

    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        double scale = 1.0;
        if (widget.isActive) {
          scale = 1.0 + _pulseController.value * 0.12;
        }
        return Transform.scale(
          scale: scale,
          child: child,
        );
      },
      child: GestureDetector(
        onTap: widget.onTap,
        child: SizedBox(
          width: 72,
          height: 72,
          child: Stack(
            alignment: Alignment.center,
            children: [
              CircularProgressIndicator(
                value: percent / 100.0,
                strokeWidth: 4.5,
                backgroundColor: Colors.grey.shade200,
                valueColor: AlwaysStoppedAnimation<Color>(widget.isLocked ? Colors.grey : AppTheme.mintGreen),
              ),

              Container(
                width: 58,
                height: 58,
                decoration: AppTheme.vibrant3DBoxDecoration(
                  color: widget.isLocked
                      ? Colors.grey.shade300
                      : (widget.isActive ? AppTheme.yellow : widget.activeColor),
                  radius: 24,
                  borderWidth: 2,
                  shadowOffset: const Offset(2, 2),
                ),
                alignment: Alignment.center,
                child: widget.isLocked
                    ? const Icon(Icons.lock_rounded, color: Colors.grey, size: 22)
                    : Text(
                        "${widget.index + 1}",
                        style: AppTheme.headerMedium.copyWith(color: AppTheme.white, fontSize: 18),
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
// ADAPTIVE HOME TAB SCREEN OVERHAUL
// =========================================================================
class AdaptiveHomeTab extends StatefulWidget {
  final AppState appState;
  const AdaptiveHomeTab({super.key, required this.appState});

  @override
  State<AdaptiveHomeTab> createState() => _AdaptiveHomeTabState();
}

class _AdaptiveHomeTabState extends State<AdaptiveHomeTab> {
  Offset _getNodeOffset(int index, Size size) {
    final double w = size.width;
    final double h = size.height;
    switch (index) {
      case 0:
        return Offset(w * 0.25, h * 0.9);
      case 1:
        return Offset(w * 0.76, h * 0.72);
      case 2:
        return Offset(w * 0.35, h * 0.54);
      case 3:
        return Offset(w * 0.74, h * 0.3);
      case 4:
        return Offset(w * 0.5, h * 0.08);
      default:
        return Offset(w * 0.5, h * 0.5);
    }
  }

  void _onNodeTap(int index, AgeTier tier) {
    final ageController = Provider.of<AgeTierController>(context, listen: false);
    if (index > ageController.activeNodeIndex) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Ushbu bosqich qulflangan! Bosqichlarni ketma-ket bajaring! 🔒"),
          backgroundColor: AppTheme.appleRed,
        ),
      );
      return;
    }

    if (tier == AgeTier.toddler) {
      if (index == 0) {
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AdaptiveLogicGames(initialGameIndex: 0)));
      } else if (index == 1) {
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => DrawingQuestScreen(appState: widget.appState)));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Mavzu yakunlandi!")));
      }
    } else if (tier == AgeTier.intermediate) {
      if (index == 0) {
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AdaptiveLogicGames(initialGameIndex: 1)));
      } else if (index == 1) {
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => DrawingQuestScreen(appState: widget.appState)));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Yangi kvest kutilmoqda!")));
      }
    } else {
      if (index == 0) {
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => BuildingGameTab(appState: widget.appState)));
      } else if (index == 1) {
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => DrawingQuestScreen(appState: widget.appState)));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Imperiya qurildi!")));
      }
    }
  }

  void _openScholarGreeting(Scholar scholar) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(shape: BoxShape.circle, color: scholar.solidColor),
              child: Text(scholar.initials, style: const TextStyle(color: Colors.white, fontSize: 14)),
            ),
            const SizedBox(width: 10),
            Text(scholar.name, style: AppTheme.headerSmall),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Soha: ${scholar.field}", style: AppTheme.bodySmall.copyWith(color: scholar.solidColor, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Text(scholar.automatedGreeting, style: AppTheme.bodyLarge),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: scholar.solidColor,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              widget.appState.selectScholar(scholar);
              widget.appState.changeTab(1); // Nav to chat tab
            },
            child: Text("Suhbatlashish", style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 13)),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ageController = Provider.of<AgeTierController>(context);
    final tier = ageController.activeTier;
    final accentColor = ageController.getAccentColor();
    final size = MediaQuery.of(context).size;
    final double roadmapHeight = size.height * 1.15;

    return Scaffold(
      backgroundColor: ageController.getBiomeBgColor(),
      body: SafeArea(
        child: Column(
          children: [
            // Interactive header with bear avatar
            _buildInteractiveHeader(tier, accentColor, ageController),

            Expanded(
              child: SingleChildScrollView(
                child: SizedBox(
                  height: roadmapHeight,
                  width: double.infinity,
                  child: Stack(
                    children: [
                      // Continuous roadmap CustomPainter
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
                          left: pos.dx - 36,
                          top: pos.dy - 36,
                          child: LivingNode(
                            index: index,
                            isLocked: isLocked,
                            isActive: isActive,
                            activeColor: accentColor,
                            onTap: () => _onNodeTap(index, tier),
                          ),
                        );
                      }),

                      // Scholars (Quest Givers) placed along the path
                      _buildScholarNode(scholarsList[0], Offset(size.width * 0.8, roadmapHeight * 0.8), "Al-Xorazmiy"),
                      _buildScholarNode(scholarsList[1], Offset(size.width * 0.15, roadmapHeight * 0.6), "Abu Rayhon Beruniy"),
                      _buildScholarNode(scholarsList[2], Offset(size.width * 0.82, roadmapHeight * 0.42), "Ibn Sino"),
                      _buildScholarNode(scholarsList[3], Offset(size.width * 0.18, roadmapHeight * 0.22), "Mirzo Ulug'bek"),

                      // RECOMMENDED SHORTS BANNER CARD AT THE BOTTOM OF ROADMAP
                      Positioned(
                        bottom: 24,
                        left: 20,
                        right: 20,
                        child: _buildShortsRecommendationCard(accentColor),
                      ),
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

  Widget _buildScholarNode(Scholar scholar, Offset pos, String name) {
    String assetName = "xorazmiy.png";
    if (scholar.initials == "AB") assetName = "beruniy.png";
    if (scholar.initials == "IS") assetName = "ibnsino.png";
    if (scholar.initials == "MU") assetName = "ulugbek.png";

    return Positioned(
      left: pos.dx - 32,
      top: pos.dy - 32,
      child: GestureDetector(
        onTap: () => _openScholarGreeting(scholar),
        child: Column(
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: scholar.pastelColor,
                radius: 22,
                borderWidth: 2,
                shadowOffset: const Offset(2, 2),
                borderColor: scholar.solidColor,
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Image.asset(
                  "assets/images/$assetName",
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Center(
                      child: Text(
                        scholar.initials,
                        style: AppTheme.headerMedium.copyWith(color: scholar.solidColor, fontSize: 16),
                      ),
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.darkPurpleBorder, width: 1),
              ),
              child: Text(
                scholar.initials == "AX" ? "Matematika" : (scholar.initials == "IS" ? "Tibbiyot" : "Koinot"),
                style: AppTheme.bodySmall.copyWith(fontSize: 8, fontWeight: FontWeight.bold),
              ),
            )
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
          AnimatedKodiAvatar(tier: tier),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  controller.activeChildName,
                  style: AppTheme.headerMedium.copyWith(color: AppTheme.darkPurple),
                ),
                Text(
                  "Xarita: ${controller.getBiomeName()}",
                  style: AppTheme.bodySmall.copyWith(color: accentColor, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          
          // High-dopamine Live Star Count slot
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: AppTheme.vibrant3DBoxDecoration(
              color: AppTheme.yellow,
              radius: 16,
              borderWidth: 2,
              shadowOffset: const Offset(2, 2),
            ),
            child: Row(
              children: [
                const Icon(Icons.star_rounded, color: AppTheme.darkPurple, size: 20),
                const SizedBox(width: 4),
                Text(
                  "${controller.starsCount}",
                  style: AppTheme.headerMedium.copyWith(fontSize: 16, color: AppTheme.darkPurple),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShortsRecommendationCard(Color accentColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.vibrant3DBoxDecoration(
        color: AppTheme.white,
        radius: 24,
        borderColor: AppTheme.getBorderColorFor(accentColor),
        shadowOffset: const Offset(3, 3),
      ),
      child: Row(
        children: [
          Container(
            width: 70,
            height: 70,
            decoration: AppTheme.vibrant3DBoxDecoration(
              color: accentColor.withAlpha(50),
              radius: 18,
              borderWidth: 2,
              borderColor: accentColor,
            ),
            child: Icon(Icons.play_circle_fill_rounded, color: accentColor, size: 36),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Kunning qiziqarli kashfiyoti",
                  style: AppTheme.headerSmall.copyWith(fontSize: 12, color: Colors.grey.shade600),
                ),
                Text(
                  "Astronomiya va yulduzlar olami",
                  style: AppTheme.headerMedium.copyWith(fontSize: 14, color: AppTheme.darkPurple),
                ),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: accentColor,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
            onPressed: () {
              widget.appState.changeTab(2); // Navigate directly to Shorts tab
            },
            child: Text("Ko'rish", style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 11)),
          ),
        ],
      ),
    );
  }
}
