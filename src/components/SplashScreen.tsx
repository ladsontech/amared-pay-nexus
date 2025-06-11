
const SplashScreen = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center text-primary">
        <div className="flex items-center justify-center mb-8">
          <img 
            src="/images/Almaredpay_logo.png" 
            alt="Amared Pay Logo" 
            className="w-32 h-16 sm:w-40 sm:h-20 md:w-48 md:h-24 lg:w-56 lg:h-28 object-contain"
          />
        </div>
        <p className="text-lg sm:text-xl opacity-90 mb-8">Secure Bulk Payment System</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
