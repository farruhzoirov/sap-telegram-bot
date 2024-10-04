export interface Order {
    item: {
        ItemCode: string;
        ItemName: string;
    };
    quantity: number;
    comment?: string;  // Optional comment
}