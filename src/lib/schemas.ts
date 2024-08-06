import { z } from "zod";

// Login Response
const LoginResponseSchema = z.object({
  loginResponse: z.object({
    status: z.string(),
    message: z.string()
  })
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Verify OTP Response
const VerifyOtpResponseSchema = z.object({
  status: z.string(),
  message: z.string()
});
export type VerifyOtpResponse = z.infer<typeof VerifyOtpResponseSchema>;

// Logout Response
const LogoutResponseSchema = z.object({
  status: z.string(),
  message: z.string()
});
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

// User Linked Accounts Response
const UserLinkedAccountsResponseSchema = z.object({
  LinkedAccounts: z.array(z.object({
    userId: z.string(),
    fipId: z.string(),
    fipName: z.string(),
    maskedAccNumber: z.string(),
    accRefNumber: z.string(),
    accType: z.string(),
    AuthenticatorType: z.string()
  })),
  status: z.string(),
  message: z.string().nullable()
});
export type UserLinkedAccountsResponse = z.infer<typeof UserLinkedAccountsResponseSchema>;

// Discover Accounts Response
const DiscoverAccountsResponseSchema = z.object({
  DiscoveredAccounts: z.array(z.object({
    accType: z.string(),
    accRefNumber: z.string(),
    maskedAccNumber: z.string(),
    FIType: z.string()
  })),
  status: z.string(),
  message: z.string().nullable()
});
export type DiscoverAccountsResponse = z.infer<typeof DiscoverAccountsResponseSchema>;

// Account Linking Response
const AccountLinkingResponseSchema = z.object({
  AuthenticatorType: z.string(),
  RefNumber: z.string(),
  message: z.string().nullable(),
  status: z.string(),
  timestamp: z.string(),
  txnid: z.string(),
  ver: z.string()
});
export type AccountLinkingResponse = z.infer<typeof AccountLinkingResponseSchema>;

// Account Confirm Linking Response
const AccountConfirmLinkingResponseSchema = z.object({
  status: z.string(),
  message: z.string()
});
export type AccountConfirmLinkingResponse = z.infer<typeof AccountConfirmLinkingResponseSchema>;

const ConsentApproveRequestSchema = z.object({
    status: z.string(),
    message: z.string().nullable(),
    consentId: z.string().nullable(),
    ver: z.string(),
    txnid: z.string(),
    consentStatus: z.string().nullable(),
    createTime: z.string().nullable(),
    startTime: z.string(),
    expireTime: z.string(),
    statusLastupdateTimestamp: z.string().nullable(),
    FIP: z.any().nullable(),
    AA: z.object({
      id: z.string(),
    }),
    FIU: z.object({
      id: z.string(),
      name: z.string(),
    }),
    User: z.object({
      idTypes: z.string(),
      id: z.string(),
    }),
    Accounts: z.any().nullable(),
    ConsentUse: z.any().nullable(),
    DataAccess: z.any().nullable(),
    Purpose: z.object({
      code: z.string(),
      refUri: z.string(),
      text: z.string(),
      Category: z.object({
        type: z.string(),
      }),
    }),
    Signature: z.any().nullable(),
    mode: z.string(),
    fetchType: z.string(),
    consentTypes: z.array(z.string()),
    consentDisplayDescriptions: z.array(z.string()),
    fiTypes: z.array(z.string()),
    DataDateTimeRange: z.object({
      from: z.string(),
      to: z.string(),
    }),
    DataLife: z.object({
      unit: z.string(),
      value: z.number(),
    }),
    Frequency: z.object({
      unit: z.string(),
      value: z.number(),
    }),
    DataFilter: z.array(
      z.object({
        type: z.string(),
        operator: z.string(),
        value: z.string(),
      })
    ),
    consentDetailDigitalSignature: z.any().nullable(),
    ConsentHandle: z.string(),
  });
  export type ConsentApproveRequest = z.infer<typeof ConsentApproveRequestSchema>;
