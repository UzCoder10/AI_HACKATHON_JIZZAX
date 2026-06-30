import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';

// =========================================================================
// ARCHITECTURE TYPES
// =========================================================================
enum ArchitectureType { column, arch, wall, dome }

// =========================================================================
// REAL-TIME PHYSICS SIMULATION MODELS
// =========================================================================
class GameParticle {
  Offset pos;
  Offset vel;
  final Color color;
  final double size;
  double opacity;
  final double lifeDecay;

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
    vel = Offset(vel.dx * 0.98, vel.dy * 0.98);
    opacity = math.max(0.0, opacity - lifeDecay * dt);
  }
}

class TumblingComponent {
  Offset pos;
  Offset vel;
  double rotX = 0.0;
  double rotY = 0.0;
  double rotZ = 0.0;
  final double angularVelX;
  final double angularVelY;
  final double angularVelZ;
  final ArchitectureType type;
  final Color color;
  int bounces = 0;
  final double groundLevel;

  TumblingComponent({
    required this.pos,
    required this.vel,
    required this.angularVelX,
    required this.angularVelY,
    required this.angularVelZ,
    required this.type,
    required this.color,
    required this.groundLevel,
  });

  void update(double dt, List<GameParticle> particles) {
    vel = Offset(vel.dx, vel.dy + 800 * dt);
    pos += vel * dt;
    rotX += angularVelX * dt;
    rotY += angularVelY * dt;
    rotZ += angularVelZ * dt;

    if (pos.dy >= groundLevel) {
      pos = Offset(pos.dx, groundLevel);
      if (bounces < 3) {
        vel = Offset(vel.dx * 0.65, -vel.dy * 0.45);
        bounces++;
        for (int i = 0; i < 5; i++) {
          particles.add(GameParticle(
            pos: Offset(pos.dx, groundLevel),
            vel: Offset(-50 + math.Random().nextDouble() * 100, -30 - math.Random().nextDouble() * 50),
            color: Colors.grey.shade400,
            size: 8.0 + math.Random().nextDouble() * 10.0,
            opacity: 0.8,
            lifeDecay: 1.2,
          ));
        }
      } else {
        vel = Offset.zero;
      }
    }
  }
}

class VectorCar {
  double progress;
  final int roadDirection; // 0: h, 1: v
  final Color color;
  final double speed;

  VectorCar({
    required this.progress,
    required this.roadDirection,
    required this.color,
    required this.speed,
  });

  void update(double dt) {
    progress += speed * dt;
    if (progress > 1.0) progress = 0.0;
  }
}

class StackedComponent {
  final int index;
  final ArchitectureType type;
  final Color color;
  final double driftX;
  double wobbleOffset = 0.0;

  StackedComponent({
    required this.index,
    required this.type,
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
  bool isFlashing = false;

  AuxiliaryBuilding({
    required this.gridX,
    required this.gridY,
    required this.color,
    required this.height,
    required this.windowRows,
    required this.windowCols,
  });
}

class CityTree {
  final double gridX;
  final double gridY;
  double wobbleAngle = 0.0;
  bool isFlashing = false;

  CityTree({required this.gridX, required this.gridY});
}

// =========================================================================
// ISOMETRIC TEXTURED CITY CUSTOM PAINTER
// =========================================================================
class UltraPhysicsCityPainter extends CustomPainter {
  final List<StackedComponent> blocks;
  final List<AuxiliaryBuilding> auxBuildings;
  final List<CityTree> trees;
  final List<GameParticle> particles;
  final List<TumblingComponent> debris;
  final List<VectorCar> cars;
  final Offset centerOrigin;
  final double scaleSize;
  
  final bool isDropping;
  final Offset droppingBlockPos;
  final Color droppingColor;
  final ArchitectureType droppingType;

  final double craneTrolleyX;
  final double craneCableLength;

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
    required this.droppingType,
    required this.craneTrolleyX,
    required this.craneCableLength,
    required this.citadelTiltAngle,
    required this.towerWobbleOffset,
  });

  Offset _project(double gx, double gy, double gz) {
    final double cos30 = math.cos(math.pi / 6);
    final double sin30 = math.sin(math.pi / 6);
    final double screenX = centerOrigin.dx + (gx - gy) * scaleSize * cos30;
    final double screenY = centerOrigin.dy + (gx + gy) * scaleSize * sin30 - gz * (scaleSize * 0.95);
    return Offset(screenX, screenY);
  }

