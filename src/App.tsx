import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { useLocation } from "react-router-dom";
import {
  LoginResponse,
  VerifyOtpResponse,
  UserLinkedAccountsResponse,
  DiscoverAccountsResponse,
  AccountLinkingResponse,
  AccountConfirmLinkingResponse,
  ConsentApproveRequest,
} from "./lib/schemas";
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
        identifiers: any
      ) => Promise<DiscoverAccountsResponse>;
      accountLinking: (
        fipid: string,
        account: any
      ) => Promise<AccountLinkingResponse>;
      accountConfirmLinking: (
        accountLinkRefNumber: string,
        token: string
      ) => Promise<AccountConfirmLinkingResponse>;
      consentApproveRequest: (
        FIPDetails: any,
        handleStatus: "ACCEPT" | "DENY"
      ) => Promise<ConsentApproveRequest>;
    };
  }
}

function App() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mobileNumber = queryParams.get("mobileNumber");
  const panNumber = queryParams.get("panNumber");
  const handleId = queryParams.get("handleId") || "";
  const fipid = "BARB0KIMXXX";
  // const fipid = "fip@finrepo";
  const fipName = "Finvu Bank Ltd.";

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

  const [otp, setOtp] = useState<string>("");
  const [otp2, setOtp2] = useState<string>("");
  const [accountLinkRefNumbers, setAccountLinkRefNumbers] =
    useState<string>("");
  const [linkedAccounts, setLinkedAccounts] = useState<
    UserLinkedAccountsResponse["LinkedAccounts"]
  >([]);
  const [discoveredAccounts, setDiscoveredAccounts] = useState<
    DiscoverAccountsResponse["DiscoveredAccounts"]
  >([]);

  useEffect(() => {
    window.finvuClient.open();
    console.log(window.finvuClient);
    handleLogin();
  }, []);

  const handleLogin = async () => {
    const userID = `${mobileNumber}@finvu`;
    const mobileNo = "";

    try {
      const loginResponse = await window.finvuClient.login(
        handleId,
        userID,
        mobileNo
      );
      console.log({ loginResponse });
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const verifyResponse = await window.finvuClient.verifyOTP(otp);
      console.log(verifyResponse);
    } catch (error) {
      console.error("OTP verification failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      const logoutResponse = await window.finvuClient.logout();
      console.log(logoutResponse);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleFetchLinkedAccounts = async () => {
    try {
      const linkedAccountsResponse =
        await window.finvuClient.userLinkedAccounts();
      console.log(linkedAccountsResponse);
      setLinkedAccounts(linkedAccountsResponse.LinkedAccounts);
    } catch (error) {
      console.error("Failed to fetch linked accounts", error);
    }
  };

  const handleFetchDiscoveredAccounts = async () => {
    try {
      const discoveredAccountsResponse =
        await window.finvuClient.discoverAccounts(fipid, identifiers);
      console.log(discoveredAccountsResponse);
      setDiscoveredAccounts(discoveredAccountsResponse.DiscoveredAccounts);
    } catch (error) {
      console.error("Failed to fetch discovered accounts", error);
    }
  };
  const handleAccountLinking = async (account: any) => {
    console.log({ account });
    try {
      const accountLinkingResponse = await window.finvuClient.accountLinking(
        fipid,
        account
      );
      console.log(accountLinkingResponse);
      console.log("refno", accountLinkingResponse.RefNumber);
      setAccountLinkRefNumbers(accountLinkingResponse.RefNumber)
    } catch (error) {
      console.error("Account linking failed", error);
    }
  };

  const handleLinking = async () => {
    console.log({ accountLinkRefNumbers });
    try {
      const confirmResponse = await window.finvuClient.accountConfirmLinking(
        accountLinkRefNumbers,
        otp2
      );
      console.log(confirmResponse);

      const discoveredAccountsResponse =
        await window.finvuClient.discoverAccounts(fipid, identifiers);
      console.log(discoveredAccountsResponse);
      setDiscoveredAccounts(discoveredAccountsResponse.DiscoveredAccounts);
    } catch (error) {
      console.error("Failed to fetch linked accounts", error);
    }
  };

  const handleConsentApproval = async (status: "ACCEPT" | "DENY") => {
    const FIPDetails = discoveredAccounts.map((account) => ({
      FIP: {
        id: fipid,
      },
      Accounts: [
        {
          linkRefNumber: account.accRefNumber,
          accType: account.accType,
          accRefNumber: account.accRefNumber,
          maskedAccNumber: account.maskedAccNumber,
          FIType: account.FIType,
          fipId: fipid,
          fipName: fipName,
        },
      ],
    }));

    try {
      const consentResponse = await window.finvuClient.consentApproveRequest(
        FIPDetails,
        status
      );
      console.log(consentResponse);
    } catch (error) {
      console.error(`Consent ${status.toLowerCase()} failed`, error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 gap-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Finvu</h1>
        {/* <Button
          onClick={handleLogin}
          className="w-full "
        >
          Send Otp
        </Button> */}
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border border-gray-300 rounded-lg py-2 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={handleVerifyOtp} className="w-full">
          Verify OTP
        </Button>
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-4">
        <Button onClick={handleFetchLinkedAccounts} className="w-full">
          User Linked Accounts
        </Button>
        <ul>
          {linkedAccounts.map((account, index) => (
            <li key={index} className="border-b border-gray-300 py-2">
              <div>
                <strong>User ID:</strong> {account.userId}
              </div>
              <div>
                <strong>FIP Name:</strong> {account.fipName}
              </div>
              <div>
                <strong>Masked Account Number:</strong>{" "}
                {account.maskedAccNumber}
              </div>
              <div>
                <strong>Account Type:</strong> {account.accType}
              </div>
            </li>
          ))}
        </ul>
        <Button onClick={handleFetchDiscoveredAccounts} className="w-full">
          Discover Accounts
        </Button>
        <ul>
          {discoveredAccounts.map((account, index) => (
            <li key={index} className="flex justify-between mb-2">
              <span>
                {account.maskedAccNumber} - {account.accType}
              </span>
            </li>
          ))}
          <Button
            onClick={() => handleAccountLinking(discoveredAccounts)}
            className="w-full"
          >
            Link Account
          </Button>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp2}
            onChange={(e) => setOtp2(e.target.value)}
            className="w-full border mt-2 border-gray-300 rounded-lg py-2 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleLinking} className="w-full mt-2">
            Confirm Account
          </Button>
        </ul>
        <div className="flex justify-between mt-4">
          <Button
            onClick={() => handleConsentApproval("ACCEPT")}
            className="w-1/2 mr-2"
          >
            Accept
          </Button>
          <Button
            onClick={() => handleConsentApproval("DENY")}
            className="w-1/2 ml-2"
          >
            Deny
          </Button>
        </div>
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-4">
        <Button onClick={handleLogout} className="w-full">
          Logout
        </Button>
      </div>
    </div>
  );
}

export default App;
