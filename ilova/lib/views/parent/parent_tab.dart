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
                      // Delete key
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

  // Parents Analytics Dashboard
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
            // Safe Alert Escalation Banner
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
                          "Farzandingiz shu haftada ba‘zi suhbatlarda yolg‘izlikni his qildi. Allomalar unga faqat sabr va ilm haqida maslahat berdilar (AI do‘st emas, maslahatchi).",
                          style: AppTheme.bodySmall.copyWith(color: AppTheme.darkPurple),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Tiered Subscription Model Selector (Mini, Plus, Max tabs)
            Text("A‘zolik Tariflari", style: AppTheme.headerMedium),
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
                      _buildTierTab(ParentSubscriptionTier.mini, "Mini", AppTheme.cyan),
                      _buildTierTab(ParentSubscriptionTier.plus, "Plus", AppTheme.yellow),
                      _buildTierTab(ParentSubscriptionTier.max, "Max", AppTheme.mandarin),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildSubscriptionDetails(state.subscriptionTier),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Premium Locks Checking (Plus & Max features)
            if (state.subscriptionTier == ParentSubscriptionTier.mini) ...[
              _buildFeatureLockCard("Tahlillar va Ota-ona topshiriqlari bloklangan. Foydalanish uchun tarifingizni Plus yoki Maxga yangilang!")
            ] else ...[
              // Weekly Mood Chart (Plus Feature)
              Text("Haftalik Emotsional Holat (Kayfiyat)", style: AppTheme.headerMedium),
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
                        _buildGraphBar("Du", 0.8, AppTheme.marineBlue, AppTheme.darkMarineBlue),
                        _buildGraphBar("Se", 0.6, AppTheme.mandarin, AppTheme.darkMandarin),
                        _buildGraphBar("Ch", 0.9, AppTheme.yellow, AppTheme.darkYellow),
                        _buildGraphBar("Pa", 0.4, AppTheme.mintGreen, AppTheme.darkMintGreen),
                        _buildGraphBar("Ju", 0.7, AppTheme.marineBlue, AppTheme.darkMarineBlue),
                        _buildGraphBar("Sh", 0.5, AppTheme.mandarin, AppTheme.darkMandarin),
                        _buildGraphBar("Ya", 0.95, AppTheme.mintGreen, AppTheme.darkMintGreen),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildLegendCircle(AppTheme.marineBlue, AppTheme.darkMarineBlue, "Xursand"),
                        const SizedBox(width: 14),
                        _buildLegendCircle(AppTheme.mandarin, AppTheme.darkMandarin, "Oddiy"),
                        const SizedBox(width: 14),
                        _buildLegendCircle(AppTheme.yellow, AppTheme.darkYellow, "Xafa"),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Academic Interest Profile
              Text("Qiziqishlar Profili (Academic Profile)", style: AppTheme.headerMedium),
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
                          Text("Eng ko‘p suhbatlashgan allomasi:", style: AppTheme.bodySmall),
                          Text(fav.name, style: AppTheme.headerSmall),
                          Text(
                            "Asosiy yo‘nalishi: ${fav.field}",
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
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
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
            fontSize: 12,
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
            Text("Mini Tarif (Tep-tekin)", style: AppTheme.headerSmall.copyWith(fontSize: 14)),
            const SizedBox(height: 4),
            Text("• Allomalardan faqat 2 tasi bilan muloqot (Ulug‘bek, Beruniy).", style: AppTheme.bodySmall),
            Text("• Haftalik emotsional hisobotlar yopiq.", style: AppTheme.bodySmall),
          ],
        );
      case ParentSubscriptionTier.plus:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Plus Tarif (19 000 so‘m / oy)", style: AppTheme.headerSmall.copyWith(fontSize: 14, color: AppTheme.yellow)),
            const SizedBox(height: 4),
            Text("• Barcha allomalar bilan cheksiz muloqot.", style: AppTheme.bodySmall),
            Text("• Haftalik va oylik emotsional holat tahlil jadvallari.", style: AppTheme.bodySmall),
          ],
        );
      case ParentSubscriptionTier.max:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Max Tarif (39 000 so‘m / oy)", style: AppTheme.headerSmall.copyWith(fontSize: 14, color: AppTheme.mandarin)),
            const SizedBox(height: 4),
            Text("• To‘liq allomalar + Ota-onadan maxsus topshiriq yuborish (Assignments).", style: AppTheme.bodySmall),
            Text("• Gemini Vision AI orqali bolaning chizgan rasmini psixologik tahlil qilish.", style: AppTheme.bodySmall),
            Text("• Farzand faolligi bo‘yicha ustuvor xavfsizlik ogohlantirishlari.", style: AppTheme.bodySmall),
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
          width: 16,
          decoration: BoxDecoration(
            color: barColor,
            border: Border.all(color: borderColor, width: 2.0),
            borderRadius: BorderRadius.circular(4),
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
