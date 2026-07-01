import 'package:flutter_test/flutter_test.dart';
import 'package:smart_edu_uzbekistan/main.dart';

void main() {
  testWidgets('Smoke test for Nihol', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const NiholApp());

    // Verify that our welcome text or title is found.
    expect(find.text('Nihol'), findsOneWidget);
  });
}
