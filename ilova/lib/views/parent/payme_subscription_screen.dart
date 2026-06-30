import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';

class PaymeSubscriptionScreen extends StatefulWidget {
  final AppState appState;

  const PaymeSubscriptionScreen({super.key, required this.appState});

  @override
  State<PaymeSubscriptionScreen> createState() => _PaymeSubscriptionScreenState();
}

class _PaymeSubscriptionScreenState extends State<PaymeSubscriptionScreen> {
  final TextEditingController _cardNumberController = TextEditingController();
  final TextEditingController _expiryController = TextEditingController();
  final TextEditingController _cvvController = TextEditingController();

  bool _isProcessing = false;

  void _onPayTap() {
    final card = _cardNumberController.text.trim();
    if (card.length < 16) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Iltimos, haqiqiy karta raqamini kiriting (16 ta raqam)")),
      );
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    // Simulate Payme/Click checkout delayed response
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      widget.appState.activatePremiumSubscription();
      setState(() {
        _isProcessing = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Obuna muvaffaqiyatli faollashtirildi! +10 yulduzcha")),
      );
      Navigator.of(context).pop();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        title: Text("To‘lov: Payme / Click", style: AppTheme.headerMedium),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.darkBlue),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.neonDecoration(color: AppTheme.pastelMint),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.credit_card_rounded, color: AppTheme.darkBlue, size: 24),
                      const SizedBox(width: 8),
                      Text("Premium Paket", style: AppTheme.headerSmall),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text("Barcha allomalar, qiziqarli o‘yinlar va to‘liq audio darsliklar paketi.", style: AppTheme.bodySmall),
                  const SizedBox(height: 10),
                  Text("Narxi: 19 000 so‘m / oy", style: AppTheme.headerMedium.copyWith(color: AppTheme.magenta, fontSize: 18)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Card inputs
            Text("Karta Ma‘lumotlari", style: AppTheme.headerSmall),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.neonDecoration(color: AppTheme.white),
              child: Column(
                children: [
                  TextField(
                    controller: _cardNumberController,
                    keyboardType: TextInputType.number,
                    maxLength: 16,
                    decoration: const InputDecoration(
                      hintText: "8600 **** **** ****",
                      labelText: "Karta raqami (Uzcard / Humo)",
                      counterText: "",
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _expiryController,
                          keyboardType: TextInputType.number,
                          maxLength: 4,
                          decoration: const InputDecoration(
                            hintText: "08/29",
                            labelText: "Muddati",
                            counterText: "",
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextField(
                          controller: _cvvController,
                          keyboardType: TextInputType.number,
                          maxLength: 3,
                          obscureText: true,
                          decoration: const InputDecoration(
                            hintText: "***",
                            labelText: "CVV2",
                            counterText: "",
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Submit Button
            _isProcessing
                ? const Center(child: CircularProgressIndicator())
                : GestureDetector(
                    onTap: _onPayTap,
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      decoration: AppTheme.neonDecoration(color: AppTheme.cyan),
                      alignment: Alignment.center,
                      child: Text("To‘lash (Payme / Click)", style: AppTheme.headerMedium),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}
