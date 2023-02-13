import 'dart:convert';

import "package:flutter/material.dart";
import 'package:http/http.dart' as http;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "My TF Quiz App",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        // This is the theme of your application.
        //
        // Try running your application with "flutter run". You"ll see the
        // application has a blue toolbar. Then, without quitting the app, try
        // changing the primarySwatch below to Colors.green and then invoke
        // "hot reload" (press "r" in the console where you ran "flutter run",
        // or simply save your changes to "hot reload" in a Flutter IDE).
        // Notice that the counter didn"t reset back to zero; the application
        // is not restarted.
        primarySwatch: Colors.blueGrey,
        backgroundColor: Colors.blueGrey[50],
        textTheme: const TextTheme(
          button: TextStyle(
            color: Colors.white,
            fontSize: 20.0,
          ),
          bodyText1: TextStyle(
            fontSize: 25.0,
            color: Colors.black87,
          ),
        ),
      ),
      home: const MyQuiz(
        title: "My TF Quiz App",
        fullScore: 10,
      ),
    );
  }
}

class MyQuiz extends StatefulWidget {
  final String title;

  final int fullScore;
  const MyQuiz({super.key, required this.title, required this.fullScore});

  @override
  State<MyQuiz> createState() => _MyQuizState();
}

class QuestionDone extends StatelessWidget {
  final String text;

  final String buttonText;
  final void Function() handler;
  const QuestionDone({
    super.key,
    required this.text,
    required this.buttonText,
    required this.handler,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          flex: 5,
          child: Padding(
            padding: const EdgeInsets.all(10.0),
            child: Center(
              child: Text(
                text,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyText1,
              ),
            ),
          ),
        ),
        Expanded(
          flex: 2,
          child: Padding(
            padding: const EdgeInsets.all(15.0),
            child: ElevatedButton(
              onPressed: handler,
              child: Text(
                buttonText,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class TFQuestion extends StatelessWidget {
  final String question;

  final void Function(bool) handler;
  const TFQuestion({
    super.key,
    required this.question,
    required this.handler,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          flex: 5,
          child: Padding(
            padding: const EdgeInsets.all(10.0),
            child: Center(
              child: Text(
                question,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyText1,
              ),
            ),
          ),
        ),
        Expanded(
          flex: 2,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(15.0),
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal[900]),
                    child: const Text(
                      "True",
                    ),
                    onPressed: () => handler(true),
                  ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(15.0),
                  child: ElevatedButton(
                    style:
                        ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    child: const Text(
                      "False",
                    ),
                    onPressed: () => handler(false),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _MyQuizState extends State<MyQuiz> {
  //create an empty list
  List<bool> scoreKeeper = [];

  late List<MapEntry<String, bool>> questions;

  late List<MapEntry<String, bool>> preloadedQuestions = {
    "This is the correct spelling of \"Supercalifragilisticexpialidocious\".":
        true,
    "Dihydrogen Monoxide was banned due to health risks after being discovered in 1983 inside swimming pools and drinking water.":
        false,
    "\"Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo.\" is a grammatically correct sentence.":
        true,
    "The mitochondria is the powerhouse of the cell.": true,
    "Albert Einstein had trouble with mathematics when he was in school.":
        false,
  }.entries.toList()
    ..shuffle();

  int get questionNumber {
    return scoreKeeper.length;
  }

  int get score {
    if (scoreKeeper.isEmpty) return 0;
    return scoreKeeper
        .map((correct) => correct ? 1 : 0)
        .reduce((value, element) => value + element);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).backgroundColor,
      appBar: AppBar(
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(widget.title),
        actions: <Widget>[
          IconButton(
            icon: const Icon(
              Icons.undo_rounded,
            ),
            onPressed: undo,
          ),
          IconButton(
            icon: const Icon(
              Icons.refresh_rounded,
            ),
            onPressed: refresh,
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Expanded(
                child: Column(
                  children: [
                    Expanded(
                      flex: 1,
                      child: Row(
                        children: [
                          Expanded(
                            child: Row(
                              children: scoreKeeper
                                  .map(
                                    (correct) => correct
                                        ? const Icon(
                                            Icons.check_rounded,
                                            color: Colors.green,
                                          )
                                        : const Icon(
                                            Icons.close_rounded,
                                            color: Colors.red,
                                          ),
                                  )
                                  .toList(),
                            ),
                          ),
                          Text(
                            "Question ${scoreKeeper.length}/${questions.length}",
                            style: Theme.of(context).textTheme.caption,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                flex: 15,
                child: questionNumber < questions.length
                    ? TFQuestion(
                        question: questions[questionNumber].key,
                        handler: checkQ,
                      )
                    : QuestionDone(
                        text: "Congraturation! Your total score is $score",
                        buttonText: "Retry",
                        handler: refresh,
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void checkQ(bstatus) {
    setState(() {
      scoreKeeper.add(questions[questionNumber].value == bstatus);
    });
  }

  Future<List<MapEntry<String, bool>>> getQuestions() async {
    try {
      final response = await http.get(
        Uri.parse(
          'https://opentdb.com/api.php?amount=${widget.fullScore}&type=boolean&encode=base64',
        ),
        headers: {"Accept": "application/json"},
      );
      if (response.statusCode != 200) {
        throw Exception('Failed to load questions.');
      }
      final data = json.decode(response.body);

      switch (data["response_code"]) {
        case 0:
          break;
        case 1:
          return [];
        case 2:
          throw Exception('Failed to load questions. [Invalid Parameter]');
        case 3:
          throw Exception('Failed to load questions. [Token Not Found]');
        case 4:
          throw Exception('Failed to load questions. [Token Empty]');
        default:
          throw Exception(
              'Failed to load questions. [Undefined responde code]');
      }
      return (data["results"] as List).map((question) {
        if (![
          base64.encode(utf8.encode("True")),
          base64.encode(utf8.encode("False")),
        ].contains(question["correct_answer"] as String)) {
          throw Exception('Failed to load questions. [Invalid question type]');
        }
        return MapEntry(
          utf8.decode(base64.decode(question["question"] as String)),
          question["correct_answer"] as String ==
              base64.encode(utf8.encode("True")),
        );
      }).toList();
    } catch (_) {
      return [];
    }
  }

  @override
  void initState() {
    super.initState();
    refresh();
  }

  void refresh() async {
    setState(() {
      questions = preloadedQuestions;
      scoreKeeper.clear();
    });
    final questions_ = await getQuestions();
    setState(() {
      preloadedQuestions = questions_;
    });
  }

  void undo() {
    setState(() {
      if (scoreKeeper.isNotEmpty) scoreKeeper.removeLast();
    });
  }
}
