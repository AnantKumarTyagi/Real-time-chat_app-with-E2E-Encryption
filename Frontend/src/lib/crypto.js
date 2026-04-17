export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return window.btoa(binary);
}

export function base64ToBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  
  return bytes.buffer;
}

export async function generateKeyPair() {
  return await window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );
}

export async function exportPublicKey(publicKey) {
  return await window.crypto.subtle.exportKey("jwk", publicKey);
}

export async function importPublicKey(jwk) {
  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
}

export async function deriveSharedKey(privateKey, publicKeyJwk) {
  const importedPublicKey = await importPublicKey(publicKeyJwk);
  return await window.crypto.subtle.deriveKey(
    { name: "ECDH", public: importedPublicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessage(text, sharedKey) {
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    sharedKey,
    encodedText
  );

  return {
    encryptedText: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
  };
}

export async function decryptMessage(encryptedBase64, ivBase64, sharedKey) {
  const encryptedBuffer = base64ToBuffer(encryptedBase64);
  const ivBuffer = base64ToBuffer(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuffer },
    sharedKey,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

async function deriveWrappingKey(pin, saltBuffer) {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000, 
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["wrapKey", "unwrapKey"]
  );
}

export async function wrapKeyWithPin(privateKey, pin) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const wrappingKey = await deriveWrappingKey(pin, salt);

  const wrappedKeyBuffer = await window.crypto.subtle.wrapKey(
    "jwk", 
    privateKey,
    wrappingKey,
    { name: "AES-GCM", iv: iv }
  );

  return {
    wrappedBlob: bufferToBase64(wrappedKeyBuffer),
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv)
  };
}


export async function unwrapKeyWithPin(wrappedBlobBase64, pin, saltBase64, ivBase64) {
  const wrappedBuffer = base64ToBuffer(wrappedBlobBase64);
  const salt = base64ToBuffer(saltBase64);
  const iv = base64ToBuffer(ivBase64);

  const wrappingKey = await deriveWrappingKey(pin, salt);

  return await window.crypto.subtle.unwrapKey(
    "jwk",
    wrappedBuffer,
    wrappingKey,
    { name: "AES-GCM", iv: iv },
    { name: "ECDH", namedCurve: "P-256" },
    true, 
    ["deriveKey", "deriveBits"]
  );
}



export async function encryptImage(fileBlob, sharedKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const arrayBuffer = await fileBlob.arrayBuffer();

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    sharedKey,
    arrayBuffer
  );

  return {
   
    encryptedBase64: bufferToBase64(encryptedBuffer),
    ivBase64: bufferToBase64(iv)
  };
}

export async function decryptImage(encryptedArrayBuffer, ivBase64, sharedKey) {
  const iv = base64ToBuffer(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    sharedKey,
    encryptedArrayBuffer
  );


  const blob = new Blob([decryptedBuffer], { type: "image/jpeg" });
  return URL.createObjectURL(blob);
}