  @override
  void paint(Canvas canvas, Size size) {
    final double r = scaleSize * 0.95;
    final double h = scaleSize * 0.98;

    // 1. Grid Tiles (Grass & Roads)
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

    // 2. Cars
    for (final car in cars) {
      _drawVectorCar(canvas, car);
    }

    // 3. Trees
    for (final tree in trees) {
      final base = _project(tree.gridX, tree.gridY, 0.0);
      _drawTree(canvas, base, tree.wobbleAngle, tree.isFlashing);
    }

    // 4. Detailed Buildings
    for (final aux in auxBuildings) {
      final base = _project(aux.gridX, aux.gridY, 0.0);
      _drawDetailedBuilding(canvas, base, r * 0.9, aux.height, aux.color, aux.windowRows, aux.windowCols, aux.wobbleAngle, aux.isFlashing);
    }

    // 5. Central Citadel Platform
    final citadelBase = _project(0.0, 0.0, 0.0);
    _drawDetailedBuilding(canvas, citadelBase, r * 1.35, h * 0.6, AppTheme.yellow, 1, 3, citadelTiltAngle, false);

    // 6. Stacked Components
    double currentHeightOffset = 0.6;
    for (int i = 0; i < blocks.length; i++) {
      final b = blocks[i];
      final basePos = _project(0.0, 0.0, currentHeightOffset);
      final double totalOffset = b.driftX + towerWobbleOffset + b.wobbleOffset;
      final Offset blockCenter = Offset(basePos.dx + totalOffset, basePos.dy);

      _drawArchitecture(canvas, blockCenter, r, h, b.color, b.type, 0.0, 0.0, citadelTiltAngle);
      currentHeightOffset += 1.0;
    }

    // 7. Active Dropping Component
    if (isDropping) {
      _drawArchitecture(canvas, droppingBlockPos, r, h, droppingColor, droppingType, 0.0, 0.0, 0.0);
    }

    // 8. Tumbling Debris
    for (final frag in debris) {
      _drawArchitecture(canvas, frag.pos, r, h, frag.color, frag.type, frag.rotX, frag.rotY, frag.rotZ);
    }

    // 9. Particles
    for (final p in particles) {
      final paint = Paint()
        ..color = p.color.withAlpha((p.opacity * 255).round())
        ..style = PaintingStyle.fill;
      canvas.drawCircle(p.pos, p.size, paint);
    }

    // 10. Crane
    _drawCraneSystem(canvas, size);
  }

  // --- Background Elements ---

  void _drawGrassTile(Canvas canvas, double gx, double gy) {
    final path = _getTilePath(gx, gy);
    canvas.drawPath(path, Paint()..color = AppTheme.pastelMint..style = PaintingStyle.fill);
    
    final pBlade = Paint()..color = AppTheme.darkMintGreen..strokeWidth = 1.5;
    final center = _project(gx, gy, 0.0);
    canvas.drawLine(center, Offset(center.dx - 2, center.dy - 4), pBlade);
    canvas.drawLine(center, Offset(center.dx + 2, center.dy - 3), pBlade);
  }

  void _drawRoadTile(Canvas canvas, double gx, double gy) {
    final path = _getTilePath(gx, gy);
    canvas.drawPath(path, Paint()..color = AppTheme.porcelain..style = PaintingStyle.fill);
    canvas.drawPath(path, Paint()..color = AppTheme.darkPurpleBorder.withAlpha(50)..style = PaintingStyle.stroke..strokeWidth = 1.0);

    final center = _project(gx, gy, 0.0);
    final pMarking = Paint()..color = AppTheme.yellow..strokeWidth = 2.0;
    
    if (gy == 0.0) {
      canvas.drawLine(Offset(center.dx - 6, center.dy - 3), Offset(center.dx + 6, center.dy + 3), pMarking);
    } else if (gx == 0.0) {
      canvas.drawLine(Offset(center.dx - 6, center.dy + 3), Offset(center.dx + 6, center.dy - 3), pMarking);
    }
  }

  Path _getTilePath(double gx, double gy) {
    final pTop = _project(gx - 0.5, gy - 0.5, 0.0);
    final pRight = _project(gx + 0.5, gy - 0.5, 0.0);
    final pBottom = _project(gx + 0.5, gy + 0.5, 0.0);
    final pLeft = _project(gx - 0.5, gy + 0.5, 0.0);
    final path = Path();
    path.moveTo(pTop.dx, pTop.dy);
    path.lineTo(pRight.dx, pRight.dy);
    path.lineTo(pBottom.dx, pBottom.dy);
    path.lineTo(pLeft.dx, pLeft.dy);
    path.close();
    return path;
  }

