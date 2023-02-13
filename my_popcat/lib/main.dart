import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(const Main());
}

class Main extends StatelessWidget {
  const Main({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'my POPCAT',
      theme: ThemeData(
        primaryColor: Colors.white,
        shadowColor: Colors.black,
        backgroundColor: Colors.blueGrey,
        splashColor: Colors.blue,
        errorColor: Colors.red,
        textTheme: GoogleFonts.srirachaTextTheme(
          const TextTheme(
            headline1: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 80,
            ),
            headline2: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 50,
            ),
          ),
        ),
      ),
      home: const MyPopCat(
        title: 'POP \'n POP',
        srcDown:
            'https://upload.wikimedia.org/wikipedia/commons/6/64/Wikipe-tan_sailor_pink.png',
        srcUp:
            'https://upload.wikimedia.org/wikipedia/commons/0/0e/Wikipe-tan_sailor_fuku.png',
      ),
    );
  }
}

class MyPopCat extends StatefulWidget {
  const MyPopCat({
    super.key,
    required this.title,
    required this.srcDown,
    required this.srcUp,
  });

  final String title;
  final String srcDown;
  final String srcUp;

  @override
  State<MyPopCat> createState() => MyPopCatState();
}

class MyPopCatState extends State<MyPopCat>
    with SingleTickerProviderStateMixin {
  late int _counter;
  late String _imageUrl;
  late AnimationController _counterController;

  @override
  void initState() {
    super.initState();
    _resetCounter();
    _imageUp();
    _imageUrl = widget.srcUp;
    _counterController = AnimationController(
      vsync: this,
      duration: const Duration(
        milliseconds: 50,
      ),
      lowerBound: 0.0,
      upperBound: 1.0,
    );
  }

  @override
  void dispose() {
    _counterController.dispose();
    super.dispose();
  }

  void _resetCounter() {
    setState(() {
      _counter = 0;
    });
  }

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
    _counterController.forward(from: 0.0);
  }

  void _imageDown() {
    setState(() {
      _imageUrl = widget.srcDown;
    });
  }

  void _imageUp() {
    setState(() {
      _imageUrl = widget.srcUp;
    });
  }

  @override
  Widget build(BuildContext context) {
    final Animation<double> counterOffset = Tween(begin: 0.0, end: 1.0)
        .chain(CurveTween(curve: Curves.linear))
        .animate(_counterController)
      ..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          _counterController.reverse();
        }
      });
    final TextStyle textShadowStyle = TextStyle(
      foreground: Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 9
        ..color = Theme.of(context).shadowColor,
    );
    return Scaffold(
      body: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            GestureDetector(
              onTapDown: (tapDownDetails) {
                _incrementCounter();
                _imageDown();
              },
              onTapUp: (tapUpDetails) {
                _imageUp();
              },
              onTapCancel: () {
                _imageUp();
              },
              child: Stack(
                children: [
                  Container(
                    color: Theme.of(context).backgroundColor,
                    child: CachedNetworkImage(
                      imageUrl: _imageUrl,
                      fit: BoxFit.fitWidth,
                      width: double.infinity,
                      height: double.infinity,
                      alignment: Alignment.topCenter,
                      colorBlendMode: BlendMode.overlay,
                      placeholder: (BuildContext context, String url) => Center(
                        child: CircularProgressIndicator(
                          color: Theme.of(context).splashColor,
                          strokeWidth: 5,
                        ),
                      ),
                      errorWidget:
                          (BuildContext context, String url, dynamic error) =>
                              Center(
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            Icon(
                              Icons.error_rounded,
                              size: 100.0,
                              color: Theme.of(context).errorColor,
                            ),
                            Icon(
                              Icons.error_outline_rounded,
                              size: 100.0,
                              color: Theme.of(context).shadowColor,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Container(
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Stack(
                          children: [
                            Text(
                              widget.title,
                              style: Theme.of(context)
                                  .textTheme
                                  .headline2!
                                  .merge(textShadowStyle),
                            ),
                            Text(
                              widget.title,
                              style: Theme.of(context).textTheme.headline2,
                            ),
                          ],
                        ),
                        AnimatedBuilder(
                          animation: counterOffset,
                          builder: (buildContext, child) {
                            return Transform.rotate(
                              angle: 0 + 0.3 * counterOffset.value,
                              child: Transform.scale(
                                  scale: 1 + 0.25 * counterOffset.value,
                                  child: child),
                            );
                          },
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              Text(
                                '$_counter',
                                style: Theme.of(context)
                                    .textTheme
                                    .headline1!
                                    .merge(textShadowStyle),
                              ),
                              Text(
                                '$_counter',
                                style: Theme.of(context).textTheme.headline1,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Container(
              alignment: Alignment.bottomRight,
              child: IconButton(
                onPressed: _resetCounter,
                padding: const EdgeInsets.all(0.0),
                icon: const Icon(Icons.refresh_rounded),
                iconSize: 75.0,
                color: Theme.of(context).primaryColor,
              ),
            )
          ],
        ),
      ),
    );
  }
}
