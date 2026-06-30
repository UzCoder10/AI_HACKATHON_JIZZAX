import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/data_models.dart';
import '../../controllers/app_state.dart';

// =========================================================================
// REUSABLE FLOATING WIDGET
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
// PULSING RADAR RADIAL RIPPLE AVATAR
// =========================================================================
class PulseRadarAvatar extends StatefulWidget {
  final Scholar scholar;
  const PulseRadarAvatar({super.key, required this.scholar});

  @override
  State<PulseRadarAvatar> createState() => _PulseRadarAvatarState();
}

class _PulseRadarAvatarState extends State<PulseRadarAvatar> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: 38 + (24 * _controller.value),
              height: 38 + (24 * _controller.value),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: widget.scholar.solidColor.withAlpha(((1.0 - _controller.value) * 255).round()),
                  width: 2.5,
                ),
              ),
            ),
            if (_controller.value > 0.5)
              Container(
                width: 38 + (24 * (_controller.value - 0.5) * 2),
                height: 38 + (24 * (_controller.value - 0.5) * 2),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: widget.scholar.solidColor.withAlpha(((1.0 - (_controller.value - 0.5) * 2) * 255).round()),
                    width: 1.5,
                  ),
                ),
              ),
            child!,
          ],
        );
      },
      child: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          color: widget.scholar.solidColor,
          shape: BoxShape.circle,
          border: Border.all(
            color: AppTheme.getBorderColorFor(widget.scholar.solidColor),
            width: 2.5,
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          widget.scholar.initials,
          style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 13),
        ),
      ),
    );
  }
}

// =========================================================================
// CHATTAB WIDGET
// =========================================================================
class ChatTab extends StatefulWidget {
  final AppState appState;

  const ChatTab({super.key, required this.appState});

  @override
  State<ChatTab> createState() => _ChatTabState();
}

class _ChatTabState extends State<ChatTab> {
  final ScrollController _scrollController = ScrollController();
  bool _isTyping = false;
  String _lastScholarResponse = "";

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _onSendMessage(String text) {
    final scholar = widget.appState.selectedScholar;
    if (scholar == null || text.trim().isEmpty) return;

    widget.appState.sendUserChatMessage(scholar.id, text);
    _scrollToBottom();
    
    setState(() {
      _isTyping = true;
    });

    Timer(const Duration(milliseconds: 1400), () {
      if (!mounted) return;
      
      setState(() {
        _isTyping = false;
      });

      int matchIndex = scholar.suggestedQuestions.indexWhere(
        (q) => q.toLowerCase().replaceAll('‘', '‘') == text.toLowerCase().replaceAll('‘', '‘')
      );

      String response;
      if (matchIndex != -1) {
        response = scholar.fallbackResponses[matchIndex];
        widget.appState.awardStars(1);
      } else {
        response = "Mening ismim ${scholar.name}. Ushbu savolingizga kelasi safar albatta javob beraman! Hozircha pastdagi savollardan birini tanlab ko‘ring.";
      }

      widget.appState.sendScholarResponse(scholar.id, response);
      setState(() {
        _lastScholarResponse = response;
      });
      _scrollToBottom();
    });
  }

