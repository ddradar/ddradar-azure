type Role = 'anonymous' | 'authenticated' | 'administrator'

/**
 * User information provided by Azure Static Web Apps.
 * @see {@link https://docs.microsoft.com/azure/static-web-apps/user-information#client-principal-data Microsoft Docs}
 */
export type ClientPrincipal = {
  /** The name of the {@link https://docs.microsoft.com/azure/static-web-apps/authentication-authorization identity provider.} */
  identityProvider: 'github' | 'twitter'
  /**
   * An Azure Static Web Apps-specific unique identifier for the user.
   * @description
   * - The value is unique on a per-app basis.
   * For instance, the same user returns a different `userId` value on a different Static Web Apps resource.
   * - The value persists for the lifetime of a user.
   * If you delete and add the same user back to the app, a new `userId` is generated.
   */
  userId: string
  /** User Name (GitHub/Twitter) */
  userDetails: string
  /** An array of the {@link https://docs.microsoft.com/azure/static-web-apps/authentication-authorization#roles user's assigned roles.} */
  userRoles: ReadonlyArray<Role>
}
