import { ErrorCode, WebhookStatus, WebhookType } from '@enums'
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
import { getConnectedNetworkSettingsResponse, getDisconnectedNetworkSettingsResponse } from './helpers'

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
    return getCallbackResponse({ networkId, networkSettings, data: options.data })
  }

  if (!networkSettings) {
    return getDisconnectedNetworkSettingsResponse({ interactionId })
  }

  if (!interactionId) {
    return {
      type: WebhookType.Interaction,
      status: WebhookStatus.Failed,
      errorCode: ErrorCode.InvalidRequest,
      errorMessage: 'Interaction ID is required.',
    }
  }
  return getConnectedNetworkSettingsResponse({ interactionId, settings: options.data })
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
