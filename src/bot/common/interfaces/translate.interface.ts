interface LanguageTranslations {
  asking_phone: string;
  replying_auth_success: string;
  replying_auth_bad: string;
  invalid_phone: string;
}

interface LanguageTranslations {
  asking_phone: string;
  replying_auth_success: string;
  replying_auth_bad: string;
  invalid_phone: string;
  role: string
}



export interface Translates {
  uz: LanguageTranslations;
  ru: LanguageTranslations & { invalid_phone?: string }; // 'ru' might not have 'invalid_phone'
}