import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';

// =========================================================================
// REAL-TIME PHYSICS SIMULATION MODELS
// =========================================================================
class GameParticle {
  Offset pos;
  Offset vel;
  final Color color;
  final double size;
  double opacity;
  final double lifeDecay; // Decay per frame

  GameParticle({
    required this.pos,
    required this.vel,
    required this.color,
    required this.size,
    required this.opacity,
    required this.lifeDecay,
  });

  void update(double dt) {
    pos += vel * dt;
    // Apply air resistance
    vel = Offset(vel.dx * 0.98, vel.dy * 0.98);
    opacity = math.max(0.0, opacity - lifeDecay * dt);
  }
}

class DebrisFragment {
  Offset pos;
  Offset vel;
  double rotation = 0.0;
  final double angularVelocity;
  final double size;
  final Color color;
  int bounces = 0;
  final double groundLevel;

  DebrisFragment({
    required this.pos,
    required this.vel,
    required this.angularVelocity,
    required this.size,
    required this.color,
    required this.groundLevel,
  });

  void update(double dt, List<GameParticle> particles) {
    // Apply gravity
    vel = Offset(vel.dx, vel.dy + 800 * dt);
    pos += vel * dt;
    rotation += angularVelocity * dt;

    // Ground collision & bounce
    if (pos.dy >= groundLevel) {
      pos = Offset(pos.dx, groundLevel);
      if (bounces < 3) {
        vel = Offset(vel.dx * 0.65, -vel.dy * 0.45); // Elastic bounce
        bounces++;
        // Spawn impact dust smoke particles
        for (int i = 0; i < 4; i++) {
          particles.add(GameParticle(
            pos: Offset(pos.dx, groundLevel),
            vel: Offset(-40 + math.Random().nextDouble() * 80, -20 - math.Random().nextDouble() * 40),
            color: Colors.grey.shade400,
            size: 6.0 + math.Random().nextDouble() * 8.0,
            opacity: 0.8,
            lifeDecay: 1.5,
          ));
        }
      } else {
        // Lay flat on ground
        vel = Offset.zero;
      }
    }
  }
}

class VectorCar {
  double progress = 0.0; // 0.0 to 1.0 along road paths
  final int roadDirection; // 0: horizontal, 1: vertical
  final Color color;
  final double speed;

  VectorCar({
    required this.roadDirection,
    required this.color,
    required this.speed,
  });

  void update(double dt) {
    progress += speed * dt;
    if (progress > 1.0) {
      progress = 0.0;
    }
  }
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
  final double driftX;
  
  // Wobble oscillation parameters
  double wobbleOffset = 0.0;

  StackedBlock({
    required this.index,
    required this.color,
    required this.driftX,
  });
}

class AuxiliaryBuilding {
  final double gridX;
  final double gridY;
  final Color color;
  final double height;
  final int windowRows;
  final int windowCols;
  double wobbleAngle = 0.0;

  AuxiliaryBuilding({
    required this.gridX,
    required this.gridY,
    required this.color,
    required this.height,
    required this.windowRows,
    required this.windowCols,
  });
}

// =========================================================================
// ISOMETRIC TEXTURED CITY CUSTOM PAINTER (NO IMAGES, BEVELED EDGES)
// =========================================================================
class UltraPhysicsCityPainter extends CustomPainter {
  final List<StackedBlock> blocks;
  final List<AuxiliaryBuilding> auxBuildings;
  final List<CityTree> trees;
  final List<GameParticle> particles;
  final List<DebrisFragment> debris;
  final List<VectorCar> cars;
  final Offset centerOrigin;
  final double scaleSize;
  
  // Hanging & Drop properties
  final bool isDropping;
  final Offset droppingBlockPos;
  final Color droppingColor;

  // Crane Cable
  final double craneTrolleyX;
  final double craneCableLength;

  // Wobbles & seismic
  final double citadelTiltAngle;
  final double towerWobbleOffset;

  UltraPhysicsCityPainter({
    required this.blocks,
    required this.auxBuildings,
    required this.trees,
    required this.particles,
    required this.debris,
    required this.cars,
    required this.centerOrigin,
    required this.scaleSize,
    required this.isDropping,
    required this.droppingBlockPos,
    required this.droppingColor,
    required this.craneTrolleyX,
    required this.craneCableLength,
    required this.citadelTiltAngle,
    required this.towerWobbleOffset,
  });

