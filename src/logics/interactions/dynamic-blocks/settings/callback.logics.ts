import { InteractionType, WebhookStatus, WebhookType } from '@enums'
import {
  InteractionInput,
  InteractionWebhookResponse,
  RedirectInteractionProps
} from '@interfaces'
import { NetworkSettings } from '@prisma/client'
import { NetworkSettingsRepository } from '@repositories'

import { getInteractionNotSupportedError } from '@logics'

import { getConnectSlackUrl } from '@/logics/oauth.logics'
import { getNetworkClient } from '@clients'
import { rawSlateToDto } from '@tribeplatform/slate-kit/utils'
import { globalLogger } from '@utils'
import { SettingsBlockCallback } from './constants'
import { getConnectedNetworkSettingsResponse, getDisconnectedNetworkSettingsResponse } from './helpers'
import { getNetworkSettingsModalSlate } from './slates'

const logger = globalLogger.setContext(`SettingsDynamicBlock`)

const getSaveCallbackResponse = async (options: {
  networkSettings: NetworkSettings
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => {
  logger.debug('getNetworkSettingsInteractionCallbackResponse called', { options })

  const {
    networkSettings,
    data: settings,
    data: { interactionId, inputs },
  } = options

  const updatedNetwork = await NetworkSettingsRepository.update(networkSettings.networkId, inputs)

  return getConnectedNetworkSettingsResponse({ interactionId, settings })
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
}): Promise<InteractionWebhookResponse> => {

  const {
    // networkSettings,
    data,
  } = options
  //sample array for spaces untill i learn how to call bettermode to get them  
  const spaces: string[] = ['General', 'Q/A', 'Updates', '&SomethingElse!']
  // const slate = getNetworkSettingsModalSlate({ settings: data, spaces })
  const slate = getNetworkSettingsModalSlate({
    id: 'configs',
    action: 'Submit',
    actionCallbackId: SettingsBlockCallback.ModalSave,
    actionVariant: 'primary',
    description: 'To create a new connection to slack integration click on the \'Connect\' button! ',
    settings: data,
    spaces: spaces,
  })

  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: options.data.interactionId,
          type: InteractionType.OpenModal,
          slate: rawSlateToDto(slate),
          props: {
            size: 'lg',
            title: 'Connect to Slack',
            // description: 'Select your configs by choosing the values below',
          },
        },
      ],
    },
  }
}

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
  networkSettings: NetworkSettings,
  data: InteractionInput<NetworkSettings>,
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

const getAuthRevokeCallbackResponse = async (options: {
  networkSettings: NetworkSettings,
  data: InteractionInput<NetworkSettings>,
  networkId: string
}): Promise<InteractionWebhookResponse> => {
  const {
    data: { interactionId },
    networkId,
  } = options
  try {
    await NetworkSettingsRepository.delete(networkId)
  } catch (error) {
    logger.error(error)
    logger.log("Service unavailable error!")
    // return getServiceUnavailableError(options)
  }

  return getDisconnectedNetworkSettingsResponse({ interactionId })
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
    case SettingsBlockCallback.AuthRevoke:
      return getAuthRevokeCallbackResponse(options)
    default:
      return getInteractionNotSupportedError('callbackId', callbackId)
  }
}
