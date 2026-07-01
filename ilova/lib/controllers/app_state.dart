import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/data_models.dart';
import '../core/gemini_service.dart';

class AppState extends ChangeNotifier {
  // Authentication & Onboarding
  bool hasOnboarded = false;
  String parentName = "";
  String parentEmail = "";
  String parentPin = "2026";

  AppState() {
    if (FirebaseAuth.instance.currentUser != null) {
      hasOnboarded = true;
    }
  }
  
  String childName = "Ahrorbek";
  int childAge = 9;
  List<String> childInterests = ["Astronomiya"];

  // Subscription Settings
  ParentSubscriptionTier subscriptionTier = ParentSubscriptionTier.mini; // mini, plus, max

  // State Variables
  int stars = 10;
  int currentLevel = 1;
  int streakDays = 4;
  bool inclusiveMode = false;
  
  int activeTab = 0;
  Scholar? selectedScholar;
  
  String selectedAvatarRole = "child"; // child, astronomer, doctor, commander
  final List<String> unlockedAvatarRoles = ["child", "astronomer"];
  
  String activeThemeName = "neon-cyber"; 
  final List<String> unlockedThemes = ["neon-cyber"];

  // Logs & History
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
  };

  final Map<String, List<ChatMessage>> chatHistory = {};

  // Parent Assigned Active Quests
  ParentAssignment? activeAssignment;
  bool isAssignmentCompleted = false;

  // Mock Gemini Vision AI drawing analysis
  final List<String> drawingAnalysisLogs = [
    "Farzandingiz yorqin ko‘k va to‘q qizil ranglarni ishlatmoqda, uning ijodiy salohiyati yuqori.",
    "Chizilgan sayyora tasviri koinotga qiziqishi baland ekanini ko‘rsatadi.",
  ];

  // Gamified Shorts feed data
  final List<ShortVideoCard> shortsFeed = [
    ShortVideoCard(
      id: "sh-1",
      title: "Observatoriya",
      fact: "Mirzo Ulug‘bek Samarqandda balandligi 40 metrli ulkan sekstant asbobini qurdirgan. U yordamida quyosh yilini 365 kun, 6 soat, 10 daqiqagacha juda aniq o‘lchagan!",
      question: "Ulug‘bek yozgan yulduzlar jadvali qanday ataladi?",
      answer: "Ziji Jadidi Ko‘ragoniy",
      accentColor: const Color(0xFF00A8E8),
    ),
    ShortVideoCard(
      id: "sh-2",
      title: "Algebra Kashfiyoti",
      fact: "Al-Xorazmiy nol (0) raqamini arifmetikaga kiritib, sanoq sistemasini o‘zgartirgan. U yozgan kitoblar nomidan algebra va algoritm so‘zlari kelib chiqqan.",
      question: "Algebra so‘zi qaysi arabcha so‘zdan olingan?",
      answer: "Al-jabr",
      accentColor: const Color(0xFFFF6B35),
    ),
    ShortVideoCard(
      id: "sh-3",
      title: "Tibbiyot Qonuni",
      fact: "Ibn Sino yozgan 'Tibbiyot qonunlari' kitobi Yevropada 500 yildan ortiq vaqt davomida shifokorlar tayyorlash uchun asosiy qo‘llanma bo‘lgan.",
      question: "Ibn Sino Yevropada qanday nom bilan mashhur?",
      answer: "Avitsenna",
      accentColor: const Color(0xFF06D6A0),
    ),
  ];

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

  // Multi-step Onboarding setups
  void setupParentAuth(String name, String email, String pin) {
    parentName = name;
    parentEmail = email;
    parentPin = pin;
    notifyListeners();
  }

  void setupChildProfile(String name, int age, List<String> interests) {
    childName = name;
    childAge = age;
    childInterests = interests;
    hasOnboarded = true;
    notifyListeners();
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

  bool isPremiumSubscribed = false;

  void changeSubscriptionTier(ParentSubscriptionTier tier) {
    subscriptionTier = tier;
    isPremiumSubscribed = true; // Automatically unlocks premium features
    notifyListeners();
  }

  // Custom Parent Quests Assignment
  void assignParentQuest(ParentAssignment assignment) {
    activeAssignment = assignment;
    isAssignmentCompleted = false;
    notifyListeners();
  }

  void completeParentQuest() {
    if (activeAssignment != null && !isAssignmentCompleted) {
      isAssignmentCompleted = true;
      stars += activeAssignment!.rewardStars;
      _checkLevelUp();
      activeAssignment = null; // Clear after completion
      notifyListeners();
    }
  }

  // Mock Gemini Vision AI Analyzer
  void submitDrawingForGeminiAnalysis() async {
    const prompt = "Bolaning koinot va yulduzlar chizgan rasmini psixologik tahlil qiling. Farzandning ijodiy va shaxsiy rivojlanishi haqida ota-onaga tavsiyalar bering. Javob qisqa, o'zbek tilida va qiziqarli bo'lsin (maksimum 3 ta gap).";
    final response = await GeminiService.generateTextResponse(prompt);
    drawingAnalysisLogs.add("Yangi tahlil: $response");
    notifyListeners();
  }

  // Shorts Interaction
  void likeShortVideoCard(String id) {
    final idx = shortsFeed.indexWhere((s) => s.id == id);
    if (idx != -1) {
      shortsFeed[idx].likes++;
      stars += 1; // Gain 1 star per double-tap like (Dopamine loops)
      _checkLevelUp();
      notifyListeners();
    }
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