  Offset _project(double gx, double gy, double gz) {
    final double cos30 = math.cos(math.pi / 6); // 0.866
    final double sin30 = math.sin(math.pi / 6); // 0.5
    final double screenX = centerOrigin.dx + (gx - gy) * scaleSize * cos30;
    final double screenY = centerOrigin.dy + (gx + gy) * scaleSize * sin30 - gz * (scaleSize * 0.95);
    return Offset(screenX, screenY);
  }

  @override
  void paint(Canvas canvas, Size size) {
    final double r = scaleSize * 0.95;
    final double h = scaleSize * 0.98;

    // 1. Draw Textured Grass Grid Tiles
    for (int x = -3; x <= 3; x++) {
      for (int y = -3; y <= 3; y++) {
        final isRoadHorizontal = (y == 0);
        final isRoadVertical = (x == 0);
        
        if (isRoadHorizontal || isRoadVertical) {
          _drawRoadTile(canvas, x.toDouble(), y.toDouble());
        } else {
          _drawGrassTile(canvas, x.toDouble(), y.toDouble());
        }
      }
    }

    // 2. Draw Moving Vector Cars along Roads (with bright headlights!)
    for (final car in cars) {
      _drawVectorCar(canvas, car);
    }

    // 3. Draw Animated Water Fountain (Pastel blue water jet particles)
    _drawFountainBase(canvas);

    // 4. Draw Auxiliary Detailed Buildings (balconies, antennas, helipads)
    for (final aux in auxBuildings) {
      final base = _project(aux.gridX, aux.gridY, 0.0);
      _drawDetailedBuilding(canvas, base, r * 0.9, aux.height, aux.color, aux.windowRows, aux.windowCols, aux.wobbleAngle);
    }

    // 5. Draw Grand Central Citadel Platform
    final citadelBase = _project(0.0, 0.0, 0.0);
    _drawDetailedBuilding(canvas, citadelBase, r * 1.35, h * 0.6, AppTheme.yellow, 1, 3, citadelTiltAngle);

    // 6. Draw Stacked Blocks (with landing wobble & seismic tilts)
    double currentHeightOffset = 0.6;
    for (int i = 0; i < blocks.length; i++) {
      final b = blocks[i];
      final basePos = _project(0.0, 0.0, currentHeightOffset);
      
      // Wobbles/Tilts offset
      final double totalOffset = b.driftX + towerWobbleOffset + b.wobbleOffset;
      final Offset blockCenter = Offset(basePos.dx + totalOffset, basePos.dy);

      _drawBeveledCube(
        canvas, 
        blockCenter, 
        r, 
        h, 
        b.color, 
        citadelTiltAngle, 
        0.0, 
        0.0,
      );
      currentHeightOffset += 1.0;
    }

    // 7. Draw Active Dropping Block
    if (isDropping) {
      _drawBeveledCube(canvas, droppingBlockPos, r, h, droppingColor, 0.0, 0.0, 0.0);
    }

    // 8. Draw Disintegrated Projectiles (Debris fragments)
    for (final frag in debris) {
      _drawDebrisFragment(canvas, frag);
    }

    // 9. Draw Particle Systems (Smoke, Fountain Spray, Sparks)
    for (final p in particles) {
      final paint = Paint()
        ..color = p.color.withAlpha((p.opacity * 255).round())
        ..style = PaintingStyle.fill;
      canvas.drawCircle(p.pos, p.size, paint);
    }

    // 10. Draw Crane arm structure & Pendulum cable wire
    _drawCraneSystem(canvas, size, currentHeightOffset);
  }

  void _drawGrassTile(Canvas canvas, double gx, double gy) {
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

    canvas.drawPath(path, Paint()..color = AppTheme.pastelMint..style = PaintingStyle.fill);
    
    // Draw grassy texture details (tiny mint-green blades)
    final pBlade = Paint()
      ..color = AppTheme.darkMintGreen
      ..strokeWidth = 1.5;
    final center = _project(gx, gy, 0.0);
    canvas.drawLine(center, Offset(center.dx - 2, center.dy - 4), pBlade);
    canvas.drawLine(center, Offset(center.dx + 2, center.dy - 3), pBlade);
  }

