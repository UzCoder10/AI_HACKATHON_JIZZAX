import 'dart:async';
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
// INTERACTIVE KODI THE BEAR AVATAR (AAA JUMP & SPEECH STATE-MACHINE)
// =========================================================================
class KodiPainter extends CustomPainter {
  final double blinkVal;
  final double waveVal;
  final double breatheOffset;
  final double earTwitch;
  final AgeTier tier;

  KodiPainter({
    required this.blinkVal,
    required this.waveVal,
    required this.breatheOffset,
    required this.earTwitch,
    required this.tier,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final double cx = size.width / 2;
    final double cy = size.height / 2 + 10 + breatheOffset;
    final double r = size.width * 0.35;

    final pBear = Paint()..color = const Color(0xFFC78248)..style = PaintingStyle.fill;
    final pMuzzle = Paint()..color = const Color(0xFFF3C598)..style = PaintingStyle.fill;
    final pBorder = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.stroke..strokeWidth = 3.0;

    // Left Ear (With earTwitch rotation)
    canvas.save();
    canvas.translate(cx - r * 0.8, cy - r * 0.8);
    canvas.rotate(earTwitch);
    canvas.drawCircle(Offset.zero, r * 0.35, pBear);
    canvas.drawCircle(Offset.zero, r * 0.35, pBorder);
    canvas.drawCircle(Offset.zero, r * 0.18, pMuzzle);
    canvas.restore();

    // Right Ear (With opposite earTwitch rotation)
    canvas.save();
    canvas.translate(cx + r * 0.8, cy - r * 0.8);
    canvas.rotate(-earTwitch);
    canvas.drawCircle(Offset.zero, r * 0.35, pBear);
    canvas.drawCircle(Offset.zero, r * 0.35, pBorder);
    canvas.drawCircle(Offset.zero, r * 0.18, pMuzzle);
    canvas.restore();

    // Head
    canvas.drawCircle(Offset(cx, cy), r, pBear);
    canvas.drawCircle(Offset(cx, cy), r, pBorder);

    // Uzbek Do'ppi (Skullcap)
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
  late final AnimationController _breatheController;
  late final AnimationController _earController;
  late final AnimationController _jumpController;
  
  Timer? _waveTimer;

  @override
  void initState() {
    super.initState();
    _blinkController = AnimationController(vsync: this, duration: const Duration(seconds: 4))..repeat();
    _waveController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1000));
    _breatheController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1800))..repeat(reverse: true);
    _earController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600))..repeat(reverse: true);
    _jumpController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1000));

    _waveTimer = Timer.periodic(const Duration(seconds: 8), (t) {
      if (mounted) _triggerWave();
    });
  }

  @override
  void dispose() {
    _blinkController.dispose();
    _waveController.dispose();
    _breatheController.dispose();
    _earController.dispose();
    _jumpController.dispose();
    _waveTimer?.cancel();
    super.dispose();
  }

  void _triggerWave() {
    if (!_waveController.isAnimating) {
      _waveController.forward(from: 0.0);
    }
  }

  void _triggerJump() {
    if (!_jumpController.isAnimating) {
      _jumpController.forward(from: 0.0);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ageController = Provider.of<AgeTierController>(context);
    final voiceActive = ageController.voiceAIActive;

    return GestureDetector(
      onTap: () {
        _triggerJump();
        _triggerWave();
      },
      child: AnimatedBuilder(
        animation: Listenable.merge([
          _blinkController,
          _waveController,
          _breatheController,
          _earController,
          _jumpController,
        ]),
        builder: (context, child) {
          double blinkVal = 0.0;
          if (_blinkController.value > 0.93) {
            blinkVal = 1.0;
          }

          final double breatheScale = 0.96 + math.sin(_breatheController.value * math.pi * 2) * 0.04;
          final double breatheOffset = math.sin(_breatheController.value * math.pi * 2) * 3.5;
          final double earTwitch = math.sin(_earController.value * math.pi * 2) * 0.08;

          double squashY = 1.0;
          double stretchX = 1.0;
          if (_jumpController.isAnimating) {
            final double t = _jumpController.value;
            final double elastic = Curves.elasticOut.transform(t);
            squashY = 1.0 - 0.22 * math.sin(t * math.pi) * (1.0 - elastic);
            stretchX = 1.0 + 0.16 * math.sin(t * math.pi) * (1.0 - elastic);
          }

          final double glow = voiceActive 
              ? 12.0 + 8.0 * math.sin(_breatheController.value * math.pi * 2).abs()
              : 0.0;

          return Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: voiceActive ? [
                BoxShadow(
                  color: AppTheme.mandarin.withAlpha(200),
                  blurRadius: glow,
                  spreadRadius: glow * 0.35,
                )
              ] : null,
            ),
            child: Opacity(
              opacity: breatheScale.clamp(0.9, 1.0),
              child: Transform(
                transform: Matrix4.diagonal3Values(stretchX * breatheScale, squashY * breatheScale, 1.0),
                alignment: Alignment.bottomCenter,
                child: CustomPaint(
                  size: const Size(110, 100),
                  painter: KodiPainter(
                    blinkVal: blinkVal,
                    waveVal: _waveController.value,
                    breatheOffset: breatheOffset,
                    earTwitch: earTwitch,
                    tier: widget.tier,
                  ),
                ),
              ),
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
  final List<String> focusAreas;

  RoadmapPainter({
    required this.tier,
    required this.activeIndex,
    required this.focusAreas,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final double w = size.width;
    final double h = size.height;

    final path = Path();
    path.moveTo(w * 0.25, h * 0.9);
    path.quadraticBezierTo(w * 0.65, h * 0.85, w * 0.76, h * 0.72);
    path.quadraticBezierTo(w * 0.85, h * 0.62, w * 0.35, h * 0.54);
    path.quadraticBezierTo(w * 0.05, h * 0.44, w * 0.74, h * 0.3);
    path.quadraticBezierTo(w * 0.95, h * 0.20, w * 0.5, h * 0.08);

    final pPathShadow = Paint()
      ..color = const Color(0xFFE4C39E)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 34.0
      ..strokeCap = StrokeCap.round;

    final pPath = Paint()
      ..color = const Color(0xFFFBE4C9)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 30.0
      ..strokeCap = StrokeCap.round;

    canvas.drawPath(path, pPathShadow);
    canvas.drawPath(path, pPath);

    final pDotted = Paint()
      ..color = const Color(0xFFDCA776)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

    for (double i = 0.05; i < 0.95; i += 0.06) {
      final p1 = _getPointOnBezier(i, w, h);
      final p2 = _getPointOnBezier(i + 0.03, w, h);
      canvas.drawLine(p1, p2, pDotted);
    }

    _drawFocusDecorations(canvas, w, h);
  }

  void _drawFocusDecorations(Canvas canvas, double w, double h) {
    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    for (final area in focusAreas) {
      if (area.contains("Aniq Fanlar")) {
        _drawEmojiLabel(canvas, "📐", Offset(w * 0.52, h * 0.84), textPainter);
        _drawEmojiLabel(canvas, "🧮", Offset(w * 0.25, h * 0.49), textPainter);
      } else if (area.contains("Tanqidiy Fikr")) {
        _drawEmojiLabel(canvas, "⚙️", Offset(w * 0.82, h * 0.67), textPainter);
        _drawEmojiLabel(canvas, "🧠", Offset(w * 0.48, h * 0.26), textPainter);
      } else if (area.contains("Allomalar Tarixi")) {
        _drawEmojiLabel(canvas, "📜", Offset(w * 0.15, h * 0.58), textPainter);
        _drawEmojiLabel(canvas, "🕌", Offset(w * 0.80, h * 0.35), textPainter);
      }
    }
  }

  void _drawEmojiLabel(Canvas canvas, String emoji, Offset pos, TextPainter painter) {
    painter.text = TextSpan(
      text: emoji,
      style: const TextStyle(fontSize: 24),
    );
    painter.layout();
    painter.paint(canvas, Offset(pos.dx - painter.width / 2, pos.dy - painter.height / 2));
  }

  Offset _getPointOnBezier(double t, double w, double h) {
    final p0 = Offset(w * 0.25, h * 0.9);
    final p1 = Offset(w * 0.76, h * 0.72);
    final p2 = Offset(w * 0.35, h * 0.54);
    final p3 = Offset(w * 0.74, h * 0.3);
    final p4 = Offset(w * 0.5, h * 0.08);

    if (t < 0.25) {
      final double localT = t / 0.25;
      return Offset.lerp(p0, p1, localT)!;
    } else if (t < 0.5) {
      final double localT = (t - 0.25) / 0.25;
      return Offset.lerp(p1, p2, localT)!;
    } else if (t < 0.75) {
      final double localT = (t - 0.5) / 0.25;
      return Offset.lerp(p2, p3, localT)!;
    } else {
      final double localT = (t - 0.75) / 0.25;
      return Offset.lerp(p3, p4, localT)!;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// =========================================================================
// LIVING ROADMAP NODE WITH RADAR PULSES
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
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );
    if (widget.isActive) {
      _controller.repeat();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Color nodeBg = widget.isLocked 
        ? Colors.grey.shade300 
        : (widget.isActive ? widget.activeColor : AppTheme.white);
    final Color labelColor = widget.isLocked 
        ? Colors.grey 
        : (widget.isActive ? AppTheme.white : AppTheme.darkPurple);
    final Color borderColor = widget.isLocked 
        ? Colors.grey.shade400 
        : AppTheme.getBorderColorFor(widget.activeColor);

    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Stack(
            alignment: Alignment.center,
            children: [
              if (widget.isActive)
                Container(
                  width: 72 + (24 * _controller.value),
                  height: 72 + (24 * _controller.value),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: widget.activeColor.withAlpha(((1.0 - _controller.value) * 255).round()),
                      width: 3.0,
                    ),
                  ),
                ),
              child!,
            ],
          );
        },
        child: Container(
          width: 72,
          height: 72,
          decoration: AppTheme.vibrant3DBoxDecoration(
            color: nodeBg,
            radius: 36,
            borderWidth: widget.isActive ? 4 : 3,
            borderColor: borderColor,
            shadowColor: widget.isLocked ? Colors.transparent : widget.activeColor,
          ),
          alignment: Alignment.center,
          child: widget.isLocked
              ? const Icon(Icons.lock_rounded, color: Colors.grey, size: 28)
              : Text(
                  "${widget.index + 1}",
                  style: AppTheme.headerMedium.copyWith(color: labelColor, fontSize: 26),
                ),
        ),
      ),
    );
  }
}

// =========================================================================
// MAIN ROADMAP COMPONENT
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
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Yangi 3D kvest kutilmoqda!")));
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
            _buildInteractiveHeader(tier, accentColor, ageController),

            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    SizedBox(
                      height: roadmapHeight,
                      width: double.infinity,
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: CustomPaint(
                              painter: RoadmapPainter(
                                tier: tier,
                                activeIndex: ageController.activeNodeIndex,
                                focusAreas: ageController.focusAreas,
                              ),
                            ),
                          ),

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

                          _buildScholarNode(scholarsList[0], Offset(size.width * 0.8, roadmapHeight * 0.8), "Al-Xorazmiy", tier),
                          _buildScholarNode(scholarsList[1], Offset(size.width * 0.15, roadmapHeight * 0.6), "Abu Rayhon Beruniy", tier),
                          _buildScholarNode(scholarsList[2], Offset(size.width * 0.82, roadmapHeight * 0.42), "Ibn Sino", tier),
                          _buildScholarNode(scholarsList[3], Offset(size.width * 0.18, roadmapHeight * 0.22), "Mirzo Ulug'bek", tier),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: _buildShortsRecommendationCard(accentColor, tier),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScholarNode(Scholar scholar, Offset pos, String name, AgeTier tier) {
    String assetName = "xorazmiy.png";
    if (scholar.initials == "AB") assetName = "beruniy.png";
    if (scholar.initials == "IS") assetName = "ibnsino.png";
    if (scholar.initials == "MU") assetName = "ulugbek.png";

    final bool isIntermediate = tier == AgeTier.intermediate;

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
            if (!isIntermediate) ...[
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
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInteractiveHeader(AgeTier tier, Color accentColor, AgeTierController controller) {
    final bool isIntermediate = tier == AgeTier.intermediate;

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
            child: isIntermediate
                ? const SizedBox.shrink()
                : Column(
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
          
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: AppTheme.vibrant3DBoxDecoration(
              color: AppTheme.yellow,
              radius: 16,
              borderWidth: 2,
              shadowOffset: const Offset(3, 3),
            ),
            child: Row(
              children: [
                const Icon(Icons.star_rounded, color: AppTheme.darkPurple, size: 22),
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

  Widget _buildShortsRecommendationCard(Color accentColor, AgeTier tier) {
    final bool isIntermediate = tier == AgeTier.intermediate;

    // Organic interactive button style with thick 3D offset (Offset(5, 5))
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.vibrant3DBoxDecoration(
        color: AppTheme.white,
        radius: 28,
        borderColor: AppTheme.getBorderColorFor(accentColor),
        shadowOffset: const Offset(5, 5),
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
              shadowOffset: const Offset(2, 2),
            ),
            child: Icon(Icons.play_circle_fill_rounded, color: accentColor, size: 36),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: isIntermediate
                ? Row(
                    children: [
                      Icon(Icons.star_rounded, color: AppTheme.yellow, size: 30),
                      Icon(Icons.star_rounded, color: AppTheme.yellow, size: 30),
                      Icon(Icons.star_rounded, color: AppTheme.yellow, size: 30),
                    ],
                  )
                : Column(
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
          GestureDetector(
            onTap: () {
              widget.appState.changeTab(2); // Navigate directly to Shorts tab
            },
            child: AnimatedScale(
              scale: 1.0,
              duration: const Duration(milliseconds: 200),
              curve: Curves.bounceOut,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: AppTheme.vibrant3DBoxDecoration(
                  color: accentColor,
                  radius: 16,
                  borderColor: AppTheme.getBorderColorFor(accentColor),
                  shadowOffset: const Offset(3, 3),
                ),
                child: isIntermediate
                    ? const Icon(Icons.check_circle_rounded, color: Colors.white, size: 24)
                    : Text(
                        "Ko'rish",
                        style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 13),
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
