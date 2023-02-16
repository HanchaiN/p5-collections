import 'dart:math';

import 'package:battleship_game/utils.dart';

enum BattleshipDirection {
  first,
  last,
}

enum BattleshipField {
  empty,
  miss,
  hit,
}

class BattleshipGameEngine {
  late final Pair<int, int> gridSize;
  late final List<_Battleship> _battleships;
  late final Random randomizer;
  bool _isPlayable = false;

  List<Pair<Pair<int, int>, int>> _guesses = List.empty(growable: true);

  BattleshipGameEngine({
    int gridSizeFirst = 10,
    int gridSizeLast = 10,
    Iterable<int> battleshipsLength = const [5, 4, 3, 3, 2],
    int? seed,
  }) {
    gridSize = Pair(gridSizeFirst, gridSizeLast);
    _battleships =
        List.unmodifiable(battleshipsLength.map((e) => _Battleship(length: e)));
    randomizer = Random(seed);
  }

  List<List<int>> get answerKey {
    return List.unmodifiable(List.generate(
        gridSize.first,
        (firstIndex) => List.generate(gridSize.last,
            (lastIndex) => answerAt(Pair(firstIndex, lastIndex)))));
  }

  List<List<BattleshipField>> get field {
    return List.unmodifiable(
      List.generate(
        gridSize.first,
        (firstIndex) => List.generate(
          gridSize.last,
          (lastIndex) => fieldAt(Pair(firstIndex, lastIndex)),
        ),
      ),
    );
  }

  List<Pair<Pair<int, int>, bool>> get guesses {
    return List.unmodifiable(
        _guesses.map((guess) => Pair(guess.first, guess.last != -1)));
  }

  bool get isPlayable => _isPlayable;

  int get unsinkShips =>
      _battleships.where((ship) => ship.status != BattleshipStatus.sink).length;

  int answerAt(Pair<int, int> location) {
    int shipIndex = _isOccupied(location);
    return !isPlayable || shipIndex == -1 || _isSink(shipIndex)
        ? shipIndex
        : -1;
  }

  BattleshipField fieldAt(Pair<int, int> location) {
    switch (_guesses
        .singleWhere((guess) => guess.first == location,
            orElse: () => Pair(location, -2))
        .last) {
      case -2:
        return BattleshipField.empty;
      case -1:
        return BattleshipField.miss;
      default:
        return BattleshipField.hit;
    }
  }

  BattleshipShootResult shoot(Pair<int, int> location) {
    if (!_isPlayable) return BattleshipShootResult.unplayable;
    if (!_isValidLocation(location)) return BattleshipShootResult.invalid;
    if (_guesses.indexWhere((element) => element.first == location) != -1) {
      return BattleshipShootResult.duplicate;
    }
    int shipIndex = _isOccupied(location);
    _guesses.add(Pair(location, shipIndex));
    if (shipIndex == -1) return BattleshipShootResult.miss;
    if (!_isSink(shipIndex)) return BattleshipShootResult.hit;
    _battleships[shipIndex].status = BattleshipStatus.sink;
    if (!_isWin()) return BattleshipShootResult.sink;
    _endGame();
    return BattleshipShootResult.win;
  }

  void startGame() {
    _unlocateShips();
    _generateShips();
    _guesses = List.empty(growable: true);
    _isPlayable = true;
  }

  void surrender() {
    _endGame();
  }

  void _endGame() {
    _isPlayable = false;
  }

  void _generateShips() {
    for (var ship in _battleships) {
      if (ship.status != BattleshipStatus.unlocated) continue;
      int iter = 0;
      var location = _randomizeLocation(ship.length);
      while (_isValidBattleship(location, ship.length)) {
        location = _randomizeLocation(ship.length);
        iter++;
        if (iter > 1000) {
          _unlocateShips();
          _generateShips();
          return;
        }
      }
      ship.location = location;
      ship.status = BattleshipStatus.located;
    }
  }

  int _isOccupied(Pair<int, int> location) {
    for (var index = 0; index < _battleships.length; index++) {
      final ship = _battleships[index];
      if (ship.status == BattleshipStatus.unlocated) {
        continue;
      }
      switch (ship.location.last) {
        case BattleshipDirection.last:
          if (ship.location.first.first != location.first) break;
          if (ship.location.first.last > location.last ||
              location.last - ship.location.first.last >= ship.length) {
            break;
          }
          return index;
        case BattleshipDirection.first:
          if (ship.location.first.last != location.last) break;
          if (ship.location.first.first > location.first ||
              location.first - ship.location.first.first >= ship.length) {
            break;
          }
          return index;
      }
    }
    return -1;
  }

  bool _isSink(int shipIndex) {
    return _guesses.where((element) => element.last == shipIndex).length >=
        _battleships[shipIndex].length;
  }

  bool _isValidBattleship(
      Pair<Pair<int, int>, BattleshipDirection> location, int shipLength) {
    for (var i = 0; i < shipLength; i++) {
      switch (location.last) {
        case BattleshipDirection.last:
          if (_isOccupied(
                  Pair(location.first.first, location.first.last + i)) !=
              -1) {
            return true;
          }
          break;
        case BattleshipDirection.first:
          if (_isOccupied(
                  Pair(location.first.first + i, location.first.last)) !=
              -1) {
            return true;
          }
          break;
      }
    }
    return false;
  }

  bool _isValidLocation(Pair<int, int> location) {
    return location.first.isInRange(0, gridSize.first) &&
        location.last.isInRange(0, gridSize.last);
  }

  bool _isWin() {
    return unsinkShips == 0;
  }

  Pair<Pair<int, int>, BattleshipDirection> _randomizeLocation(int shipLength) {
    BattleshipDirection direction =
        BattleshipDirection.values[randomizer.nextInt(2)];
    Pair<int, int> location = Pair(-1, -1);
    switch (direction) {
      case BattleshipDirection.last:
        location.first = randomizer.nextInt(gridSize.first);
        location.last = randomizer.nextInt(gridSize.last - shipLength);
        break;
      case BattleshipDirection.first:
        location.first = randomizer.nextInt(gridSize.first - shipLength);
        location.last = randomizer.nextInt(gridSize.last);
        break;
    }
    return Pair(location, direction);
  }

  void _unlocateShips() {
    for (var ship in _battleships) {
      ship.status = BattleshipStatus.unlocated;
    }
  }
}

enum BattleshipShootResult {
  unplayable,
  invalid,
  duplicate,
  miss,
  hit,
  sink,
  win,
}

enum BattleshipStatus {
  unlocated,
  located,
  sink,
}

class _Battleship {
  late final int length;
  Pair<Pair<int, int>, BattleshipDirection> location =
      Pair(Pair(0, 0), BattleshipDirection.first);
  BattleshipStatus status = BattleshipStatus.unlocated;

  _Battleship({required this.length});
}