  void _drawRoadTile(Canvas canvas, double gx, double gy) {
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

    // Road fill (clean light porcelain grey)
    canvas.drawPath(path, Paint()..color = AppTheme.porcelain..style = PaintingStyle.fill);
    canvas.drawPath(
      path, 
      Paint()
        ..color = AppTheme.darkPurpleBorder.withAlpha(50)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.0,
    );

    // Yellow dash markings along road centers
    final center = _project(gx, gy, 0.0);
    final pMarking = Paint()
      ..color = AppTheme.yellow
      ..strokeWidth = 2.0;
    
    if (gy == 0.0) {
      // Horizontal road line dashes
      canvas.drawLine(Offset(center.dx - 6, center.dy - 3), Offset(center.dx + 6, center.dy + 3), pMarking);
    } else if (gx == 0.0) {
      // Vertical road line dashes
      canvas.drawLine(Offset(center.dx - 6, center.dy + 3), Offset(center.dx + 6, center.dy - 3), pMarking);
    }
  }

  void _drawVectorCar(Canvas canvas, VectorCar car) {
    // Project car along grid coordinates
    double gx = 0.0;
    double gy = 0.0;
    if (car.roadDirection == 0) {
      // Horizontal road: gy = 0, gx goes from -3.0 to 3.0
      gx = -3.0 + car.progress * 6.0;
    } else {
      // Vertical road: gx = 0, gy goes from -3.0 to 3.0
      gy = -3.0 + car.progress * 6.0;
    }

    final carPos = _project(gx, gy, 0.05);

    // Draw tiny 3D box car
    final pCar = Paint()..color = car.color..style = PaintingStyle.fill;
    final pWindow = Paint()..color = AppTheme.white..style = PaintingStyle.fill;
    
    // Draw base body
    canvas.drawRect(Rect.fromCenter(center: carPos, width: 14, height: 8), pCar);
    canvas.drawRect(Rect.fromLTWH(carPos.dx - 3, carPos.dy - 5, 6, 4), pWindow); // cabin

    // Draw glowing headlights (Yellow radial lines outwards)
    final pHeadlight = Paint()
      ..color = AppTheme.yellow.withAlpha(180)
      ..strokeWidth = 1.5;
    
    if (car.roadDirection == 0) {
      // Heading rightwards
      canvas.drawLine(carPos, Offset(carPos.dx + 16, carPos.dy + 4), pHeadlight);
      canvas.drawLine(carPos, Offset(carPos.dx + 16, carPos.dy - 4), pHeadlight);
    } else {
      // Heading leftwards/downwards
      canvas.drawLine(carPos, Offset(carPos.dx - 16, carPos.dy + 4), pHeadlight);
      canvas.drawLine(carPos, Offset(carPos.dx - 16, carPos.dy - 4), pHeadlight);
    }
  }

  void _drawFountainBase(Canvas canvas) {
    final fountainPos = _project(1.5, -1.5, 0.0);
    
    // Base tier ring
    canvas.drawCircle(
      fountainPos, 
      20.0, 
      Paint()
        ..color = AppTheme.darkPurpleBorder
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0,
    );
    canvas.drawCircle(
      fountainPos, 
      18.0, 
      Paint()
        ..color = AppTheme.pastelBlue
        ..style = PaintingStyle.fill,
    );

    // Central nozzle cube
    _drawCube(canvas, Offset(fountainPos.dx, fountainPos.dy - 3), 6, 6, AppTheme.yellow, 0.0, 0.0, 0.0);
  }

