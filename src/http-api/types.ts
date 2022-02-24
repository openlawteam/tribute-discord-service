export enum HTTPMethod {
  CONNECT = 'CONNECT',
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
  TRACE = 'TRACE',
}

export enum TributeToolsWebhookTxType {
  BUY = 'singleBuy',
  FUND = 'fund',
  SWEEP = 'sweep',
}

/**
 * Types for `POST /webhook/tribute-tools-tx`
 */

export enum TributeToolsWebhookTxStatus {
  FAILED = 'failed',
  SUCCESS = 'success',
}

export type TributeToolsWebhookPayload = {
  data: {
    /**
     * UUID
     */
    id: string;
    type: TributeToolsWebhookTxType;
    tx: {
      hash: string;
      status: TributeToolsWebhookTxStatus;
    };
  };
};
