import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';
import '../../controllers/age_tier_controller.dart';
import '../../core/gemini_service.dart';

// =========================================================================
// TODDLER PEG / PACHINKO / PHYSICS MODEL DEFINITIONS
// =========================================================================
class Peg {
  final Offset pos;
  final double radius;
  Peg({required this.pos, required this.radius});
}

class FruitBubble {
  Offset pos;
  Offset vel;
  final double radius;
  final String emoji;
  final Color color;
  bool isPopped = false;
  double scale = 1.0;
  double popAnimTime = 0.0;

  FruitBubble({
    required this.pos,
    required this.vel,
    required this.radius,
    required this.emoji,
    required this.color,
  });

  void update(double dt, List<Peg> pegs) {
    if (!isPopped) {
      vel = Offset(vel.dx, vel.dy + 250.0 * dt);
      pos += vel * dt;

      for (final peg in pegs) {
        final double dist = (pos - peg.pos).distance;
        final double minDist = radius + peg.radius;
        if (dist < minDist) {
          final normal = (pos - peg.pos) / dist;
          pos = peg.pos + normal * minDist;
          final double dotProduct = vel.dx * normal.dx + vel.dy * normal.dy;
          vel = Offset(vel.dx - 2 * dotProduct * normal.dx, vel.dy - 2 * dotProduct * normal.dy) * 0.75;
          vel += Offset((math.Random().nextDouble() - 0.5) * 50.0, 0.0);
        }
      }
    } else {
      popAnimTime += dt * 10;
      scale = 1.0 + math.sin(popAnimTime) * 0.6;
    }
  }
}

class BubbleParticle {
  Offset pos;
  Offset vel;
  final Color color;
  double size;
  double opacity = 1.0;

  BubbleParticle({
    required this.pos,
    required this.vel,
    required this.color,
    required this.size,
  });

  void update(double dt) {
    vel = Offset(vel.dx, vel.dy + 300.0 * dt);
    pos += vel * dt;
    if (pos.dy >= 380) {
      pos = Offset(pos.dx, 380);
      vel = Offset(vel.dx * 0.7, -vel.dy * 0.4);
    }
    size = math.max(0.0, size - 4.0 * dt);
    opacity = math.max(0.0, opacity - 1.2 * dt);
  }
}

class ToddlerPachinkoPainter extends CustomPainter {
  final List<FruitBubble> bubbles;
  final List<BubbleParticle> particles;
  final List<Peg> pegs;
  final List<double> basketRecoils;

