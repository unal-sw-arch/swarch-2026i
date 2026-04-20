import 'package:flutter/material.dart';

class PersonalizationScreen extends StatelessWidget {
  const PersonalizationScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Personalización'),
        centerTitle: true,
        elevation: 0,
      ),
      body: const Center(
        child: Text('Personalization Screen - TODO: Implement'),
      ),
    );
  }
}
