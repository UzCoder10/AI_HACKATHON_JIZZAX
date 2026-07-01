import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../controllers/age_tier_controller.dart';
import '../../controllers/app_state.dart';
import '../../models/data_models.dart';
import '../game/adaptive_logic_games.dart';
import 'drawing_quest_screen.dart';

// =========================================================================
// KODI THE BEAR IDLE BREATHING & NEON GLOW PAINTER
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

    // Left Ear
    canvas.save();
    canvas.translate(cx - r * 0.8, cy - r * 0.8);
    canvas.rotate(earTwitch);
    canvas.drawCircle(Offset.zero, r * 0.35, pBear);
    canvas.drawCircle(Offset.zero, r * 0.35, pBorder);
    canvas.drawCircle(Offset.zero, r * 0.18, pMuzzle);
    canvas.restore();

    // Right Ear
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
// 3D-STYLED environment LANDSCAPE ROADMAP CUSTOM PAINTER
// =========================================================================
class LandscapeRoadmapPainter extends CustomPainter {
  final AgeTier tier;
  final int activeIndex;
  final List<String> focusAreas;
  final double timeVal; // For animated floating clouds

  LandscapeRoadmapPainter({
    required this.tier,
    required this.activeIndex,
    required this.focusAreas,
    required this.timeVal,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final double w = size.width;
    final double h = size.height;

    // Draw Sky Background Gradient
    final Rect skyRect = Offset.zero & size;
    final Paint pSky = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFFE0F2F1), Color(0xFFE8F5E9)],
      ).createShader(skyRect);
    canvas.drawRect(skyRect, pSky);

    // Distant procedural rolling green hills
    final pFarHills = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFFA5D6A7), Color(0xFF81C784)],
      ).createShader(skyRect);

    final pathFarHills = Path()
      ..moveTo(0, h * 0.5)
      ..quadraticBezierTo(w * 0.25, h * 0.38, w * 0.5, h * 0.48)
      ..quadraticBezierTo(w * 0.75, h * 0.58, w, h * 0.45)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(pathFarHills, pFarHills);

    // Procedural Cascading River
    final pRiver = Paint()
      ..color = const Color(0xFF4FC3F7).withAlpha(160)
      ..style = PaintingStyle.fill;
    final pathRiver = Path()
      ..moveTo(w * 0.15, h)
      ..quadraticBezierTo(w * 0.35, h * 0.75, w * 0.52, h * 0.65)
      ..quadraticBezierTo(w * 0.7, h * 0.55, w * 0.85, 0)
      ..lineTo(w * 0.92, 0)
      ..quadraticBezierTo(w * 0.75, h * 0.58, w * 0.58, h * 0.68)
      ..quadraticBezierTo(w * 0.42, h * 0.78, w * 0.28, h)
      ..close();
    canvas.drawPath(pathRiver, pRiver);

    // Near procedural rolling green hills
    final pNearHills = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF81C784), Color(0xFF4CAF50)],
      ).createShader(skyRect);

    final pathNearHills = Path()
      ..moveTo(0, h * 0.65)
      ..quadraticBezierTo(w * 0.3, h * 0.78, w * 0.65, h * 0.62)
      ..quadraticBezierTo(w * 0.85, h * 0.52, w, h * 0.68)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(pathNearHills, pNearHills);

    // Floating animated cotton clouds
    final pCloud = Paint()..color = Colors.white.withAlpha(200)..style = PaintingStyle.fill;
    _drawCloud(canvas, w * 0.2 + (50 * math.sin(timeVal)), h * 0.2, pCloud);
    _drawCloud(canvas, w * 0.7 + (40 * math.cos(timeVal)), h * 0.15, pCloud);

    // Dotted Roadmap Pathway
    final pPathShadow = Paint()
      ..color = const Color(0xFFE4C39E)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 36.0
      ..strokeCap = StrokeCap.round;

    final pPath = Paint()
      ..color = const Color(0xFFFBE4C9)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 30.0
      ..strokeCap = StrokeCap.round;

    final pathRoad = Path();
    pathRoad.moveTo(100, h * 0.75);
    pathRoad.cubicTo(w * 0.28, h * 0.85, w * 0.35, h * 0.55, w * 0.52, h * 0.72);
    pathRoad.cubicTo(w * 0.68, h * 0.88, w * 0.76, h * 0.58, w - 120, h * 0.68);

    canvas.drawPath(pathRoad, pPathShadow);
    canvas.drawPath(pathRoad, pPath);

    // Traditional Uzbek Turquoise Archway at the start
    _drawUzbekArchway(canvas, 100, h * 0.75, 42, 65);
    // Traditional Uzbek Turquoise Archway at the end
    _drawUzbekArchway(canvas, w - 120, h * 0.68, 42, 65);

    // Draw decorators based on focus areas
    final textPainter = TextPainter(textDirection: TextDirection.ltr);
    for (final area in focusAreas) {
      if (area.contains("Aniq Fanlar")) {
        _drawEmojiLabel(canvas, "📐", Offset(w * 0.3, h * 0.68), textPainter);
        _drawEmojiLabel(canvas, "🧮", Offset(w * 0.62, h * 0.75), textPainter);
      } else if (area.contains("Tanqidiy Fikr")) {
        _drawEmojiLabel(canvas, "🧠", Offset(w * 0.45, h * 0.62), textPainter);
        _drawEmojiLabel(canvas, "⚙️", Offset(w * 0.78, h * 0.65), textPainter);
      } else if (area.contains("Allomalar Tarixi")) {
        _drawEmojiLabel(canvas, "🕌", Offset(w * 0.2, h * 0.72), textPainter);
        _drawEmojiLabel(canvas, "📜", Offset(w * 0.85, h * 0.58), textPainter);
      }
    }
  }

  void _drawCloud(Canvas canvas, double cx, double cy, Paint paint) {
    canvas.drawCircle(Offset(cx, cy), 22, paint);
    canvas.drawCircle(Offset(cx - 16, cy + 4), 16, paint);
    canvas.drawCircle(Offset(cx + 16, cy + 4), 16, paint);
    canvas.drawRect(Rect.fromLTWH(cx - 20, cy, 40, 20), paint);
  }

  void _drawUzbekArchway(Canvas canvas, double x, double y, double width, double height) {
    final pArch = Paint()..color = const Color(0xFF00ACC1)..style = PaintingStyle.fill;
    final pArchOutline = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.stroke..strokeWidth = 2.0;

    final leftPillar = Rect.fromLTWH(x - width / 2, y - height, 8, height);
    final rightPillar = Rect.fromLTWH(x + width / 2 - 8, y - height, 8, height);

    canvas.drawRect(leftPillar, pArch);
    canvas.drawRect(leftPillar, pArchOutline);
    canvas.drawRect(rightPillar, pArch);
    canvas.drawRect(rightPillar, pArchOutline);

    // Arch dome top
    final pathDome = Path()
      ..moveTo(x - width / 2, y - height)
      ..quadraticBezierTo(x, y - height - 24, x + width / 2, y - height)
      ..quadraticBezierTo(x, y - height - 8, x - width / 2, y - height)
      ..close();
    canvas.drawPath(pathDome, pArch);
    canvas.drawPath(pathDome, pArchOutline);
  }

  void _drawEmojiLabel(Canvas canvas, String emoji, Offset pos, TextPainter painter) {
    painter.text = TextSpan(
      text: emoji,
      style: const TextStyle(fontSize: 24),
    );
    painter.layout();
    painter.paint(canvas, Offset(pos.dx - painter.width / 2, pos.dy - painter.height / 2));
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
          final double pulseScale = 1.0 + (widget.isActive ? 0.08 * math.sin(_controller.value * math.pi * 2) : 0.0);
          return Transform.scale(
            scale: pulseScale,
            child: Stack(
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
            ),
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
// MAIN ROADMAP PAGE WITH DOPAMINE SCROLLING BIOMES & REACTIVE AUDIO
// =========================================================================
class AdaptiveHomeTab extends StatefulWidget {
  final AppState appState;
  const AdaptiveHomeTab({super.key, required this.appState});

  @override
  State<AdaptiveHomeTab> createState() => _AdaptiveHomeTabState();
}

class _AdaptiveHomeTabState extends State<AdaptiveHomeTab> with SingleTickerProviderStateMixin {
  late final AnimationController _landscapeAnimController;

  @override
  void initState() {
    super.initState();
    _landscapeAnimController = AnimationController(vsync: this, duration: const Duration(seconds: 10))..repeat();
    
    // Trigger simulated child-friendly audio and visual greeting loop on load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _playBackgroundMusic();
      _sayKodiWelcome();
    });
  }

  @override
  void dispose() {
    _landscapeAnimController.dispose();
    super.dispose();
  }

  void _playBackgroundMusic() {
    debugPrint("🎵 Simulated Ambient Music: looping background melody activated.");
  }

  void _sayKodiWelcome() {
    debugPrint("🐻 Kodi Vocal Companion: 'Xush kelibsiz, bolajon! Olamni kashf qilamiz!'");
    final ageController = Provider.of<AgeTierController>(context, listen: false);
    ageController.toggleVoiceAI(true);
    Timer(const Duration(seconds: 4), () {
      if (mounted) {
        ageController.toggleVoiceAI(false);
      }
    });
  }

  Offset _getNodeOffset(int index, Size size) {
    final double w = size.width;
    final double h = size.height;
    
    // Wide horizontal roadmap offsets
    switch (index) {
      case 0:
        return Offset(100, h * 0.75);
      case 1:
        return Offset(w * 0.28, h * 0.81);
      case 2:
        return Offset(w * 0.42, h * 0.65);
      case 3:
        return Offset(w * 0.62, h * 0.76);
      case 4:
        return Offset(w - 120, h * 0.68);
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
      } else if (index == 2) {
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AdaptiveLogicGames(initialGameIndex: 2)));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Yangi kvest kutilmoqda!")));
      }
    } else {
      if (index == 0) {
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AdaptiveLogicGames(initialGameIndex: 2)));
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
    final double roadmapWidth = size.width * 2.8;

    return Scaffold(
      backgroundColor: ageController.getBiomeBgColor(),
      body: SafeArea(
        child: Column(
          children: [
            _buildInteractiveHeader(tier, accentColor, ageController),

            Expanded(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: SizedBox(
                  width: roadmapWidth,
                  height: double.infinity,
                  child: AnimatedBuilder(
                    animation: _landscapeAnimController,
                    builder: (context, child) {
                      return Stack(
                        children: [
                          Positioned.fill(
                            child: CustomPaint(
                              painter: LandscapeRoadmapPainter(
                                tier: tier,
                                activeIndex: ageController.activeNodeIndex,
                                focusAreas: ageController.focusAreas,
                                timeVal: _landscapeAnimController.value * math.pi * 2,
                              ),
                            ),
                          ),

                          ...List.generate(5, (index) {
                            final pos = _getNodeOffset(index, Size(roadmapWidth, size.height));
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

                          _buildScholarNode(scholarsList[0], Offset(roadmapWidth * 0.15, size.height * 0.58), "Al-Xorazmiy", tier),
                          _buildScholarNode(scholarsList[1], Offset(roadmapWidth * 0.45, size.height * 0.52), "Abu Rayhon Beruniy", tier),
                          _buildScholarNode(scholarsList[2], Offset(roadmapWidth * 0.72, size.height * 0.62), "Ibn Sino", tier),
                          _buildScholarNode(scholarsList[3], Offset(roadmapWidth * 0.9, size.height * 0.48), "Mirzo Ulug'bek", tier),
                        ],
                      );
                    },
                  ),
                ),
              ),
            ),
            
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: _buildShortsRecommendationCard(accentColor, tier),
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
