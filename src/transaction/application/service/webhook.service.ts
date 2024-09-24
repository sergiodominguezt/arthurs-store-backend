import { Injectable } from '@nestjs/common';
import { time } from 'console';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  verifyWebhook(event: any, secret: string): string {
    const properties = event.signature.properties;
    const concatenatedProperties = this.concatenateProperties(
      event,
      properties,
    );
    const concatenatedWithTimestamp = this.concatenateWithTimestamp(
      concatenatedProperties,
      event.timestamp,
    );
    const finalString = this.concatenateWithSecret(
      concatenatedWithTimestamp,
      secret,
    );
    return this.generateChecksum(finalString);
  }

  private snakeToCamel(snakeCase: string): string {
    return snakeCase.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private getNestedValue(obj: any, propertyPath: string): any {
    return propertyPath.split('.').reduce((acc, key) => acc && acc[key], obj);
  }

  concatenateProperties(event: any, properties: string[]): string {
    return properties
      .map((property) => {
        const camelCaseProperty = this.snakeToCamel(
          property.replace('transaction.', ''),
        );
        const value = this.getNestedValue(
          event.data.transaction,
          camelCaseProperty,
        );
        if (value === undefined) {
          console.error(`Property ${property} is undefined`);
        }
        return value !== undefined ? value.toString() : '';
      })
      .join('');
  }

  concatenateWithTimestamp(
    concatenatedProperties: string,
    timestamp: string,
  ): string {
    return concatenatedProperties + timestamp;
  }

  concatenateWithSecret(concatenatedString: string, secret: string): string {
    return concatenatedString + secret;
  }

  generateChecksum(concatenatedString: string): string {
    return crypto
      .createHash('sha256')
      .update(concatenatedString)
      .digest('hex')
      .toUpperCase();
  }
}
