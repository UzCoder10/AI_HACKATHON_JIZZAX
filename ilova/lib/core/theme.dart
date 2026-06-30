import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Hyper-Vibrant Neon Colors
  static const Color spacePurple = Color(0xFF0C001F);
  static const Color cyan = Color(0xFF00F0FF);
  static const Color magenta = Color(0xFFFF007A);
  static const Color yellow = Color(0xFFFFF500);
  static const Color white = Color(0xFFFFFFFF);
  static const Color darkBlue = Color(0xFF130F26);
  static const Color greyBg = Color(0xFF1E1938);

  // Soft Accent Pastels for Cards
  static const Color pastelGold = Color(0xFFFFF7DC);
  static const Color pastelMint = Color(0xFFE3FBF7);
  static const Color pastelPeach = Color(0xFFFFECE3);
  static const Color pastelBlue = Color(0xFFECF1FF);
  static const Color pastelBrown = Color(0xFFF9F1E7);
  static const Color pastelRed = Color(0xFFFFECEC);

  // Glowing Neon BoxShadows
  static List<BoxShadow> neonGlowShadow({required Color glowColor, double blurRadius = 16.0}) {
    return [
      BoxShadow(
        color: glowColor.withAlpha(160),
        blurRadius: blurRadius,
        spreadRadius: 2,
      ),
      const BoxShadow(
        color: darkBlue,
        offset: Offset(4, 4),
        blurRadius: 0,
      ),
    ];
  }

  // Neon-Cyber Pop Decoration (Thick Borders + 2.5D shading details + optional glow)
  static BoxDecoration neonDecoration({
    required Color color,
    double radius = 28.0,
    double borderWidth = 3.5,
    bool hasGlow = false,
    Color glowColor = cyan,
    Color shadowColor = darkBlue,
    Offset shadowOffset = const Offset(5, 5),
  }) {
    return BoxDecoration(
      color: color,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(
        color: darkBlue,
        width: borderWidth,
      ),
      boxShadow: hasGlow
          ? [
              BoxShadow(
                color: glowColor.withAlpha(150),
                blurRadius: 18,
                spreadRadius: 2,
              ),
              BoxShadow(
                color: shadowColor,
                offset: shadowOffset,
                blurRadius: 0,
              ),
            ]
          : [
              BoxShadow(
                color: shadowColor,
                offset: shadowOffset,
                blurRadius: 0,
              ),
            ],
    );
  }

  static BoxDecoration glowDecoration({
    required Color color,
    required Color glowColor,
    double radius = 28.0,
  }) {
    return BoxDecoration(
      color: color,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(
        color: darkBlue,
        width: 3.5,
      ),
      boxShadow: [
        BoxShadow(
          color: glowColor.withAlpha(150),
          blurRadius: 18,
          spreadRadius: 2,
        ),
        const BoxShadow(
          color: darkBlue,
          offset: Offset(5, 5),
          blurRadius: 0,
        ),
      ],
    );
  }

  // Google Font selection (Fredoka for headers, Nunito for body)
  static TextStyle get fontHeader => GoogleFonts.fredoka(
        fontWeight: FontWeight.w800,
        color: darkBlue,
      );

  static TextStyle get fontBody => GoogleFonts.nunito(
        fontWeight: FontWeight.bold,
        color: darkBlue,
      );

  // High-energy dual-tone typography getters
  static TextStyle get headerLarge => fontHeader.copyWith(fontSize: 28);
  static TextStyle get headerMedium => fontHeader.copyWith(fontSize: 22);
  static TextStyle get headerSmall => fontHeader.copyWith(fontSize: 18);

  static TextStyle get bodyLarge => fontBody.copyWith(fontSize: 16);
  static TextStyle get bodyMedium => fontBody.copyWith(fontSize: 14);
  static TextStyle get bodySmall => fontBody.copyWith(fontSize: 12);

  static Color getThemeBg(String themeName) {
    switch (themeName) {
      case "sky-blue":
        return pastelBlue;
      case "forest-mint":
        return pastelMint;
      case "neon-cyber":
      default:
        return pastelPeach;
    }
  }

  static Color getThemeAccent(String themeName) {
    switch (themeName) {
      case "sky-blue":
        return cyan;
      case "forest-mint":
        return yellow;
      case "neon-cyber":
      default:
        return magenta;
    }
  }
}
