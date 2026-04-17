import { useEffect, useState } from "react";
import { decryptImage } from "../lib/crypto";

const EncryptedImage = ({ url, iv, sharedKey }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAndDecrypt = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch encrypted image");
        
        const encryptedArrayBuffer = await response.arrayBuffer();

        const localUrl = await decryptImage(encryptedArrayBuffer, iv, sharedKey);
   
        setImgSrc(localUrl);
      } catch (err) {
        console.error("Image decryption failed", err);
        setError(true);
      }
    };

    if (url && iv && sharedKey) {
      fetchAndDecrypt();
    }
    
    return () => {
      if (imgSrc) URL.revokeObjectURL(imgSrc);
    };
  }, [url, iv, sharedKey]);

  if (error) {
    return <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20">🔒 [Encrypted Media Unreadable]</div>;
  }

  if (!imgSrc) {
    return <div className="skeleton w-[200px] h-[200px] rounded-xl"></div>;
  }

  return (
    <img
      src={imgSrc}
      alt="Decrypted Secure Media"
      className="sm:max-w-[200px] rounded-md mb-2 object-cover"
    />
  );
};

export default EncryptedImage;