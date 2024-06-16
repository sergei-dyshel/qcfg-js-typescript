export interface DisposableLike {
  dispose: () => any;
}

export class DisposableContainer implements DisposableLike {
  private disposables: DisposableLike[] = [];

  protected registerDisposable(...disposables: DisposableLike[]) {
    this.disposables.push(...disposables);
  }

  dispose() {
    for (const disposable of this.disposables) disposable.dispose();
  }
}

export class DisposableHolder implements DisposableLike {
  constructor(private disposable_?: DisposableLike) {}

  get disposable() {
    return this.disposable_;
  }

  set disposable(value: DisposableLike | undefined) {
    this.dispose();
    this.disposable_ = value;
  }

  dispose() {
    this.disposable_?.dispose();
    this.disposable_ = undefined;
  }
}
