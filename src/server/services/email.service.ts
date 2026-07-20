/**
 * TeslaPrimeCapital — Email Service (`email.service.ts`)
 * Encapsulates transactional email rendering and Resend delivery via React Email templates.
 */

import { Resend } from 'resend';
import { logger } from '@/utils/logger.util';
import { APP_CONFIG } from '@/config/app.config';
import React from 'react';
import { render } from '@react-email/components';
import { WelcomeOtpEmail } from './templates/WelcomeOtpEmail';
import { TwoFactorLoginEmail } from './templates/TwoFactorLoginEmail';
import { SecurityAlertEmail } from './templates/SecurityAlertEmail';

const resendApiKey = process.env.RESEND_API_KEY || 're_test_dummy_key';
const resend = new Resend(resendApiKey);

export class EmailService {
  private static readonly FROM_ADDRESS = `${APP_CONFIG.platformName} <notifications@teslaprimecapital.com>`;

  /**
   * Sends a registration verification OTP email.
   */
  public async sendOtpEmail(recipient: string, firstName: string, otpCode: string, ipAddress?: string): Promise<boolean> {
    try {
      logger.info(`Rendering WelcomeOtpEmail for ${recipient}`);
      const html = render(React.createElement(WelcomeOtpEmail, { firstName, otpCode, ipAddress }) as React.ReactElement);

      if (process.env.NODE_ENV === 'test' || resendApiKey.startsWith('re_test')) {
        logger.info(`[SIMULATED EMAIL DISPATCH] To: ${recipient} | Subject: Account Verification Code | OTP: ${otpCode}`);
        return true;
      }

      const { error } = await resend.emails.send({
        from: EmailService.FROM_ADDRESS,
        to: [recipient],
        subject: `Your ${APP_CONFIG.platformName} Verification Code: ${otpCode}`,
        html,
      });

      if (error) {
        logger.error(`Resend API delivery error for sendOtpEmail: ${error.message}`);
        return false;
      }

      logger.info(`WelcomeOtpEmail successfully dispatched to ${recipient}`);
      return true;
    } catch (err: any) {
      logger.error(`Fatal exception inside EmailService.sendOtpEmail: ${err.message}`, { stack: err.stack });
      return false;
    }
  }

  /**
   * Sends a Two-Factor login verification challenge email.
   */
  public async sendTwoFactorLoginEmail(recipient: string, firstName: string, otpCode: string, ipAddress?: string, device?: string): Promise<boolean> {
    try {
      const html = render(React.createElement(TwoFactorLoginEmail, { firstName, otpCode, ipAddress, device }) as React.ReactElement);

      if (process.env.NODE_ENV === 'test' || resendApiKey.startsWith('re_test')) {
        logger.info(`[SIMULATED EMAIL DISPATCH] To: ${recipient} | Subject: Two-Factor Login Code | OTP: ${otpCode}`);
        return true;
      }

      const { error } = await resend.emails.send({
        from: EmailService.FROM_ADDRESS,
        to: [recipient],
        subject: `Security Challenge: Login Verification Required`,
        html,
      });

      if (error) {
        logger.error(`Resend API delivery error for sendTwoFactorLoginEmail: ${error.message}`);
        return false;
      }
      return true;
    } catch (err: any) {
      logger.error(`Fatal exception inside EmailService.sendTwoFactorLoginEmail: ${err.message}`);
      return false;
    }
  }

  /**
   * Sends a security alert notification (e.g., new device login, password changed).
   */
  public async sendSecurityAlertEmail(recipient: string, firstName: string, alertTitle: string, alertDescription: string, ipAddress?: string, device?: string): Promise<boolean> {
    try {
      const html = render(React.createElement(SecurityAlertEmail, { firstName, alertTitle, alertDescription, ipAddress, device }) as React.ReactElement);

      if (process.env.NODE_ENV === 'test' || resendApiKey.startsWith('re_test')) {
        logger.info(`[SIMULATED EMAIL DISPATCH] To: ${recipient} | Alert: ${alertTitle}`);
        return true;
      }

      const { error } = await resend.emails.send({
        from: EmailService.FROM_ADDRESS,
        to: [recipient],
        subject: `Security Alert: ${alertTitle}`,
        html,
      });

      if (error) {
        logger.error(`Resend API delivery error for sendSecurityAlertEmail: ${error.message}`);
        return false;
      }
      return true;
    } catch (err: any) {
      logger.error(`Fatal exception inside EmailService.sendSecurityAlertEmail: ${err.message}`);
      return false;
    }
  }
}

export const emailService = new EmailService();