  void _drawVectorCar(Canvas canvas, VectorCar car) {
    double gx = 0.0;
    double gy = 0.0;
    if (car.roadDirection == 0) {
      gx = -3.0 + car.progress * 6.0;
    } else {
      gy = -3.0 + car.progress * 6.0;
    }
    final carPos = _project(gx, gy, 0.05);

    final pCar = Paint()..color = car.color..style = PaintingStyle.fill;
    final pWindow = Paint()..color = AppTheme.white..style = PaintingStyle.fill;
    
    canvas.drawRect(Rect.fromCenter(center: carPos, width: 14, height: 8), pCar);
    canvas.drawRect(Rect.fromLTWH(carPos.dx - 3, carPos.dy - 5, 6, 4), pWindow);

    final pHeadlight = Paint()..color = AppTheme.yellow.withAlpha(180)..strokeWidth = 1.5;
    if (car.roadDirection == 0) {
      canvas.drawLine(carPos, Offset(carPos.dx + 16, carPos.dy + 4), pHeadlight);
      canvas.drawLine(carPos, Offset(carPos.dx + 16, carPos.dy - 4), pHeadlight);
    } else {
      canvas.drawLine(carPos, Offset(carPos.dx - 16, carPos.dy + 4), pHeadlight);
      canvas.drawLine(carPos, Offset(carPos.dx - 16, carPos.dy - 4), pHeadlight);
    }
  }

  void _drawTree(Canvas canvas, Offset base, double wobble, bool isFlashing) {
    final trunkPath = Path();
    trunkPath.moveTo(base.dx - 3, base.dy);
    trunkPath.lineTo(base.dx - 3, base.dy - 12);
    trunkPath.lineTo(base.dx + 3, base.dy - 12);
    trunkPath.lineTo(base.dx + 3, base.dy);
    trunkPath.close();

    canvas.drawPath(trunkPath, Paint()..color = const Color(0xFF8B5A2B));

    final leafPath = Path();
    final Offset leafCenter = Offset(base.dx + math.sin(wobble) * 8, base.dy - 20);
    final double r = 12.0;

    leafPath.moveTo(leafCenter.dx, leafCenter.dy - r);
    leafPath.lineTo(leafCenter.dx + r * 1.3, leafCenter.dy);
    leafPath.lineTo(leafCenter.dx, leafCenter.dy + r);
    leafPath.lineTo(leafCenter.dx - r * 1.3, leafCenter.dy);
    leafPath.close();

    final Color leafColor = isFlashing ? AppTheme.appleRed : AppTheme.mintGreen;
    canvas.drawPath(leafPath, Paint()..color = leafColor);
    canvas.drawPath(
      leafPath, 
      Paint()..color = isFlashing ? AppTheme.darkAppleRed : AppTheme.darkMintGreen..style = PaintingStyle.stroke..strokeWidth = 2.0,
    );
  }

  void _drawDetailedBuilding(Canvas canvas, Offset base, double r, double h, Color color, int rows, int cols, double wobble, bool isFlashing) {
    final center = Offset(base.dx + math.sin(wobble) * 12, base.dy - h);
    final drawColor = isFlashing ? AppTheme.pastelRed : color;
    
    _drawArchitecture(canvas, center, r, h, drawColor, ArchitectureType.wall, 0.0, 0.0, wobble);

    final Offset pLeft = Offset(center.dx - r * 0.433, center.dy + h * 0.5);
    final Offset pRight = Offset(center.dx + r * 0.433, center.dy + h * 0.5);
    final pWindow = Paint()..color = isFlashing ? AppTheme.appleRed : AppTheme.yellow..style = PaintingStyle.fill;

    for (int rIdx = 0; rIdx < rows; rIdx++) {
      for (int cIdx = 0; cIdx < cols; cIdx++) {
        final double wx = pLeft.dx - 6 + (cIdx * 7) + math.sin(wobble) * 10;
        final double wy = pLeft.dy - h + 14 + (rIdx * 12);
        canvas.drawRect(Rect.fromLTWH(wx, wy, 4, 6), pWindow);
      }
    }
    for (int rIdx = 0; rIdx < rows; rIdx++) {
      for (int cIdx = 0; cIdx < cols; cIdx++) {
        final double wx = pRight.dx - 6 + (cIdx * 7) + math.sin(wobble) * 10;
        final double wy = pRight.dy - h + 14 + (rIdx * 12);
        canvas.drawRect(Rect.fromLTWH(wx, wy, 4, 6), pWindow);
      }
    }

    final pAntenna = Paint()..color = AppTheme.darkPurpleBorder..strokeWidth = 2.0;
    final topCenter = Offset(center.dx + math.sin(wobble) * 12, center.dy - r * 0.5);
    canvas.drawLine(topCenter, Offset(topCenter.dx, topCenter.dy - 18), pAntenna);
    canvas.drawCircle(Offset(topCenter.dx, topCenter.dy - 18), 3.0, Paint()..color = AppTheme.appleRed);
  }

