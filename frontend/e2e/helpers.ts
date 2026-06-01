import { expect, type Page } from '@playwright/test';

/**
 * Утилиты для e2e-сценариев бронирования.
 *
 * Время везде трактуется как UTC: браузер в тестах работает с timezoneId:'UTC'
 * (см. playwright.config.ts), а бэкенд и фронтенд строят сетку слотов в UTC.
 * Поэтому «локальный» день в браузере совпадает с UTC-днём.
 */

/** Завтрашний день в UTC — гарантированно внутри окна 14 дней и без «прошедших» слотов. */
export function tomorrowUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0),
  );
}

/** Уникальный email на каждый прогон — чтобы тесты не зависели друг от друга. */
export function uniqueEmail(prefix = 'guest'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}@example.com`;
}

/** Открывает список типов событий через лендинг. */
export async function gotoEventTypes(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('link', { name: 'Записаться' }).first().click();
  await expect(page).toHaveURL(/\/event-types$/);
}

/**
 * На странице выбора слота кликает по дню в календаре.
 * Выбираем по числу месяца (день должен быть видим и активен в текущем месяце).
 */
export async function selectCalendarDay(page: Page, day: Date): Promise<void> {
  const dayNumber = String(day.getUTCDate());
  // Кнопки-дни активны (enabled) только внутри окна бронирования.
  const dayButton = page
    .getByRole('button', { name: new RegExp(`^${dayNumber}(\\s|$)`) })
    .and(page.locator('button:not([disabled])'))
    .first();
  await dayButton.click();
}

/**
 * Выбирает первый свободный слот дня и нажимает «Продолжить».
 * Возвращает подпись выбранного слота (напр. "09:00 - 09:30").
 */
export async function pickFirstFreeSlot(page: Page): Promise<string> {
  const freeSlot = page.getByRole('button').filter({ hasText: 'Свободно' }).first();
  await expect(freeSlot).toBeVisible();
  const label = (await freeSlot.innerText()).split('\n')[0].trim();
  await freeSlot.click();
  await page.getByRole('button', { name: 'Продолжить' }).click();
  return label;
}

/** Заполняет гостевую форму и подтверждает бронирование. */
export async function fillGuestFormAndSubmit(
  page: Page,
  name: string,
  email: string,
): Promise<void> {
  await page.getByLabel('Имя гостя').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Подтвердить бронирование' }).click();
}
