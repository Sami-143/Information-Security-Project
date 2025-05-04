// utils/crypto.js
export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["sign", "verify"]
    );
    return keyPair;
}

export async function signData(privateKey, dataBuffer) {
    const signature = await window.crypto.subtle.sign(
        {
            name: "RSASSA-PKCS1-v1_5",
        },
        privateKey,
        dataBuffer
    );
    return signature;
}

export async function exportPublicKey(key) {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    return exported;
}

export async function hashBuffer(buffer) {
    return await window.crypto.subtle.digest("SHA-256", buffer);
}

export function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes));
}

export async function importPublicKey(pem) {
    if (typeof pem !== "string") {
        throw new Error("Public key PEM must be a string");
    }
    
    const raw = window.atob(pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n/g, ""));
    const binary = new Uint8Array([...raw].map(c => c.charCodeAt(0)));

    return await window.crypto.subtle.importKey(
        "spki",
        binary.buffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        false,
        ["encrypt"]
    );
}

export async function encryptWithPublicKey(dataBuffer, publicKey) {
    return await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        dataBuffer
    );
}