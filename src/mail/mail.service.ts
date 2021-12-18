import got from 'got';
import { Inject, Injectable } from '@nestjs/common';
import * as FormData from 'form-data';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}
  async sendEmail(
    subject: string,
    email: string,
    content: string,
  ): Promise<boolean> {
    const form = new FormData();
    form.append(
      'from',
      `[Nuber Eats] Verify Request <mailgun@${this.options.domain}>`,
    );
    form.append('to', email);
    form.append('subject', subject);
    form.append('text', content);
    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', email, code);
  }
}
