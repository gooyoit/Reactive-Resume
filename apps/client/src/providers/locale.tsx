import "@/client/libs/dayjs";

import { i18n } from "@lingui/core";
import { detect, fromStorage, fromUrl } from "@lingui/detect-locale";
import { I18nProvider } from "@lingui/react";
import { languages } from "@reactive-resume/utils";
import { useEffect } from "react";

import { defaultLocale, dynamicActivate } from "../libs/lingui";
import { updateUser } from "../services/user";
import { useAuthStore } from "../stores/auth";

type Props = {
  children: React.ReactNode;
};

export const LocaleProvider = ({ children }: Props) => {
  const userLocale = useAuthStore((state) => state.user?.locale ?? defaultLocale);

  useEffect(() => {
    // Priority order: URL > LocalStorage > UserProfile > Default
    let detectedLocale = defaultLocale;

    // Check URL parameter first
    const urlLocale = detect(fromUrl("locale"));
    if (urlLocale && languages.some((lang) => lang.locale === urlLocale)) {
      detectedLocale = urlLocale;
    } else {
      // Check local storage
      const storageLocale = detect(fromStorage("locale"));
      if (storageLocale && languages.some((lang) => lang.locale === storageLocale)) {
        detectedLocale = storageLocale;
      } else if (
        userLocale &&
        userLocale !== defaultLocale &&
        languages.some((lang) => lang.locale === userLocale)
      ) {
        // Only use userLocale if it's actually set (not the fallback) and is supported
        detectedLocale = userLocale;
      }
    }

    // Activate the detected locale
    void dynamicActivate(detectedLocale);
  }, [userLocale]);

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
};

export const changeLanguage = async (locale: string) => {
  // Update locale in local storage
  window.localStorage.setItem("locale", locale);

  // Update locale in user profile, if authenticated
  const state = useAuthStore.getState();
  if (state.user) await updateUser({ locale }).catch(() => null);

  // Reload the page for language switch to take effect
  window.location.reload();
};
