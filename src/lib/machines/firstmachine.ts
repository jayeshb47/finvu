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
      return response.status;
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
  /** @xstate-layout N4IgpgJg5mDOIC5QDUwCcCWAzAngAgDEBJABVgDoBRAOwBd0Nqo8AbAeykbzdoAcBiCG2physWgEN65VJlyFSFGvUxNWHLj14BtAAwBdRKF5tYGWhmFGQAD0QAmAJy6ALORcuArAHZdj7wCMAMz29kEAbAA0IDgOuvbkjp5BwfYAHOHhuuFpyQC+edGy2PjEZFR0DGrsnNTcfOREACIAMpT8sACuAEYAtubkWnqGSCAmZhZWo3YIATlp5GkZ4S7ezt4+AfbRsQhOjouOWStba-aZBUUM8mVKlarMNZoNAMoAqgBCALJEACq-RAAcgBxQTCUSMABubAA1qJijdFBUVIxHho6loxD1+rQLExhtZxuZLNRrDMwuEAuQQtlvEEXClPAEkjtEAFfORdGkgiFAilHC5dJ5LiAEaUkcoqmjavVeOR3t8-gCQfx0Gg2GhyLwWFIsBrejJruLypKHuoZZiun1zHioATRkTJqTpmzKVSXG6ki57J40t5uazZp5dIlHGHnLp+S4ksLCqKjQpymLE3hmrAwSIxJJpMnboa5MbU01YPbjKZiVNQOTwkzyPYAn4cgElhFPIGwwlvB7mxsfGkPeERbmkcOSEWKABhAASlAnAGkAPqAygADV+C7K-FLY3LTrJiAAtPZsolQo4fR7vF3vGFAxsqXMQutHAFPI4go4hwm86Px+Rp7Oi7LmuG6kFuAQjGWEwkvuCAHn65CeJ4LgNtyb5HI4gZpFs5DeOEN7BkkH7hBEX4FomFC-mm+YlHgADyfB4HqaCJhmojiFI8LfiO3FjtRyYMbwTEaom26OjBLoIDW1KuG+YRpMeQooYG+EhnS-rRse0a+i4ZG0T+vF-gJjHMYm-4zvOC4AIKAk0C4vJQtkLnRvwkGx5BQrCXHkQZPmkH+kJGoJBAagQGByrAYDUBAglibuElVg4L7kCRKEpA2WQNkEgZbDkKWZJkzhHA29i6XGo6UYZ-EJoJwksWU5mAdZTkOU5LluWqGpajqtDMQaFU0YifHFuQgUFsFoXhWIUUxXwcXQZWtiHj64SJL4KHRhk0bZTEbJ+G4CnZEKvj2L2sZXH5SZVSNxlCaZDUAZZNl2a1dntfwEgsGgYASBAODkCwjBwhA80Vs6iUIEEuTkAE0Zdpt+HnAKOVBF2dYeGsgrFfEZUXfpPGXUZNUmSJDUAOpWX8G50QASs5rkdNiAxDAYhLxYtMwCiGKxnM2-hClsOVOAstIuNhzZQ5k3h6UNlWE9V5G1fdpDyp8Pz-ECoJCJmnlwoNxpy-jw0UGNJQTWgYURUzuKoqDe6SXMKwwxlvjNkpyFC54CRcjyyTRh6DLS+VvGG0NROKyT9Uqwq6vKqCnWatqur6vrFGp2UAVBXwIUW1NVo4radsJUtCD9lSGS6HSYSOH67I7bsAS5e4grZF4N4vkEMsG+QU4SNFLBgHgE7CJFdDyo5dkTnRgKtb87m695RsUL3-eD8P1Cj7QHkQAPRcc4g-KrX6TJHKsqNezlkYLF2lIkREW1i13acrzva8j1FW+vQuU8z45c8J91ZOaB+ohx7n3V+Q935jwwK-Pe4MS7pGDIsN8wZdDBH9MkNsu0EDngOEjSkWkGz+k-MHS6FAXgzVRHgFo6J6J8HchxHMoCKHRSoTQmUsVWYOnZvAmY6CFhOF8F7esfgBaBmPAkIiqRljZFyJ3UhS95SULUOwrgglGitHaKPCAgw5pcKgmDWC6VcJ+nCKdRsvojj1wPuyZ2vpuRQwUihLsT88wsIgGw2h6iY5Kk1vPag0I9YDXcZ4jhDQYG730TuBavDEB+k7DWcWPJVi+Ewtg9kIYfa8mCMyQU514xkKUawlRXjXhq18SqABSdeop2Cco5gqi6jqIiWAOBsE5ghlQa4U6eT1o5SQeGMMuhIy5JjAUOM1A2AQDgNYCqbMYmwQPChEMpUhFzFSefQMB5wgCncMeCMyQSJpBfK4iU9wqFPAxHweZhiHarDcMVeS+EBQRG8CpII7hwwbChs2fsrhTkmnOdUWhmJmhtBufbCGr5QiJAIZLTGrycr+kQm+Y5tdgj0npACu4KJgUWjKYqDWIIIXFz4UcTw1JjwkTmLDTI9J+kHCFDXK8QRfR+HSNi5EUpzTPDlFPL4JA2i-EoCS-eexAirSZG+b03psiHJys4RYfg-Q3mFm3TlVFiyitiXBCICRVkC1Uu+DYgZkIUrlfWYMOyshoI1ddScFkgKrnXGUbViz2QJGSehRkvhunvISJ4FYNdXxXk2gEO18sRqfRYJbWAw9ejajAPQN1kkDwpDcAapkRrNnYIyAsL2UMXz+DmApQcCjZbp38grWiStSakBTRDNNrg1quFhjXIN1jZjDO8JSplDYvY5DDBGo24ca2RzMo9Rcz17IT3piQBtJcDyNxDLkeISE0G8iCNkIWUMUU10wT4JCuMCmKM1aHfAtao4kHIBTKmBBaZzoXTMXwq13xLDpY+U6bz0lOG5gyZsORA1eyFMOsO1b5CXrMj4olwIn1snOAsZdaRhmstyf6IWKFOToRyPWEi75QOFnAxe8dD06ICqFSK7hCzJL7KpNamsOz0g+giBhg4W6hl+GIURTlL8B6QI3h-OD4qvaLC7DXc4OQjlYUw3hGuXhkgpGQ2kHj4C+Pr03uPJyP9Z5CfSMM0Tm0JMZChpfU6uFQh0kIjyJw9gVOr34xp-lgrKDCqE-SMM6N5JoN-QyS+b53A3j5AOZC-hOUhJKWE3gumXDvM+WGb52EliCmPXU4pDTSlyjBZRgxkKS43iRfm1FzLG7JKxeW7u4X0uRdVoSuOQnVirTwj4HZTI1htoZVh5llnkPnjwmF+p1CMv-jI851zVHblQuZCGV5qM-BbADgEBVK7lVXjPP2HwnKRAAHc8CMMHgEBdtA2BRbgscU8XJcjvpCCxkAA8sC0EPKhxCIR8LemQhkLB3QeBHd6IeJCCxzwXfsSRCk0RMBQAABYPbgmEKkyRzhdgvB9tB0QtswNoBD+DuhogQ7ABgSH0OxbRBmGm2s8PXtI5rFss7gOljA+u2WgoQA */
  context: {
    fipIds: ["fip@finrepo", "fip@finvugst"],
    currentFipIndex: 0,
    error: undefined,
    otp: "",
    handleId: "",
    mobileNumber: "",
    panNumber: "",
    accountLinkRefNumbers: "",
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
              actions: assign({ error: () => undefined }),
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

    "new state 1": {},
  },

  initial: "Sending Login Otp",
});
