export const exchangeNames = {
  BUYER_UPDATE: 'jobhunt-buyer-update',
  EMAIL_NOTIFICATION: 'jobhunt-email-notification'
} as const satisfies Record<string, string>;

export const routingKeys = {
  AUTH_EMAIL: 'auth-email',
  USER_BUYER: 'user-buyer'
} as const satisfies Record<string, string>;
