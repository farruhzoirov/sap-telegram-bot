

// User model for mongodb
import {User} from '../models/user.schema';

// Login to sap service
import {loginToSAPAndStoreSession} from './sapSession.service';

// Sap config based
import {SAP_API_ENDPOINTS} from '../config/sapConfig';

// Helpers
import {apiResponseHelper} from "../helpers/api-response.helper";

// Enums
import {Methods} from "../common/enums/methods.enum";

export async function verifyPhoneNumberService(userPhone: string, telegramId?: number) {
    let user;
    try {
        const sapApiEndPoint = SAP_API_ENDPOINTS.EMPLOYEES_GET
        const response = await apiResponseHelper(Methods.GET, sapApiEndPoint, '');
        const employees = response!.data!.value || [];
        const findUser = employees.find((item: { MobilePhone: string }) => item?.MobilePhone === userPhone);
        if (!findUser) {
            return null;
        }
        const userRole = (findUser.MobilePhone === process.env.ADMIN_PHONE_NUMBER) ? 'admin' : 'user';
        user = await User.findOneAndUpdate(
            {
                userId: findUser.EmployeeID
            },
            {
                $set: {
                    role: userRole,
                    username: findUser.FirstName,
                    phone: findUser.MobilePhone,
                    telegramId: telegramId
                }
            },
            {
                upsert: true,
                new: true
            }
        );
        return user;
    } catch (error: any) {
        if (error.response?.status === 401) {
            console.log('Session expired, logging in again...');
            await loginToSAPAndStoreSession();
            return await verifyPhoneNumberService(userPhone, telegramId);
        }
        console.error('Failed to verify phone number:', error.response?.data);
        throw error.response?.data;
    }
}