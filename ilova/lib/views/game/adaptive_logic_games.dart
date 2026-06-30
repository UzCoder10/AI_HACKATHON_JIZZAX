import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';
import '../../controllers/age_tier_controller.dart';
import 'building_game_tab.dart';

// =========================================================================
// TODDLER PHYSICS: FLOATING BUBBLE FRUITS & PARTICLES
// =========================================================================
class FruitBubble {
  Offset pos;
  double speed;
  final double radius;
  final String emoji;
  final Color color;
  bool isPopped = false;
  double scale = 1.0;
  double popAnimTime = 0.0;

  FruitBubble({
    required this.pos,
    required this.speed,
    required this.radius,
    required this.emoji,
    required this.color,
  });

  void update(double dt) {
    if (!isPopped) {
      pos = Offset(pos.dx, pos.dy - speed * dt);
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
    pos += vel * dt;
    size = math.max(0.0, size - 12.0 * dt);
    opacity = math.max(0.0, opacity - 2.0 * dt);
  }
}

class ToddlerBubblePainter extends CustomPainter {
  final List<FruitBubble> bubbles;
  final List<BubbleParticle> particles;

  ToddlerBubblePainter({required this.bubbles, required this.particles});

  @override
  void paint(Canvas canvas, Size size) {
    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    for (final b in bubbles) {
      if (b.isPopped && b.popAnimTime >= math.pi) continue;

      canvas.save();
      canvas.translate(b.pos.dx, b.pos.dy);
      canvas.scale(b.scale, b.scale);

      final pBubble = Paint()
        ..color = b.color.withAlpha(190)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset.zero, b.radius, pBubble);

      final pBorder = Paint()
        ..color = AppTheme.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0;
      canvas.drawCircle(Offset.zero, b.radius, pBorder);

      textPainter.text = TextSpan(
        text: b.emoji,
        style: TextStyle(fontSize: b.radius * 1.05),
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(-textPainter.width / 2, -textPainter.height / 2));

      canvas.restore();
    }

