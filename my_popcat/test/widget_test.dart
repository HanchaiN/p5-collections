// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:my_popcat/main.dart';

void main() {
  testWidgets('Counter increments and reset smoke test',
      (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const Main());

    // Verify that our counter starts at 0.
    expect(find.text('0'), findsWidgets);
    expect(find.text('1'), findsNothing);

    // Tap the background and trigger a frame.
    await tester.tap(find.byType(CachedNetworkImage));
    await tester.pump();

    // Verify that our counter has incremented.
    expect(find.text('0'), findsNothing);
    expect(find.text('1'), findsWidgets);

    // Tap the reload icon and trigger a frame.
    await tester.tap(find.byIcon(Icons.refresh_rounded));
    await tester.pump();

    // Verify that our counter has reset.
    expect(find.text('0'), findsWidgets);
    expect(find.text('1'), findsNothing);
  });
}
