import { CLIENT_ID, CLIENT_SECRET, GRAPHQL_URL } from '@config';

import { IncomingWebhook as IncomingWebhookType } from '@/interfaces/incoming-webhook.interface';
import IncomingWebhookModel from '@/models/incomingWebhook.model';
import SlackService from '@/services/slack.services';
import { createLogger } from '@/utils/logger';
import { GlobalClient, Types } from '@tribeplatform/gql-client';
import express from 'express';
import passport from 'passport-slack';

const logger = createLogger('PassportMiddleware')

const SlackStrategy = require('passport-slack').Strategy;
const DEFAULT_EVENTS = [
  'post.published',
  'moderation.created',
  'moderation.accepted',
  'moderation.rejected',
  'space_membership.created',
  // 'space_membership.deleted',
  'space_join_request.created',
  'space_join_request.accepted',
  'member_invitation.created',
  'member.verified',
];
interface Params {
  ok: true;
  access_token: string;
  scope: string;
  user_id: string;
  team_id: string;
  enterprise_id: string;
  team_name: string;
  incoming_webhook: {
    channel: string;
    channel_id: string;
    configuration_url: string;
    url: string;
  };
}
const init = (app: express.Application) => {
  passport.use(
    new SlackStrategy(
      {
        name: 'webhook',
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        scope: ['incoming-webhook', 'chat:write:bot'],
        skipUserProfile: true,
        passReqToCallback: true,
        callbackURL: '/api/slack/webhook/auth/callback',
      },
      async (req: express.Request, accessToken: string, refreshToken: string, params: Params, profile, done) => {
        try {
          let buff = Buffer.from(String(req.query.state), 'base64');
          const { n: networkId, m: memberId, s: spaceIds } = JSON.parse(buff.toString('ascii')) as { n: string; m: string; s: string };
          const webhook: IncomingWebhookType = await IncomingWebhookModel.create({
            channel: params?.incoming_webhook?.channel,
            channelId: params?.incoming_webhook?.channel_id,
            url: params?.incoming_webhook?.url,
            configUrl: params?.incoming_webhook?.configuration_url,
            scope: params?.scope,
            accessToken: params?.access_token,
            userId: params?.user_id,
            teamId: params?.team_id,
            teamName: params?.team_name,
            memberId,
            networkId,
            spaceIds: spaceIds?.split(',') || [],
            events: DEFAULT_EVENTS,
          });
          const globalClient = new GlobalClient({
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            graphqlUrl: GRAPHQL_URL,
          });

          const tribeClient = await globalClient.getTribeClient({
            networkId,
          });
          const network = await tribeClient.network.get('all');
          const options: any = { username: network.name, channel: webhook.channelId };
          if (network?.favicon) {
            const image = (network?.favicon as Types.Image)?.url;
            options.image = image;
          }
          await new SlackService(webhook.accessToken).sendWelcomeMessage(options);
          done(null, webhook);
        } catch (err) {
          logger.error('An error occured during the SlackStrategy handling');
          logger.error(err);
          done(err, {});
        }
      },
    ),
  );
  app.use(passport.initialize());
};

export default {
  init,
};
