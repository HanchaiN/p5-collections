class Pair<T1, T2> {
  late T1 first;
  late T2 last;

  Pair(this.first, this.last);

  @override
  int get hashCode => this.first.hashCode ^ this.last.hashCode;

  @override
  bool operator ==(other) {
    if (other is! Pair<T1, T2>) {
      return false;
    }
    return this.first == other.first && this.last == other.last;
  }

  @override
  String toString() => '($first, $last)';
}

extension Range on num {
  bool isInRange(num from, num to) {
    return from <= this && this < to;
  }
}
