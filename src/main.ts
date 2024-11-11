/***********************************************************

 Main file of Github Action.
 This file contains getting list of secret,
 Resolve they and set as Action variable

 Главный файл этого Github Action.
 Этот файл содержит получение списка секретов,
 Получение их значение и установка в качестве переменных
 Github Action

 With <3 MIMBOL

 ***********************************************************/


import * as core from '@actions/core'
import {resolveSecret, secretList} from './lockbox'


/**
 * The main function for the action.
 * Главная и единственная функция этого экшана
 * @returns {Promise<void>}
 */
export async function run(): Promise<void> {
  try {
      // Получение входных данных
      // Getting input parameters
      const iam: string = core.getInput('iam_token')
      const folder_id: string = core.getInput('folder_id')
      const prefix: string = core.getInput('secret_prefix')
      const is_clean_prefix: boolean = core.getBooleanInput('is_clean_prefix')

      // На всякий случай, чтобы не проболтаться, запрещаем открытый вывод в консоль токена
      // Block logging in console iam token for security
      core.setSecret(iam)

      // Получаем список секретов в папке
      // Get list of secrets in folder
      core.debug(`Request secrets for folder ${folder_id}`)
      const secrets = await secretList(folder_id, iam)
      core.debug(`Was loaded ${secrets.length} secrets`)

      // Проходимся по секретам в папке
      // Foreach in secret list
      secrets.map(async secret => {
          const secret_keys = secret.currentVersion.payloadEntryKeys

          // Секреты ключ с нужным префиксом
          // Keys of secret which contains set prefix
          const keys_with_prefix = secret_keys.filter(key => key.startsWith(prefix))

          // Если у секрета таких ключей нет - уведомляем в дебаге и пропускаем
          // If secret doesn't contains these keys log it in console and skip
          if (keys_with_prefix.length == 0) {
              core.debug(`Secret with ID ${secret.id} was skipped`)
              return
          }

          // Запрашиваем секрет и запрещаем его прямой вывод
          // Get value of secret and block logging in console it
          core.debug(`Request value for secret with ID ${secret.id}`)
          const secret_value = await resolveSecret(secret.id, iam)
          core.setSecret(secret_value)

          // Для каждого ключа секрета
          // For each key of secret
          keys_with_prefix.map(key => {
              // Убирает префикс, если есть необходимость
              // Clear prefix if it required
              if (is_clean_prefix) key = key.replace(prefix, '')

              // Устанавливаем значение секрета, как переменную
              // Set secret as Action Variable
              core.exportVariable(
                  'LOCKBOX_' + key.toUpperCase().replace('/', '_'),
                  secret_value
              )
          })
      })
  } catch (error) {
      // В случае ошибки - выводим её
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
