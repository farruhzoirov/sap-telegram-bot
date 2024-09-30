import {Keyboard} from "grammy";
import {RolesEnum} from "../common/enums/roles.enum";
import {LanguageEnum} from "../common/enums/language.enum";

export const getInitialButtons = async  (language: string): Promise<Keyboard> => {
    if (language === LanguageEnum.uz) {
        return new Keyboard()
            .text("Xaridlar")
            .text("To'lovlar")
            .row()
            .text("Sozlamalar")
            .row();
    } else if (language === LanguageEnum.ru) {
        return new Keyboard()
            .text("Покупки")
            .text("Платежи")
            .row()
            .text("Настройки")
            .row();
    }
    return new Keyboard()
        .text("Xaridlar")
        .text("To'lovlar")
        .text("Настройки")
        .row();
};

export const getPurchaseButtonsForAdmin = (language: string): Keyboard => {
    if (language === LanguageEnum.uz) {
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
    } else if (language === LanguageEnum.ru) {
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
    if (language === LanguageEnum.uz) {
        return new Keyboard()
            .text("Xarid yaratish")
            .text("Jarayondagi buyurtmalar")
            .row()
            .text("Orqaga");
    } else if (language === LanguageEnum.ru) {
        return new Keyboard()
            .text("Создать заказ")
            .text("Заказы в процессе")
            .row()
            .text("Назад");
    }
    return new Keyboard();
};


export const getPaymentsButtonsForAdmin = (language: string): Keyboard => {
    if (language === LanguageEnum.uz) {
        return new Keyboard()
            .text("Qarzdorlik")
            .text("Chiqim to'lov yaratish")
            .row()
            .text("Akt sverka")
            .text("Orqaga")
    } else if (language === LanguageEnum.ru) {
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
    if (language === LanguageEnum.uz) {
        return new Keyboard()
            .text("Qarzdorlik")
            .text("Chiqim to'lov yaratish")
            .row()
            .text("Orqaga")
    } else if (language === LanguageEnum.ru) {
        return new Keyboard()
            .text("Долг")
            .text("Создать платеж")
            .row()
            .text("Назад");
    }
    return new Keyboard();
};

export const getPurchasesMenuByRole = async (role: string, language: string) => {
    if (role === RolesEnum.user) {
        return getPurchaseButtonsForUsers(language);
    }
    if (role === RolesEnum.admin) {
        return getPurchaseButtonsForAdmin(language);
    }
};


export const getPaymentsMenuByRole = async (role: string, language: string) => {
    if (role === RolesEnum.user) {
        return getPaymentsButtonsForUsers(language);
    }
    if (role === RolesEnum.admin) {
        return getPaymentsButtonsForAdmin(language);
    }
};
