export type Referral = {
  user_id: number;
  referrer_id: number;
  isUsed: boolean;
};

export type Invitation = {
  firstName: string;
  lastName?: string;
  isUsed: boolean;
};
