export enum TransactionErrorMessages {
  ERROR_GETTING_ACCEPTANCE_TOKEN = 'Error fetching acceptance token',
  ERROR_GETTING_CARD_TOKEN = 'Error fetching card token',
  ERROR_ACCEPTANCE_TOKEN = 'Could not retrieve acceptance token',
  ERROR_PROCESSING_TRANSACTION = 'Error processing transaction',
  ERROR_POST_REQUEST = 'POST request failed',
  ERROR_GET_REQUEST = 'GET request failed',
  ERROR_PROCESSING_PAYMENTS = 'Payment process failed',
  ERROR_UPDATING_TRANSACTION_STATE = 'Failed to update transaction status',
  ERROR_SENDING_PAYMENT_REQUEST = 'Error processing payment',
  ERROR_PRODUCT_NOT_FOUND = 'Product ID not found in the transaction details',
  ERROR_TRANSACTION_NOT_FOUND = 'Transaction not found',
}
