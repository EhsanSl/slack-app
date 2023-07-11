import { InteractionType, WebhookStatus, WebhookType } from '@enums'
import { InteractionInput, InteractionWebhookResponse } from '@interfaces'
import { NetworkSettings } from '@prisma/client'
import { rawSlateToDto } from '@tribeplatform/slate-kit/utils'
import { getConnectedNetworkSettingsSlate, getDisconnectedSettingsSlate } from './slates'

export const getConnectedSettingsResponse = async (options: {
  interactionId: string
  settings: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => {
  const { 
    interactionId, 
    settings
  } = options 

  const slate = getConnectedNetworkSettingsSlate({
    settings,
  })
  
  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: interactionId,
          type: InteractionType.Show,
          slate: rawSlateToDto(slate),
        },
      ],
    },
  }
}

export const getDisconnectedSettingsResponse = async (options: {
  interactionId: string
}): Promise<InteractionWebhookResponse> => {
  
  const { interactionId } = options
  const slate = getDisconnectedSettingsSlate()

  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: interactionId,
          type: InteractionType.Show,
          slate: rawSlateToDto(slate),
        },
      ],
    },
  }
}
