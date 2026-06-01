/** Человекочитаемая длительность в минутах: «15 мин», «90 мин» */
export function formatDuration(minutes: number): string {
  return `${minutes} мин`;
}

/** Извлекает текст ошибки из неизвестного значения (ApiError / Error / прочее) */
export function getErrorMessage(error: unknown, fallback = 'Произошла ошибка'): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
