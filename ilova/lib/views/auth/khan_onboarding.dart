import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../controllers/app_state.dart';
import '../../controllers/age_tier_controller.dart';

class KhanOnboarding extends StatefulWidget {
  final AppState appState;

  const KhanOnboarding({super.key, required this.appState});

  @override
  State<KhanOnboarding> createState() => _KhanOnboardingState();
}

class _KhanOnboardingState extends State<KhanOnboarding> with SingleTickerProviderStateMixin {
  int _currentStep = 0;
  final TextEditingController _pinController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  int _selectedAge = 5;

  late AnimationController _animController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeInOut,
    );
    _animController.forward();
  }

  @override
  void dispose() {
    _pinController.dispose();
    _nameController.dispose();
    _animController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep == 0) {
      if (_pinController.text.trim() == '2026') {
        setState(() {
          _currentStep = 1;
        });
        _animController.reset();
        _animController.forward();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Noto'g'ri kod! Ota-ona ruxsati uchun '2026' kodini kiriting."),
            backgroundColor: AppTheme.appleRed,
          ),
        );
      }
    } else if (_currentStep == 1) {
      final name = _nameController.text.trim();
      if (name.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Iltimos, ismingizni kiriting!"),
            backgroundColor: AppTheme.appleRed,
          ),
        );
        return;
      }
      
      // Update AgeTierController and AppState
      final ageController = Provider.of<AgeTierController>(context, listen: false);
      ageController.setChildProfile(name, _selectedAge);
      widget.appState.setupChildProfile(name, _selectedAge, ["Astronomiya"]);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.white,
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              children: [
                const SizedBox(height: 20),
                _buildHeader(),
                const SizedBox(height: 40),
                Expanded(
                  child: _currentStep == 0 ? _buildParentGate() : _buildChildProfile(),
                ),
                _buildActionButton(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Image.network(
          'https://img.icons8.com/color/120/000000/owl.png', // Khan Kids style owl representation
          height: 90,
          errorBuilder: (context, error, stackTrace) => const Icon(
            Icons.school_rounded,
            size: 80,
            color: AppTheme.marineBlue,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          "Smart Edu Uzbekistan",
          style: AppTheme.headerLarge.copyWith(color: AppTheme.darkPurple),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 6),
        Text(
          _currentStep == 0 
              ? "Kattalar uchun xavfsizlik darvozasi" 
              : "O'z profilingni yarat!",
          style: AppTheme.bodyMedium.copyWith(color: AppTheme.greyText),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildParentGate() {
    return SingleChildScrollView(
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: AppTheme.vibrant3DBoxDecoration(
              color: AppTheme.pastelGold,
              borderColor: AppTheme.yellow,
            ),
            child: Text(
              "Ushbu ilova bolalar uchun xavfsiz ta'lim makonidir. Kirish uchun maxsus ota-ona PIN kodini kiriting (Standart PIN: 2026)",
              style: AppTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 30),
          Text(
            "PIN kodni kiriting:",
            style: AppTheme.headerSmall,
          ),
          const SizedBox(height: 12),
          Container(
            width: 200,
            decoration: AppTheme.vibrant3DBoxDecoration(
              color: AppTheme.white,
              radius: 18,
              borderWidth: 2,
              shadowOffset: const Offset(2, 2),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TextField(
              controller: _pinController,
              keyboardType: TextInputType.number,
              obscureText: true,
              maxLength: 4,
              textAlign: TextAlign.center,
              style: AppTheme.headerLarge.copyWith(letterSpacing: 10),
              decoration: const InputDecoration(
                hintText: "••••",
                border: InputBorder.none,
                counterText: "",
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChildProfile() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Ismingni yoz:",
            style: AppTheme.headerSmall,
          ),
          const SizedBox(height: 8),
          Container(
            decoration: AppTheme.vibrant3DBoxDecoration(
              color: AppTheme.white,
              radius: 18,
              borderWidth: 2,
              shadowOffset: const Offset(2, 2),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TextField(
              controller: _nameController,
              style: AppTheme.bodyLarge,
              decoration: const InputDecoration(
                hintText: "Masalan: Ahrorbek",
                border: InputBorder.none,
              ),
            ),
          ),
          const SizedBox(height: 32),
          Text(
            "Yoshingni tanla: $_selectedAge da",
            style: AppTheme.headerSmall,
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 90,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: 7, // Ages 3 to 9+
              itemBuilder: (context, index) {
                final age = index + 3;
                final isSelected = _selectedAge == age;
                
                Color bg = AppTheme.pastelBlue;
                if (age <= 5) bg = AppTheme.pastelMint;
                if (age >= 8) bg = AppTheme.pastelPeach;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedAge = age;
                    });
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(right: 12, bottom: 8),
                    width: 70,
                    height: 70,
                    decoration: AppTheme.vibrant3DBoxDecoration(
                      color: isSelected ? AppTheme.yellow : bg,
                      radius: 24,
                      borderWidth: isSelected ? 4 : 2,
                      shadowOffset: isSelected ? const Offset(3, 3) : const Offset(1, 1),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      "$age${age == 9 ? '+' : ''}",
                      style: AppTheme.headerMedium.copyWith(
                        color: isSelected ? AppTheme.white : AppTheme.darkPurple,
                        fontSize: 20,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton() {
    return GestureDetector(
      onTap: _nextStep,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: AppTheme.vibrant3DBoxDecoration(
          color: _currentStep == 0 ? AppTheme.marineBlue : AppTheme.mandarin,
        ),
        alignment: Alignment.center,
        child: Text(
          _currentStep == 0 ? "Ruxsat Berish" : "Mening Olamimga Kirish! 🚀",
          style: AppTheme.headerMedium.copyWith(color: AppTheme.white),
        ),
      ),
    );
  }
}
