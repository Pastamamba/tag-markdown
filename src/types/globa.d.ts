declare interface Document {
  caretPositionFromPoint(x: number, y: number): CaretPosition | null;
}

declare interface CaretPosition {
  offsetNode: Node;
  offset: number;
}
