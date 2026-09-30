import type {
  CheckAccountResponse,
  Credentials,
  Notification,
  SendMessageResponse,
} from '../types'

function buildUrl(
  credentials: Credentials,
  method: string,
  suffix = '',
): string {
  const base = credentials.apiUrl.replace(/\/$/, '')
  return `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${suffix}`
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    let message = `Ошибка ${response.status}`

    try {
      const json = JSON.parse(text) as { message?: string; reason?: string }
      message = json.message || json.reason || message
    } catch {
      if (text) message = text
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null as T
  }

  const text = await response.text()
  if (!text) return null as T
  return JSON.parse(text) as T
}

export async function getStateInstance(
  credentials: Credentials,
): Promise<{ stateInstance: string }> {
  const response = await fetch(buildUrl(credentials, 'getStateInstance'))
  return handleResponse(response)
}

export async function setSettings(credentials: Credentials): Promise<void> {
  const response = await fetch(buildUrl(credentials, 'setSettings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhookUrl: '',
      incomingWebhook: 'yes',
      outgoingAPIMessageWebhook: 'no',
      outgoingMessageWebhook: 'no',
      outgoingWebhook: 'no',
      stateWebhook: 'no',
    }),
  })
  await handleResponse(response)
}

export async function checkAccount(
  credentials: Credentials,
  phoneNumber: number,
): Promise<CheckAccountResponse> {
  const response = await fetch(buildUrl(credentials, 'checkAccount'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  })
  return handleResponse(response)
}

export async function sendMessage(
  credentials: Credentials,
  chatId: string,
  message: string,
): Promise<SendMessageResponse> {
  const response = await fetch(buildUrl(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
  return handleResponse(response)
}

export async function receiveNotification(
  credentials: Credentials,
  receiveTimeout = 5,
  signal?: AbortSignal,
): Promise<Notification | null> {
  const url = `${buildUrl(credentials, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`
  const response = await fetch(url, { signal })
  return handleResponse(response)
}

export async function deleteNotification(
  credentials: Credentials,
  receiptId: number,
): Promise<void> {
  const response = await fetch(
    buildUrl(credentials, 'deleteNotification', `/${receiptId}`),
    { method: 'DELETE' },
  )
  await handleResponse(response)
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function phoneToChatId(phone: string): string {
  return `${normalizePhone(phone)}@c.us`
}
