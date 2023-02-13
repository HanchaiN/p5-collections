import 'dart:io';
import 'dart:math';
import 'dart:ui';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My Dice',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.teal,
        textTheme: const TextTheme(
          bodyMedium: TextStyle(
            color: Colors.white,
            fontSize: 50.0,
          ),
          labelLarge: TextStyle(
            color: Colors.redAccent,
            backgroundColor: Colors.amberAccent,
            fontSize: 50.0,
          ),
        ),
      ),
      home: const DicePage(),
    );
  }
}

class DicePage extends StatefulWidget {
  const DicePage({super.key});

  @override
  State<DicePage> createState() => _DicePageState();
}

class _DicePageState extends State<DicePage> {
  static final Random randomizer = Random();
  int _leftDieNumber = 1;
  int _leftDieDir = 0;
  int _rightDieNumber = 1;
  int _rightDieDir = 0;
  bool _leftRollFinished = false;
  bool _rightRollFinished = false;

  @override
  void initState() {
    super.initState();
    _leftDieNumber = randomizer.nextInt(6) + 1;
    _leftDieDir = randomizer.nextInt(4);
    _leftRollFinished = true;
    _rightDieNumber = randomizer.nextInt(6) + 1;
    _rightDieDir = randomizer.nextInt(4);
    _rightRollFinished = true;
  }

  Future<void> _shuffleLeft() async {
    if (!_leftRollFinished) return;
    _leftRollFinished = false;
    final int iter = randomizer.nextInt(15) + 10;
    for (int i = 0; i < iter; i++) {
      await Future.delayed(
          lerpDuration(
            const Duration(milliseconds: 100),
            const Duration(milliseconds: 500),
            randomizer.nextDouble() * i / iter,
          ), () {
        setState(() {
          final double p = lerpDouble(1.0, 0.0, i / iter) as double;
          if (p > randomizer.nextDouble()) {
            final nextRoll = _roll(
              _leftDieNumber,
              _leftDieDir,
              randomizer.nextInt(4),
            );
            _leftDieNumber = nextRoll[0];
            _leftDieDir = nextRoll[1];
          }
        });
      });
    }
    _leftRollFinished = true;
  }

  Future<void> _shuffleRight() async {
    if (!_rightRollFinished) return;
    _rightRollFinished = false;
    final int iter = randomizer.nextInt(15) + 10;
    for (int i = 0; i < iter; i++) {
      await Future.delayed(
          lerpDuration(
            const Duration(milliseconds: 100),
            const Duration(milliseconds: 500),
            randomizer.nextDouble() * i / iter,
          ), () {
        setState(() {
          final double p = lerpDouble(1.0, 0.5, i / iter) as double;
          if (p > randomizer.nextDouble()) {
            final nextRoll = _roll(
              _rightDieNumber,
              _rightDieDir,
              randomizer.nextInt(4),
            );
            _rightDieNumber = nextRoll[0];
            _rightDieDir = nextRoll[1];
          }
        });
      });
    }
    _rightRollFinished = true;
  }

  List<int> _roll(int number, int direction, int rollDir) {
    const List<List<List<int>>> dieStructure = [
      [],
      [
        [3, 2],
        [2, 0],
        [4, 2],
        [5, 0],
      ],
      [
        [3, 1],
        [6, 0],
        [4, 3],
        [1, 0],
      ],
      [
        [1, 2],
        [5, 1],
        [6, 0],
        [2, 3],
      ],
      [
        [6, 0],
        [5, 3],
        [1, 2],
        [2, 1],
      ],
      [
        [3, 3],
        [1, 0],
        [4, 1],
        [6, 0],
      ],
      [
        [3, 0],
        [5, 0],
        [4, 0],
        [2, 0],
      ],
    ];
    List<int> fin = dieStructure[number][(direction + rollDir) % 4];
    return [fin[0], (fin[1] + direction) % 4];
  }

  Widget _face(int number, int direction, bool finished, bool main) {
    return RotatedBox(
      quarterTurns: -direction,
      child: Image.asset(
        'images/dice$number.png',
        opacity: AlwaysStoppedAnimation(
          (finished ? 1 : .75) * (main ? 1 : .75),
        ),
      ),
    );
  }

  Widget _die(int number, int direction, bool finished) {
    List<List<int>> adjacent = [0, 1, 2, 3]
        .map((rollDir) => _roll(number, direction, rollDir))
        .toList();
    return AspectRatio(
      aspectRatio: 1.0,
      child: Column(
        children: [
          Expanded(
            flex: 1,
            child: Row(
              children: [
                Expanded(
                  flex: 1,
                  child: Container(),
                ),
                Expanded(
                  flex: 3,
                  child: Center(
                    child:
                        _face(adjacent[0][0], adjacent[0][1], finished, false),
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: Container(),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 3,
            child: Row(
              children: [
                Expanded(
                  flex: 1,
                  child: Center(
                    child:
                        _face(adjacent[3][0], adjacent[3][1], finished, false),
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: Center(
                    child: _face(number, direction, finished, true),
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: Center(
                    child:
                        _face(adjacent[1][0], adjacent[1][1], finished, false),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 1,
            child: Row(
              children: [
                Expanded(
                  flex: 1,
                  child: Container(),
                ),
                Expanded(
                  flex: 3,
                  child: Center(
                    child:
                        _face(adjacent[2][0], adjacent[2][1], finished, false),
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: Container(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Dice'),
        backgroundColor: Theme.of(context).appBarTheme.backgroundColor,
      ),
      backgroundColor: Theme.of(context).backgroundColor,
      body: Center(
        child: Column(
          children: [
            Expanded(
              flex: 1,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Visibility(
                    maintainSize: true,
                    maintainAnimation: true,
                    maintainState: true,
                    visible: _leftRollFinished &&
                        _rightRollFinished &&
                        _leftDieNumber == _rightDieNumber,
                    child: Text(
                      "Bravo",
                      style: Theme.of(context).textTheme.labelLarge,
                    ),
                  ),
                  Text(
                    _leftRollFinished && _rightRollFinished
                        ? (_leftDieNumber == _rightDieNumber
                            ? "${2 * (_leftDieNumber + _rightDieNumber)}"
                            : "${_leftDieNumber + _rightDieNumber}")
                        : "???",
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 2,
              child: Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: _shuffleLeft,
                      child:
                          _die(_leftDieNumber, _leftDieDir, _leftRollFinished),
                    ),
                  ),
                  Expanded(
                    child: TextButton(
                      onPressed: _shuffleRight,
                      child: _die(
                          _rightDieNumber, _rightDieDir, _rightRollFinished),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 1,
              child: Container(),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _shuffleLeft();
          _shuffleRight();
        },
        tooltip: 'Roll',
        child: const Icon(Icons.shuffle),
      ),
    );
  }
}
