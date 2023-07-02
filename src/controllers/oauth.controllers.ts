import { connectToSlack } from '@logics'
import { consumerExtractorMiddleware, SlackOAuthMiddleware } from '@middlewares'
import { globalLogger } from '@utils'
import { Request, Response } from 'express'
import { Controller, Get, HttpCode, Req, Res, UseBefore } from 'routing-controllers'
import { OpenAPI } from 'routing-controllers-openapi'

@Controller('/oauth')
export class OAuthController {
  readonly logger = globalLogger.setContext(OAuthController.name)

  @Get()
  @UseBefore(consumerExtractorMiddleware, SlackOAuthMiddleware)
  @OpenAPI({ summary: 'Redirects to the Slack for authorization.' })
  @HttpCode(302)
  async redirect(): Promise<void> {
    this.logger.log("Hi there")
  }

  @Get('/callback')
  @UseBefore(consumerExtractorMiddleware, SlackOAuthMiddleware)
  @OpenAPI({ summary: 'Redirects to the app settings page after authentication.' })
  @HttpCode(302)
  async callback(@Req() request: Request, @Res() response: Response): Promise<Response> {
    this.logger.verbose('Received oauth callback request', {
      user: request.user,
      state: request.state,
    })

    await connectToSlack({
      authInfo: request.user,
      state: request.state,
    })
    response.redirect(request.state.redirectUrl)
    return response
  }
}
