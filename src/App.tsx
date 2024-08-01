import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";

declare global {
  interface Window {
    finvuClient: {
      open: () => void;
      login: (handleID: string, userID: string, mobileNo: string) => Promise<any>;
      verifyOTP: (otp: string) => Promise<any>;
      logout: () => void;
    };
  }
}


function App() {
  const [otp, setOtp] = useState<string>('');

  useEffect(() => {
    window.finvuClient.open();
  }, []);
  const handleLogin = async () => {
    const userID = "9654106940@finvu";
    const mobileNo = "";
    const handleID = "2de38844-6f30-4fab-9105-80e9114bb525";

    try {
      
      const loginResponse = await window.finvuClient.login(handleID, userID, mobileNo);
      console.log({loginResponse});
      // handle login success
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const verifyResponse = await window.finvuClient.verifyOTP(otp);
      console.log(verifyResponse);
      // handle OTP verification success
    } catch (error) {
      console.error('OTP verification failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      const logoutResponse = await window.finvuClient.logout();
      console.log(logoutResponse);
      // handle logout success
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">WebSocket Demo Page</h1>
        <Button
          onClick={handleLogin}
          className="w-full "
        >
          Send Otp
        </Button>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border border-gray-300 rounded-lg py-2 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          onClick={handleVerifyOtp}
          className="w-full"
        >
          Verify OTP
        </Button>
        <Button
          onClick={handleLogout}
          className="w-full"
        >
          Logout
        </Button>
      </div>
    </div>
}

export default App;
