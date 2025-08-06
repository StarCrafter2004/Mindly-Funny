import { api } from "@/shared/api/axiosInstance";
import { invoice } from "@telegram-apps/sdk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { CHAIN, useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

type PurchaseType = "test" | "result" | "premium";

type RequestInvoiceArgs = {
  title?: string;
  description?: string;
  amount: number; // в копейках
  type: PurchaseType;
  testId?: string;
  duration?: number;
};

type InvoiceStatus = "pending" | "paid" | "cancelled" | "failed";

export async function requestInvoice({
  title,
  description,
  amount,
  type,
  testId,
  duration,
}: RequestInvoiceArgs): Promise<InvoiceStatus> {
  try {
    const resp = await api.post("/bot/create-invoice", {
      title,
      description,
      amount,
      type,
      testId,
      duration,
    });

    const { invoiceUrl } = resp.data as { invoiceUrl: string };

    if (!invoice.open.isAvailable()) {
      throw new Error("Telegram invoice.open недоступен");
    }

    // 2. Ожидаем статус оплаты от Telegram
    const status = (await invoice.open(invoiceUrl, "url")) as InvoiceStatus;

    // 3. Возвращаем наружу
    toast(status);
    return status;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const serverMessage = error.response?.data?.error;
      console.error("Ошибка Axios:", serverMessage);
    } else if (error instanceof Error) {
      console.error("Общая ошибка:", error.message);
    } else {
      console.error("Неизвестная ошибка:", error);
    }

    return "failed"; // если ошибка — вернём статус "failed"
  }
}

type PayParams = {
  amount: number;
  type: PurchaseType;
  testId?: string;
  duration?: number;
};

export const useTonPay = () => {
  const userAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const pay = async ({ amount, type, testId, duration }: PayParams) => {
    const address = await api
      .get<{ data: { wallet: string } }>(`/api/ton-config`)
      .then((res) => res.data.data.wallet);

    if (!userAddress || !address) {
      await tonConnectUI.openModal();
      return { status: "not_connected" };
    }

    // Создать заказ на сервере
    const { payload, boc } = await api
      .post<{ payload: string; boc: string }>("/bot/create-invoice-ton", {
        walletAddress: address,
        amount,
        type,
        testId,
        duration,
        wallet: userAddress,
      })
      .then((res) => ({ payload: res.data.payload, boc: res.data.boc }))
      .catch();

    if (!boc) {
      return { status: "server_error" };
    }
    console.log(boc);
    try {
      const result = await tonConnectUI.sendTransaction({
        network: CHAIN.TESTNET,
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address,
            amount: (amount * 1e9).toString(),
            payload: boc,
          },
        ],
      });

      console.dir("payment", result.boc);
      const status = await api.post("/bot/verify-ton-boc", {
        boc: result.boc,
        payload,
      });
      console.log(status.data);
      return status.data;
    } catch (err) {
      return { status: "rejected", error: err };
    }
  };

  return { pay, connectedAddress: userAddress };
};
