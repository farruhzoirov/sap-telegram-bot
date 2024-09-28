import {User} from '../models/user.schema';
import {loginToSAPAndStoreSession} from './sapSession.service';
import {SAP_API_ENDPOINTS, SAP_API_URL} from '../config/sapConfig';
import {apiResponseHelper} from "../helpers/api-response.helper";
import {Methods} from "../common/enums/methods.enum";

// Verify Phone Number and Create User
export async function verifyPhoneNumberService(userPhone: string) {
    let user;
    try {
        const sapApiEndPoint = SAP_API_ENDPOINTS.EMPLOYEES_GET
        const response = await apiResponseHelper(Methods.GET, sapApiEndPoint, '');
        const employees = response!.data!.value || [];
        const findUser = employees.find((item: { MobilePhone: string }) => item?.MobilePhone === userPhone);
        if (!findUser) {
            return '';
        }
        if (findUser) {
            const userRole = (findUser.MobilePhone === process.env.ADMIN_PHONE_NUMBER) ? 'admin' : 'user';

            const isExists = await User.findOne({
                userId: findUser.EmployeeID,
            });
            if (isExists) {
                user = isExists;
                return user;
            }
            user = await User.updateOne({
                    userId: findUser.EmployeeID
                },
                {
                    role: userRole,
                    username: findUser.FirstName,
                    phone: findUser.MobilePhone
                },
                {
                    upsert: true
                }
            );
            return user;
        }
    } catch (error: any) {
        if (error.response?.status === 401) {
            console.log('Session expired, logging in again...');
            await loginToSAPAndStoreSession();
            return await verifyPhoneNumberService(userPhone);
        }
        console.error('Failed to verify phone number:', error.response?.data);
        throw error.response?.data;
    }
}
