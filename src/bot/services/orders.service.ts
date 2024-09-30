import {SAP_API_ENDPOINTS} from "../config/sapConfig";
import {apiResponseHelper} from "../helpers/api-response.helper";
import {Methods} from "../common/enums/methods.enum";


export async function getPendingOrders() {
    const sapApiEndpoint = SAP_API_ENDPOINTS.PENDING_ORDERS_GET;
    const response = await apiResponseHelper(Methods.GET, sapApiEndpoint, '');
    return response?.data;
}


export async function getConfirmedOrders() {
    const sapApiEndpoint = SAP_API_ENDPOINTS.CONFIRMED_ORDERS_GET;
    const response = await apiResponseHelper(Methods.GET, sapApiEndpoint, '');
    return response?.data;
}


export async function getInWayOrders() {
    const sapApiEndpoint = SAP_API_ENDPOINTS.IN_TRANSIT_ORDERS_GET;
    const response = await apiResponseHelper(Methods.GET, sapApiEndpoint, '');
    return response?.data;
}
