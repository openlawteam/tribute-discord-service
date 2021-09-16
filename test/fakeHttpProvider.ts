import {response} from 'msw';

type ResponseStub = {
  jsonrpc: '2.0';
  id: number;
  result: any;
  debugName?: string;
};

type ErrorStub = {
  jsonrpc: '2.0';
  id: number;
  error: ResponseError;
  debugName?: string;
};

type CreateError = {message: string; code?: number};

interface ResponseError extends Error {
  code?: number;
}

export type InjectResultOptions = {
  /**
   * Optional method name to be output for when debugging is used.
   */
  debugName?: string;
};

export type InjectErrorOptions = {
  /**
   * Optional method name to be output for when debugging is used.
   */
  debugName?: string;
};

const INITIAL_ERROR: Array<ErrorStub> = [];
const INITIAL_IS_DEBUG_ACTIVE: boolean = false;
const INITIAL_RESPONSE: Array<ResponseStub> = [];

/**
 * FakeHttpProvider
 *
 * Copied, and altered, from: https://github.com/ethereum/web3.js
 *
 * @see https://github.com/ethereum/web3.js/blob/edf481d37ed0c4c4caae7a25619704010ac3639e/test/helpers/FakeHttpProvider.js
 */

export class FakeHttpProvider {
  countId: number;
  error: Array<ErrorStub>;
  isDebugActive: boolean;
  response: Array<ResponseStub>;

  constructor() {
    this.countId = 1;
    this.error = INITIAL_ERROR;
    this.isDebugActive = INITIAL_IS_DEBUG_ACTIVE;
    this.response = INITIAL_RESPONSE;
  }

  createResponseStub(
    result: any = null,
    options?: InjectResultOptions
  ): ResponseStub {
    return {
      jsonrpc: '2.0',
      id: this.countId,
      result,
      debugName: options?.debugName,
    };
  }

  createErrorStub(
    {message, code}: CreateError = {
      message: 'Stub error',
      code: 1234,
    },
    options?: InjectErrorOptions
  ): ErrorStub {
    const responseError: ResponseError = new Error(message);

    responseError.code = code;

    return {
      jsonrpc: '2.0',
      id: this.countId,
      error: responseError,
      debugName: options?.debugName,
    };
  }

  /**
   * Use this instead of `send`.
   *
   * @link https://eips.ethereum.org/EIPS/eip-1193#request-1
   * @link https://docs.metamask.io/guide/ethereum-provider.html#ethereum-request-args
   */
  async request(payload: {
    method: string;
    params?: any[] | Record<string, any>;
  }): Promise<any> {
    try {
      const {result, debugName: debugNameResponse} = (this.getResponseOrError(
        'response',
        payload
      ) || {}) as ResponseStub;

      const {error, debugName: debugNameError} =
        (this.getResponseOrError('error', payload) as ErrorStub) || {};

      if (this.isDebugActive) {
        console.log(
          '-------DEBUG: `FakeHttpProvider`-------' +
            '\nTYPE: ' +
            (error ? 'error' : 'response') +
            '\nMETHOD: ' +
            payload.method +
            '\nDEBUG METHOD NAME: ' +
            (error ? debugNameError : debugNameResponse) +
            '\nENCODED RESULT OR ERROR: ' +
            (error ? JSON.stringify(error) : result)
        );
      }

      if (error) {
        throw error;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  getResponseOrError(
    type: 'response' | 'error',
    payload: Record<string, any>
  ): ResponseStub | ErrorStub | ResponseStub[] | ErrorStub[] | undefined {
    let result:
      | ResponseStub
      | ErrorStub
      | ResponseStub[]
      | ErrorStub[]
      | undefined;

    if (type === 'error') {
      result = this.error.shift();
    } else {
      result = this.response.shift() || this.createResponseStub();
    }

    if (result) {
      if (Array.isArray(result)) {
        result = result.map((r, index) => {
          r.id = payload[index] ? payload[index].id : this.countId++;
          return r;
        });
      } else {
        result.id = payload.id;
      }
    }

    return result;
  }

  injectResult(result: any, options?: InjectResultOptions): void {
    this.response.push(this.createResponseStub(result, options));
  }

  injectError(error: CreateError, options?: InjectErrorOptions): void {
    this.error.push(this.createErrorStub(error, options));
  }

  /**
   * Sets debug logging
   *
   * @param shouldStart
   */
  debug(shouldStart: boolean = true): void {
    this.isDebugActive = shouldStart;
  }

  /**
   * Resets the instance data. Helpful to call between tests.
   */
  reset(): void {
    this.error = INITIAL_ERROR;
    this.isDebugActive = INITIAL_IS_DEBUG_ACTIVE;
    this.response = INITIAL_RESPONSE;
  }
}
