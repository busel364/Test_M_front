import { useEffect, useRef } from 'react'
import { deleteNotification, receiveNotification } from '../api/greenApi'
import { useAuth } from '../context/AuthContext'
import type { Message, NotificationBody } from '../types'

function extractText(body: NotificationBody): string | null {
  const data = body.messageData
  if (!data) return null

  if (data.typeMessage === 'textMessage' && data.textMessageData?.textMessage) {
    return data.textMessageData.textMessage
  }

  if (
    data.typeMessage === 'extendedTextMessage' &&
    data.extendedTextMessageData?.text
  ) {
    return data.extendedTextMessageData.text
  }

  return null
}

export function useNotifications() {
  const { credentials, addMessage } = useAuth()
  const addMessageRef = useRef(addMessage)
  addMessageRef.current = addMessage

  useEffect(() => {
    if (!credentials) return

    const controller = new AbortController()
    let active = true

    const poll = async () => {
      while (active) {
        try {
          const notification = await receiveNotification(
            credentials,
            20,
            controller.signal,
          )

          if (!active) break

          if (!notification) {
            continue
          }

          const { receiptId, body } = notification

          if (body.typeWebhook === 'incomingMessageReceived') {
            const text = extractText(body)
            if (text && body.senderData?.chatId) {
              const message: Message = {
                id: body.idMessage,
                chatId: body.senderData.chatId,
                text,
                timestamp: body.timestamp * 1000,
                type: 'incoming',
                senderName:
                  body.senderData.senderContactName ||
                  body.senderData.senderName ||
                  body.senderData.chatName,
              }
              addMessageRef.current(message)
            }
          }

          try {
            await deleteNotification(credentials, receiptId)
          } catch (error) {
            console.error('Failed to delete notification', error)
          }
        } catch (error) {
          if (!active || controller.signal.aborted) break
          console.error('Polling error', error)
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }
    }

    void poll()

    return () => {
      active = false
      controller.abort()
    }
  }, [credentials])
}
