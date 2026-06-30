import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';

// =========================================================================
// ISOMETRIC ASSETS SCHEMAS
// =========================================================================
class AuxiliaryBuilding {
  final double gridX;
  final double gridY;
  final Color color;
  final double heightMultiplier;
  double wobbleAngle = 0.0;

  AuxiliaryBuilding({
    required this.gridX,
    required this.gridY,
    required this.color,
    required this.heightMultiplier,
  });
}

class CityTree {
  final double gridX;
  final double gridY;
  double wobbleAngle = 0.0;

  CityTree({required this.gridX, required this.gridY});
}

class StackedBlock {
  final int index;
  final Color color;
  double driftX = 0.0;
  
  // Staggered collapse physics parameters
  double collapseX = 0.0;
  double collapseY = 0.0;
  double rotateX = 0.0;
  double rotateY = 0.0;
  double rotateZ = 0.0;

  StackedBlock({required this.index, required this.color, this.driftX = 0.0});
}

// =========================================================================
// ADVANCED ISOMETRIC CITY CUSTOM PAINTER (NO ASSET IMAGES)
// =========================================================================
class IsometricCityPainter extends CustomPainter {
  final List<StackedBlock> blocks;
  final List<AuxiliaryBuilding> auxBuildings;
  final List<CityTree> trees;
  final Offset centerOrigin;
  final double scaleSize;
  
  // Crane and Dropping Block Parameters
  final bool isDropping;
  final double dropProgress; // 0.0 to 1.0 (quad acceleration)
  final double craneSweepX; // current X coordinate of the crane trolley
  final Color droppingColor;

  // Active City Tilt (Minor alignment drift)
  final double citadelTiltAngle;

  IsometricCityPainter({
    required this.blocks,
    required this.auxBuildings,
    required this.trees,
    required this.centerOrigin,
    this.scaleSize = 36.0,
    required this.isDropping,
    required this.dropProgress,
    required this.craneSweepX,
    required this.droppingColor,
    required this.citadelTiltAngle,
  });

  // Project 3D Grid coordinate (X, Y, Z) to 2D Screen Offset
  Offset _project(double gx, double gy, double gz) {
    final double cos30 = math.cos(math.pi / 6); // 0.866
    final double sin30 = math.sin(math.pi / 6); // 0.5
    
    // Isometric layout equations
    final double screenX = centerOrigin.dx + (gx - gy) * scaleSize * cos30;
    final double screenY = centerOrigin.dy + (gx + gy) * scaleSize * sin30 - gz * (scaleSize * 0.95);
    return Offset(screenX, screenY);
  }

  @override
  void paint(Canvas canvas, Size size) {
    final double r = scaleSize * 0.9;
    final double h = scaleSize * 0.95;

    // 1. Draw Isometric Grid Tiles (Grass & Roads)
    for (int x = -3; x <= 3; x++) {
      for (int y = -3; y <= 3; y++) {
        // Draw standard green/porcelain base tiles
        final isRoad = (x == -1 || y == 1);
        final tileColor = isRoad ? AppTheme.porcelain : AppTheme.pastelMint;
        final borderColor = isRoad ? AppTheme.darkPurpleBorder : AppTheme.darkMintGreen;
        _drawGridTile(canvas, x.toDouble(), y.toDouble(), tileColor, borderColor);
      }
    }

    // 2. Draw Ambient Environment Trees
    for (final tree in trees) {
      final base = _project(tree.gridX, tree.gridY, 0.0);
      _drawTree(canvas, base, tree.wobbleAngle);
    }

    // 3. Draw Auxiliary Side Buildings
    for (final aux in auxBuildings) {
      final base = _project(aux.gridX, aux.gridY, 0.0);
      _drawAuxiliaryBuilding(canvas, base, r, h * aux.heightMultiplier, aux.color, aux.wobbleAngle);
    }

    // 4. Draw Center Grand Foundation Citadel (Base Platform at 0,0)
    final citadelBase = _project(0.0, 0.0, 0.0);
    _drawAuxiliaryBuilding(canvas, citadelBase, r * 1.3, h * 0.6, AppTheme.yellow, citadelTiltAngle);

    // 5. Draw Central Stacked Blocks Tower (on top of Citadel)
    double currentHeightOffset = 0.6; // Citadel height factor
    for (int i = 0; i < blocks.length; i++) {
      final b = blocks[i];
      // Target stacking center (influenced by drift & collapse physics)
      final basePos = _project(0.0, 0.0, currentHeightOffset);
      final Offset blockCenter = Offset(
        basePos.dx + b.driftX + b.collapseX,
        basePos.dy + b.collapseY,
      );

      _drawCube(
        canvas, 
        blockCenter, 
        r, 
        h, 
        b.color, 
        citadelTiltAngle + b.rotateZ, 
        b.rotateY, 
        b.rotateX,
      );
      currentHeightOffset += 1.0;
    }

    // 6. Draw active dropping block
    if (isDropping) {
      final double startY = 60.0;
      final double targetY = _project(0.0, 0.0, currentHeightOffset).dy;
      final double currentY = startY + (targetY - startY) * (dropProgress * dropProgress); // gravity acceleration
      
      // Horizontal coordinate follows the drop release X
      _drawCube(canvas, Offset(craneSweepX, currentY), r, h, droppingColor, 0.0, 0.0, 0.0);
    }

    // 7. Draw Crane Structure & Hanging Block at Top
    _drawCraneSystem(canvas, size, currentHeightOffset);
  }

