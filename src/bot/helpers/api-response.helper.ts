import axios from 'axios';
import {SAP_API_URL} from '../config/sapConfig';
import {getSessionId} from "../services/sapSession.service";
import {Methods} from "../common/enums/methods.enum";

export async function apiResponseHelper(method: string, endpoint: string, data: unknown): Promise<any> {
    const sessionId = await getSessionId();
    let response;
    try {
        if (method === Methods.GET) {
            console.log(`Fetching from: ${SAP_API_URL}/${endpoint}`);
            response = await axios.get(`${SAP_API_URL}/${endpoint}`, {
                headers: {
                    Cookie: `B1SESSION=${sessionId}`,
                },
            });
            return response;
        }
        if (method === Methods.POST) {
            response = await axios.post(`${SAP_API_URL}/${endpoint}`, {
                headers: {
                    Cookie: `B1SESSION=${sessionId}`,
                },
            });
            return response;
        }
        if (method === Methods.PUT) {
            response = await axios.put(`${SAP_API_URL}/${endpoint}`, {
                headers: {
                    Cookie: `B1SESSION=${sessionId}`,
                },
            });
            return response;
        }

        if (method === Methods.PATCH) {
            response = await axios.patch(`${SAP_API_URL}/${endpoint}`, {
                headers: {
                    Cookie: `B1SESSION=${sessionId}`,
                },
            });
            return response;
        }

        if (method === Methods.DELETE) {
            response = await axios.delete(`${SAP_API_URL}/${endpoint}`, {
                headers: {
                    Cookie: `B1SESSION=${sessionId}`,
                },
            });
            return response;
        }
    } catch (err) {
        console.log('Api response', err)
    }
}