let _handler: (() => void) | null = null;

export function setCustomBackHandler(fn: () => void) {
  _handler = fn;
}

export function clearCustomBackHandler() {
  _handler = null;
}

/**
 * Пытается вызвать кастомный хендлер, возвращает true, если он был вызван.
 */
export function triggerCustomBack(): boolean {
  if (_handler) {
    _handler();
    return true;
  }
  return false;
}
