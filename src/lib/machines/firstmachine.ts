/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  setup,
  fromPromise,
  assign,
  ActorRefFrom,
  AnyActorLogic,
} from "xstate";
import {
  checkAccounts,
  getConsentDetails,
  handleConsentApproval,
  handleLinking,
  handleLoginOrVerify,
  sendOtp,
} from "../utils";
import { ErrorSchema, ErrorType } from "../schemas";

export const machine = setup({
  types: {
    context: {} as {
      fipIds: string[];
      currentFipIndex: number;
      error: unknown;
      otp: string;
      handleId: string;
      mobileNumber: string;
      panNumber: string;
      accountLinkRefNumbers: string;
      consentId: string;
      consentDetails: any;
    },
    // events: {} as
    //   | { type: "SUBMIT_OTP" }
    //   | { type: "NO_LINKED_ACCOUNTS" }
    //   | { type: "UPDATE_OTP" },
  },
  actions: {
    incrementFipIndex: function ({ context }) {
      context.currentFipIndex += 1;
    },
    clearOtp: assign({
      otp: undefined,
    }),
  },
  actors: {
    submitOtp: fromPromise(async ({ input }: { input: { otp: string } }) => {
      console.log({ input });
      const response = await handleLoginOrVerify({
        action: "verify",
        otp: input.otp,
      });
      console.log({ response });
      if (!response.status) {
        throw new Error(response.error as string);
      }
      return response.status;
    }),
    submitFipOtp: fromPromise(
      async ({
        input,
      }: {
        input: {
          otp: string;
          accountLinkRefNumbers: string;
        };
      }) => {
        console.log({ input });
        const response = await handleLinking(
          input.otp,
          input.accountLinkRefNumbers
        );
        console.log("fip otp");
        console.log({ response });
        if (!response.status) {
          throw new Error(response.error);
        }
        return response.status;
      }
    ),
    sendOtp: fromPromise(
      async ({
        input,
      }: {
        input: {
          fipIds: Array<string>;
          currentFipIndex: number;
          panNumber: string;
          mobileNumber: string;
          parent: ActorRefFrom<AnyActorLogic>;
        };
      }) => {
        const response = await checkAccounts(
          input.fipIds[input.currentFipIndex],
          input.panNumber,
          input.mobileNumber
        );
        console.log({ response });
        if (!response.status) {
          throw new Error(response.error);
        }
        if (response?.hasUnlinkedAccounts) {
          const responseOtp = await sendOtp(
            input.fipIds[input.currentFipIndex],
            input.panNumber,
            input.mobileNumber
          );
          console.log({ responseOtp });
          if (!responseOtp.status) {
            throw new Error(response.error);
          }
          return responseOtp.accountLinkRefNumbers;
        } else {
          input.parent.send({ type: "already.linked" });
        }
      }
    ),

    handleConsent: fromPromise(async () => {
      const response = await handleConsentApproval("ACCEPT");
      console.log({ response });
      if (!response.status) {
        throw new Error(response.error);
      }
      return response.consentId;
    }),
    getConsentDetails: fromPromise(async () => {
      const response = await getConsentDetails();

      if (!response.status) {
        throw new Error(response.error);
      }
      return response;
    }),
    sendLoginOtp: fromPromise(
      async ({
        input,
      }: {
        input: { handleId: string; mobileNumber: string };
      }) => {
        console.log({ input });
        const response = await handleLoginOrVerify({
          action: "login",
          handleId: input.handleId,
          mobileNumber: input.mobileNumber,
        });
        console.log({ response });
        if (!response.status) {
          throw new Error(response.error);
        }
        return response.status;
      }
    ),
  },
  guards: {
    fipArrEmpty: function ({ context }) {
      console.log("checking if array empty");
      return context.currentFipIndex >= context.fipIds.length;
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDUwCcCWAzAngAgDEBJABVgDoBRAOwBd0Nqo8AbAeykbzdoAcBiCG2physWgEN65VJlyFSFGvUxNWHLj14BtAAwBdRKF5tYGWhmFGQAD0QAmAJwBWXeV0AOAGwBGe74B2Lw8AFl1nABoQHEQAZnt7ch9nL3sAnw9PXUcA2K8AX3yo2Wx8YjIqOgY1dk5qbj5yIgARABlKflgAVwAjAFtzci09QyQQEzMLKzG7BB8vWIDyWI80gJCQ538Aj0comIR7DfJN2IyPHz9fZ1jnQuKGeXKlKtVmWs1Glvb+NDgwagQIZ8EbWCbmSzUayzHxhHxJHwBezZXQ+Fb+EL7RAbRJhVKbeaw3w+e4gEpPRSVFSMd4aepacgAZQAqgAhACyRAAKlyiAA5ADigmEokYADc2ABrUTksqU5TVWl1Bq8MS9Aa0CxMUFjcFTKEzBwrJZHI55WJ45wbLFzAJuTyxWKOW5eLwuWGk2UKCoKt7qZUMlkc7m8wX8dBoNhoci8FhSLBRvoyR5yn2vGn+z6q7r9cxaqA64ymCHTUAwhZLdEBdabba7G3JeG6Zu6LzOavVtvrT0p70UL3lPAtWDCkRiSTSAeUqckIfNWCF8bF-XQhzBRLpTyORyo+zJRxeBsJWLkTIedtedYuXQrHtyVP93uD4fkADCAAlKK+ANIAfT5lAABpcr+5T8IueqQquhyhOQORtu2-irPYoQ2qs8IWosKwhGc3gXHepR9sm97enOFAfl+f4AcBoGkOBPijEWkxQYahzrHBQTOIh64oZi0SII4sKnjhCwXM4lyOCEBEUhUM5kcRhEAPJ8HgCZoN6o6iOIUgyk+056bOL5espvCqVG3oQcuLFlg4sHwVxSI8ah-EIN4lYiV4ugoTc67SQ+CkyfJxkqWp3pvp+P6-gAgnyzS-oylCxb+ilciQmnkOKUq6SRzwBam8liimJkEFGBAYNmAIQCZlnMaWtiIFxbgHh4QSSYsbZeQ2ISuuQ7bNhc9hnD4uhSUUZIGY+OWkEFvYmWZ6nlOFlHRUlCVJSlaURlGMZxrQalJjOk2Ec+87kIV97FaV5ViJV1UGGCVl1TCIT2A2twhL1zqbM4HixOEbp+URclGbNIXmYtFGRTFcVrXFG38BILB-BIEA4OQLCMNKEA1SWBo2QgjVwcErU4ZxnUufMZzkNW8REo6I26AEgO5cDp3BaZoWLQA6lF3KgYpABKyWpZ06qDMM926o9eP1XMaKJG6PmMxewR8QcRLOO4doZG6ISOB4oQFGNh15aRIMkXNnOkEybKcjy-JCkIY6ZdKpsswZBVFXwJVoGV2Zi5qNI4yurE+C4H2SVxL04eEUdvThJz+I4KHpKEGQksbE1u9N5tKWDC3W0GduhkKW3RrG8aJtnskey+52lJdvvXTmGr5sH1my5c8TkIreTK0EqtvUcywic2yfJ-EdyZ1NFTvhIgIsGAeCvsIsAArQTKJXFr6KXya1culLvZcdlJzwvS8r9Qa90BlECL+3T3Yo68KDThsLniE6SvRT9NJL9P04V+luWIzNT7zzvhfVe69N5JR3nvRKB8y47UrmgA6Wcz4QOXlAm+GAIEPxlrMJ055yB7m8IJI4KQ-BHmRNTVsLULiImbH4UBs9wGLywVfaBApKAgTgfvX8zQeG81aIyQ+1AJSuxNhg9hl9r4bwgGASQGAWALklkxXG0F4goWWOsVIfgmGIjeuEXq8x0guGTjcR0LCKDSMgZwm+3DeG734YIrkwjRFIIrntKuUi2F2LkeQBRSiVH4OginRIzp4iM1SOJFIDYw5eHcE6Z0RxPK7HmNY8gtiOEBJ5nzAggtfx8IQQjAAxqUsAvAN6lOwbQUJrFFjOEcO4N0v1-Cth3GrRAaJHQnGyNuNpeEbiZOybI6BeSQIFKFsUvkB8FHUDRjU+xdS1FLlqgQuIAQmktP1vETyboRoNn6XBFIgkwhYWSFPB4M8KCMkqhmVodI8AmXStpScWc7mAgeU8u6jE1kaNDnCBESIURolWF4LpCB4gfTbKkVOWQch5EyZ8iA3zlQmSaG0Do18gQSz+ZBR+cwFg91RFxN0X1GYGxtCEISTplYvT8MnVETNp4nwqCitFXAMVFxDA7MREjj4yVufctQjz0WNFwffVZBKNmuS2aeS8GQ7SrGZd-A4Fp7TIkEhPDYAQDxG2uWy4VXzRU-MaDy+2YZPG7X2tXY1qLTXitVJKsA9T8aUxJZc8lGqdgeBtFEuCjTxK7nErkI2Y1qBsAUfAMYh0HrrOggAWiODaZNJ5twZszZmiFmTfQZg+PSPg8aAXur1ksHYfh2y7GRJ-AINpiV6wzRQ3wrYUK5vTDUJ5DJviUGLSHd1VpNYVvsFWpltabT+E1i9HIYczm3FbO26knaAzmttrywUfaO4wm3C-BlB4cg1oWA2bZ4RtzpDyMEMO9hF2KkzIW1UO92QkHaFyXtUsE2sTSC9E4jTkjIgxLCBsO5Tz9LtCk50l4rnjRudXMim7CVOhtLkE8oR0SqzRI2TJrNyIRSokBSZpB4OypamhP6JxiaIlwtWK0WHa6nURiwP2sAV59FjIosARHoJ+DVd0sOKGcIpBbN1SStGZ4zQtvnb0nHWKSSPHkYSeRdiOjcs6UTbLxN5w5uDa2kM-zQ3ilvYWJBpOlo8CcVD3hHTeVbJECmpx3DdVyPrA8WwoMm2w6bS22mSDkAmfzIWG0TOy31SQ3In9Vif1uE0rqBterdUvL9c4OE1OBVzvILzBcfMWpLkFmEXEzORxWE6NIrhybqys30i0I62xpHiCyw1QrYNpfwBlsKj7n08Lfeo-tstBqrF6mcbqpx9VxJ-ikJINxuqNM8h0kZficnr1yw4HYH1FjdSOC9C4wQjl+BOH1LyGxLwxLm+fBbN9YZFOcQgpbULnSa1fvS7ww0LRvTDkkGbzYCTnkZidzBYyb7tZfV1-5PXZhTZPJ5ZIBJwh6ts+VhOZoaUHkpls37MjankEcZd+BsyBFCKICIm7KFu5rfxJt+YfqKZOA+nrWmNXVZBDR-48ZvNJmFJmVyG771mlNMwmCpwCQh5LFp2cV0mQ0iDWRSK5gYquVFvfSW3rkLBonlJrWg5549VS5NTLs1qoe03aRP6kIZmy0m6cIsdYTpRoNf8hyx1cvVTZYdjdz+zS3JhxvMNOhPGoXaLPWWm8OFP42+g0apk0u8Cy-qBiwHnWbsSVV8TJp1ZGaOn9Z5amIfKFHYNosQohQgA */
  context: {
    fipIds: ["fip@finrepo", "fip@finvugst"],
    currentFipIndex: 0,
    error: undefined,
    otp: "",
    handleId: "",
    mobileNumber: "",
    panNumber: "",
    accountLinkRefNumbers: "",
    consentId: "",
    consentDetails: undefined,
  },

  schema: {
    services: {
      submitOtp: {
        error: {} as ErrorType,
      },
    },
  },

  id: "Verify FIPs",

  states: {
    "Entering login otp": {
      initial: "IDLE",
      onDone: {
        target: "Verify FIP IDs",
      },
      states: {
        IDLE: {
          on: {
            "submit.otp": {
              target: "SUBMITTING",
              actions: assign({ otp: ({ event }) => event.otp }),
            },

            "resend.otp": {
              target: "#Verify FIPs.Sending Login Otp",
              reenter: true,
            },
          },
        },

        SUBMITTING: {
          invoke: {
            id: "Verify FIPs.Entering login otp.submitting",
            src: "submitOtp",
            input: ({ context: { otp } }) => ({ otp }),

            onError: {
              target: "IDLE",
              actions: assign({
                error: ({ event }) => {
                  console.log({ event });
                  const parsedError = ErrorSchema.safeParse(event.error);
                  return parsedError.data?.message;
                },
              }),
            },

            onDone: {
              target: "COMPLETE",
              actions: assign({ error: () => undefined }),
            },
          },
        },

        COMPLETE: {
          type: "final",
        },
      },
    },

    "Verify FIP IDs": {
      initial: "CHECK_NEXT_FIP",
      onDone: {
        target: "Handle Consent",
      },
      states: {
        CHECK_NEXT_FIP: {
          always: [
            {
              target: "allFipsComplete",
              guard: {
                type: "fipArrEmpty",
              },
            },
            {
              target: "Verify Otp for FIP",
            },
          ],
        },
        allFipsComplete: {
          type: "final",
        },
        "Verify Otp for FIP": {
          initial: "CHECK_AND_SEND_OTP",
          onDone: {
            target: "CHECK_NEXT_FIP",
          },
          states: {
            CHECK_AND_SEND_OTP: {
              invoke: {
                id: "Verify FIPs.Verify FIP IDs.verifyOtpForFip.sendOtp",
                input: ({
                  context: { fipIds, currentFipIndex, panNumber, mobileNumber },
                  self,
                }) => ({
                  fipIds,
                  currentFipIndex,
                  panNumber,
                  mobileNumber,
                  parent: self,
                }),

                onDone: {
                  actions: assign({
                    accountLinkRefNumbers: ({ event }) =>
                      event.output as string,
                  }),

                  target: "WAIT_FOR_OTP",
                  reenter: true,
                },
                onError: {
                  actions: assign({
                    // @ts-ignore
                    error: ({ event }) => event.error.message,
                  }),
                },
                src: "sendOtp",
              },

              on: {
                "already.linked": {
                  target: "COMPLETE",
                  reenter: true,
                },
              },
            },
            WAIT_FOR_OTP: {
              on: {
                "submit.otp": {
                  target: "SUBMITTING",
                  actions: assign({
                    otp: ({ event }) => event.otp,
                  }),
                },
              },
            },
            SUBMITTING: {
              invoke: {
                id: "Verify FIPs.Verify FIP IDs.verifyOtpForFip.submitting",
                input: ({ context: { otp, accountLinkRefNumbers } }) => ({
                  otp,
                  accountLinkRefNumbers,
                }),

                onDone: {
                  target: "COMPLETE",
                  actions: assign({ error: () => undefined }),
                },
                onError: {
                  target: "CHECK_AND_SEND_OTP",

                  actions: assign({
                    // @ts-ignore
                    error: ({ event }) => event.error.message,
                  }),

                  reenter: true,
                },
                src: "submitFipOtp",
              },
            },
            COMPLETE: {
              type: "final",
              entry: {
                type: "incrementFipIndex",
              },
            },
          },
        },
      },
    },

    "Handle Consent": {
      initial: "GET_CONSENT_DETAILS",
      states: {
        SEND_CONSENT: {
          invoke: {
            id: "Verify FIPs.Handle Consent.idle",
            input: ({ context: { otp } }) => ({ otp }),

            onDone: {
              target: "COMPLETE",
              actions: assign({
                consentId: ({ event }) => event.output as string,
              }),
            },
            onError: {
              target: "SEND_CONSENT",
              // @ts-ignore
              actions: assign({ error: ({ event }) => event.error.nessage }),
            },
            src: "handleConsent",
          },
        },

        COMPLETE: {
          type: "final",
        },

        GET_CONSENT_DETAILS: {
          invoke: {
            id: "Verify FIPs.Handle Consent.details",
            // input: ({ context: { otp } }) => ({ otp }),

            onDone: {
              target: "WAIT_FOR_CONSENT",
              actions: assign({
                consentDetails: ({ event }) => event.output.consentDetails,
              }),
            },
            onError: {
              target: "GET_CONSENT_DETAILS",
              // @ts-ignore
              actions: assign({ error: ({ event }) => event.error.nessage }),
            },
            src: "getConsentDetails",
          },
        },

        WAIT_FOR_CONSENT: {
          on: {
            "accept.consent": "SEND_CONSENT",
            "deny.consent": "COMPLETE",
          },
        },
      },
    },

    "Sending Login Otp": {
      initial: "IDLE",

      onDone: {
        target: "Entering login otp",
      },

      states: {
        IDLE: {
          on: {
            "send.otp": {
              target: "SUBMITTING",
              actions: assign({
                handleId: ({ event }) => event.handleId,
                mobileNumber: ({ event }) => event.mobileNumber,
                panNumber: ({ event }) => event.panNumber,
              }),
            },
          },
        },

        SUBMITTING: {
          invoke: {
            id: "Verify FIPs.Sending Login Otp.idle",
            src: "sendLoginOtp",
            input: ({ context: { handleId, mobileNumber } }) => ({
              handleId,
              mobileNumber,
            }),
            onError: {
              target: "IDLE",
              // @ts-ignore
              actions: assign({ error: ({ event }) => event.error.message }),
            },

            onDone: {
              target: "COMPLETE",
              actions: assign({ error: () => undefined }),
            },
          },
        },

        COMPLETE: {
          type: "final",
        },
      },
    },
  },

  initial: "Sending Login Otp",
});
