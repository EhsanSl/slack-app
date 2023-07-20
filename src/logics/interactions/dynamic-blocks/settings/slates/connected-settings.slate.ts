import { NetworkSettings } from '@prisma/client'
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos'

import { SettingsBlockCallback } from '../constants'

// import { getActivitySyncIntegrationBlocks } from './activity-sync.slate'
import { InteractionInput } from '@interfaces'
import { getModalSettingsBlocks } from './create-connection-block.slates'
import { getOauthSettingsBlocks } from './oauth.slate'
// import { getContactSyncIntegrationBlocks } from './contact-sync.slate'
// import { getFederatedSearchIntegrationBlocks } from './federated-search-integration.slate'
// import { getTicketIntegrationBlocks } from './ticket-integration.slate'

export const getConnectedNetworkSettingsSlate = (options: {
  settings: InteractionInput<NetworkSettings>
}): RawSlateDto => {
  const { settings } = options
  return {
    rootBlock: 'root',
    blocks: [
      {
        id: 'root',
        name: 'Container',
        props: { spacing: 'md' },
        children: [
          // 'contact-integration',
          // 'activity-integration',
          // 'ticket-integration',
          // 'federated-search-integration',
          'modal',
          'auth',
        ],
      },
      //   ...getContactSyncIntegrationBlocks({
      //     id: 'contact-integration',
      //     settings,
      //   }),
      //   ...getActivitySyncIntegrationBlocks({
      //     id: 'activity-integration',
      //     settings,
      //   }),
      //   ...getTicketIntegrationBlocks({
      //     id: 'ticket-integration',
      //     settings,
      //   }),

      ...getOauthSettingsBlocks({
        id: 'auth',
        action: 'Revoke',
        actionCallbackId: SettingsBlockCallback.AuthRevoke,
        actionVariant: 'danger',
        description:
          'To discard any connection from integration click on the \'Revoke\' button.',
      }),
      ...getModalSettingsBlocks({
        id: 'modal',
        action: 'Connect',
        actionCallbackId: SettingsBlockCallback.OpenModal,
        actionVariant: 'primary',
        description: 'To create a new connection to slack integration click on the \'Connect\' button! ',
        settings: settings,
      }),
    ],
  }
}
