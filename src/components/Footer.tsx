import { ChevronRightIcon } from "lucide-react";

import { Button } from "./ui/button";

const Footer = () => {
  return (
    <div>
      {" "}
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
  );
};

export default Footer;
