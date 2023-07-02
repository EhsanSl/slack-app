/* eslint-disable require-atomic-updates */
import { SERVER_URL, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } from '@config';
import { SlackAuthProfile, SlackState } from '@interfaces';
import { globalLogger, verifyJwt } from '@utils';
import { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as SlackPassportStrategy } from 'passport-slack';


const logger = globalLogger.setContext('Slack-oauth.middleware');
const OAUTH_SCOPES = ['read', 'tickets:write', 'identity.basic', 'identity.email', 'identity.avatar', 'identity.team'];


class SlackStrategy extends SlackPassportStrategy {
  _oauth2: any;

  constructor(options, verify) {
    super(options, verify);
  }

  public authenticate(req: Request, options) {
    return super.authenticate(req, { ...options, state: req.query.jwt });
  }
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new SlackStrategy(
    {
      clientID: SLACK_CLIENT_ID,
      clientSecret: SLACK_CLIENT_SECRET,
      scope: OAUTH_SCOPES,
      callbackURL: `${SERVER_URL}/oauth/callback`,
      passReqToCallback: true,
    },
    async function verify(request: Request, accessToken: string, refreshToken: string, profile: SlackAuthProfile, done) {
      const user: Request['user'] = { accessToken, refreshToken, profile };
      return done(null, user);
    },
  ),
);

export const SlackOAuthMiddleware = passport.authenticate('slack');

export const consumerExtractorMiddleware = async (req: Request, res: Response, next) => {
  const state = await verifyJwt<SlackState>((req.query.jwt || req.query.state) as string);
  req.state = state;
  next();
};