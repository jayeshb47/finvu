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
import { ChevronLeft, ChevronRightIcon } from "lucide-react";
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
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-gradient-to-r from-[#1A73E9]/25 to-[#ED3237]/25 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center space-x-1">
            <div className="w-8 h-1 bg-blue-600 rounded" />
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
          </div>
          <span className="text-sm text-gray-600">Step 1</span>
        </div>
      </div>
      {/* {JSON.stringify(screenToRender)} |{" "}
      {JSON.stringify(actorRef.getSnapshot().value)} */}
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

        <div className="flex p-5">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Enter OTP</h1>
            <p className="text-gray-600 mb-8 text-sm">
              6-digit code sent to{" "}
              <span className="font-semibold">+91 {mobileNumber}</span> from{" "}
              <span className="font-semibold">AA Aggregator</span> to fetch your
              Stocks and Bonds
            </p>

            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup className="flex-row gap-x-3 justify-center mb-9">
                {[...Array(6)].map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="flex-1 font-bold rounded-md border-2 aspect-square w-12 h-16"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <p className="text-left text-black/50 mb-8 text-sm">
              Resend OTP in{" "}
              <span className="bg-gradient-to-r from-[#1A73E9] to-[#ED3237] bg-clip-text text-transparent">
                25 secs
              </span>
            </p>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="icon"
                className="w-20 h-12 bg-gradient-to-r from-[#1A73E9] to-[#ED3237] text-white font-semibold p-px rounded-full"
              >
                <span className="flex w-full h-full bg-black/100 text-white rounded items-center justify-center rounded-full">
                  <ChevronRightIcon className="h-5 w-5" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
      {screenToRender === "loading" && <LoadingSpinner />}
      {screenToRender === "consent" && <h1 className="">consent sent</h1>}
    </div>
  );
};

export default App;
