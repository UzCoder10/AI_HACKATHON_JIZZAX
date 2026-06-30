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
// INTERMEDIATE PHONICS: DRAGGABLE BUBBLES DATA MODEL
// =========================================================================
class DraggableLetter {
  final String char;
  Offset currentPos;
  final Offset originalPos;
  Offset targetCenter = Offset.zero;
  bool isDragging = false;
  bool isMatched = false;
  final Color color;

  DraggableLetter({
    required this.char,
    required this.currentPos,
    required this.originalPos,
    required this.color,
  });
}

class TargetBox {
  final String char;
  final Offset pos;
  final Size size;

  TargetBox({
    required this.char,
    required this.pos,
    required this.size,
  });
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

  // Intermediate Phonics Game State
  List<DraggableLetter> _dragLetters = [];
  List<TargetBox> _targets = [];
  int _phonicsScore = 0;

  // Kinetic Snap-back animation properties
  late final AnimationController _snapController;
  int _animatingIndex = -1;
  Offset _animatingStartOffset = Offset.zero;

  @override
  void initState() {
    super.initState();
    _activeGameIndex = widget.initialGameIndex;

    _physicsTicker = Ticker((Duration elapsed) {
      final double dt = 0.0166;
      _updatePhysics(dt);
    });

    if (_activeGameIndex == 0) {
      _physicsTicker.start();
    } else if (_activeGameIndex == 1) {
      _setupPhonicsGame();
    }

    _snapController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..addListener(() {
        if (_animatingIndex != -1) {
          setState(() {
            final double t = _snapController.value;
            // Elastic underdamped oscillation equation x(t) = exp(-5t)*cos(15t)
            final double damping = math.exp(-5.0 * t);
            final double oscillation = math.cos(18.0 * t);
            final double scale = damping * oscillation;

            final Offset original = _dragLetters[_animatingIndex].originalPos;
            final Offset diff = _animatingStartOffset - original;

            _dragLetters[_animatingIndex].currentPos = original + diff * scale;
          });
        }
      });
  }

  @override
  void dispose() {
    _physicsTicker.dispose();
    _snapController.dispose();
    super.dispose();
  }

