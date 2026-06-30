import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Sunny Pop UI Fruity Accent Colors
  static const Color mandarin = Color(0xFFFF6B35);
  static const Color yellow = Color(0xFFFFB627);
  static const Color marineBlue = Color(0xFF00A8E8);
  static const Color appleRed = Color(0xFFEF476F);
  static const Color mintGreen = Color(0xFF06D6A0);
  
  // Canvas Colors
  static const Color white = Color(0xFFFFFFFF);
  static const Color porcelain = Color(0xFFF4F6F9);
  static const Color darkBlue = Color(0xFF1A1A24); // High contrast borders
  static const Color greyText = Color(0xFF5D5D70);

  // Backward Compatibility Aliases for Sunny Pop UI mapping
  static const Color cyan = marineBlue;
  static const Color magenta = mandarin;

  // Soft Background Pastels (for subtle card backgrounds)
  static const Color pastelGold = Color(0xFFFFF6E5);
  static const Color pastelMint = Color(0xFFE6FAF4);
  static const Color pastelPeach = Color(0xFFFFECE5);
  static const Color pastelBlue = Color(0xFFE5F6FD);
  static const Color pastelBrown = Color(0xFFFAF3EC);
  static const Color pastelRed = Color(0xFFFCEAEF);

  // Vibrant Pop UI Decoration (Thick borders + flat offset shadows + no blur/neon lines)
  static BoxDecoration vibrantDecoration({
    required Color color,
    double radius = 28.0,
    double borderWidth = 3.0,
    Offset shadowOffset = const Offset(4, 4),
    Color shadowColor = darkBlue,
  }) {
    return BoxDecoration(
      color: color,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(
        color: darkBlue,
        width: borderWidth,
      ),
      boxShadow: [
        BoxShadow(
          color: shadowColor,
          offset: shadowOffset,
          blurRadius: 0,
          spreadRadius: 0,
        ),
      ],
    );
  }

  // Aliases for compatibility with other modular views
  static BoxDecoration neonDecoration({
    required Color color,
    double radius = 28.0,
    double borderWidth = 3.0,
    bool hasGlow = false,
    Color glowColor = marineBlue,
    Color shadowColor = darkBlue,
    Offset shadowOffset = const Offset(4, 4),
  }) {
    return vibrantDecoration(
      color: color,
      radius: radius,
      borderWidth: borderWidth,
      shadowOffset: shadowOffset,
      shadowColor: shadowColor,
    );
  }

  static BoxDecoration glowDecoration({
    required Color color,
    required Color glowColor,
    double radius = 28.0,
  }) {
    return vibrantDecoration(
      color: color,
      radius: radius,
      shadowColor: darkBlue,
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

  // Shouts and bold friendly headers
  static TextStyle get headerLarge => fontHeader.copyWith(fontSize: 28, color: darkBlue);
  static TextStyle get headerMedium => fontHeader.copyWith(fontSize: 22, color: darkBlue);
  static TextStyle get headerSmall => fontHeader.copyWith(fontSize: 18, color: darkBlue);

  static TextStyle get bodyLarge => fontBody.copyWith(fontSize: 16, color: darkBlue);
  static TextStyle get bodyMedium => fontBody.copyWith(fontSize: 14, color: darkBlue);
  static TextStyle get bodySmall => fontBody.copyWith(fontSize: 12, color: greyText);

  // Themes Color Maps
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
        return marineBlue;
      case "forest-mint":
        return mintGreen;
      case "neon-cyber":
      default:
        return mandarin;
    }
  }
}