  void _drawGridTile(Canvas canvas, double gx, double gy, Color color, Color border) {
    final path = Path();
    final pTop = _project(gx - 0.5, gy - 0.5, 0.0);
    final pRight = _project(gx + 0.5, gy - 0.5, 0.0);
    final pBottom = _project(gx + 0.5, gy + 0.5, 0.0);
    final pLeft = _project(gx - 0.5, gy + 0.5, 0.0);

    path.moveTo(pTop.dx, pTop.dy);
    path.lineTo(pRight.dx, pRight.dy);
    path.lineTo(pBottom.dx, pBottom.dy);
    path.lineTo(pLeft.dx, pLeft.dy);
    path.close();

    canvas.drawPath(path, Paint()..color = color..style = PaintingStyle.fill);
    canvas.drawPath(
      path, 
      Paint()
        ..color = border
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5,
    );
  }

  void _drawTree(Canvas canvas, Offset base, double wobble) {
    final trunkPath = Path();
    trunkPath.moveTo(base.dx - 3, base.dy);
    trunkPath.lineTo(base.dx - 3, base.dy - 12);
    trunkPath.lineTo(base.dx + 3, base.dy - 12);
    trunkPath.lineTo(base.dx + 3, base.dy);
    trunkPath.close();

    canvas.drawPath(trunkPath, Paint()..color = const Color(0xFF8B5A2B)); // Brown

    // Foliage (Mint Green rhombus leaf tops)
    final leafPath = Path();
    final Offset leafCenter = Offset(base.dx + math.sin(wobble) * 6, base.dy - 20);
    final double r = 12.0;

    leafPath.moveTo(leafCenter.dx, leafCenter.dy - r);
    leafPath.lineTo(leafCenter.dx + r * 1.3, leafCenter.dy);
    leafPath.lineTo(leafCenter.dx, leafCenter.dy + r);
    leafPath.lineTo(leafCenter.dx - r * 1.3, leafCenter.dy);
    leafPath.close();

    canvas.drawPath(leafPath, Paint()..color = AppTheme.mintGreen);
    canvas.drawPath(
      leafPath, 
      Paint()
        ..color = AppTheme.darkMintGreen
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0,
    );
  }

  void _drawAuxiliaryBuilding(Canvas canvas, Offset base, double r, double h, Color color, double wobble) {
    final center = Offset(base.dx + math.sin(wobble) * 10, base.dy - h);
    _drawCube(canvas, center, r, h, color, wobble, 0.0, 0.0);
  }

  void _drawCube(Canvas canvas, Offset center, double r, double h, Color color, double rotZ, double rotY, double rotX) {
    // Shaded color tokens (Top: sunlight bounce, Left: mid, Right: shadow)
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
    } else if (color == AppTheme.mintGreen) {
      topColor = const Color(0xFF56F1C5);
      leftColor = const Color(0xFF06D6A0);
      rightColor = const Color(0xFF049E75);
      borderColor = const Color(0xFF026D51);
    } else {
      // Yellow
      topColor = const Color(0xFFFFDF7A);
      leftColor = const Color(0xFFFFB627);
      rightColor = const Color(0xFFD8920E);
      borderColor = const Color(0xFF9C6500);
    }

