import { RawSlateDto } from '@tribeplatform/slate-kit/dtos'

import { SettingsBlockCallback } from '../constants'

import { getOauthSettingsBlocks } from './oauth.slate'

export const getDisconnectedSettingsSlate = (): RawSlateDto => {
  return {
    rootBlock: 'root',
    blocks: [
      {
        id: 'root',
        name: 'Container',
        props: { spacing: 'md' },
        children: ['auth'],
      },
      ...getOauthSettingsBlocks({
        id: 'auth',
        action: 'Add Connection',
        actionCallbackId: SettingsBlockCallback.AuthRedirect,
        actionVariant: 'primary',
        description:
          `You do not have any slack channels connected to this community.`,
      }),
    ],
  }
}
