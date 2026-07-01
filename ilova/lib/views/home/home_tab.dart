import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/data_models.dart';
import '../../controllers/app_state.dart';
import 'drawing_quest_screen.dart';
import 'scholar_wiki_screen.dart';
import '../game/building_game_tab.dart';

// =========================================================================
// REUSABLE FLOATING MOTION WIDGET
// =========================================================================
class FloatingWidget extends StatefulWidget {
  final Widget child;
  final int delayMs;

  const FloatingWidget({super.key, required this.child, this.delayMs = 0});

  @override
  State<FloatingWidget> createState() => _FloatingWidgetState();
}

class _FloatingWidgetState extends State<FloatingWidget> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );
    _animation = Tween<double>(begin: 0, end: -8).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    Future.delayed(Duration(milliseconds: widget.delayMs), () {
      if (mounted) {
        _controller.repeat(reverse: true);
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _animation.value),
          child: child,
        );
      },
      child: widget.child,
    );
  }
}

// =========================================================================
// HOMETAB VIEW
// =========================================================================
class HomeTab extends StatefulWidget {
  final AppState appState;

  const HomeTab({super.key, required this.appState});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  String _unlockedMessage = "";

  void _onMoodTap(MoodType mood) {
    if (widget.appState.isMoodLoggedToday) {
      setState(() {
        _unlockedMessage = "Bugungi kayfiyatingiz allaqachon belgilangan!";
      });
      return;
    }
    
    widget.appState.logMood(mood);
    setState(() {
      switch (mood) {
        case MoodType.happy:
          _unlockedMessage = "Ajoyib! Xursandligingiz bizni quvontiradi! +2 yulduzcha";
          break;
        case MoodType.neutral:
          _unlockedMessage = "Tinch va osoyishta kayfiyat!";
          break;
        case MoodType.sad:
          _unlockedMessage = "Xafa bo‘lmang, allomalarimiz sizga bilimlar ulashadi!";
          break;
      }
    });
  }