    // Top face vertices
    Offset pTop = Offset(center.dx, center.dy - r * 0.5);
    Offset pRight = Offset(center.dx + r * 0.866, center.dy);
    Offset pBottom = Offset(center.dx, center.dy + r * 0.5);
    Offset pLeft = Offset(center.dx - r * 0.866, center.dy);

    if (rotZ != 0.0 || rotY != 0.0 || rotX != 0.0) {
      pTop = _rotateOffset3D(pTop, center, rotX, rotY, rotZ);
      pRight = _rotateOffset3D(pRight, center, rotX, rotY, rotZ);
      pBottom = _rotateOffset3D(pBottom, center, rotX, rotY, rotZ);
      pLeft = _rotateOffset3D(pLeft, center, rotX, rotY, rotZ);
    }

    final topPath = Path();
    topPath.moveTo(pTop.dx, pTop.dy);
    topPath.lineTo(pRight.dx, pRight.dy);
    topPath.lineTo(pBottom.dx, pBottom.dy);
    topPath.lineTo(pLeft.dx, pLeft.dy);
    topPath.close();

    final fill = Paint()..style = PaintingStyle.fill;
    final stroke = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    canvas.drawPath(topPath, fill..color = topColor);
    canvas.drawPath(topPath, stroke);

    // Left face vertices
    Offset pBottomLeft = Offset(pLeft.dx, pLeft.dy + h);
    Offset pBottomCenter = Offset(pBottom.dx, pBottom.dy + h);

    final leftPath = Path();
    leftPath.moveTo(pLeft.dx, pLeft.dy);
    leftPath.lineTo(pBottom.dx, pBottom.dy);
    leftPath.lineTo(pBottomCenter.dx, pBottomCenter.dy);
    leftPath.lineTo(pBottomLeft.dx, pBottomLeft.dy);
    leftPath.close();

    canvas.drawPath(leftPath, fill..color = leftColor);
    canvas.drawPath(leftPath, stroke);

    // Right face vertices
    Offset pBottomRight = Offset(pRight.dx, pRight.dy + h);

    final rightPath = Path();
    rightPath.moveTo(pRight.dx, pRight.dy);
    rightPath.lineTo(pBottom.dx, pBottom.dy);
    rightPath.lineTo(pBottomCenter.dx, pBottomCenter.dy);
    rightPath.lineTo(pBottomRight.dx, pBottomRight.dy);
    rightPath.close();