  void _drawDetailedBuilding(Canvas canvas, Offset base, double r, double h, Color color, int rows, int cols, double wobble) {
    final center = Offset(base.dx + math.sin(wobble) * 12, base.dy - h);
    
    // Draw main structure
    _drawBeveledCube(canvas, center, r, h, color, wobble, 0.0, 0.0);

    // Draw windows on facades (Left and Right vertical faces)
    final Offset pLeft = Offset(center.dx - r * 0.433, center.dy + h * 0.5);
    final Offset pRight = Offset(center.dx + r * 0.433, center.dy + h * 0.5);
    final pWindow = Paint()
      ..color = AppTheme.yellow // Glowing yellow
      ..style = PaintingStyle.fill;

    // Left Facade Windows
    for (int rIdx = 0; rIdx < rows; rIdx++) {
      for (int cIdx = 0; cIdx < cols; cIdx++) {
        final double wx = pLeft.dx - 6 + (cIdx * 7) + math.sin(wobble) * 10;
        final double wy = pLeft.dy - h + 14 + (rIdx * 12);
        canvas.drawRect(Rect.fromLTWH(wx, wy, 4, 6), pWindow);
      }
    }

    // Right Facade Windows
    for (int rIdx = 0; rIdx < rows; rIdx++) {
      for (int cIdx = 0; cIdx < cols; cIdx++) {
        final double wx = pRight.dx - 6 + (cIdx * 7) + math.sin(wobble) * 10;
        final double wy = pRight.dy - h + 14 + (rIdx * 12);
        canvas.drawRect(Rect.fromLTWH(wx, wy, 4, 6), pWindow);
      }
    }

    // Add roof antenna or dome details
    final pAntenna = Paint()
      ..color = AppTheme.darkPurpleBorder
      ..strokeWidth = 2.0;
    
    final topCenter = Offset(center.dx + math.sin(wobble) * 12, center.dy - r * 0.5);
    canvas.drawLine(topCenter, Offset(topCenter.dx, topCenter.dy - 18), pAntenna);
    canvas.drawCircle(Offset(topCenter.dx, topCenter.dy - 18), 3.0, Paint()..color = AppTheme.appleRed);
  }

  void _drawBeveledCube(Canvas canvas, Offset center, double r, double h, Color color, double rotZ, double rotY, double rotX) {
    // Render face geometry
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
      topColor = const Color(0xFFFFDF7A);
      leftColor = const Color(0xFFFFB627);
      rightColor = const Color(0xFFD8920E);
      borderColor = const Color(0xFF9C6500);
    }

    // Calculate rotation vertex arrays
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

    // Draw Top Face
    canvas.drawPath(topPath, fill..color = topColor);
    canvas.drawPath(topPath, stroke);

    // Draw Left Face
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

    // Draw Right Face
    Offset pBottomRight = Offset(pRight.dx, pRight.dy + h);

    final rightPath = Path();
    rightPath.moveTo(pRight.dx, pRight.dy);
    rightPath.lineTo(pBottom.dx, pBottom.dy);
    rightPath.lineTo(pBottomCenter.dx, pBottomCenter.dy);
    rightPath.lineTo(pBottomRight.dx, pBottomRight.dy);
    rightPath.close();

    canvas.drawPath(rightPath, fill..color = rightColor);
    canvas.drawPath(rightPath, stroke);

