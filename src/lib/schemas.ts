import { z } from "zod";

// Account Schema
export const AccountSchema = z.object({
  accType: z.string(),
  accRefNumber: z.string(),
  maskedAccNumber: z.string(),
  FIType: z.string(),
});
export type Account = z.infer<typeof AccountSchema>;

// FIPDetails Schema
export const FIPDetailsSchema = z.object({
  FIP: z.object({
    id: z.string(),
  }),
  Accounts: z.array(AccountSchema),
});
export type FIPDetails = z.infer<typeof FIPDetailsSchema>;

// Login Response
export const LoginResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Verify OTP Response
export const VerifyOtpResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});
export type VerifyOtpResponse = z.infer<typeof VerifyOtpResponseSchema>;

// Logout Response
export const LogoutResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

// User Linked Accounts Response
export const UserLinkedAccountsResponseSchema = z.object({
  LinkedAccounts: z.array(
    z.object({
      userId: z.string(),
      fipId: z.string(),
      fipName: z.string(),
      maskedAccNumber: z.string(),
      linkRefNumber: z.string(),
      FIType: z.string(),
      accRefNumber: z.string(),
      accType: z.string(),
      AuthenticatorType: z.string(),
    })
  ),
  status: z.string(),
  message: z.string(),
});
export type UserLinkedAccountsResponse = z.infer<
  typeof UserLinkedAccountsResponseSchema
>;

// Discover Accounts Response
export const DiscoverAccountsResponseSchema = z.object({
  DiscoveredAccounts: z.array(AccountSchema),
  status: z.string(),
  message: z.string(),
});
export type DiscoverAccountsResponse = z.infer<
  typeof DiscoverAccountsResponseSchema
>;

// Account Linking Response
export const AccountLinkingResponseSchema = z.object({
  RefNumber: z.string(),
  message: z.string().nullable(),
  status: z.string(),
});
export type AccountLinkingResponse = z.infer<
  typeof AccountLinkingResponseSchema
>;

// Account Confirm Linking Response
export const AccountConfirmLinkingResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});
export type AccountConfirmLinkingResponse = z.infer<
  typeof AccountConfirmLinkingResponseSchema
>;

// Consent Approve Request
export const ConsentApproveRequestSchema = z.object({
  status: z.string(),
  message: z.string(),
});

export type ConsentApproveRequest = z.infer<typeof ConsentApproveRequestSchema>;

export const LinkedAccountSchema = z.object({
  userId: z.string(),
  fipId: z.string(),
  fipName: z.string(),
  maskedAccNumber: z.string(),
  accRefNumber: z.string(),
  linkRefNumber: z.string().optional(),
  consentIdList: z.array(z.any()).nullable().optional(), // Assuming consentIdList could be an array or null
  FIType: z.string().optional(),
  accType: z.string(),
  linkedAccountUpdateTimestamp: z.string().optional(), // You can parse this to a Date if needed
  AuthenticatorType: z.string(),
});

export const LinkedAccountsResponseSchema = z.object({
  status: z.string(),
  message: z.string().nullable(),
  LinkedAccounts: z.array(LinkedAccountSchema),
});

export type LinkedAccount = z.infer<typeof LinkedAccountSchema>;
export type LinkedAccountsResponse = z.infer<
  typeof LinkedAccountsResponseSchema
>;

export type UpdateAccountLinkRefNumbers = (refNumber: string) => void;

export type FipCheckResult = {
  hasUnlinkedAccounts: boolean;
  // other relevant data
};

// Schema for the response
export const FipConsentInfoSchema = z.object({
  fipId: z.string().nullable(), // fipId can be null
  consentId: z.string(),
});

export const ConsentResponseSchema = z.object({
  fipConsentInfos: z.array(FipConsentInfoSchema),
  consentIntentId: z.string(),
  status: z.string(),
  message: z.string(),
});

// Type inference
export type ConsentResponse = z.infer<typeof ConsentResponseSchema>;

const LoginOrVerifySchema = z.object({
  action: z.string(),
  handleId: z.string().optional(),
  mobileNumber: z.string().optional(),
  otp: z.string().optional(),
});

export type LoginOrVerify = z.infer<typeof LoginOrVerifySchema>;

export const ErrorSchema = z.object({
  message: z.string(),
});

export type ErrorType = z.infer<typeof ErrorSchema>;
