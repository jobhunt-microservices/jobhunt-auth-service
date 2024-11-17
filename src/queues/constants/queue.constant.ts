export const exchangeNames = {
  SEND_EMAIL: 'jobhunt-send-email',
  USER_CREATED: 'jobhunt-user-created',
  BUY_CREATED: 'jobhunt-buyer-created'
} as const satisfies Record<string, string>;

export const routingKeys = {
  SEND_EMAIL: 'send.email',
  USER_CREATED: 'user.created',
  BUYER_CREATED: 'buyer.created'
} as const satisfies Record<string, string>;
