export interface Credentials {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

export interface Message {
  id: string
  chatId: string
  text: string
  timestamp: number
  type: 'incoming' | 'outgoing'
  senderName?: string
}

export interface Chat {
  chatId: string
  phone: string
  name: string
  lastMessage?: string
  lastTimestamp?: number
}

export interface NotificationBody {
  typeWebhook: string
  timestamp: number
  idMessage: string
  senderData?: {
    chatId: string
    sender: string
    chatName?: string
    senderName?: string
    senderContactName?: string
    senderPhoneNumber?: number
  }
  messageData?: {
    typeMessage: string
    textMessageData?: {
      textMessage: string
    }
    extendedTextMessageData?: {
      text: string
    }
  }
}

export interface Notification {
  receiptId: number
  body: NotificationBody
}

export interface SendMessageResponse {
  idMessage: string
}

export interface CheckAccountResponse {
  exist?: boolean
  chatId?: string
  username?: string
  phoneNumber?: number
  status?: boolean
  reason?: string
}
