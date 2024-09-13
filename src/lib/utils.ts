/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Account,
  AccountConfirmLinkingResponse,
  AccountLinkingResponse,
  ConsentResponse,
  DiscoverAccountsResponse,
  FIPDetails,
  LoginOrVerify,
  LoginResponse,
  UserLinkedAccountsResponse,
  VerifyOtpResponse,
} from "./schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
declare global {
  interface Window {
    finvuClient: {
      open: () => void;
      login: (
        handleId: string,
        userID: string,
        mobileNo: string
      ) => Promise<LoginResponse>;
      verifyOTP: (otp: string) => Promise<VerifyOtpResponse>;
      logout: () => void;
      userLinkedAccounts: () => Promise<UserLinkedAccountsResponse>;
      discoverAccounts: (
        fipId: string,
        identifiers: Array<{ category: string; type: string; value: string }>
      ) => Promise<DiscoverAccountsResponse>;
      accountLinking: (
        fipId: string,
        account: Account[]
      ) => Promise<AccountLinkingResponse>;
      accountConfirmLinking: (
        accountLinkRefNumbers: string,
        token: string
      ) => Promise<AccountConfirmLinkingResponse>;
      consentApproveRequest: (
        FIPDetails: Array<FIPDetails>,
        handleStatus: "ACCEPT" | "DENY"
      ) => Promise<ConsentResponse>;
      consentRequestDetails: () => Promise<any>;
    };
  }
}

export const handleLoginOrVerify = async (
  params: LoginOrVerify
): Promise<{ status: boolean; error: string | undefined }> => {
  try {
    let response;
    if (params.action === "login") {
      if (!params.handleId || !params.mobileNumber) {
        throw new Error("handleId and mobileNumber are required for login");
      }
      const userID = `${params.mobileNumber}@finvu`;
      const mobileNo = "";
      response = await window.window.finvuClient.login(
        params.handleId,
        userID,
        mobileNo
      );
    } else if (params.action === "verify") {
      if (!params.otp) {
        throw new Error("OTP is required for verification");
      }
      response = await window.finvuClient.verifyOTP(params.otp);
    } else {
      throw new Error("Invalid action");
    }
    if (response.status === "FAILURE") {
      return { status: false, error: response.message };
    }
    return { status: true, error: undefined };
  } catch (error) {
    console.error("Login failed", error);
    return { status: false, error: error as string };
  }
};

export const checkAccounts = async (
  fipId: string,
  panNumber: string,
  mobileNumber: string
): Promise<{
  status: boolean;
  hasUnlinkedAccounts: boolean;
  error: string | undefined;
}> => {
  const identifiers = [
    {
      category: "STRONG",
      type: "MOBILE",
      value: mobileNumber,
    },
    {
      category: "WEAK",
      type: "PAN",
      value: panNumber,
    },
  ];
  try {
    // const verifyResponse = await window.finvuClient.verifyOTP(otp);
    // console.log(verifyResponse);
    const linkedAccountsResponse =
      await window.finvuClient.userLinkedAccounts();
    if (linkedAccountsResponse.status === "FAILURE") {
      return {
        status: false,
        hasUnlinkedAccounts: false,
        error: linkedAccountsResponse.message,
      };
    }

    const linkedAccounts = linkedAccountsResponse.LinkedAccounts;
    console.log({ fipId });
    console.log({ identifiers });
    const discoveredAccountsResponse =
      await window.finvuClient.discoverAccounts(fipId, identifiers);
    if (discoveredAccountsResponse.status === "FAILURE") {
      return {
        status: false,
        hasUnlinkedAccounts: false,
        error: discoveredAccountsResponse.message,
      };
    }

    const accounts = discoveredAccountsResponse.DiscoveredAccounts;

    const unlinkedAccounts = accounts.filter(
      (account) =>
        !linkedAccounts.some(
          (linkedAccount) => linkedAccount.accRefNumber === account.accRefNumber
        )
    );
    console.log({ unlinkedAccounts });

    if (unlinkedAccounts.length > 0) {
      return { status: true, hasUnlinkedAccounts: true, error: undefined };
    }

    return { status: true, hasUnlinkedAccounts: false, error: undefined };
  } catch (error) {
    console.error("Checking accounts failed", error);
    return { status: true, hasUnlinkedAccounts: false, error: error as string };
  }
};

