import axios from 'axios';
import {SAP_API_URL} from '../config/sapConfig';
import {getSessionId} from "../services/sapSession.service";
import {Methods} from "../common/enums/methods.enum";

export async function apiResponseHelper(method: string, endpoint: string, data: unknown): Promise<any> {
    const sessionId = await getSessionId();
    if (method === Methods.GET) {
        const response = await axios.get(`${SAP_API_URL}/${endpoint}`, {
            headers: {
                Cookie: `B1SESSION=${sessionId}`,
            },
        });
        return response;
    }

    if (method === Methods.POST) {
        const response = await axios.post(`${SAP_API_URL}/${endpoint}`, {
            headers: {
                Cookie: `B1SESSION=${sessionId}`,
            },
        });
        return response;
    }

    if (method === Methods.PUT) {
        const response = await axios.put(`${SAP_API_URL}/${endpoint}`, {
            headers: {
                Cookie: `B1SESSION=${sessionId}`,
            },
        });
        return response;
    }

    if (method === Methods.PATCH) {
        const response = await axios.patch(`${SAP_API_URL}/${endpoint}`, {
            headers: {
                Cookie: `B1SESSION=${sessionId}`,
            },
        });
        return response;
    }

    if (method === Methods.DELETE) {
        const response = await axios.delete(`${SAP_API_URL}/${endpoint}`, {
            headers: {
                Cookie: `B1SESSION=${sessionId}`,
            },
        });
        return response;
    }
}