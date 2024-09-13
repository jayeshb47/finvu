import { ChevronRightIcon } from "lucide-react";

import { Button } from "./ui/button";

const Footer = () => {
  return (
    <div>
      {" "}
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
      <footer className="absolute bottom-0 p-5 bg-white">
        <div className="flex flex-col items-center justify-center">
          <img
            src="/assets/finvu.png"
            alt="Finvu Logo"
            className="w-20 h-10 mb-2 object-contain"
          />
          <p className="text-center text-xs text-gray-600 max-w-xs">
            Powered by Finvu
          </p>
          <p className="text-center text-xs text-gray-600 max-w-xs">
            "Finvu brand name of Cookiejar Technologies, a regulated and
            licensed RBI Account Aggregator"
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
