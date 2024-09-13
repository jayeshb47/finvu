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
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./components/ui/table";
import { ScrollArea } from "./components/ui/scroll-area";

interface Props {
  actorOptions: ActorOptions<AnyActorLogic> | undefined;
}
const App: React.FC<Props> = ({ actorOptions }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mobileNumber = queryParams.get("mobileNumber") || "";
  const panNumber = queryParams.get("panNumber") || "";
  const handleId = queryParams.get("handleId") || "";
  const finRequestId = queryParams.get("finRequestId") || "";

  const actorRef = useActorRef(machine, actorOptions);
  const consentId = useSelector(actorRef, (state) => {
    return state.context.consentId;
  });
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
      }) ||
      state.matches({ "Handle Consent": "GET_CONSENT_DETAILS" })
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

    if (state.matches({ "Handle Consent": "COMPLETE" })) {
      console.log({ consentId });
      console.log({ finRequestId });
      // if (consentId != "") {
      //   window.location.href = `https://checklimit.stage.abhiloans.com/?finRequestId=${finRequestId}&consentId=${consentId}`; //TODO change to whatever url we have to redirect to
      // }
      return "consentDone" as const;
    }

    if (state.matches({ "Handle Consent": "WAIT_FOR_CONSENT" })) {
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

  const fips = useSelector(actorRef, (state) => {
    return state.context.fipIds;
  });

  const consentDetails = useSelector(actorRef, (state) => {
    console.log("consentDetails", state.context.consentDetails);
    return state.context.consentDetails;
  });

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
    <div>
      {(screenToRender === "loading" || screenToRender === "consentDone") && (
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
          {screenToRender === "consent" && (
            <div className="w-full max-w-md mx-auto">
              <Table>
                {/* <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">
                      {consentDetails}
                    </TableHead>
                  </TableRow>
                </TableHeader> */}
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Consent Validity</div>
                    </TableCell>

                    <TableCell className="text-right">
                      {new Date(consentDetails.startTime).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}{" "}
                      -{" "}
                      {new Date(consentDetails.expireTime).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Frequency</div>
                    </TableCell>

                    <TableCell className="text-right">
                      {consentDetails.Frequency.value}-
                      {consentDetails.Frequency.unit}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Consent Types</div>
                    </TableCell>

                    <TableCell className="text-right">
                      {consentDetails.consentTypes.map((type, index) => (
                        <span key={index}>
                          {type}
                          {index < consentDetails.consentTypes.length - 1
                            ? ", "
                            : ""}
                        </span>
                      ))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">FIU Name</div>
                    </TableCell>

                    <TableCell className="text-right">
                      {consentDetails.FIU.name}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">FIP Name</div>
                    </TableCell>

                    <TableCell className="text-right">
                      {fips.map((type, index) => (
                        <span key={index}>
                          {type}
                          {index < fips.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">VUA/Handle</div>
                    </TableCell>

                    <TableCell className="text-right">$150.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Purpose-Text</div>
                    </TableCell>

                    <TableCell className="text-right">
                      {consentDetails.Purpose.text}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">FI Data Range</div>
                    </TableCell>

                    <TableCell className="text-right">
                      {new Date(
                        consentDetails.DataDateTimeRange.from
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(
                        consentDetails.DataDateTimeRange.to
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Data Life</div>
                    </TableCell>

                    <TableCell className="text-right">
                      {consentDetails.DataLife.value}-
                      {consentDetails.DataLife.unit}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="px-4 py-6 bg-white">
                <div className="max-w-md mx-auto flex gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-1 bg-gradient-to-r from-[#1A73E9] to-[#ED3237] text-white font-semibold p-px rounded-full"
                  >
                    <span className="flex w-full h-full bg-black/100 text-white rounded items-center justify-center rounded-full">
                      Aceept
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-1 bg-gradient-to-r from-[#1A73E9] to-[#ED3237] text-white font-semibold p-px rounded-full"
                  >
                    <span className="flex w-full h-full bg-black/100 text-white rounded items-center justify-center rounded-full">
                      Deny
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;

//TEST
