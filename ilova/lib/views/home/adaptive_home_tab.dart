import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../controllers/age_tier_controller.dart';
import '../../controllers/app_state.dart';
import '../game/adaptive_logic_games.dart';
import 'smart_shorts_view.dart';

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
// 3D-STYLED environment LANDSCAPE BACKGROUND PAINTER
// =========================================================================
class LandscapeBackdropPainter extends CustomPainter {
  final double timeVal;

  LandscapeBackdropPainter({required this.timeVal});

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

    // Distant rolling green hills
    final pFarHills = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFFA5D6A7), Color(0xFF81C784)],
      ).createShader(skyRect);

    final pathFarHills = Path()
      ..moveTo(0, h * 0.6)
      ..quadraticBezierTo(w * 0.25, h * 0.45, w * 0.5, h * 0.58)
      ..quadraticBezierTo(w * 0.75, h * 0.7, w, h * 0.55)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(pathFarHills, pFarHills);

    // River
    final pRiver = Paint()
      ..color = const Color(0xFF4FC3F7).withAlpha(160)
      ..style = PaintingStyle.fill;
    final pathRiver = Path()
      ..moveTo(w * 0.2, h)
      ..quadraticBezierTo(w * 0.4, h * 0.78, w * 0.55, h * 0.7)
      ..quadraticBezierTo(w * 0.7, h * 0.62, w * 0.9, 0)
      ..lineTo(w * 0.98, 0)
      ..quadraticBezierTo(w * 0.78, h * 0.65, w * 0.62, h * 0.75)
      ..quadraticBezierTo(w * 0.45, h * 0.85, w * 0.32, h)
      ..close();
    canvas.drawPath(pathRiver, pRiver);

    // Near rolling green hills
    final pNearHills = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF81C784), Color(0xFF4CAF50)],
      ).createShader(skyRect);

    final pathNearHills = Path()
      ..moveTo(0, h * 0.75)
      ..quadraticBezierTo(w * 0.3, h * 0.85, w * 0.65, h * 0.72)
      ..quadraticBezierTo(w * 0.85, h * 0.65, w, h * 0.78)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(pathNearHills, pNearHills);

    // Floating animated cotton clouds
    final pCloud = Paint()..color = Colors.white.withAlpha(200)..style = PaintingStyle.fill;
    _drawCloud(canvas, w * 0.2 + (40 * math.sin(timeVal)), h * 0.2, pCloud);
    _drawCloud(canvas, w * 0.75 + (30 * math.cos(timeVal)), h * 0.15, pCloud);

    // Traditional Uzbek Turquoise Archway backdrop
    _drawUzbekArchway(canvas, w * 0.5, h * 0.72, 60, 90);
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

    final leftPillar = Rect.fromLTWH(x - width / 2, y - height, 10, height);
    final rightPillar = Rect.fromLTWH(x + width / 2 - 10, y - height, 10, height);

    canvas.drawRect(leftPillar, pArch);
    canvas.drawRect(leftPillar, pArchOutline);
    canvas.drawRect(rightPillar, pArch);
    canvas.drawRect(rightPillar, pArchOutline);

    final pathDome = Path()
      ..moveTo(x - width / 2, y - height)
      ..quadraticBezierTo(x, y - height - 30, x + width / 2, y - height)
      ..quadraticBezierTo(x, y - height - 10, x - width / 2, y - height)
      ..close();
    canvas.drawPath(pathDome, pArch);
    canvas.drawPath(pathDome, pArchOutline);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// =========================================================================
