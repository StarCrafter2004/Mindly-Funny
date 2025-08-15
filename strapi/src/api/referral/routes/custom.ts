export default {
  routes: [
    {
      method: "POST",
      path: "/referrals/increment",
      handler: "referral.incrementGiftCounter",
    },
  ],
};
