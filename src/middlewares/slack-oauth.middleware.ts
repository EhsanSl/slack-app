/* eslint-disable require-atomic-updates */
import { SERVER_URL, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } from '@config';
import { SlackAuthProfile, SlackState } from '@interfaces';
import { globalLogger, verifyJwt } from '@utils';
import { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as SlackPassportStrategy } from 'passport-slack-oauth2';
// passport-slack-oauth2


const logger = globalLogger.setContext('slack-oauth.middleware');
const OAUTH_SCOPES = ['identity.basic', 'identity.email', 'identity.avatar', 'identity.team',]; //identity.basic ,'chat:write:bot', incoming-webhook


class SlackStrategy extends SlackPassportStrategy {
  _oauth2: any

  constructor(options, verify) {
    super(options, verify)
  }

  public authenticate(req: Request, options) {
    return super.authenticate(req, { ...options, state: req.query.jwt })
  }
}

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

passport.use(
  new SlackStrategy(
    {
      clientID: SLACK_CLIENT_ID,
      clientSecret: SLACK_CLIENT_SECRET,
      scope: OAUTH_SCOPES,
      callbackURL: `${SERVER_URL}/oauth/callback`,
      skipUserProfile: false,
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: SlackAuthProfile,
      done,
    ) => {
      const user: Request['user'] = { accessToken, refreshToken, profile }
      logger.log("user", { user })
      // logger.log("params", { params })
      return done(null, user)
    },
  ),
)

export const slackOAuthMiddleware = passport.authenticate('Slack')

export const consumerExtractorMiddleware = async (req: Request, res: Response, next) => {
  const state = await verifyJwt<SlackState>(
    (req.query.jwt || req.query.state) as string,
  )
  // const community = await NetworkSettingsRepository.findUniqueOrThrow(state.networkId)

  req.state = state

  // req.consumerKey = community.newConsumerKey
  // req.consumerSecret = community.newConsumerSecret

  next()
}