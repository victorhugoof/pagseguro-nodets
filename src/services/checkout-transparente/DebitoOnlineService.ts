import requestPromise from 'request-promise';
import { Response } from 'request';
import PagSeguroError from '../../errors/PagSeguroError';
import { PagSeguroRequestOptions } from '../../interfaces/PagSeguroRequestOptions';
import { jsonToXml } from '../../helper/utils';
import { PagSeguroSender } from '../../interfaces/PagSeguroSender';
import { PagSeguroItem } from '../../interfaces/PagSeguroItem';
import { PagSeguroShipping } from '../../interfaces/PagSeguroShipping';

interface DebitoOnlineRequest {
  sender: PagSeguroSender;
  items: {
    item: PagSeguroItem;
  }[];
  extraAmount?: number;
  reference?: string;
  notificationURL?: string;
  shipping: PagSeguroShipping;
}

interface DebitoOnlineResponse extends Response {
  transaction: {
    date: Date;
    code: string;
    reference: string;
    type: number;
    status: number;
    lastEventDate: Date;
    paymentMethod: {
      type: number;
      code: number;
    };
    paymentLink: string;
    grossAmount: number;
    discontAmount: number;
    feeAmount: number;
    netAmount: number;
    extraAmount: number;
    installmentCount: number;
    itemCount: number;
    items: {
      item: PagSeguroItem;
    }[];
    sender: PagSeguroSender;
    shipping: PagSeguroShipping;
  };
}

export default class DebitoOnlineService {
  private readonly opts: PagSeguroRequestOptions;

  constructor(opts: PagSeguroRequestOptions) {
    this.opts = opts;
  }

  async transaction(
    request: DebitoOnlineRequest
  ): Promise<DebitoOnlineResponse> {
    try {
      const response = await requestPromise({
        qs: {
          email: this.opts.config.email,
          token: this.opts.config.token,
        },
        headers: {
          'Content-Type': 'application/xml',
        },
        transform: this.opts.transform,
        url: `${this.opts.api.webservice}/v2/transactions`,
        method: 'POST',
        body: jsonToXml({
          payment: {
            ...request,
            mode: 'default',
            method: 'eft',
            currency: 'BRL',
          },
        }),
      });

      return {
        ...response,
        transaction: response.content.transaction,
      };
    } catch ({ response }) {
      throw new PagSeguroError(response);
    }
  }
}