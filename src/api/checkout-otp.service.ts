import apiClient from './client';
import { Endpoints } from './endpoints';
import { CheckoutOtpSendPayload, OtpSendResponse, OtpVerifyResponse } from '../types';

const unwrapPayload = <T>(payload: unknown): T => {
  const data = payload as { success?: boolean; data?: T };
  if (typeof data === 'object' && data && data.success === true && data.data) {
    return data.data;
  }
  return payload as T;
};

export const CheckoutOtpService = {
  sendOtp: async (payload: CheckoutOtpSendPayload): Promise<OtpSendResponse> => {
    const response = await apiClient.post(Endpoints.checkoutOtp.send, payload);
    return unwrapPayload<OtpSendResponse>(response.data);
  },

  verifyOtp: async (payload: {
    otp_session_id: string;
    code: string;
    cart_token?: string;
  }): Promise<OtpVerifyResponse> => {
    const response = await apiClient.post(Endpoints.checkoutOtp.verify, payload);
    return unwrapPayload<OtpVerifyResponse>(response.data);
  },
};

