import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./components/ui/input-otp";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import {
  handleConsentApproval,
  handleLinking,
  handleLogin,
  handleVerify,
  checkAccounts,
  sendOtp,
} from "./lib/utils";
import { useMachine } from "@xstate/react";
import { machine } from "./lib/machines/firstmachine";
import { LoadingSpinner } from "./components/ui/loading-spinner";

function App() {
  const [state, sendTo] = useMachine(machine);

  const currentFipId = state.context.fipIds[state.context.currentFipIndex];
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mobileNumber = queryParams.get("mobileNumber") || "";
  const panNumber = queryParams.get("panNumber") || "";
  const handleId = queryParams.get("handleId") || "";

  const [otp, setOtp] = useState<string>("");
  const [otp2, setOtp2] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [accountLinkRefNumbers, setAccountLinkRefNumbers] =
    useState<string>("");

  const updateAccountLinkRefNumbers = (refNumber: string) => {
    setAccountLinkRefNumbers(refNumber);
    console.log({ accountLinkRefNumbers });
  };

  useEffect(() => {
    window.finvuClient.open();
    console.log(window.finvuClient);
    handleLogin(handleId, mobileNumber);
  }, [handleId, mobileNumber]);

  const linkAccount = async () => {
    console.log("in link account", accountLinkRefNumbers);
    const response = await handleLinking(otp2, accountLinkRefNumbers);

    if (!response) {
      sendTo({ type: "ERROR_OTP" });
    } else {
      sendTo({ type: "VERIFY_OTP" });
    }
  };

  const handleOtpSubmit1 = async () => {
    const [otpVerified, error] = await handleVerify(otp);
    if (!otpVerified) {
      setError(error || "");
      sendTo({ type: "ERROR_OTP" });
    } else {
      setError("");
      sendTo({ type: "VERIFY_OTP" });
    }
  };

  const checkFip = async () => {
    const response = await checkAccounts(
      currentFipId as string,
      panNumber,
      mobileNumber
    );

    if (response?.hasUnlinkedAccounts) {
      sendFipOtp();
    } else {
      sendTo({ type: "NO_LINKED_ACCOUNTS" });
    }
  };

  const sendFipOtp = async () => {
    const response = await sendOtp(
      currentFipId as string,
      panNumber,
      mobileNumber,
      updateAccountLinkRefNumbers
    );
    if (!response) {
      sendTo({ type: "ERROR_SENDING_OTP" });
    } else {
      sendTo({ type: "SENT_OTP" });
    }
  };

  const consentSend = async () => {
    const response = await handleConsentApproval("ACCEPT");

    if (!response) {
      sendTo({ type: "ERROR_CONSENT" });
    } else {
      sendTo({ type: "CONSENT_DONE" });
    }
  };

  useEffect(() => {
    if (otp.length === 6) {
      if (state.matches({ "Entering login otp": "idle" })) {
        console.log("hii");
        sendTo({ type: "SUBMIT_OTP" });
        handleOtpSubmit1();
      }

      setOtp("");
    }

    if (otp2.length === 8) {
      if (
        state.matches({ "Verify FIP IDs": { verifyOtpForFip: "waitForOtp" } })
      ) {
        sendTo({ type: "SUBMIT_OTP" });
        linkAccount();
      }

      setOtp2("");
    }
  }, [otp, otp2, sendTo, state]);

  useEffect(() => {
    if (state.matches({ "Verify FIP IDs": { verifyOtpForFip: "sendOtp" } })) {
      checkFip();
    }
    if (state.matches({ "Handle Consent": "idle" })) {
      consentSend();
    }
  }, [state]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 gap-4">
      {JSON.stringify(state.value)} | {JSON.stringify(currentFipId)}
      <div className="text-red-500">{error}</div>
      {state.matches({
        "Verify FIP IDs": { verifyOtpForFip: "waitForOtp" },
      }) && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              Enter OTP received from {currentFipId as string}
            </CardTitle>
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
      )}
      {state.matches({ "Entering login otp": "idle" }) && (
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
      {state.matches({ "Entering login otp": "submitting" }) ||
        state.matches({
          "Verify FIP IDs": { verifyOtpForFip: "submitting" },
        }) ||
        state.matches({
          "Verify FIP IDs": { verifyOtpForFip: "sendOtp" },
        }) ||
        (state.matches({ "Handle Consent": "idle" }) && <LoadingSpinner />)}
      {state.matches({ "Handle Consent": "complete" }) && (
        <div className="h1">consent sent</div>
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
