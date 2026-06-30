import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/data_models.dart';
import '../../controllers/app_state.dart';

class EducationalFeed extends StatelessWidget {
  final AppState appState;

  const EducationalFeed({super.key, required this.appState});

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
          
          // Dynamically map categories for Khan kids look
          String category = "Tarix";
          IconData catIcon = Icons.auto_stories_rounded;
          if (card.id == "sh-1") {
            category = "Koinot";
            catIcon = Icons.rocket_launch_rounded;
          } else if (card.id == "sh-2") {
            category = "Texnologiya";
            catIcon = Icons.code_rounded;
          }

          return ShortVideoCardWidget(
            card: card,
            category: category,
            catIcon: catIcon,
            onLike: () {
              appState.likeShortVideoCard(card.id);
            },
          );
        },
      ),
    );
  }
}

class ShortVideoCardWidget extends StatefulWidget {
  final ShortVideoCard card;
  final String category;
  final IconData catIcon;
  final VoidCallback onLike;

  const ShortVideoCardWidget({
    super.key,
    required this.card,
    required this.category,
    required this.catIcon,
    required this.onLike,
  });

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
            // Slide Card Container
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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Category pill overlay
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: AppTheme.vibrant3DBoxDecoration(
                            color: c.accentColor,
                            radius: 16,
                            borderWidth: 2,
                            shadowOffset: const Offset(2, 2),
                          ),
                          child: Row(
                            children: [
                              Icon(widget.catIcon, color: AppTheme.white, size: 14),
                              const SizedBox(width: 6),
                              Text(
                                widget.category,
                                style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 11),
                              ),
                            ],
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
                    const SizedBox(height: 24),

                    // HD Visual Asset slot container
                    Container(
                      height: 180,
                      width: double.infinity,
                      decoration: AppTheme.vibrant3DBoxDecoration(
                        color: AppTheme.white,
                        borderColor: AppTheme.getBorderColorFor(c.accentColor),
                        radius: 24,
                        shadowOffset: const Offset(3, 3),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(22),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            // Soft visual gradient simulating video/animation backdrop
                            Positioned.fill(
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [c.accentColor.withAlpha(100), c.accentColor.withAlpha(20)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                ),
                              ),
                            ),
                            Icon(Icons.play_circle_filled_rounded, size: 58, color: c.accentColor),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    Text(
                      c.title,
                      style: AppTheme.headerMedium.copyWith(fontSize: 22, color: AppTheme.darkPurple),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      c.fact,
                      style: AppTheme.bodyLarge.copyWith(height: 1.45, color: AppTheme.darkPurple),
                    ),
                    const SizedBox(height: 24),
                    
                    // Question Riddle card
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
                              decoration: BoxDecoration(
                                color: AppTheme.pastelMint,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppTheme.darkMintGreen, width: 1.5),
                              ),
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
                    const SizedBox(height: 20),
                    Center(
                      child: Text(
                        "Yulduzcha yutish uchun ikki marta bosing! ⭐",
                        style: AppTheme.bodySmall.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ),

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
