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
  handleConsentApproval,
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
  const [otp3, setOtp3] = useState<string>("");
  const [accountLinkRefNumbers, setAccountLinkRefNumbers] =
    useState<string>("");
  const [linkedAccounts, setLinkedAccounts] = useState<
    LinkedAccountsResponse["LinkedAccounts"]
  >([]);
  const [isFip1, setIsFip1] = useState<boolean>(false);
  const [isFip2, setIsFip2] = useState<boolean>(false);
  const [sendSecondOtp, setSendSecondOtp] = useState<boolean>(false);

  const setFip1True = () => setIsFip1(true);
  const setFip2True = () => setIsFip2(true);

  useEffect(() => {
    window.finvuClient.open();
    console.log(window.finvuClient);
    handleLogin(handleId, mobileNumber);
  }, [handleId, mobileNumber]);

  useEffect(() => {
    const handleOtpProcessing = async () => {
      if (otp.length === 6) {
        const responsne = await handleVerifyOtpAndAccounts(
          otp,
          fipId,
          fipId2,
          panNumber,
          mobileNumber,
          setLinkedAccounts,
          setAccountLinkRefNumbers,
          setIsFip1,
          setIsFip2
        );
        setOtp("");
        console.log({ responsne });
        if (!responsne) {
          await checkAndLink(
            fipId2,
            panNumber,
            mobileNumber,
            true,
            setAccountLinkRefNumbers,
            setIsFip2
          );
        } else {
          setIsFip1(true);
        }
      }

      if (otp2.length === 8) {
        await handleLinking(otp2, accountLinkRefNumbers, setLinkedAccounts);
        setOtp2("");
        // Check the conditions after the async operation completes
        console.log("fipId:", isFip1, "fipId2:", isFip2);
        if (!isFip2) {
          console.log("Linked Accounts:", linkedAccounts);
          handleConsentApproval(linkedAccounts, "ACCEPT");
        } else {
          await checkAndLink(
            fipId2,
            panNumber,
            mobileNumber,
            true,
            setAccountLinkRefNumbers,
            setIsFip2
          );
          setIsFip1(false);
        }
      }

      if (otp3.length === 8) {
        await handleLinking(otp3, accountLinkRefNumbers, setLinkedAccounts);
        setOtp3("");
        // Check the conditions after the async operation completes
        console.log("fipId:", isFip1, "fipId2:", isFip2);
        if (!isFip1) {
          console.log("Linked Accounts:", linkedAccounts);
          handleConsentApproval(linkedAccounts, "ACCEPT");
        }
      }
    };

    handleOtpProcessing();
  }, [
    accountLinkRefNumbers,
    mobileNumber,
    otp,
    otp2,
    otp3,
    panNumber,
    linkedAccounts,
    isFip1,
    isFip2,
  ]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 gap-4">
      {isFip1 && accountLinkRefNumbers && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enter OTP received from {fipId}</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}{" "}
      {isFip2 && !isFip1 && accountLinkRefNumbers && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enter OTP received from {fipId2}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <InputOTP maxLength={8} value={otp3} onChange={setOtp3}>
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
          </CardContent>
        </Card>
      )}
      {!isFip1 && !isFip2 && (
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
