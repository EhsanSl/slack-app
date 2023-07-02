import { BettermodeOAuthController } from './bettermode-oauth.controller'
import { IndexController } from './index.controller'
import { OAuthController } from './oauth.controllers'
import { WebhookController } from './webhook.controller'

export * from './index.controller'
export * from './webhook.controller'

const defaultControllers = [IndexController, WebhookController, BettermodeOAuthController, OAuthController]

export default defaultControllers