// INTERACTIVE "SEHRLI UY" TREEHOUSE HUB & ROADMAP WIDGET
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
    _landscapeAnimController = AnimationController(vsync: this, duration: const Duration(seconds: 12))..repeat();
    
    // Trigger loops & vocal briefing on init
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

  @override
  Widget build(BuildContext context) {
    final ageController = Provider.of<AgeTierController>(context);
    final tier = ageController.activeTier;
    final accentColor = ageController.getAccentColor();
    final bool isPreLiterate = !ageController.canReadWrite;

    return Scaffold(
      backgroundColor: ageController.getBiomeBgColor(),
      body: SafeArea(
        child: Column(
          children: [
            _buildInteractiveHeader(tier, accentColor, ageController, isPreLiterate),

            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: AnimatedBuilder(
                      animation: _landscapeAnimController,
                      builder: (context, child) {
                        return CustomPaint(
                          painter: LandscapeBackdropPainter(
                            timeVal: _landscapeAnimController.value * math.pi * 2,
                          ),
                        );
                      },
                    ),
                  ),

                  // Tactile Treehouse Hub
                  Positioned.fill(
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: Column(
                        children: [
                          const SizedBox(height: 20),
                          _buildSehrliUy(context, isPreLiterate, accentColor),
                          const SizedBox(height: 100),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSehrliUy(BuildContext context, bool isPreLiterate, Color accentColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          // Header of Sehrli Uy (Zero text for pre-literate)
          if (!isPreLiterate) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: AppTheme.white,
                radius: 20,
                borderColor: AppTheme.darkPurpleBorder,
              ),
              child: Text(
                "🏰 Sehrli Uy: Qiziqarli Olamlar!",
                style: AppTheme.headerMedium.copyWith(color: AppTheme.darkPurple, fontSize: 16),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 20),
          ],

          // 1. Kodi the Bear (🐻): Voice AI
          _buildTreehouseLayer(
            icon: "🐻",
            title: "Kodi Ovozli Companion",
            subtitle: "Voice AI bilan jonli suhbatlar",
            color: AppTheme.pastelGold,
            borderColor: AppTheme.yellow,
            isPreLiterate: isPreLiterate,
            onTap: () {
              final controller = Provider.of<AgeTierController>(context, listen: false);
              controller.toggleVoiceAI(!controller.voiceAIActive);
              _sayKodiWelcome();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(isPreLiterate ? "🎤 🔊" : "Kodi ovozli yordamchisi faollashdi! Ovoz chiqarib gapiring."),
                  backgroundColor: AppTheme.yellow,
                ),
              );
            },
            actionIcon: Icons.record_voice_over_rounded,
          ),
          const SizedBox(height: 20),

          // 2. Alisher the Rabbit (🐰): Phonics Phonics Snap-back Grid
          _buildTreehouseLayer(
            icon: "🐰",
            title: "Alisherning Harflar Uyasi",
            subtitle: "Boshlang'ich Savodxonlik o'yini",
            color: AppTheme.pastelBlue,
            borderColor: AppTheme.marineBlue,
            isPreLiterate: isPreLiterate,
            onTap: () {
              _showScholarSelectorDialog(context, isPreLiterate);
            },
            actionIcon: Icons.spellcheck_rounded,
          ),
          const SizedBox(height: 20),

          // 3. Temur the Fox (🦊): Lego Architecture
          _buildTreehouseLayer(
            icon: "🦊",
            title: "Temurning Seysmik Laboratoriyasi",
            subtitle: "3D Lego va Zilzila simulyatori",
            color: AppTheme.pastelMint,
            borderColor: AppTheme.mintGreen,
            isPreLiterate: isPreLiterate,
            onTap: () {
              Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AdaptiveLogicGames(initialGameIndex: 2)));
            },
            actionIcon: Icons.architecture_rounded,
          ),
          const SizedBox(height: 20),

          // 4. Uzbek Tarbiyaviy Shorts (🎬): Lola va uning do'stlari, Dono Momo, Bek Kids
          _buildTreehouseLayer(
            icon: "🎬",
            title: isPreLiterate ? "🎬" : "Uzbek Tarbiyaviy Shorts",
            subtitle: isPreLiterate ? "🎬" : "Qiziqarli Uzbek Multfilmlari",
            color: AppTheme.pastelGold.withValues(alpha: 0.8),
            borderColor: AppTheme.mandarin,
            isPreLiterate: isPreLiterate,
            onTap: () {
              Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SmartShortsView()));
            },
            actionIcon: Icons.video_library_rounded,
          ),
        ],
      ),
    );
  }

  Widget _buildTreehouseLayer({
    required String icon,
    required String title,
    required String subtitle,
    required Color color,
    required Color borderColor,
    required bool isPreLiterate,
    required VoidCallback onTap,
    required IconData actionIcon,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: AppTheme.vibrant3DBoxDecoration(
          color: color,
          radius: 28,
          borderColor: borderColor,
          shadowOffset: const Offset(4, 4),
        ),
        child: Row(
          children: [
            // Animal Emblem
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(200),
                shape: BoxShape.circle,
                border: Border.all(color: borderColor, width: 3),
              ),
              alignment: Alignment.center,
              child: Text(icon, style: const TextStyle(fontSize: 48)),
            ),
            const SizedBox(width: 18),

            // Content Area (Zero text for pre-literate child)
            Expanded(
              child: isPreLiterate
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        // Giant tactile layout icons
                        Icon(Icons.play_circle_fill_rounded, color: borderColor, size: 54),
                        const SizedBox(width: 16),
                        Icon(actionIcon, color: borderColor.withAlpha(180), size: 36),
                      ],
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title, style: AppTheme.headerMedium.copyWith(color: AppTheme.darkPurple, fontSize: 16)),
                        const SizedBox(height: 4),
                        Text(subtitle, style: TextStyle(fontSize: 12, color: AppTheme.darkPurple.withAlpha(180))),
                      ],
                    ),
            ),
            if (!isPreLiterate) ...[
              const SizedBox(width: 8),
              Icon(Icons.arrow_forward_ios_rounded, color: borderColor, size: 20),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildInteractiveHeader(AgeTier tier, Color accentColor, AgeTierController controller, bool isPreLiterate) {
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
            child: isPreLiterate
                ? const SizedBox.shrink()
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        controller.activeChildName,
                        style: AppTheme.headerMedium.copyWith(color: AppTheme.darkPurple),
                      ),
                      Text(
                        "Sehrli Uy: ${controller.getBiomeName()}",
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

  void _showScholarSelectorDialog(BuildContext context, bool isPreLiterate) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
        title: isPreLiterate
            ? const Center(child: Text("🤔 🧭 ✨", style: TextStyle(fontSize: 24)))
            : Text(
                "Olimingizni tanlang",
                style: AppTheme.headerMedium.copyWith(color: AppTheme.darkPurple),
                textAlign: TextAlign.center,
              ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Mirzo Ulugbek
            _buildScholarChoiceTile(
              context: ctx,
              name: "Mirzo Ulug'bek",
              tag: "ulugbek",
              icon: "🔭",
              color: AppTheme.pastelBlue,
              isPreLiterate: isPreLiterate,
            ),
            const SizedBox(height: 12),
            // Ibn Sino
            _buildScholarChoiceTile(
              context: ctx,
              name: "Ibn Sino",
              tag: "ibnsino",
              icon: "🧪",
              color: AppTheme.pastelMint,
              isPreLiterate: isPreLiterate,
            ),
            const SizedBox(height: 12),
            // Al-Xorazmiy
            _buildScholarChoiceTile(
              context: ctx,
              name: "Al-Xorazmiy",
              tag: "xorazmiy",
              icon: "🧮",
              color: AppTheme.pastelPeach,
              isPreLiterate: isPreLiterate,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScholarChoiceTile({
    required BuildContext context,
    required String name,
    required String tag,
    required String icon,
    required Color color,
    required bool isPreLiterate,
  }) {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context); // close dialog
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => AdaptiveLogicGames(scholarType: tag),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: AppTheme.vibrant3DBoxDecoration(
          color: color,
          radius: 20,
          borderColor: AppTheme.darkPurpleBorder,
          shadowOffset: const Offset(3, 3),
        ),
        child: Row(
          children: [
            Text(icon, style: const TextStyle(fontSize: 28)),
            const SizedBox(width: 14),
            Expanded(
              child: isPreLiterate
                  ? const Align(
                      alignment: Alignment.centerLeft,
                      child: Icon(Icons.play_circle_fill_rounded, color: AppTheme.darkPurple, size: 28),
                    )
                  : Text(
                      name,
                      style: AppTheme.headerSmall.copyWith(color: AppTheme.darkPurple),
                    ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, color: AppTheme.darkPurple, size: 16),
          ],
        ),
      ),
    );
  }
}
