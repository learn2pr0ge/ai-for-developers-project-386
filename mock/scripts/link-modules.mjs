// Контракт api.tsp лежит в корне репозитория, а зависимости TypeSpec
// установлены в mock/node_modules. Компилятор TypeSpec резолвит импорты
// (@typespec/http и т.д.) от каталога файла, в котором они объявлены —
// то есть от корня репозитория. Чтобы импорты резолвились, обеспечиваем
// node_modules, доступный из корня, через симлинк на mock/node_modules.
//
// Симлинк идемпотентен и заигнорен в .gitignore корня репозитория.

import { existsSync, lstatSync, symlinkSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const mockDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(mockDir, '..');

const target = join(mockDir, 'node_modules');
const linkPath = join(repoRoot, 'node_modules');

if (existsSync(linkPath)) {
  // Уже существует (симлинк или реальная папка) — ничего не делаем.
  const stat = lstatSync(linkPath);
  if (stat.isSymbolicLink() || stat.isDirectory()) {
    process.exit(0);
  }
}

try {
  symlinkSync(target, linkPath, 'junction');
  console.log(`Linked ${linkPath} -> ${target}`);
} catch (error) {
  console.error('Не удалось создать симлинк node_modules:', error.message);
  process.exit(1);
}
