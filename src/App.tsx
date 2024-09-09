import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./components/ui/input-otp";
import { useActorRef, useSelector } from "@xstate/react";
import { machine } from "./lib/machines/firstmachine";
import type { ActorOptions, AnyActorLogic } from "xstate";
import { ChevronLeft } from "lucide-react";
import { Button } from "./components/ui/button";
import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { cn } from "./lib/utils";

interface Props {
  actorOptions: ActorOptions<AnyActorLogic> | undefined;
}
const App: React.FC<Props> = ({ actorOptions }) => {
  const actorRef = useActorRef(machine, actorOptions);
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

  const loadingTitle = useSelector(actorRef, (state) => {
    if (state.matches("Sending Login Otp")) {
      return "Sending Login Otp" as const;
    }
    if (
      state.matches({ "Entering login otp": "SUBMITTING" }) ||
      state.matches({
        "Verify FIP IDs": { "Verify Otp for FIP": "SUBMITTING" },
      })
    ) {
      return "Verifying information" as const;
    }
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
  const [countdown, setCountdown] = useState(30);
  const [isCountdownComplete, setIsCountdownComplete] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCountdownComplete(true);
    }
  }, [countdown]);

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
    <>
      {screenToRender === "loading" && (
        // (errorMessage ? (
        //   <ErrorScreen errorMessage={errorMessage} />
        // ) : (
        <LoadingScreen title={loadingTitle} errorMessage={errorMessage} />
      )}
      {screenToRender != "loading" && (
        <div className="flex flex-col min-h-screen bg-white">
          <div className="bg-gradient-to-r from-[#1A73E9]/25 to-[#ED3237]/25 p-4">
            <div className="max-w-md mx-auto flex items-center justify-between">
              <Button variant="ghost" size="icon" className="text-gray-600">
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div className="flex items-center space-x-1">
                <div
                  className={cn(
                    " h-1 transition-all duration-300",
                    screenToRender === "login"
                      ? " w-8 bg-black/100 rounded"
                      : " w-1 bg-black/70 rounded-full"
                  )}
                />
                <div
                  className={cn(
                    "h-1 transition-all duration-300",
                    screenToRender === "login"
                      ? " w-1 bg-black/70 rounded-full"
                      : " w-8 bg-black/100 rounded"
                  )}
                />
              </div>
              <span className="text-sm text-black/70 transition-all duration-300">
                {screenToRender === "login" ? "Step 1" : "Step 2"}
              </span>
            </div>
          </div>

          {screenToRender === "fipLogin" && (
            <div className="flex p-5">
              <div className="w-full max-w-md mx-auto">
                <Header mobileNumber={mobileNumber} fipName={fipName} />

                <InputOTP maxLength={8} value={otp2} onChange={setOtp2}>
                  <InputOTPGroup
                    className={`flex-row gap-x-1.5 justify-center ${
                      errorMessage ? "mb-2" : "mb-9"
                    }`}
                  >
                    {[...Array(8)].map((_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className={`flex-1 font-bold rounded-md border-2 aspect-square w-10 h-16 ${
                          errorMessage && "border-red/100"
                        }`}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <div className="text-red/100 mb-4">{errorMessage}</div>

                <Footer />
              </div>
            </div>
          )}
          {screenToRender === "login" && (
            <div className="flex p-5">
              <div className="w-full max-w-md mx-auto">
                <Header mobileNumber={mobileNumber} />

                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup
                    className={`flex-row gap-x-3 justify-center ${
                      errorMessage ? "mb-2" : "mb-9"
                    }`}
                  >
                    {[...Array(6)].map((_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className={`flex-1 font-bold rounded-md border-2 aspect-square w-12 h-16 ${
                          errorMessage && "border-red/100"
                        }`}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <div className="text-red/100 mb-4">{errorMessage}</div>

                {!isCountdownComplete ? (
                  <p className="text-left text-black/50 mb-8 text-sm">
                    Resend OTP in{" "}
                    <span className="bg-gradient-to-r from-[#1A73E9] to-[#ED3237] bg-clip-text text-transparent">
                      {countdown} secs
                    </span>
                  </p>
                ) : (
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-[#1A73E9] to-[#ED3237] bg-clip-text text-transparent"
                  >
                    Resend Otp
                  </button>
                )}

                <Footer />
              </div>
            </div>
          )}
          {screenToRender === "consent" && <h1 className="">consent sent</h1>}
        </div>
      )}
    </>
  );
};

export default App;

//TEST
