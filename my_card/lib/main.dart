import 'dart:math';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(const Main());
}

class Main extends StatelessWidget {
  const Main({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        // This is the theme of your application.
        //
        // Try running your application with "flutter run". You'll see the
        // application has a blue toolbar. Then, without quitting the app, try
        // changing the primarySwatch below to Colors.green and then invoke
        // "hot reload" (press "r" in the console where you ran "flutter run",
        // or simply save your changes to "hot reload" in a Flutter IDE).
        // Notice that the counter didn't reset back to zero; the application
        // is not restarted.
        primarySwatch: Colors.blue,
        textTheme: TextTheme(
          headline1: GoogleFonts.merriweather(
            textStyle: const TextStyle(
              color: Color(0xFF444444),
              fontSize: 32,
              fontWeight: FontWeight.w400,
            ),
          ),
          headline2: GoogleFonts.merriweather(
            textStyle: const TextStyle(
              color: Color(0xFF444444),
              fontSize: 40,
              fontWeight: FontWeight.w400,
            ),
          ),
          bodyText2: GoogleFonts.merriweatherSans(
            textStyle: const TextStyle(
              color: Color(0xFF6C757D),
              fontSize: 16,
              fontWeight: FontWeight.w400,
            ),
          ),
        ),
      ),
      home: const MyCard(),
    );
  }
}

class MyCard extends StatefulWidget {
  const MyCard({super.key});

  @override
  MyCardState createState() => MyCardState();
}

class Quote {
  Quote({required this.author, required this.content});
  String author;
  String content;
}

class MyCardState extends State<MyCard> {
  late Quote quote = Quote(
    author: "Anonymous",
    content: "Where there's a will, there's a way.",
  );
  late String profileUrl =
      "https://upload.wikimedia.org/wikipedia/commons/b/b4/Wikipe-tan_avatar.png";

  // Function to get the JSON data
  Future<Quote> getQuote() async {
    Quote quote = Quote(
      author: this.quote.author,
      content: this.quote.content,
    );
    try {
      final response = await http.get(
        // Encode the url
        Uri.parse(
          'https://quotable.io/random',
        ),
        // Only accept JSON response
        headers: {"Accept": "application/json"},
      );
      if (response.statusCode != 200) {
        throw Exception('Failed to load quote(s).');
      }

      quote.author = json.decode(response.body)['author'];
      quote.content = json.decode(response.body)['content'];
    } catch (_) {}

    return quote;
  }

  void refresh() async {
    final Quote newQuote = await getQuote();
    final String profileSeed = newQuote.author.hashCode.toRadixString(16);
    setState(() {
      quote = newQuote;
      profileUrl = "https://robohash.org/$profileSeed?set=set4";
    });
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: SafeArea(
        child: Container(
          alignment: Alignment.center,
          child: ProfileCard(
            title: 'Some Title, idk.',
            profileUrl: profileUrl,
            name: quote.author,
            description: quote.content,
            refresh: refresh,
          ),
        ),
      ),
    );
  }
}

class ProfileCard extends StatelessWidget {
  const ProfileCard({
    super.key,
    required this.title,
    required this.profileUrl,
    required this.name,
    required this.description,
    required this.refresh,
  });

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;
  final String name;
  final String profileUrl;
  final String description;
  final void Function() refresh;

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: 10,
        vertical: 30,
      ),
      child: Card(
        margin: const EdgeInsets.only(
          bottom: 20,
        ),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(25)),
        ),
        color: Colors.white,
        shadowColor: const Color(0xFFdddddd),
        elevation: 10.0,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            ListTile(
              title: Text(
                title,
                style: Theme.of(context).textTheme.headline1,
              ),
              trailing: IconButton(
                onPressed: refresh,
                icon: const Icon(Icons.refresh_rounded),
                iconSize: 25,
              ),
            ),
            Row(
              children: [
                CircleAvatar(
                  backgroundImage: NetworkImage(
                    profileUrl,
                  ),
                  backgroundColor: Colors.transparent,
                  minRadius: 40,
                  maxRadius: 100,
                ),
                Expanded(
                  child: ListTile(
                    title: Text(
                      name,
                      style: Theme.of(context).textTheme.headline2,
                    ),
                    subtitle: Text(
                      description,
                      softWrap: true,
                      style: Theme.of(context).textTheme.bodyText2,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
