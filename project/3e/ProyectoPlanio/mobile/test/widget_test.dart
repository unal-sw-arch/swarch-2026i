// This is a basic Flutter widget test for Planio app.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:planio_app/main.dart';

void main() {
  testWidgets('Planio app starts without errors', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ProviderScope(child: PlanioApp()));

    // Verify that the app loaded (check for basic elements)
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
