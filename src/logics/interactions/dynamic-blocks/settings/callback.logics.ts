import { InteractionType, WebhookStatus, WebhookType } from '@enums'
import { InteractionInput, InteractionWebhookResponse } from '@interfaces'
import { NetworkSettings } from '@prisma/client'
import { NetworkSettingsRepository } from '@repositories'

import { getInteractionNotSupportedError } from '../../../error.logics'

import { getConnectSlackUrl } from '@/logics/oauth.logics'
import { getNetworkClient } from '@clients'
import { globalLogger } from '@utils'
import { SettingsBlockCallback } from './constants'
import { getNetworkSettingsModalSlate, getNetworkSettingsSlate } from './slate.logics'
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

const getRedirectCallbackResponse = async (options: {
  networkSettings: NetworkSettings
  data: InteractionInput<NetworkSettings>
  networkId: string
}): Promise<InteractionWebhookResponse> => { 
  const {
    data: {actorId },
    networkId , 
  } = options
  const gqlClient = await getNetworkClient(networkId)
  const network = await gqlClient.query({
    name: 'network',
    args: 'basic',
  })

  return ({
  type: WebhookType.Interaction,
  status: WebhookStatus.Succeeded,
  data: {
    interactions: [
      {
        id: 'new-interaction-id',
        type: InteractionType.Redirect,
        props: {
          url: await getConnectSlackUrl( {network , actorId} ) , 
          external: false,
        },
      },
    ],
  },
})}

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


export const getCallbackResponse = async (options: {
  networkSettings: NetworkSettings
  data: InteractionInput<NetworkSettings>
  networkId: string
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
    case SettingsBlockCallback.Redirect:
      return getRedirectCallbackResponse(options)
    // case SettingsBlockCallback.Revoke:
      // return getRevokeCallbackResponse(options) 
    default:
      return getInteractionNotSupportedError('callbackId', callbackId)
  }
}
