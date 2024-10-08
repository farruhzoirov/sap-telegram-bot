import axios from 'axios';

// SapSession Model for mongodb
import {SapSession} from '../models/sapsession.schema';

// Sap config based things

import {SAP_API_URL, LOGIN_DATA} from '../config/sapConfig';

// Fetch Session ID
export async function getSessionId(): Promise<string | null> {
  const session = await SapSession.findOne();
  if (session && await isSessionValid(session)) {
    console.log(`Valid sessionId found in MongoDB: ${session.sessionId}`);
    return session.sessionId;
  }
  console.log('No valid sessionId found. Logging in...');
  return await loginToSAPAndStoreSession();
}

// Login to SAP and Store the Session
export async function loginToSAPAndStoreSession(): Promise<string> {
  try {
    const response = await axios.post(`${SAP_API_URL}/Login`, LOGIN_DATA);
    const sessionId = response?.data?.SessionId;
    const sessionTimeOut = response?.data?.SessionTimeout;
    if (sessionId && sessionTimeOut) {
      const sessionExpiry = Date.now() + sessionTimeOut * 1000;
      await SapSession.findOneAndUpdate(
        {},
        {sessionId, sessionExpiry},
        {upsert: true}
      );
      return sessionId;
    } else {
      throw new Error('No sessionId or SessionTimeout returned from SAP login');
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

async function isSessionValid(session: any): Promise<boolean> {
  return session ? Date.now() < session.sessionExpiry : false;
}
