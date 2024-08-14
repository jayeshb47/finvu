import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Account,
  AccountConfirmLinkingResponse,
  AccountLinkingResponse,
  DiscoverAccountsResponse,
  LinkedAccount,
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
        accountLinkRefNumber: string,
        token: string
      ) => Promise<AccountConfirmLinkingResponse>;
      consentApproveRequest: (
        FIPDetails: Array<FIPDetails>,
        handleStatus: "ACCEPT" | "DENY"
      ) => Promise<any>;
      consentDetails: () => Promise<any>;
      consentHistory: () => Promise<any>;
      consentDetailsList: (consentId: string) => Promise<any>;
      consentRequestDetailsEnc: () => Promise<any>;
      consentRequestDetailsEncList: () => Promise<any>;

      consentRequestDetails: () => Promise<any>;
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

export const checkAndLink = async (
  fipId: string,
  panNumber: string,
  mobileNumber: string,
  link: boolean,
  setAccountLinkRefNumbers: React.Dispatch<React.SetStateAction<string>>,
  setSendSecondOtp: React.Dispatch<React.SetStateAction<boolean>>
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
    console.log("urrrtx");
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
      if (link) {
        const accountLinkingResponse = await window.finvuClient.accountLinking(
          fipId,
          unlinkedAccounts
        );
        console.log(accountLinkingResponse);
        console.log("refno", accountLinkingResponse.RefNumber);
        setAccountLinkRefNumbers(accountLinkingResponse.RefNumber);
        setSendSecondOtp(true);
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("OTP verification failed", error);
  }
};

export const handleVerifyOtpAndAccounts = async (
  otp: string,
  fipId: string,
  fipId2: string,
  panNumber: string,
  mobileNumber: string,
  // linkedAccounts: LinkedAccount[],
  setLinkedAccounts: (accounts: LinkedAccount[]) => void,
  setAccountLinkRefNumbers: React.Dispatch<React.SetStateAction<string>>,
  setIsFip: React.Dispatch<React.SetStateAction<boolean>>,
  setIsFip2: React.Dispatch<React.SetStateAction<boolean>>
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
    const verifyResponse = await window.finvuClient.verifyOTP(otp);
    console.log(verifyResponse);

    const linkedAccountsResponse =
      await window.finvuClient.userLinkedAccounts();
    console.log(linkedAccountsResponse);

    setLinkedAccounts(linkedAccountsResponse.LinkedAccounts);
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
      setAccountLinkRefNumbers(accountLinkingResponse.RefNumber);
      setIsFip(true);
    }

    const response = checkAndLink(
      fipId2,
      panNumber,
      mobileNumber,
      false,
      setAccountLinkRefNumbers,
      setIsFip2
    );
    if (!response && !(unlinkedAccounts.length > 0)) {
      handleConsentApproval(linkedAccountsResponse.LinkedAccounts, "ACCEPT");
    }
  } catch (error) {
    console.error("OTP verification failed", error);
  }
};

export const handleLinking = async (
  otp2: string,
  accountLinkRefNumbers: string,
  setLinkedAccounts: (accounts: LinkedAccount[]) => void
) => {
  console.log({ accountLinkRefNumbers });
  try {
    const confirmResponse = await window.finvuClient.accountConfirmLinking(
      accountLinkRefNumbers,
      otp2
    );
    console.log(confirmResponse);

    const linkedAccountsResponse =
      await window.finvuClient.userLinkedAccounts();
    console.log(linkedAccountsResponse);
    setLinkedAccounts(linkedAccountsResponse.LinkedAccounts);

    handleConsentApproval(linkedAccountsResponse.LinkedAccounts, "ACCEPT");
  } catch (error) {
    console.error("Failed to fetch linked accounts", error);
  }
};

export const handleConsentApproval = async (
  linkedAccounts: LinkedAccount[],
  // fipId: string,
  status: "ACCEPT" | "DENY"
) => {
  console.log("hii");

  // const filteredLinkedAccounts = linkedAccounts.filter(
  //   (account) => account.fipId === fipId
  // );
  // console.dir(filteredLinkedAccounts, { depth: null });

  const FIPDetails = linkedAccounts.map((account) => ({
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

  try {
    const consentResponse = await window.finvuClient.consentApproveRequest(
      FIPDetails,
      status
    );
    console.log(consentResponse);
    const consentId = consentResponse.fipConsentInfos[0].consentId;
    console.log("consentId", consentId);
  } catch (error) {
    console.error(`Consent ${status.toLowerCase()} failed`, error);
  }
};
