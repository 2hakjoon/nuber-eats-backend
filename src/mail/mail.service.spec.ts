import got from 'got';
import * as FormData from 'form-data';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';

jest.mock('got');
jest.mock('form-data');

describe('MailService', () => {
  let service: MailService;

  const sendVerificationEmail = {
    email: 'email@email.com',
    code: 'code',
  };
  const TEST_DOMAIN = 'domain';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'apiKey',
            domain: 'domain',
            fromEmail: 'fromEmail',
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defind', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should sends VerificationEmail', async () => {
      const SUBJECT = 'Verify Your Email';
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);
      await service.sendVerificationEmail(
        sendVerificationEmail.email,
        sendVerificationEmail.code,
      );

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        SUBJECT,
        sendVerificationEmail.email,
        sendVerificationEmail.code,
      );
    });
  });

  describe('sendEmail', () => {
    const SUBJECT = 'Verify Your Email';
    it('should sends email', async () => {
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      const result = await service.sendEmail(
        SUBJECT,
        sendVerificationEmail.email,
        sendVerificationEmail.code,
      );
      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );

      expect(result).toEqual(true);
    });
    it('falls on error', async () => {
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      const gotSpy = jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const result = await service.sendEmail(
        SUBJECT,
        sendVerificationEmail.email,
        sendVerificationEmail.code,
      );
      expect(formSpy).toHaveBeenCalled();
      expect(gotSpy).toHaveBeenCalled();
      expect(gotSpy).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
      expect(result).toEqual(false);
    });
  });
});