  // --- Architecture Renderers ---

  void _drawArchitecture(Canvas canvas, Offset center, double r, double h, Color color, ArchitectureType type, double rotX, double rotY, double rotZ) {
    switch (type) {
      case ArchitectureType.wall:
        _drawWall(canvas, center, r, h, color, rotX, rotY, rotZ);
        break;
      case ArchitectureType.column:
        _drawColumn(canvas, center, r, h, color, rotX, rotY, rotZ);
        break;
      case ArchitectureType.arch:
        _drawArch(canvas, center, r, h, color, rotX, rotY, rotZ);
        break;
      case ArchitectureType.dome:
        _drawDome(canvas, center, r, h, color, rotX, rotY, rotZ);
        break;
    }
  }

  void _drawWall(Canvas canvas, Offset center, double r, double h, Color color, double rotX, double rotY, double rotZ) {
    // Standard beveled cube with brick line strokes
    final colors = _getShadedColors(color);
    
    Offset pTop = Offset(center.dx, center.dy - r * 0.5);
    Offset pRight = Offset(center.dx + r * 0.866, center.dy);
    Offset pBottom = Offset(center.dx, center.dy + r * 0.5);
    Offset pLeft = Offset(center.dx - r * 0.866, center.dy);

    pTop = _rotateOffset3D(pTop, center, rotX, rotY, rotZ);
    pRight = _rotateOffset3D(pRight, center, rotX, rotY, rotZ);
    pBottom = _rotateOffset3D(pBottom, center, rotX, rotY, rotZ);
    pLeft = _rotateOffset3D(pLeft, center, rotX, rotY, rotZ);

    final topPath = Path()..moveTo(pTop.dx, pTop.dy)..lineTo(pRight.dx, pRight.dy)..lineTo(pBottom.dx, pBottom.dy)..lineTo(pLeft.dx, pLeft.dy)..close();
    
    Offset pBottomLeft = _rotateOffset3D(Offset(center.dx - r * 0.866, center.dy + h), center, rotX, rotY, rotZ);
    Offset pBottomCenter = _rotateOffset3D(Offset(center.dx, center.dy + r * 0.5 + h), center, rotX, rotY, rotZ);
    Offset pBottomRight = _rotateOffset3D(Offset(center.dx + r * 0.866, center.dy + h), center, rotX, rotY, rotZ);

    final leftPath = Path()..moveTo(pLeft.dx, pLeft.dy)..lineTo(pBottom.dx, pBottom.dy)..lineTo(pBottomCenter.dx, pBottomCenter.dy)..lineTo(pBottomLeft.dx, pBottomLeft.dy)..close();
    final rightPath = Path()..moveTo(pRight.dx, pRight.dy)..lineTo(pBottom.dx, pBottom.dy)..lineTo(pBottomCenter.dx, pBottomCenter.dy)..lineTo(pBottomRight.dx, pBottomRight.dy)..close();

    final fill = Paint()..style = PaintingStyle.fill;
    final stroke = Paint()..color = colors[3]..style = PaintingStyle.stroke..strokeWidth = 3.0..strokeJoin = StrokeJoin.round;

    canvas.drawPath(topPath, fill..color = colors[0]);
    canvas.drawPath(topPath, stroke);
    canvas.drawPath(leftPath, fill..color = colors[1]);
    canvas.drawPath(leftPath, stroke);
    canvas.drawPath(rightPath, fill..color = colors[2]);
    canvas.drawPath(rightPath, stroke);

    // Brick lines (simplified)
    final pBrick = Paint()..color = colors[3].withAlpha(80)..strokeWidth = 1.0;
    for (int i = 1; i <= 3; i++) {
      final double frac = i / 4.0;
      final Offset l1 = Offset(pLeft.dx + (pBottomLeft.dx - pLeft.dx) * frac, pLeft.dy + (pBottomLeft.dy - pLeft.dy) * frac);
      final Offset l2 = Offset(pBottom.dx + (pBottomCenter.dx - pBottom.dx) * frac, pBottom.dy + (pBottomCenter.dy - pBottom.dy) * frac);
      canvas.drawLine(l1, l2, pBrick);

      final Offset r1 = Offset(pRight.dx + (pBottomRight.dx - pRight.dx) * frac, pRight.dy + (pBottomRight.dy - pRight.dy) * frac);
      canvas.drawLine(l2, r1, pBrick);
    }
  }

