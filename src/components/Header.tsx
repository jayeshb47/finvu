const Header = ({
  mobileNumber,
  fipName,
}: {
  mobileNumber: string;
  fipName?: string;
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Enter OTP {fipName ? "received from" : ""} {fipName}
      </h1>
      <p className="text-gray-600 mb-8 text-sm">
        6-digit code sent to{" "}
        <span className="font-bold">+91 {mobileNumber}</span> from{" "}
        <span className="font-bold">Finvu</span> to fetch your Stocks and Bonds
      </p>
    </div>
  );
};

export default Header;
