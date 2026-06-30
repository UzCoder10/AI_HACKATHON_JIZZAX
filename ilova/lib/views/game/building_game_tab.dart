import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';

// =========================================================================
// ISOMETRIC CUBE PAINTER (Shaded, No Black, Dynamic Offsets)
// =========================================================================
class IsometricBlock {
  final int index;
  final Color baseColor;
  
  // Dynamic offset/rotation for collapse physics
  double offsetX = 0.0;
  double offsetY = 0.0;
  double rotateZ = 0.0;
  double rotateY = 0.0;

  IsometricBlock({required this.index, required this.baseColor});
}

class IsometricGamePainter extends CustomPainter {
  final List<IsometricBlock> blocks;
  final double blockRadius;
  final double blockHeight;
  final Offset baseline;
  
  // Dropping block parameters
  final bool isDropping;
  final double dropProgress;
  final Color droppingColor;

  IsometricGamePainter({
    required this.blocks,
    this.blockRadius = 45.0,
    this.blockHeight = 46.0,
    required this.baseline,
    required this.isDropping,
    required this.dropProgress,
    required this.droppingColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Draw stacked blocks from bottom to top
    for (int i = 0; i < blocks.length; i++) {
      final b = blocks[i];
      // Target stacked center
      final double targetCx = baseline.dx + b.offsetX;
      final double targetCy = baseline.dy - (i * blockHeight) + b.offsetY;
      _drawCube(canvas, Offset(targetCx, targetCy), blockRadius, b.baseColor, b.rotateZ, b.rotateY);
    }

    // Draw active dropping block
    if (isDropping) {
      final double startY = 40.0;
      final double targetY = baseline.dy - (blocks.length * blockHeight);
      final double currentY = startY + (targetY - startY) * dropProgress;
      _drawCube(canvas, Offset(baseline.dx, currentY), blockRadius, droppingColor, 0.0, 0.0);
    }
  }

  void _drawCube(Canvas canvas, Offset center, double r, Color color, double rotateZ, double rotateY) {
    // Resolve shaded colors (Top: light, Left: mid, Right: dark, Border: deep tone)
    Color topColor, leftColor, rightColor, borderColor;

    if (color == AppTheme.mandarin) {
      topColor = const Color(0xFFFF8E66);
      leftColor = const Color(0xFFFF6B35);
      rightColor = const Color(0xFFD44810);
      borderColor = const Color(0xFF9E2E04);
    } else if (color == AppTheme.marineBlue) {
      topColor = const Color(0xFF5CD5FF);
      leftColor = const Color(0xFF00A8E8);
      rightColor = const Color(0xFF0082B4);
      borderColor = const Color(0xFF00587A);
    } else {
      // Yellow
      topColor = const Color(0xFFFFDF7A);
      leftColor = const Color(0xFFFFB627);
      rightColor = const Color(0xFFD8920E);
      borderColor = const Color(0xFF9C6500);
    }

    // Draw Top Face (Rhombus)
    final topPath = Path();
    Offset pTop = Offset(center.dx, center.dy - r * 0.5);
    Offset pRight = Offset(center.dx + r * 0.866, center.dy);
    Offset pBottom = Offset(center.dx, center.dy + r * 0.5);
    Offset pLeft = Offset(center.dx - r * 0.866, center.dy);

    // Apply basic rotations if collapsing
    if (rotateZ != 0.0 || rotateY != 0.0) {
      pTop = _rotateOffset(pTop, center, rotateZ, rotateY);
      pRight = _rotateOffset(pRight, center, rotateZ, rotateY);
      pBottom = _rotateOffset(pBottom, center, rotateZ, rotateY);
      pLeft = _rotateOffset(pLeft, center, rotateZ, rotateY);
    }

    topPath.moveTo(pTop.dx, pTop.dy);
    topPath.lineTo(pRight.dx, pRight.dy);
    topPath.lineTo(pBottom.dx, pBottom.dy);
    topPath.lineTo(pLeft.dx, pLeft.dy);
    topPath.close();

    final fillPaint = Paint()..style = PaintingStyle.fill;
    final strokePaint = Paint()
      ..style = PaintingStyle.stroke
      ..color = borderColor
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    canvas.drawPath(topPath, fillPaint..color = topColor);
    canvas.drawPath(topPath, strokePaint);

    // Draw Left Face
    final leftPath = Path();
    Offset pBottomCenter = Offset(center.dx, center.dy + r * 1.5);
    Offset pBottomLeft = Offset(center.dx - r * 0.866, center.dy + r * 1.0);

    if (rotateZ != 0.0 || rotateY != 0.0) {
      pBottomCenter = _rotateOffset(pBottomCenter, center, rotateZ, rotateY);
      pBottomLeft = _rotateOffset(pBottomLeft, center, rotateZ, rotateY);
    }

    leftPath.moveTo(pLeft.dx, pLeft.dy);
    leftPath.lineTo(pBottom.dx, pBottom.dy);
    leftPath.lineTo(pBottomCenter.dx, pBottomCenter.dy);
    leftPath.lineTo(pBottomLeft.dx, pBottomLeft.dy);
    leftPath.close();

    canvas.drawPath(leftPath, fillPaint..color = leftColor);
    canvas.drawPath(leftPath, strokePaint);

    // Draw Right Face
    final rightPath = Path();
    Offset pBottomRight = Offset(center.dx + r * 0.866, center.dy + r * 1.0);

    if (rotateZ != 0.0 || rotateY != 0.0) {
      pBottomRight = _rotateOffset(pBottomRight, center, rotateZ, rotateY);
    }

    rightPath.moveTo(pRight.dx, pRight.dy);
    rightPath.lineTo(pBottom.dx, pBottom.dy);
    rightPath.lineTo(pBottomCenter.dx, pBottomCenter.dy);
    rightPath.lineTo(pBottomRight.dx, pBottomRight.dy);
    rightPath.close();

    canvas.drawPath(rightPath, fillPaint..color = rightColor);
    canvas.drawPath(rightPath, strokePaint);
  }

  Offset _rotateOffset(Offset point, Offset center, double angleZ, double angleY) {
    // Basic 2D projection rotation
    double x = point.dx - center.dx;
    double y = point.dy - center.dy;

    // Rotate Z
    double cosZ = math.cos(angleZ);
    double sinZ = math.sin(angleZ);
    double rx = x * cosZ - y * sinZ;
    double ry = x * sinZ + y * cosZ;

    // Scale Y for pseudo-3D perspective collapse tilt
    ry = ry * math.cos(angleY);

    return Offset(center.dx + rx, center.dy + ry);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// =========================================================================
// ISOMETRIC BUILDING GAME SCREEN WIDGET
// =========================================================================
class BuildingGameTab extends StatefulWidget {
  final AppState appState;

  const BuildingGameTab({super.key, required this.appState});

  @override
  State<BuildingGameTab> createState() => _BuildingGameTabState();
}

class _BuildingGameTabState extends State<BuildingGameTab> with TickerProviderStateMixin {
  final List<IsometricBlock> _blocks = [];
  bool _isDropping = false;
  Color _currentColor = AppTheme.marineBlue;

  // Colors sequence
  final List<Color> _blockColors = [AppTheme.marineBlue, AppTheme.mandarin, AppTheme.yellow];
  int _colorIndex = 0;

  // Controllers
  late final AnimationController _dropController;
  late final AnimationController _shakeController;
  late final AnimationController _collapseController;

  bool _showBriefing = false;
  bool _isCollapsed = false;

  @override
  void initState() {
    super.initState();
    
    // Drop Physics (Spring Bouncing effect)
    _dropController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    // Screen Shake seismic matrix
    _shakeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    // Staggered collapse physics
    _collapseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );

    _dropController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        setState(() {
          _isDropping = false;
          _blocks.add(IsometricBlock(index: _blocks.length, baseColor: _currentColor));
          _dropController.reset();

          // Check if tower reaches 5 blocks to trigger seismic collapse
          if (_blocks.length >= 5) {
            _triggerSeismicEvent();
          }
        });
      }
    });

