import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Account,
  AccountConfirmLinkingResponse,
  AccountLinkingResponse,
  ConsentResponse,
  DiscoverAccountsResponse,
  FIPDetails,
  LoginResponse,
  UpdateAccountLinkRefNumbers,
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
        accountLinkRefNumber: string,
        token: string
      ) => Promise<AccountConfirmLinkingResponse>;
      consentApproveRequest: (
        FIPDetails: Array<FIPDetails>,
        handleStatus: "ACCEPT" | "DENY"
      ) => Promise<ConsentResponse>;
    };
  }
}

export const handleLogin = async (handleId: string, mobileNumber: string) => {
  const userID = `${mobileNumber}@finvu`;
  const mobileNo = "";

  try {
    const loginResponse = await window.window.finvuClient.login(
      handleId,
      userID,
      mobileNo
    );
    console.log({ loginResponse });
  } catch (error) {
    console.error("Login failed", error);
  }
};

export const handleVerify = async (
  otp: string
): Promise<[boolean, string | undefined]> => {
  try {
    const verifyResponse = await window.finvuClient.verifyOTP(otp);
    console.log(verifyResponse);
    if (verifyResponse.status === "FAILURE") {
      return [false, verifyResponse.message];
    }
    return [true, undefined];
  } catch (error) {
    console.error("OTP verification failed", error);
    return [false, error as string];
  }
};

export const checkAccounts = async (
  fipId: string,
  panNumber: string,
  mobileNumber: string
) => {
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
    console.log(linkedAccountsResponse);

    const linkedAccounts = linkedAccountsResponse.LinkedAccounts;
    console.log({ fipId });
    console.log({ identifiers });
    const discoveredAccountsResponse =
      await window.finvuClient.discoverAccounts(fipId, identifiers);
    console.log(discoveredAccountsResponse);

    const accounts = discoveredAccountsResponse.DiscoveredAccounts;

    console.log({ accounts });
    console.log({ linkedAccounts });

    const unlinkedAccounts = accounts.filter(
      (account) =>
        !linkedAccounts.some(
          (linkedAccount) => linkedAccount.accRefNumber === account.accRefNumber
        )
    );

    console.log({ unlinkedAccounts });
    if (unlinkedAccounts.length > 0) {
      // const accountLinkingResponse = await window.finvuClient.accountLinking(
      //   fipId,
      //   unlinkedAccounts
      // );
      // console.log(accountLinkingResponse);
      // console.log("refno", accountLinkingResponse.RefNumber);
      // updateAccountLinkRefNumbers(accountLinkingResponse.RefNumber);
      return { hasUnlinkedAccounts: true };
    }
    return { hasUnlinkedAccounts: false };
  } catch (error) {
    console.error("Checking accounts failed", error);
  }
};

export const sendOtp = async (
  fipId: string,
  panNumber: string,
  mobileNumber: string,
  updateAccountLinkRefNumbers: UpdateAccountLinkRefNumbers
) => {
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
    console.log(linkedAccountsResponse);

    const linkedAccounts = linkedAccountsResponse.LinkedAccounts;
    const discoveredAccountsResponse =
      await window.finvuClient.discoverAccounts(fipId, identifiers);
    console.log(discoveredAccountsResponse);

    const accounts = discoveredAccountsResponse.DiscoveredAccounts;

    console.log({ accounts });
    console.log({ linkedAccounts });

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
      console.log(accountLinkingResponse);
      console.log("refno", accountLinkingResponse.RefNumber);
      updateAccountLinkRefNumbers(accountLinkingResponse.RefNumber);
      return true;
    }
    return false;
  } catch (error) {
    console.error("OTP verification failed", error);
  }
};

export const handleLinking = async (
  otp: string,
  accountLinkRefNumbers: string
) => {
  console.log({ accountLinkRefNumbers });
  try {
    const confirmResponse = await window.finvuClient.accountConfirmLinking(
      accountLinkRefNumbers,
      otp
    );
    console.log(confirmResponse);

    const linkedAccountsResponse =
      await window.finvuClient.userLinkedAccounts();
    console.log(linkedAccountsResponse);

    return true;

    // handleConsentApproval(linkedAccountsResponse.LinkedAccounts, "ACCEPT");
  } catch (error) {
    console.error("Failed to fetch linked accounts", error);
    return false;
  }
};

export const handleConsentApproval = async (
  // fipId: string,
  status: "ACCEPT" | "DENY"
) => {
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
    console.log(consentResponse);
    const consentId = consentResponse.fipConsentInfos[0].consentId;
    console.log("consentId", consentId);

    return true;
  } catch (error) {
    console.error(`Consent ${status.toLowerCase()} failed`, error);
    return false;
  }
};
