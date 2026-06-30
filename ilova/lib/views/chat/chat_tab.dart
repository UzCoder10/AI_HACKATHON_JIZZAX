import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/data_models.dart';
import '../../controllers/app_state.dart';

class ChatTab extends StatefulWidget {
  final AppState appState;

  const ChatTab({super.key, required this.appState});

  @override
  State<ChatTab> createState() => _ChatTabState();
}

class _ChatTabState extends State<ChatTab> with SingleTickerProviderStateMixin {
  final ScrollController _scrollController = ScrollController();
  bool _isTyping = false;
  String _lastScholarResponse = "";

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 3.0, end: 12.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
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

    return Scaffold(
      backgroundColor: AppTheme.porcelain,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.darkBlue),
          onPressed: () => state.selectScholar(null),
        ),
        title: Row(
          children: [
            AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                return Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: scholar.solidColor.withAlpha(80),
                        blurRadius: _pulseAnimation.value,
                        spreadRadius: _pulseAnimation.value / 4,
                      )
                    ],
                  ),
                  child: child,
                );
              },
              child: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: scholar.solidColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.darkBlue, width: 2),
                ),
                alignment: Alignment.center,
                child: Text(
                  scholar.initials,
                  style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 12),
                ),
              ),
            ),
            const SizedBox(width: 8),
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
              const Icon(Icons.subtitles_rounded, color: AppTheme.darkBlue, size: 18),
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
          // Non-Companion Guardrail Display
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: AppTheme.pastelPeach,
            child: Row(
              children: [
                const Icon(Icons.shield_rounded, color: AppTheme.darkBlue, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    "Eslatma: Men kompyuter yordamchisiman, do‘st emasman. Savollarni oilada muhokama qiling!",
                    style: AppTheme.bodySmall.copyWith(fontSize: 10),
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
                  itemCount: chatLogs.length,
                  itemBuilder: (context, index) {
                    final msg = chatLogs[index];
                    return _buildChatBubble(msg, scholar);
                  },
                ),
                
                if (_isTyping)
                  Positioned(
                    left: 16,
                    bottom: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: AppTheme.vibrantDecoration(
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
                      side: const BorderSide(color: AppTheme.darkBlue, width: 2),
                    ),
                    onPressed: () => _onSendMessage(q),
                  ),
                );
              },
            ),
          ),

          // Inclusive Mode High Contrast Subtitle Box (Deep contrasted black box + 24pt bold yellow text)
          if (state.inclusiveMode && _lastScholarResponse.isNotEmpty)
            Container(
              width: double.infinity,
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.vibrantDecoration(
                color: AppTheme.darkBlue,
                radius: 20,
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
                    decoration: AppTheme.vibrantDecoration(color: AppTheme.marineBlue, radius: 18, borderWidth: 2.5, shadowOffset: const Offset(2, 2)),
                    child: const Icon(Icons.camera_alt_rounded, color: AppTheme.white, size: 20),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _simulateMic,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: AppTheme.vibrantDecoration(color: AppTheme.mandarin, radius: 18, borderWidth: 2.5, shadowOffset: const Offset(2, 2)),
                    child: const Icon(Icons.mic_rounded, color: AppTheme.white, size: 20),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Container(
                    decoration: AppTheme.vibrantDecoration(color: AppTheme.white, radius: 24, borderWidth: 2.5, shadowOffset: const Offset(3, 3)),
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
                return GestureDetector(
                  onTap: () => widget.appState.selectScholar(s),
                  child: Container(
                    decoration: AppTheme.vibrantDecoration(
                      color: s.pastelColor,
                      radius: 24,
                    ),
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: s.solidColor,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.darkBlue, width: 2.5),
                          ),
                          alignment: Alignment.center,
                          child: Icon(
                            s.iconData,
                            color: AppTheme.white,
                            size: 24,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          s.name,
                          style: AppTheme.headerSmall.copyWith(fontSize: 14),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          s.field,
                          style: AppTheme.bodySmall.copyWith(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.greyText),
                          textAlign: TextAlign.center,
                        ),
                        Text(
                          s.years,
                          style: AppTheme.bodySmall.copyWith(fontSize: 8, color: AppTheme.darkBlue.withAlpha(150)),
                          textAlign: TextAlign.center,
                        ),
                      ],
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
                border: Border.all(color: AppTheme.darkBlue, width: 1.5),
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
              decoration: BoxDecoration(
                color: isUser ? AppTheme.white : scholar.solidColor, // Scholar bubble is filled with their bright signature layout token
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: Radius.circular(isUser ? 20 : 4),
                  bottomRight: Radius.circular(isUser ? 4 : 20),
                ),
                border: Border.all(color: AppTheme.darkBlue, width: 2.5),
                boxShadow: const [
                  BoxShadow(
                    color: AppTheme.darkBlue,
                    offset: Offset(3, 3),
                  )
                ],
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
                      decoration: AppTheme.vibrantDecoration(
                        color: AppTheme.white,
                        radius: 12,
                        borderWidth: 2,
                        shadowOffset: const Offset(2, 2),
                      ),
                      alignment: Alignment.center,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.brush_rounded, color: AppTheme.darkBlue, size: 24),
                          const SizedBox(height: 4),
                          Text("Chizgan rasmingiz", style: AppTheme.bodySmall),
                        ],
                      ),
                    ),
                  ],
                  Text(
                    msg.text,
                    style: AppTheme.bodyMedium.copyWith(
                      color: isUser ? AppTheme.darkBlue : AppTheme.white,
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
