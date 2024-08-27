import { setup } from "xstate";

export const machine = setup({
  types: {
    context: {} as { fipIds: unknown[]; currentFipIndex: number; error: null },
    events: {} as
      | { type: "SUBMIT_OTP" }
      | { type: "VERIFY_OTP" }
      | { type: "SENT_OTP" }
      | { type: "CONSENT_DONE" }
      | { type: "ERROR_OTP" }
      | { type: "NO_LINKED_ACCOUNTS" }
      | { type: "ERROR_SENDING_OTP" }
      | { type: "ERROR_CONSENT" },
  },
  actions: {
    incrementFipIndex: function ({ context }) {
      // Add your action code here
      // ...
      context.currentFipIndex += 1;
    },
  },
  guards: {
    fipArrEmpty: function ({ context }) {
      // Add your guard condition here
      console.log("jayeshhii");
      return context.currentFipIndex >= context.fipIds.length;
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDUwCcCWAzAngAgDEBJABVgDoBRAOwBd0Nqo8AbAeykbzdoAcBiCG2physWgEN65VJlyFSFGvUxNWHLj14BtAAwBdRKF5tYGWhmFGQAD0QB2ABwA2cgCZHARjcBWAMz2ACz2bgCcgYEANCA4iIFufuQ+uim6zj6enkGeAL450bLY+MRkVHQMauyc1Nx85BgQLGD8AMoAqgBCALJEACoA+gDyvSR6hkggJmYWVhN2CJ4+Pkmpur669qGefqHO0bEIEZ7kzutpbt4+Xj55BQzyJUrlqsxVmnWwAK4ARgC25hYmPxkJQAEpEAgATSGIzG1im5ks1Gs8wiy10i1OO0CzlCPmcWX2cUCx1OyXOl2utxAhQeijKKkYrw0NS0Yh+-1ogKg-DBoMGoJhowM8NMiNmoHmbl0iUCGJ8F1C9gxGOCRIQPjlSUWPlCjgybhCPns1NpxXpZoUJDwRAAIrBBMJROIpKJLY8ZPdzda7bA4RMETNkXNEABaezo5y6HEZez2XGOcLqzxpRzkEkBfxeKMeG75Gleq0Ud2kG328gAYwAFmAKwBrAByYBstAIGAE-uMYqDKMQ3jx5H1gXCoV8oT8fmj6t8rl0eplnkTjmCfkcflNhY9JZ95ertcbzdb7f42k84y70yRvYWsfI0dXgX8c42a-Vfgi5Anbm-QQ2oV0ibrvm27Fpupa+uQABuXqDHwBBsGgbYCEIIhiJI0ggZ6cjemWFDQdhsG8PBiHtp2kzdleIYLNsbjkE4o7-vYninEmMSIGEtEkhcOwBBs3j6hu2FFlhRRWrhUEwXBCFIWIYDUBAhGtJQDYDMMwrnuRl4SrYfZuOk7j4nOj6+MqPjqs4XifuOCqOPYk6eAxgmiVuYE7nhklEdJ7ayfJikNoM-QADJEA2ADSlC2v0ACCADCMWDG0KktGRgaUZKfbDmmXguBifiKtsZlsRqIQnHqzg4sqwQXI4Tl0qU27ifhRSEcRMkAO4SOYxGKe03R9EKKUUdp8yLDsn6LrqMp4kqjjmZZPE2XZGKOcBrmgUJJSNR5rXebAckKXwvKgvygotMptohQA4gNIoBkNwbpQgeK6HRFkuExGRKts6pBKEJwBI+tmhHigSrrV3rrc54Hlk1uAtV5vDsn8AJMsCYIQtCamDVpD06QsjgeIO74XIufjJNKURFRZxwLR4S0OWE4PCQ1EGwzg8MkYjXzI1yqN8gKN0aalw19gmSTxmsmz8f+exFfqiQqskxrMZsCRMx6AASEjyU0eAxcIe10PUjTNPFDZnSp-S2oMDaUNj4q41KjgvcxcoEvqpl4smc6JGc0a4u+yQ1atG30lrOtgHrBtybQxtNEdJ39GbFu9PbPZUSmNNXLoyvvpkSpuMmiriwBOJrHqoR5Pm1BsBAcDWCBoo49eobeArUYxlk8YV5TByt8cdmeI+eXJIEzsbG46v0soFTMtUtS8E3DvXm4veIGTiSZguy47Mqwd3KHpQzy86jz2yDRNEv6ePSE6oRLRlxrKDMr+CEzhT0fzxMqf7xcxyKNMCvmlPGfhvDkGBtVaMBMdhbDXoceI5BvDDgllGPU+p34hyhp-RklQWQL0rGwX4vAmj0CASLDUepPwZHxMxaqY9PB3y1LZZImQsR2ScB-SGdVcJkMdogIcr1HDvUWA5JifgfrLHjPqZiQih7pEnpguqXCcIQT3PWJsLYkK8OvCmccRN4iLjxAkRc9hkzOF9hZWMaxs6TjzAfLByixIQQkCwFgSFYD6yISQsA2iM6GlcDiAmgTcSFQOLvT8vg6a7CCFcfeBZD6OM2qzbaCNfGPX-LRKRwjPpiLvvqRBZUYxRlXDsThIluHJIIlJTmPkDqLzus3DOQ8srE0MQqUBtk5rHEAplY0LgyksxhikmpHUuoIUImkvGQ9oxWWcExKBeUIizSppZQCmoLIkzHiaRRENykqKGVUzyNTuacm5JMkauJXBeA2BZXiOI8pdMHOOXpTgMH2KUXspxBzmrVJkhWQhxCwCkIacvDOeoH7KiHs9YG3hzLGkQaDBUdlfAbzsfEhx5Bw4myjtQQ2tBzmIH8FQ52ucSSiMLkVYGf1RzOADiSaJaQylYt1vrXFMc44+JBdfKZuJ3B2U1OOEGI44EplsumPSIQybxjlLkHZwlmWR1ZXighXigWcovKCx6MZBxIN2DvScy5vajhWCkTO-sNhVxyEAA */
  context: {
    fipIds: ["fip@finrepo", "fip@finvugst"],
    currentFipIndex: 0,
    error: null,
  },
  id: "Verify FIPs",
  initial: "Entering login otp",
  states: {
    "Entering login otp": {
      initial: "idle",
      onDone: {
        target: "Verify FIP IDs",
      },
      states: {
        idle: {
          on: {
            SUBMIT_OTP: {
              target: "submitting",
            },
          },
        },

        submitting: {
          on: {
            VERIFY_OTP: {
              target: "complete",
            },

            ERROR_OTP: {
              target: "idle",
              reenter: true,
            },
          },
        },

        complete: {
          type: "final",
        },
      },
    },
    "Verify FIP IDs": {
      initial: "checkNextFip",
      onDone: {
        target: "Handle Consent",
      },
      states: {
        checkNextFip: {
          always: [
            {
              target: "allFipsComplete",
              guard: {
                type: "fipArrEmpty",
              },
            },
            {
              target: "verifyOtpForFip",
            },
          ],
        },
        allFipsComplete: {
          type: "final",
        },
        verifyOtpForFip: {
          initial: "sendOtp",
          onDone: {
            target: "checkNextFip",
          },
          states: {
            sendOtp: {
              on: {
                SENT_OTP: {
                  target: "waitForOtp",
                },

                NO_LINKED_ACCOUNTS: "complete",
                ERROR_SENDING_OTP: "sendOtp",
              },
            },
            waitForOtp: {
              on: {
                SUBMIT_OTP: {
                  target: "submitting",
                },
              },
            },
            submitting: {
              on: {
                VERIFY_OTP: {
                  target: "complete",
                },

                ERROR_OTP: "sendOtp",
              },
            },
            complete: {
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
      initial: "idle",
      states: {
        idle: {
          on: {
            CONSENT_DONE: {
              target: "complete",
            },

            ERROR_CONSENT: "idle",
          },
        },
        complete: {
          type: "final",
        },
      },
    },
  },
});
