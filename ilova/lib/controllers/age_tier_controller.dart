import 'package:flutter/material.dart';
import '../core/theme.dart';

enum AgeTier { toddler, intermediate, advanced }

class AgeTierController extends ChangeNotifier {
  AgeTier _activeTier = AgeTier.advanced;
  int _activeAge = 9;
  String _activeChildName = "Ahrorbek";

  // Roadmap & Progress
  int _activeNodeIndex = 0;
  final List<String> _badges = ["Mantiq Ustasi"];
  final int _totalLevelsUnlocked = 5;

  AgeTier get activeTier => _activeTier;
  int get activeAge => _activeAge;
  String get activeChildName => _activeChildName;
  int get activeNodeIndex => _activeNodeIndex;
  List<String> get badges => _badges;
  int get totalLevelsUnlocked => _totalLevelsUnlocked;

  void setChildProfile(String name, int age) {
    _activeChildName = name;
    _activeAge = age;
    if (age <= 5) {
      _activeTier = AgeTier.toddler;
    } else if (age <= 7) {
      _activeTier = AgeTier.intermediate;
    } else {
      _activeTier = AgeTier.advanced;
    }
    _activeNodeIndex = 0; // Reset progression
    notifyListeners();
  }

  void advanceNode() {
    if (_activeNodeIndex < 4) {
      _activeNodeIndex++;
      notifyListeners();
    }
  }

  void resetNode() {
    _activeNodeIndex = 0;
    notifyListeners();
  }

  void awardBadge(String badge) {
    if (!_badges.contains(badge)) {
      _badges.add(badge);
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

  // Dynamic Theme
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
