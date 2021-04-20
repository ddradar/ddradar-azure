type Role = 'anonymous' | 'authenticated' | 'administrator'

/** User information provided by Azure */
export type ClientPrincipal = {
  /** The name of the identity provider. */
  identityProvider: 'github' | 'twitter'
  /** An Azure Static Web Apps-specific unique identifier for the user. */
  userId: string
  /** User Name (GitHub/Twitter) */
  userDetails: string
  /** An array of the user's assigned roles. */
  userRoles: ReadonlyArray<Role>
}
