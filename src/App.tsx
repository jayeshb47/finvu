import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";

declare global {
  interface Window {
    finvuClient: {
      open: () => void;
      login: (handleID: string, userID: string, mobileNo: string) => Promise<any>;
      verifyOTP: (otp: string) => Promise<any>;
      logout: () => void;
      userLinkedAccounts: () => Promise<any>;
    };
  }
}


function App() {
  const [otp, setOtp] = useState<string>('');
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);

  useEffect(() => {
    window.finvuClient.open();
    console.log(window.finvuClient);
  }, []);
  const handleLogin = async () => {
    const userID = "9582111131@finvu";
    const mobileNo = "";
    const handleID = "9686b23c-8db8-4fd5-b31e-bc84fa4dda90";

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

  const handleFetchLinkedAccounts = async () => {
    try {
      const linkedAccountsResponse = await window.finvuClient.userLinkedAccounts();
      console.log(linkedAccountsResponse);
      setLinkedAccounts(linkedAccountsResponse.LinkedAccounts);
    } catch (error) {
      console.error('Failed to fetch linked accounts', error);
    }
  };

  return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 gap-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Finvu</h1>
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
        
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-4">
        <Button onClick={handleFetchLinkedAccounts} className="w-full">User Linked Accounts</Button>
        <ul>
          {/* {linkedAccounts.map((account, index) => (
            <li key={index} className="border-b border-gray-300 py-2">
              <div><strong>User ID:</strong> {account.userId}</div>
              <div><strong>FIP Name:</strong> {account.fipName}</div>
              <div><strong>Masked Account Number:</strong> {account.maskedAccNumber}</div>
              <div><strong>Account Type:</strong> {account.accType}</div>
            </li>
          ))} */}
        </ul>
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-4">
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