    _collapseController.addListener(() {
      final double progress = _collapseController.value;
      setState(() {
        for (int i = 0; i < _blocks.length; i++) {
          final b = _blocks[i];
          
          // Staggered start offset for each block
          final double blockStart = i * 0.15;
          if (progress > blockStart) {
            final double localProg = (progress - blockStart) / (1.0 - blockStart);
            final double normalized = math.min(1.0, math.max(0.0, localProg));

            // Staggered collapse calculations
            b.offsetX = (i % 2 == 0 ? -1 : 1) * normalized * 180.0 + math.sin(normalized * 5 * math.pi) * 15;
            b.offsetY = normalized * 400.0 + (i * 20) * normalized;
            b.rotateZ = normalized * (i % 2 == 0 ? -1.8 : 1.8);
            b.rotateY = normalized * 0.8;
          }
        }
      });
    });

    _collapseController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        setState(() {
          _showBriefing = true;
          _isCollapsed = true;
        });
      }
    });
  }

  @override
  void dispose() {
    _dropController.dispose();
    _shakeController.dispose();
    _collapseController.dispose();
    super.dispose();
  }

  void _triggerSeismicEvent() {
    // Vibration shaking screen
    _shakeController.forward(from: 0.0).then((_) {
      // Trigger collapse immediately after shaking
      _collapseController.forward(from: 0.0);
    });
  }

  void _dropBlock() {
    if (_isDropping || _isCollapsed || _showBriefing) return;

    setState(() {
      _isDropping = true;
      _currentColor = _blockColors[_colorIndex];
      _colorIndex = (_colorIndex + 1) % _blockColors.length;
    });

    _dropController.forward(from: 0.0);
  }

  void _resetGame() {
    setState(() {
      _blocks.clear();
      _isDropping = false;
      _isCollapsed = false;
      _showBriefing = false;
      _colorIndex = 0;
      _dropController.reset();
      _shakeController.reset();
      _collapseController.reset();
    });
  }

  @override
  Widget build(BuildContext context) {
    // Generate viewport shake offsets using sinusoidal translations
    final shakeAnim = AnimatedBuilder(
      animation: _shakeController,
      builder: (context, child) {
        final double progress = _shakeController.value;
        double dx = 0.0;
        double dy = 0.0;
        if (progress > 0.0 && progress < 1.0) {
          dx = math.sin(progress * 12 * math.pi) * 10 * (1.0 - progress);
          dy = math.cos(progress * 10 * math.pi) * 6 * (1.0 - progress);
        }
        return Transform.translate(
          offset: Offset(dx, dy),
          child: child,
        );
      },
      child: Stack(
        children: [
          // Background layout
          Container(
            color: AppTheme.porcelain,
            width: double.infinity,
            height: double.infinity,
          ),
          
          // Ground platform grid (shaded pop-art foundation)
          Positioned(
            bottom: 60,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                width: 220,
                height: 38,
                decoration: AppTheme.vibrant3DBoxDecoration(
                  color: AppTheme.white,
                  borderColor: AppTheme.darkPurpleBorder,
                  shadowColor: AppTheme.pastelGold,
                  radius: 12,
                ),
                alignment: Alignment.center,
                child: Text(
                  "POYDEVOR (FOUNDATION)",
                  style: AppTheme.headerSmall.copyWith(fontSize: 10, color: AppTheme.darkMandarin),
                ),
              ),
            ),
          ),

          // Custom isometric engine canvas
          Positioned.fill(
            child: CustomPaint(
              painter: IsometricGamePainter(
                blocks: _blocks,
                baseline: Offset(MediaQuery.of(context).size.width / 2, MediaQuery.of(context).size.height - 180),
                isDropping: _isDropping,
                dropProgress: CurvedAnimation(parent: _dropController, curve: Curves.bounceOut).value,
                droppingColor: _currentColor,
              ),
            ),
          ),
          
          // Active seismic status indicator
          if (_shakeController.value > 0.0 && _shakeController.value < 1.0)
            Positioned(
              top: 100,
              left: 20,
              right: 20,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: AppTheme.vibrant3DBoxDecoration(
                    color: AppTheme.pastelRed,
                    borderColor: AppTheme.darkAppleRed,
                    shadowColor: AppTheme.appleRed,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.warning_rounded, color: AppTheme.appleRed),
                      const SizedBox(width: 8),
                      Text("ZILZILA SODIR BO‘LDI!", style: AppTheme.headerSmall.copyWith(color: AppTheme.appleRed)),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        title: Text("3D Arxitektor", style: AppTheme.headerMedium),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.darkPurple),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Stack(
        children: [
          // Seismic shaking main view
          Positioned.fill(child: shakeAnim),

          // Side Height bar details
          if (!_isCollapsed && _blocks.isNotEmpty)
            Positioned(
              left: 16,
              top: 40,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: AppTheme.vibrant3DBoxDecoration(
                  color: AppTheme.white,
                  radius: 16,
                  borderWidth: 2,
                  shadowOffset: const Offset(2, 2),
                ),
                child: Column(
                  children: [
                    Text("Balandlik", style: AppTheme.bodySmall),
                    Text("${_blocks.length} / 5", style: AppTheme.headerMedium.copyWith(color: AppTheme.mandarin)),
                  ],
                ),
              ),
            ),

          // Bottom Action Drop triggers
          if (!_isCollapsed)
            Positioned(
              bottom: 30,
              left: 24,
              right: 24,
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: _dropBlock,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: AppTheme.vibrant3DBoxDecoration(
                          color: _isDropping ? Colors.grey.shade300 : AppTheme.mandarin,
                          borderColor: _isDropping ? Colors.grey : AppTheme.darkMandarin,
                          shadowColor: _isDropping ? Colors.grey.shade400 : AppTheme.darkMandarin,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          _isDropping ? "Tushmoqda..." : "Blokni tushirish!",
                          style: AppTheme.headerMedium.copyWith(color: AppTheme.white),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // Sliding Educational Panel overlay representing Amir Temur
          if (_showBriefing)
            _buildTemurBriefingOverlay(),
        ],
      ),
    );
  }

  Widget _buildTemurBriefingOverlay() {
    return AnimatedPositioned(
      duration: const Duration(milliseconds: 600),
      curve: Curves.easeOutBack,
      bottom: _showBriefing ? 0 : -500,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: AppTheme.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(32),
            topRight: Radius.circular(32),
          ),
          border: Border(
            top: BorderSide(color: AppTheme.pastelPeach, width: 4),
          ),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Pulsing Temur Avatar vector radar
              Center(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer pulse radar rings
                    _buildPulseRing(50, 0.4),
                    _buildPulseRing(70, 0.2),
                    
                    Container(
                      width: 90,
                      height: 90,
                      decoration: AppTheme.vibrant3DBoxDecoration(
                        color: AppTheme.pastelGold,
                        radius: 30,
                        borderColor: AppTheme.darkYellow,
                        shadowColor: AppTheme.yellow,
                      ),
                      alignment: Alignment.center,
                      child: const Icon(
                        Icons.shield_rounded,
                        color: AppTheme.mandarin,
                        size: 40,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              Text(
                "Amir Temur maslahati",
                style: AppTheme.headerMedium.copyWith(color: AppTheme.mandarin),
              ),
              const SizedBox(height: 10),
              
              // Educational explanation briefing
              Container(
                padding: const EdgeInsets.all(16),
                decoration: AppTheme.vibrant3DBoxDecoration(
                  color: AppTheme.porcelain,
                  radius: 20,
                  borderWidth: 2,
                  shadowOffset: const Offset(3, 3),
                ),
                child: Text(
                  "Bino barpo etishda poydevor kengligi va og‘irlik markazi (center of gravity) o‘ta muhimdir. Poydevor tor bo‘lsa, eng kichik zilzila ham binoni ag‘daradi. Amir Temur bobomiz aytganlaridek: 'Kuch — adolatda va mustahkam poydevorda!' Keling, qaytadan yanada kengroq poydevor bilan quramiz!",
                  style: AppTheme.bodyLarge.copyWith(height: 1.4),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 20),

              // Super bonus notification
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AppTheme.pastelMint,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.darkMintGreen, width: 1.5),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.star_rounded, color: AppTheme.yellow, size: 22),
                    const SizedBox(width: 6),
                    Text(
                      "+100 Super Bonus Yulduzcha! ⭐",
                      style: AppTheme.headerSmall.copyWith(color: AppTheme.darkMintGreen, fontSize: 13),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Rebuild action button
              GestureDetector(
                onTap: () {
                  widget.appState.awardStars(100);
                  _resetGame();
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: AppTheme.vibrant3DBoxDecoration(
                    color: AppTheme.mintGreen,
                    borderColor: AppTheme.darkMintGreen,
                    shadowColor: AppTheme.darkMintGreen,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    "Qaytadan qurish!",
                    style: AppTheme.headerMedium.copyWith(color: AppTheme.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPulseRing(double radiusIncrease, double opacity) {
    return Container(
      width: 90 + radiusIncrease,
      height: 90 + radiusIncrease,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: AppTheme.yellow.withAlpha((opacity * 255).round()),
          width: 2.5,
        ),
      ),
    );
  }
}
