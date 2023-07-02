import { InteractionType, WebhookStatus, WebhookType } from '@enums'
import {
  InteractionInput,
  InteractionWebhook,
  InteractionWebhookResponse,
} from '@interfaces'
import { NetworkSettings } from '@prisma/client'
import { NetworkSettingsRepository } from '@repositories'
import { PermissionContext } from '@tribeplatform/gql-client/types'

import { getInteractionNotSupportedError } from '../../../error.logics'

import { globalLogger } from '@utils'
import { getCallbackResponse } from './callback.logics'
import { getDisconnectedNetworkSettingsSlate, getNetworkSettingsSlate } from './slate.logics'

const logger = globalLogger.setContext(`SettingsDynamicBlock`)

const getNetworkSettingsInteractionResponse = async (options: {
  networkId: string
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => {
  logger.debug('getNetworkSettingsInteractionResponse called', { options })

  const {
    networkId,
    data: { interactionId, callbackId },
  } = options

  const networkSettings = await NetworkSettingsRepository.findUnique(networkId)

  if (callbackId) {
    return getCallbackResponse({ networkId, networkSettings , data: options.data })
  }

  if(!networkSettings) { 
    return { 
      type: WebhookType.Interaction, 
      status: WebhookStatus.Succeeded, 
      data: { 
        interactions: [ 
          {
            id: interactionId, 
            type: InteractionType.Show,
            slate: await getDisconnectedNetworkSettingsSlate()
          }
        ]
      }
    }


  } 


  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: interactionId,
          type: InteractionType.Show,
          slate: await getNetworkSettingsSlate(networkSettings),
        },
      ],
    },
  }
}

export const getSettingsInteractionResponse = async (
  webhook: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  logger.debug('getSettingsInteractionResponse called', { webhook })

  const { networkId, context, data } = webhook

  switch (context) {
    case PermissionContext.NETWORK:
      return getNetworkSettingsInteractionResponse({
        networkId,
        data: data as InteractionInput<NetworkSettings>,
      })
    default:
      return getInteractionNotSupportedError('context', context)
  }
}
