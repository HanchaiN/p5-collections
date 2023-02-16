import 'dart:convert';

import 'package:http/http.dart' as http;

final defaultQuote = Quote(
  author: "Anonymous",
  content: "Where there's a will, there's a way.",
  profileUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b4/Wikipe-tan_avatar.png",
);

Future<Quote> getQuote() async {
  Quote quote = defaultQuote.clone();
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
    String profileSeed = quote.author.hashCode.toRadixString(16);
    quote.profileUrl = "https://robohash.org/$profileSeed?set=set4";
  } catch (_) {}

  return quote;
}

class Quote {
  String author;
  String content;
  String profileUrl;
  Quote(
      {required this.author, required this.content, required this.profileUrl});
  Quote clone() =>
      Quote(author: author, content: content, profileUrl: profileUrl);
}
