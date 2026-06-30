import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/data_models.dart';
import '../../controllers/app_state.dart';

class ParentTab extends StatefulWidget {
  final AppState appState;

  const ParentTab({super.key, required this.appState});

  @override
  State<ParentTab> createState() => _ParentTabState();
}

class _ParentTabState extends State<ParentTab> {
  bool _isUnlocked = false;
  String _pinCodeInput = "";
  String _pinErrorMessage = "";

  // Academic Assignment Fields
  String _selectedTopic = "Matematika";
  final List<String> _topics = ["Matematika", "Astronomiya", "Tarix", "Geografiya"];
  
  final Map<String, ParentAssignment> _topicQuizzes = {
    "Matematika": const ParentAssignment(
      topic: "Matematika",
      question: "Qaysi olim Nol (0) raqamini kiritgan va algebra faniga asos solgan?",
      options: ["Mirzo Ulug‘bek", "Al-Xorazmiy", "Ibn Sino", "Abu Rayhon Beruniy"],
      correctAnswerIndex: 1,
    ),
    "Astronomiya": const ParentAssignment(
      topic: "Astronomiya",
      question: "Samarqandda yulduzlar observatoriyasini kim qurdirgan?",
      options: ["Amir Temur", "Mirzo Ulug‘bek", "Al-Xorazmiy", "Ibn Sino"],
      correctAnswerIndex: 1,
    ),
    "Tarix": const ParentAssignment(
      topic: "Tarix",
      question: "Buyuk ipak yo‘lini tiklash va rivojlantirishga kim katta hissa qo‘shgan?",
      options: ["Mirzo Ulug‘bek", "Amir Temur", "Ibn Sino", "Al-Xorazmiy"],
      correctAnswerIndex: 1,
    ),
    "Geografiya": const ParentAssignment(
      topic: "Geografiya",
      question: "Yer radiusini tog‘ tepasidan turib ufq burchagini o‘lchash orqali hisoblagan olim kim?",
      options: ["Mirzo Ulug‘bek", "Abu Rayhon Beruniy", "Al-Xorazmiy", "Ibn Sino"],
      correctAnswerIndex: 1,
    ),
  };

  // Switch options for progress reports
  bool _telegramBotReports = true;
  bool _smsReports = false;
  bool _isPaying = false;

  void _onPinKeyTap(String value) {
    setState(() {
      _pinErrorMessage = "";
      if (_pinCodeInput.length < 4) {
        _pinCodeInput += value;
      }
      
      if (_pinCodeInput.length == 4) {
        if (_pinCodeInput == widget.appState.parentPin) {
          _isUnlocked = true;
        } else {
          _pinCodeInput = "";
          _pinErrorMessage = "Noto‘g‘ri parol. Qayta urinib ko‘ring!";
        }
      }
    });
  }

  void _onDeleteTap() {
    setState(() {
      if (_pinCodeInput.isNotEmpty) {
        _pinCodeInput = _pinCodeInput.substring(0, _pinCodeInput.length - 1);
      }
    });
  }

