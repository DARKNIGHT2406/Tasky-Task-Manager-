import crypto from 'crypto';

// Use a consistent key for the application. 
// In production, this should be in .env. 
// For this environment, we'll derive it from a hardcoded fallback or NEXTAUTH_SECRET if available.
const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'fallback-secret-key-must-be-32-chars-length!!';
// Ensure key validity for aes-256-cbc (32 bytes)
const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);

export function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
}

export function decrypt(text) {
    if (!text || !text.content || !text.iv) return '[Encrypted Message]';
    try {
        const iv = Buffer.from(text.iv, 'hex');
        const encryptedText = Buffer.from(text.content, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption failed:', error);
        return '[Decryption Failed]';
    }
}
