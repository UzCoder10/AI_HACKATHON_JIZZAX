import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
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
  int _currentStep = 0; // 0: Parent PIN, 1: Firebase Auth, 2: Child Profile Creation
  bool _isSignUpMode = true;

  // Controllers
  final TextEditingController _pinController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _nameController = TextEditingController(); // Child name
  
  // Parent Registration Details
  final TextEditingController _parentNameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  String _selectedRelation = "Ota";
  bool _termsAccepted = false;

  int _selectedAge = 5;
  late AnimationController _animController;
  late Animation<double> _fadeAnimation;
  bool _isLoading = false;

  // Real-time password checklist
  bool _hasSixChars = false;
  bool _hasNumber = false;

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

    _passwordController.addListener(_validatePassword);
  }

  void _validatePassword() {
    final text = _passwordController.text;
    setState(() {
      _hasSixChars = text.length >= 6;
      _hasNumber = text.contains(RegExp(r'[0-9]'));
    });
  }

  @override
  void dispose() {
    _pinController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _parentNameController.dispose();
    _phoneController.dispose();
    _animController.dispose();
    super.dispose();
  }

  void _nextStep() async {
    if (_isLoading) return;

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
            content: Text("Noto'g'ri PIN! Ota-ona ruxsati uchun '2026' kodini kiriting."),
            backgroundColor: AppTheme.appleRed,
          ),
        );
      }
    } else if (_currentStep == 1) {
      final email = _emailController.text.trim();
      final password = _passwordController.text.trim();

      if (_isSignUpMode) {
        final parentName = _parentNameController.text.trim();
        final phone = _phoneController.text.trim();

        if (parentName.isEmpty || phone.isEmpty || email.isEmpty || password.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Iltimos, barcha ro'yxatdan o'tish ma'lumotlarini kiriting!"),
              backgroundColor: AppTheme.appleRed,
            ),
          );
          return;
        }

        if (!_hasSixChars || !_hasNumber) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Parol xavfsizlik talablariga javob bermaydi!"),
              backgroundColor: AppTheme.appleRed,
            ),
          );
          return;
        }

        if (!_termsAccepted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Iltimos, foydalanish shartlariga rozilik bildiring!"),
              backgroundColor: AppTheme.appleRed,
            ),
          );
          return;
        }

        setState(() => _isLoading = true);

        try {
          final cred = await FirebaseAuth.instance.createUserWithEmailAndPassword(
            email: email,
            password: password,
          );
          
          if (cred.user != null) {
            await FirebaseFirestore.instance.collection('users').doc(cred.user!.uid).set({
              'parentName': parentName,
              'parentPhone': phone,
              'parentEmail': email,
              'parentRelation': _selectedRelation,
              'createdAt': FieldValue.serverTimestamp(),
            });

            setState(() {
              _currentStep = 2;
            });
            _animController.reset();
            _animController.forward();
          }
        } on FirebaseAuthException catch (e) {
          if (!mounted) return;
          String errMsg = "Xatolik yuz berdi: ${e.message}";
          if (e.code == 'weak-password') errMsg = "Parol juda zaif!";
          if (e.code == 'email-already-in-use') errMsg = "Ushbu email ro'yxatdan o'tgan!";
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(errMsg), backgroundColor: AppTheme.appleRed),
          );
        } catch (e) {
          if (!mounted) return;
          setState(() {
            _currentStep = 2;
          });
          _animController.reset();
          _animController.forward();
        } finally {
          setState(() => _isLoading = false);
        }
      } else {
        // Sign In Mode
        if (email.isEmpty || password.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Email va parolni kiriting!"),
              backgroundColor: AppTheme.appleRed,
            ),
          );
          return;
        }

        setState(() => _isLoading = true);

        try {
          final cred = await FirebaseAuth.instance.signInWithEmailAndPassword(
            email: email,
            password: password,
          );

          if (cred.user != null) {
            widget.appState.completeOnboarding();
          }
        } on FirebaseAuthException catch (_) {
          if (!mounted) return;
          String errMsg = "Kirishda xatolik: Email yoki parol noto'g'ri!";
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(errMsg), backgroundColor: AppTheme.appleRed),
          );
        } catch (_) {
          if (!mounted) return;
          widget.appState.completeOnboarding();
        } finally {
          setState(() => _isLoading = false);
        }
      }
    } else if (_currentStep == 2) {
      final name = _nameController.text.trim();
      if (name.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Iltimos, bolaning ismini kiriting!"),
            backgroundColor: AppTheme.appleRed,
          ),
        );
        return;
      }

      setState(() => _isLoading = true);

      try {
        final user = FirebaseAuth.instance.currentUser;
        if (user != null) {
          final newChildRef = FirebaseFirestore.instance
              .collection('users')
              .doc(user.uid)
              .collection('children')
              .doc();

          await newChildRef.set({
            'name': name,
            'age': _selectedAge,
            'activeNodeIndex': 0,
            'stars': 0,
            'badges': ['Mantiq Ustasi'],
          });

          if (!mounted) return;
          final ageController = Provider.of<AgeTierController>(context, listen: false);
          await ageController.selectChildProfile(newChildRef.id);
        } else {
          if (!mounted) return;
          final ageController = Provider.of<AgeTierController>(context, listen: false);
          ageController.setChildProfileLocal(name, _selectedAge);
        }
      } catch (e) {
        debugPrint(e.toString());
      } finally {
        setState(() => _isLoading = false);
        widget.appState.completeOnboarding();
      }
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
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
            child: Column(
              children: [
                const SizedBox(height: 10),
                _buildHeader(),
                const SizedBox(height: 20),
                Expanded(
                  child: _buildStepBody(),
                ),
                if (_isLoading)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16.0),
                    child: CircularProgressIndicator(color: AppTheme.marineBlue),
                  )
                else
                  _buildActionButton(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStepBody() {
    if (_currentStep == 0) {
      return _buildParentGate();
    } else if (_currentStep == 1) {
      return _buildAuthGate();
    } else {
      return _buildChildProfile();
    }
  }

  Widget _buildHeader() {
    return Column(
      children: [
        const Icon(
          Icons.school_rounded,
          size: 70,
          color: AppTheme.marineBlue,
        ),
        const SizedBox(height: 8),
        Text(
          "Smart Edu Uzbekistan",
          style: AppTheme.headerLarge.copyWith(color: AppTheme.darkPurple, fontSize: 24),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        Text(
          _currentStep == 0 
              ? "Kattalar uchun xavfsizlik darvozasi" 
              : (_currentStep == 1 ? "Ota-ona hisobi" : "O'z profilingni yarat!"),
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
              "Ushbu ilova bolalar uchun xavfsiz ta'lim makonidir. Kirish uchun maxsus ota-ona PIN kodini kiriting (PIN: 2026)",
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

  Widget _buildAuthGate() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              GestureDetector(
                onTap: () => setState(() => _isSignUpMode = true),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: _isSignUpMode ? AppTheme.yellow : AppTheme.porcelain,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text("Ro'yxatdan o'tish", style: AppTheme.headerSmall.copyWith(color: _isSignUpMode ? AppTheme.white : AppTheme.darkPurple)),
                ),
              ),
              const SizedBox(width: 12),
              GestureDetector(
                onTap: () => setState(() => _isSignUpMode = false),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: !_isSignUpMode ? AppTheme.yellow : AppTheme.porcelain,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text("Tizimga kirish", style: AppTheme.headerSmall.copyWith(color: !_isSignUpMode ? AppTheme.white : AppTheme.darkPurple)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          if (_isSignUpMode) ...[
            Text("Ismingiz (Ota/Ona):", style: AppTheme.headerSmall),
            const SizedBox(height: 6),
            Container(
              decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white, radius: 16, borderWidth: 2),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                controller: _parentNameController,
                decoration: const InputDecoration(border: InputBorder.none, hintText: "Masalan: Sabohat"),
              ),
            ),
            const SizedBox(height: 14),

            Text("Telefon raqamingiz:", style: AppTheme.headerSmall),
            const SizedBox(height: 6),
            Container(
              decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white, radius: 16, borderWidth: 2),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(border: InputBorder.none, hintText: "+998 90 123 45 67"),
              ),
            ),
            const SizedBox(height: 14),

            Text("Bolaga kim bo'lasiz?", style: AppTheme.headerSmall),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: ["Ota", "Ona", "Bobo/Buvi", "Ustoz"].map((rel) {
                final bool isSelected = _selectedRelation == rel;
                return GestureDetector(
                  onTap: () => setState(() => _selectedRelation = rel),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? AppTheme.marineBlue : AppTheme.porcelain,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isSelected ? AppTheme.darkPurpleBorder : Colors.transparent, width: 1.5),
                    ),
                    child: Text(
                      rel,
                      style: AppTheme.bodySmall.copyWith(
                        fontWeight: FontWeight.bold,
                        color: isSelected ? AppTheme.white : AppTheme.darkPurple,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 14),
          ],

          Text("Email manzil:", style: AppTheme.headerSmall),
          const SizedBox(height: 6),
          Container(
            decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white, radius: 16, borderWidth: 2),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(border: InputBorder.none, hintText: "parent@example.com"),
            ),
          ),
          const SizedBox(height: 14),

          Text("Parol:", style: AppTheme.headerSmall),
          const SizedBox(height: 6),
          Container(
            decoration: AppTheme.vibrant3DBoxDecoration(color: AppTheme.white, radius: 16, borderWidth: 2),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(border: InputBorder.none, hintText: "••••••"),
            ),
          ),

          if (_isSignUpMode) ...[
            const SizedBox(height: 10),
            // Password checklist
            Row(
              children: [
                Icon(
                  _hasSixChars ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                  color: _hasSixChars ? AppTheme.mintGreen : Colors.grey,
                  size: 16,
                ),
                const SizedBox(width: 6),
                Text("Kamida 6 ta belgi", style: AppTheme.bodySmall.copyWith(color: _hasSixChars ? AppTheme.darkMintGreen : Colors.grey)),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(
                  _hasNumber ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                  color: _hasNumber ? AppTheme.mintGreen : Colors.grey,
                  size: 16,
                ),
                const SizedBox(width: 6),
                Text("Kamida bitta raqam", style: AppTheme.bodySmall.copyWith(color: _hasNumber ? AppTheme.darkMintGreen : Colors.grey)),
              ],
            ),
            const SizedBox(height: 14),

            // Terms checkbox
            Row(
              children: [
                Checkbox(
                  value: _termsAccepted,
                  activeColor: AppTheme.marineBlue,
                  onChanged: (val) {
                    setState(() {
                      _termsAccepted = val ?? false;
                    });
                  },
                ),
                Expanded(
                  child: Text(
                    "Tizim qoidalari va xavfsizlik shartlariga roziman",
                    style: AppTheme.bodySmall.copyWith(fontSize: 10),
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 20),
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
            "Bolaning ismi:",
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
          const SizedBox(height: 24),
          Text(
            "Yoshingni tanla: $_selectedAge da",
            style: AppTheme.headerSmall,
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 80,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: 7, 
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
                    width: 60,
                    height: 60,
                    decoration: AppTheme.vibrant3DBoxDecoration(
                      color: isSelected ? AppTheme.yellow : bg,
                      radius: 20,
                      borderWidth: isSelected ? 4 : 2,
                      shadowOffset: isSelected ? const Offset(3, 3) : const Offset(1, 1),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      "$age${age == 9 ? '+' : ''}",
                      style: AppTheme.headerMedium.copyWith(
                        color: isSelected ? AppTheme.white : AppTheme.darkPurple,
                        fontSize: 18,
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
          color: _currentStep == 0 
              ? AppTheme.marineBlue 
              : (_currentStep == 1 ? AppTheme.yellow : AppTheme.mandarin),
        ),
        alignment: Alignment.center,
        child: Text(
          _currentStep == 0 
              ? "Ruxsat Berish" 
              : (_currentStep == 1 ? (_isSignUpMode ? "Ro'yxatdan o'tish" : "Tizimga kirish") : "Mening Olamimga Kirish! 🚀"),
          style: AppTheme.headerMedium.copyWith(color: AppTheme.white),
        ),
      ),
    );
  }
}
