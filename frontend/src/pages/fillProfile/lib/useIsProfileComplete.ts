import { useProfileStore } from "../../../entities/user/model/fillProfileStore";

export const useIsProfileComplete = () => {
  const age = useProfileStore((s) => s.editedAge);

  const profession = useProfileStore((s) => s.editedProfession);

  const country = useProfileStore((s) => s.editedCountry);

  const isComplete = age !== null && profession !== null && country !== null;

  return isComplete;
};
