import { join } from 'path'

import { NetworkSettings } from '@prisma/client'
import { LiquidConvertor } from '@tribeplatform/slate-kit/convertors'
import { SlateDto } from '@tribeplatform/slate-kit/dtos'
import { globalLogger } from '@utils'
import { readFile } from 'fs-extra'

const logger = globalLogger.setContext(`SettingsDynamicBlock`)

export const getNetworkSettingsSlate = async (
  settings: NetworkSettings,
): Promise<SlateDto> => {
  logger.debug('getNetworkSettingsSlate called', { settings })

  const liquid = await readFile(
    join(__dirname, 'slates', 'network-settings.slate.liquid'),
    'utf8',
  )
  const convertor = new LiquidConvertor(liquid)
  const slate = await convertor.toSlate({
    variables: {},
  })
  logger.info("Hey this is the slate", {slate})
  return slate
}


export const getDisconnectedNetworkSettingsSlate = async (): Promise<SlateDto> => {
  logger.debug('getDisconnectedNetworkSettingsSlate called')

  const liquid = await readFile(
    join(__dirname, 'slates', 'network-settings.slate.liquid'),
    'utf8',
  )
  const convertor = new LiquidConvertor(liquid)
  const slate = await convertor.toSlate({
    variables: {},
  })
  logger.info("Hey this is the slate", {slate})
  return slate
}

export const getNetworkSettingsModalSlate = async (
  settings: NetworkSettings,
): Promise<SlateDto> => {
  logger.debug('getNetworkSettingsModalSlate called', { settings })

  const liquid = await readFile(
    join(__dirname, 'slates', 'network-settings-modal.slate.liquid'),
    'utf8',
  )
  const convertor = new LiquidConvertor(liquid)

  const slate = await convertor.toSlate({
    variables: {},
  })
  return slate
}
