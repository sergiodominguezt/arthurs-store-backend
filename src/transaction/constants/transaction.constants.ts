export enum TransactionErrorMessages {
  ERROR_PROCESSING_TRANSACTION = 'Error processing transaction',
  ERROR_UPDATING_TRANSACTION_STATE = 'Failed to update transaction status',
  ERROR_PRODUCT_NOT_FOUND = 'Product ID not found in the transaction details',
  ERROR_TRANSACTION_NOT_FOUND = 'Transaction not found',
}

export enum TransactionTraceMessages {
  TRANSACTION_STATUS_UPDATED = 'Transaction status updated successfully to: ',
  STOCK_UPDATED_FOR_PRODUCT = 'Stock updated for product: ',
  NO_STOCK_UPDATE_FOR_PRODUCT = 'Stock could not be updated for product: ',
  ERROR_UPDATING_TRANSACTION = 'Error in handleTransactionUpdate: ',
}
