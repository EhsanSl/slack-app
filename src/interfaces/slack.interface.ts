export interface SlackAuthProfile {
  // // eslint-disable-next-line @typescript-eslint/naming-convention
  ok: true,
  access_token: string,
  scope: string,
  user_id: string,
  team_id: string,
  enterprise_id?: string,
  team_name: string,
  incoming_webhook: {
    channel: string,
    channel_id: string,
    // "params": {}

  }
}
export interface SlackAuthInfo {
  profile: SlackAuthProfile
  refreshToken: string
  accessToken: string
}

export interface SlackState {
  networkId: string
  actorId: string
  subdomain: string
  redirectUrl: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      state?: SlackState
      user?: SlackAuthInfo
    }
  }
}
