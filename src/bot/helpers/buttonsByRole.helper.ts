import {Keyboard} from "grammy";
import {Role} from "../common/enums/role";
import {Language} from "../common/enums/language";

export const getInitialButtons = async  (language: string): Promise<Keyboard> => {
    if (language === Language.uz) {
        return new Keyboard()
            .text("Xaridlar")
            .text("To'lovlar")
            .row();
    } else if (language === Language.ru) {
        return new Keyboard()
            .text("Покупки")
            .text("Платежи")
            .row();
    }
    return new Keyboard()
        .text("Xaridlar")
        .text("To'lovlar")
        .row();
};

export const getPurchaseButtonsForAdmin = (language: string): Keyboard => {
    if (language === Language.uz) {
        return new Keyboard()
            .text("Xarid yaratish")
            .text("Jarayondagi buyurtmalar")
            .row()
            .text("Tastiqlangan buyurtmalar")
            .text("Yo'ldagi buyurtmalar")
            .row()
            .text("Tugallangan buyurtmalar")
            .row()
            .text("Orqaga");  // Back button
    } else if (language === Language.ru) {
        return new Keyboard()
            .text("Создать заказ")
            .text("Заказы в процессе")
            .row()
            .text("Подтвержденные заказы")
            .text("Заказы в пути")
            .row()
            .text("Завершенные заказы")
            .row()
            .text("Назад");
    }
    return new Keyboard();
};

export const getPurchaseButtonsForUsers = (language: string): Keyboard => {
    if (language === Language.uz) {
        return new Keyboard()
            .text("Xarid yaratish")
            .text("Orqaga");
    } else if (language === Language.ru) {
        return new Keyboard()
            .text("Создать заказ")
            .text("Назад");
    }
    return new Keyboard();
};


export const getPaymentsButtonsForAdmin = (language: string): Keyboard => {
    if (language === Language.uz) {
        return new Keyboard()
            .text("Qarzdorlik")
            .text("Chiqim to'lov yaratish")
            .row()
            .text("Akt sverka")
            .text("Orqaga")
    } else if (language === Language.ru) {
        return new Keyboard()
            .text("Долг")
            .text("Создать платеж")
            .row()
            .text("Акт сверка")
            .text("Назад");
    }
    return new Keyboard();
};


export const getPaymentsButtonsForUsers = (language: string): Keyboard => {
    if (language === Language.uz) {
        return new Keyboard()
            .text("Qarzdorlik")
            .text("Chiqim to'lov yaratish")
            .row()
            .text("Orqaga")
    } else if (language === Language.ru) {
        return new Keyboard()
            .text("Долг")
            .text("Создать платеж")
            .row()
            .text("Назад");
    }
    return new Keyboard();
};

export const getPurchasesMenuByRole = async (role: string, language: string) => {
    if (role === Role.user) {
        return getPurchaseButtonsForUsers(language);
    }
    if (role === Role.admin) {
        return getPurchaseButtonsForAdmin(language);
    }
};


export const getPaymentsMenuByRole = async (role: string, language: string) => {
    if (role === Role.user) {
        return getPaymentsButtonsForUsers(language);
    }
    if (role === Role.admin) {
        return getPaymentsButtonsForAdmin(language);
    }
};
