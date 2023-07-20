import { InteractionInput } from '@interfaces'
import { NetworkSettings } from '@prisma/client'
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos'
import { SettingsBlockCallback } from '../constants'


export const getNetworkSettingsModalSlate = (options: {
    spaces: string[]
    settings: InteractionInput<NetworkSettings>,
    id: string
    description: string
    action: string
    actionVariant: 'outline' | 'primary' | 'danger'
    actionCallbackId: SettingsBlockCallback
    secondaryAction?: string
    secondaryActionCallbackId?: SettingsBlockCallback
}): RawSlateDto => {
    const {
        spaces,
        settings,
        id,
        description,
        action,
        actionVariant,
        actionCallbackId,
        secondaryAction,
        secondaryActionCallbackId,
    } = options

    const { inputs } = settings
    const { createdAt, updatedAt, networkId, memberId, email, userName, refresh } = inputs || {};

    return {
        rootBlock: 'root',
        blocks: [
            {
                id: '${id}.root',
                name: 'Container',
                props: {
                    spacing: 'md',
                },
                children: ['Form'],
            },
            {
                id: '${id}form',
                name: "form",
                children: ['spaces', 'channels', 'toggles']
            }
        ]
    }
}
