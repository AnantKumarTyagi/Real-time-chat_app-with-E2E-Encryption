import { MessageSquare, Shield, Lock } from "lucide-react";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 relative overflow-hidden">
      
      
      <div className="absolute w-96 h-96 bg-primary/20 rounded-full blur-[100px] -top-20 -right-20 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-secondary/10 rounded-full blur-[100px] -bottom-20 -left-20 pointer-events-none" />

      <div className="max-w-md text-center z-10">
        
        
        <div className="relative w-64 h-64 mx-auto mb-12">
          
          
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div 
              className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 animate-bounce" 
              style={{ animationDuration: '3s' }}
            >
              <MessageSquare className="w-10 h-10 text-primary-content" />
            </div>
          </div>

          
          <div className="absolute top-4 left-4 w-16 h-16 bg-base-100 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
            <Shield className="w-8 h-8 text-success" />
          </div>

          
          <div 
            className="absolute bottom-6 right-2 w-14 h-14 bg-base-100 rounded-full flex items-center justify-center shadow-xl animate-bounce" 
            style={{ animationDuration: '4s', animationDelay: '1s' }}
          >
            <Lock className="w-6 h-6 text-warning" />
          </div>

          
          <div className="absolute inset-0 border-[3px] border-primary/20 rounded-full animate-[spin_12s_linear_infinite]" />
          <div className="absolute inset-6 border border-base-content/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute inset-12 border-2 border-dashed border-primary/30 rounded-full animate-[spin_20s_linear_infinite]" />
          
        </div>


        <h2 className="text-3xl font-bold mb-4 tracking-tight">{title}</h2>
        <p className="text-base-content/60 leading-relaxed text-lg">{subtitle}</p>
        
      </div>
    </div>
  );
};

export default AuthImagePattern;