  ToddlerPachinkoPainter({
    required this.bubbles,
    required this.particles,
    required this.pegs,
    required this.basketRecoils,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final textPainter = TextPainter(textDirection: TextDirection.ltr);
    final pPeg = Paint()..color = AppTheme.white..style = PaintingStyle.fill;
    final pPegBorder = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.stroke..strokeWidth = 2.0;

    for (final peg in pegs) {
      canvas.drawCircle(peg.pos, peg.radius, pPeg);
      canvas.drawCircle(peg.pos, peg.radius, pPegBorder);
      canvas.drawCircle(peg.pos, 2, Paint()..color = AppTheme.darkPurple);
    }

    for (final b in bubbles) {
      if (b.isPopped && b.popAnimTime >= math.pi) continue;

      canvas.save();
      canvas.translate(b.pos.dx, b.pos.dy);
      canvas.scale(b.scale, b.scale);

      final pBubble = Paint()..color = b.color.withAlpha(190)..style = PaintingStyle.fill;
      canvas.drawCircle(Offset.zero, b.radius, pBubble);
      canvas.drawCircle(Offset.zero, b.radius, pPegBorder);

      textPainter.text = TextSpan(text: b.emoji, style: TextStyle(fontSize: b.radius * 1.05));
      textPainter.layout();
      textPainter.paint(canvas, Offset(-textPainter.width / 2, -textPainter.height / 2));
      canvas.restore();
    }

    final double basketWidth = size.width / 3 - 16;
    final double basketHeight = 45.0;
    final double basketY = size.height - 75.0;
    final basketColors = [AppTheme.mandarin, AppTheme.yellow, AppTheme.mintGreen];

    for (int i = 0; i < 3; i++) {
      final double bx = 8 + i * (size.width / 3) + 4;
      final double recoil = basketRecoils[i];
      final rect = Rect.fromLTWH(bx, basketY + recoil, basketWidth, basketHeight);
      canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(16)), Paint()..color = basketColors[i]);
      canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(16)), pPegBorder);
    }

    for (final p in particles) {
      canvas.drawCircle(p.pos, p.size, Paint()..color = p.color.withAlpha((p.opacity * 255).round()));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// =========================================================================
// INTERMEDIATE DRAGGABLE PHONICS MODELS
// =========================================================================
class SyllableBlock {
  final String text;
  Offset currentPos;
  final Offset originalPos;
  bool isDragging = false;
  bool isMatched = false;
  final Color color;

  SyllableBlock({
    required this.text,
    required this.currentPos,
    required this.originalPos,
    required this.color,
  });
}

class SyllableSlot {
  final String expectedText;
  final Offset pos;
  final Size size;
  bool filled = false;

  SyllableSlot({
    required this.expectedText,
    required this.pos,
    required this.size,
  });
}

class SyllableWordConfig {
  final String correctWord;
  final List<String> syllablesScrambled;
  final List<String> correctSequence;

  SyllableWordConfig({
    required this.correctWord,
    required this.syllablesScrambled,
    required this.correctSequence,
  });
}

class SyllableObjectPainter extends CustomPainter {
  final int wordIndex;
  final double pulseAnimation;

  SyllableObjectPainter({required this.wordIndex, required this.pulseAnimation});

  @override
  void paint(Canvas canvas, Size size) {
    final double cx = size.width / 2;
    final double cy = size.height / 2;
    final double scale = 1.0 + math.sin(pulseAnimation * math.pi) * 0.08;

    canvas.save();
    canvas.translate(cx, cy);
    canvas.scale(scale, scale);

    final pStroke = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.stroke..strokeWidth = 3.0;

    if (wordIndex == 0) {
      canvas.drawCircle(const Offset(-14, 0), 28, Paint()..color = AppTheme.appleRed);
      canvas.drawCircle(const Offset(14, 0), 28, Paint()..color = AppTheme.appleRed);
      canvas.drawCircle(const Offset(-14, 0), 28, pStroke);
      canvas.drawCircle(const Offset(14, 0), 28, pStroke);

      final pLeaf = Paint()..color = AppTheme.mintGreen..style = PaintingStyle.fill;
      final pathLeaf = Path()
        ..moveTo(0, -28)
        ..quadraticBezierTo(15, -45, 18, -32)
        ..quadraticBezierTo(5, -24, 0, -28)
        ..close();
      canvas.drawPath(pathLeaf, pLeaf);
      canvas.drawPath(pathLeaf, pStroke);
    } else if (wordIndex == 1) {
      final pBlue = Paint()..color = AppTheme.marineBlue..style = PaintingStyle.fill;
      final pPages = Paint()..color = AppTheme.white..style = PaintingStyle.fill;
      
      final pathCover = Path()
        ..moveTo(-34, -20)
        ..lineTo(30, -20)
        ..lineTo(34, 25)
        ..lineTo(-30, 25)
        ..close();
      canvas.drawPath(pathCover, pBlue);
      canvas.drawPath(pathCover, pStroke);

      final pathPages = Path()
        ..moveTo(-30, -16)
        ..lineTo(26, -16)
        ..lineTo(30, 21)
        ..lineTo(-26, 21)
        ..close();
      canvas.drawPath(pathPages, pPages);
      canvas.drawPath(pathPages, pStroke);
    } else {
      final pWood = Paint()..color = AppTheme.pastelGold..style = PaintingStyle.fill;
      final pLead = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.fill;
      final pPencilBody = Paint()..color = AppTheme.mandarin..style = PaintingStyle.fill;

      final pathBody = Path()
        ..moveTo(-35, -10)
        ..lineTo(10, -10)
        ..lineTo(10, 10)
        ..lineTo(-35, 10)
        ..close();
      canvas.drawPath(pathBody, pPencilBody);
      canvas.drawPath(pathBody, pStroke);

      final pathCone = Path()
        ..moveTo(10, -10)
        ..lineTo(28, 0)
        ..lineTo(10, 10)
        ..close();
      canvas.drawPath(pathCone, pWood);
      canvas.drawPath(pathCone, pStroke);

      final pathTip = Path()
        ..moveTo(22, -3)
        ..lineTo(28, 0)
        ..lineTo(22, 3)
        ..close();
      canvas.drawPath(pathTip, pLead);
    }

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// =========================================================================
// GEOMETRIC SHAPE MATCHING PHYSICS GAME DEFINITIONS
// =========================================================================
enum ShapeType { circle, square, triangle }

class ShapeBlock {
  final ShapeType type;
  Offset currentPos;
  final Offset originalPos;
  Offset vel = Offset.zero;
  bool isDragging = false;
  bool isMatched = false;
  final Color color;

  ShapeBlock({
    required this.type,
    required this.currentPos,
    required this.originalPos,
    required this.color,
  });

  void updatePhysics(double dt) {
    if (!isDragging && !isMatched) {
      vel = Offset(vel.dx, vel.dy + 450.0 * dt);
      currentPos += vel * dt;

      if (currentPos.dy >= 310) {
        currentPos = Offset(currentPos.dx, 310);
        vel = Offset(vel.dx * 0.5, -vel.dy * 0.45);
      }
    }
  }
}

class ShapeSocket {
  final ShapeType type;
  final Offset pos;
  final double size = 76.0;
  bool filled = false;
  ShapeSocket({required this.type, required this.pos});
}

class ShapeGamePainter extends CustomPainter {
  final ShapeType type;
  final Color color;
  final bool outlineOnly;

  ShapeGamePainter({required this.type, required this.color, required this.outlineOnly});

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = size.width * 0.4;

    final paint = Paint()
      ..color = color
      ..style = outlineOnly ? PaintingStyle.stroke : PaintingStyle.fill
      ..strokeWidth = outlineOnly ? 3.0 : 1.0;

    final border = Paint()
      ..color = AppTheme.darkPurpleBorder
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    if (type == ShapeType.circle) {
      canvas.drawCircle(Offset(cx, cy), r, paint);
      if (!outlineOnly) canvas.drawCircle(Offset(cx, cy), r, border);
    } else if (type == ShapeType.square) {
      final rect = Rect.fromCenter(center: Offset(cx, cy), width: r * 2, height: r * 2);
      canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(12)), paint);
      if (!outlineOnly) canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(12)), border);
    } else {
      final path = Path()
        ..moveTo(cx, cy - r)
        ..lineTo(cx - r, cy + r)
        ..lineTo(cx + r, cy + r)
        ..close();
      canvas.drawPath(path, paint);
      if (!outlineOnly) canvas.drawPath(path, border);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// =========================================================================
// VOICE AI SCHOLAR ADVENTURE PORTAL MODELS
// =========================================================================
class ScholarVoiceConfig {
  final String id;
  final String name;
  final String titleUz;
  final String initials;
  final String avatarAsset;
  final Color solidColor;
  final String audioScript;

  ScholarVoiceConfig({
    required this.id,
    required this.name,
    required this.titleUz,
    required this.initials,
    required this.avatarAsset,
    required this.solidColor,
    required this.audioScript,
  });
}

// =========================================================================
// 3D LEGO SEISMIC TYCOON PAINTER (TACTILE constructor RENDERING)
// =========================================================================
class SeismicTycoonPainter extends CustomPainter {
  final List<Map<String, dynamic>> placedBlocks;
  final double shakeOffset;

  SeismicTycoonPainter({
    required this.placedBlocks,
    required this.shakeOffset,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final double cx = size.width / 2 + shakeOffset;
    final double cy = size.height - 110.0;
    
    // Platform Baseline Ground Platform
    final pGroundTop = Paint()..color = const Color(0xFF8D6E63)..style = PaintingStyle.fill;
    final pGroundSide = Paint()..color = const Color(0xFF5D4037)..style = PaintingStyle.fill;
    final pBorder = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.stroke..strokeWidth = 2.5;

    final pathTop = Path()
      ..moveTo(cx - 90, cy)
      ..lineTo(cx, cy - 25)
      ..lineTo(cx + 90, cy)
      ..lineTo(cx, cy + 25)
      ..close();
    canvas.drawPath(pathTop, pGroundTop);
    canvas.drawPath(pathTop, pBorder);

    final pathSide = Path()
      ..moveTo(cx - 90, cy)
      ..lineTo(cx - 90, cy + 18)
      ..lineTo(cx, cy + 43)
      ..lineTo(cx + 90, cy + 18)
      ..lineTo(cx + 90, cy)
      ..lineTo(cx, cy + 25)
      ..close();
    canvas.drawPath(pathSide, pGroundSide);
    canvas.drawPath(pathSide, pBorder);

    const double blockHeight = 44.0;

    for (int i = 0; i < placedBlocks.length; i++) {
      final block = placedBlocks[i];
      final Offset offset = block["fallOffset"] as Offset? ?? Offset.zero;
      final double bx = cx + offset.dx;
      final double by = cy - (i * blockHeight) - 15.0 + offset.dy;

      canvas.save();
      final double rot = block["rotation"] as double? ?? 0.0;
      if (rot != 0.0) {
        canvas.translate(bx, by);
        canvas.rotate(rot);
        canvas.translate(-bx, -by);
      }

      final Color baseColor = block["color"] as Color;
      final pFront = Paint()..color = baseColor..style = PaintingStyle.fill;
      final pSide = Paint()..color = baseColor.withAlpha(200)..style = PaintingStyle.fill;
      final pTop = Paint()..color = baseColor.withAlpha(235)..style = PaintingStyle.fill;

      // 3D Isometric building box blocks
      final pathBoxTop = Path()
        ..moveTo(bx - 45, by - 16)
        ..lineTo(bx, by - 30)
        ..lineTo(bx + 45, by - 16)
        ..lineTo(bx, by - 2)
        ..close();
      canvas.drawPath(pathBoxTop, pTop);
      canvas.drawPath(pathBoxTop, pBorder);

      final pathBoxLeft = Path()
        ..moveTo(bx - 45, by - 16)
        ..lineTo(bx - 45, by + 16)
        ..lineTo(bx, by + 30)
        ..lineTo(bx, by - 2)
        ..close();
      canvas.drawPath(pathBoxLeft, pFront);
      canvas.drawPath(pathBoxLeft, pBorder);

      final pathBoxRight = Path()
        ..moveTo(bx, by - 2)
        ..lineTo(bx, by + 30)
        ..lineTo(bx + 45, by + 16)
        ..lineTo(bx + 45, by - 16)
        ..close();
      canvas.drawPath(pathBoxRight, pSide);
      canvas.drawPath(pathBoxRight, pBorder);

      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// =========================================================================
// MAIN ADAPTIVE POWERHOUSE VIEW
// =========================================================================
class AdaptiveLogicGames extends StatefulWidget {
  final int initialGameIndex;
  const AdaptiveLogicGames({super.key, this.initialGameIndex = 0});

  @override
  State<AdaptiveLogicGames> createState() => _AdaptiveLogicGamesState();
}

class _AdaptiveLogicGamesState extends State<AdaptiveLogicGames> with TickerProviderStateMixin {
  late int _activeGameIndex;

  // Toddler Pachinko Game State
  final List<FruitBubble> _bubbles = [];
  final List<BubbleParticle> _particles = [];
  final List<Peg> _pegs = [];
  final List<double> _basketRecoils = [0.0, 0.0, 0.0];
  int _toddlerCount = 0;
  late final Ticker _physicsTicker;
  double _spawnTimer = 0.0;

  // Intermediate Phonics Game State
  final List<SyllableWordConfig> _wordLevels = [
    SyllableWordConfig(correctWord: "OLMA", syllablesScrambled: ["MA", "OL"], correctSequence: ["OL", "MA"]),
    SyllableWordConfig(correctWord: "KITOB", syllablesScrambled: ["TOB", "KI"], correctSequence: ["KI", "TOB"]),
    SyllableWordConfig(correctWord: "QALAM", syllablesScrambled: ["LAM", "QA"], correctSequence: ["QA", "LAM"]),
  ];
  int _currentWordIndex = 0;
  List<SyllableBlock> _syllableBlocks = [];
  List<SyllableSlot> _slots = [];

  // Intermediate Sub-Game Mode: 0 = Phonics, 1 = Physics Shape Matcher
  int _intermediateSubMode = 0;
  final List<ShapeBlock> _shapeBlocks = [];
  final List<ShapeSocket> _shapeSockets = [];

  // 3D Manual Constructor & Seismic Lab State
  final List<Map<String, dynamic>> _placedBlocks = [];
  String _selectedBuildingMaterial = "Tosh"; // Tosh, Yog'och, G'isht
  bool _seismicTesting = false;
  bool _isStructureStable = true;
  bool _showSeismicSuccessOverlay = false;
  bool _showSeismicFailureOverlay = false;
  late final AnimationController _seismicController;

  // Kinetic Snap-back animation properties
  late final AnimationController _snapController;
  int _animatingIndex = -1;
  Offset _animatingStartOffset = Offset.zero;

  // Sound/Success pulse bounce
  late final AnimationController _pulseController;
  
  // Trajectory Guide
  late final AnimationController _handDemoController;

  // Audio simulation guide
  bool _kodiVoiceActive = false;

  // Voice AI Scholars Adventure Portal State
  final List<ScholarVoiceConfig> _scholars = [
    ScholarVoiceConfig(
      id: "xorazmiy",
      name: "Al-Xorazmiy",
      titleUz: "Raqamlar Sehrgari",
      initials: "AX",
      avatarAsset: "xorazmiy.png",
      solidColor: const Color(0xFF1E88E5),
      audioScript: "Salom bolajon! Men matematika va algoritm asoschisiman. Birinchi raqamli kvestni yechib, yulduzlarga ega bo'l! 📐",
    ),
    ScholarVoiceConfig(
      id: "ibnsino",
      name: "Ibn Sino",
      titleUz: "Koinot Tabibi",
      initials: "IS",
      avatarAsset: "ibnsino.png",
      solidColor: const Color(0xFFE53935),
      audioScript: "Bolajon, tabiat va salomatlik sirlarini o'rganishga tayyormisan? Jismoniy mashqlar va shifobaxsh o'tlar olamiga marhamat! 🌿",
    ),
    ScholarVoiceConfig(
      id: "temur",
      name: "Amir Temur",
      titleUz: "Sohibqiron Me'mor",
      initials: "AT",
      avatarAsset: "ulugbek.png",
      solidColor: const Color(0xFF43A047),
      audioScript: "Me'morchilik mustahkam poydevordan boshlanadi. Kel, seysmik barqaror minorani birgalikda barpo etaylik! 🏗️",
    ),
    ScholarVoiceConfig(
      id: "ulugbek",
      name: "Mirzo Ulug'bek",
      titleUz: "Yulduzlar Sultoni",
      initials: "MU",
      avatarAsset: "ulugbek.png",
      solidColor: const Color(0xFFFDD835),
      audioScript: "Koinot bag'ridagi yulduzlar va sayyoralar xaritasini chizish senga yoqadimi? Samoviy teleskopimizni ishga sol! 🔭",
    ),
  ];
  late int _selectedScholarIndex = 0;
  bool _isMicRecording = false;
  bool _isSpeechLoading = false;
  String _activeVoiceReplyText = "";
  late final AnimationController _waveAnimController;

  @override
  void initState() {
    super.initState();
    _activeGameIndex = widget.initialGameIndex;

    _physicsTicker = Ticker((Duration elapsed) {
      final double dt = 0.0166;
      _updatePhysics(dt);
    });

    _pulseController = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _handDemoController = AnimationController(vsync: this, duration: const Duration(seconds: 3))..repeat();
    _waveAnimController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1000))..repeat();

    _seismicController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..addListener(() {
        final double t = _seismicController.value;
        setState(() {
          if (!_isStructureStable && t >= 0.4) {
            final double collapseProgress = (t - 0.4) / 0.6;
            for (int i = 0; i < _placedBlocks.length; i++) {
              final double startFactor = 0.12 * (4 - i);
              if (collapseProgress >= startFactor) {
                final double itemT = ((collapseProgress - startFactor) / 0.5).clamp(0.0, 1.0);
                final double fallDir = i % 2 == 0 ? -1.0 : 1.0;
                _placedBlocks[i]["fallOffset"] = Offset(
                  fallDir * 320.0 * itemT,
                  600.0 * itemT * itemT,
                );
                _placedBlocks[i]["rotation"] = fallDir * itemT * math.pi * 0.9;
              }
            }
          }
        });
      })..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          setState(() {
            _seismicTesting = false;
            if (_isStructureStable) {
              _showSeismicSuccessOverlay = true;
            } else {
              _showSeismicFailureOverlay = true;
            }
          });
        }
      });

    if (_activeGameIndex == 0) {
      _setupPachinkoPegs();
      _physicsTicker.start();
    } else if (_activeGameIndex == 1) {
      _setupSyllableGame();
      _setupShapeGame();
      _physicsTicker.start();
    }

    _snapController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..addListener(() {
        if (_animatingIndex != -1) {
          setState(() {
            final double t = _snapController.value;
            final double damping = math.exp(-5.0 * t);
            final double oscillation = math.cos(18.0 * t);
            final double scale = damping * oscillation;
            final Offset original = _syllableBlocks[_animatingIndex].originalPos;
            final Offset diff = _animatingStartOffset - original;
            _syllableBlocks[_animatingIndex].currentPos = original + diff * scale;
          });
        }
      });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final tier = Provider.of<AgeTierController>(context, listen: false).activeTier;
      if (tier == AgeTier.intermediate) {
        _playVoiceGuide('welcome.mp3');
      }
    });

    _activeVoiceReplyText = _scholars[0].audioScript;
  }

  void _playVoiceGuide(String filename) {
    debugPrint("🎵 Simulated Audio Stream triggered: playing audio guide '$filename'");
    final ageController = Provider.of<AgeTierController>(context, listen: false);
    ageController.toggleVoiceAI(true);
    setState(() {
      _kodiVoiceActive = true;
    });
    Timer(const Duration(seconds: 4), () {
      if (mounted) {
        setState(() {
          _kodiVoiceActive = false;
        });
        ageController.toggleVoiceAI(false);
      }
    });
  }

  void _setupPachinkoPegs() {
    final double pegRadius = 6.0;
    _pegs.add(Peg(pos: const Offset(70, 160), radius: pegRadius));
    _pegs.add(Peg(pos: const Offset(170, 160), radius: pegRadius));
    _pegs.add(Peg(pos: const Offset(270, 160), radius: pegRadius));
    _pegs.add(Peg(pos: const Offset(120, 240), radius: pegRadius));
    _pegs.add(Peg(pos: const Offset(220, 240), radius: pegRadius));
    _pegs.add(Peg(pos: const Offset(70, 320), radius: pegRadius));
    _pegs.add(Peg(pos: const Offset(170, 320), radius: pegRadius));
    _pegs.add(Peg(pos: const Offset(270, 320), radius: pegRadius));
    _pegs.add(Peg(pos: const Offset(120, 400), radius: pegRadius));
    _pegs.add(Peg(pos: const Offset(220, 400), radius: pegRadius));
  }

  void _setupShapeGame() {
    _shapeSockets.clear();
    _shapeBlocks.clear();

    _shapeSockets.add(ShapeSocket(type: ShapeType.circle, pos: const Offset(30, 80)));
    _shapeSockets.add(ShapeSocket(type: ShapeType.square, pos: const Offset(136, 80)));
    _shapeSockets.add(ShapeSocket(type: ShapeType.triangle, pos: const Offset(242, 80)));

    final colors = [AppTheme.appleRed, AppTheme.mintGreen, AppTheme.marineBlue];
    _shapeBlocks.add(ShapeBlock(type: ShapeType.circle, currentPos: const Offset(30, 310), originalPos: const Offset(30, 310), color: colors[0]));
    _shapeBlocks.add(ShapeBlock(type: ShapeType.square, currentPos: const Offset(136, 310), originalPos: const Offset(136, 310), color: colors[1]));
    _shapeBlocks.add(ShapeBlock(type: ShapeType.triangle, currentPos: const Offset(242, 310), originalPos: const Offset(242, 310), color: colors[2]));
  }

  @override
  void dispose() {
    _physicsTicker.dispose();
    _snapController.dispose();
    _pulseController.dispose();
    _handDemoController.dispose();
    _waveAnimController.dispose();
    _seismicController.dispose();
    super.dispose();
  }

  void _updatePhysics(double dt) {
    if (!mounted) return;

    if (_activeGameIndex == 0) {
      setState(() {
        _spawnTimer += dt;
        final size = MediaQuery.of(context).size;

        if (_spawnTimer > 1.2 && _toddlerCount < 10) {
          _spawnTimer = 0.0;
          final random = math.Random();
          final emojis = ["🍎", "🍋", "🍇", "🍓", "🍉", "🍒"];
          final colors = [AppTheme.appleRed, AppTheme.yellow, AppTheme.marineBlue, AppTheme.mandarin, AppTheme.mintGreen, AppTheme.pastelGold];
          
          final idx = random.nextInt(emojis.length);
          _bubbles.add(FruitBubble(
            pos: Offset(40 + random.nextDouble() * (size.width - 80), 20),
            vel: Offset((random.nextDouble() - 0.5) * 40.0, 50.0),
            radius: 26.0,
            emoji: emojis[idx],
            color: colors[idx],
          ));
        }

        for (final b in _bubbles) {
          b.update(dt, _pegs);
        }

        final double basketY = size.height - 75.0;
        final double basketWidth = size.width / 3;

        for (final b in _bubbles) {
          if (!b.isPopped && b.pos.dy >= basketY - 10) {
            b.isPopped = true;
            int basketIdx = (b.pos.dx / basketWidth).floor().clamp(0, 2);
            _basketRecoils[basketIdx] = 16.0;
            _toddlerCount++;

            final random = math.Random();
            for (int i = 0; i < 15; i++) {
              final double angle = random.nextDouble() * math.pi * 2;
              final double speed = 80.0 + random.nextDouble() * 120.0;
              _particles.add(BubbleParticle(
                pos: b.pos,
                vel: Offset(math.cos(angle) * speed, math.sin(angle) * speed),
                color: b.color,
                size: 4.0 + random.nextDouble() * 6.0,
              ));
            }

            if (_toddlerCount >= 10) {
              _winGame(10);
            }
          }
        }

        for (int i = 0; i < 3; i++) {
          if (_basketRecoils[i] > 0.0) {
            _basketRecoils[i] = math.max(0.0, _basketRecoils[i] - dt * 90.0);
          }
        }

        _bubbles.removeWhere((b) => b.pos.dy > size.height || (b.isPopped && b.popAnimTime >= math.pi));

        for (final p in _particles) {
          p.update(dt);
        }
        _particles.removeWhere((p) => p.opacity <= 0.0 || p.size <= 0.0);
      });
    } else if (_activeGameIndex == 1) {
      setState(() {
        for (final block in _shapeBlocks) {
          block.updatePhysics(dt);
        }
        for (final p in _particles) {
          p.update(dt);
        }
        _particles.removeWhere((p) => p.opacity <= 0.0 || p.size <= 0.0);
      });
    }
  }

  void _onToddlerScreenTap(TapDownDetails details) {
    final tapPos = details.localPosition;
    for (final b in _bubbles) {
      if (!b.isPopped) {
        final double dist = (b.pos - tapPos).distance;
        if (dist <= b.radius + 15) {
          setState(() {
            b.isPopped = true;
            _toddlerCount++;

            final random = math.Random();
            for (int i = 0; i < 20; i++) {
              final double angle = random.nextDouble() * math.pi * 2;
              final double speed = 120.0 + random.nextDouble() * 160.0;
              _particles.add(BubbleParticle(
                pos: b.pos,
                vel: Offset(math.cos(angle) * speed, math.sin(angle) * speed),
                color: b.color,
                size: 5.0 + random.nextDouble() * 8.0,
              ));
            }

            if (_toddlerCount >= 10) {
              _winGame(10);
            }
          });
          break;
        }
      }
    }
  }

  // --- INTERMEDIATE: UZBEK SYLLABLE BUILDER LOGIC ---
  void _setupSyllableGame() {
    final config = _wordLevels[_currentWordIndex];
    _slots = [];
    _syllableBlocks = [];

    final double slotWidth = 90.0;
    final double slotHeight = 72.0;
    final double spacing = 16.0;
    
    final int totalSlots = config.correctSequence.length;
    final double totalWidth = totalSlots * slotWidth + (totalSlots - 1) * spacing;
    final double startX = (342 - totalWidth) / 2 > 0 ? (342 - totalWidth) / 2 : 20.0;

    for (int i = 0; i < totalSlots; i++) {
      _slots.add(SyllableSlot(
        expectedText: config.correctSequence[i],
        pos: Offset(startX + i * (slotWidth + spacing), 180),
        size: Size(slotWidth, slotHeight),
      ));
    }

    final double blockWidth = 84.0;
    final double blockStartX = (342 - (config.syllablesScrambled.length * blockWidth + (config.syllablesScrambled.length - 1) * spacing)) / 2;
    final colors = [AppTheme.yellow, AppTheme.mintGreen, AppTheme.marineBlue];

    for (int i = 0; i < config.syllablesScrambled.length; i++) {
      final Offset spawnPos = Offset(blockStartX + i * (blockWidth + spacing) + 10, 310);
      _syllableBlocks.add(SyllableBlock(
        text: config.syllablesScrambled[i],
        currentPos: spawnPos,
        originalPos: spawnPos,
        color: colors[i % colors.length],
      ));
    }
  }

  void _onSyllableDragStart(int index, Offset localPos) {
    if (_syllableBlocks[index].isMatched || _snapController.isAnimating) return;
    setState(() {
      _syllableBlocks[index].isDragging = true;
    });
  }

  void _onSyllableDragUpdate(int index, Offset globalPos) {
    if (!_syllableBlocks[index].isDragging) return;
    setState(() {
      _syllableBlocks[index].currentPos = globalPos - const Offset(42, 60);
    });
  }

  void _onSyllableDragEnd(int index) {
    if (!_syllableBlocks[index].isDragging) return;
    setState(() {
      _syllableBlocks[index].isDragging = false;
      bool matched = false;
      final blockCenter = _syllableBlocks[index].currentPos + const Offset(42, 34);

      for (final slot in _slots) {
        if (slot.filled) continue;
        final slotRect = Rect.fromLTWH(slot.pos.dx, slot.pos.dy, slot.size.width, slot.size.height);
        if (slotRect.contains(blockCenter) && slot.expectedText == _syllableBlocks[index].text) {
          _syllableBlocks[index].isMatched = true;
          _syllableBlocks[index].currentPos = slot.pos + const Offset(3, 2);
          slot.filled = true;
          matched = true;
          
          final random = math.Random();
          for (int i = 0; i < 15; i++) {
            final double angle = random.nextDouble() * math.pi * 2;
            final double speed = 60.0 + random.nextDouble() * 100.0;
            _particles.add(BubbleParticle(
              pos: slot.pos + const Offset(45, 36),
              vel: Offset(math.cos(angle) * speed, math.sin(angle) * speed),
              color: _syllableBlocks[index].color,
              size: 4 + random.nextDouble() * 6,
            ));
          }
          break;
        }
      }

      if (!matched) {
        _animatingIndex = index;
        _animatingStartOffset = _syllableBlocks[index].currentPos;
        _snapController.forward(from: 0.0);
      }

      final bool allMatched = _syllableBlocks.every((s) => s.isMatched);
      if (allMatched) {
        _pulseController.forward(from: 0.0);
        Future.delayed(const Duration(milliseconds: 1500), () {
          if (!mounted) return;
          setState(() {
            if (_currentWordIndex < _wordLevels.length - 1) {
              _currentWordIndex++;
              _setupSyllableGame();
            } else {
              _winGame(15);
            }
          });
        });
      }
    });
  }

  // --- INTERMEDIATE: SHAPE MATCHING LOGIC ---
  void _onShapeDragStart(int index, Offset localPos) {
    if (_shapeBlocks[index].isMatched) return;
    setState(() {
      _shapeBlocks[index].isDragging = true;
    });
  }

  void _onShapeDragUpdate(int index, Offset globalPos) {
    if (!_shapeBlocks[index].isDragging) return;
    setState(() {
      _shapeBlocks[index].currentPos = globalPos - const Offset(38, 38);
    });
  }

  void _onShapeDragEnd(int index) {
    if (!_shapeBlocks[index].isDragging) return;
    setState(() {
      _shapeBlocks[index].isDragging = false;
      bool matched = false;
      final blockCenter = _shapeBlocks[index].currentPos + const Offset(38, 38);

      for (final socket in _shapeSockets) {
        if (socket.filled) continue;
        final socketRect = Rect.fromLTWH(socket.pos.dx, socket.pos.dy, socket.size, socket.size);
        if (socketRect.contains(blockCenter) && socket.type == _shapeBlocks[index].type) {
          _shapeBlocks[index].isMatched = true;
          _shapeBlocks[index].currentPos = socket.pos;
          socket.filled = true;
          matched = true;
          
          final random = math.Random();
          for (int i = 0; i < 15; i++) {
            final double angle = random.nextDouble() * math.pi * 2;
            _particles.add(BubbleParticle(
              pos: socket.pos + const Offset(38, 38),
              vel: Offset(math.cos(angle) * 120, math.sin(angle) * 120),
              color: _shapeBlocks[index].color,
              size: 4 + random.nextDouble() * 6,
            ));
          }
          break;
        }
      }

      if (!matched) {
        _shapeBlocks[index].vel = const Offset(0, -60);
      }

      final bool allMatched = _shapeBlocks.every((s) => s.isMatched);
      if (allMatched) {
        Future.delayed(const Duration(milliseconds: 1000), () {
          if (!mounted) return;
          _winGame(12);
        });
      }
    });
  }

  // --- VOICE AI ADVENTURE PORTAL INTERFACE LOOP ---
  void _triggerMicRecordingStart() {
    setState(() {
      _isMicRecording = true;
      _activeVoiceReplyText = "";
    });
    _playVoiceGuide('recording.mp3');
  }

  void _triggerMicRecordingRelease() {
    if (!_isMicRecording) return;
    setState(() {
      _isMicRecording = false;
      _isSpeechLoading = true;
    });

    final config = _scholars[_selectedScholarIndex];
    final prompt = "Sen buyuk o'zbek allomasi ${config.name}san. Menga o'zbek tilida qiziqarli qisqa javob ber. Menga motivatsiya ber va +100 yulduzcha sovg'a qilganingni ayt (va javob oxirida '⭐' belgisini qo'y). Maksimum 2-3 ta qiziqarli gap bo'lsin.";

    GeminiService.generateTextResponse(prompt).then((response) {
      if (!mounted) return;
      setState(() {
        _isSpeechLoading = false;
        _activeVoiceReplyText = response;
      });

      final appState = Provider.of<AppState>(context, listen: false);
      appState.awardStars(100);
      Provider.of<AgeTierController>(context, listen: false).syncStarsToCloud(100);
      _playVoiceGuide('response.mp3');
    }).catchError((err) {
      if (!mounted) return;
      setState(() {
        _isSpeechLoading = false;
        _activeVoiceReplyText = "Kechirasiz bolajon, hozir ulanishda xatolik bo'ldi. Lekin baribir +100 yulduzchaga ega bo'ldingiz! ⭐";
      });
      final appState = Provider.of<AppState>(context, listen: false);
      appState.awardStars(100);
      Provider.of<AgeTierController>(context, listen: false).syncStarsToCloud(100);
      _playVoiceGuide('response.mp3');
    });
  }

  void _selectScholar(int index) {
    setState(() {
      _selectedScholarIndex = index;
      _activeVoiceReplyText = _scholars[index].audioScript;
    });
    _playVoiceGuide('scholar_select.mp3');
  }

  // --- 3D LEGO SEISMIC CONSTRUCTOR & SINASH ENGINE (NO AUTO-FALL / NO CRANE) ---
  void _placeLegoConstructorBlock() {
    if (_placedBlocks.length >= 5 || _seismicTesting) return;

    Color blockColor = AppTheme.pastelGold;
    double mass = 50.0;
    double elasticity = 1.0;

    if (_selectedBuildingMaterial == "Yog'och") {
      blockColor = AppTheme.cyan;
      mass = 20.0;
      elasticity = 1.5;
    } else if (_selectedBuildingMaterial == "G'isht") {
      blockColor = AppTheme.mandarin;
      mass = 45.0;
      elasticity = 0.8;
    } else {
      blockColor = AppTheme.yellow;
      mass = 80.0;
      elasticity = 0.4;
    }

    setState(() {
      _placedBlocks.add({
        "material": _selectedBuildingMaterial,
        "color": blockColor,
        "mass": mass,
        "elasticity": elasticity,
        "fallOffset": Offset.zero,
        "rotation": 0.0,
      });
    });
  }

  void _triggerLegoSeismicTest() {
    if (_placedBlocks.length < 5 || _seismicTesting) return;

    // Check stability: if any block is heavier than the block directly beneath it
    bool stable = true;
    for (int i = 1; i < _placedBlocks.length; i++) {
      final double currentMass = _placedBlocks[i]["mass"] as double;
      final double belowMass = _placedBlocks[i - 1]["mass"] as double;
      if (currentMass > belowMass) {
        stable = false;
        break;
      }
    }

    setState(() {
      _isStructureStable = stable;
      _seismicTesting = true;
      _showSeismicSuccessOverlay = false;
      _showSeismicFailureOverlay = false;
    });

    _seismicController.forward(from: 0.0);
  }

  void _resetLegoConstructor() {
    setState(() {
      _placedBlocks.clear();
      _seismicTesting = false;
      _showSeismicSuccessOverlay = false;
      _showSeismicFailureOverlay = false;
    });
    _seismicController.reset();
  }

  // =========================================================================
  // POPUP CELEBRATION WIN GAME STATE
  // =========================================================================
  void _winGame(int rewardStars) {
    final state = Provider.of<AppState>(context, listen: false);
    state.awardStars(rewardStars);
    Provider.of<AgeTierController>(context, listen: false).syncStarsToCloud(rewardStars);

    final tier = Provider.of<AgeTierController>(context, listen: false).activeTier;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        title: tier == AgeTier.intermediate
            ? Center(child: Icon(Icons.workspace_premium_rounded, color: AppTheme.yellow, size: 85))
            : Row(
                children: [
                  const Icon(Icons.workspace_premium_rounded, color: AppTheme.yellow, size: 36),
                  const SizedBox(width: 8),
                  Text("Ajoyib!", style: AppTheme.headerMedium),
                ],
              ),
        content: tier == AgeTier.intermediate
            ? Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.star_rounded, color: AppTheme.yellow, size: 90),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(3, (i) => const Icon(Icons.star_rounded, color: AppTheme.yellow, size: 32)),
                  )
                ],
              )
            : Text(
                "Yulduzchalar hisobingizga +$rewardStars ta qo'shildi! Siz barcha bosqichlarni muvaffaqiyatli yakunladingiz! ⭐",
                style: AppTheme.bodyLarge,
              ),
        actions: [
          Center(
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.mintGreen,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              ),
              onPressed: () {
                Navigator.of(ctx).pop();
                Navigator.of(context).pop();
              },
              child: tier == AgeTier.intermediate
                  ? const Icon(Icons.check_circle_rounded, color: AppTheme.white, size: 42)
                  : Text(
                      "Sayohatni Davom Ettirish",
                      style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 13),
                    ),
            ),
          )
        ],
      ),
    );
  }

  // =========================================================================
  // VIEW RENDER MATRIX
  // =========================================================================
  @override
  Widget build(BuildContext context) {
    final ageController = Provider.of<AgeTierController>(context);
    final tier = ageController.activeTier;

    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        title: tier == AgeTier.intermediate
            ? Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _activeGameIndex == 0 
                        ? Icons.gamepad_rounded 
                        : (_activeGameIndex == 1 ? Icons.abc_rounded : (_activeGameIndex == 2 ? Icons.construction_rounded : Icons.record_voice_over_rounded)), 
                    color: AppTheme.darkPurple, 
                    size: 36
                  ),
                ],
              )
            : Text(
                _activeGameIndex == 0 
                    ? "Meva pachinko shousi!" 
                    : (_activeGameIndex == 1 ? "Bo'g'inli So'zlar" : (_activeGameIndex == 2 ? "3D Arxitektor" : "Ovozli Allomalar Portali")),
                style: AppTheme.headerMedium,
              ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.darkPurple),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: _buildActiveGameBody(tier),
      ),
    );
  }

  Widget _buildActiveGameBody(AgeTier tier) {
    if (_activeGameIndex == 0) {
      return _buildToddlerMathGame();
    } else if (_activeGameIndex == 1) {
      return _buildIntermediatePhonicsGame(tier);
    } else if (_activeGameIndex == 2) {
      return _build3DSeismicTycoonGame();
    } else {
      return _buildVoiceAIScholarPortal(tier);
    }
  }

  Widget _buildToddlerMathGame() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: AppTheme.vibrant3DBoxDecoration(
              color: AppTheme.pastelGold,
              radius: 20,
              borderWidth: 2,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("Yig'ilgan mevalar:", style: AppTheme.headerSmall.copyWith(fontSize: 14)),
                Row(
                  children: List.generate(10, (idx) {
                    final bool filled = idx < _toddlerCount;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: filled ? AppTheme.yellow : AppTheme.white,
                        border: Border.all(
                          color: filled ? AppTheme.darkYellow : AppTheme.darkPurpleBorder,
                          width: 1.5,
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
        ),

        Expanded(
          child: Container(
            margin: const EdgeInsets.all(16),
            decoration: AppTheme.vibrant3DBoxDecoration(
              color: AppTheme.pastelMint,
              radius: 28,
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: GestureDetector(
                onTapDown: _onToddlerScreenTap,
                child: CustomPaint(
                  painter: ToddlerPachinkoPainter(
                    bubbles: _bubbles,
                    particles: _particles,
                    pegs: _pegs,
                    basketRecoils: _basketRecoils,
                  ),
                  child: Container(),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildIntermediatePhonicsGame(AgeTier tier) {
    if (tier == AgeTier.intermediate) {
      return Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                GestureDetector(
                  onTap: () => setState(() => _intermediateSubMode = 0),
                  child: AnimatedScale(
                    scale: _intermediateSubMode == 0 ? 1.15 : 0.95,
                    duration: const Duration(milliseconds: 200),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: AppTheme.vibrant3DBoxDecoration(
                        color: _intermediateSubMode == 0 ? AppTheme.marineBlue : AppTheme.white,
                        radius: 18,
                        borderColor: _intermediateSubMode == 0 ? AppTheme.marineBlue : Colors.grey.shade300,
                      ),
                      child: Icon(Icons.abc_rounded, color: _intermediateSubMode == 0 ? AppTheme.white : AppTheme.marineBlue, size: 36),
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () => setState(() => _intermediateSubMode = 1),
                  child: AnimatedScale(
                    scale: _intermediateSubMode == 1 ? 1.15 : 0.95,
                    duration: const Duration(milliseconds: 200),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: AppTheme.vibrant3DBoxDecoration(
                        color: _intermediateSubMode == 1 ? AppTheme.mintGreen : AppTheme.white,
                        radius: 18,
                        borderColor: _intermediateSubMode == 1 ? AppTheme.mintGreen : Colors.grey.shade300,
                      ),
                      child: Icon(Icons.category_rounded, color: _intermediateSubMode == 1 ? AppTheme.white : AppTheme.mintGreen, size: 36),
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () => setState(() => _activeGameIndex = 3),
                  child: AnimatedScale(
                    scale: 0.95,
                    duration: const Duration(milliseconds: 200),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: AppTheme.vibrant3DBoxDecoration(
                        color: AppTheme.white,
                        radius: 18,
                        borderColor: Colors.grey.shade300,
                      ),
                      child: const Icon(Icons.record_voice_over_rounded, color: AppTheme.mandarin, size: 36),
                    ),
                  ),
                ),
              ],
            ),
          ),

          if (_intermediateSubMode == 0) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: List.generate(3, (index) {
                      final bool filled = index < _currentWordIndex;
                      return Icon(
                        Icons.star_rounded,
                        color: filled ? AppTheme.yellow : Colors.grey.shade300,
                        size: 32,
                      );
                    }),
                  ),
                  GestureDetector(
                    onTap: () => _playVoiceGuide('guide_word.mp3'),
                    child: AnimatedScale(
                      scale: _kodiVoiceActive ? 1.25 : 1.0,
                      duration: const Duration(milliseconds: 300),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(shape: BoxShape.circle, color: AppTheme.mandarin.withAlpha(40)),
                        child: Icon(
                          _kodiVoiceActive ? Icons.volume_up_rounded : Icons.volume_mute_rounded,
                          color: AppTheme.mandarin,
                          size: 28,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Container(
              margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              height: 130,
              width: double.infinity,
              decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white, radius: 24, borderWidth: 2),
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  return CustomPaint(
                    painter: SyllableObjectPainter(
                      wordIndex: _currentWordIndex,
                      pulseAnimation: _pulseController.value,
                    ),
                  );
                },
              ),
            ),

            Expanded(
              child: Container(
                margin: const EdgeInsets.all(16),
                decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.pastelBlue, radius: 28),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: GestureDetector(
                    onPanStart: (details) {
                      final localPos = details.localPosition;
                      for (int i = 0; i < _syllableBlocks.length; i++) {
                        final blockRect = Rect.fromLTWH(_syllableBlocks[i].currentPos.dx, _syllableBlocks[i].currentPos.dy, 84, 68);
                        if (blockRect.contains(localPos)) {
                          _onSyllableDragStart(i, localPos);
                          break;
                        }
                      }
                    },
                    onPanUpdate: (details) {
                      for (int i = 0; i < _syllableBlocks.length; i++) {
                        if (_syllableBlocks[i].isDragging) {
                          _onSyllableDragUpdate(i, details.localPosition);
                          break;
                        }
                      }
                    },
                    onPanEnd: (details) {
                      for (int i = 0; i < _syllableBlocks.length; i++) {
                        if (_syllableBlocks[i].isDragging) {
                          _onSyllableDragEnd(i);
                          break;
                        }
                      }
                    },
                    child: Stack(
                      children: [
                        ..._slots.map((slot) {
                          return Positioned(
                            left: slot.pos.dx,
                            top: slot.pos.dy,
                            child: Container(
                              width: slot.size.width,
                              height: slot.size.height,
                              decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white.withAlpha(160), radius: 20, borderWidth: 2),
                              alignment: Alignment.center,
                              child: const Icon(Icons.help_outline_rounded, color: Colors.grey, size: 28),
                            ),
                          );
                        }),

                        ..._syllableBlocks.map((s) {
                          return Positioned(
                            left: s.currentPos.dx,
                            top: s.currentPos.dy,
                            child: Container(
                              width: 84,
                              height: 68,
                              decoration: AppTheme.vibrant3DBoxDecoration(
                                color: s.color,
                                radius: 22,
                                borderWidth: s.isDragging ? 4.0 : 3.0,
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                s.text,
                                style: AppTheme.headerMedium.copyWith(color: AppTheme.white, fontSize: 22),
                              ),
                            ),
                          );
                        }),

                        _buildBouncingTrajectoryGuide(),

                        Positioned.fill(
                          child: IgnorePointer(
                            child: CustomPaint(
                              painter: ToddlerPachinkoPainter(bubbles: [], particles: _particles, pegs: [], basketRecoils: []),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            )
          ] else ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: List.generate(3, (index) {
                      final bool filled = _shapeBlocks[index].isMatched;
                      return Icon(
                        Icons.star_rounded,
                        color: filled ? AppTheme.yellow : Colors.grey.shade300,
                        size: 32,
                      );
                    }),
                  ),
                  GestureDetector(
                    onTap: () => _playVoiceGuide('guide_shape.mp3'),
                    child: AnimatedScale(
                      scale: _kodiVoiceActive ? 1.25 : 1.0,
                      duration: const Duration(milliseconds: 300),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(shape: BoxShape.circle, color: AppTheme.mintGreen.withAlpha(40)),
                        child: Icon(
                          _kodiVoiceActive ? Icons.volume_up_rounded : Icons.volume_mute_rounded,
                          color: AppTheme.mintGreen,
                          size: 28,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: Container(
                margin: const EdgeInsets.all(16),
                decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.pastelMint, radius: 28),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: GestureDetector(
                    onPanStart: (details) {
                      final localPos = details.localPosition;
                      for (int i = 0; i < _shapeBlocks.length; i++) {
                        final blockRect = Rect.fromLTWH(_shapeBlocks[i].currentPos.dx, _shapeBlocks[i].currentPos.dy, 76, 76);
                        if (blockRect.contains(localPos)) {
                          _onShapeDragStart(i, localPos);
                          break;
                        }
                      }
                    },
                    onPanUpdate: (details) {
                      for (int i = 0; i < _shapeBlocks.length; i++) {
                        if (_shapeBlocks[i].isDragging) {
                          _onShapeDragUpdate(i, details.localPosition);
                          break;
                        }
                      }
                    },
                    onPanEnd: (details) {
                      for (int i = 0; i < _shapeBlocks.length; i++) {
                        if (_shapeBlocks[i].isDragging) {
                          _onShapeDragEnd(i);
                          break;
                        }
                      }
                    },
                    child: Stack(
                      children: [
                        ..._shapeSockets.map((socket) {
                          return Positioned(
                            left: socket.pos.dx,
                            top: socket.pos.dy,
                            child: Container(
                              width: socket.size,
                              height: socket.size,
                              decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white.withAlpha(160), radius: 20, borderWidth: 2),
                              child: CustomPaint(
                                painter: ShapeGamePainter(type: socket.type, color: AppTheme.darkPurpleBorder.withAlpha(80), outlineOnly: true),
                              ),
                            ),
                          );
                        }),

                        ..._shapeBlocks.map((s) {
                          return Positioned(
                            left: s.currentPos.dx,
                            top: s.currentPos.dy,
                            child: Container(
                              width: 76,
                              height: 76,
                              decoration: AppTheme.vibrant3DBoxDecoration(
                                color: s.color,
                                radius: s.type == ShapeType.circle ? 38 : 20,
                                borderWidth: s.isDragging ? 4.0 : 3.0,
                              ),
                              child: CustomPaint(
                                painter: ShapeGamePainter(type: s.type, color: AppTheme.white, outlineOnly: false),
                              ),
                            ),
                          );
                        }),

                        _buildShapeBouncingTrajectoryGuide(),

                        Positioned.fill(
                          child: IgnorePointer(
                            child: CustomPaint(
                              painter: ToddlerPachinkoPainter(bubbles: [], particles: _particles, pegs: [], basketRecoils: []),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ]
        ],
      );
    }

    // Default Phonics Syllable Game Mode
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Mavzu: Bo'g'inlarni ulash", style: AppTheme.headerSmall.copyWith(color: AppTheme.darkPurple)),
              Text("Savol: ${_currentWordIndex + 1} / 3", style: AppTheme.headerSmall.copyWith(color: AppTheme.mandarin)),
            ],
          ),
        ),

        Container(
          margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          height: 140,
          width: double.infinity,
          decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white, radius: 24, borderWidth: 2),
          child: AnimatedBuilder(
            animation: _pulseController,
            builder: (context, child) {
              return CustomPaint(
                painter: SyllableObjectPainter(
                  wordIndex: _currentWordIndex,
                  pulseAnimation: _pulseController.value,
                ),
              );
            },
          ),
        ),

        Expanded(
          child: Container(
            margin: const EdgeInsets.all(16),
            decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.pastelBlue, radius: 28),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: GestureDetector(
                onPanStart: (details) {
                  final localPos = details.localPosition;
                  for (int i = 0; i < _syllableBlocks.length; i++) {
                    final blockRect = Rect.fromLTWH(_syllableBlocks[i].currentPos.dx, _syllableBlocks[i].currentPos.dy, 84, 68);
                    if (blockRect.contains(localPos)) {
                      _onSyllableDragStart(i, localPos);
                      break;
                    }
                  }
                },
                onPanUpdate: (details) {
                  for (int i = 0; i < _syllableBlocks.length; i++) {
                    if (_syllableBlocks[i].isDragging) {
                      _onSyllableDragUpdate(i, details.localPosition);
                      break;
                    }
                  }
                },
                onPanEnd: (details) {
                  for (int i = 0; i < _syllableBlocks.length; i++) {
                    if (_syllableBlocks[i].isDragging) {
                      _onSyllableDragEnd(i);
                      break;
                    }
                  }
                },
                child: Stack(
                  children: [
                    ..._slots.map((slot) {
                      return Positioned(
                        left: slot.pos.dx,
                        top: slot.pos.dy,
                        child: Container(
                          width: slot.size.width,
                          height: slot.size.height,
                          decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white.withAlpha(160), radius: 20, borderWidth: 2),
                          alignment: Alignment.center,
                          child: Text("?", style: AppTheme.headerMedium.copyWith(color: Colors.grey.shade400, fontSize: 22)),
                        ),
                      );
                    }),

                    ..._syllableBlocks.map((s) {
                      return Positioned(
                        left: s.currentPos.dx,
                        top: s.currentPos.dy,
                        child: Container(
                          width: 84,
                          height: 68,
                          decoration: AppTheme.vibrant3DBoxDecoration(
                            color: s.color,
                            radius: 22,
                            borderWidth: s.isDragging ? 4.0 : 3.0,
                          ),
                          alignment: Alignment.center,
                          child: Text(s.text, style: AppTheme.headerMedium.copyWith(color: AppTheme.white, fontSize: 22)),
                        ),
                      );
                    }),

                    Positioned.fill(
                      child: IgnorePointer(
                        child: CustomPaint(
                          painter: ToddlerPachinkoPainter(bubbles: [], particles: _particles, pegs: [], basketRecoils: []),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // =========================================================================
  // 3D LEGO SEISMIC CONSTRUCTOR & SINASH LAB
  // =========================================================================
  Widget _build3DSeismicTycoonGame() {
    final ageController = Provider.of<AgeTierController>(context);
    final bool isPreLiterate = !ageController.canReadWrite;

    return Stack(
      children: [
        Column(
          children: [
            // Status/Progress indicators
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _placedBlocks.length < 5 
                        ? "Qurilgan: ${_placedBlocks.length} / 5 qavat" 
                        : "Minorani sinashga tayyor! 🌋",
                    style: AppTheme.headerSmall,
                  ),
                  if (_placedBlocks.isNotEmpty && !_seismicTesting)
                    GestureDetector(
                      onTap: _resetLegoConstructor,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.appleRed, radius: 14),
                        child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 20),
                      ),
                    ),
                ],
              ),
            ),

            // Canvas Area with multi-axis Matrix4 visual shaking layout wrapper
            Expanded(
              child: AnimatedBuilder(
                animation: _seismicController,
                builder: (context, child) {
                  final double val = _seismicController.value;
                  final double shakeX = math.sin(val * math.pi * 30.0) * 12.0 * (1.0 - val);
                  final double shakeY = math.cos(val * math.pi * 25.0) * 8.0 * (1.0 - val);
                  final double angle = math.sin(val * math.pi * 15.0) * 0.04 * (1.0 - val);

                  final Matrix4 transform = _seismicTesting
                      ? (Matrix4.translationValues(shakeX, shakeY, 0.0)..rotateZ(angle))
                      : Matrix4.identity();

                  return Transform(
                    transform: transform,
                    alignment: Alignment.bottomCenter,
                    child: child,
                  );
                },
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: AppTheme.vibrant3DBoxDecoration(color: const Color(0xFFF1F8E9), radius: 28),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: GestureDetector(
                      onTap: _placeLegoConstructorBlock,
                      child: CustomPaint(
                        painter: SeismicTycoonPainter(
                          placedBlocks: _placedBlocks,
                          shakeOffset: 0.0,
                        ),
                        child: Stack(
                          children: [
                            if (_placedBlocks.isEmpty)
                              const Center(
                                child: Padding(
                                  padding: EdgeInsets.all(24.0),
                                  child: Text(
                                    "Materialni tanlang va ekranga bosib stacked minorani quring! 🧱👇",
                                    style: TextStyle(fontSize: 15, color: Colors.black54, fontWeight: FontWeight.bold),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),

                            // Volcano tester button
                            if (_placedBlocks.length >= 5 && !_seismicTesting && !_showSeismicSuccessOverlay && !_showSeismicFailureOverlay)
                              Positioned(
                                bottom: 20,
                                left: 30,
                                right: 30,
                                child: GestureDetector(
                                  onTap: _triggerLegoSeismicTest,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 18),
                                    decoration: AppTheme.vibrant3DBoxDecoration(
                                      color: AppTheme.mandarin,
                                      radius: 24,
                                      shadowColor: const Color(0xFFD84B1A),
                                      shadowOffset: const Offset(4, 4),
                                    ),
                                    alignment: Alignment.center,
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Icon(Icons.volcano_rounded, color: Colors.white, size: 26),
                                        const SizedBox(width: 8),
                                        Text(
                                          "SINOVNI BOSHLASH 🌋",
                                          style: AppTheme.headerMedium.copyWith(color: Colors.white, fontSize: 15),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Material Selection Tray at the bottom
            if (!_seismicTesting && _placedBlocks.length < 5)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildLegoMaterialTile("Yog'och", "Yog'och Sinchi", AppTheme.cyan),
                    _buildLegoMaterialTile("G'isht", "Pishiq G'isht", AppTheme.mandarin),
                    _buildLegoMaterialTile("Tosh", "Poydevor Tosh", AppTheme.pastelGold),
                  ],
                ),
              ),
          ],
        ),

        // Amir Temur Success Overlay briefing
        if (_showSeismicSuccessOverlay)
          Positioned.fill(
            child: Container(
              color: Colors.black.withAlpha(160),
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: AppTheme.vibrant3DBoxDecoration(
                    color: AppTheme.white,
                    radius: 32,
                    borderColor: AppTheme.mintGreen,
                    shadowOffset: const Offset(5, 5),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const FloatingTalkingScholar(
                        initials: "AT",
                        name: "Amir Temur",
                        themeColor: AppTheme.mintGreen,
                      ),
                      const SizedBox(height: 14),
                      Text("Amir Temur", style: AppTheme.headerMedium.copyWith(color: AppTheme.darkPurple)),
                      Text("Sohibqiron Me'mor", style: AppTheme.bodySmall.copyWith(color: AppTheme.mintGreen, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 14),
                      const Text(
                        "Barakalla bolajon! Minoramiz zilzilaga chidadi. Sening mahorating evaziga minoramiz barqaror turibdi. Kelajakda buyuk me'mor bo'lasan! Sizga +100 yulduzcha sovg'a qilaman! ⭐",
                        style: TextStyle(fontSize: 13, height: 1.4, color: AppTheme.darkPurple),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      GestureDetector(
                        onTap: () async {
                          final controller = Provider.of<AgeTierController>(context, listen: false);
                          final appState = Provider.of<AppState>(context, listen: false);
                          await controller.advanceNode();
                          appState.awardStars(100);
                          
                          if (mounted) {
                            Navigator.pop(context); // Safe routing refresh pop
                          }
                        },
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: AppTheme.vibrant3DBoxDecoration(
                            color: AppTheme.mintGreen,
                            radius: 20,
                            shadowOffset: const Offset(3, 3),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            "KEYINGI BOSQICH 🚀",
                            style: AppTheme.headerMedium.copyWith(color: Colors.white, fontSize: 14),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

        // Amir Temur Failure Overlay briefing
        if (_showSeismicFailureOverlay)
          Positioned.fill(
            child: Container(
              color: Colors.black.withAlpha(160),
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: AppTheme.vibrant3DBoxDecoration(
                    color: AppTheme.white,
                    radius: 32,
                    borderColor: AppTheme.appleRed,
                    shadowOffset: const Offset(5, 5),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const FloatingTalkingScholar(
                        initials: "AT",
                        name: "Amir Temur",
                        themeColor: AppTheme.appleRed,
                      ),
                      const SizedBox(height: 14),
                      Text("Amir Temur", style: AppTheme.headerMedium.copyWith(color: AppTheme.darkPurple)),
                      Text("Sohibqiron Me'mor", style: AppTheme.bodySmall.copyWith(color: AppTheme.appleRed, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 14),
                      const Text(
                        "Afsuski, bolajon, minoramiz mustahkam bo'lmadi! 🧱 Har doim og'ir toshlarni eng pastga (poydevorga), yengil yog'ochlarni esa eng tepaga qo'yishimiz kerak. Qani, yana bir urinib ko'r!",
                        style: TextStyle(fontSize: 13, height: 1.4, color: AppTheme.darkPurple),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      GestureDetector(
                        onTap: _resetLegoConstructor,
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: AppTheme.vibrant3DBoxDecoration(
                            color: AppTheme.mandarin,
                            radius: 20,
                            shadowOffset: const Offset(3, 3),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            "QAYTADAN URINISH 🔄",
                            style: AppTheme.headerMedium.copyWith(color: Colors.white, fontSize: 14),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        _buildLegoGuide(isPreLiterate),
      ],
    );
  }

  Widget _buildLegoMaterialTile(String code, String name, Color color) {
    final bool isSelected = _selectedBuildingMaterial == code;
    return GestureDetector(
      onTap: () => setState(() => _selectedBuildingMaterial = code),
      child: AnimatedScale(
        scale: isSelected ? 1.06 : 0.94,
        duration: const Duration(milliseconds: 200),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: AppTheme.vibrant3DBoxDecoration(
            color: isSelected ? color : AppTheme.white,
            radius: 18,
            borderColor: isSelected ? Colors.transparent : Colors.grey.shade300,
            shadowOffset: isSelected ? const Offset(4, 4) : const Offset(1, 1),
          ),
          child: Text(
            name,
            style: AppTheme.headerSmall.copyWith(
              color: isSelected ? Colors.white : AppTheme.darkPurple,
              fontSize: 11,
            ),
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // GORGEOUS ALLOMALAR OVOZLI PORTAL
  // =========================================================================
  Widget _buildVoiceAIScholarPortal(AgeTier tier) {
    final activeScholar = _scholars[_selectedScholarIndex];
    final bool isIntermediate = tier == AgeTier.intermediate;

    return Column(
      children: [
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            itemCount: _scholars.length,
            itemBuilder: (context, idx) {
              final s = _scholars[idx];
              final bool isSelected = idx == _selectedScholarIndex;
              return GestureDetector(
                onTap: () => _selectScholar(idx),
                child: AnimatedScale(
                  scale: isSelected ? 1.12 : 0.92,
                  duration: const Duration(milliseconds: 250),
                  child: Container(
                    margin: const EdgeInsets.only(right: 12),
                    width: 90,
                    decoration: AppTheme.vibrant3DBoxDecoration(
                      color: isSelected ? s.solidColor : AppTheme.white,
                      radius: 24,
                      borderColor: s.solidColor,
                      shadowOffset: const Offset(3, 3),
                    ),
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircleAvatar(
                          backgroundColor: s.solidColor.withAlpha(50),
                          radius: 24,
                          child: Text(s.initials, style: TextStyle(color: isSelected ? Colors.white : s.solidColor, fontWeight: FontWeight.bold)),
                        ),
                        if (!isIntermediate) ...[
                          const SizedBox(height: 4),
                          Text(s.name, style: TextStyle(fontSize: 10, color: isSelected ? Colors.white : AppTheme.darkPurple, fontWeight: FontWeight.bold)),
                        ]
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              width: double.infinity,
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: AppTheme.porcelain,
                radius: 32,
                borderColor: activeScholar.solidColor,
                shadowOffset: const Offset(5, 5),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Positioned(
                    top: 10,
                    child: AnimatedBuilder(
                      animation: _waveAnimController,
                      builder: (context, child) {
                        return Transform.rotate(
                          angle: _waveAnimController.value * math.pi * 2,
                          child: Icon(Icons.blur_circular_rounded, color: activeScholar.solidColor.withAlpha(20), size: 280),
                        );
                      },
                    ),
                  ),

                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 140,
                        height: 140,
                        decoration: AppTheme.vibrant3DBoxDecoration(
                          color: activeScholar.solidColor.withAlpha(50),
                          radius: 70,
                          borderColor: activeScholar.solidColor,
                          borderWidth: 3,
                        ),
                        alignment: Alignment.center,
                        child: Text(activeScholar.initials, style: TextStyle(fontSize: 48, color: activeScholar.solidColor, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(height: 14),
                      if (!isIntermediate) ...[
                        Text(activeScholar.name, style: AppTheme.headerMedium.copyWith(color: AppTheme.darkPurple)),
                        Text(activeScholar.titleUz, style: AppTheme.bodySmall.copyWith(color: activeScholar.solidColor, fontWeight: FontWeight.bold)),
                      ],

                      const SizedBox(height: 20),

                      if (_activeVoiceReplyText.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: AnimatedScale(
                            scale: 1.0,
                            duration: const Duration(milliseconds: 300),
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: AppTheme.vibrant3DBoxDecoration(
                                color: AppTheme.white,
                                radius: 24,
                                shadowColor: activeScholar.solidColor.withAlpha(80),
                                shadowOffset: const Offset(3, 3),
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.record_voice_over_rounded, color: activeScholar.solidColor, size: 20),
                                      const SizedBox(width: 8),
                                      if (!isIntermediate)
                                        Text("Ovozli Javob", style: AppTheme.headerSmall.copyWith(fontSize: 12, color: activeScholar.solidColor)),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    _activeVoiceReplyText,
                                    style: AppTheme.bodyMedium.copyWith(fontSize: 12, height: 1.4),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),

                      if (_isSpeechLoading)
                        const Padding(
                          padding: EdgeInsets.only(top: 20),
                          child: CircularProgressIndicator(color: AppTheme.mandarin),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),

        Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: AppTheme.white,
            borderRadius: BorderRadius.only(topLeft: Radius.circular(32), topRight: Radius.circular(32)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_isMicRecording)
                Container(
                  height: 40,
                  margin: const EdgeInsets.only(bottom: 14),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(8, (i) {
                      final double h = 10 + 25 * math.sin((_waveAnimController.value * math.pi * 2) + i * 0.8).abs();
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: 4,
                        height: h,
                        decoration: BoxDecoration(color: AppTheme.mandarin, borderRadius: BorderRadius.circular(2)),
                      );
                    }),
                  ),
                ),

              GestureDetector(
                onTapDown: (_) => _triggerMicRecordingStart(),
                onTapUp: (_) => _triggerMicRecordingRelease(),
                child: AnimatedScale(
                  scale: _isMicRecording ? 1.25 : 1.0,
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.bounceOut,
                  child: Container(
                    width: 90,
                    height: 90,
                    decoration: AppTheme.vibrant3DBoxDecoration(
                      color: AppTheme.mandarin,
                      radius: 45,
                      borderColor: const Color(0xFFD84B1A),
                      shadowColor: AppTheme.mandarin,
                      shadowOffset: const Offset(4, 4),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.mic_rounded, color: Colors.white, size: 48),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // =========================================================================
  // HELPER PLACEMENT & TRAJECTORY WIDGETS
  // =========================================================================
  Widget _buildBouncingTrajectoryGuide() {
    int unmatchedIdx = _syllableBlocks.indexWhere((s) => !s.isMatched);
    if (unmatchedIdx != -1) {
      final block = _syllableBlocks[unmatchedIdx];
      int slotIdx = _slots.indexWhere((slot) => slot.expectedText == block.text && !slot.filled);
      if (slotIdx != -1) {
        final slot = _slots[slotIdx];
        final double t = _handDemoController.value;
        final double progress = Curves.easeInOut.transform(t);
        final Offset handPos = Offset.lerp(
          block.originalPos + const Offset(20, 20),
          slot.pos + const Offset(20, 20),
          progress,
        )!;
        final double fingerScale = 1.0 + 0.25 * math.sin(t * math.pi * 4);

        return Positioned(
          left: handPos.dx,
          top: handPos.dy,
          child: IgnorePointer(
            child: Transform.scale(
              scale: fingerScale,
              child: const Icon(
                Icons.pan_tool_alt_rounded,
                color: AppTheme.yellow,
                size: 38,
                shadows: [Shadow(color: Colors.black45, offset: Offset(2, 2), blurRadius: 4)],
              ),
            ),
          ),
        );
      }
    }
    return const SizedBox.shrink();
  }

  Widget _buildShapeBouncingTrajectoryGuide() {
    int unmatchedIdx = _shapeBlocks.indexWhere((s) => !s.isMatched);
    if (unmatchedIdx != -1) {
      final block = _shapeBlocks[unmatchedIdx];
      int socketIdx = _shapeSockets.indexWhere((socket) => socket.type == block.type && !socket.filled);
      if (socketIdx != -1) {
        final socket = _shapeSockets[socketIdx];
        final double t = _handDemoController.value;
        final double progress = Curves.easeInOut.transform(t);
        final Offset handPos = Offset.lerp(
          block.originalPos + const Offset(18, 18),
          socket.pos + const Offset(18, 18),
          progress,
        )!;
        final double fingerScale = 1.0 + 0.25 * math.sin(t * math.pi * 4);

        return Positioned(
          left: handPos.dx,
          top: handPos.dy,
          child: IgnorePointer(
            child: Transform.scale(
              scale: fingerScale,
              child: const Icon(
                Icons.pan_tool_alt_rounded,
                color: AppTheme.yellow,
                size: 38,
                shadows: [Shadow(color: Colors.black45, offset: Offset(2, 2), blurRadius: 4)],
              ),
            ),
          ),
        );
      }
    }
    return const SizedBox.shrink();
  }

  Widget _buildLegoGuide(bool isPreLiterate) {
    if (!isPreLiterate) return const SizedBox.shrink();

    final double t = _handDemoController.value;
    final double fingerScale = 1.0 + 0.25 * math.sin(t * math.pi * 4);

    if (_placedBlocks.length < 5) {
      return Positioned(
        bottom: 20,
        left: MediaQuery.of(context).size.width * 0.45,
        child: IgnorePointer(
          child: Transform.scale(
            scale: fingerScale,
            child: const Icon(
              Icons.pan_tool_alt_rounded,
              color: AppTheme.mandarin,
              size: 48,
              shadows: [Shadow(color: Colors.black45, offset: Offset(2, 2), blurRadius: 4)],
            ),
          ),
        ),
      );
    } else if (!_seismicTesting && !_showSeismicSuccessOverlay && !_showSeismicFailureOverlay) {
      return Positioned(
        bottom: 30,
        left: MediaQuery.of(context).size.width * 0.45,
        child: IgnorePointer(
          child: Transform.scale(
            scale: fingerScale,
            child: const Icon(
              Icons.pan_tool_alt_rounded,
              color: AppTheme.mandarin,
              size: 48,
              shadows: [Shadow(color: Colors.black45, offset: Offset(2, 2), blurRadius: 4)],
            ),
          ),
        ),
      );
    }
    return const SizedBox.shrink();
  }
}

// =========================================================================
// LIVE TALKING SCHOLAR ENGINE (TRANSPARENT FLOATING PORTRAIT)
// =========================================================================
class FloatingTalkingScholar extends StatefulWidget {
  final String initials;
  final String name;
  final Color themeColor;

  const FloatingTalkingScholar({
    super.key,
    required this.initials,
    required this.name,
    required this.themeColor,
  });

  @override
  State<FloatingTalkingScholar> createState() => _FloatingTalkingScholarState();
}

class _FloatingTalkingScholarState extends State<FloatingTalkingScholar> with TickerProviderStateMixin {
  late final AnimationController _slideController;
  late final AnimationController _speakController;

  @override
  void initState() {
    super.initState();
    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..forward();

    _speakController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _slideController.dispose();
    _speakController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    String assetName = "ulugbek.png";
    if (widget.initials == "AX") assetName = "xorazmiy.png";
    if (widget.initials == "AB") assetName = "beruniy.png";
    if (widget.initials == "IS") assetName = "ibnsino.png";
    if (widget.initials == "AT") assetName = "ulugbek.png";

    return AnimatedBuilder(
      animation: Listenable.merge([_slideController, _speakController]),
      builder: (context, child) {
        final double slideProgress = CurvedAnimation(parent: _slideController, curve: Curves.easeOutBack).value;
        final double slideY = (1.0 - slideProgress) * 150.0;
        final double speakY = math.sin(_speakController.value * math.pi * 2) * 5.0;

        return Transform.translate(
          offset: Offset(0, slideY + speakY),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 130,
                height: 130,
                child: Image.asset(
                  "assets/images/$assetName",
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      decoration: BoxDecoration(
                        color: widget.themeColor.withAlpha(200),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: widget.themeColor.withAlpha(100),
                            blurRadius: 12,
                            spreadRadius: 3,
                          )
                        ],
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        widget.initials,
                        style: const TextStyle(fontSize: 42, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