  void _simulateCamera() {
    widget.appState.triggerCameraSimulation();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text("Kamera skanerlandi", style: AppTheme.headerSmall),
        content: Text(
          "Kitob sahifasidagi ma‘lumotlar muvaffaqiyatli o‘qildi va allomaga yuborildi! +2 yulduzcha",
          style: AppTheme.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _onSendMessage("Rasm yuborildi: Tarixiy kitob sahifasi");
            },
            child: const Text("Tugatish"),
          ),
        ],
      ),
    );
  }

  void _simulateMic() {
    widget.appState.triggerMicSimulation();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text("Ovoz yozilmoqda...", style: AppTheme.headerSmall),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (i) => Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                width: 6,
                height: 24 + (i % 2 == 0 ? 12 : 0),
                decoration: BoxDecoration(
                  color: AppTheme.mandarin,
                  borderRadius: BorderRadius.circular(4),
                ),
              )),
            ),
            const SizedBox(height: 12),
            Text("Ovozli savolingiz allomaga yuborilmoqda. +2 yulduzcha", style: AppTheme.bodyMedium, textAlign: TextAlign.center),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              final questions = widget.appState.selectedScholar!.suggestedQuestions;
              _onSendMessage(questions[0]);
            },
            child: const Text("Ovozni yuborish"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = widget.appState;
    final scholar = state.selectedScholar;

    if (scholar == null) {
      return _buildScholarGrid();
    }

    final chatLogs = state.chatHistory[scholar.id] ?? [];
    
    // Proactive opening greeting trigger (Dopamine Flow)
    if (chatLogs.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        state.sendScholarResponse(scholar.id, scholar.automatedGreeting);
      });
    }

    return Scaffold(
      backgroundColor: AppTheme.porcelain,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.darkPurple),
          onPressed: () => state.selectScholar(null),
        ),
        title: Row(
          children: [
            PulseRadarAvatar(scholar: scholar),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(scholar.name, style: AppTheme.headerSmall.copyWith(fontSize: 14)),
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppTheme.mintGreen,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text("tarmoqda", style: AppTheme.bodySmall.copyWith(fontSize: 10, color: AppTheme.mintGreen)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          Row(
            children: [
              const Icon(Icons.subtitles_rounded, color: AppTheme.darkPurple, size: 18),
              Switch(
                value: state.inclusiveMode,
                activeTrackColor: AppTheme.mandarin,
                onChanged: (val) => state.toggleInclusiveMode(val),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Guardrail Display
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: AppTheme.pastelPeach,
            child: Row(
              children: [
                const Icon(Icons.shield_rounded, color: AppTheme.darkPurpleBorder, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    "Eslatma: Men kompyuter yordamchisiman, do‘st emasman. Savollarni oilada muhokama qiling!",
                    style: AppTheme.bodySmall.copyWith(fontSize: 10, color: AppTheme.darkPurple),
                  ),
                ),
              ],
            ),
          ),

          // Messages View
          Expanded(
            child: Stack(
              children: [
                ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.only(bottom: 100, top: 10),
                  itemCount: chatLogs.length + 1,
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      // Render Bouncing Portrait and Lottie/Rive Animation indicator at the top
                      return _buildBouncingPortrait(scholar);
                    }
                    final msg = chatLogs[index - 1];
                    return _buildChatBubble(msg, scholar);
                  },
                ),
                
                if (_isTyping)
                  Positioned(
                    left: 16,
                    bottom: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: AppTheme.vibrant3DBoxDecoration(
                        color: AppTheme.white,
                        radius: 16,
                        borderWidth: 2,
                        shadowOffset: const Offset(2, 2),
                      ),
                      child: Row(
                        children: [
                          const SizedBox(
                            width: 12,
                            height: 12,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                          const SizedBox(width: 8),
                          Text("Alloma javob yozmoqda...", style: AppTheme.bodySmall),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Suggested Questions Chips
          SizedBox(
            height: 40,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              itemCount: scholar.suggestedQuestions.length,
              itemBuilder: (context, index) {
                final q = scholar.suggestedQuestions[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: ActionChip(
                    backgroundColor: AppTheme.white,
                    surfaceTintColor: Colors.transparent,
                    label: Text(
                      q,
                      style: AppTheme.bodySmall.copyWith(color: scholar.solidColor, fontWeight: FontWeight.bold),
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(color: AppTheme.getBorderColorFor(scholar.solidColor), width: 2),
                    ),
                    onPressed: () => _onSendMessage(q),
                  ),
                );
              },
            ),
          ),

          // Inclusive Mode Banner
          if (state.inclusiveMode && _lastScholarResponse.isNotEmpty)
            Container(
              width: double.infinity,
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: AppTheme.darkPurple,
                radius: 20,
                borderColor: AppTheme.yellow,
                shadowColor: AppTheme.mandarin,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.subtitles_rounded, color: AppTheme.yellow, size: 20),
                      const SizedBox(width: 6),
                      Text(
                        "SUBTITR REJIMI",
                        style: AppTheme.headerSmall.copyWith(color: AppTheme.yellow, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _lastScholarResponse,
                    style: AppTheme.headerMedium.copyWith(color: AppTheme.yellow, fontSize: 24),
                  ),
                ],
              ),
            ),

          // Custom Input Bar Capsule
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                GestureDetector(
                  onTap: _simulateCamera,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.marineBlue, radius: 18, borderWidth: 2.5, shadowOffset: const Offset(2, 2)),
                    child: const Icon(Icons.camera_alt_rounded, color: AppTheme.white, size: 20),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _simulateMic,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.mandarin, radius: 18, borderWidth: 2.5, shadowOffset: const Offset(2, 2)),
                    child: const Icon(Icons.mic_rounded, color: AppTheme.white, size: 20),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Container(
                    decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white, radius: 24, borderWidth: 2.5, shadowOffset: const Offset(3, 3)),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: TextField(
                      textInputAction: TextInputAction.send,
                      onSubmitted: _onSendMessage,
                      decoration: const InputDecoration(
                        hintText: "Savolingizni yozing...",
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBouncingPortrait(Scholar scholar) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Center(
        child: FloatingWidget(
          child: Column(
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: AppTheme.vibrant3DBoxDecoration(
                  color: scholar.pastelColor,
                  radius: 32,
                  borderColor: AppTheme.getBorderColorFor(scholar.solidColor),
                  shadowColor: scholar.solidColor,
                ),
                alignment: Alignment.center,
                child: Icon(
                  scholar.iconData,
                  color: scholar.solidColor,
                  size: 44,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.white,
                  border: Border.all(color: AppTheme.getBorderColorFor(scholar.solidColor), width: 1.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  "[Lottie / Rive Visual Animation Live]",
                  style: AppTheme.bodySmall.copyWith(fontSize: 8, color: scholar.solidColor, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScholarGrid() {
    return Scaffold(
      backgroundColor: AppTheme.porcelain,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        title: Text("Allomalar Dunyosi", style: AppTheme.headerMedium),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Suhbatlashish uchun birorta allomani tanlang:", style: AppTheme.bodyMedium),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: scholarsList.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.85,
              ),
              itemBuilder: (context, index) {
                final s = scholarsList[index];
                
                // Tier feature lock
                final bool isLocked = widget.appState.subscriptionTier == ParentSubscriptionTier.mini && index >= 2;

                return FloatingWidget(
                  delayMs: index * 120,
                  child: GestureDetector(
                    onTap: () {
                      if (isLocked) {
                        showDialog(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                            title: const Text("Alloma Qulflangan"),
                            content: const Text("Ushbu alloma bilan gaplashish uchun obunangizni Plus yoki Max tarifiga yangilang!"),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.of(ctx).pop(),
                                child: const Text("Yopish"),
                              ),
                            ],
                          ),
                        );
                      } else {
                        widget.appState.selectScholar(s);
                      }
                    },
                    child: Container(
                      decoration: AppTheme.vibrant3DBoxDecoration(
                        color: isLocked ? Colors.grey.shade100 : s.pastelColor,
                        radius: 24,
                        borderColor: AppTheme.getBorderColorFor(isLocked ? Colors.grey : s.solidColor),
                        shadowColor: isLocked ? Colors.grey.shade300 : s.solidColor,
                      ),
                      padding: const EdgeInsets.all(14),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  color: isLocked ? Colors.grey.shade300 : s.solidColor,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: AppTheme.getBorderColorFor(isLocked ? Colors.grey : s.solidColor),
                                    width: 2.5,
                                  ),
                                ),
                                alignment: Alignment.center,
                                child: Icon(
                                  isLocked ? Icons.lock_rounded : s.iconData,
                                  color: AppTheme.white,
                                  size: 24,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                s.name,
                                style: AppTheme.headerSmall.copyWith(fontSize: 14, color: isLocked ? Colors.grey : AppTheme.darkPurple),
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                s.field,
                                style: AppTheme.bodySmall.copyWith(fontSize: 10, fontWeight: FontWeight.bold, color: isLocked ? Colors.grey : AppTheme.greyText),
                                textAlign: TextAlign.center,
                              ),
                            ],
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

  Widget _buildChatBubble(ChatMessage msg, Scholar scholar) {
    final isUser = msg.isUser;
    final resolvedBorderColor = isUser ? AppTheme.darkMarineBlue : AppTheme.getBorderColorFor(scholar.solidColor);
    final resolvedShadowColor = isUser ? AppTheme.marineBlue : scholar.solidColor;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: scholar.solidColor,
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.getBorderColorFor(scholar.solidColor), width: 1.5),
              ),
              alignment: Alignment.center,
              child: Text(
                scholar.initials,
                style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 10),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: isUser ? AppTheme.white : scholar.solidColor,
                borderColor: resolvedBorderColor,
                shadowColor: resolvedShadowColor,
                radius: 20,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isUser ? "Siz" : scholar.name,
                    style: AppTheme.headerSmall.copyWith(
                      fontSize: 10, 
                      color: isUser ? AppTheme.mandarin : AppTheme.white,
                    ),
                  ),
                  const SizedBox(height: 2),
                  if (msg.isDrawing) ...[
                    Container(
                      width: 140,
                      height: 100,
                      margin: const EdgeInsets.symmetric(vertical: 6),
                      decoration: AppTheme.vibrant3DBoxDecoration(
                        color: AppTheme.white,
                        radius: 12,
                        borderWidth: 2,
                        shadowOffset: const Offset(2, 2),
                      ),
                      alignment: Alignment.center,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.brush_rounded, color: AppTheme.darkPurple, size: 24),
                          const SizedBox(height: 4),
                          Text("Chizgan rasmingiz", style: AppTheme.bodySmall),
                        ],
                      ),
                    ),
                  ],
                  Text(
                    msg.text,
                    style: AppTheme.bodyMedium.copyWith(
                      color: isUser ? AppTheme.darkPurple : AppTheme.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