  // Interactive Parent Quest Assignment Modal Quiz
  void _openParentQuestQuiz(ParentAssignment assignment) {
    int? selectedOption;
    bool checked = false;
    String feedback = "";

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
            title: Row(
              children: [
                const Icon(Icons.workspace_premium_rounded, color: AppTheme.yellow, size: 28),
                const SizedBox(width: 8),
                Text("Maxsus Kvest", style: AppTheme.headerSmall),
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Mavzu: ${assignment.topic}",
                    style: AppTheme.bodySmall.copyWith(color: AppTheme.mandarin, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(assignment.question, style: AppTheme.bodyLarge),
                  const SizedBox(height: 16),
                  
                  // Options
                  ...List.generate(assignment.options.length, (idx) {
                    final isSel = selectedOption == idx;
                    Color btnColor = AppTheme.white;
                    if (checked) {
                      if (idx == assignment.correctAnswerIndex) {
                        btnColor = AppTheme.pastelMint;
                      } else if (isSel) {
                        btnColor = AppTheme.pastelRed;
                      }
                    } else if (isSel) {
                      btnColor = AppTheme.pastelBlue;
                    }

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10.0),
                      child: GestureDetector(
                        onTap: checked ? null : () {
                          setModalState(() {
                            selectedOption = idx;
                          });
                        },
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          decoration: AppTheme.vibrant3DBoxDecoration(
                            color: btnColor,
                            radius: 16,
                            borderWidth: 2,
                            shadowOffset: isSel ? const Offset(1, 1) : const Offset(3, 3),
                          ),
                          child: Text(
                            assignment.options[idx],
                            style: AppTheme.bodyMedium,
                          ),
                        ),
                      ),
                    );
                  }),
                  
                  if (feedback.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(
                      feedback,
                      style: AppTheme.bodyMedium.copyWith(
                        color: feedback.startsWith("To‘g‘ri") ? AppTheme.darkMintGreen : AppTheme.appleRed,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ],
              ),
            ),
            actions: [
              if (!checked)
                ElevatedButton(
                  onPressed: selectedOption == null ? null : () {
                    setModalState(() {
                      checked = true;
                      if (selectedOption == assignment.correctAnswerIndex) {
                        feedback = "To‘g‘ri javob! Qoyil! +50 Super Yulduzcha! ⭐";
                      } else {
                        feedback = "Noto‘g‘ri. To‘g‘ri javob: ${assignment.options[assignment.correctAnswerIndex]}";
                      }
                    });
                  },
                  child: const Text("Tekshirish"),
                )
              else
                ElevatedButton(
                  onPressed: () {
                    widget.appState.completeParentQuest();
                    Navigator.of(ctx).pop();
                  },
                  child: const Text("Davom etish"),
                ),
            ],
          );
        }
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = widget.appState;
    final themeBg = AppTheme.getThemeBg(state.activeThemeName);
    final themeAccent = AppTheme.getThemeAccent(state.activeThemeName);

    return Scaffold(
      backgroundColor: AppTheme.porcelain,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: themeAccent,
                radius: 12,
                borderWidth: 2,
                shadowOffset: const Offset(2, 2),
              ),
              child: Icon(
                state.getAvatarIcon(state.selectedAvatarRole),
                color: AppTheme.darkPurple,
                size: 20,
              ),
            ),
            const SizedBox(width: 10),
            Text(
              "Nihol",
              style: AppTheme.headerMedium.copyWith(fontSize: 18),
            ),
          ],
        ),
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
                  "${state.stars}",
                  style: AppTheme.headerSmall.copyWith(fontSize: 14),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: themeBg,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Salom, ${state.childName}!",
                          style: AppTheme.headerLarge.copyWith(fontSize: 24),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          "Bugungi allomalar bilan ajoyib suhbatga va topshiriqlarga tayyormisiz?",
                          style: AppTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: AppTheme.white,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.darkPurpleBorder, width: 2.5),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.face_rounded, color: AppTheme.mandarin, size: 28),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Parental Quest Quiz Banner (Dopamine Trigger)
            if (state.activeAssignment != null && !state.isAssignmentCompleted) ...[
              FloatingWidget(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: AppTheme.vibrant3DBoxDecoration(
                    color: AppTheme.mandarin,
                    borderColor: AppTheme.darkMandarin,
                    shadowColor: AppTheme.darkMandarin,
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.workspace_premium_rounded, color: AppTheme.yellow, size: 36),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Ota-onangizdan Maxsus Kvest! 👑",
                              style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 14),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              "Mavzu: ${state.activeAssignment!.topic}. Kvestni bajaring va +50 Super Yulduzcha yutib oling!",
                              style: AppTheme.bodySmall.copyWith(color: AppTheme.white.withAlpha(220)),
                            ),
                            const SizedBox(height: 10),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.white,
                                foregroundColor: AppTheme.mandarin,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              onPressed: () => _openParentQuestQuiz(state.activeAssignment!),
                              child: Text(
                                "Kvestni boshlash",
                                style: AppTheme.fontHeader.copyWith(fontSize: 12, color: AppTheme.mandarin),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Mood Tracker
            Container(
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: AppTheme.white,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Bugungi kayfiyatingiz qanday?",
                    style: AppTheme.headerSmall,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildMoodBtn(MoodType.happy, Icons.sentiment_very_satisfied_rounded, "Xursand", AppTheme.marineBlue),
                      _buildMoodBtn(MoodType.neutral, Icons.sentiment_neutral_rounded, "Oddiy", AppTheme.yellow),
                      _buildMoodBtn(MoodType.sad, Icons.sentiment_very_dissatisfied_rounded, "Xafa", AppTheme.appleRed),
                    ],
                  ),
                  if (_unlockedMessage.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppTheme.porcelain,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.darkPurpleBorder, width: 2),
                        ),
                        child: Text(
                          _unlockedMessage,
                          style: AppTheme.bodySmall.copyWith(color: AppTheme.mandarin, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Daily Quest Card
            FloatingWidget(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: AppTheme.vibrant3DBoxDecoration(
                  color: AppTheme.yellow,
                  shadowColor: AppTheme.darkMandarin,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.brush_rounded, color: AppTheme.darkPurple, size: 24),
                        const SizedBox(width: 8),
                        Text(
                          "Bugungi Topshiriq",
                          style: AppTheme.headerMedium,
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Yer sayyorasi yoki yulduzlar rasmini chizib, allomalarga yuboring va 5 yulduzcha yutib oling!",
                      style: AppTheme.bodyLarge,
                    ),
                    const SizedBox(height: 14),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => DrawingQuestScreen(appState: widget.appState),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.darkPurple,
                        foregroundColor: AppTheme.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: const BorderSide(color: AppTheme.darkPurpleBorder, width: 1.5),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      ),
                      child: Text(
                        "Chizishni boshlash",
                        style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
            ),
             const SizedBox(height: 20),

             // 3D Game Launcher Card
             FloatingWidget(
               delayMs: 250,
               child: Container(
                 width: double.infinity,
                 padding: const EdgeInsets.all(20),
                 decoration: AppTheme.vibrant3DBoxDecoration(
                   color: AppTheme.pastelBlue,
                   borderColor: AppTheme.darkMarineBlue,
                   shadowColor: AppTheme.marineBlue,
                 ),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Row(
                       children: [
                         const Icon(Icons.architecture_rounded, color: AppTheme.marineBlue, size: 24),
                         const SizedBox(width: 8),
                         Text(
                           "3D Arxitektor O‘yini",
                           style: AppTheme.headerMedium.copyWith(color: AppTheme.darkMarineBlue),
                         ),
                       ],
                     ),
                     const SizedBox(height: 8),
                     Text(
                       "Seysmik mustahkam minoralar quring va qanday qilib binolarni zilziladan himoya qilishni o‘rganing!",
                       style: AppTheme.bodyLarge.copyWith(color: AppTheme.darkPurple),
                     ),
                     const SizedBox(height: 14),
                     ElevatedButton(
                       onPressed: () {
                         Navigator.of(context).push(
                           MaterialPageRoute(
                             builder: (context) => BuildingGameTab(appState: widget.appState),
                           ),
                         );
                       },
                       style: ElevatedButton.styleFrom(
                         backgroundColor: AppTheme.marineBlue,
                         foregroundColor: AppTheme.white,
                         elevation: 0,
                         shape: RoundedRectangleBorder(
                           borderRadius: BorderRadius.circular(16),
                           side: const BorderSide(color: AppTheme.darkMarineBlue, width: 1.5),
                         ),
                         padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                       ),
                       child: Text(
                         "O‘yinni boshlash",
                         style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 14),
                       ),
                     ),
                   ],
                 ),
               ),
             ),
             const SizedBox(height: 24),

            // Scholars list
            Text(
              "Buyuk Siymolar",
              style: AppTheme.headerMedium,
            ),
            const SizedBox(height: 10),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: scholarsList.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.9,
              ),
              itemBuilder: (context, index) {
                final scholar = scholarsList[index];
                return FloatingWidget(
                  delayMs: index * 100,
                  child: GestureDetector(
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                          title: Text(scholar.name, style: AppTheme.headerSmall),
                          content: Text("Allomaning hayotiy ensiklopediyasini ko‘rmoqchimisiz yoki to‘g‘ridan-to‘g‘ri suhbatlashasizmi?", style: AppTheme.bodyMedium),
                          actions: [
                            TextButton(
                              onPressed: () {
                                Navigator.of(ctx).pop();
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) => ScholarWikiScreen(scholar: scholar, appState: state),
                                  ),
                                );
                              },
                              child: const Text("Hayot yo‘li"),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: scholar.solidColor,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              onPressed: () {
                                Navigator.of(ctx).pop();
                                state.selectScholar(scholar);
                                state.changeTab(1); // Chat tab
                              },
                              child: Text("Suhbat", style: AppTheme.bodySmall.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                            )
                          ],
                        ),
                      );
                    },
                    child: Container(
                      decoration: AppTheme.vibrant3DBoxDecoration(
                        color: scholar.pastelColor,
                        radius: 20,
                        borderWidth: 2.5,
                      ),
                      padding: const EdgeInsets.all(10),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: scholar.solidColor,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppTheme.getBorderColorFor(scholar.solidColor), width: 2),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              scholar.initials,
                              style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 14),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            scholar.name,
                            style: AppTheme.headerSmall.copyWith(fontSize: 12),
                            textAlign: TextAlign.center,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          scholar.field,
                          style: AppTheme.bodySmall.copyWith(fontSize: 9, color: AppTheme.greyText),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    ),
  );
}

  Widget _buildMoodBtn(MoodType mood, IconData icon, String text, Color activeColor) {
    final bool isSelected = widget.appState.loggedMoodToday == mood;
    final double borderThickness = isSelected ? 3.5 : 2.5;
    final Color resolvedBorderColor = isSelected ? AppTheme.getBorderColorFor(activeColor) : AppTheme.darkPurpleBorder;
    final Offset resolvedShadowOffset = isSelected ? const Offset(1, 1) : const Offset(4, 4);

    return GestureDetector(
      onTap: () => _onMoodTap(mood),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOut,
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
        decoration: AppTheme.vibrant3DBoxDecoration(
          color: isSelected ? activeColor : AppTheme.white,
          borderColor: resolvedBorderColor,
          shadowOffset: resolvedShadowOffset,
          shadowColor: isSelected ? resolvedBorderColor : AppTheme.darkPurpleBorder,
          borderWidth: borderThickness,
        ),
        child: Column(
          children: [
            Icon(icon, size: 28, color: isSelected ? AppTheme.white : AppTheme.darkPurple),
            const SizedBox(height: 4),
            Text(
              text,
              style: AppTheme.headerSmall.copyWith(
                fontSize: 10,
                color: isSelected ? AppTheme.white : AppTheme.darkPurple,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
