import { SERVER_URL } from '@config';
import { SlackAuthInfo, SlackState } from '@interfaces';
import { NetworkSettingsRepository } from '@repositories';
import { Network } from '@tribeplatform/gql-client/types';
import { getNetworkUrl, getSlackAppUrl, globalLogger, signJwt } from '@utils';

const logger = globalLogger.setContext('oauth.logics');
export const connectToSlack = async (options: {
  authInfo: SlackAuthInfo
  state: SlackState
}) => {
  logger.log('OPTIONS', { options })
  const { authInfo, state } = options;
  const { networkId, actorId } = state;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const {
    profile: {
      user: { id: user_id, name: user_name, email },
      team: { id: team_id, name: team_name, domain },
    },
    accessToken: access,
    refreshToken: refresh,
  } = authInfo;
  logger.debug('connectToSlack called', { authInfo, state });
  // logger.log("authinfo", authInfo)
  // logger.log("user: ", authInfo.profile.user)

  await NetworkSettingsRepository.upsert(networkId, {
    memberId: actorId,

    userId: String(user_id),
    userName: user_name,
    email: email,

    teamId: team_id,
    teamName: team_name,
    domain: domain,

    access: access,
    refresh: "",
  });

};

export const getConnectSlackUrl = async (options: { network: Network; actorId: string }) => {
  const { network, actorId } = options;
  logger.log("Slack App URL", getSlackAppUrl(getNetworkUrl(network)));
  return `${SERVER_URL}/oauth?jwt=${await signJwt({
    networkId: network.id,
    actorId,
    redirectUrl: getSlackAppUrl(getNetworkUrl(network)),
  })}`;
};