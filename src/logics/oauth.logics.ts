import { SERVER_URL } from '@config';
import { SlackAuthInfo, SlackState } from '@interfaces';
import { Network } from '@tribeplatform/gql-client/types';
import { getNetworkUrl, getSlackAppUrl, globalLogger, signJwt } from '@utils';

const logger = globalLogger.setContext('oauth.logics');
export const connectToSlack = async (options: {
  authInfo: SlackAuthInfo
  state: SlackState
}) => {
  logger.log('optionns', { options })
  const { authInfo, state } = options;
  const { networkId, actorId } = state;
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    profile: {
      // ok: true,
      // access_token: string,
      // scope: string,
      // user_id: string,
      // team_id: string,
      // enterprise_id?: string,
      team_name,
      // incoming_webhook: {
      //   channel: string,
      //   channel_id: string,
      //   // "params": {}
    }
    ,
    accessToken: access,
    refreshToken: refresh,
  } = authInfo;
  logger.log(team_name)
  logger.debug('connectToSlack called', { authInfo, state });

  //   await NetworkSettingsRepository.upsert(networkId, {
  //     id: String(id),
  //     memberId: actorId, 
  //     name: String(name),
  //     email : email, 

  //     createdAt : created_at, 
  //     updatedAt: updated_at, 

  //     access,  
  //     refresh, 

  //     graphqlUrl: GRAPHQL_URL,
  //     error: '', 

  //   });
};

export const getConnectSlackUrl = async (options: { network: Network; actorId: string }) => {
  const { network, actorId } = options;
  console.log("****slack app url is", getSlackAppUrl(getNetworkUrl(network)));

  // console.log("get connect slack url returns " , `${SERVER_URL}/oauth?jwt=${await signJwt({
  //   networkId: network.id,
  //   actorId,
  //   redirectUrl: getSlackAppUrl(getNetworkUrl(network)),
  // })}`)

  return `${SERVER_URL}/oauth?jwt=${await signJwt({
    networkId: network.id,
    actorId,
    redirectUrl: getSlackAppUrl(getNetworkUrl(network)),
  })}`;
};