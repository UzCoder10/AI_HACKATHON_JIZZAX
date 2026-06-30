import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/data_models.dart';
import '../../controllers/app_state.dart';

class DrawingLine {
  final List<Offset> points;
  final Color color;
  final double strokeWidth;

  DrawingLine({
    required this.points,
    required this.color,
    required this.strokeWidth,
  });
}

class DrawingPainter extends CustomPainter {
  final List<DrawingLine> lines;

  DrawingPainter({required this.lines});

  @override
  void paint(Canvas canvas, Size size) {
    for (final line in lines) {
      final paint = Paint()
        ..color = line.color
        ..strokeCap = StrokeCap.round
        ..strokeWidth = line.strokeWidth
        ..style = PaintingStyle.stroke;

      if (line.points.isEmpty) continue;
      for (int i = 0; i < line.points.length - 1; i++) {
        canvas.drawLine(line.points[i], line.points[i + 1], paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class DrawingQuestScreen extends StatefulWidget {
  final AppState appState;

  const DrawingQuestScreen({super.key, required this.appState});

  @override
  State<DrawingQuestScreen> createState() => _DrawingQuestScreenState();
}

class _DrawingQuestScreenState extends State<DrawingQuestScreen> {
  final List<DrawingLine> _lines = [];
  Color _selectedColor = AppTheme.magenta;
  final double _strokeWidth = 5.0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        title: Text("Quest: Rasm chizish", style: AppTheme.headerMedium),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.darkBlue),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Text(
                "Yer sayyorasi yoki yulduzlar rasmini chizib, allomalarga yuboring!",
                style: AppTheme.bodyMedium,
              ),
              const SizedBox(height: 12),
              
              // Drawing Canvas
              Expanded(
                child: Container(
                  decoration: AppTheme.neonDecoration(color: Colors.white, radius: 24),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: GestureDetector(
                      onPanStart: (details) {
                        setState(() {
                          _lines.add(DrawingLine(
                            points: [details.localPosition],
                            color: _selectedColor,
                            strokeWidth: _strokeWidth,
                          ));
                        });
                      },
                      onPanUpdate: (details) {
                        setState(() {
                          if (_lines.isNotEmpty) {
                            _lines.last.points.add(details.localPosition);
                          }
                        });
                      },
                      child: CustomPaint(
                        painter: DrawingPainter(lines: _lines),
                        child: Container(),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              // Colors
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      _buildColorCircle(AppTheme.magenta),
                      const SizedBox(width: 8),
                      _buildColorCircle(AppTheme.cyan),
                      const SizedBox(width: 8),
                      _buildColorCircle(AppTheme.yellow),
                      const SizedBox(width: 8),
                      _buildColorCircle(AppTheme.darkBlue),
                    ],
                  ),
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _lines.clear();
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: AppTheme.neonDecoration(color: AppTheme.pastelPeach, radius: 16, borderWidth: 2, shadowOffset: const Offset(2, 2)),
                      child: Text("Tozalash", style: AppTheme.headerSmall.copyWith(fontSize: 12)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Send drawing to scholar
              GestureDetector(
                onTap: () {
                  if (_lines.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Iltimos, avval rasm chizing!")),
                    );
                    return;
                  }
                  
                  final activeScholar = widget.appState.selectedScholar ?? scholarsList.first;
                  widget.appState.selectScholar(activeScholar);
                  widget.appState.submitDrawingQuest(activeScholar.id);
                  
                  // Scholar custom reply timer
                  Timer(const Duration(milliseconds: 1600), () {
                    widget.appState.sendScholarResponse(
                      activeScholar.id,
                      "Ajoyib! Chizgan rasmingiz menga juda yoqdi. Sizda koinotni va tabiatni tasvirlash qobiliyati bor ekan. Ilm yo‘lida dadil qadam tashlayvering! Rasm chizganingiz uchun sizga yana 5 ta yulduzcha taqdim etildi."
                    );
                  });

                  Navigator.of(context).pop(); // Back to dashboard
                  widget.appState.changeTab(1); // Chat Tab
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: AppTheme.neonDecoration(color: AppTheme.cyan),
                  alignment: Alignment.center,
                  child: Text("Allomaga Yuborish", style: AppTheme.headerMedium),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildColorCircle(Color color) {
    final bool isSelected = _selectedColor == color;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedColor = color;
        });
      },
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected ? Colors.red : AppTheme.darkBlue,
            width: isSelected ? 3 : 2,
          ),
        ),
      ),
    );
  }
}
