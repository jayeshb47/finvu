import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./components/ui/input-otp";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { useActorRef, useSelector } from "@xstate/react";
import { machine } from "./lib/machines/firstmachine";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import type { ActorOptions, AnyActorLogic } from "xstate";
import { ChevronLeft } from "lucide-react";
import { Button } from "./components/ui/button";

interface Props {
  actorOptions: ActorOptions<AnyActorLogic> | undefined;
}
const App: React.FC<Props> = ({ actorOptions }) => {
  const actorRef = useActorRef(machine, actorOptions);
  // const [errorMessage, setErrorMessage] = useState("");
  const screenToRender = useSelector(actorRef, (state) => {
    console.log("the top console", state);
    if (
      state.matches("Sending Login Otp") ||
      state.matches({ "Entering login otp": "SUBMITTING" }) ||
      state.matches({ "Verify FIP IDs": "CHECK_NEXT_FIP" }) ||
      state.matches({
        "Verify FIP IDs": { "Verify Otp for FIP": "SUBMITTING" },
      }) ||
      state.matches({
        "Verify FIP IDs": { "Verify Otp for FIP": "CHECK_AND_SEND_OTP" },
      })
    ) {
      return "loading" as const;
    }
    if (state.matches("Entering login otp")) {
      return "login" as const;
    }

    if (
      state.matches({
        "Verify FIP IDs": { "Verify Otp for FIP": "WAIT_FOR_OTP" },
      })
    ) {
      return "fipLogin" as const;
    }

    if (state.matches("Handle Consent")) {
      return "consent" as const;
    }

    throw new Error(
      `Reached an unreachable state: ${JSON.stringify(state.value)}`
    );
  });

  const errorMessage = useSelector(actorRef, (state) => {
    if (state.context.error !== undefined) {
      console.log("Error: ", state.context.error);
      return state.context.error as string;
    }
  });
  const fipName = useSelector(actorRef, (state) => {
    return state.context.fipIds[state.context.currentFipIndex];
  });

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mobileNumber = queryParams.get("mobileNumber") || "";
  const panNumber = queryParams.get("panNumber") || "";
  const handleId = queryParams.get("handleId") || "";

  const [otp, setOtp] = useState<string>("");
  const [otp2, setOtp2] = useState<string>("");
  useEffect(() => {
    window.finvuClient.open();
    console.log(window.finvuClient);
    actorRef.send({ type: "send.otp", handleId, mobileNumber, panNumber });
  }, [handleId, mobileNumber]);

  useEffect(() => {
    if (otp.length === 6) {
      console.log("hii", otp);
      actorRef.send({ type: "submit.otp", otp });
      setOtp("");
    }

    if (otp2.length === 8) {
      console.log("otp2", otp2);
      actorRef.send({ type: "submit.otp", otp: otp2 });

      setOtp2("");
    }
  }, [otp, otp2]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 gap-4">
      {JSON.stringify(screenToRender)} |{" "}
      {JSON.stringify(actorRef.getSnapshot().value)}
      <div className="text-red-500">{errorMessage}</div>
      {screenToRender === "fipLogin" && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enter OTP received from {fipName as string}</CardTitle>
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
      {screenToRender === "login" && (
        // <Card className="w-full max-w-md">
        //   <CardHeader>
        //     <CardTitle>Enter OTP</CardTitle>
        //   </CardHeader>
        //   <CardContent>
        //     <div className="flex flex-col items-center">
        //       <InputOTP maxLength={6} value={otp} onChange={setOtp}>
        //         <InputOTPGroup>
        //           <InputOTPSlot index={0} className="w-16" />
        //           <InputOTPSlot index={1} className="w-16" />
        //           <InputOTPSlot index={2} className="w-16" />
        //           <InputOTPSlot index={3} className="w-16" />
        //           <InputOTPSlot index={4} className="w-16" />
        //           <InputOTPSlot index={5} className="w-16" />
        //         </InputOTPGroup>
        //       </InputOTP>
        //     </div>
        //   </CardContent>
        // </Card>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 p-4 font-sans">
          <div className="max-w-md mx-auto">
            <header className="flex items-center justify-between mb-8">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex space-x-1">
                <div className="w-8 h-1 bg-blue-600 rounded"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              </div>
              <span className="text-gray-600 text-sm">Step 1</span>
            </header>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">Enter OTP</h1>
            <p className="text-gray-600 mb-8 text-sm">
              6-digit code sent to +91 9876543210 from AA Aggregator to fetch
              your Stocks and Bonds
            </p>

            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
              className="mb-8"
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-12 h-12 text-2xl"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <p className="text-center text-gray-600 mb-8 text-sm">
              Resend OTP in <span className="text-red-500">25 secs</span>
            </p>

            <Button className="w-full bg-blue-600 text-white py-6 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300">
              →
            </Button>
          </div>
        </div>
      )}
      {screenToRender === "loading" && <LoadingSpinner />}
      {screenToRender === "consent" && <h1 className="">consent sent</h1>}
    </div>
  );
};

export default App;
