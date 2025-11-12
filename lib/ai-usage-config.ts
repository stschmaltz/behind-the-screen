export const AI_EXEMPT_USERS: string[] = [
  // 'example@email.com',
  // 'admin@yourdomain.com',
  'stschmaltz@gmail.com',
];

export const isExemptUser = (email: string): boolean => {
  return AI_EXEMPT_USERS.includes(email.toLowerCase());
};