export const sendOtp = async (
  fipId: string,
  panNumber: string,
  mobileNumber: string
): Promise<{
  status: boolean;
  accountLinkRefNumbers: string;
  error: string | undefined;
}> => {
  const identifiers = [
    {
      category: "STRONG",
      type: "MOBILE",
      value: mobileNumber,
    },
    {
      category: "WEAK",
      type: "PAN",
      value: panNumber,
    },
  ];
  try {
    // const verifyResponse = await window.finvuClient.verifyOTP(otp);
    // console.log(verifyResponse);
    const linkedAccountsResponse =
      await window.finvuClient.userLinkedAccounts();
    if (linkedAccountsResponse.status === "FAILURE") {
      return {
        status: false,
        accountLinkRefNumbers: "",
        error: linkedAccountsResponse.message,
      };
    }

    const linkedAccounts = linkedAccountsResponse.LinkedAccounts;
    const discoveredAccountsResponse =
      await window.finvuClient.discoverAccounts(fipId, identifiers);
    if (discoveredAccountsResponse.status === "FAILURE") {
      return {
        status: false,
        accountLinkRefNumbers: "",
        error: discoveredAccountsResponse.message,
      };
    }

    const accounts = discoveredAccountsResponse.DiscoveredAccounts;

    const unlinkedAccounts = accounts.filter(
      (account) =>
        !linkedAccounts.some(
          (linkedAccount) => linkedAccount.accRefNumber === account.accRefNumber
        )
    );

    console.log({ unlinkedAccounts });
    if (unlinkedAccounts.length > 0) {
      const accountLinkingResponse = await window.finvuClient.accountLinking(
        fipId,
        unlinkedAccounts
      );
      console.log({ accountLinkingResponse });
      console.log("refno", accountLinkingResponse.RefNumber);
      return {
        status: true,
        accountLinkRefNumbers: accountLinkingResponse.RefNumber,
        error: undefined,
      };
    }
    return {
      status: false,
      accountLinkRefNumbers: "",
      error: "No unliked accounts",
    };
  } catch (error) {
    console.error("Sending OTP failed", error);
    return { status: false, accountLinkRefNumbers: "", error: error as string };
  }
};

export const handleLinking = async (
  otp: string,
  accountLinkRefNumbers: string
): Promise<{
  status: boolean;
  error: string | undefined;
}> => {
  console.log({ accountLinkRefNumbers });
  try {
    const confirmResponse = await window.finvuClient.accountConfirmLinking(
      accountLinkRefNumbers,
      otp
    );

    const linkedAccountsResponse =
      await window.finvuClient.userLinkedAccounts();
    console.log(linkedAccountsResponse);

    if (confirmResponse.status === "FAILURE") {
      return {
        status: false,
        error: confirmResponse.message,
      };
    }

    return {
      status: true,
      error: undefined,
    };

    // handleConsentApproval(linkedAccountsResponse.LinkedAccounts, "ACCEPT");
  } catch (error) {
    console.error("Failed to fetch linked accounts", error);
    return {
      status: false,
      error: error as string,
    };
  }
};

export const handleConsentApproval = async (
  // fipId: string,
  status: "ACCEPT" | "DENY"
): Promise<{
  status: boolean;
  error: string | undefined;
  consentId: string | undefined;
}> => {
  console.log("hii");

  // const filteredLinkedAccounts = linkedAccounts.filter(
  //   (account) => account.fipId === fipId
  // );
  // console.dir(filteredLinkedAccounts, { depth: null });

  try {
    const linkedAccountsResponse =
      await window.finvuClient.userLinkedAccounts();
    console.log(linkedAccountsResponse);

    const FIPDetails = linkedAccountsResponse.LinkedAccounts.map((account) => ({
      FIP: {
        id: account.fipId,
      },
      Accounts: [
        {
          linkRefNumber: account.linkRefNumber,
          accType: account.accType,
          accRefNumber: account.accRefNumber,
          maskedAccNumber: account.maskedAccNumber,
          FIType: account.FIType,
          fipId: account.fipId,
          fipName: account.fipName,
        },
      ],
    }));

    const consentResponse = await window.finvuClient.consentApproveRequest(
      FIPDetails,
      status
    );
    const consentId = consentResponse.fipConsentInfos[0].consentId;
    console.log("consentId", consentId);

    if (consentResponse.status === "FAILURE") {
      return {
        status: false,
        error: consentResponse.message,
        consentId: undefined,
      };
    }

    return {
      status: true,
      error: undefined,
      consentId: consentId,
    };
  } catch (error) {
    console.error(`Consent ${status.toLowerCase()} failed`, error);
    return {
      status: false,
      error: error as string,
      consentId: undefined,
    };
  }
};

export const getConsentDetails = async (): Promise<{
  status: boolean;
  error: string | undefined;
  consentDetails: any;
}> => {
  try {
    const consentDetailResponse =
      await window.finvuClient.consentRequestDetails();
    console.log({ consentDetailResponse });

    if (consentDetailResponse.status === "FAILURE") {
      return {
        status: false,
        error: consentDetailResponse.message,
        consentDetails: undefined,
      };
    }

    return {
      status: true,
      error: undefined,
      consentDetails: consentDetailResponse,
    };
  } catch (error) {
    console.error(`Consent ${status.toLowerCase()} failed`, error);
    return {
      status: false,
      error: error as string,
      consentDetails: undefined,
    };
  }
};
