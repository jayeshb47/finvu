/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DiscoverAccountsResponse,
  LinkedAccountsResponse,
} from "./lib/schemas";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./components/ui/input-otp";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import {
  checkAndLink,
  handleLinking,
  handleLogin,
  handleVerifyOtpAndAccounts,
} from "./lib/utils";

function App() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mobileNumber = queryParams.get("mobileNumber") || "";
  const panNumber = queryParams.get("panNumber") || "";
  const handleId = queryParams.get("handleId") || "";

  const fipId = "fip@finrepo";
  const fipId2 = "fip@finvugst";

  const [otp, setOtp] = useState<string>("");
  const [otp2, setOtp2] = useState<string>("");
  const [accountLinkRefNumbers, setAccountLinkRefNumbers] =
    useState<string>("");
  const [linkedAccounts, setLinkedAccounts] = useState<
    LinkedAccountsResponse["LinkedAccounts"]
  >([]);
  const [isFip1, setIsFip] = useState<boolean>(false);
  const [isFip2, setIsFip2] = useState<boolean>(false);
  const [sendSecondOtp, setSendSecondOtp] = useState<boolean>(false);

  useEffect(() => {
    window.finvuClient.open();
    console.log(window.finvuClient);
    handleLogin(handleId, mobileNumber);
  }, [handleId, mobileNumber]);

  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOtpAndAccounts(
        otp,
        fipId,
        fipId2,
        panNumber,
        mobileNumber,
        // linkedAccounts,
        setLinkedAccounts,
        setAccountLinkRefNumbers,
        setIsFip,
        setIsFip2
      );
      setOtp("");
    }
    if (otp2.length === 8) {
      handleLinking(otp2, accountLinkRefNumbers, setLinkedAccounts);
      setOtp2("");
    }
  }, [accountLinkRefNumbers, mobileNumber, otp, otp2, panNumber, isFip2]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 gap-4">
      {accountLinkRefNumbers ? (
        {isFip1 && ()}
        <Card className="w-full max-w-md ">
          <CardHeader>
            <CardTitle>
              Enter OTP recieved from {fipId}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* <Button onClick={handleFetchLinkedAccounts} className="w-full mt-6">
            User Linked Accounts
          </Button> */}

            {/* <ul className="w-full ">
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
          </ul> */}
            {/* <Button
              onClick={handleFetchDiscoveredAccounts}
              className="w-full mt-4"
            >
              Discover Accounts
            </Button> */}
            {/* <ul className="w-full mt-4">
            {discoveredAccounts.map((account, index) => (
              <li key={index} className="flex justify-between mb-2">
                <span>
                  {account.maskedAccNumber} - {account.accType}
                </span>
              </li>
            ))}
          </ul> */}
            {/* <Button
            onClick={() => handleAccountLinking(discoveredAccounts)}
            className="w-full mt-4"
          >
            Link Account
          </Button> */}
            <div className="flex flex-col items-center">
              <InputOTP maxLength={8} value={otp2} onChange={setOtp2}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12" />
                  <InputOTPSlot index={1} className="w-12" />
                  <InputOTPSlot index={2} className="w-12" />
                  <InputOTPSlot index={3} className="w-12" />
                  <InputOTPSlot index={4} className="w-12" />
                  <InputOTPSlot index={5} className="w-12" />
                  <InputOTPSlot index={6} className="w-12" />
                  <InputOTPSlot index={7} className="w-12" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {/* <Button onClick={handleLinking} className="w-full mt-2">
            Confirm Account
          </Button> */}
            {/* <div className="flex justify-between mt-4">
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
            </div> */}
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enter OTP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-16" />
                  <InputOTPSlot index={1} className="w-16" />
                  <InputOTPSlot index={2} className="w-16" />
                  <InputOTPSlot index={3} className="w-16" />
                  <InputOTPSlot index={4} className="w-16" />
                  <InputOTPSlot index={5} className="w-16" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </CardContent>
        </Card>
      )}

      {/* <Card className="w-full max-w-md">
        <CardFooter>
          <Button onClick={handleLogout} className="w-full mt-6">
            Logout
          </Button>
        </CardFooter>
      </Card> */}
    </div>
  );
}

export default App;
