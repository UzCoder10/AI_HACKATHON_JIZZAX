import 'package:flutter/material.dart';
import '../models/data_models.dart';

class AppState extends ChangeNotifier {
  String childName = "Ahrorbek";
  int stars = 10;
  int currentLevel = 1;
  int streakDays = 4;
  
  bool hasOnboarded = false;
  bool inclusiveMode = false;
  bool isPremiumSubscribed = false;
  
  int activeTab = 0;
  Scholar? selectedScholar;
  
  // Customisations: Replaced emoji avatars with role-based vector identifiers
  String selectedAvatarRole = "child"; // child, astronomer, doctor, commander
  final List<String> unlockedAvatarRoles = ["child", "astronomer"];
  
  String activeThemeName = "neon-cyber"; // neon-cyber, sky-blue, forest-mint
  final List<String> unlockedThemes = ["neon-cyber"];

  // Logs
  final List<MoodLog> moodHistory = [
    MoodLog(date: DateTime.now().subtract(const Duration(days: 4)), mood: MoodType.happy),
    MoodLog(date: DateTime.now().subtract(const Duration(days: 3)), mood: MoodType.neutral),
    MoodLog(date: DateTime.now().subtract(const Duration(days: 2)), mood: MoodType.happy),
    MoodLog(date: DateTime.now().subtract(const Duration(days: 1)), mood: MoodType.sad),
  ];
  MoodType? loggedMoodToday;

  final Map<String, int> scholarInteractions = {
    "ulugbek": 7,
    "beruniy": 4,
    "ibnsino": 2,
    "xorazmiy": 5,
    "buxoriy": 1,
    "temur": 6,
  };

  final Map<String, List<ChatMessage>> chatHistory = {};

  final List<Quest> quests = [
    Quest(
      id: "quest_mood", 
      title: "Kayfiyat daftari", 
      description: "Kunlik kayfiyatingizni belgilang", 
      rewardStars: 2, 
      iconData: Icons.sentiment_satisfied_alt_rounded
    ),
    Quest(
      id: "quest_chat", 
      title: "Tarixiy suhbat", 
      description: "Allomalar bilan savol-javob qiling", 
      rewardStars: 3, 
      iconData: Icons.forum_rounded
    ),
    Quest(
      id: "quest_mic", 
      title: "Ovozli muloqot", 
      description: "Ovoz yozish simulationini yakunlang", 
      rewardStars: 3, 
      iconData: Icons.mic_rounded
    ),
    Quest(
      id: "quest_canvas", 
      title: "Rasm Chizish topshirig‘i", 
      description: "Custom rasm chizib, allomaga yuboring", 
      rewardStars: 5, 
      iconData: Icons.brush_rounded
    ),
  ];

  bool get isMoodLoggedToday => loggedMoodToday != null;

  // Map avatar role to material vector icon
  IconData getAvatarIcon(String role) {
    switch (role) {
      case "astronomer":
        return Icons.rocket_launch_rounded;
      case "doctor":
        return Icons.local_hospital_rounded;
      case "commander":
        return Icons.shield_rounded;
      case "child":
      default:
        return Icons.face_rounded;
    }
  }

  void completeOnboarding() {
    hasOnboarded = true;
    notifyListeners();
  }

  void changeTab(int index) {
    activeTab = index;
    notifyListeners();
  }

  void selectScholar(Scholar? scholar) {
    selectedScholar = scholar;
    notifyListeners();
  }

  void logMood(MoodType mood) {
    if (isMoodLoggedToday) return;
    loggedMoodToday = mood;
    moodHistory.add(MoodLog(date: DateTime.now(), mood: mood));
    stars += 2;
    _completeQuest("quest_mood");
    _checkLevelUp();
    notifyListeners();
  }

  void sendUserChatMessage(String scholarId, String text, {bool isDrawing = false}) {
    if (!chatHistory.containsKey(scholarId)) {
      chatHistory[scholarId] = [];
    }
    chatHistory[scholarId]!.add(
      ChatMessage(
        id: DateTime.now().toString(),
        text: text,
        isUser: true,
        timestamp: DateTime.now(),
        isDrawing: isDrawing,
      ),
    );

    scholarInteractions[scholarId] = (scholarInteractions[scholarId] ?? 0) + 1;
    _completeQuest("quest_chat");
    notifyListeners();
  }

  void sendScholarResponse(String scholarId, String text) {
    if (!chatHistory.containsKey(scholarId)) {
      chatHistory[scholarId] = [];
    }
    chatHistory[scholarId]!.add(
      ChatMessage(
        id: DateTime.now().toString(),
        text: text,
        isUser: false,
        timestamp: DateTime.now(),
      ),
    );
    notifyListeners();
  }

  void toggleInclusiveMode(bool value) {
    inclusiveMode = value;
    notifyListeners();
  }

  void awardStars(int count) {
    stars += count;
    _checkLevelUp();
    notifyListeners();
  }

  void _completeQuest(String id) {
    final idx = quests.indexWhere((q) => q.id == id);
    if (idx != -1 && !quests[idx].isCompleted) {
      quests[idx].isCompleted = true;
      stars += quests[idx].rewardStars;
    }
  }

  void submitDrawingQuest(String scholarId) {
    _completeQuest("quest_canvas");
    sendUserChatMessage(scholarId, "Chizgan rasmim: Men sayyora tasvirini chizdim!", isDrawing: true);
    stars += 5;
    _checkLevelUp();
    notifyListeners();
  }

  void triggerMicSimulation() {
    _completeQuest("quest_mic");
    stars += 2;
    _checkLevelUp();
    notifyListeners();
  }

  void triggerCameraSimulation() {
    stars += 2;
    _checkLevelUp();
    notifyListeners();
  }

  void activatePremiumSubscription() {
    isPremiumSubscribed = true;
    stars += 10;
    _checkLevelUp();
    notifyListeners();
  }

  bool unlockAvatarRole(String role, int cost) {
    if (stars >= cost && !unlockedAvatarRoles.contains(role)) {
      stars -= cost;
      unlockedAvatarRoles.add(role);
      selectedAvatarRole = role;
      notifyListeners();
      return true;
    }
    return false;
  }

  bool unlockTheme(String themeName, int cost) {
    if (stars >= cost && !unlockedThemes.contains(themeName)) {
      stars -= cost;
      unlockedThemes.add(themeName);
      activeThemeName = themeName;
      notifyListeners();
      return true;
    }
    return false;
  }

  void selectAvatarRole(String role) {
    selectedAvatarRole = role;
    notifyListeners();
  }

  void selectTheme(String themeName) {
    activeThemeName = themeName;
    notifyListeners();
  }

  void _checkLevelUp() {
    int expected = (stars / 20).floor() + 1;
    if (expected > currentLevel) {
      currentLevel = expected;
    }
  }

  Scholar get favoriteScholar {
    String favId = "ulugbek";
    int maxInter = -1;
    scholarInteractions.forEach((key, val) {
      if (val > maxInter) {
        maxInter = val;
        favId = key;
      }
    });
    return scholarsList.firstWhere((s) => s.id == favId, orElse: () => scholarsList.first);
  }
}
