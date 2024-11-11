# Yandex Lockbox GitHub Actions

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/yandex-lockbox/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

[🇬🇧 English.md](https://y.com)

Этот экшен написан для встраивания в процессы CI/CD и получения секретов с Yandex Lockbox.

### Как оно работает?

Action получает весь список секретов в указанной папке облака и импортирует все секреты, начинающиеся с указанного
префикса.

### Пример встраивания:
```yaml
- name: Create IAM token
  uses: bigtows/yc-token@latest
  id: generation-iam-token
  with:
    service-account-token: ${{ secrets.SERVICE_ACCOUNT_TOKEN }}
    type-token: iam
- name: Testing text
  uses: mimbol22/yandex-lockbox@latest
  with:
    iam_token: ${{ steps.generation-iam-token.outputs.iam-token }}
    folder_id: ${{ secrets.YC_FOLDER_ID }}
    secret_prefix: DEV_
    is_clean_prefix: false
- name: Echo text
  run: |
    echo "$LOCKBOX_DEV_SUPER_SECRET_KEY" | base64 --decode
```

В этом примере Action импортирует все секреты, чей ключ начинается с DEV_

Например, если у вас есть секреты DEV_SUPER_SECRET_KEY, DEV_PASSWORD_OF_BANK_CARD, PROD_POSTGRES_PASSWORD,
PROD_TINKOFF_TOKEN, STAGE_SMS_API_TOKEN, STAGE_TELEGRAM_TOKEN,

и вы укажите в префиксе "DEV_" (и в is_clean_prefix вы укажите true), то сможете получить их с помощью
DEV_SUPER_SECRET_KEY, DEV_PASSWORD_OF_BANK_CARD

### Таблица входных данных:

| Название        | Описание                                       | Пример значения                        | Обязателен ли? | Значение по умолчанию |
|-----------------|------------------------------------------------|----------------------------------------|----------------|-----------------------|
| iam_token       | IAM - токен акканта                            | t1.YWplb3JmaWFlcmlnZmFwZX...aWYXBlcmZn | Да             | -                     |
| folder_id       | ID папки в облаке                              | b1gsfi3fd8902rkrhlum                   | Да             | -                     |
| secret_prefix   | Префикс секретов                               | DEV_                                   | Да             | -                     |
| is_clean_prefix | Нужно ли очищать префикс в выходных переменных | true                                   | Нет            | false                 |