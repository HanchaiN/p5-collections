import 'dart:math';

import 'package:battleship_game/battleship_game_engine.dart';
import 'package:battleship_game/quotes.dart';
import 'package:battleship_game/utils.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:rflutter_alert/rflutter_alert.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Battleship Game',
      routes: {
        '/': (context) => const WelcomeScreen(),
        '/play': (context) => const PlayScreen(),
      },
      initialRoute: '/',
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        fontFamily: GoogleFonts.righteous().fontFamily,
      ),
    );
  }
}

class PlayScreen extends StatefulWidget {
  const PlayScreen({super.key});

  @override
  State<PlayScreen> createState() => _PlayScreenState();
}

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _PlayScreenState extends State<PlayScreen> {
  late final BattleshipGameEngine _battleshipGameEngine;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _battleshipGameEngine.isPlayable
              ? "${_battleshipGameEngine.unsinkShips} ship(s) left."
              : "Click anywhere to continue.",
        ),
        actions: _battleshipGameEngine.isPlayable
            ? [
                IconButton(
                  tooltip: "Give Up",
                  onPressed: () {
                    Alert(
                      context: context,
                      type: AlertType.warning,
                      title: "Are you sure?",
                      buttons: [
                        DialogButton(
                          child: const Text("Give Up"),
                          onPressed: () {
                            setState(() {
                              _battleshipGameEngine.surrender();
                            });
                            Navigator.pop(context);
                          },
                        )
                      ],
                    ).show();
                  },
                  icon: const Icon(Icons.flag_circle_rounded),
                )
              ]
            : [],
      ),
      body: Center(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SizedBox.square(
              dimension: min(constraints.maxWidth, constraints.maxHeight),
              child: Material(
                child: GridView.builder(
                  shrinkWrap: true,
                  padding: const EdgeInsets.all(8.0),
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: _battleshipGameEngine.gridSize.last,
                  ),
                  itemBuilder: (context, position) {
                    int firstIndex =
                        (position / _battleshipGameEngine.gridSize.last)
                            .floor();
                    int lastIndex =
                        (position % _battleshipGameEngine.gridSize.last);
                    Pair<int, int> location = Pair(firstIndex, lastIndex);

                    BattleshipField state =
                        _battleshipGameEngine.fieldAt(location);
                    int answer = _battleshipGameEngine.answerAt(location);
                    return InkWell(
                      onTap: () {
                        if (!_battleshipGameEngine.isPlayable) {
                          Alert(
                            context: context,
                            type: AlertType.none,
                            buttons: [
                              DialogButton(
                                child: const Text("Play Again"),
                                onPressed: () {
                                  setState(() {
                                    _battleshipGameEngine.startGame();
                                  });
                                  Navigator.pop(context);
                                },
                              ),
                              DialogButton(
                                child: const Text("Return to main screen"),
                                onPressed: () {
                                  Navigator.pop(context);
                                  Navigator.pop(context);
                                },
                              )
                            ],
                          ).show();
                          return;
                        }
                        BattleshipShootResult result =
                            BattleshipShootResult.invalid;
                        setState(() {
                          result = _battleshipGameEngine.shoot(location);
                        });
                        switch (result) {
                          case BattleshipShootResult.unplayable:
                            Alert(
                              context: context,
                              type: AlertType.none,
                              title: "This game is not yet playable.",
                              desc: "Please report this bug.",
                              buttons: [
                                DialogButton(
                                  child: const Text("Nevermind"),
                                  onPressed: () => Navigator.pop(context),
                                )
                              ],
                            ).show();
                            break;
                          case BattleshipShootResult.invalid:
                            Alert(
                              context: context,
                              type: AlertType.none,
                              title: "Invalid Tile",
                              desc: "Please report this bug.",
                              buttons: [
                                DialogButton(
                                  child: const Text("Nevermind"),
                                  onPressed: () => Navigator.pop(context),
                                )
                              ],
                            ).show();
                            break;
                          case BattleshipShootResult.win:
                            Alert(
                              context: context,
                              type: AlertType.success,
                              title: "You Won!",
                              desc:
                                  "You win in ${_battleshipGameEngine.guesses.length} guesses.",
                              buttons: [
                                DialogButton(
                                  child: const Text("Play Again"),
                                  onPressed: () {
                                    setState(() {
                                      _battleshipGameEngine.startGame();
                                    });
                                    Navigator.pop(context);
                                  },
                                ),
                                DialogButton(
                                  child: const Text("Return to main screen"),
                                  onPressed: () {
                                    Navigator.pop(context);
                                    Navigator.pop(context);
                                  },
                                )
                              ],
                            ).show();
                            break;
                          case BattleshipShootResult.duplicate:
                            break;
                          case BattleshipShootResult.miss:
                            break;
                          case BattleshipShootResult.hit:
                            break;
                          case BattleshipShootResult.sink:
                            break;
                        }
                      },
                      child: Container(
                        margin: const EdgeInsets.all(1.0),
                        color: answer == -1
                            ? _battleshipGameEngine.isPlayable
                                ? state == BattleshipField.empty
                                    ? Colors.deepPurple[100]
                                    : state == BattleshipField.miss
                                        ? Colors.lightBlue[100]
                                        : Colors.orange[100]
                                : Colors.lightBlue[100]
                            : [
                                Colors.pink,
                                Colors.red,
                                Colors.deepOrange,
                                Colors.orange,
                                Colors.amber,
                                Colors.yellow,
                                Colors.lime,
                                Colors.lightGreen,
                                Colors.green,
                              ][answer % 9][200],
                      ),
                    );
                  },
                  itemCount: _battleshipGameEngine.gridSize.first *
                      _battleshipGameEngine.gridSize.last,
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _battleshipGameEngine = BattleshipGameEngine()..startGame();
  }
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  late Quote quote;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      floatingActionButton: FloatingActionButton(
        onPressed: refresh,
        child: CircleAvatar(
          backgroundImage: NetworkImage(
            quote.profileUrl,
          ),
        ),
      ),
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        child: SizedBox(
            height: 75.0,
            child: Row(
              children: [
                Expanded(
                  flex: 9,
                  child: ListTile(
                    title: Text(
                      quote.author,
                    ),
                    subtitle: Text(
                      quote.content,
                      softWrap: true,
                    ),
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: Container(),
                ),
              ],
            )),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endDocked,
      body: Center(
        child: ElevatedButton(
          child: const Text('Start Game'),
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                duration: Duration(milliseconds: 500),
                content: Text("Battleship game have begun."),
              ),
            );
            Navigator.pushNamed(context, "/play");
          },
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    quote = defaultQuote.clone();
  }

  void refresh() async {
    final Quote newQuote = await getQuote();
    setState(() {
      quote = newQuote;
    });
  }
}
