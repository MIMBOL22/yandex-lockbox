/***********************************************************

 File for communicate with Yandex Lockbox API.
 This file contains two functions for getting list of
 Secrets and resolve they payload

 Файл для общения с Yandex Lockbox API.
 Этот файл содержит две функции для получения списка
 Секретов и получения значения конкретного секрета

 With <3 MIMBOL

 ***********************************************************/

// Constants of Yandex Lockbox API
// Константы для Yandex Lockbox API
const PROTO = 'https://'
const YANDEX_CL_API_BASE_HOST = 'api.cloud.yandex.net' // CL - Cloud
const YANDEX_LB_API_BASE_URL =
    'lockbox.' + YANDEX_CL_API_BASE_HOST + '/lockbox/v1' // LB - LockBox
const YANDEX_LB_PAYLOAD_API_BASE_URL = 'payload.' + YANDEX_LB_API_BASE_URL // LB - LockBox

// Type for LockBox Secret
// Тип для LockBox Секрета
type LBSecret = {
  currentVersion: {
    payloadEntryKeys: string[]
    id: string
    secretId: string
    createdAt: string
    status: string
  }
  deletionProtection: boolean
  id: string
  folderId: string
  createdAt: string
  name: string
  kmsKeyId: string
  status: string
}

// Type for LockBox Payload
// Тип для LockBox значения секрета
type LBSecretPayload = {
  entries: [
    {
      key: string
      textValue: string
      binaryValue: string
    }
  ]
  versionId: string
  code?: number
  message?: any
  details?: any[]
}


// Auxiliary function (Abstract of Fetch JS)
// Вспомогательная функция (Абстракция над Fetch JS)
export async function lockboxFetch(url: string, iam: string): Promise<any> {
  return fetch(url, {
    headers: new Headers({Authorization: 'Bearer ' + iam})
  }).then(r => r.json())
}

/**
 * Get list of secrets in Lockbox.
 * Получение списка секретов в Lockbox.
 * @param folder_id ID of Cloud folder (ID директории в Yandex Cloud)
 * @param iam The IAM Token (IAM токен аккаунта)
 * @returns {Promise<string>} List of secrets keys (Список ключей секретов)
 */
export async function secretList(
    folder_id: string,
    iam: string
): Promise<LBSecret[]> {
  const apiResponse = await lockboxFetch(
      PROTO + YANDEX_LB_API_BASE_URL + '/secrets?folder_id=' + folder_id,
      iam
  )
  if (apiResponse.code === undefined) {
    return apiResponse.secrets
  } else {
    throw new Error(apiResponse.message)
  }
}

/**
 * Get value of secret.
 * Получение значения конкретного секрета
 * @param secret_id ID of Secret (ID Секрета)
 * @param iam The IAM Token (IAM токен аккаунта)
 * @returns {Promise<string>} Resolve value of secret (Значение секрета)
 */
export async function resolveSecret(
    secret_id: string,
    iam: string
): Promise<string> {
  const apiResponse: LBSecretPayload = await lockboxFetch(
      PROTO +
      YANDEX_LB_PAYLOAD_API_BASE_URL +
      '/secrets/' +
      secret_id +
      '/payload',
      iam
  )
  if (apiResponse?.code === undefined) {
    const entry = apiResponse?.entries[0]
    if (entry) {
      return entry.textValue || entry.binaryValue
    }
    throw new Error('Action error: Value of secret not found')
  } else {
    throw new Error(apiResponse.message)
  }
}
