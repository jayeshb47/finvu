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
  /** @xstate-layout N4IgpgJg5mDOIC5QDUwCcCWAzAngAgDEBJABVgDoBRAOwBd0Nqo8AbAeykbzdoAcBiCG2physWgEN65VJlyFSFGvUxNWHLj14BtAAwBdRKF5tYGWhmFGQAD0QAmAJwBWXeV0AOAGwBGAOyOAMxegf5BADQgOIiB9vbkPs6+Hh72PrqOfh66gQC+uZGy2PjEZFR0DGrsnNTcfOREACIAMpT8sACuAEYAtubkWnqGSCAmZhZWI3YIPiF+5IGp3v5ZACz2uquR0Qj2q6vkq86Bm-Z+fquBx84e+YUM8qVKFarM1Zr1AMoAqgBCALJEAAqQKIADkAOKCYSiRgANzYAGtREVHopyipGG8NLUtGJun1aBYmENrGNzJZqNZpvZFvM9rSvM4gvYvB4-NtEP43J5Yl5HBlNo4VncQKiSujlJVsTU6rxyD8AcDQZD+Og0Gw0OReCwpFhNT0ZA8JWUpa91LK8Z1euZiVBSSNyRMqVMuXMFktfOcPOtNpyZq5yI5g5kjot7OzLqLxQoyjHSngmrBoSIxJJpPH0ZmSInGrAHcZTBTJqAaWz4n4fFX9kdNldAv6fHFAuRsj7fM4fAL1l5o8bYxRs7mKABhAASlBHAGkAPpgygADSBM9K-ALoyLzupMWy5CcAscqT8IUuzn9jnW5C8rPWjn5DLSfbkJsH-YTSfI48ns-nS5XpDXHxhkLcZKW3BA23IZwb1iC4fWcVYPHPc4El0ZlDw8RJ7BuRwn2KAcjWfWNh0I-CAHk+DwfU0FjFNRHEKQUTfLNmJzD8Ywo3gqM1WN1ydMDXRmXR4kCQIgiuQVhNcBsoi5XQmQSDxmWwk5nErQI-DwtE41YkiOMo6jY0-CdpxnABBMFGhnT5KEsmcyKBEg6PIeEkSYoinlI7SSLhY1OIITUCAweVYDAagIE4vjNwE0tEGcQNVl0HxEsPIJ9h8RtoPiRCvHWc5PFWO9ewKMVWNfDzSD0-tOO4mjSmM79zLsmy7Icpz1U1bVdVoajDWzcr8PfPNyF859-MC4KxDCiK+Ci0CS1sRAAFpAkS1tfA0xDUgjCJZJmUJnEOBDK1cPwhV0TSSv6ryTSqoiasM+qv1MiyrJaqy2v4CQWDQMAJAgHByBYRhkQgObixdWKEHitw73ZNTVi7YMfBknZZlCchzlEjwJKyUJivuCqdKJu7yIMnj6oAdTM4EVzIgAlezHPaAl+kGAwyWihbphRjIEgZE5giyRIOT2rCPCg3LCrOa8NOFLSXxu4j2Oq8m6tIBU-kBEFwShIRU1c5Elc8ocP1G4pxrQIKQtZoksXBrdBK7BCgyOQqLyrLxdD9MXVpbPKmy8Lxjw2JsFYI03hv0rjHo1xVtZVKEOq1HU9QNY2WJJs2-L4AKrcm61CTtB2YsWmYUfiflrhcRLvdWLxG1iA4-bOxZkf2cPPLHCRwpYMA8BHYRQroBVbKskcyLBFqgWcw33MG9Fu97-vB+oYfaBciA+5L7mYjiCWNNcH1giuRxWUbVlHFbXkcYFeHbiusryCXreV6HsKN-emcJ6n2yZ+Trqac0B9Sfi-PuA934jwwK-HekMy4RlSAsZkYl4pNiUv4Rssw3CiQ2JsL2iRg4E1KkTCgnxppYjwM0HEeBOLOQYhmJ+ZDwoUKobKSKHNHRczgTzRKPgEj+AjNBPwgjHD+ibleJIPgUhpAyFkHInd0RMIgCw6hnEGgtDaMPCAAxZocJAhDcC6MrxJTUmkLsiFZgNz2ojZuAoEI4w0okH0CiyhKJUWwr4WtlS61ntQBERtrpuLUKwrgajoHbz0Ruea3DEDw3WsI9GSRIwZT2qtHkGxzj12OE4IOLjSHkOCaozxSodaqgAanHq6dAkFOYCE2oYSYGRP4rvGYIRjEizMReTCQcxEbCDJtbI6R0hn1ZHkjE0oLQfHlE0Vo-BfpaJ0ToJpXDDG8P4cIpSZwRH+n2NleSXZMLHA0klYqJVqBsAgHAaw-VObRPAktRCBxlgDO2h4XaOwlp7HcN7YSaF5L3ijI-Eh4zzTvFxHwW5BinaFXmMLRYNwzhqRxv6Np7s4bCXbGhbwYyzQULBXKdRrRIWOyhokI4mNMLwqPEi1GDgFK3g7MHFwXYcUvDxdQvE8dvGQmJaXHmyM9zrA0mcTY6wEKZSvmhQ8PZuTe1mKyzEVQOX1Anv8EgrQgSUF5S0s4l5LjnAuEHVwbJGwCmvtKjYRwpFHDGZHeAnC7mCQecEdaKM4KvPebE+K-MpZVlMfyHwtrdIfmej+Rcy5SjapidDCWTg4iJAIfFTsoi9ouBbPuGForVrYSDVnYa30WDW1gIPHoOowD0CjeBYIsMmxXFyn7YU58xYZBbBJDYMsYX2FzQvNiUdVYxwpqQStTrFgS2ee6-enqZhxHmDXIOsREgnBRt27yKt7pqyMqGpqb0x5MxIMOqGS0LzuAZEyXKpiEJnjFq4Q6mxMLsjeReRKD9CY9oGquvt66B3qxIOQamtMCAMz3Qesu6QXYClrZkbCIQr1owQi2O8CDoKLBOHeFdt011k2-UZLlpSIQgZ5vFCWF5ri0hRp2Y4jdYiHByDcRC3tVpSPQ8rT9WHaqbrImqjVWqHVQqhrSRBxxkoRiOG8y4jckgJGONeQRp0xlgLfmvD+BGHBrAWH4VwwpyOiRSWjC68QcYbG2qsLIwj5M91fhApTI8v4-2nip3Yhn1OaarPWUIF8bgUvdsyYSwjHxArfc-Cz4DV7r0-Jx9VlBNUOfrG4C4jIg6XCkSmtGTg3DHEKkkk8xqxlBNqUU3gDm9j+lpP7TaVxhmPvlQF7S+TmGFI8dMjRDnhFiMQocTIq1vRXG8HkGris8uUIK5rEpicHMmavt4PzoQIy+D2KLHYsRiOdYsQEbIzhcs1KG418LXGos8f0SS0DXZ-ZshSGhC4cFaUIGrZjEzXWvZraCPkfIQA */
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
      initial: "SEND_CONSENT",
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
