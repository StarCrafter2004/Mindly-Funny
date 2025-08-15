import { api } from "@/shared/api/axiosInstance";
import { create } from "zustand";
import { useUserStore } from "./userStore";

type Sex = "male" | "female" | "notSet";
type Age = string | null;

export type ProfileDataFromAPI = {
  documentId: string;
  telegram_id: number;
  country: string | null;
  firstName: string;
  lastName?: string;
  profession: string | null;
  age: Age;
  sex: Sex;
  isProfileComplete: boolean;
  isPremium: boolean;
  freeReports: number;
  isTestPassed: boolean;
  FreePremActivated: boolean;
  lives: number;
};

type Country = {
  name: string;
};
type Profession = {
  name: string;
};

type ProfileStore = {
  id: string | null;
  sex: Sex;
  age: Age;
  profession: string | null;
  country: string | null;
  isProfileComplete: boolean;
  isPremium: boolean;

  redirectToAfterFill: string | null;

  editedSex: Sex;
  editedAge: Age;
  editedProfession: string | null;
  editedCountry: string | null;

  countries: Country[];
  professions: Profession[];

  freeReports: number;

  isTestPassed: boolean;
  FreePremActivated: boolean;
  lives: number;

  setSex: (sex: Sex) => void;
  setAge: (age: Age) => void;
  setProfession: (profession: string | null) => void;
  setCountry: (country: string | null) => void;

  fetchProfile: (
    firstName?: string,
    lastName?: string,
    username?: string,
  ) => Promise<void>;
  fetchCountry: () => Promise<void>;
  fetchProfession: () => Promise<void>;
  createProfile: (
    telegramId: number,
    firstName?: string,
    lastName?: string,
    username?: string,
  ) => Promise<void>;
  updateProfile: (data: {
    id: string | null;
    sex: Sex;
    age: Age;
    profession: string | null;
    country: string | null;
  }) => Promise<void>;
  setEditedSex: (sex: Sex) => void;
  setEditedAge: (age: Age) => void;
  setEditedProfession: (profession: string | null) => void;
  setEditedCountry: (country: string | null) => void;
  setPremium: (stauts: boolean) => void;
  setRedirectToAfterFill: (path: string | null) => void;
  setLives: (lives: number) => void;
  setFreePremActivated: (FreePremActivated: boolean) => void;
};

const defaultState = {
  id: null,
  sex: "notSet" as Sex,
  age: null,
  profession: null,
  country: null,
  isProfileComplete: false,
  redirectToAfterFill: null,
  editedSex: "notSet" as Sex,
  editedAge: null,
  editedProfession: null as string | null,
  editedCountry: null as string | null,
  isPremium: false,
  countries: [],
  professions: [],
  freeReports: 0,
  isTestPassed: false,
  FreePremActivated: false,
  lives: 0,
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  ...defaultState,

  setSex: (sex) => set({ sex }),
  setAge: (age) => set({ age }),
  setProfession: (profession) => set({ profession }),
  setCountry: (country) => set({ country }),

  fetchCountry: async () => {
    try {
      const res = await api.get<{ data: { json: Array<{ name: string }> } }>(
        `/api/country`,
      );

      set({ countries: res.data.data.json });
    } catch (err) {
      console.log(err);
    }
  },
  fetchProfession: async () => {
    try {
      const res = await api.get<{ data: { json: Array<{ name: string }> } }>(
        `/api/profession`,
      );
      console.log("res", res);
      set({ professions: res.data.data.json });
    } catch (err) {
      console.log(err);
    }
  },

  fetchProfile: async (firstName, lastName, username) => {
    const telegramId = useUserStore.getState().user?.id as number;
    try {
      const res = await api.get<{ data: ProfileDataFromAPI[] }>(
        `/api/t-users?filters[telegram_id][$eq]=${telegramId}`,
      );

      if (res.data.data.length > 0) {
        const profileDataRaw = res.data.data[0];

        set({
          id: profileDataRaw.documentId,
          sex: profileDataRaw.sex,
          age: profileDataRaw.age,
          profession: profileDataRaw.profession,
          country: profileDataRaw.country,
          isProfileComplete: profileDataRaw.isProfileComplete,
          isPremium: profileDataRaw.isPremium,
          freeReports: profileDataRaw.freeReports,
          isTestPassed: profileDataRaw.isTestPassed,
          lives: profileDataRaw.lives,
          FreePremActivated: profileDataRaw.FreePremActivated,
        });
        set({
          editedSex: profileDataRaw.sex,
          editedAge: profileDataRaw.age,
          editedProfession: profileDataRaw.profession,
          editedCountry: profileDataRaw.country,
        });
      } else {
        set(defaultState);
        await get().createProfile(telegramId, firstName, lastName, username);
        console.warn("Profile not found for telegramId:", telegramId);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  },

  createProfile: async (telegramId, firstName, lastName, username) => {
    try {
      const res = await api.post<{ data: ProfileDataFromAPI }>("/api/t-users", {
        data: { telegram_id: telegramId, firstName, lastName, username },
      });

      const createdProfile = res.data.data;
      if (createdProfile) {
        set({
          id: createdProfile.documentId,
          sex: createdProfile.sex ?? "notSet",
          age: createdProfile.age ?? null,
          profession: createdProfile.profession ?? null,
          country: createdProfile.country ?? null,
          isProfileComplete: false,
        });
      }
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const { id, sex, age, profession, country } = data;
      if (!id) throw new Error("No documentId (id) provided for update");

      await api.put(`/api/t-users/${id}`, {
        data: { sex, age, profession, country, isProfileComplete: true },
      });

      set({ sex, age, profession, country, isProfileComplete: true });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  },

  setPremium: (status) => {
    set({ isPremium: status });
  },

  setEditedSex: (sex: Sex) => set({ editedSex: sex }),

  setEditedAge: (age: Age) => set({ editedAge: age }),

  setEditedProfession: (profession: string | null) =>
    set({ editedProfession: profession }),

  setEditedCountry: (country: string | null) => set({ editedCountry: country }),
  setRedirectToAfterFill: (path) => set({ redirectToAfterFill: path }),
  setLives: (lives: number) => {
    set({ lives });
  },
  setFreePremActivated: (FreePremActivated: boolean) => {
    set({ FreePremActivated });
  },
}));
