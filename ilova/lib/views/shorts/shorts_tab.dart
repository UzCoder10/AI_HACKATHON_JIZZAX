import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/data_models.dart';
import '../../controllers/app_state.dart';

// =========================================================================
// SHORTS TAB VIEW
// =========================================================================
class ShortsTab extends StatelessWidget {
  final AppState appState;

  const ShortsTab({super.key, required this.appState});

  @override
  Widget build(BuildContext context) {
    final shorts = appState.shortsFeed;

    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        title: Text("Tarixiy Kvestlar (Shorts)", style: AppTheme.headerMedium),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
            decoration: AppTheme.vibrant3DBoxDecoration(
              color: AppTheme.yellow,
              radius: 16,
              borderWidth: 2,
              shadowOffset: const Offset(2, 2),
            ),
            child: Row(
              children: [
                const Icon(Icons.star_rounded, color: AppTheme.darkPurple, size: 16),
                const SizedBox(width: 4),
                Text(
                  "${appState.stars}",
                  style: AppTheme.headerSmall.copyWith(fontSize: 14),
                ),
              ],
            ),
          ),
        ],
      ),
      body: PageView.builder(
        scrollDirection: Axis.vertical,
        itemCount: shorts.length,
        itemBuilder: (context, index) {
          final card = shorts[index];
          return ShortVideoCardWidget(
            card: card,
            onLike: () {
              appState.likeShortVideoCard(card.id);
            },
          );
        },
      ),
    );
  }
}

// =========================================================================
// DOUBLE TAP STAR POP CARD
// =========================================================================
class ShortVideoCardWidget extends StatefulWidget {
  final ShortVideoCard card;
  final VoidCallback onLike;

  const ShortVideoCardWidget({super.key, required this.card, required this.onLike});

  @override
  State<ShortVideoCardWidget> createState() => _ShortVideoCardWidgetState();
}

class _ShortVideoCardWidgetState extends State<ShortVideoCardWidget> with SingleTickerProviderStateMixin {
  bool _showStarOverlay = false;
  late final AnimationController _starController;
  late final Animation<double> _scaleAnimation;
  bool _showAnswer = false;

  @override
  void initState() {
    super.initState();
    _starController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween<double>(begin: 0.0, end: 1.3).chain(CurveTween(curve: Curves.easeOut)), weight: 40),
      TweenSequenceItem(tween: Tween<double>(begin: 1.3, end: 1.0).chain(CurveTween(curve: Curves.easeIn)), weight: 30),
      TweenSequenceItem(tween: Tween<double>(begin: 1.0, end: 0.0).chain(CurveTween(curve: Curves.easeIn)), weight: 30),
    ]).animate(_starController);
  }

  @override
  void dispose() {
    _starController.dispose();
    super.dispose();
  }

  void _handleDoubleTap() {
    widget.onLike();
    setState(() {
      _showStarOverlay = true;
    });
    _starController.forward(from: 0.0).then((_) {
      setState(() {
        _showStarOverlay = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.card;

    return GestureDetector(
      onDoubleTap: _handleDoubleTap,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Slide Card Container (Vibrant Pop UI)
            Container(
              width: double.infinity,
              height: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: c.accentColor.withAlpha(20),
                borderColor: AppTheme.getBorderColorFor(c.accentColor),
                shadowColor: c.accentColor,
                radius: 32,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: c.accentColor,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.getBorderColorFor(c.accentColor), width: 2),
                          ),
                          child: Text(
                            c.title,
                            style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 12),
                          ),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.favorite_rounded, color: AppTheme.appleRed, size: 20),
                            const SizedBox(width: 4),
                            Text(
                              "${c.likes}",
                              style: AppTheme.headerSmall.copyWith(fontSize: 14),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    
                    // Fact Text
                    Text(
                      c.fact,
                      style: AppTheme.headerMedium.copyWith(fontSize: 20, height: 1.4),
                    ),
                    const SizedBox(height: 32),
                    
                    // Interactive Riddle Card Section
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: AppTheme.vibrant3DBoxDecoration(
                        color: AppTheme.white,
                        radius: 20,
                        borderColor: AppTheme.getBorderColorFor(c.accentColor),
                        shadowOffset: const Offset(3, 3),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.help_outline_rounded, color: c.accentColor, size: 20),
                              const SizedBox(width: 6),
                              Text(
                                "Mantiqiy savol:",
                                style: AppTheme.headerSmall.copyWith(fontSize: 12, color: c.accentColor),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(c.question, style: AppTheme.bodyLarge),
                          const SizedBox(height: 12),
                          if (_showAnswer) ...[
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(10),
                              color: AppTheme.pastelMint,
                              child: Text(
                                "Javob: ${c.answer}",
                                style: AppTheme.headerSmall.copyWith(fontSize: 14, color: AppTheme.darkMintGreen),
                              ),
                            ),
                          ] else ...[
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: c.accentColor,
                                foregroundColor: AppTheme.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              onPressed: () {
                                setState(() {
                                  _showAnswer = true;
                                });
                              },
                              child: Text(
                                "Javobni ko‘rish",
                                style: AppTheme.fontHeader.copyWith(fontSize: 12, color: AppTheme.white),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Center(
                      child: Text(
                        "Lover yulduzcha olish uchun ikki marta bosing! ❤️",
                        style: AppTheme.bodySmall.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Heart / Star Pop Overlay (Bouncing Dopamine Interaction)
            if (_showStarOverlay)
              ScaleTransition(
                scale: _scaleAnimation,
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                  ),
                  child: const Icon(
                    Icons.star_rounded,
                    color: AppTheme.yellow,
                    size: 80,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