  void _drawColumn(Canvas canvas, Offset center, double r, double h, Color color, double rotX, double rotY, double rotZ) {
    final colors = _getShadedColors(color);
    // Draw a cylinder-like shape
    final double colR = r * 0.6;
    
    // Top ellipse
    Offset topC = _rotateOffset3D(Offset(center.dx, center.dy - colR * 0.5), center, rotX, rotY, rotZ);
    // Base ellipse
    Offset baseC = _rotateOffset3D(Offset(center.dx, center.dy - colR * 0.5 + h), center, rotX, rotY, rotZ);

    // Body
    final path = Path();
    path.moveTo(topC.dx - colR, topC.dy);
    path.lineTo(topC.dx + colR, topC.dy);
    path.lineTo(baseC.dx + colR, baseC.dy);
    path.lineTo(baseC.dx - colR, baseC.dy);
    path.close();

    // Fill with gradient to simulate roundness
    final gradient = LinearGradient(colors: [colors[1], colors[0], colors[2]], stops: const [0.0, 0.4, 1.0]);
    final fill = Paint()..shader = gradient.createShader(Rect.fromPoints(Offset(topC.dx - colR, topC.dy), Offset(baseC.dx + colR, baseC.dy)));
    canvas.drawPath(path, fill);

    final stroke = Paint()..color = colors[3]..style = PaintingStyle.stroke..strokeWidth = 3.0;
    canvas.drawPath(path, stroke);

    // Caps
    final topRect = Rect.fromCenter(center: topC, width: colR * 2, height: colR * 0.8);
    canvas.drawOval(topRect, Paint()..color = colors[0]..style = PaintingStyle.fill);
    canvas.drawOval(topRect, stroke);
    
    final baseRect = Rect.fromCenter(center: baseC, width: colR * 2, height: colR * 0.8);
    canvas.drawArc(baseRect, 0, math.pi, false, stroke); // Only bottom half of base
  }

  void _drawArch(Canvas canvas, Offset center, double r, double h, Color color, double rotX, double rotY, double rotZ) {
    final colors = _getShadedColors(color);
    
    // Draw the outer wall first
    _drawWall(canvas, center, r, h, color, rotX, rotY, rotZ);

    // Draw the hollow cutout on the left face
    Offset pLeft = Offset(center.dx - r * 0.866, center.dy);
    Offset pBottom = Offset(center.dx, center.dy + r * 0.5);
    Offset pBottomLeft = Offset(pLeft.dx, pLeft.dy + h);
    Offset pBottomCenter = Offset(pBottom.dx, pBottom.dy + h);

    pLeft = _rotateOffset3D(pLeft, center, rotX, rotY, rotZ);
    pBottom = _rotateOffset3D(pBottom, center, rotX, rotY, rotZ);
    pBottomLeft = _rotateOffset3D(pBottomLeft, center, rotX, rotY, rotZ);
    pBottomCenter = _rotateOffset3D(pBottomCenter, center, rotX, rotY, rotZ);

    // Cutout polygon
    final double pad = 0.25;
    Offset cBL = Offset(pBottomLeft.dx + (pBottomCenter.dx - pBottomLeft.dx) * pad, pBottomLeft.dy + (pBottomCenter.dy - pBottomLeft.dy) * pad);
    Offset cBR = Offset(pBottomLeft.dx + (pBottomCenter.dx - pBottomLeft.dx) * (1 - pad), pBottomLeft.dy + (pBottomCenter.dy - pBottomLeft.dy) * (1 - pad));
    
    Offset cTL = Offset(pLeft.dx + (pBottom.dx - pLeft.dx) * pad, pLeft.dy + (pBottom.dy - pLeft.dy) * pad + h * 0.3);
    Offset cTR = Offset(pLeft.dx + (pBottom.dx - pLeft.dx) * (1 - pad), pLeft.dy + (pBottom.dy - pLeft.dy) * (1 - pad) + h * 0.3);

    final cutoutPath = Path();
    cutoutPath.moveTo(cBL.dx, cBL.dy);
    cutoutPath.lineTo(cTL.dx, cTL.dy);
    // Arch curve
    cutoutPath.quadraticBezierTo(
      cTL.dx + (cTR.dx - cTL.dx) / 2, cTL.dy - h * 0.4, 
      cTR.dx, cTR.dy
    );
    cutoutPath.lineTo(cBR.dx, cBR.dy);
    cutoutPath.close();

    // Fill cutout with a very dark interior color (deep shadow)
    canvas.drawPath(cutoutPath, Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.fill);
    
    final stroke = Paint()..color = colors[3]..style = PaintingStyle.stroke..strokeWidth = 2.0;
    canvas.drawPath(cutoutPath, stroke);
  }

