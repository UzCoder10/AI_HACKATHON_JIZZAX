import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Sunny Pop UI Fruity Accent Colors
  static const Color mandarin = Color(0xFFFF6B35);
  static const Color yellow = Color(0xFFFFB627);
  static const Color marineBlue = Color(0xFF00A8E8);
  static const Color appleRed = Color(0xFFEF476F);
  static const Color mintGreen = Color(0xFF06D6A0);
  
  // Canvas Colors (No black, dark purple replaces black)
  static const Color white = Color(0xFFFFFFFF);
  static const Color porcelain = Color(0xFFF4F6F9);
  static const Color darkPurple = Color(0xFF231F40); // Deep text highlight
  static const Color greyText = Color(0xFF5D5D70);

  // High-contrast vibrant border/shadow colors (No cold black)
  static const Color darkMandarin = Color(0xFFC84E1B);
  static const Color darkYellow = Color(0xFFC9840B);
  static const Color darkMarineBlue = Color(0xFF0075A2);
  static const Color darkAppleRed = Color(0xFFC02A4F);
  static const Color darkMintGreen = Color(0xFF049E75);
  static const Color darkPurpleBorder = Color(0xFF1E1A36);

  // Soft Background Pastels
  static const Color pastelGold = Color(0xFFFFF6E5);
  static const Color pastelMint = Color(0xFFE6FAF4);
  static const Color pastelPeach = Color(0xFFFFECE5);
  static const Color pastelBlue = Color(0xFFE5F6FD);
  static const Color pastelBrown = Color(0xFFFAF3EC);
  static const Color pastelRed = Color(0xFFFCEAEF);

  // Backward compatibility alias constants
  static const Color cyan = marineBlue;
  static const Color magenta = mandarin;
  static const Color darkBlue = darkPurpleBorder;

  // Helper to resolve border/shadow colors based on fill color
  static Color getBorderColorFor(Color color) {
    if (color == white) return darkPurpleBorder;
    if (color == porcelain) return darkPurpleBorder;
    if (color == mandarin || color == pastelPeach) return darkMandarin;
    if (color == marineBlue || color == pastelBlue) return darkMarineBlue;
    if (color == yellow || color == pastelGold) return darkYellow;
    if (color == appleRed || color == pastelRed) return darkAppleRed;
    if (color == mintGreen || color == pastelMint) return darkMintGreen;
    return darkPurpleBorder;
  }

  // Pure Vibrant 3D Box Decoration (No black, flat offset shadows)
  static BoxDecoration vibrant3DBoxDecoration({
    required Color color,
    Color? borderColor,
    Color? shadowColor,
    double radius = 28.0,
    double borderWidth = 3.0,
    Offset shadowOffset = const Offset(4, 4),
  }) {
    final resolvedBorder = borderColor ?? getBorderColorFor(color);
    final resolvedShadow = shadowColor ?? resolvedBorder;

    return BoxDecoration(
      color: color,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(
        color: resolvedBorder,
        width: borderWidth,
      ),
      boxShadow: [
        BoxShadow(
          color: resolvedShadow,
          offset: shadowOffset,
          blurRadius: 0,
          spreadRadius: 0,
        ),
      ],
    );
  }

  // Neon decoration backward compatibility map (routing to vibrant3DBoxDecoration)
  static BoxDecoration neonDecoration({
    required Color color,
    double radius = 28.0,
    double borderWidth = 3.0,
    bool hasGlow = false,
    Color? glowColor,
    Color? shadowColor,
    Offset shadowOffset = const Offset(4, 4),
  }) {
    return vibrant3DBoxDecoration(
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
    return vibrant3DBoxDecoration(
      color: color,
      radius: radius,
      shadowColor: getBorderColorFor(glowColor),
    );
  }

  static BoxDecoration vibrantDecoration({
    required Color color,
    double radius = 28.0,
    double borderWidth = 3.0,
    Offset shadowOffset = const Offset(4, 4),
    Color? shadowColor,
  }) {
    return vibrant3DBoxDecoration(
      color: color,
      radius: radius,
      borderWidth: borderWidth,
      shadowOffset: shadowOffset,
      shadowColor: shadowColor,
    );
  }

  // Google Font selection (Fredoka for headers, Nunito for body)
  static TextStyle get fontHeader => GoogleFonts.fredoka(
        fontWeight: FontWeight.w800,
        color: darkPurple,
      );

  static TextStyle get fontBody => GoogleFonts.nunito(
        fontWeight: FontWeight.bold,
        color: darkPurple,
      );

  // Friendly typography
  static TextStyle get headerLarge => fontHeader.copyWith(fontSize: 28, color: darkPurple);
  static TextStyle get headerMedium => fontHeader.copyWith(fontSize: 22, color: darkPurple);
  static TextStyle get headerSmall => fontHeader.copyWith(fontSize: 18, color: darkPurple);

  static TextStyle get bodyLarge => fontBody.copyWith(fontSize: 16, color: darkPurple);
  static TextStyle get bodyMedium => fontBody.copyWith(fontSize: 14, color: darkPurple);
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
