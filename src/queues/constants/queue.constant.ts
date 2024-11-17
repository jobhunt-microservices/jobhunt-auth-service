export const exchangeNames = {
  AUTH_EMAIL_NOTIFICATION: 'jobhunt-email-notification',
  AUTH_NOTIFICATION: 'jobhunt-auth-notification'
} as const satisfies Record<string, string>;

export const routingKeys = {
  AUTH_EMAIL: 'auth-email',
  AUTH_USER: 'auth-user'
} as const satisfies Record<string, string>;
