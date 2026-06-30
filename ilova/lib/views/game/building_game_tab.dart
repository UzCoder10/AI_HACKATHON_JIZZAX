import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';
import '../../controllers/age_tier_controller.dart';

enum ArchitectureType { column, arch, wall, dome }

enum GameBuildingMaterial { brick, wood, stone }

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
  final double bounceFactor;

  TumblingComponent({
    required this.pos,
    required this.vel,
    required this.angularVelX,
    required this.angularVelY,
    required this.angularVelZ,
    required this.type,
    required this.color,
    required this.groundLevel,
    this.bounceFactor = 0.45,
  });

  void update(double dt, List<GameParticle> particles) {
    vel = Offset(vel.dx, vel.dy + 850 * dt);
    pos += vel * dt;
    rotX += angularVelX * dt;
    rotY += angularVelY * dt;
    rotZ += angularVelZ * dt;

    if (pos.dy >= groundLevel) {
      pos = Offset(pos.dx, groundLevel);
      if (bounces < 3) {
        vel = Offset(vel.dx * 0.6, -vel.dy * bounceFactor);
        bounces++;
        for (int i = 0; i < 6; i++) {
          particles.add(GameParticle(
            pos: Offset(pos.dx, groundLevel),
            vel: Offset(-60 + math.Random().nextDouble() * 120, -30 - math.Random().nextDouble() * 60),
            color: Colors.grey.shade400,
            size: 6.0 + math.Random().nextDouble() * 12.0,
            opacity: 0.8,
            lifeDecay: 1.5,
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
  final int roadDirection; 
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
  final GameBuildingMaterial material;
  double wobbleOffset = 0.0;

  StackedComponent({
    required this.index,
    required this.type,
    required this.color,
    required this.driftX,
    required this.material,
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

  CityTree({
    required this.gridX,
    required this.gridY,
  });
}

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
  
  // Game Material Tycoon state
  GameBuildingMaterial _selectedMaterial = GameBuildingMaterial.brick;

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

  // --- MATERIAL SCIENCE TYCOON CONSTANTS ---
  double _getMaterialWeight() {
    switch (_selectedMaterial) {
      case GameBuildingMaterial.brick:
        return 2.5; // High mass
      case GameBuildingMaterial.wood:
        return 1.0; // Low mass
      case GameBuildingMaterial.stone:
        return 4.0; // Immense mass
    }
  }

  double _getMaterialElasticity() {
    switch (_selectedMaterial) {
      case GameBuildingMaterial.brick:
        return 0.1; // Brittle
      case GameBuildingMaterial.wood:
        return 0.6; // High elasticity
      case GameBuildingMaterial.stone:
        return 0.05; // Rigid
    }
  }

  double _getStaticFriction() {
    switch (_selectedMaterial) {
      case GameBuildingMaterial.brick:
        return 0.5;
      case GameBuildingMaterial.wood:
        return 0.3;
      case GameBuildingMaterial.stone:
        return 0.9; // Immense static friction
    }
  }

  void _updatePhysics(double dt) {
    if (!mounted) return;
    _timeElapsed += dt;

    setState(() {
      final screenWidth = MediaQuery.of(context).size.width;
      final double centerOffset = screenWidth / 2;
      final double sweepWidth = screenWidth * 0.28;

      // Variable crane kinetic sway based on material mass
      final double mass = _getMaterialWeight();
      final double swayPeriod = 1.8 / math.sqrt(mass); // Heavier objects sway slower due to momentum inertia
      _craneTrolleyX = centerOffset + math.sin(_timeElapsed * swayPeriod) * sweepWidth;

      final double trolleyAcc = (_craneTrolleyX - _lastTrolleyX) / dt;
      _lastTrolleyX = _craneTrolleyX;

      final double gravityTerm = - (320.0 / _cableLength) * math.sin(_ropeAngle);
      final double accTerm = - (trolleyAcc / _cableLength) * math.cos(_ropeAngle);
      final double damping = - (1.8 / mass) * _ropeAngularVelocity;
      
      _ropeAngularVelocity += (gravityTerm + accTerm + damping) * dt;
      _ropeAngle += _ropeAngularVelocity * dt;

      if (_isDropping) {
        // Drop speed based on material weight/gravity acceleration
        final double gValue = 600.0 + mass * 200.0;
        _dropVelY += gValue * dt;
        _dropPos = Offset(_dropPos.dx, _dropPos.dy + _dropVelY * dt);
        final double targetY = _projectTargetLandingY();
        if (_dropPos.dy >= targetY) {
          _resolveBlockLanding();
        }
      }

      if (_wobbleTime > 0.0) {
        _wobbleTime = math.max(0.0, _wobbleTime - dt);
        final double scaleFactor = _selectedMaterial == GameBuildingMaterial.wood ? 40.0 : 25.0;
        _towerWobbleOffset = scaleFactor * math.exp(- (2.5 - _wobbleTime) * 2.2) * math.cos((2.5 - _wobbleTime) * 14.0);
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
    
    // Torque drift offset adjusted by mass and static friction
    final double friction = _getStaticFriction();
    final double weightMultiplier = _getMaterialWeight();
    
    // Static friction limits drift slippage impact
    final double effectiveDrift = drift * (weightMultiplier / (friction * 10.0 + 1.0));
    _cumulativeDrift += effectiveDrift;
    
    final double absImbalance = _cumulativeDrift.abs();
    
    // Critical torque threshold breaches balance limit
    final bool isCritical = absImbalance > 90.0;

    setState(() {
      _isDropping = false;
      _blocks.add(StackedComponent(
        index: _blocks.length,
        type: _currentType,
        color: _currentColor,
        driftX: drift,
        material: _selectedMaterial,
      ));

      _alignmentDeviationMeter = math.min(1.0, absImbalance / 90.0);
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
    
    // 3D Matrix Rotational shatter collapse
    for (final b in _blocks) {
      final basePos = _projectCoord(0.0, 0.0, 0.6 + b.index);
      final Offset blockCenter = Offset(basePos.dx + b.driftX, basePos.dy);

      _debris.add(TumblingComponent(
        pos: blockCenter,
        vel: Offset(
          -180 + math.Random().nextDouble() * 360, 
          -120 - math.Random().nextDouble() * 250,
        ),
        angularVelX: -6.0 + math.Random().nextDouble() * 12.0,
        angularVelY: -6.0 + math.Random().nextDouble() * 12.0,
        angularVelZ: -6.0 + math.Random().nextDouble() * 12.0,
        type: b.type,
        color: b.color,
        groundLevel: groundLevel - (math.Random().nextDouble() * 15),
        bounceFactor: _getMaterialElasticity(),
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
          // Shake view
          Positioned.fill(
            child: Transform(
              transform: Matrix4.identity()
                // ignore: deprecated_member_use
                ..translate(_shakeDx, _shakeDy)
                // ignore: deprecated_member_use
                ..scale(_shakeScale, _shakeScale)
                ..setEntry(3, 0, _shakeTilt * 0.01)
                ..setEntry(3, 1, _shakeTilt * 0.01)
                ..rotateZ(_shakeTilt),
              alignment: Alignment.center,
              child: Stack(
                children: [
                  Positioned.fill(
                    child: CustomPaint(
                      painter: IsometricCityBackgroundPainter(
                        blocksCount: _blocks.length,
                        tiltAngle: _citadelTiltAngle,
                        wobbleOffset: _towerWobbleOffset,
                        blocks: _blocks,
                        particles: _particles,
                        debris: _debris,
                        cars: _cars,
                        auxBuildings: _auxBuildings,
                        trees: _trees,
                        material: _selectedMaterial,
                      ),
                    ),
                  ),

                  // Hanging crane rope & hook
                  if (!_isCollapsed && !_showBriefing)
                    Positioned(
                      left: 0,
                      right: 0,
                      top: 0,
                      height: 380,
                      child: CustomPaint(
                        painter: CranePainter(
                          trolleyX: _craneTrolleyX,
                          ropeAngle: _ropeAngle,
                          cableLength: _cableLength,
                          isDropping: _isDropping,
                          dropPos: _dropPos,
                          currentType: _currentType,
                          currentColor: _currentColor,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Alignment Imbalance warning meter
          Positioned(
            left: 20,
            right: 20,
            top: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white.withAlpha(220), radius: 18),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: AppTheme.mandarin, size: 22),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Torque Og'ish Ko'rsatkichi", style: AppTheme.headerSmall.copyWith(fontSize: 12)),
                        const SizedBox(height: 4),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: LinearProgressIndicator(
                            value: _alignmentDeviationMeter,
                            minHeight: 10,
                            backgroundColor: Colors.grey.shade200,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              _alignmentDeviationMeter > 0.7 ? AppTheme.appleRed : AppTheme.mandarin,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // MATERIAL TYCOON SELECTOR CONTROLS
          if (!_isDropping && !_isCollapsed && !_showBriefing)
            Positioned(
              left: 16,
              right: 16,
              bottom: 120,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white, radius: 24, borderWidth: 2),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text("Seysmik Material Sinovi:", style: AppTheme.headerSmall.copyWith(fontSize: 13, color: AppTheme.darkPurple)),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildMaterialSelectBtn(GameBuildingMaterial.brick, "Pishiq G'isht"),
                        _buildMaterialSelectBtn(GameBuildingMaterial.wood, "Yog'och Sinchi"),
                        _buildMaterialSelectBtn(GameBuildingMaterial.stone, "Poydevor Tosh"),
                      ],
                    ),
                  ],
                ),
              ),
            ),

          // Bouncy Drop Action Button
          if (!_isCollapsed && !_showBriefing)
            Positioned(
              bottom: 24,
              left: 20,
              right: 20,
              child: GestureDetector(
                onTap: _dropHangingBlock,
                child: Container(
                  height: 64,
                  decoration: AppTheme.vibrant3DBoxDecoration(
                    color: AppTheme.mintGreen,
                    borderColor: AppTheme.darkMintGreen,
                    shadowColor: AppTheme.darkMintGreen,
                  ),
                  alignment: Alignment.center,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.download_rounded, color: AppTheme.white, size: 24),
                      const SizedBox(width: 8),
                      Text("BLOKNI TUSHIRISH", style: AppTheme.headerMedium.copyWith(color: AppTheme.white, fontSize: 16)),
                    ],
                  ),
                ),
              ),
            ),

          // Amir Temur Briefing Overlay with pulse ring animations
          if (_showBriefing)
            _buildTemurBriefingOverlay(),
        ],
      ),
    );
  }

  Widget _buildMaterialSelectBtn(GameBuildingMaterial material, String label) {
    final bool isSel = _selectedMaterial == material;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedMaterial = material;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSel ? AppTheme.yellow : AppTheme.porcelain,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSel ? AppTheme.darkYellow : Colors.grey.shade300, width: 1.5),
        ),
        child: Text(
          label,
          style: AppTheme.bodySmall.copyWith(fontWeight: FontWeight.bold, color: isSel ? AppTheme.white : AppTheme.darkPurple),
        ),
      ),
    );
  }

  Widget _buildTemurBriefingOverlay() {
    String postMortem = "Bino barpo etishda poydevor kengligi va og‘irlik markazi (center of gravity) o‘ta muhimdir. ";
    if (_selectedMaterial == GameBuildingMaterial.wood) {
      postMortem += "Siz tanlagan 'Yog'och Sinchi' elastik va yengil, ammo massasi yetarli bo'lmagani uchun eng kichik shamolda minorani ag'dardi.";
    } else if (_selectedMaterial == GameBuildingMaterial.brick) {
      postMortem += "Siz tanlagan 'Pishiq G'isht' og'ir va baquvvat, biroq elastiklik yetishmasligi sababli seysmik silkinishda chort-kesilib sindi.";
    } else {
      postMortem += "Siz tanlagan 'Poydevor Tosh' o'ta mustahkam va massasi yuqori, poydevor ishqalanishi yuqoriligi sabab minorani uzoqroq ushlab turdi!";
    }

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
                  postMortem,
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
                  Provider.of<AgeTierController>(context, listen: false).syncStarsToCloud(100);
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
                    "Qayta Qurish 🏗️",
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

// =========================================================================
// CRANE ROPE & ATTACHED BLOCK PAINTER
// =========================================================================
class CranePainter extends CustomPainter {
  final double trolleyX;
  final double ropeAngle;
  final double cableLength;
  final bool isDropping;
  final Offset dropPos;
  final ArchitectureType currentType;
  final Color currentColor;

  CranePainter({
    required this.trolleyX,
    required this.ropeAngle,
    required this.cableLength,
    required this.isDropping,
    required this.dropPos,
    required this.currentType,
    required this.currentColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final pMetal = Paint()
      ..color = AppTheme.darkPurpleBorder
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0;

    final pCable = Paint()
      ..color = Colors.grey.shade600
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    // Drawing top horizontal support girder
    canvas.drawLine(const Offset(0, 40), Offset(size.width, 40), pMetal);

    final double hookX = trolleyX + cableLength * math.sin(ropeAngle);
    final double hookY = 40 + cableLength * math.cos(ropeAngle);

    if (!isDropping) {
      // Girder to hook cable
      canvas.drawLine(Offset(trolleyX, 40), Offset(hookX, hookY), pCable);
      
      // Hook
      canvas.drawCircle(Offset(hookX, hookY), 6.0, Paint()..color = AppTheme.darkPurpleBorder);
      
      // Hanging target component preview
      _drawComponentPreview(canvas, Offset(hookX, hookY + 20), currentType, currentColor);
    } else {
      // Trolley hook remains
      canvas.drawLine(Offset(trolleyX, 40), Offset(trolleyX, 60), pCable);
      canvas.drawCircle(Offset(trolleyX, 60), 6.0, Paint()..color = AppTheme.darkPurpleBorder);
      
      // Dropping block itself
      _drawComponentPreview(canvas, dropPos, currentType, currentColor);
    }
  }

  void _drawComponentPreview(Canvas canvas, Offset pos, ArchitectureType type, Color color) {
    final double r = 16.0;
    final double h = 26.0;
    final colors = _getShadedColors(color);
    final fill = Paint()..style = PaintingStyle.fill;
    final stroke = Paint()..color = colors[3]..style = PaintingStyle.stroke..strokeWidth = 2.0;

    if (type == ArchitectureType.wall) {
      final path = Path()
        ..moveTo(pos.dx - r, pos.dy - h / 2)
        ..lineTo(pos.dx + r, pos.dy - h / 2)
        ..lineTo(pos.dx + r, pos.dy + h / 2)
        ..lineTo(pos.dx - r, pos.dy + h / 2)
        ..close();
      canvas.drawPath(path, fill..color = colors[0]);
      canvas.drawPath(path, stroke);
    } else if (type == ArchitectureType.column) {
      final path = Path()
        ..moveTo(pos.dx - r * 0.6, pos.dy - h / 2)
        ..lineTo(pos.dx + r * 0.6, pos.dy - h / 2)
        ..lineTo(pos.dx + r * 0.6, pos.dy + h / 2)
        ..lineTo(pos.dx - r * 0.6, pos.dy + h / 2)
        ..close();
      canvas.drawPath(path, fill..color = colors[1]);
      canvas.drawPath(path, stroke);
    } else if (type == ArchitectureType.arch) {
      final path = Path()
        ..moveTo(pos.dx - r, pos.dy - h / 2)
        ..lineTo(pos.dx + r, pos.dy - h / 2)
        ..lineTo(pos.dx + r, pos.dy + h / 2)
        ..lineTo(pos.dx - r, pos.dy + h / 2)
        ..close();
      canvas.drawPath(path, fill..color = colors[2]);
      canvas.drawPath(path, stroke);
    } else {
      canvas.drawCircle(pos, r, fill..color = colors[0]);
      canvas.drawCircle(pos, r, stroke);
    }
  }

  List<Color> _getShadedColors(Color base) {
    return [base, base.withAlpha(200), base.withAlpha(140), AppTheme.darkPurpleBorder];
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// =========================================================================
// ISOMETRIC 3D CITY AND BLOCKS RENDERING PIPELINE
// =========================================================================
class IsometricCityBackgroundPainter extends CustomPainter {
  final int blocksCount;
  final double tiltAngle;
  final double wobbleOffset;
  final List<StackedComponent> blocks;
  final List<GameParticle> particles;
  final List<TumblingComponent> debris;
  final List<VectorCar> cars;
  final List<AuxiliaryBuilding> auxBuildings;
  final List<CityTree> trees;
  final GameBuildingMaterial material;

  IsometricCityBackgroundPainter({
    required this.blocksCount,
    required this.tiltAngle,
    required this.wobbleOffset,
    required this.blocks,
    required this.particles,
    required this.debris,
    required this.cars,
    required this.auxBuildings,
    required this.trees,
    required this.material,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final double w = size.width;
    final double h = size.height;

    // 1. Draw Porcelain Sky and Sun
    canvas.drawRect(Rect.fromLTWH(0, 0, w, h), Paint()..color = const Color(0xFFF9FBFB));
    canvas.drawCircle(Offset(w * 0.15, h * 0.12), 40, Paint()..color = AppTheme.yellow.withAlpha(120));

    // 2. Draw ground grid paths
    _drawGridNetwork(canvas, size);

    // 3. Draw surrounding buildings
    for (final aux in auxBuildings) {
      _drawAuxiliaryBuilding(canvas, aux, size);
    }

    // 4. Draw trees
    for (final tree in trees) {
      _drawCityTree(canvas, tree, size);
    }

    // 5. Draw stacked citadel components
    _drawCitadelTower(canvas, size);

    // 6. Draw shattered tumbling debris (Multi-axis rotation collapse)
    for (final frag in debris) {
      _drawTumblingComponent(canvas, frag);
    }

    // 7. Draw vector particles
    for (final p in particles) {
      canvas.drawCircle(p.pos, p.size, Paint()..color = p.color.withAlpha((p.opacity * 255).round()));
    }
  }

  void _drawGridNetwork(Canvas canvas, Size size) {
    final pRoad = Paint()
      ..color = Colors.grey.shade200
      ..style = PaintingStyle.stroke
      ..strokeWidth = 20.0
      ..strokeCap = StrokeCap.round;

    final Offset pLeft = _projectCoord(-4.0, 0.0, 0.0);
    final Offset pRight = _projectCoord(4.0, 0.0, 0.0);
    final Offset pTop = _projectCoord(0.0, -4.0, 0.0);
    final Offset pBottom = _projectCoord(0.0, 4.0, 0.0);

    canvas.drawLine(pLeft, pRight, pRoad);
    canvas.drawLine(pTop, pBottom, pRoad);

    // Draw cars
    final pCar = Paint()..style = PaintingStyle.fill;
    for (final car in cars) {
      Offset carPos;
      if (car.roadDirection == 0) {
        carPos = Offset(pLeft.dx + (pRight.dx - pLeft.dx) * car.progress, pLeft.dy + (pRight.dy - pLeft.dy) * car.progress);
      } else {
        carPos = Offset(pTop.dx + (pBottom.dx - pTop.dx) * car.progress, pTop.dy + (pBottom.dy - pTop.dy) * car.progress);
      }
      canvas.drawRect(Rect.fromCenter(center: carPos, width: 12, height: 8), pCar..color = car.color);
    }
  }

  void _drawAuxiliaryBuilding(Canvas canvas, AuxiliaryBuilding aux, Size size) {
    final Offset base = _projectCoord(aux.gridX, aux.gridY, 0.0);
    final double h = aux.height;
    final double r = 18.0;

    canvas.save();
    canvas.translate(base.dx, base.dy);
    canvas.rotate(aux.wobbleAngle);

    final colors = [aux.color, aux.color.withAlpha(200), aux.color.withAlpha(140), AppTheme.darkPurpleBorder];
    final fill = Paint()..style = PaintingStyle.fill;
    final stroke = Paint()
      ..color = aux.isFlashing ? AppTheme.appleRed : colors[3]
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    // Draw Isometric Box
    final pathFront = Path()
      ..moveTo(-r, 0)
      ..lineTo(0, r * 0.5)
      ..lineTo(0, r * 0.5 - h)
      ..lineTo(-r, -h)
      ..close();

    final pathSide = Path()
      ..moveTo(0, r * 0.5)
      ..lineTo(r, 0)
      ..lineTo(r, -h)
      ..lineTo(0, r * 0.5 - h)
      ..close();

    final pathTop = Path()
      ..moveTo(-r, -h)
      ..lineTo(0, r * 0.5 - h)
      ..lineTo(r, -h)
      ..lineTo(0, -r * 0.5 - h)
      ..close();

    canvas.drawPath(pathFront, fill..color = colors[1]);
    canvas.drawPath(pathFront, stroke);
    canvas.drawPath(pathSide, fill..color = colors[2]);
    canvas.drawPath(pathSide, stroke);
    canvas.drawPath(pathTop, fill..color = colors[0]);
    canvas.drawPath(pathTop, stroke);

    canvas.restore();
  }

  void _drawCityTree(Canvas canvas, CityTree tree, Size size) {
    final Offset base = _projectCoord(tree.gridX, tree.gridY, 0.0);
    canvas.save();
    canvas.translate(base.dx, base.dy);
    canvas.rotate(tree.wobbleAngle);

    final pTrunk = Paint()..color = const Color(0xFF6E473B)..style = PaintingStyle.fill;
    final pLeaves = Paint()..color = tree.isFlashing ? AppTheme.appleRed : AppTheme.mintGreen..style = PaintingStyle.fill;
    final pBorder = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.stroke..strokeWidth = 1.5;

    // Draw simple isometric tree
    canvas.drawRect(const Rect.fromLTWH(-2.5, -15, 5, 15), pTrunk);
    canvas.drawRect(const Rect.fromLTWH(-2.5, -15, 5, 15), pBorder);
    
    canvas.drawCircle(const Offset(0, -22), 11, pLeaves);
    canvas.drawCircle(const Offset(0, -22), 11, pBorder);

    canvas.restore();
  }

  void _drawCitadelTower(Canvas canvas, Size size) {
    final double citadelHeight = scaleHeight() * 0.6;
    final double originY = size.height * 0.62;
    final double cx = size.width / 2;

    // Base foundation citadel
    final Offset pTop = Offset(cx + wobbleOffset, originY - citadelHeight);
    final Offset pRight = Offset(cx + 42 + wobbleOffset, originY);
    final Offset pBottom = Offset(cx + wobbleOffset, originY + 22);
    final Offset pLeft = Offset(cx - 42 + wobbleOffset, originY);

    final topPath = Path()..moveTo(pTop.dx, pTop.dy)..lineTo(pRight.dx, pRight.dy)..lineTo(pBottom.dx, pBottom.dy)..lineTo(pLeft.dx, pLeft.dy)..close();
    
    final frontPath = Path()
      ..moveTo(pLeft.dx, pLeft.dy)
      ..lineTo(pBottom.dx, pBottom.dy)
      ..lineTo(pBottom.dx, pBottom.dy + 25)
      ..lineTo(pLeft.dx, pLeft.dx + 25)
      ..close();

    final pCitadel = Paint()..color = const Color(0xFFE2DDD7)..style = PaintingStyle.fill;
    final pBorder = Paint()..color = AppTheme.darkPurpleBorder..style = PaintingStyle.stroke..strokeWidth = 3.0;

    canvas.drawPath(topPath, pCitadel);
    canvas.drawPath(topPath, pBorder);
    canvas.drawPath(frontPath, Paint()..color = const Color(0xFFD6CFC8));
    canvas.drawPath(frontPath, pBorder);

    // Render stacked components
    for (int i = 0; i < blocks.length; i++) {
      final block = blocks[i];
      final double zOffset = citadelHeight + i * scaleHeight();
      final Offset center = Offset(cx + block.driftX + wobbleOffset, originY - zOffset);
      
      canvas.save();
      canvas.translate(center.dx, center.dy);
      canvas.rotate(tiltAngle);

      _drawComponent(canvas, Offset.zero, 34.0, scaleHeight(), block.color, block.type, 0.0, 0.0, 0.0);

      canvas.restore();
    }
  }

  void _drawTumblingComponent(Canvas canvas, TumblingComponent frag) {
    _drawComponent(canvas, frag.pos, 32.0, scaleHeight(), frag.color, frag.type, frag.rotX, frag.rotY, frag.rotZ);
  }

  void _drawComponent(Canvas canvas, Offset center, double r, double h, Color color, ArchitectureType type, double rotX, double rotY, double rotZ) {
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
  }

  void _drawColumn(Canvas canvas, Offset center, double r, double h, Color color, double rotX, double rotY, double rotZ) {
    final colors = _getShadedColors(color);
    final double colR = r * 0.6;
    
    Offset topC = _rotateOffset3D(Offset(center.dx, center.dy - colR * 0.5), center, rotX, rotY, rotZ);
    Offset baseC = _rotateOffset3D(Offset(center.dx, center.dy - colR * 0.5 + h), center, rotX, rotY, rotZ);

    final path = Path();
    path.moveTo(topC.dx - colR, topC.dy);
    path.lineTo(topC.dx + colR, topC.dy);
    path.lineTo(baseC.dx + colR, baseC.dy);
    path.lineTo(baseC.dx - colR, baseC.dy);
    path.close();

    final gradient = LinearGradient(colors: [colors[1], colors[0], colors[2]], stops: const [0.0, 0.4, 1.0]);
    final fill = Paint()..shader = gradient.createShader(Rect.fromPoints(Offset(topC.dx - colR, topC.dy), Offset(baseC.dx + colR, baseC.dy)));
    canvas.drawPath(path, fill);

    final stroke = Paint()..color = colors[3]..style = PaintingStyle.stroke..strokeWidth = 3.0;
    canvas.drawPath(path, stroke);
  }

  void _drawArch(Canvas canvas, Offset center, double r, double h, Color color, double rotX, double rotY, double rotZ) {
    _drawWall(canvas, center, r, h, color, rotX, rotY, rotZ);
  }

  void _drawDome(Canvas canvas, Offset center, double r, double h, Color color, double rotX, double rotY, double rotZ) {
    final colors = _getShadedColors(color);
    
    Offset pTop = _rotateOffset3D(Offset(center.dx, center.dy - r), center, rotX, rotY, rotZ);
    Offset pBase = _rotateOffset3D(Offset(center.dx, center.dy + h * 0.2), center, rotX, rotY, rotZ);

    final path = Path()
      ..moveTo(pBase.dx - r, pBase.dy)
      ..quadraticBezierTo(pTop.dx, pTop.dy - 10, pBase.dx + r, pBase.dy)
      ..close();

    canvas.drawPath(path, Paint()..color = colors[0]);
    canvas.drawPath(path, Paint()..color = colors[3]..style = PaintingStyle.stroke..strokeWidth = 3.0);
  }

  Offset _rotateOffset3D(Offset point, Offset origin, double rx, double ry, double rz) {
    double x = point.dx - origin.dx;
    double y = point.dy - origin.dy;
    double z = 0.0;

    // Y rotation
    double x1 = x * math.cos(ry) + z * math.sin(ry);
    double z1 = -x * math.sin(ry) + z * math.cos(ry);

    // X rotation
    double y2 = y * math.cos(rx) - z1 * math.sin(rx);

    // Z rotation
    double x3 = x1 * math.cos(rz) - y2 * math.sin(rz);
    double y3 = x1 * math.sin(rz) + y2 * math.cos(rz);

    return Offset(x3 + origin.dx, y3 + origin.dy);
  }

  List<Color> _getShadedColors(Color base) {
    return [base, base.withAlpha(200), base.withAlpha(140), AppTheme.darkPurpleBorder];
  }

  double scaleHeight() => 38.0 * 0.98;

  Offset _projectCoord(double gx, double gy, double gz) {
    final double cos30 = math.cos(math.pi / 6);
    final double sin30 = math.sin(math.pi / 6);
    final double screenX = (200) + (gx - gy) * 38.0 * cos30;
    final double screenY = (380) + (gx + gy) * 38.0 * sin30 - gz * (38.0 * 0.95);
    return Offset(screenX, screenY);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
