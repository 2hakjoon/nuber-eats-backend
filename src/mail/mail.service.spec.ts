import got from 'got';
import * as FormData from 'form-data';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';

jest.mock('got', () => {});
jest.mock('form-data', () => {
  return {
    append: jest.fn(),
  };
});

describe('MailService', () => {
  let service: MailService;
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
    it('should call sendEmail', async () => {
      const sendVerificationEmail = {
        email: 'email@email.com',
        code: 'code',
      };
      const SUBJECT = 'Verify Your Email';
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {
        console.log('sival');
      });
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
});
