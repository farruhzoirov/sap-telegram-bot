
interface DocumentLine {
    ItemCode: string;
    Quantity: number;
    UnitPrice: number;
    Currency: string;
}

interface Order {
    DocumentLines: DocumentLine[];
}

interface PendingOrdersResponse {
    value: Order[];
}

export async function createItemString(line: DocumentLine, index: number) {
    const { ItemCode, Quantity, UnitPrice, Currency } = line;
    return  `${index}) ${ItemCode} (Quantity: ${Quantity}, Price: ${Currency}) \n`;
}


export async function createOrderString(order: Order) {
    return order.DocumentLines.map(createItemString).join('\n');
}

