import { useThemeStore } from "@/features/theme";

import { CompletedTests } from "@/pages/complitedTests";
import { LanguageSelect } from "@/pages/languageSelect";
import { MainPage } from "@/pages/main";
import { Profile } from "@/pages/profile";
import { Settings } from "@/pages/settings";
import { QuestionPage } from "@/pages/test";
import { ThemeSelect } from "@/pages/themeSelect";
import { Welcome } from "@/pages/welcome";
import { MainLayout } from "@/widgets/mainLayout/";
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import { init, backButton } from "@telegram-apps/sdk-react";
import { swipeBehavior } from "@telegram-apps/sdk";
import { BackButton } from "./utils/BackButton.ts";
import { Country, FillProfile, Profession } from "@/pages/fillProfile/index.ts";
import { useProfileStore } from "@/entities/user/model/fillProfileStore.ts";
import { useUserStore } from "@/entities/user/index.ts";

import { InvitationsPage } from "@/pages/invitations/index.ts";
import { useLanguageStore } from "@/features/language/model/languageStore.ts";
import { toPng } from "html-to-image";

import { preload } from "react-dom";
import { ASSET_IMAGES } from "./utils/preloadAssets.ts";
import { useConfigStore } from "@/shared/config/appConfigStore.ts";
import { ResultPage } from "@/pages/result/ui/ResultPage.tsx";
import { AllResults } from "@/pages/result/index.ts";

init();

backButton.mount();

if (swipeBehavior.mount.isAvailable()) {
  swipeBehavior.mount();
  if (swipeBehavior.disableVertical.isAvailable()) {
    swipeBehavior.disableVertical();
  }
}

function App() {
  ASSET_IMAGES.forEach((src) =>
    preload(src, { as: "image", fetchPriority: "high" }),
  );

  const fetchProfile = useProfileStore((store) => store.fetchProfile);
  const firstName = useUserStore((store) => store.user)?.firstName;
  const lastName = useUserStore((store) => store.user)?.lastName;
  const username = useUserStore((store) => store.user)?.username;
  const fetchLanguageOptions = useLanguageStore((store) => store.fetchOptions);
  const theme = useThemeStore((store) => store.resolvedTheme);

  const location = useLocation();
  const fetchCountry = useProfileStore((store) => store.fetchCountry);
  const fetchProfession = useProfileStore((store) => store.fetchProfession);
  const noBackButtonPaths = ["/", "/main", "/profile", "/settings"];
  const loadAppConfig = useConfigStore((store) => store.loadConfig);
  const loadFilters = useConfigStore((store) => store.loadFilters);
  const showBackButton = !noBackButtonPaths.includes(location.pathname);

  useEffect(() => {
    toPng(document.createElement("div")).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProfile(firstName, lastName, username);
    fetchLanguageOptions();
    fetchCountry();
    fetchProfession();
    loadAppConfig();
    loadFilters();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="bg-surface-primary font-inter w-[100vw]" data-theme={theme}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route element={<MainLayout />}>
          <Route path="main" element={<MainPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings">
            <Route index element={<Settings />} />
            <Route path="theme" element={<ThemeSelect />} />
            <Route path="language" element={<LanguageSelect />} />
          </Route>
        </Route>
        <Route path="test/:id" element={<QuestionPage />} />
        <Route path="result/:id" element={<ResultPage />} />
        <Route path="/profile/result/:id" element={<ResultPage />} />
        <Route path="/all-answers" element={<AllResults />} />

        <Route path="profile/completed-tests" element={<CompletedTests />} />
        <Route path="profile/invitations" element={<InvitationsPage />} />
        <Route path="profile/fill" element={<FillProfile />} />
        <Route path="profile/fill/profession" element={<Profession />} />
        <Route path="profile/fill/country" element={<Country />} />
      </Routes>
      {showBackButton && <BackButton />}
    </div>
  );
}

export default App;