  void _sendAssignment() {
    final quiz = _topicQuizzes[_selectedTopic];
    if (quiz != null) {
      widget.appState.assignParentQuest(quiz);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Ota-ona topshirig‘i muvaffaqiyatli yuborildi: $_selectedTopic!"),
          backgroundColor: AppTheme.mintGreen,
        ),
      );
    }
  }

  void _openCheckoutGateway(ParentSubscriptionTier tier, String label, String price) {
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
            title: Text("To'lov Tizimi (Uzbekistan Gateway)", style: AppTheme.headerMedium),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  "Tarif: $label\nNarxi: $price",
                  style: AppTheme.bodyLarge.copyWith(fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 18),
                if (_isPaying)
                  const CircularProgressIndicator(color: AppTheme.marineBlue)
                else ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      // Payme Button
                      GestureDetector(
                        onTap: () async {
                          setModalState(() => _isPaying = true);
                          await Future.delayed(const Duration(seconds: 2));
                          widget.appState.changeSubscriptionTier(tier);
                          setModalState(() => _isPaying = false);
                          navigator.pop();
                          messenger.showSnackBar(
                            const SnackBar(
                              content: Text("Payme orqali to'lov muvaffaqiyatli amalga oshirildi! 💳"),
                              backgroundColor: AppTheme.mintGreen,
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: AppTheme.vibrant3DBoxDecoration(
                            color: const Color(0xFF3DC3C9), // Payme brand cyan
                            radius: 16,
                          ),
                          child: Text("Payme", style: AppTheme.headerSmall.copyWith(color: AppTheme.white)),
                        ),
                      ),

                      // Click Button
                      GestureDetector(
                        onTap: () async {
                          setModalState(() => _isPaying = true);
                          await Future.delayed(const Duration(seconds: 2));
                          widget.appState.changeSubscriptionTier(tier);
                          setModalState(() => _isPaying = false);
                          navigator.pop();
                          messenger.showSnackBar(
                            const SnackBar(
                              content: Text("Click orqali to'lov muvaffaqiyatli amalga oshirildi! 💳"),
                              backgroundColor: AppTheme.mintGreen,
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: AppTheme.vibrant3DBoxDecoration(
                            color: const Color(0xFF0056C6), // Click brand blue
                            radius: 16,
                          ),
                          child: Text("Click", style: AppTheme.headerSmall.copyWith(color: AppTheme.white)),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_isUnlocked) {
      return _buildPinGate();
    }

    return _buildParentDashboard();
  }

  // Numeric Keyboard PIN Gate Screen
  Widget _buildPinGate() {
    return Scaffold(
      backgroundColor: AppTheme.porcelain,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        title: Text("Ota-onalar nazorati", style: AppTheme.headerMedium),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_rounded, size: 54, color: AppTheme.mandarin),
              const SizedBox(height: 14),
              Text(
                "Ota-onalar sahifasiga kirish",
                style: AppTheme.headerMedium,
              ),
              const SizedBox(height: 6),
              Text(
                "Iltimos, sozlagan PIN kodni kiriting (Standart: 2026)",
                style: AppTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // Bullet Indicators
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (index) {
                  final bool isFilled = index < _pinCodeInput.length;
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 8),
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      color: isFilled ? AppTheme.mandarin : Colors.grey.shade200,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.darkPurpleBorder, width: 2),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 12),
              if (_pinErrorMessage.isNotEmpty)
                Text(
                  _pinErrorMessage,
                  style: AppTheme.bodySmall.copyWith(color: AppTheme.appleRed, fontWeight: FontWeight.bold),
                ),
              const SizedBox(height: 32),

              // Keyboard Layout (White circular keys wrapped in Mandarin Orange 3D offset shadows)
              Container(
                constraints: const BoxConstraints(maxWidth: 320),
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: 12,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.3,
                  ),
                  itemBuilder: (context, index) {
                    if (index == 9) {
                      return const SizedBox.shrink();
                    }
                    if (index == 10) {
                      return _buildPinKeyButton("0");
                    }
                    if (index == 11) {
                      return GestureDetector(
                        onTap: _onDeleteTap,
                        child: Container(
                          decoration: AppTheme.vibrant3DBoxDecoration(
                            color: AppTheme.white,
                            radius: 16,
                            borderWidth: 2.5,
                            shadowOffset: const Offset(3, 3),
                            borderColor: AppTheme.darkMandarin,
                            shadowColor: AppTheme.mandarin,
                          ),
                          alignment: Alignment.center,
                          child: const Icon(Icons.backspace_rounded, color: AppTheme.mandarin),
                        ),
                      );
                    }

                    final numValue = (index + 1).toString();
                    return _buildPinKeyButton(numValue);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPinKeyButton(String val) {
    return GestureDetector(
      onTap: () => _onPinKeyTap(val),
      child: Container(
        decoration: AppTheme.vibrant3DBoxDecoration(
          color: AppTheme.white,
          radius: 16,
          borderWidth: 2.5,
          shadowOffset: const Offset(3, 3),
          borderColor: AppTheme.darkMandarin,
          shadowColor: AppTheme.mandarin,
        ),
        alignment: Alignment.center,
        child: Text(
          val,
          style: AppTheme.headerMedium.copyWith(color: AppTheme.mandarin),
        ),
      ),
    );
  }

  // Parents Analytics & Monetization Dashboard
  Widget _buildParentDashboard() {
    final state = widget.appState;
    final fav = state.favoriteScholar;

    return Scaffold(
      backgroundColor: AppTheme.porcelain,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        title: Text("Tahlil va Hisobotlar", style: AppTheme.headerMedium),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppTheme.darkPurple),
            onPressed: () {
              setState(() {
                _isUnlocked = false;
                _pinCodeInput = "";
              });
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Safe Alert Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: AppTheme.pastelRed,
                borderColor: AppTheme.darkAppleRed,
                shadowColor: AppTheme.appleRed,
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: AppTheme.appleRed, size: 28),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Xavfsizlik Signali (Safety Alert)",
                          style: AppTheme.headerSmall.copyWith(color: AppTheme.appleRed, fontSize: 13),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          "Farzandingiz haftalik suhbatlarda va o'yinlarda faol qatnashdi. Seysmik barqarorlik bo'limida poydevor tuzilishini muvozanatlashtirishda qiynaldi.",
                          style: AppTheme.bodySmall.copyWith(color: AppTheme.darkPurple),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 1. BUSINESS MONETIZATION GATEWAY
            Text("Smart Edu Premium: A‘zolik Tariflari", style: AppTheme.headerMedium),
            const SizedBox(height: 4),
            Text("Nima uchun sotib olinadi? AI tahlili va haftalik SMS hisobotlar faqat premium tariflarda mavjud.", style: AppTheme.bodySmall),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.vibrant3DBoxDecoration(
                color: AppTheme.white,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildTierTab(ParentSubscriptionTier.mini, "Mini (Tekin)", AppTheme.cyan),
                      _buildTierTab(ParentSubscriptionTier.plus, "Plus", AppTheme.yellow),
                      _buildTierTab(ParentSubscriptionTier.max, "Max Premium", AppTheme.mandarin),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildSubscriptionDetails(state.subscriptionTier),
                  const SizedBox(height: 12),
                  if (state.subscriptionTier != ParentSubscriptionTier.max)
                    GestureDetector(
                      onTap: () {
                        if (state.subscriptionTier == ParentSubscriptionTier.mini) {
                          _openCheckoutGateway(ParentSubscriptionTier.plus, "Plus Tarif", "19 000 so'm / oy");
                        } else {
                          _openCheckoutGateway(ParentSubscriptionTier.max, "Max Premium Tarif", "39 000 so'm / oy");
                        }
                      },
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: AppTheme.vibrant3DBoxDecoration(
                          color: AppTheme.mintGreen,
                          borderColor: AppTheme.darkMintGreen,
                          shadowColor: AppTheme.mintGreen,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          "Hozir Faollashtirish (CLICK/PAYME)",
                          style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 13),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 2. WHY PARENTS BUY: VALUE ADDED REPORT CHANNELS
            Text("Hisobotlarni Yetkazish Kanallari", style: AppTheme.headerMedium),
            const SizedBox(height: 4),
            Text("Har dushanba farzandingiz o'quv faoliyati natijalarini to'g'ridan-to'g'ri Telegram/SMS orqali oling.", style: AppTheme.bodySmall),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white),
              child: Column(
                children: [
                  SwitchListTile(
                    title: Text("Telegram Bot orqali hisobot", style: AppTheme.headerSmall.copyWith(fontSize: 13)),
                    subtitle: Text("Aktiv: @SmartEduUzReportBot", style: AppTheme.bodySmall.copyWith(color: AppTheme.darkPurple)),
                    value: _telegramBotReports,
                    activeTrackColor: AppTheme.marineBlue,
                    activeThumbColor: AppTheme.white,
                    onChanged: (val) {
                      setState(() {
                        _telegramBotReports = val;
                      });
                    },
                  ),
                  const Divider(color: AppTheme.porcelain, height: 12),
                  SwitchListTile(
                    title: Text("SMS xabarnoma orqali hisobot", style: AppTheme.headerSmall.copyWith(fontSize: 13)),
                    subtitle: Text("Farzandingiz kuchsiz sohalari bo'yicha ogohlantirish", style: AppTheme.bodySmall),
                    value: _smsReports,
                    activeTrackColor: AppTheme.mandarin,
                    activeThumbColor: AppTheme.white,
                    onChanged: (val) {
                      if (state.subscriptionTier == ParentSubscriptionTier.mini) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text("SMS hisobotlar faqat Plus yoki Max tariflarida mavjud!"),
                            backgroundColor: AppTheme.appleRed,
                          ),
                        );
                        return;
                      }
                      setState(() {
                        _smsReports = val;
                      });
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Premium Locks Checking (Plus & Max features)
            if (state.subscriptionTier == ParentSubscriptionTier.mini) ...[
              _buildFeatureLockCard("Tahlillar va Ota-ona topshiriqlari bloklangan. Foydalanish uchun tarifingizni Plus yoki Maxga yangilang!")
            ] else ...[
              // Weekly Academic Progress Chart (Plus Feature)
              Text("O'quv Fanlari Rivojlanishi (Haftalik)", style: AppTheme.headerMedium),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: AppTheme.vibrant3DBoxDecoration(
                  color: AppTheme.white,
                  borderColor: AppTheme.darkPurpleBorder,
                  shadowColor: AppTheme.pastelBlue,
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        _buildGraphBar("Math", 0.85, AppTheme.marineBlue, AppTheme.darkMarineBlue),
                        _buildGraphBar("Logic", 0.60, AppTheme.mandarin, AppTheme.darkMandarin),
                        _buildGraphBar("History", 0.45, AppTheme.yellow, AppTheme.darkYellow),
                        _buildGraphBar("Drawing", 0.70, AppTheme.mintGreen, AppTheme.darkMintGreen),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildLegendCircle(AppTheme.marineBlue, AppTheme.darkMarineBlue, "Matematika"),
                        const SizedBox(width: 14),
                        _buildLegendCircle(AppTheme.mandarin, AppTheme.darkMandarin, "Mantiq"),
                        const SizedBox(width: 14),
                        _buildLegendCircle(AppTheme.yellow, AppTheme.darkYellow, "Tarix"),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Academic Recommendation Engine
              Text("Diagnostika va Yo'naltirish (AI Recommend)", style: AppTheme.headerMedium),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: AppTheme.vibrant3DBoxDecoration(
                  color: AppTheme.pastelBlue, 
                  borderColor: AppTheme.darkMarineBlue,
                  shadowColor: AppTheme.marineBlue,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: fav.solidColor,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppTheme.getBorderColorFor(fav.solidColor), width: 2),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        fav.initials,
                        style: AppTheme.headerSmall.copyWith(color: AppTheme.white, fontSize: 16),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("AI Diagnostika Xulosasi:", style: AppTheme.bodySmall),
                          Text("Mantiqiy minoralar seysmik barqarorligi zaifroq.", style: AppTheme.headerSmall.copyWith(fontSize: 12)),
                          Text(
                            "Tavsiya: Al-Xorazmiy minoralar topshirig'ini yuboring.",
                            style: AppTheme.bodySmall.copyWith(fontWeight: FontWeight.bold, color: AppTheme.darkPurple),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Custom AI Academic Assignments (Max Feature Only)
              if (state.subscriptionTier != ParentSubscriptionTier.max) ...[
                _buildFeatureLockCard("Custom AI Assignments va Gemini Drawing Analyser faqat Max tarifida mavjud!")
              ] else ...[
                Text("Custom AI Assignments (Ilmiy Topshiriq yuborish)", style: AppTheme.headerMedium),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: AppTheme.vibrant3DBoxDecoration(
                    color: AppTheme.white,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Bolangiz uy vazifasini yoki ilmiy qiziqishini shakllantirish uchun maxsus topshiriq va test yuboring:",
                        style: AppTheme.bodyMedium,
                      ),
                      const SizedBox(height: 14),
                      DropdownButtonFormField<String>(
                        initialValue: _selectedTopic,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: AppTheme.darkPurpleBorder, width: 2),
                          ),
                          filled: true,
                          fillColor: AppTheme.porcelain,
                        ),
                        items: _topics.map((t) {
                          return DropdownMenuItem<String>(
                            value: t,
                            child: Text(t, style: AppTheme.bodyMedium),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setState(() {
                              _selectedTopic = val;
                            });
                          }
                        },
                      ),
                      const SizedBox(height: 14),
                      GestureDetector(
                        onTap: _sendAssignment,
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: AppTheme.vibrant3DBoxDecoration(
                            color: AppTheme.mandarin,
                            borderColor: AppTheme.darkMandarin,
                            shadowColor: AppTheme.darkMandarin,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            "Topshiriqni yuborish",
                            style: AppTheme.headerSmall.copyWith(color: AppTheme.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Gemini Drawing Analyzer Feed (Max Feature Only)
                Text("Gemini Vision Rasm Tahlilchisi", style: AppTheme.headerMedium),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: AppTheme.vibrant3DBoxDecoration(
                    color: AppTheme.pastelGold,
                    borderColor: AppTheme.darkYellow,
                    shadowColor: AppTheme.yellow,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.psychology_rounded, color: AppTheme.darkPurple, size: 24),
                          const SizedBox(width: 8),
                          Text("AI Rasm Analitika Natijalari", style: AppTheme.headerSmall),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: state.drawingAnalysisLogs.length,
                        itemBuilder: (context, index) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8.0),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.circle, color: AppTheme.mandarin, size: 8),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    state.drawingAnalysisLogs[index],
                                    style: AppTheme.bodySmall.copyWith(color: AppTheme.darkPurple),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTierTab(ParentSubscriptionTier tier, String label, Color accent) {
    final bool isSelected = widget.appState.subscriptionTier == tier;
    return GestureDetector(
      onTap: () {
        widget.appState.changeSubscriptionTier(tier);
        setState(() {});
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: isSelected
            ? AppTheme.vibrant3DBoxDecoration(
                color: accent,
                radius: 16,
                borderWidth: 2,
                shadowOffset: const Offset(2, 2),
              )
            : BoxDecoration(
                color: AppTheme.porcelain,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300, width: 2),
              ),
        child: Text(
          label,
          style: AppTheme.headerSmall.copyWith(
            fontSize: 11,
            color: isSelected ? AppTheme.white : AppTheme.darkPurple.withAlpha(153),
          ),
        ),
      ),
    );
  }

  Widget _buildSubscriptionDetails(ParentSubscriptionTier tier) {
    switch (tier) {
      case ParentSubscriptionTier.mini:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Mini Tarif (Tekin)", style: AppTheme.headerSmall.copyWith(fontSize: 14)),
            const SizedBox(height: 4),
            Text("• Allomalardan faqat 2 tasi bilan muloqot (Ulug‘bek, Beruniy).", style: AppTheme.bodySmall),
            Text("• Haftalik emotsional va o'quv hisobotlari yopiq.", style: AppTheme.bodySmall),
            Text("• SMS/Telegram xabarnomalar tizimi faolsiz.", style: AppTheme.bodySmall),
          ],
        );
      case ParentSubscriptionTier.plus:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Plus Tarif (19 000 so‘m / oy)", style: AppTheme.headerSmall.copyWith(fontSize: 14, color: AppTheme.yellow)),
            const SizedBox(height: 4),
            Text("• Barcha allomalar bilan cheksiz muloqot va bilim ulashish.", style: AppTheme.bodySmall),
            Text("• Haftalik va oylik o'quv rivojlanishi tahlil jadvallari.", style: AppTheme.bodySmall),
            Text("• Haftalik Telegram Bot xabarnomalari ochiq.", style: AppTheme.bodySmall),
          ],
        );
      case ParentSubscriptionTier.max:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Max Tarif (39 000 so‘m / oy yoki 190 000 so'm / yil)", style: AppTheme.headerSmall.copyWith(fontSize: 14, color: AppTheme.mandarin)),
            const SizedBox(height: 4),
            Text("• To‘liq allomalar + Ota-onadan maxsus topshiriq yuborish (Assignments).", style: AppTheme.bodySmall),
            Text("• Gemini Vision AI orqali bolaning chizgan rasmini psixologik tahlil qilish.", style: AppTheme.bodySmall),
            Text("• Farzand faolligi bo‘yicha ustuvor xavfsizlik va SMS ogohlantirishlari.", style: AppTheme.bodySmall),
          ],
        );
    }
  }

  Widget _buildFeatureLockCard(String message) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.vibrant3DBoxDecoration(
        color: AppTheme.white,
        borderColor: Colors.grey.shade300,
        shadowColor: Colors.grey.shade200,
      ),
      child: Column(
        children: [
          const Icon(Icons.lock_outline_rounded, color: Colors.grey, size: 36),
          const SizedBox(height: 8),
          Text(
            message,
            style: AppTheme.bodySmall.copyWith(color: Colors.grey.shade600, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildGraphBar(String day, double heightFactor, Color barColor, Color borderColor) {
    return Column(
      children: [
        Container(
          height: 100 * heightFactor,
          width: 24,
          decoration: BoxDecoration(
            color: barColor,
            border: Border.all(color: borderColor, width: 2.0),
            borderRadius: BorderRadius.circular(6),
          ),
        ),
        const SizedBox(height: 6),
        Text(day, style: AppTheme.bodySmall.copyWith(color: AppTheme.darkPurple)),
      ],
    );
  }

  Widget _buildLegendCircle(Color color, Color borderColor, String text) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: Border.all(color: borderColor, width: 1.5),
          ),
        ),
        const SizedBox(width: 4),
        Text(text, style: AppTheme.bodySmall.copyWith(color: AppTheme.darkPurple)),
      ],
    );
  }
}