  void _drawDome(Canvas canvas, Offset center, double r, double h, Color color, double rotX, double rotY, double rotZ) {
    final colors = _getShadedColors(color);
    
    // Draw base drum (short wall/cylinder)
    _drawWall(canvas, center, r * 0.9, h * 0.3, color, rotX, rotY, rotZ);

    // Draw Dome Sphere
    final domeCenter = _rotateOffset3D(Offset(center.dx, center.dy - r * 0.3), center, rotX, rotY, rotZ);
    final double domeR = r * 0.8;

    final gradient = RadialGradient(
      center: Alignment(-0.3, -0.3), // Sun glare from top left
      radius: 0.8,
      colors: [AppTheme.white, colors[0], colors[1], colors[3]],
      stops: const [0.0, 0.3, 0.7, 1.0],
    );

    final fill = Paint()..shader = gradient.createShader(Rect.fromCircle(center: domeCenter, radius: domeR));
    canvas.drawCircle(domeCenter, domeR, fill);

    final stroke = Paint()..color = colors[3]..style = PaintingStyle.stroke..strokeWidth = 3.0;
    canvas.drawCircle(domeCenter, domeR, stroke);

    // Finial
    final Offset finialTop = _rotateOffset3D(Offset(center.dx, center.dy - r * 0.3 - domeR - 10), center, rotX, rotY, rotZ);
    canvas.drawLine(domeCenter, finialTop, stroke);
    canvas.drawCircle(finialTop, 3.0, Paint()..color = AppTheme.yellow);
  }

  List<Color> _getShadedColors(Color color) {
    if (color == AppTheme.mandarin) {
      return [const Color(0xFFFF8E66), const Color(0xFFFF6B35), const Color(0xFFD44810), const Color(0xFF9E2E04)];
    } else if (color == AppTheme.marineBlue) {
      return [const Color(0xFF5CD5FF), const Color(0xFF00A8E8), const Color(0xFF0082B4), const Color(0xFF00587A)];
    } else if (color == AppTheme.mintGreen) {
      return [const Color(0xFF56F1C5), const Color(0xFF06D6A0), const Color(0xFF049E75), const Color(0xFF026D51)];
    } else {
      return [const Color(0xFFFFDF7A), const Color(0xFFFFB627), const Color(0xFFD8920E), const Color(0xFF9C6500)];
    }
  }

  Offset _rotateOffset3D(Offset point, Offset center, double ax, double ay, double az) {
    double x = point.dx - center.dx;
    double y = point.dy - center.dy;
    double cosZ = math.cos(az);
    double sinZ = math.sin(az);
    double x1 = x * cosZ - y * sinZ;
    double y1 = x * sinZ + y * cosZ;
    double cosX = math.cos(ax);
    double y2 = y1 * cosX;
    double cosY = math.cos(ay);
    double x3 = x1 * cosY;
    return Offset(center.dx + x3, center.dy + y2);
  }

