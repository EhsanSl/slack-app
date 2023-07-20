export interface User {
  id: string,
  name: string,
  email: string,
}

export interface Team {
  id: string,
  name: string,
  domain: string,
}

export interface SlackAuthProfile {
  user: User
  team: Team
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
