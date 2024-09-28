export interface MySession {
  language?: string;
  step?: string;  // Current step (menu, verification, etc.)
  collectedData?: {
    phoneNumber?: string;
    role?: string;
    [key: string]: any;
  };
}
