import { TonClient } from "@ton/ton";
import { Cell, loadMessage, beginCell, storeMessage, Transaction, Message } from "@ton/core";

export async function waitForTransaction(
  inMessageBoc: string,
  client: TonClient,
  retries: number = 10,
  timeout: number = 1000
): Promise<Transaction | undefined> {
  const inMessage = loadMessage(Cell.fromBase64(inMessageBoc).beginParse());
  if (inMessage.info.type !== "external-in") {
    throw new Error(`Message must be "external-in", got ${inMessage.info.type}`);
  }
  console.log(inMessage.info.dest);
  const account = inMessage.info.dest;
  const targetInMessageHash = getNormalizedExtMessageHash(inMessage);
  let attempt = 0;
  while (attempt < retries) {
    const transactions = await retry(
      () =>
        client.getTransactions(account, {
          limit: 10,
          archival: true,
        }),
      { delay: 1000, retries: 3 }
    );
    for (const transaction of transactions) {
      if (transaction.inMessage?.info.type !== "external-in") {
        continue;
      }
      const inMessageHash = getNormalizedExtMessageHash(transaction.inMessage);
      if (inMessageHash.equals(targetInMessageHash)) {
        return transaction;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, timeout));
    attempt++;
  }
  return undefined;
}

export function getNormalizedExtMessageHash(message: Message) {
  if (message.info.type !== "external-in") {
    throw new Error(`Message must be "external-in", got ${message.info.type}`);
  }
  const info = {
    ...message.info,
    src: undefined,
    importFee: 0n,
  };
  const normalizedMessage = {
    ...message,
    init: null,
    info: info,
  };
  return beginCell()
    .store(storeMessage(normalizedMessage, { forceRef: true }))
    .endCell()
    .hash();
}

export async function retry<T>(fn: () => Promise<T>, options: { retries: number; delay: number }): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof Error) {
        lastError = e;
      }
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    }
  }
  throw lastError;
}
