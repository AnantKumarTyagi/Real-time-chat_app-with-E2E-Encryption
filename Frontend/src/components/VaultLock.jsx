import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {Eye, EyeOff, Lock, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const VaultLock = () => {
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);

  const [showPin, setShowPin] = useState(false);
  
  const { unlockDevice, hardResetVault } = useAuthStore();

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) return toast.error("PIN must be exactly 6 digits");
    await unlockDevice(pin);
  };

  const handleHardReset = async (e) => {
    e.preventDefault();
    if (newPin.length !== 6) return toast.error("New PIN must be exactly 6 digits");
   
    await hardResetVault(newPin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="max-w-md w-full bg-base-100 rounded-xl shadow-xl p-8 space-y-6">
        
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isResetMode ? 'bg-error/10' : 'bg-primary/10'}`}>
            {isResetMode ? <AlertTriangle className="w-8 h-8 text-error" /> : <Lock className="w-8 h-8 text-primary" />}
          </div>
          <h2 className="text-2xl font-bold">{isResetMode ? "Reset Vault" : "Encrypted Vault Locked"}</h2>
          <p className="text-base-content/60 mt-2">
            {isResetMode 
              ? "Create a new PIN. Old messages will be permanently deleted."
              : "Enter your 6-digit Secure PIN to unlock your chat history."}
          </p>
        </div>

        {!isResetMode ? (
          <form onSubmit={handleUnlock} className="space-y-4 animate-fadeIn">
            <div className="form-control">
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  name="vault-pin-unlock"
                  autoComplete="new-password"
                  data-1p-ignore
                  data-lpignore="true"
                  maxLength={6}
                  placeholder="••••••"
                  className="input input-bordered w-full text-center tracking-[1em] text-2xl font-mono pr-10 pl-10"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                />
                
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="w-5 h-5 text-base-content/40 hover:text-base-content/80 transition-colors" />
                  ) : (
                    <Eye className="w-5 h-5 text-base-content/40 hover:text-base-content/80 transition-colors" />
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={pin.length !== 6}>
              Unlock Device
            </button>
          </form>
        ) : (
          <form onSubmit={handleHardReset} className="space-y-4 animate-fadeIn">
             <div className="bg-error/10 text-error p-3 rounded-lg flex gap-2 text-sm text-left mb-4">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>Warning: This will overwrite your encryption keys. You will lose access to all previous chat history.</p>
                
              </div>
            <div className="form-control">
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                  name="vault-pin-reset"
                  autoComplete="new-password"
                  data-1p-ignore
                  data-lpignore="true"
                  maxLength={6}
                  placeholder="••••••"
                  className="input input-bordered w-full text-center tracking-[1em] text-2xl font-mono pr-10 pl-10"
                  value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
              <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="w-5 h-5 text-base-content/40 hover:text-base-content/80 transition-colors" />
                  ) : (
                    <Eye className="w-5 h-5 text-base-content/40 hover:text-base-content/80 transition-colors" />
                  )}
                </button>
            </div>
            </div>
            <button type="submit" className="btn btn-error w-full" disabled={newPin.length !== 6}>
              Confirm Hard Reset
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-base-300 text-center">
          {!isResetMode ? (
            <button 
              onClick={() => setIsResetMode(true)}
              className="text-sm text-base-content/60 hover:text-error transition-colors"
            >
              Forgot your PIN?
            </button>
          ) : (
            <button 
              onClick={() => setIsResetMode(false)}
              className="text-sm text-base-content/60 hover:text-primary transition-colors"
            >
              Cancel Reset
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default VaultLock;