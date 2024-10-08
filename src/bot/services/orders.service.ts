import {SAP_API_ENDPOINTS} from "../config/sapConfig";

// Helpers
import {apiResponseHelper} from "../helpers/api-response.helper";

// Enums
import {Methods} from "../common/enums/methods.enum";


export async function getItemsForOrder() {
    const sapApiEndpoint = SAP_API_ENDPOINTS.ORDERS_ITEMS_GET;
    const response = await apiResponseHelper(Methods.GET, sapApiEndpoint, '');
    return response?.data;
}

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


export async function getCompletedOrders() {
    const sapApiEndpoint = SAP_API_ENDPOINTS.COMPLETED_ORDERS_GET;
    const response = await apiResponseHelper(Methods.GET, sapApiEndpoint, '');
    return response?.data;
}