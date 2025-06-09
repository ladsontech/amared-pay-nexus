
import { Coins, Zap } from "lucide-react";

const SplashScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <Coins className="w-20 h-20 text-white" />
            <Zap className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4">Amared Pay</h1>
        <p className="text-xl opacity-90 mb-8">Bulk Payment System</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
