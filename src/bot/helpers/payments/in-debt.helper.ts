import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../../common/types/session-context";
import {getInDebtCustomers} from "../../services/payments.service";

export async function handleInDebtCustomer(conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> {
    const inDebtCustomers = await getInDebtCustomers()
    if (!inDebtCustomers && !inDebtCustomers.length) {
        await ctx.reply(
            ctx.session.language === 'uz'
                ? "Qarzdorliklar mavjud emas buyurtmalar yo'q."
                : "У вас нет подтвержденных заказов."
        );
        return;
    }
    let responseContent = inDebtCustomers.value.map((customer: any, index: any) => {
        return `<b>${index + 1})</b> Mijoz ismi: ${customer.CardName},  Qarzdorligi: ${customer.CurrentAccountBalance} ${customer.Currency}`;
    }).join("\n");

    await ctx.reply(responseContent, {
        parse_mode: "HTML"
    });
}

