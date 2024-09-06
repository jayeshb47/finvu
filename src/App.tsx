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
      {screenToRender === "loading" && <LoadingSpinner />}
      {screenToRender === "consent" && <h1 className="">consent sent</h1>}
    </div>
  );
};

export default App;

//TEST