    for (final p in particles) {
      final paint = Paint()
        ..color = p.color.withAlpha((p.opacity * 255).round())
        ..style = PaintingStyle.fill;
      canvas.drawCircle(p.pos, p.size, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// =========================================================================
// INTERMEDIATE SYLLABLE BUILDER MODELS
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

// =========================================================================
// GEOMETRIC OBJECT CUSTOM PAINTER (NO ASSET IMAGES)
// =========================================================================
class SyllableObjectPainter extends CustomPainter {
  final int wordIndex; // 0: OLMA, 1: KITOB, 2: QALAM
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

    if (wordIndex == 0) {
      // Draw Red Apple (OLMA)
      final pRed = Paint()..color = AppTheme.appleRed..style = PaintingStyle.fill;
      final pDarkRed = Paint()..color = AppTheme.darkAppleRed..style = PaintingStyle.stroke..strokeWidth = 3.0;

      // Leaf & Stem
      final pStem = Paint()..color = const Color(0xFF8B5A2B)..style = PaintingStyle.stroke..strokeWidth = 4.0..strokeCap = StrokeCap.round;
      canvas.drawLine(const Offset(0, -15), const Offset(8, -35), pStem);

      final pLeaf = Paint()..color = AppTheme.mintGreen..style = PaintingStyle.fill;
      final pathLeaf = Path()
        ..moveTo(8, -35)
        ..quadraticBezierTo(20, -45, 25, -30)
        ..quadraticBezierTo(14, -26, 8, -35)
        ..close();
      canvas.drawPath(pathLeaf, pLeaf);
      canvas.drawPath(pathLeaf, Paint()..color = AppTheme.darkMintGreen..style = PaintingStyle.stroke..strokeWidth = 1.5);

      // Body (Double-lobed Apple)
      canvas.drawCircle(const Offset(-14, 2), 26, pRed);
      canvas.drawCircle(const Offset(14, 2), 26, pRed);
      canvas.drawCircle(const Offset(-14, 2), 26, pDarkRed);
      canvas.drawCircle(const Offset(14, 2), 26, pDarkRed);

      // Highlight
      final pHighlight = Paint()..color = AppTheme.white.withAlpha(180)..style = PaintingStyle.fill;
      canvas.drawOval(const Rect.fromLTWH(-20, -14, 8, 12), pHighlight);

    } else if (wordIndex == 1) {
      // Draw Blue Book (KITOB)
      final pBlue = Paint()..color = AppTheme.marineBlue..style = PaintingStyle.fill;
      final pDarkBlue = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.stroke..strokeWidth = 3.0;
      final pPages = Paint()..color = AppTheme.white..style = PaintingStyle.fill;

      // Spine / Cover Backing
      final pathCover = Path()
        ..moveTo(-35, -20)
        ..lineTo(30, -20)
        ..lineTo(35, 25)
        ..lineTo(-30, 25)
        ..close();
      canvas.drawPath(pathCover, pBlue);
      canvas.drawPath(pathCover, pDarkBlue);

      // Paper Pages Stack
      final pathPages = Path()
        ..moveTo(-30, -16)
        ..lineTo(26, -16)
        ..lineTo(30, 21)
        ..lineTo(-26, 21)
        ..close();
      canvas.drawPath(pathPages, pPages);
      canvas.drawPath(pathPages, pDarkBlue);

      // Ribbon Bookmark
      final pRibbon = Paint()..color = AppTheme.mandarin..style = PaintingStyle.fill;
      final pathRibbon = Path()
        ..moveTo(0, -16)
        ..lineTo(6, -16)
        ..lineTo(4, 30)
        ..lineTo(0, 26)
        ..close();
      canvas.drawPath(pathRibbon, pRibbon);

    } else {
      // Draw Pencil (QALAM)
      final pWood = Paint()..color = AppTheme.pastelGold..style = PaintingStyle.fill;
      final pLead = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.fill;
      final pPencilBody = Paint()..color = AppTheme.mandarin..style = PaintingStyle.fill;
      final pStroke = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.stroke..strokeWidth = 2.5;

      // Pencil Body
      final pathBody = Path()
        ..moveTo(-35, -10)
        ..lineTo(10, -10)
        ..lineTo(10, 10)
        ..lineTo(-35, 10)
        ..close();
      canvas.drawPath(pathBody, pPencilBody);
      canvas.drawPath(pathBody, pStroke);

      // Wooden Cone Tip
      final pathCone = Path()
        ..moveTo(10, -10)
        ..lineTo(28, 0)
        ..lineTo(10, 10)
        ..close();
      canvas.drawPath(pathCone, pWood);
      canvas.drawPath(pathCone, pStroke);

      // Graphite Tip
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
// INTERACTIVE MAIN ADAPTIVE LOGIC GAMES
// =========================================================================
class AdaptiveLogicGames extends StatefulWidget {
  final int initialGameIndex;
  const AdaptiveLogicGames({super.key, this.initialGameIndex = 0});

  @override
  State<AdaptiveLogicGames> createState() => _AdaptiveLogicGamesState();
}

class _AdaptiveLogicGamesState extends State<AdaptiveLogicGames> with TickerProviderStateMixin {
  late int _activeGameIndex;

  // Toddler Math Game State
  final List<FruitBubble> _bubbles = [];
  final List<BubbleParticle> _particles = [];
  int _toddlerCount = 0;
  late final Ticker _physicsTicker;
  double _spawnTimer = 0.0;

  // Intermediate Syllable Game State
  final List<SyllableWordConfig> _wordLevels = [
    SyllableWordConfig(correctWord: "OLMA", syllablesScrambled: ["MA", "OL"], correctSequence: ["OL", "MA"]),
    SyllableWordConfig(correctWord: "KITOB", syllablesScrambled: ["TOB", "KI"], correctSequence: ["KI", "TOB"]),
    SyllableWordConfig(correctWord: "QALAM", syllablesScrambled: ["LAM", "QA"], correctSequence: ["QA", "LAM"]),
  ];
  int _currentWordIndex = 0;
  List<SyllableBlock> _syllableBlocks = [];
  List<SyllableSlot> _slots = [];

  // Kinetic Snap-back animation properties
  late final AnimationController _snapController;
  int _animatingIndex = -1;
  Offset _animatingStartOffset = Offset.zero;

  // Sound/Success pulse bounce
  late final AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _activeGameIndex = widget.initialGameIndex;

    _physicsTicker = Ticker((Duration elapsed) {
      final double dt = 0.0166;
      _updatePhysics(dt);
    });

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    if (_activeGameIndex == 0) {
      _physicsTicker.start();
    } else if (_activeGameIndex == 1) {
      _setupSyllableGame();
    }

    _snapController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..addListener(() {
        if (_animatingIndex != -1) {
          setState(() {
            final double t = _snapController.value;
            // Damped elastic kinetic equation
            final double damping = math.exp(-5.0 * t);
            final double oscillation = math.cos(18.0 * t);
            final double scale = damping * oscillation;

            final Offset original = _syllableBlocks[_animatingIndex].originalPos;
            final Offset diff = _animatingStartOffset - original;

            _syllableBlocks[_animatingIndex].currentPos = original + diff * scale;
          });
        }
      });
  }

  @override
  void dispose() {
    _physicsTicker.dispose();
    _snapController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  // --- PHYSICS ENGINE LOOP (TODDLERS) ---
  void _updatePhysics(double dt) {
    if (!mounted || _activeGameIndex != 0) return;

    setState(() {
      _spawnTimer += dt;
      final size = MediaQuery.of(context).size;

      if (_spawnTimer > 1.0 && _toddlerCount < 10) {
        _spawnTimer = 0.0;
        final random = math.Random();
        final emojis = ["🍎", "🍋", "🍇", "🍓", "🍉", "🍒"];
        final colors = [AppTheme.appleRed, AppTheme.yellow, AppTheme.marineBlue, AppTheme.mandarin, AppTheme.mintGreen, AppTheme.pastelGold];
        
        final idx = random.nextInt(emojis.length);
        _bubbles.add(FruitBubble(
          pos: Offset(40 + random.nextDouble() * (size.width - 80), size.height * 0.75),
          speed: 70.0 + random.nextDouble() * 90.0,
          radius: 36.0,
          emoji: emojis[idx],
          color: colors[idx],
        ));
      }

      for (final b in _bubbles) {
        b.update(dt);
      }

      _bubbles.removeWhere((b) => b.pos.dy < -50 || (b.isPopped && b.popAnimTime >= math.pi));

      for (final p in _particles) {
        p.update(dt);
      }
      _particles.removeWhere((p) => p.opacity <= 0.0 || p.size <= 0.0);
    });
  }

  void _onToddlerScreenTap(TapDownDetails details) {
    final tapPos = details.localPosition;
    for (final b in _bubbles) {
      if (!b.isPopped) {
        final double dist = (b.pos - tapPos).distance;
        if (dist <= b.radius + 10) {
          setState(() {
            b.isPopped = true;
            _toddlerCount++;

            final random = math.Random();
            for (int i = 0; i < 15; i++) {
              final double angle = random.nextDouble() * math.pi * 2;
              final double speed = 100.0 + random.nextDouble() * 150.0;
              _particles.add(BubbleParticle(
                pos: b.pos,
                vel: Offset(math.cos(angle) * speed, math.sin(angle) * speed),
                color: b.color,
                size: 6.0 + random.nextDouble() * 10.0,
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

    // Layout slots center-middle
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

    // Scrambled letters/syllables at the bottom
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
          
          // Trigger matching burst effect
          final random = math.Random();
          for (int i = 0; i < 8; i++) {
            final double angle = random.nextDouble() * math.pi * 2;
            _particles.add(BubbleParticle(
              pos: slot.pos + const Offset(45, 36),
              vel: Offset(math.cos(angle) * 120, math.sin(angle) * 120),
              color: _syllableBlocks[index].color,
              size: 4 + random.nextDouble() * 6,
            ));
          }
          break;
        }
      }

      if (!matched) {
        // Trigger Elastic Snapping
        _animatingIndex = index;
        _animatingStartOffset = _syllableBlocks[index].currentPos;
        _snapController.forward(from: 0.0);
      }

      // Check if word completed
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

  void _winGame(int rewardStars) {
    final state = Provider.of<AppState>(context, listen: false);
    state.awardStars(rewardStars);
    Provider.of<AgeTierController>(context, listen: false).syncStarsToCloud(rewardStars);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        title: Row(
          children: [
            const Icon(Icons.workspace_premium_rounded, color: AppTheme.yellow, size: 36),
            const SizedBox(width: 8),
            Text("Ajoyib!", style: AppTheme.headerMedium),
          ],
        ),
        content: Text(
          "Yulduzchalar hisobingizga +$rewardStars ta qo'shildi! Siz barcha bo'g'inlarni to'g'ri bog'ladingiz! ⭐",
          style: AppTheme.bodyLarge,
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.mintGreen,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).pop();
            },
            child: Text(
              "Sayohatni Davom Ettirish",
              style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 13),
            ),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ageController = Provider.of<AgeTierController>(context);
    final tier = ageController.activeTier;

    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        title: Text(
          _activeGameIndex == 0 
              ? "Meva pufakchalarini yor!" 
              : (_activeGameIndex == 1 ? "Bo'g'inli So'zlar" : "3D Arxitektor"),
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
      return _buildIntermediatePhonicsGame();
    } else {
      return BuildingGameTab(appState: Provider.of<AppState>(context, listen: false));
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
                Text("Hisoblash tepsisi:", style: AppTheme.headerSmall.copyWith(fontSize: 14)),
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
                  painter: ToddlerBubblePainter(bubbles: _bubbles, particles: _particles),
                  child: Container(),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildIntermediatePhonicsGame() {
    final wordConfig = _wordLevels[_currentWordIndex];
    final bool isCompleted = _syllableBlocks.every((s) => s.isMatched);

    return Column(
      children: [
        // Level/Word display
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Mavzu: Bo'g'inlarni ulash",
                style: AppTheme.headerSmall.copyWith(color: AppTheme.darkPurple),
              ),
              Text(
                "Savol: ${_currentWordIndex + 1} / 3",
                style: AppTheme.headerSmall.copyWith(color: AppTheme.mandarin),
              ),
            ],
          ),
        ),

        // Visual Object Canvas Container
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          height: 140,
          width: double.infinity,
          decoration: AppTheme.vibrant3DBoxDecoration(
            color: AppTheme.white,
            radius: 24,
            borderWidth: 2,
            shadowOffset: const Offset(3, 3),
          ),
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

        // Syllable Drag Space
        Expanded(
          child: Container(
            margin: const EdgeInsets.all(16),
            decoration: AppTheme.vibrant3DBoxDecoration(
              color: AppTheme.pastelBlue,
              radius: 28,
            ),
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
                    // Slots / Targets
                    ..._slots.map((slot) {
                      return Positioned(
                        left: slot.pos.dx,
                        top: slot.pos.dy,
                        child: Container(
                          width: slot.size.width,
                          height: slot.size.height,
                          decoration: AppTheme.vibrant3DBoxDecoration(
                            color: AppTheme.white.withAlpha(160),
                            radius: 20,
                            borderWidth: 2,
                            shadowOffset: const Offset(2, 2),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            "?",
                            style: AppTheme.headerMedium.copyWith(color: Colors.grey.shade400, fontSize: 22),
                          ),
                        ),
                      );
                    }),

                    // Scrambled Draggable Syllables
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
                            shadowOffset: s.isDragging ? const Offset(1, 1) : const Offset(4, 4),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            s.text,
                            style: AppTheme.headerMedium.copyWith(color: AppTheme.white, fontSize: 22),
                          ),
                        ),
                      );
                    }),

                    // Particle layer
                    Positioned.fill(
                      child: IgnorePointer(
                        child: CustomPaint(
                          painter: ToddlerBubblePainter(bubbles: [], particles: _particles),
                        ),
                      ),
                    ),

                    // Completed celebration text overlay
                    if (isCompleted)
                      Positioned.fill(
                        child: Container(
                          color: AppTheme.white.withAlpha(180),
                          alignment: Alignment.center,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: AppTheme.vibrant3DBoxDecoration(
                                  color: AppTheme.mintGreen,
                                  radius: 16,
                                ),
                                child: Text(
                                  "Barakalla! ${wordConfig.correctWord}",
                                  style: AppTheme.headerMedium.copyWith(color: AppTheme.white),
                                ),
                              ),
                            ],
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
}
