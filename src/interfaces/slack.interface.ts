export interface SlackAuthProfile {
  // // eslint-disable-next-line @typescript-eslint/naming-convention
  provider: string
  id: number
  displayName: string
  profileUrl: string
  emails: { value: string }[]
  _raw: string
  _json: {
    user: {
      id: number
      url: string
      name: string
      email: string
      created_at: string
      updated_at: string
      time_zone: string
      iana_time_zone: string
      phone: string
      shared_phone_number: string
      photo: string
      locale_id: number
      locale: string
      organization_id: string
      role: string
      verified: boolean
      authenticity_token: string
      external_id: string
      tags: string[]
      alias: string
      active: boolean
      shared: boolean
      shared_agent: boolean
      last_login_at: string
      two_factor_auth_enabled: string
      signature: string
      details: string
      notes: string
      role_type: number
      custom_role_id: number
      moderator: boolean
      ticket_restriction: string
      only_private_comments: boolean
      restricted_agent: boolean
      suspended: boolean
      default_group_id: number
      report_csv: boolean
      user_fields: string
    }
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
