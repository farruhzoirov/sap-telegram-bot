export const SAP_API_URL = 'https://su26-02.sb1.cloud/b1s/v2';

export const LOGIN_DATA = {
  "CompanyDB": "AE09_DEV21",
  "UserName": "sb1\\aex_user01a",
  "Password": "6WPXfYW@"
};


export const SAP_API_ENDPOINTS = {
  EMPLOYEES_GET: "EmployeesInfo?$select=EmployeeID,JobTitle,FirstName,MobilePhone",
  PENDING_ORDERS_GET: "Orders?$select=DocumentLines&$filter= Status  Cancelled eq 'tNO' and DocumentStatus eq 'bost_Open"
}