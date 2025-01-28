import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function decrypt(text: string, key: string, vector: string) {
  try {
    // Ensure text is a string
    const hexString = String(text);

    // Convert hex to Uint8Array
    const encryptedData = new Uint8Array(
      hexString.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    // Convert key and IV to Uint8Array
    const keyArray = new TextEncoder().encode(key);
    const vectorArray = new TextEncoder().encode(vector);

    // Import the key
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      keyArray,
      { name: "AES-CTR" },
      false,
      ["decrypt"]
    );

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-CTR",
        counter: vectorArray, // IV
        length: 64, // Counter length in bits
      },
      cryptoKey,
      encryptedData
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}
