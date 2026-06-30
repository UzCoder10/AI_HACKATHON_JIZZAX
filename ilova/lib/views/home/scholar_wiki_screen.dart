import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/data_models.dart';
import '../../controllers/app_state.dart';

class ScholarWikiScreen extends StatelessWidget {
  final Scholar scholar;
  final AppState appState;

  const ScholarWikiScreen({
    super.key,
    required this.scholar,
    required this.appState,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        title: Text(scholar.name, style: AppTheme.headerMedium),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.darkBlue),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Block card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: AppTheme.neonDecoration(color: scholar.pastelColor),
              child: Row(
                children: [
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      color: scholar.solidColor,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.darkBlue, width: 3),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      scholar.initials,
                      style: AppTheme.headerMedium.copyWith(color: Colors.white, fontSize: 24),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(scholar.name, style: AppTheme.headerMedium),
                        Text(scholar.field, style: AppTheme.bodyLarge.copyWith(color: scholar.solidColor)),
                        Text(scholar.years, style: AppTheme.bodySmall),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // HISTORICAL LOCATION & MAP REPRESENTATION
            Row(
              children: [
                const Icon(Icons.location_on_rounded, color: AppTheme.darkBlue, size: 24),
                const SizedBox(width: 8),
                Text("Tarixiy faoliyat maskani", style: AppTheme.headerMedium),
              ],
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: AppTheme.neonDecoration(color: AppTheme.white),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_city_rounded, color: AppTheme.darkBlue, size: 20),
                      const SizedBox(width: 10),
                      Text(scholar.historyLocation, style: AppTheme.headerSmall),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Stylized Vector Map representation
                  Container(
                    height: 100,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppTheme.pastelBlue,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.darkBlue, width: 2.5),
                    ),
                    child: Stack(
                      children: [
                        Positioned(
                          left: 70,
                          top: 40,
                          child: Column(
                            children: [
                              Container(
                                width: 14,
                                height: 14,
                                decoration: const BoxDecoration(
                                  color: AppTheme.magenta,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.darkBlue,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  scholar.mapLabel,
                                  style: AppTheme.fontHeader.copyWith(color: Colors.white, fontSize: 8),
                                ),
                              )
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // KEY CONTRIBUTIONS
            Row(
              children: [
                const Icon(Icons.workspace_premium_rounded, color: AppTheme.darkBlue, size: 24),
                const SizedBox(width: 8),
                Text("Asosiy Kashfiyotlari", style: AppTheme.headerMedium),
              ],
            ),
            const SizedBox(height: 10),
            ...scholar.keyDiscoveries.map((discovery) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: AppTheme.neonDecoration(color: AppTheme.white, radius: 16, borderWidth: 2.5, shadowOffset: const Offset(3, 3)),
                  child: Row(
                    children: [
                      const Icon(Icons.arrow_right_alt_rounded, color: AppTheme.magenta, size: 24),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(discovery, style: AppTheme.bodyMedium),
                      ),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 24),

            // FAMOUS QUOTE
            Text("Mashhur Hikmatli So‘zi", style: AppTheme.headerMedium),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: AppTheme.neonDecoration(
                color: AppTheme.yellow,
                shadowColor: AppTheme.magenta,
              ),
              child: Column(
                children: [
                  const Icon(Icons.format_quote_rounded, color: AppTheme.darkBlue, size: 40),
                  Text(
                    scholar.famousQuote,
                    style: AppTheme.headerSmall,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text("- ${scholar.name}", style: AppTheme.bodySmall),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // START CHAT BUTTON
            GestureDetector(
              onTap: () {
                appState.selectScholar(scholar);
                Navigator.of(context).pop();
                appState.changeTab(1); // Chat Tab
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: AppTheme.neonDecoration(color: AppTheme.cyan),
                alignment: Alignment.center,
                child: Text("Suhbatni boshlash", style: AppTheme.headerMedium),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