    canvas.drawPath(rightPath, fill..color = rightColor);
    canvas.drawPath(rightPath, stroke);
  }

  Offset _rotateOffset3D(Offset point, Offset center, double ax, double ay, double az) {
    double x = point.dx - center.dx;
    double y = point.dy - center.dy;

    // Roll Z
    double cosZ = math.cos(az);
    double sinZ = math.sin(az);
    double x1 = x * cosZ - y * sinZ;
    double y1 = x * sinZ + y * cosZ;

    // Pitch X
    double cosX = math.cos(ax);
    double y2 = y1 * cosX;
    
    // Yaw Y
    double cosY = math.cos(ay);
    double x3 = x1 * cosY;

    return Offset(center.dx + x3, center.dy + y2);
  }

  void _drawCraneSystem(Canvas canvas, Size size, double currentHeightOffset) {
    // 1. Crane Tower Base Support
    final pSupport = Paint()
      ..color = AppTheme.darkPurpleBorder
      ..strokeWidth = 6.0
      ..strokeCap = StrokeCap.round;

    final double craneTowerX = size.width - 40;
    
    // Vertical Crane Column
    canvas.drawLine(Offset(craneTowerX, 40), Offset(craneTowerX, size.height - 100), pSupport);
    
    // Horizontal Boom Arm
    canvas.drawLine(Offset(craneTowerX - 300, 40), Offset(craneTowerX + 30, 40), pSupport);

    // Diagonal stabilizer truss lines
    final pTruss = Paint()
      ..color = AppTheme.mandarin
      ..strokeWidth = 2.0;
    for (double x = craneTowerX - 280; x < craneTowerX; x += 40) {
      canvas.drawLine(Offset(x, 40), Offset(x + 20, 25), pTruss);
      canvas.drawLine(Offset(x + 20, 25), Offset(x + 40, 40), pTruss);
    }

    // 2. Hanging Cable Wire
    final pCable = Paint()
      ..color = AppTheme.darkPurpleBorder
      ..strokeWidth = 2.0;

    // Hanging block target line
    if (!isDropping) {
      canvas.drawLine(
        Offset(craneSweepX, 40), 
        Offset(craneSweepX, 100), 
        pCable,
      );
      
      // Draw small hook block
      _drawCube(canvas, Offset(craneSweepX, 100), 12, 10, droppingColor, 0.0, 0.0, 0.0);
    }
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
  final List<StackedBlock> _blocks = [];
  bool _isDropping = false;
  Color _currentColor = AppTheme.marineBlue;

  // Environment structures
  final List<AuxiliaryBuilding> _auxBuildings = [
    AuxiliaryBuilding(gridX: -2.0, gridY: -2.0, color: AppTheme.marineBlue, heightMultiplier: 1.2),
    AuxiliaryBuilding(gridX: 2.0, gridY: 2.0, color: AppTheme.mandarin, heightMultiplier: 0.8),
    AuxiliaryBuilding(gridX: -2.0, gridY: 2.0, color: AppTheme.yellow, heightMultiplier: 1.0),
    AuxiliaryBuilding(gridX: 2.0, gridY: -2.0, color: AppTheme.mintGreen, heightMultiplier: 1.4),
  ];

  final List<CityTree> _trees = [
    CityTree(gridX: -1.5, gridY: 0.0),
    CityTree(gridX: 1.5, gridY: 0.0),
    CityTree(gridX: 0.0, gridY: -1.5),
    CityTree(gridX: 0.0, gridY: 1.5),
  ];

  // Colors sequence
  final List<Color> _blockColors = [AppTheme.marineBlue, AppTheme.mandarin, AppTheme.yellow, AppTheme.mintGreen];
  int _colorIndex = 0;

  // Controllers
  late final AnimationController _craneController;
  late final AnimationController _dropController;
  late final AnimationController _seismicShakeController;
  late final AnimationController _disintegrateController;

  double _craneSweepX = 0.0;
  double _citadelTiltAngle = 0.0;
  double _alignmentDeviationMeter = 0.0; // 0.0 to 1.0 instability indicator
  
  bool _showBriefing = false;
  bool _isCollapsed = false;

  @override
  void initState() {
    super.initState();

    // 1. Crane Swings Oscillations (high frequency sine wave)
    _craneController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);

    _craneController.addListener(() {
      if (_isDropping || _isCollapsed) return;
      
      // Calculate sweeping coordinates
      final screenWidth = MediaQuery.of(context).size.width;
      final double centerOffset = screenWidth / 2;
      final double sweepWidth = screenWidth * 0.28;
      
      setState(() {
        _craneSweepX = centerOffset + math.sin(_craneController.value * 2 * math.pi) * sweepWidth;
      });
    });

    // 2. Gravitational Drop Kinetic Physics
    _dropController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );

    _dropController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _resolveBlockLanding();
      }
    });

    // 3. Viewport seismic shake matrix controller
    _seismicShakeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    // 4. Staggered multi-axis collapse disintegration
    _disintegrateController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );

    _disintegrateController.addListener(() {
      final double progress = _disintegrateController.value;
      setState(() {
        // Disintegrate stacked citadel blocks
        for (int i = 0; i < _blocks.length; i++) {
          final b = _blocks[i];
          final double blockStart = i * 0.12;
          if (progress > blockStart) {
            final double localProg = (progress - blockStart) / (1.0 - blockStart);
            final double normalized = math.min(1.0, math.max(0.0, localProg));

            b.collapseX = (i % 2 == 0 ? -1 : 1) * normalized * 240.0 + math.sin(normalized * 4 * math.pi) * 20;
            b.collapseY = normalized * 500.0 + (i * 25) * normalized;
            b.rotateZ = normalized * (i % 2 == 0 ? -2.2 : 2.2);
            b.rotateY = normalized * 1.2;
            b.rotateX = normalized * 0.9;
          }
        }

        // Wobble auxiliary buildings and trees
        for (final aux in _auxBuildings) {
          aux.wobbleAngle = math.sin(progress * 8 * math.pi) * 0.25 * (1.0 - progress);
        }
        for (final tree in _trees) {
          tree.wobbleAngle = math.cos(progress * 10 * math.pi) * 0.35 * (1.0 - progress);
        }
      });
    });

    _disintegrateController.addStatusListener((status) {
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
    _craneController.dispose();
    _dropController.dispose();
    _seismicShakeController.dispose();
    _disintegrateController.dispose();
    super.dispose();
  }

  void _dropHangingBlock() {
    if (_isDropping || _isCollapsed || _showBriefing) return;

    setState(() {
      _isDropping = true;
    });

    _dropController.forward(from: 0.0);
  }

  void _resolveBlockLanding() {
    final screenWidth = MediaQuery.of(context).size.width;
    final double centerOffset = screenWidth / 2;

    // Calculate alignment deviation
    final double deltaX = (_craneSweepX - centerOffset).abs();
    final bool isOffPlatform = deltaX > 60.0;

    setState(() {
      _isDropping = false;
      _dropController.reset();

      if (isOffPlatform) {
        // Severe drift: immediately triggers disaster collapse
        _alignmentDeviationMeter = 1.0;
        _blocks.add(StackedBlock(index: _blocks.length, color: _currentColor, driftX: _craneSweepX - centerOffset));
        _triggerEarthquakeDisaster();
      } else {
        // Landmark lands safely, updates drift & tilt metrics
        final double driftValue = _craneSweepX - centerOffset;
        _blocks.add(StackedBlock(index: _blocks.length, color: _currentColor, driftX: driftValue));
        
        // Increase balance instability meter
        _alignmentDeviationMeter = math.min(1.0, _alignmentDeviationMeter + (deltaX / 100.0));
        _citadelTiltAngle = driftValue * 0.0035; // Visual tilt factor

        // Recheck sequence colors
        _currentColor = _blockColors[_colorIndex];
        _colorIndex = (_colorIndex + 1) % _blockColors.length;

        // Check if tower reaches 5 blocks or balance meter overflows
        if (_blocks.length >= 5 || _alignmentDeviationMeter >= 0.85) {
          _triggerEarthquakeDisaster();
        }
      }
    });
  }

  void _triggerEarthquakeDisaster() {
    _seismicShakeController.forward(from: 0.0).then((_) {
      _disintegrateController.forward(from: 0.0);
    });
  }

  void _rebuildEmpire() {
    setState(() {
      _blocks.clear();
      _isDropping = false;
      _isCollapsed = false;
      _showBriefing = false;
      _colorIndex = 0;
      _alignmentDeviationMeter = 0.0;
      _citadelTiltAngle = 0.0;
      
      // Reset environment wobbles
      for (final aux in _auxBuildings) {
        aux.wobbleAngle = 0.0;
      }
      for (final tree in _trees) {
        tree.wobbleAngle = 0.0;
      }

      _craneController.repeat(reverse: true);
      _dropController.reset();
      _seismicShakeController.reset();
      _disintegrateController.reset();
    });
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    
    // Set first crane trolley sweep location if not initialized
    if (_craneSweepX == 0.0) {
      _craneSweepX = screenWidth / 2;
    }

    // Viewport Earthquake Matrix Shaker ( chaotical Matrix4 translations & tilts)
    final shakeAnim = AnimatedBuilder(
      animation: _seismicShakeController,
      builder: (context, child) {
        final double progress = _seismicShakeController.value;
        if (progress > 0.0 && progress < 1.0) {
          final double dx = math.sin(progress * 15 * math.pi) * 14 * (1.0 - progress);
          final double dy = math.cos(progress * 12 * math.pi) * 10 * (1.0 - progress);
          final double scale = 1.0 - math.sin(progress * math.pi) * 0.03;
          final double tiltAngle = math.sin(progress * 6 * math.pi) * 0.015 * (1.0 - progress);

          return Transform.translate(
            offset: Offset(dx, dy),
            child: Transform.rotate(
              angle: tiltAngle,
              alignment: Alignment.center,
              child: Transform.scale(
                scale: scale,
                alignment: Alignment.center,
                child: child,
              ),
            ),
          );
        }
        return child!;
      },
      child: Stack(
        children: [
          // Background Tile layout grid canvas
          Positioned.fill(
            child: CustomPaint(
              painter: IsometricCityPainter(
                blocks: _blocks,
                auxBuildings: _auxBuildings,
                trees: _trees,
                centerOrigin: Offset(screenWidth / 2, MediaQuery.of(context).size.height * 0.62),
                scaleSize: 38.0,
                isDropping: _isDropping,
                dropProgress: _dropController.value,
                craneSweepX: _craneSweepX,
                droppingColor: _currentColor,
                citadelTiltAngle: _citadelTiltAngle,
              ),
            ),
          ),
          
          // Warnings Banner
          if (_seismicShakeController.value > 0.0 && _seismicShakeController.value < 1.0)
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
                      Text("SEYSMIK SHOKWAVE TOWER COLLAPSE!", style: AppTheme.headerSmall.copyWith(color: AppTheme.appleRed)),
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
        title: Text("3D Arxitektor: Seysmik minoralar", style: AppTheme.headerMedium.copyWith(fontSize: 16)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.darkPurple),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Stack(
        children: [
          // Shaking view
          Positioned.fill(child: shakeAnim),

          // Sidebar Instability balance meter & height tracker
          if (!_isCollapsed)
            Positioned(
              left: 16,
              top: 24,
              child: Column(
                children: [
                  // Height
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: AppTheme.vibrant3DBoxDecoration(
                      color: AppTheme.white,
                      radius: 16,
                      borderWidth: 2,
                      shadowOffset: const Offset(2, 2),
                    ),
                    child: Column(
                      children: [
                        Text("Minoralar", style: AppTheme.bodySmall),
                        Text("${_blocks.length} / 5", style: AppTheme.headerMedium.copyWith(color: AppTheme.marineBlue)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  
                  // Instability Balance Gauge
                  Container(
                    padding: const EdgeInsets.all(12),
                    width: 76,
                    decoration: AppTheme.vibrant3DBoxDecoration(
                      color: AppTheme.white,
                      radius: 16,
                      borderWidth: 2,
                      shadowOffset: const Offset(2, 2),
                    ),
                    child: Column(
                      children: [
                        Text("Og‘ish", style: AppTheme.bodySmall.copyWith(fontSize: 9)),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            width: 14,
                            height: 80,
                            color: AppTheme.porcelain,
                            child: Stack(
                              alignment: Alignment.bottomCenter,
                              children: [
                                FractionallySizedBox(
                                  heightFactor: _alignmentDeviationMeter,
                                  child: Container(
                                    color: _alignmentDeviationMeter > 0.65 ? AppTheme.appleRed : AppTheme.mandarin,
                                  ),
                                ),
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

          // Tap to Release Block action trigger
          if (!_isCollapsed)
            Positioned(
              bottom: 30,
              left: 24,
              right: 24,
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: _dropHangingBlock,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: AppTheme.vibrant3DBoxDecoration(
                          color: _isDropping ? Colors.grey.shade300 : AppTheme.mandarin,
                          borderColor: _isDropping ? Colors.grey : AppTheme.darkMandarin,
                          shadowColor: _isDropping ? Colors.grey.shade400 : AppTheme.darkMandarin,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          _isDropping ? "BLOK TUSHMOQDA..." : "BLOKNI QO‘YIB YUBORISH!",
                          style: AppTheme.headerMedium.copyWith(color: AppTheme.white),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // Dialog slide-up panel for Temur Briefing
          if (_showBriefing)
            _buildTemurBriefingOverlay(),
        ],
      ),
    );
  }

  Widget _buildTemurBriefingOverlay() {
    return AnimatedPositioned(
      duration: const Duration(milliseconds: 650),
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
              // Pulsing Temur Avatar radar container
              Center(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    _buildPulseRing(46, 0.4),
                    _buildPulseRing(66, 0.2),
                    
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
                "Temur Tuzuklari: Seysmik Saboq",
                style: AppTheme.headerMedium.copyWith(color: AppTheme.mandarin, fontSize: 18),
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
                  "Bino barpo etishda poydevor kengligi va og‘irlik markazi (center of gravity) o‘ta muhimdir. Agar minoralar poydevor markazidan og‘ib ketsa, eng kichik silzilalar ham uni ag‘daradi. Biz Samarqandda qurdirtirgan koshonalar mustahkam poydevorli va seysmik yuklarga chidamli qilib ishlangan. 'Kuch mustahkam poydevor va adolatdadir!' Minorani qayta tiklab, yana yulduzchalar yutib olamiz!",
                  style: AppTheme.bodyLarge.copyWith(height: 1.45, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 20),

              // Super bonus stars
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

              // Rebuild empire action button
              GestureDetector(
                onTap: () {
                  widget.appState.awardStars(100);
                  _rebuildEmpire();
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
                    "Saltanatni tiklash! (Rebuild)",
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
