import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';

class OnboardingWizard extends StatefulWidget {
  final AppState appState;

  const OnboardingWizard({super.key, required this.appState});

  @override
  State<OnboardingWizard> createState() => _OnboardingWizardState();
}

class _OnboardingWizardState extends State<OnboardingWizard> {
  final PageController _pageController = PageController();
  int _currentStep = 0;

  // Step 1 Controllers (Parent)
  final TextEditingController _parentNameController = TextEditingController();
  final TextEditingController _parentEmailController = TextEditingController();
  final TextEditingController _parentPinController = TextEditingController();

  // Step 2 Controllers (Child)
  final TextEditingController _childNameController = TextEditingController();
  int _childAge = 9;
  final List<String> _availableInterests = [
    "Astronomiya",
    "Matematika",
    "Tibbiyot",
    "Geografiya",
    "Tarix",
  ];
  final List<String> _selectedInterests = ["Astronomiya"];

  @override
  void dispose() {
    _pageController.dispose();
    _parentNameController.dispose();
    _parentEmailController.dispose();
    _parentPinController.dispose();
    _childNameController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep == 0) {
      // Validate Step 1
      final name = _parentNameController.text.trim();
      final email = _parentEmailController.text.trim();
      final pin = _parentPinController.text.trim();

      if (name.isEmpty || email.isEmpty || pin.length < 4) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Iltimos, ota-ona ma‘lumotlarini to‘liq kiriting!")),
        );
        return;
      }
      widget.appState.setupParentAuth(name, email, pin);
    }

    if (_currentStep < 1) {
      setState(() {
        _currentStep++;
      });
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    } else {
      // Complete Step 2
      final childName = _childNameController.text.trim();
      if (childName.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Iltimos, bolaning ismini kiriting!")),
        );
        return;
      }
      widget.appState.setupChildProfile(childName, _childAge, _selectedInterests);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        title: Text(
          _currentStep == 0 ? "Ota-ona ro‘yxatdan o‘tishi" : "Bola profili",
          style: AppTheme.headerMedium,
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Custom progress stepper indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12),
              child: Row(
                children: [
                  _buildStepIndicator(0, "Ota-ona"),
                  Expanded(
                    child: Container(
                      height: 4,
                      color: _currentStep >= 1 ? AppTheme.mandarin : Colors.grey.shade200,
                    ),
                  ),
                  _buildStepIndicator(1, "Bola profili"),
                ],
              ),
            ),

            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildParentStep(),
                  _buildChildStep(),
                ],
              ),
            ),

            // Navigation Button
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: GestureDetector(
                onTap: _nextStep,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: AppTheme.vibrant3DBoxDecoration(
                    color: AppTheme.mandarin,
                    borderColor: AppTheme.darkMandarin,
                    shadowColor: AppTheme.darkMandarin,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    _currentStep == 1 ? "Boshlash!" : "Keyingisi",
                    style: AppTheme.headerMedium.copyWith(color: AppTheme.white),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator(int index, String title) {
    final bool isActive = _currentStep == index;
    final bool isCompleted = _currentStep > index;

    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive
                ? AppTheme.mandarin
                : isCompleted
                    ? AppTheme.mintGreen
                    : AppTheme.porcelain,
            border: Border.all(
              color: isActive || isCompleted ? AppTheme.darkPurpleBorder : Colors.grey.shade300,
              width: 2,
            ),
          ),
          alignment: Alignment.center,
          child: isCompleted
              ? const Icon(Icons.check_rounded, color: AppTheme.white, size: 16)
              : Text(
                  "${index + 1}",
                  style: AppTheme.headerSmall.copyWith(
                    fontSize: 12,
                    color: isActive ? AppTheme.white : AppTheme.darkPurple.withAlpha(128),
                  ),
                ),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: AppTheme.bodySmall.copyWith(
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: isActive ? AppTheme.darkPurple : Colors.grey.shade400,
          ),
        ),
      ],
    );
  }

  Widget _buildParentStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Ota-ona ma‘lumotlari", style: AppTheme.headerSmall),
          const SizedBox(height: 6),
          Text(
            "Bolaning xavfsizligini ta‘minlash va tahlillarni ko‘rish uchun o‘z hisobingizni sozlang.",
            style: AppTheme.bodyMedium,
          ),
          const SizedBox(height: 24),

          // Inputs
          _buildLabel("F.I.SH. (Ismingiz)"),
          _buildTextField(_parentNameController, "Masalan: Jasurbek Alimov", TextInputType.name),
          const SizedBox(height: 16),

          _buildLabel("Elektron pochta"),
          _buildTextField(_parentEmailController, "example@mail.com", TextInputType.emailAddress),
          const SizedBox(height: 16),

          _buildLabel("Kirish PIN kodi (Ota-onalar sahifasi uchun)"),
          _buildTextField(_parentPinController, "4 xonali son (Masalan: 2026)", TextInputType.number, obscure: true, maxLength: 4),
        ],
      ),
    );
  }

  Widget _buildChildStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Farzandingiz haqida", style: AppTheme.headerSmall),
          const SizedBox(height: 6),
          Text(
            "Tavsiyalar va allomalar suhbatini farzandingizning yoshi hamda qiziqishlariga moslashtiramiz.",
            style: AppTheme.bodyMedium,
          ),
          const SizedBox(height: 24),

          _buildLabel("Farzandingiz ismi"),
          _buildTextField(_childNameController, "Masalan: Ahrorbek", TextInputType.name),
          const SizedBox(height: 16),

          _buildLabel("Yoshi: $_childAge da"),
          Slider(
            value: _childAge.toDouble(),
            min: 7,
            max: 12,
            divisions: 5,
            activeColor: AppTheme.mandarin,
            inactiveColor: Colors.grey.shade200,
            onChanged: (val) {
              setState(() {
                _childAge = val.toInt();
              });
            },
          ),
          const SizedBox(height: 16),

          _buildLabel("Qiziqishlari"),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _availableInterests.map((interest) {
              final isSel = _selectedInterests.contains(interest);
              return ChoiceChip(
                label: Text(interest, style: AppTheme.bodySmall.copyWith(fontWeight: FontWeight.bold, color: isSel ? AppTheme.white : AppTheme.darkPurple)),
                selected: isSel,
                selectedColor: AppTheme.mandarin,
                backgroundColor: AppTheme.porcelain,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: isSel ? AppTheme.darkMandarin : Colors.grey.shade300, width: 2),
                ),
                onSelected: (val) {
                  setState(() {
                    if (val) {
                      _selectedInterests.add(interest);
                    } else {
                      _selectedInterests.remove(interest);
                    }
                  });
                },
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Text(
        text,
        style: AppTheme.headerSmall.copyWith(fontSize: 13, color: AppTheme.darkPurple),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint, TextInputType type, {bool obscure = false, int? maxLength}) {
    return Container(
      decoration: AppTheme.vibrant3DBoxDecoration(
        color: AppTheme.white,
        radius: 18,
        borderWidth: 2,
        shadowOffset: const Offset(2, 2),
        borderColor: AppTheme.darkPurpleBorder,
        shadowColor: AppTheme.porcelain,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: TextField(
        controller: controller,
        keyboardType: type,
        obscureText: obscure,
        maxLength: maxLength,
        decoration: InputDecoration(
          hintText: hint,
          border: InputBorder.none,
          counterText: "",
        ),
      ),
    );
  }
}
