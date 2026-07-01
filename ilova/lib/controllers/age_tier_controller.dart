import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../core/theme.dart';

enum AgeTier { toddler, intermediate, advanced }

enum BuildingMaterial { brick, wood, stone }

class AgeTierController extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  StreamSubscription<User?>? _authSubscription;
  StreamSubscription<DocumentSnapshot>? _childSubscription;

  User? _currentUser;
  String? _activeChildId;
  String _activeChildName = "Ahrorbek";
  int _activeAge = 9;
  AgeTier _activeTier = AgeTier.advanced;

  // Roadmap & Progression States
  int _activeNodeIndex = 0;
  int _starsCount = 0;
  List<String> _badges = ["Mantiq Ustasi"];
  List<String> _focusAreas = ["Aniq Fanlar", "Tanqidiy Fikr"];
  
  // Game states
  BuildingMaterial _selectedMaterial = BuildingMaterial.brick;
  final List<BuildingMaterial> _unlockedMaterials = [
    BuildingMaterial.brick,
    BuildingMaterial.wood,
    BuildingMaterial.stone,
  ];

  AgeTierController() {
    _authSubscription = _auth.authStateChanges().listen((user) {
      _currentUser = user;
      if (user == null) {
        _activeChildId = null;
        _childSubscription?.cancel();
        _childSubscription = null;
        notifyListeners();
      } else {
        _autoSelectFirstChild();
      }
    });
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    _childSubscription?.cancel();
    super.dispose();
  }

  // Getters
  User? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  String? get activeChildId => _activeChildId;
  String get activeChildName => _activeChildName;
  int get activeAge => _activeAge;
  AgeTier get activeTier => _activeTier;
  int get activeNodeIndex => _activeNodeIndex;
  int get starsCount => _starsCount;
  List<String> get badges => _badges;
  List<String> get focusAreas => _focusAreas;
  BuildingMaterial get selectedMaterial => _selectedMaterial;
  List<BuildingMaterial> get unlockedMaterials => _unlockedMaterials;

  // Set local state in case Firestore is unavailable
  void setChildProfileLocal(String name, int age, {List<String>? areas}) {
    _activeChildName = name;
    _activeAge = age;
    if (areas != null) {
      _focusAreas = areas;
    }
    if (age <= 5) {
      _activeTier = AgeTier.toddler;
    } else if (age <= 7) {
      _activeTier = AgeTier.intermediate;
    } else {
      _activeTier = AgeTier.advanced;
    }
    notifyListeners();
  }

  // Select child profile & bind Firestore real-time stream
  Future<void> selectChildProfile(String childId) async {
    _childSubscription?.cancel();
    _activeChildId = childId;

    if (_currentUser == null) return;

    final docPath = _firestore
        .collection('users')
        .doc(_currentUser!.uid)
        .collection('children')
        .doc(childId);

    _childSubscription = docPath.snapshots().listen((snapshot) {
      if (snapshot.exists) {
        final data = snapshot.data() as Map<String, dynamic>;
        _activeChildName = data['name'] ?? "Ahrorbek";
        _activeAge = data['age'] ?? 9;
        
        // Adaptive tier categorization
        if (_activeAge <= 5) {
          _activeTier = AgeTier.toddler;
        } else if (_activeAge <= 7) {
          _activeTier = AgeTier.intermediate;
        } else {
          _activeTier = AgeTier.advanced;
        }

        _activeNodeIndex = data['activeNodeIndex'] ?? 0;
        _starsCount = data['stars'] ?? 0;
        
        final rawBadges = data['badges'] as List?;
        if (rawBadges != null) {
          _badges = rawBadges.map((e) => e.toString()).toList();
        }

        final rawAreas = data['focusAreas'] as List?;
        if (rawAreas != null) {
          _focusAreas = rawAreas.map((e) => e.toString()).toList();
        }

        notifyListeners();
      }
    });
  }

  Future<void> _autoSelectFirstChild() async {
    if (_currentUser == null) return;
    try {
      final snapshot = await _firestore
          .collection('users')
          .doc(_currentUser!.uid)
          .collection('children')
          .limit(1)
          .get();

      if (snapshot.docs.isNotEmpty) {
        selectChildProfile(snapshot.docs.first.id);
      } else {
        final newChildRef = _firestore
            .collection('users')
            .doc(_currentUser!.uid)
            .collection('children')
            .doc();

        await newChildRef.set({
          'name': 'Ahrorbek',
          'age': 9,
          'activeNodeIndex': 0,
          'stars': 0,
          'badges': ['Mantiq Ustasi'],
          'focusAreas': ['Aniq Fanlar', 'Tanqidiy Fikr'],
        });

        selectChildProfile(newChildRef.id);
      }
    } catch (e) {
      setChildProfileLocal("Ahrorbek", 9);
    }
  }

  // Push score updates directly to Cloud Firestore streams
  Future<void> syncStarsToCloud(int additionalStars) async {
    _starsCount += additionalStars;
    notifyListeners();

    if (_currentUser == null || _activeChildId == null) return;
    try {
      final docPath = _firestore
          .collection('users')
          .doc(_currentUser!.uid)
          .collection('children')
          .doc(_activeChildId);

      await _firestore.runTransaction((transaction) async {
        final freshSnapshot = await transaction.get(docPath);
        if (freshSnapshot.exists) {
          final int currentStars = freshSnapshot.data()?['stars'] ?? 0;
          transaction.update(docPath, {'stars': currentStars + additionalStars});
        }
      });
    } catch (e) {
      debugPrint("Offline Sync: Stars cached locally");
    }
  }

  Future<void> advanceNode() async {
    await syncNodeAdvance();
  }

  Future<void> syncNodeAdvance() async {
    if (_activeNodeIndex < 4) {
      _activeNodeIndex++;
      notifyListeners();
      
      if (_currentUser != null && _activeChildId != null) {
        try {
          await _firestore
              .collection('users')
              .doc(_currentUser!.uid)
              .collection('children')
              .doc(_activeChildId)
              .update({'activeNodeIndex': _activeNodeIndex});
        } catch (e) {
          debugPrint("Offline Sync: Active node advanced locally");
        }
      }
    }
  }

  Future<void> syncAwardBadge(String badge) async {
    if (!_badges.contains(badge)) {
      _badges.add(badge);
      notifyListeners();

      if (_currentUser != null && _activeChildId != null) {
        try {
          await _firestore
              .collection('users')
              .doc(_currentUser!.uid)
              .collection('children')
              .doc(_activeChildId)
              .update({
            'badges': FieldValue.arrayUnion([badge])
          });
        } catch (e) {
          debugPrint("Offline Sync: Badge saved locally");
        }
      }
    }
  }

  Future<void> syncFocusAreas(List<String> areas) async {
    _focusAreas = areas;
    notifyListeners();

    if (_currentUser != null && _activeChildId != null) {
      try {
        await _firestore
            .collection('users')
            .doc(_currentUser!.uid)
            .collection('children')
            .doc(_activeChildId)
            .update({'focusAreas': areas});
      } catch (e) {
        debugPrint("Offline Sync: Focus areas saved locally");
      }
    }
  }

  bool _voiceAIActive = false;
  bool get voiceAIActive => _voiceAIActive;

  bool _sandboxBlockerActive = false;
  bool get sandboxBlockerActive => _sandboxBlockerActive;

  void toggleVoiceAI(bool active) {
    _voiceAIActive = active;
    notifyListeners();
  }

  void toggleSandboxBlocker(bool val) {
    _sandboxBlockerActive = val;
    notifyListeners();
  }

  Future<void> updateChildProfileLocalAndRemote(String name, int age) async {
    setChildProfileLocal(name, age);
    if (_currentUser != null && _activeChildId != null) {
      try {
        await _firestore
            .collection('users')
            .doc(_currentUser!.uid)
            .collection('children')
            .doc(_activeChildId)
            .update({
              'name': name,
              'age': age,
            });
      } catch (e) {
        debugPrint("Failed to sync child profile: $e");
      }
    }
  }

  void selectMaterial(BuildingMaterial material) {
    if (_unlockedMaterials.contains(material)) {
      _selectedMaterial = material;
      notifyListeners();
    }
  }

  Color getAccentColor() {
    switch (_activeTier) {
      case AgeTier.toddler:
        return AppTheme.mintGreen;
      case AgeTier.intermediate:
        return AppTheme.marineBlue;
      case AgeTier.advanced:
        return AppTheme.mandarin;
    }
  }

  double getGameDifficultyMultiplier() {
    switch (_activeTier) {
      case AgeTier.toddler:
        return 0.5;
      case AgeTier.intermediate:
        return 1.0;
      case AgeTier.advanced:
        return 1.5;
    }
  }

  List<int> getAdaptiveNavigationMenu() {
    switch (_activeTier) {
      case AgeTier.toddler:
        return [0, 1, 4];
      case AgeTier.intermediate:
        return [0, 1, 2, 4];
      case AgeTier.advanced:
        return [0, 1, 2, 3, 4];
    }
  }

  String getBiomeName() {
    switch (_activeTier) {
      case AgeTier.toddler:
        return "Sweet Fruity Forest";
      case AgeTier.intermediate:
        return "Explorer Space Station";
      case AgeTier.advanced:
        return "Ancient Alloma Citadel";
    }
  }

  Color getBiomeBgColor() {
    switch (_activeTier) {
      case AgeTier.toddler:
        return AppTheme.pastelMint;
      case AgeTier.intermediate:
        return AppTheme.pastelBlue;
      case AgeTier.advanced:
        return AppTheme.pastelPeach;
    }
  }
}
