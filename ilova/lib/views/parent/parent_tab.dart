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
            // Safe Alert Escalation Banner (No black, cherry borders/shadows)
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

            // Premium Check
            if (!state.isPremiumSubscribed) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: AppTheme.vibrant3DBoxDecoration(
                  color: AppTheme.yellow,
                  borderColor: AppTheme.darkYellow,
                  shadowColor: AppTheme.mandarin,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Premium A‘zolik (Payme / Click)", style: AppTheme.headerSmall),
                    const SizedBox(height: 4),
                    Text("Barcha allomalar va audio darsliklarni to‘liq ochish uchun obunani rasmiylashtiring.", style: AppTheme.bodySmall),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.darkPurple,
                        foregroundColor: AppTheme.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: AppTheme.darkPurpleBorder, width: 1.5),
                        ),
                      ),
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

            // Weekly Mood Metrics (Fills: Marine Blue, Mint Green, Mandarin Orange, borders: dark versions)
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

            // Academic Interest profile
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
          ],
        ),
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
