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
import { DeskMessageEmail } from './templates/DeskMessageEmail';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey || 're_unconfigured_placeholder');

/**
 * Delivery gate: simulated logging is permitted ONLY outside production and
 * ONLY when no real Resend key is configured. In production a missing key
 * must surface as a failed delivery, never as a silently logged email.
 */
const RESEND_CONFIGURED = Boolean(resendApiKey) && !resendApiKey.startsWith('re_test');

export class EmailService {
  private static readonly FROM_ADDRESS = process.env.EMAIL_FROM || `${APP_CONFIG.platformName} <notifications@teslaprimecapital.com>`;

  private static shouldSimulateDelivery(): boolean {
    return process.env.NODE_ENV !== 'production' && !RESEND_CONFIGURED;
  }

  private static unconfiguredInProduction(): boolean {
    return process.env.NODE_ENV === 'production' && !RESEND_CONFIGURED;
  }

  /**
   * Sends a registration verification OTP email.
   */
  public async sendOtpEmail(recipient: string, firstName: string, otpCode: string, ipAddress?: string): Promise<boolean> {
    try {
      logger.info(`Rendering WelcomeOtpEmail for ${recipient}`);
      const html = render(React.createElement(WelcomeOtpEmail, { firstName, otpCode, ipAddress }) as React.ReactElement);

      if (EmailService.shouldSimulateDelivery()) {
        logger.info(`[DEV-ONLY EMAIL LOG] To: ${recipient} | Subject: Account Verification Code | OTP: ${otpCode}`);
        return true;
      }
      if (EmailService.unconfiguredInProduction()) {
        logger.error(`PRODUCTION EMAIL FAILURE: RESEND_API_KEY is not configured. Verification email to ${recipient} was NOT sent.`);
        return false;
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

      if (EmailService.shouldSimulateDelivery()) {
        logger.info(`[DEV-ONLY EMAIL LOG] To: ${recipient} | Subject: Two-Factor Login Code | OTP: ${otpCode}`);
        return true;
      }
      if (EmailService.unconfiguredInProduction()) {
        logger.error(`PRODUCTION EMAIL FAILURE: RESEND_API_KEY is not configured. Two-factor email to ${recipient} was NOT sent.`);
        return false;
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

      if (EmailService.shouldSimulateDelivery()) {
        logger.info(`[DEV-ONLY EMAIL LOG] To: ${recipient} | Alert: ${alertTitle}`);
        return true;
      }
      if (EmailService.unconfiguredInProduction()) {
        logger.error(`PRODUCTION EMAIL FAILURE: RESEND_API_KEY is not configured. Security alert to ${recipient} was NOT sent.`);
        return false;
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

  /**
   * Delivers a governance-desk decision letter (e.g., KYC declined, withdrawal approved/rejected)
   * as a personal 1:1 email from the responsible desk, mirroring the in-app Support Desk thread.
   */
  public async sendDeskMessageEmail(
    recipient: string,
    firstName: string,
    deskLabel: string,
    subject: string,
    message: string,
    ctaLabel?: string,
    ctaHref?: string
  ): Promise<boolean> {
    try {
      const html = render(React.createElement(DeskMessageEmail, { firstName, deskLabel, subject, message, ctaLabel, ctaHref }) as React.ReactElement);

      if (EmailService.shouldSimulateDelivery()) {
        logger.info(`[DEV-ONLY EMAIL LOG] To: ${recipient} | Desk: ${deskLabel} | Subject: ${subject}`);
        return true;
      }
      if (EmailService.unconfiguredInProduction()) {
        logger.error(`PRODUCTION EMAIL FAILURE: RESEND_API_KEY is not configured. Desk message to ${recipient} was NOT sent.`);
        return false;
      }

      const { error } = await resend.emails.send({
        from: EmailService.FROM_ADDRESS,
        to: [recipient],
        subject: `${APP_CONFIG.platformName} ${deskLabel}: ${subject}`,
        html,
      });

      if (error) {
        logger.error(`Resend API delivery error for sendDeskMessageEmail: ${error.message}`);
        return false;
      }

      logger.info(`DeskMessageEmail (${deskLabel}) successfully dispatched to ${recipient}`);
      return true;
    } catch (err: any) {
      logger.error(`Fatal exception inside EmailService.sendDeskMessageEmail: ${err.message}`);
      return false;
    }
  }
}

export const emailService = new EmailService();