  void _drawCraneSystem(Canvas canvas, Size size) {
    final pSupport = Paint()..color = AppTheme.darkPurpleBorder..strokeWidth = 6.0..strokeCap = StrokeCap.round;
    final double craneTowerX = size.width - 40;
    canvas.drawLine(Offset(craneTowerX, 40), Offset(craneTowerX, size.height - 100), pSupport);
    canvas.drawLine(Offset(craneTowerX - 300, 40), Offset(craneTowerX + 30, 40), pSupport);

    final pTruss = Paint()..color = AppTheme.mandarin..strokeWidth = 2.0;
    for (double x = craneTowerX - 280; x < craneTowerX; x += 40) {
      canvas.drawLine(Offset(x, 40), Offset(x + 20, 25), pTruss);
      canvas.drawLine(Offset(x + 20, 25), Offset(x + 40, 40), pTruss);
    }

    final pCable = Paint()..color = AppTheme.darkPurpleBorder..strokeWidth = 2.0;
    if (!isDropping) {
      final Offset cableEnd = Offset(craneTrolleyX + craneCableLength * math.sin(citadelTiltAngle), 40 + craneCableLength * math.cos(citadelTiltAngle));
      canvas.drawLine(Offset(craneTrolleyX, 40), cableEnd, pCable);
      canvas.drawCircle(cableEnd, 5.0, pSupport);
    }
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
  final List<StackedComponent> _blocks = [];
  bool _isDropping = false;
  Color _currentColor = AppTheme.marineBlue;
  ArchitectureType _currentType = ArchitectureType.column;

  final List<GameParticle> _particles = [];
  final List<TumblingComponent> _debris = [];
  final List<VectorCar> _cars = [
    VectorCar(progress: 0.1, roadDirection: 0, color: AppTheme.mandarin, speed: 0.14),
    VectorCar(progress: 0.5, roadDirection: 1, color: AppTheme.marineBlue, speed: 0.18),
  ];

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

  final List<Color> _blockColors = [AppTheme.marineBlue, AppTheme.mandarin, AppTheme.yellow, AppTheme.mintGreen];
  final List<ArchitectureType> _blockTypes = [ArchitectureType.column, ArchitectureType.arch, ArchitectureType.wall, ArchitectureType.dome];
  int _colorIndex = 0;

  late final Ticker _physicsTicker;
  double _timeElapsed = 0.0;
  
  double _craneTrolleyX = 0.0;
  double _lastTrolleyX = 0.0;
  double _ropeAngle = 0.0;
  double _ropeAngularVelocity = 0.0;
  final double _cableLength = 110.0;

  Offset _dropPos = Offset.zero;
  double _dropVelY = 0.0;

  double _citadelTiltAngle = 0.0;
  double _towerWobbleOffset = 0.0;
  double _wobbleTime = 0.0;
  double _cumulativeDrift = 0.0;
  double _alignmentDeviationMeter = 0.0;

  double _shakeDx = 0.0;
  double _shakeDy = 0.0;
  double _shakeTilt = 0.0;
  double _shakeScale = 1.0;
  double _shakeProgress = 0.0;
  bool _isShaking = false;

  bool _showBriefing = false;
  bool _isCollapsing = false;
  double _collapseTime = 0.0;
  bool _isCollapsed = false;

  @override
  void initState() {
    super.initState();
    _physicsTicker = Ticker((Duration elapsed) {
      final double dt = 0.0166;
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
      final screenWidth = MediaQuery.of(context).size.width;
      final double centerOffset = screenWidth / 2;
      final double sweepWidth = screenWidth * 0.28;

      _craneTrolleyX = centerOffset + math.sin(_timeElapsed * 1.8) * sweepWidth;
      final double trolleyAcc = (_craneTrolleyX - _lastTrolleyX) / dt;
      _lastTrolleyX = _craneTrolleyX;

      final double gravityTerm = - (320.0 / _cableLength) * math.sin(_ropeAngle);
      final double accTerm = - (trolleyAcc / _cableLength) * math.cos(_ropeAngle);
      final double damping = - 1.8 * _ropeAngularVelocity;
      _ropeAngularVelocity += (gravityTerm + accTerm + damping) * dt;
      _ropeAngle += _ropeAngularVelocity * dt;

      if (_isDropping) {
        _dropVelY += 980.0 * dt;
        _dropPos = Offset(_dropPos.dx, _dropPos.dy + _dropVelY * dt);
        final double targetY = _projectTargetLandingY();
        if (_dropPos.dy >= targetY) {
          _resolveBlockLanding();
        }
      }

      if (_wobbleTime > 0.0) {
        _wobbleTime = math.max(0.0, _wobbleTime - dt);
        _towerWobbleOffset = 30.0 * math.exp(- (2.5 - _wobbleTime) * 2.2) * math.cos((2.5 - _wobbleTime) * 14.0);
      } else {
        _towerWobbleOffset = 0.0;
      }

      for (final p in _particles) {
        p.update(dt);
      }
      _particles.removeWhere((p) => p.opacity <= 0.0);

      for (final frag in _debris) {
        frag.update(dt, _particles);
      }

      for (final car in _cars) {
        car.update(dt);
      }

      if (_isShaking) {
        _shakeProgress += dt;
        if (_shakeProgress < 1.2) {
          final double strength = 1.0 - (_shakeProgress / 1.2);
          _shakeDx = math.sin(_shakeProgress * 15 * math.pi) * 15.0 * strength;
          _shakeDy = math.cos(_shakeProgress * 12 * math.pi) * 10.0 * strength;
          _shakeScale = 1.0 - math.sin(_shakeProgress * math.pi) * 0.04;
          _shakeTilt = math.sin(_shakeProgress * 6 * math.pi) * 0.015 * strength;
          
          final bool flashState = (_shakeProgress * 20).toInt() % 2 == 0;
          for (final aux in _auxBuildings) {
            aux.isFlashing = flashState;
          }
          for (final tree in _trees) {
            tree.isFlashing = flashState;
          }
        } else {
          _isShaking = false;
          _shakeDx = 0.0;
          _shakeDy = 0.0;
          _shakeScale = 1.0;
          _shakeTilt = 0.0;
          
          for (final aux in _auxBuildings) {
            aux.isFlashing = false;
          }
          for (final tree in _trees) {
            tree.isFlashing = false;
          }
          
          _triggerStructuralCollapse();
        }
      }

      if (_isCollapsing) {
        _collapseTime += dt;
        if (_collapseTime < 2.0) {
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
    final double drift = _dropPos.dx - centerOffset;
    
    // Update Cumulative Balance Physics
    _cumulativeDrift += drift;
    
    final double absImbalance = _cumulativeDrift.abs();
    final bool isCritical = absImbalance > 100.0;

    setState(() {
      _isDropping = false;
      _blocks.add(StackedComponent(index: _blocks.length, type: _currentType, color: _currentColor, driftX: drift));

      _alignmentDeviationMeter = math.min(1.0, absImbalance / 100.0);
      _citadelTiltAngle = _cumulativeDrift * 0.0025;
      
      _wobbleTime = 2.5;

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

      _colorIndex = (_colorIndex + 1) % _blockColors.length;
      _currentColor = _blockColors[_colorIndex];
      _currentType = _blockTypes[_colorIndex];

      if (_blocks.length >= 5 || isCritical) {
        _triggerEarthquakeDisaster();
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
    final groundLevel = MediaQuery.of(context).size.height - 140;
    
    // Turn all components into tumbling debris, retaining their shape type!
    for (final b in _blocks) {
      final basePos = _projectCoord(0.0, 0.0, 0.6 + b.index);
      final Offset blockCenter = Offset(basePos.dx + b.driftX, basePos.dy);

      _debris.add(TumblingComponent(
        pos: blockCenter,
        vel: Offset(
          -150 + math.Random().nextDouble() * 300, 
          -100 - math.Random().nextDouble() * 200,
        ),
        angularVelX: -3.0 + math.Random().nextDouble() * 6.0,
        angularVelY: -3.0 + math.Random().nextDouble() * 6.0,
        angularVelZ: -3.0 + math.Random().nextDouble() * 6.0,
        type: b.type,
        color: b.color,
        groundLevel: groundLevel - (math.Random().nextDouble() * 15),
      ));
    }
    _blocks.clear();
    
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
        title: Text("Samarqand Me'mori: 3D Simulator", style: AppTheme.headerMedium.copyWith(fontSize: 16)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.darkPurple),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Stack(
        children: [
          // Shake view (Matrix4 Transform)
          Positioned.fill(
            child: Transform(
              transform: Matrix4.identity()
                // ignore: deprecated_member_use
                ..translate(_shakeDx, _shakeDy)
                // ignore: deprecated_member_use
                ..scale(_shakeScale, _shakeScale)
                // Add slight perspective skew for disaster realism
                ..setEntry(3, 0, _shakeTilt * 0.01)
                ..setEntry(3, 1, _shakeTilt * 0.01)
                ..rotateZ(_shakeTilt),
              alignment: Alignment.center,
              child: Stack(
                children: [
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
                        droppingType: _currentType,
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
                        Text("Qavatlar", style: AppTheme.bodySmall),
                        Text("${_blocks.length} / 5", style: AppTheme.headerMedium.copyWith(color: AppTheme.marineBlue)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  
                  // Live Seismic Weight Balance Gauge
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
                        Text("Muvozanat", style: AppTheme.bodySmall.copyWith(fontSize: 8)),
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
                                    decoration: BoxDecoration(
                                      color: _alignmentDeviationMeter > 0.75 
                                          ? AppTheme.appleRed 
                                          : (_alignmentDeviationMeter > 0.4 ? AppTheme.yellow : AppTheme.mintGreen),
                                    ),
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
                          _isDropping ? "QURILMOQDA..." : "QISM YUBORISH!",
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
              Container(
                padding: const EdgeInsets.all(16),
                decoration: AppTheme.vibrant3DBoxDecoration(
                  color: AppTheme.porcelain,
                  radius: 20,
                  borderWidth: 2,
                  shadowOffset: const Offset(3, 3),
                ),
                child: Text(
                  "Bino barpo etishda poydevor kengligi va og‘irlik markazi (center of gravity) o‘ta muhimdir. Agar minoralar markazdan og‘ib ketsa, eng kichik silzilalar ham uni ag‘daradi. Biz Samarqandda qurdirtirgan koshonalar mustahkam poydevorli va seysmik yuklarga chidamli qilib ishlangan. 'Kuch adolatdadir!' Minorani qayta tiklab, yana yulduzchalar yutib olamiz!",
                  style: AppTheme.bodyLarge.copyWith(height: 1.45, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 20),
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
                    "O'z Imperiyangni Qaytadan Qur 🏗️",
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
      _currentType = _blockTypes[0];
      
      _cumulativeDrift = 0.0;
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
            aux.isFlashing = false;
          }
          for (final tree in _trees) {
            tree.wobbleAngle = 0.0;
            tree.isFlashing = false;
          }
    });
  }
}
