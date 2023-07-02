import { GRAPHQL_URL, SERVER_URL } from '@config';
import { SlackAuthInfo, SlackState } from '@interfaces';
import { NetworkSettingsRepository } from '@repositories';
import { Network } from '@tribeplatform/gql-client/types';
import { getNetworkUrl, getSlackAppUrl, globalLogger, signJwt } from '@utils';

const logger = globalLogger.setContext('oauth.logics');
export const connectToSlack = async (options: { authInfo: SlackAuthInfo; state: SlackState }) => {
  const { authInfo, state } = options;
  const { networkId, actorId } = state;
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    profile: {
      _json: {
        user: { id, name, email },
      },
    },
    accessToken: access,
    refreshToken: refresh, 
    
  } = authInfo;
  logger.debug('connectToSlack called', { authInfo, state });
  await NetworkSettingsRepository.upsert(networkId, {
    id: String(id),
    name: String(name),
    domain: SERVER_URL,
    graphqlUrl: GRAPHQL_URL,
    error: '', 
    // refreshToken: refresh, 
    // accessToken: access, 
  });
};

export const getConnectSlackUrl = async (options: { network: Network; actorId: string }) => {
  const { network, actorId } = options;
  return `${SERVER_URL}/oauth?jwt=${await signJwt({
    networkId: network.id,
    actorId,
    redirectUrl: getSlackAppUrl(getNetworkUrl(network)),
  })}`;
};