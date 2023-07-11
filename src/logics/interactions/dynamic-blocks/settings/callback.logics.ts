import { InteractionType, WebhookStatus, WebhookType } from '@enums'
import {
  InteractionInput,
  InteractionWebhook,
  InteractionWebhookResponse,
  RedirectInteractionProps
} from '@interfaces'
import { NetworkSettings } from '@prisma/client'
import { NetworkSettingsRepository } from '@repositories'

import { getInteractionNotSupportedError, getServiceUnavailableError } from '@logics'

import { getConnectSlackUrl } from '@/logics/oauth.logics'
import { getNetworkClient } from '@clients'
import { globalLogger } from '@utils'
import { SettingsBlockCallback } from './constants'
import { getDisconnectedNetworkSettingsSlate, getNetworkSettingsModalSlate, getNetworkSettingsSlate } from './slate.logics'

const logger = globalLogger.setContext(`SettingsDynamicBlock`)

const getSaveCallbackResponse = async (options: {
  networkSettings: NetworkSettings
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => {
  logger.debug('getNetworkSettingsInteractionCallbackResponse called', { options })

  const {
    networkSettings,
    data: { interactionId, inputs },
  } = options

  const updatedNetwork = await NetworkSettingsRepository.update(networkSettings.networkId, inputs)

  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: interactionId,
          type: InteractionType.Show,
          slate: await getNetworkSettingsSlate(updatedNetwork),
        },
      ],
    },
  }
}

const getModalSaveCallbackResponse = async (options: {
  networkSettings: NetworkSettings
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => {
  logger.debug('getNetworkSettingsInteractionCallbackResponse called', { options })

  const {
    networkSettings,
    data: { interactionId, inputs, dynamicBlockKey },
  } = options

  await NetworkSettingsRepository.update(networkSettings.networkId, inputs)
  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: interactionId,
          type: InteractionType.Close,
        },
        {
          id: 'reload',
          type: InteractionType.Reload,
          props: {
            dynamicBlockKeys: [dynamicBlockKey],
          },
        },
      ],
    },
  }
}

const getOpenModalCallbackResponse = async (options: {
  networkSettings: NetworkSettings
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => ({
  type: WebhookType.Interaction,
  status: WebhookStatus.Succeeded,
  data: {
    interactions: [
      {
        id: options.data.interactionId,
        type: InteractionType.OpenModal,
        slate: await getNetworkSettingsModalSlate(options.networkSettings),
        props: {
          size: 'lg',
          title: 'Update configs',
          description: 'Update your configs by changing the values below',
        },
      },
    ],
  },
})

// const getOpenToastCallbackResponse = async (options: {
//   networkSettings: NetworkSettings
//   data: InteractionInput<NetworkSettings>
// }): Promise<InteractionWebhookResponse> => ({
//   type: WebhookType.Interaction,
//   status: WebhookStatus.Succeeded,
//   data: {
//     interactions: [
//       {
//         id: 'open-toast',
//         type: InteractionType.OpenToast,
//         props: {
//           status: options.network.settings?.toastStatus || ToastStatus.WARNING,
//           title:
//             options.network.settings?.toastMessage || 'Please set your toast message!',
//           description: 'Description goes here',
//         },
//       },
//     ],
//   },
// })



// export const getRevokeCallbackResponse = async(options: { 
//   networkSettings: NetworkSettings
//   data: InteractionInput<NetworkSettings>
//   networkId: string 
// }): Promise<InteractionWebhookResponse> => { 
//   logger.debug('getRevokeCallbackResponse called', {options})

//   const { 
//     data: {interactionId}, 
//     networkId,
//   } = options 

//   try{ 
//     await NetworkSettingsRepository.delete(networkId)
//   } catch (error){ 
//     logger.error(error)
//     return getServiceUnavailableError(options)
//   }
//   return getDisconnectedNetworkSettingsSlate({interactionId})
// }

const getRedirectCallbackResponse = async ({
  props,
  interactionId,
}: {
  props: RedirectInteractionProps
  interactionId?: string
}): Promise<InteractionWebhookResponse> => ({
  type: WebhookType.Interaction,
  status: WebhookStatus.Succeeded,
  data: {
    interactions: [
      {
        id: interactionId || 'new-interaction-id',
        type: InteractionType.Redirect,
        props,
      },
    ],
  },
})

const getAuthRedirectCallbackResponse = async (options: {
  networkSettings: NetworkSettings
  data: InteractionInput<NetworkSettings>
  networkId: string
}): Promise<InteractionWebhookResponse> => {
  const {
    data: { actorId },
    networkId,
  } = options
  const gqlClient = await getNetworkClient(networkId)
  const network = await gqlClient.query({
    name: 'network',
    args: 'basic',
  })

  return getRedirectCallbackResponse({
    props: {
      url: await getConnectSlackUrl({
        network,
        actorId,
      }),
      external: false,
    },
  })
}

const getOauthRevokeCallbackResponse = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  logger.debug('getAuthRedirectCallbackResponse called', { options })
  logger.debug('handleUninstalledWebhook called', { options })
  const {
    networkId,
    data: { interactionId },
  } = options
  try {
    await NetworkSettingsRepository.delete(networkId)
  } catch (error) {
    logger.error(error)
    return getServiceUnavailableError(options)
  }

  // return getDisconnectedSettingsResponse({ interactionId })
  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: interactionId,
          type: InteractionType.Show,
          slate: await getDisconnectedNetworkSettingsSlate(),
        },
      ],
    },
  }
}


export const getCallbackResponse = async (options: {
  networkId: string
  networkSettings: NetworkSettings
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => {
  logger.debug('getCallbackResponse called', { options })

  const {
    data: { callbackId },
  } = options

  switch (callbackId) {
    case SettingsBlockCallback.Save:
      return getSaveCallbackResponse(options)
    case SettingsBlockCallback.ModalSave:
      return getModalSaveCallbackResponse(options)
    case SettingsBlockCallback.OpenModal:
      return getOpenModalCallbackResponse(options)
    // case SettingsBlockCallback.OpenToast:
    // return getOpenToastCallbackResponse(options)
    case SettingsBlockCallback.AuthRedirect:
      return getAuthRedirectCallbackResponse(options)
    case SettingsBlockCallback.OauthRevoke:
    // return getOauthRevokeCallbackResponse(options) 
    default:
      return getInteractionNotSupportedError('callbackId', callbackId)
  }
}
