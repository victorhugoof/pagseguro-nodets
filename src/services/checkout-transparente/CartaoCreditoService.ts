import requestPromise from 'request-promise';
import PagSeguroError from '../../errors/PagSeguroError';
import jsonToXml from '../../helper/JsonToXml';
import BaseService from '../BaseService';
import { PagSeguroTransactionResponse } from '../../interfaces/PagSeguroTransactionResponse';
import { PagSeguroTransactionRequest } from '../../interfaces/PagSeguroTransactionRequest';
import pagSeguroTransactionRequestToPayment from '../../helper/PagSeguroTransactionRequestToPayment';

export default class CartaoCreditoService extends BaseService {
  async transaction(
    request: PagSeguroTransactionRequest
  ): Promise<PagSeguroTransactionResponse> {
    try {
      const payment = pagSeguroTransactionRequestToPayment(
        request,
        'creditCard'
      );

      const response = await requestPromise({
        qs: {
          email: this.config.email,
          token: this.config.token,
        },
        headers: {
          'Content-Type': 'application/xml',
        },
        transform: this.transformResponseXmlToJson,
        url: `${this.api}/v2/transactions`,
        method: 'POST',
        body: jsonToXml({
          payment,
        }),
      });

      return response.content.transaction;
    } catch ({ response }) {
      const { status, statusText, content } = response;
      throw new PagSeguroError(status, statusText, content);
    }
  }
}