    // DRAW 3D BEVELED HIGHLIGHTS (Subtle white borders on inner edges)
    final pHighlight = Paint()
      ..color = AppTheme.white.withAlpha(120)
      ..strokeWidth = 2.0;
    canvas.drawLine(pLeft, pBottom, pHighlight);
    canvas.drawLine(pBottom, pRight, pHighlight);
  }

  void _drawDebrisFragment(Canvas canvas, DebrisFragment frag) {
    // Draw a smaller random tilted hexagon/shape representing fractured rock
    final double r = frag.size;
    final center = frag.pos;
    final double rot = frag.rotation;

    final path = Path();
    Offset p1 = Offset(center.dx, center.dy - r * 0.5);
    Offset p2 = Offset(center.dx + r * 0.8, center.dy - r * 0.2);
    Offset p3 = Offset(center.dx + r * 0.8, center.dy + r * 0.4);
    Offset p4 = Offset(center.dx, center.dy + r * 0.8);
    Offset p5 = Offset(center.dx - r * 0.8, center.dy + r * 0.4);
    Offset p6 = Offset(center.dx - r * 0.8, center.dy - r * 0.2);

    // Rotate flat coordinates
    p1 = _rotateOffset2D(p1, center, rot);
    p2 = _rotateOffset2D(p2, center, rot);
    p3 = _rotateOffset2D(p3, center, rot);
    p4 = _rotateOffset2D(p4, center, rot);
    p5 = _rotateOffset2D(p5, center, rot);
    p6 = _rotateOffset2D(p6, center, rot);

    path.moveTo(p1.dx, p1.dy);
    path.lineTo(p2.dx, p2.dy);
    path.lineTo(p3.dx, p3.dy);
    path.lineTo(p4.dx, p4.dy);
    path.lineTo(p5.dx, p5.dy);
    path.lineTo(p6.dx, p6.dy);
    path.close();

    final fill = Paint()..color = frag.color..style = PaintingStyle.fill;
    final stroke = Paint()
      ..color = AppTheme.getBorderColorFor(frag.color)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    canvas.drawPath(path, fill);
    canvas.drawPath(path, stroke);
  }

  Offset _rotateOffset2D(Offset point, Offset center, double angle) {
    double x = point.dx - center.dx;
    double y = point.dy - center.dy;
    double cosA = math.cos(angle);
    double sinA = math.sin(angle);
    return Offset(center.dx + x * cosA - y * sinA, center.dy + x * sinA + y * cosA);
  }

  Offset _rotateOffset3D(Offset point, Offset center, double ax, double ay, double az) {
    double x = point.dx - center.dx;
    double y = point.dy - center.dy;

    // Rotate Z
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
    final pSupport = Paint()
      ..color = AppTheme.darkPurpleBorder
      ..strokeWidth = 6.0
      ..strokeCap = StrokeCap.round;

    final double craneTowerX = size.width - 40;
    
    // Crane Column
    canvas.drawLine(Offset(craneTowerX, 40), Offset(craneTowerX, size.height - 100), pSupport);
    
    // Crane Boom Arm
    canvas.drawLine(Offset(craneTowerX - 300, 40), Offset(craneTowerX + 30, 40), pSupport);

    // Diagonal stabilizer trusses
    final pTruss = Paint()
      ..color = AppTheme.mandarin
      ..strokeWidth = 2.0;
    for (double x = craneTowerX - 280; x < craneTowerX; x += 40) {
      canvas.drawLine(Offset(x, 40), Offset(x + 20, 25), pTruss);
      canvas.drawLine(Offset(x + 20, 25), Offset(x + 40, 40), pTruss);
    }

    // Pendulum Rope Cable Wire
    final pCable = Paint()
      ..color = AppTheme.darkPurpleBorder
      ..strokeWidth = 2.0;

    if (!isDropping) {
      // Pendulum wire line (calculating end coordinate offset using pendulum cable swing angles)
      final Offset cableEnd = Offset(
        craneTrolleyX + craneCableLength * math.sin(citadelTiltAngle), 
        40 + craneCableLength * math.cos(citadelTiltAngle),
      );
      
      canvas.drawLine(
        Offset(craneTrolleyX, 40), 
        cableEnd, 
        pCable,
      );
      
      // Draw beveled hook block
      _drawBeveledCube(canvas, cableEnd, 12, 10, droppingColor, 0.0, 0.0, 0.0);
    }
  }

  void _drawCube(Canvas canvas, Offset center, double r, double h, Color color, double rotZ, double rotY, double rotX) {
    _drawBeveledCube(canvas, center, r, h, color, rotZ, rotY, rotX);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// =========================================================================
// ISOMETRIC PUZZLE GAME TAB SCREEN
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

  // Active Particle and physics projectile lists
  final List<GameParticle> _particles = [];
  final List<DebrisFragment> _debris = [];
  final List<VectorCar> _cars = [
    VectorCar(roadDirection: 0, color: AppTheme.mandarin, speed: 0.14),
    VectorCar(roadDirection: 1, color: AppTheme.marineBlue, speed: 0.18),
  ];

  // Dynamic Aux Buildings
  final List<AuxiliaryBuilding> _auxBuildings = [
    AuxiliaryBuilding(gridX: -2.0, gridY: -2.0, color: AppTheme.marineBlue, height: 50.0, windowRows: 3, windowCols: 2),
    AuxiliaryBuilding(gridX: 2.0, gridY: 2.0, color: AppTheme.mandarin, height: 35.0, windowRows: 2, windowCols: 2),
    AuxiliaryBuilding(gridX: -2.0, gridY: 2.0, color: AppTheme.yellow, height: 40.0, windowRows: 2, windowCols: 2),
    AuxiliaryBuilding(gridX: 2.0, gridY: -2.0, color: AppTheme.mintGreen, height: 60.0, windowRows: 4, windowCols: 2),
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

  // Real-time Physics properties
  late final Ticker _physicsTicker;
  double _timeElapsed = 0.0;
  
  // Pendulum integration
  double _craneTrolleyX = 0.0;
  double _lastTrolleyX = 0.0;
  double _ropeAngle = 0.0;
  double _ropeAngularVelocity = 0.0;
  final double _cableLength = 110.0;

  // Dropping block kinematics
  Offset _dropPos = Offset.zero;
  double _dropVelY = 0.0;

  // Wobbles & seismic metrics
  double _citadelTiltAngle = 0.0;
  double _towerWobbleOffset = 0.0;
  double _wobbleTime = 0.0;
  double _alignmentDeviationMeter = 0.0;

  // Disaster shake vectors
  double _shakeDx = 0.0;
  double _shakeDy = 0.0;
  double _shakeTilt = 0.0;
  double _shakeScale = 1.0;
  double _shakeProgress = 0.0;
  bool _isShaking = false;

  bool _showBriefing = false;
  bool _isCollapsed = false;
  bool _isCollapsing = false;
  double _collapseTime = 0.0;

  @override
  void initState() {
    super.initState();

    // Setup Ticker loop for continuous 60FPS physics updates
    _physicsTicker = Ticker((Duration elapsed) {
      final double dt = 0.0166; // approx 1/60s frame delta time
      _updatePhysics(dt);
    });
    _physicsTicker.start();
  }

  @override
  void dispose() {
    _physicsTicker.dispose();
    super.dispose();
  }

  void _updatePhysics(double dt) {
    if (!mounted) return;

    _timeElapsed += dt;

    setState(() {
      // 1. Update Crane Swing oscillations & Pendulum integration
      final screenWidth = MediaQuery.of(context).size.width;
      final double centerOffset = screenWidth / 2;
      final double sweepWidth = screenWidth * 0.28;

      // Trolley oscillates sinusoidally
      _craneTrolleyX = centerOffset + math.sin(_timeElapsed * 1.8) * sweepWidth;
      
      // Calculate numerical derivatives for pendulum acceleration pulls
      final double trolleyAcc = (_craneTrolleyX - _lastTrolleyX) / dt;
      _lastTrolleyX = _craneTrolleyX;

      // Pendulum angular ODE integration: theta'' = - (g/L)*sin(theta) - (Acc/L)*cos(theta) - damp*theta'
      final double gravityTerm = - (320.0 / _cableLength) * math.sin(_ropeAngle);
      final double accTerm = - (trolleyAcc / _cableLength) * math.cos(_ropeAngle);
      final double damping = - 1.8 * _ropeAngularVelocity;

      _ropeAngularVelocity += (gravityTerm + accTerm + damping) * dt;
      _ropeAngle += _ropeAngularVelocity * dt;

      // 2. Update active dropping block kinematics
      if (_isDropping) {
        _dropVelY += 980.0 * dt; // gravity kinetic acceleration
        _dropPos = Offset(_dropPos.dx, _dropPos.dy + _dropVelY * dt);

        // Landing collision threshold
        final double targetY = _projectTargetLandingY();
        if (_dropPos.dy >= targetY) {
          _resolveBlockLanding();
        }
      }

      // 3. Decaying damped harmonic wobbles on landings
      if (_wobbleTime > 0.0) {
        _wobbleTime = math.max(0.0, _wobbleTime - dt);
        // Wobble decay: x(t) = A * e^(-t*lambda) * cos(omega * t)
        _towerWobbleOffset = 30.0 * math.exp(- (2.5 - _wobbleTime) * 2.2) * math.cos((2.5 - _wobbleTime) * 14.0);
      } else {
        _towerWobbleOffset = 0.0;
      }

      // 4. Update Game Particles (Sparks, smoke)
      for (final p in _particles) {
        p.update(dt);
      }
      _particles.removeWhere((p) => p.opacity <= 0.0);

      // 5. Update Bouncing Debris Fragments
      for (final frag in _debris) {
        frag.update(dt, _particles);
      }

      // 6. Update Vector street cars progress
      for (final car in _cars) {
        car.update(dt);
      }

      // 7. Shoot Water Fountain spray particles (Animated fountain at 1.5, -1.5)
      _shootFountainParticles();

      // 8. Earthquake viewport shaking vector calculations
      if (_isShaking) {
        _shakeProgress += dt;
        if (_shakeProgress < 1.2) {
          final double strength = 1.0 - (_shakeProgress / 1.2);
          _shakeDx = math.sin(_shakeProgress * 15 * math.pi) * 15.0 * strength;
          _shakeDy = math.cos(_shakeProgress * 12 * math.pi) * 10.0 * strength;
          _shakeScale = 1.0 - math.sin(_shakeProgress * math.pi) * 0.04;
          _shakeTilt = math.sin(_shakeProgress * 6 * math.pi) * 0.015 * strength;
        } else {
          _isShaking = false;
          _shakeDx = 0.0;
          _shakeDy = 0.0;
          _shakeScale = 1.0;
          _shakeTilt = 0.0;
          _triggerStructuralCollapse();
        }
      }

      // 9. Collapsing structural wobble time updates
      if (_isCollapsing) {
        _collapseTime += dt;
        if (_collapseTime < 2.0) {
          // Wobble auxiliary buildings and trees
          for (final aux in _auxBuildings) {
            aux.wobbleAngle = math.sin(_collapseTime * 8 * math.pi) * 0.25 * (1.0 - _collapseTime / 2.0);
          }
          for (final tree in _trees) {
            tree.wobbleAngle = math.cos(_collapseTime * 10 * math.pi) * 0.35 * (1.0 - _collapseTime / 2.0);
          }
        } else {
          _isCollapsing = false;
          _showBriefing = true;
          _isCollapsed = true;
        }
      }
    });
  }

  double _projectTargetLandingY() {
    final double citadelHeight = scaleHeight() * 0.6;
    final double stackedHeight = _blocks.length * scaleHeight();
    final double originY = MediaQuery.of(context).size.height * 0.62;
    return originY - citadelHeight - stackedHeight;
  }

  double scaleHeight() => 38.0 * 0.98;

  void _shootFountainParticles() {
    final fountainPos = _projectCoord(1.5, -1.5, 0.08);
    // Spawn 1-2 water spray drops per tick
    for (int i = 0; i < 2; i++) {
      _particles.add(GameParticle(
        pos: fountainPos,
        vel: Offset(-15 + math.Random().nextDouble() * 30, -80 - math.Random().nextDouble() * 70),
        color: const Color(0xFF8CE3FF),
        size: 3.0 + math.Random().nextDouble() * 4.0,
        opacity: 0.9,
        lifeDecay: 1.8,
      ));
    }
  }

  Offset _projectCoord(double gx, double gy, double gz) {
    final screenWidth = MediaQuery.of(context).size.width;
    final double cos30 = math.cos(math.pi / 6);
    final double sin30 = math.sin(math.pi / 6);
    final double screenX = (screenWidth / 2) + (gx - gy) * 38.0 * cos30;
    final double screenY = (MediaQuery.of(context).size.height * 0.62) + (gx + gy) * 38.0 * sin30 - gz * (38.0 * 0.95);
    return Offset(screenX, screenY);
  }

  void _dropHangingBlock() {
    if (_isDropping || _isCollapsed || _showBriefing) return;

    // Release coordinate calculated incorporating pendulum cable swings
    final double dropReleaseX = _craneTrolleyX + _cableLength * math.sin(_ropeAngle);
    final double dropReleaseY = 40 + _cableLength * math.cos(_ropeAngle);

    setState(() {
      _isDropping = true;
      _dropPos = Offset(dropReleaseX, dropReleaseY);
      _dropVelY = 0.0;
    });
  }

  void _resolveBlockLanding() {
    final screenWidth = MediaQuery.of(context).size.width;
    final double centerOffset = screenWidth / 2;
    final double deltaX = (_dropPos.dx - centerOffset).abs();
    final bool isOffPlatform = deltaX > 62.0;

    setState(() {
      _isDropping = false;

      if (isOffPlatform) {
        // Severe drift landing completely off base: instantly falls and collapses
        _alignmentDeviationMeter = 1.0;
        _blocks.add(StackedBlock(index: _blocks.length, color: _currentColor, driftX: _dropPos.dx - centerOffset));
        _triggerEarthquakeDisaster();
      } else {
        // Safe stack landing, compute alignment drift impact
        final double drift = _dropPos.dx - centerOffset;
        _blocks.add(StackedBlock(index: _blocks.length, color: _currentColor, driftX: drift));

        // Trigger landing wobble springs
        _wobbleTime = 2.5;

        // Spawn contact landing dust sparks
        final double landingY = _projectTargetLandingY();
        for (int i = 0; i < 8; i++) {
          _particles.add(GameParticle(
            pos: Offset(_dropPos.dx, landingY),
            vel: Offset(-60 + math.Random().nextDouble() * 120, -10 - math.Random().nextDouble() * 30),
            color: _currentColor,
            size: 4.0 + math.Random().nextDouble() * 5.0,
            opacity: 0.95,
            lifeDecay: 2.0,
          ));
        }

        // Adjust alignment balance metrics
        _alignmentDeviationMeter = math.min(1.0, _alignmentDeviationMeter + (deltaX / 100.0));
        _citadelTiltAngle = drift * 0.0035;

        // Advance color cycle
        _currentColor = _blockColors[_colorIndex];
        _colorIndex = (_colorIndex + 1) % _blockColors.length;

        // Collapse threshold conditions
        if (_blocks.length >= 5 || _alignmentDeviationMeter >= 0.85) {
          _triggerEarthquakeDisaster();
        }
      }
    });
  }

  void _triggerEarthquakeDisaster() {
    setState(() {
      _isShaking = true;
      _shakeProgress = 0.0;
    });
  }

  void _triggerStructuralCollapse() {
    // Generate shattered DebrisFragments for all tower blocks
    final groundLevel = MediaQuery.of(context).size.height - 140;
    for (final b in _blocks) {
      final basePos = _projectCoord(0.0, 0.0, 0.6 + b.index);
      final Offset blockCenter = Offset(basePos.dx + b.driftX, basePos.dy);

      // Split each block into 6 independent bouncing debris fragments
      for (int i = 0; i < 6; i++) {
        _debris.add(DebrisFragment(
          pos: blockCenter,
          vel: Offset(
            -180 + math.Random().nextDouble() * 360, 
            -150 - math.Random().nextDouble() * 250,
          ),
          angularVelocity: -5.0 + math.Random().nextDouble() * 10.0,
          size: 14.0 + math.Random().nextDouble() * 10.0,
          color: b.color,
          groundLevel: groundLevel - (math.Random().nextDouble() * 15),
        ));
      }
    }

    // Shake all surroundings wobbly
    setState(() {
      _isCollapsing = true;
      _collapseTime = 0.0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        title: Text("3D Arxitektor: Physics Simulator", style: AppTheme.headerMedium.copyWith(fontSize: 16)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.darkPurple),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Stack(
        children: [
          // Shake view
          Positioned.fill(
            child: Transform.translate(
              offset: Offset(_shakeDx, _shakeDy),
              child: Transform.rotate(
                angle: _shakeTilt,
                alignment: Alignment.center,
                child: Transform.scale(
                  scale: _shakeScale,
                  alignment: Alignment.center,
                  child: Stack(
                    children: [
                      // Ground platform
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

                      // Canvas Painter
                      Positioned.fill(
                        child: CustomPaint(
                          painter: UltraPhysicsCityPainter(
                            blocks: _blocks,
                            auxBuildings: _auxBuildings,
                            trees: _trees,
                            particles: _particles,
                            debris: _debris,
                            cars: _cars,
                            centerOrigin: Offset(screenWidth / 2, MediaQuery.of(context).size.height * 0.62),
                            scaleSize: 38.0,
                            isDropping: _isDropping,
                            droppingBlockPos: _dropPos,
                            droppingColor: _currentColor,
                            craneTrolleyX: _craneTrolleyX,
                            craneCableLength: _cableLength,
                            citadelTiltAngle: _citadelTiltAngle,
                            towerWobbleOffset: _towerWobbleOffset,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Sidebar Stats
          if (!_isCollapsed)
            Positioned(
              left: 16,
              top: 24,
              child: Column(
                children: [
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
                  
                  // Instability gauge
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

          // Action trigger
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

          // Temur briefing
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
              // Pulsing avatar
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
              
              // Educational explanation
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

              // Rebuild action button
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

  void _rebuildEmpire() {
    setState(() {
      _blocks.clear();
      _isDropping = false;
      _isCollapsed = false;
      _showBriefing = false;
      _colorIndex = 0;
      _alignmentDeviationMeter = 0.0;
      _citadelTiltAngle = 0.0;
      _wobbleTime = 0.0;
      _towerWobbleOffset = 0.0;
      _ropeAngle = 0.0;
      _ropeAngularVelocity = 0.0;
      
      _particles.clear();
      _debris.clear();

      for (final aux in _auxBuildings) {
        aux.wobbleAngle = 0.0;
      }
      for (final tree in _trees) {
        tree.wobbleAngle = 0.0;
      }
    });
  }
}