  // --- PHYSICS ENGINE LOOP ---
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
        final dist = (b.pos - tapPos).distance;
        if (dist <= b.radius + 10) {
          setState(() {
            b.isPopped = true;
            _toddlerCount++;

            final random = math.Random();
            for (int i = 0; i < 15; i++) {
              final angle = random.nextDouble() * math.pi * 2;
              final speed = 100.0 + random.nextDouble() * 150.0;
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

  // --- PHONICS MATCHING DRAG ENGINE ---
  void _setupPhonicsGame() {
    _targets = [
      TargetBox(char: "A", pos: const Offset(40, 100), size: const Size(80, 80)),
      TargetBox(char: "B", pos: const Offset(150, 100), size: const Size(80, 80)),
      TargetBox(char: "D", pos: const Offset(260, 100), size: const Size(80, 80)),
    ];

    _dragLetters = [
      DraggableLetter(char: "B", currentPos: const Offset(50, 360), originalPos: const Offset(50, 360), color: AppTheme.yellow),
      DraggableLetter(char: "A", currentPos: const Offset(160, 360), originalPos: const Offset(160, 360), color: AppTheme.mintGreen),
      DraggableLetter(char: "D", currentPos: const Offset(270, 360), originalPos: const Offset(270, 360), color: AppTheme.marineBlue),
    ];
  }

  void _onLetterDragStart(int index, Offset localPos) {
    if (_dragLetters[index].isMatched || _snapController.isAnimating) return;
    setState(() {
      _dragLetters[index].isDragging = true;
    });
  }

  void _onLetterDragUpdate(int index, Offset globalPos) {
    if (!_dragLetters[index].isDragging) return;
    setState(() {
      _dragLetters[index].currentPos = globalPos - const Offset(36, 120);
    });
  }

  void _onLetterDragEnd(int index) {
    if (!_dragLetters[index].isDragging) return;
    setState(() {
      _dragLetters[index].isDragging = false;

      bool matched = false;
      final bubbleCenter = _dragLetters[index].currentPos + const Offset(36, 36);

      for (final target in _targets) {
        final targetRect = Rect.fromLTWH(target.pos.dx, target.pos.dy, target.size.width, target.size.height);
        if (targetRect.contains(bubbleCenter) && target.char == _dragLetters[index].char) {
          _dragLetters[index].isMatched = true;
          _dragLetters[index].currentPos = target.pos + const Offset(4, 4); 
          _phonicsScore++;
          matched = true;
          _dragLetters[index].targetCenter = target.pos;
          break;
        }
      }

      if (!matched) {
        // Triggering Elastic Damped Kinetic Wobble Snapback
        _animatingIndex = index;
        _animatingStartOffset = _dragLetters[index].currentPos;
        _snapController.forward(from: 0.0);

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Ouch! Qayta urinib ko'r! 🧸"),
            backgroundColor: AppTheme.appleRed,
            duration: Duration(milliseconds: 600),
          ),
        );
      }

      if (_phonicsScore >= 3) {
        _winGame(15);
      }
    });
  }

  void _winGame(int rewardStars) {
    final state = Provider.of<AppState>(context, listen: false);
    state.awardStars(rewardStars);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        title: Row(
          children: [
            const Icon(Icons.workspace_premium_rounded, color: AppTheme.yellow, size: 36),
            const SizedBox(width: 8),
            Text("Ajoyib kashfiyot!", style: AppTheme.headerMedium),
          ],
        ),
        content: Text(
          "Yulduzchalar hisobingizga +$rewardStars ta qo'shildi! Kodi va allomalar siz bilan faxrlanadilar!",
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
              : (_activeGameIndex == 1 ? "Harflar Mozaikasi" : "3D Arxitektor"),
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
    return Container(
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
            for (int i = 0; i < _dragLetters.length; i++) {
              final letterRect = Rect.fromLTWH(_dragLetters[i].currentPos.dx, _dragLetters[i].currentPos.dy, 72, 72);
              if (letterRect.contains(localPos)) {
                _onLetterDragStart(i, localPos);
                break;
              }
            }
          },
          onPanUpdate: (details) {
            for (int i = 0; i < _dragLetters.length; i++) {
              if (_dragLetters[i].isDragging) {
                _onLetterDragUpdate(i, details.localPosition);
                break;
              }
            }
          },
          onPanEnd: (details) {
            for (int i = 0; i < _dragLetters.length; i++) {
              if (_dragLetters[i].isDragging) {
                _onLetterDragEnd(i);
                break;
              }
            }
          },
          child: Stack(
            children: [
              Positioned(
                top: 20,
                left: 20,
                right: 20,
                child: Center(
                  child: Text(
                    "Harflarni mos o'rniga joylashtir!",
                    style: AppTheme.headerSmall.copyWith(color: AppTheme.darkPurple),
                  ),
                ),
              ),

              // Targets
              ..._targets.map((target) {
                return Positioned(
                  left: target.pos.dx,
                  top: target.pos.dy,
                  child: Container(
                    width: target.size.width,
                    height: target.size.height,
                    decoration: AppTheme.vibrant3DBoxDecoration(
                      color: AppTheme.white.withAlpha(160),
                      radius: 20,
                      borderWidth: 2,
                      shadowOffset: const Offset(2, 2),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      target.char,
                      style: AppTheme.headerMedium.copyWith(color: Colors.grey.shade400, fontSize: 24),
                    ),
                  ),
                );
              }),

              // Draggables
              ..._dragLetters.map((l) {
                return Positioned(
                  left: l.currentPos.dx,
                  top: l.currentPos.dy,
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: AppTheme.vibrant3DBoxDecoration(
                      color: l.color,
                      radius: 24,
                      borderWidth: l.isDragging ? 4.0 : 3.0,
                      shadowOffset: l.isDragging ? const Offset(1, 1) : const Offset(4, 4),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      l.char,
                      style: AppTheme.headerLarge.copyWith(color: AppTheme.white, fontSize: 28),
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}
