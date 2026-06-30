import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';
import 'payme_subscription_screen.dart';

class ParentTab extends StatefulWidget {
  final AppState appState;

  const ParentTab({super.key, required this.appState});

  @override
  State<ParentTab> createState() => _ParentTabState();
}

class _ParentTabState extends State<ParentTab> {
  bool _isUnlocked = false;
  String _pinCodeInput = "";
  final String _correctPin = "2026";
  String _pinErrorMessage = "";

  void _onPinKeyTap(String value) {
    setState(() {
      _pinErrorMessage = "";
      if (_pinCodeInput.length < 4) {
        _pinCodeInput += value;
      }
      
      if (_pinCodeInput.length == 4) {
        if (_pinCodeInput == _correctPin) {
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
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text("Ota-onalar nazorati", style: AppTheme.headerMedium),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_rounded, size: 54, color: AppTheme.magenta),
              const SizedBox(height: 14),
              Text(
                "Ota-onalar sahifasiga kirish",
                style: AppTheme.headerMedium,
              ),
              const SizedBox(height: 6),
              Text(
                "Iltimos, PIN kodni kiriting (Parol: 2026)",
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
                      color: isFilled ? AppTheme.magenta : Colors.grey.shade200,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.darkBlue, width: 2),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 12),
              if (_pinErrorMessage.isNotEmpty)
                Text(
                  _pinErrorMessage,
                  style: AppTheme.bodySmall.copyWith(color: Colors.red, fontWeight: FontWeight.bold),
                ),
              const SizedBox(height: 32),

              // Keyboard Layout
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
                      // Lock/Empty
                      return const SizedBox.shrink();
                    }
                    if (index == 10) {
                      return _buildPinKeyButton("0");
                    }
                    if (index == 11) {
                      // Delete
                      return GestureDetector(
                        onTap: _onDeleteTap,
                        child: Container(
                          decoration: AppTheme.neonDecoration(
                            color: AppTheme.white,
                            radius: 16,
                            borderWidth: 2,
                            shadowOffset: const Offset(2, 2),
                          ),
                          alignment: Alignment.center,
                          child: const Icon(Icons.backspace_rounded, color: AppTheme.darkBlue),
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
        decoration: AppTheme.neonDecoration(
          color: AppTheme.white,
          radius: 16,
          borderWidth: 2,
          shadowOffset: const Offset(2, 2),
        ),
        alignment: Alignment.center,
        child: Text(
          val,
          style: AppTheme.headerMedium,
        ),
      ),
    );
  }

  // Parents Analytics Dashboard
  Widget _buildParentDashboard() {
    final state = widget.appState;
    final fav = state.favoriteScholar;

    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text("Tahlil va Hisobotlar", style: AppTheme.headerMedium),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppTheme.darkBlue),
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
              decoration: AppTheme.neonDecoration(
                color: AppTheme.pastelPeach,
                glowColor: AppTheme.magenta,
                hasGlow: true,
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: AppTheme.magenta, size: 28),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Xavfsizlik Signali (Safety Alert)",
                          style: AppTheme.headerSmall.copyWith(color: AppTheme.magenta, fontSize: 13),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          "Farzandingiz shu haftada ba‘zi suhbatlarda yolg‘izlikni his qildi. Allomalar unga faqat sabr va ilm haqida maslahat berdilar (AI do‘st emas, maslahatchi).",
                          style: AppTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Payme subscription widget
            if (!state.isPremiumSubscribed) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: AppTheme.neonDecoration(color: AppTheme.yellow),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Premium A‘zolik (Payme / Click)", style: AppTheme.headerSmall),
                    const SizedBox(height: 4),
                    Text("Barcha allomalar va audio darsliklarni to‘liq ochish uchun obunani rasmiylashtiring.", style: AppTheme.bodySmall),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.darkBlue),
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => PaymeSubscriptionScreen(appState: state),
                          ),
                        );
                      },
                      child: Text("Hozir faollashtirish", style: AppTheme.fontHeader.copyWith(color: Colors.white, fontSize: 12)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Weekly Mood Metrics (Visual Vector Bars)
            Text("Haftalik Emotsional Holat (Kayfiyat)", style: AppTheme.headerMedium),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.neonDecoration(color: AppTheme.white),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      _buildGraphBar("Du", 0.8, AppTheme.cyan),
                      _buildGraphBar("Se", 0.6, AppTheme.magenta),
                      _buildGraphBar("Ch", 0.9, AppTheme.yellow),
                      _buildGraphBar("Pa", 0.4, AppTheme.cyan),
                      _buildGraphBar("Ju", 0.7, AppTheme.magenta),
                      _buildGraphBar("Sh", 0.5, AppTheme.yellow),
                      _buildGraphBar("Ya", 0.95, AppTheme.cyan),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildLegendCircle(AppTheme.cyan, "Xursand"),
                      const SizedBox(width: 14),
                      _buildLegendCircle(AppTheme.magenta, "Oddiy"),
                      const SizedBox(width: 14),
                      _buildLegendCircle(AppTheme.yellow, "Xafa"),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Academic Interest profile
            Text("Qiziqishlar Profili (Academic Profile)", style: AppTheme.headerMedium),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.neonDecoration(color: AppTheme.pastelBlue),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: fav.solidColor,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.darkBlue, width: 2),
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
                          style: AppTheme.bodySmall.copyWith(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildGraphBar(String day, double heightFactor, Color barColor) {
    return Column(
      children: [
        Container(
          height: 100 * heightFactor,
          width: 16,
          decoration: BoxDecoration(
            color: barColor,
            border: Border.all(color: AppTheme.darkBlue, width: 1.5),
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(height: 6),
        Text(day, style: AppTheme.bodySmall),
      ],
    );
  }

  Widget _buildLegendCircle(Color color, String text) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: Border.all(color: AppTheme.darkBlue, width: 1),
          ),
        ),
        const SizedBox(width: 4),
        Text(text, style: AppTheme.bodySmall),
      ],
    );
  }
}
