import {SAP_API_ENDPOINTS} from "../config/sapConfig";
import {apiResponseHelper} from "../helpers/api-response.helper";
import {Methods} from "../common/enums/methods.enum";


// ---------------- Bitta function yetishmayapdi  ----------------
// ----------------- Lacking of one function -----------------


export async function getInDebtCustomers() {
        const sapApiEndpoint = SAP_API_ENDPOINTS.IN_DEBT_USERS_GET;
        const response = await apiResponseHelper(Methods.GET, sapApiEndpoint, '');
        return response?.data;
}


export async function getIncomingPayments() {
        const sapApiEndpoint = SAP_API_ENDPOINTS.INCOMING_PAYMENTS_GET;
        const response = await apiResponseHelper(Methods.GET, sapApiEndpoint, '');
        return response?.data;
}


