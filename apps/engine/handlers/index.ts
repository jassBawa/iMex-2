import {
  handleOpenTrade,
  handleCloseTrade,
  handlePriceUpdateEntry,
  handleFetchOpenOrders,
} from './order-handler';
import { handleGetUserBalance, handleUserCreation } from './user-handler';

export async function processMessage(message: any) {
  const requestId = message.message.requestId;
  const requestType = message.message.type;
  const payload = JSON.parse(message.message.data);

  switch (requestType) {
    case 'USER_CREATED':
      handleUserCreation(payload, requestId);
      break;
    case 'CREATE_ORDER':
      handleOpenTrade(payload, requestId);
      break;
    case 'CLOSE_ORDER':
      handleCloseTrade(payload, requestId);
      break;
    case 'PRICE_UPDATE':
      handlePriceUpdateEntry(payload);
      break;
    case 'GET_USER_BALANCE':
      handleGetUserBalance(payload, requestId);
      break;
    case 'FETCH_OPEN_ORDERS':
      handleFetchOpenOrders(payload, requestId);
      break;
    default:
      console.log('Irrelevant event received');
  }
}
