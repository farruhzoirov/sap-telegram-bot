export const SAP_API_URL = 'https://su26-02.sb1.cloud/b1s/v2';

// To connect to platform
export const LOGIN_DATA = {
  "CompanyDB": "AE09_DEV21",
  "UserName": "sb1\\aex_user01a",
  "Password": "6WPXfYW@"
};

// Seller Telegram id
export const sellerTelegramId = "6996425780"

// Sap api endpoints
export const SAP_API_ENDPOINTS = {
  EMPLOYEES_GET: "EmployeesInfo?$select=EmployeeID,JobTitle,FirstName,MobilePhone",
  CREATING_ORDERS_POST: "",  // I can't understand this what I do.
  ORDERS_ITEMS_GET: "Items?$select=ItemCode,ItemName",
  PENDING_ORDERS_GET: "Quotations?$select=DocumentLines&$filter= CardName, Status Cancelled eq 'tNO' and DocumentStatus eq 'bost_Open'",
  CONFIRMED_ORDERS_GET: "Orders?$select=DocumentLines&$filter= CardCode,Status  Cancelled eq 'tNO' and DocumentStatus eq 'bost_Open'",
  IN_TRANSIT_ORDERS_GET: "DeliveryNotes?$select=DocumentLines&$filter= CardCode, Status Cancelled eq 'tNO' and DocumentStatus eq 'bost_Open'",
  COMPLETED_ORDERS_GET: "Invoices?$select=CardCode, DocDate, DocumentLines",
  CREATING_OUTPUT_PAYMENT_POST: "", // I can't understand this what I do.
  IN_DEBT_USERS_GET: "BusinessPartners?$select=CardCode,CardName, Currency,CurrentAccountBalance",
  INCOMING_PAYMENTS_GET: "IncomingPayments?$select=CardCode, DocDate&$filter= Cardcode  Cancelled eq 'tNO'",
};
