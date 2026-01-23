import Cryptr from "cryptr";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is required");
}

const CRYPTR = new Cryptr(ENCRYPTION_KEY);

export const encrypt = (text: string) => {
  return CRYPTR.encrypt(text);
};

export const decrypt = (text: string) => {
  return CRYPTR.decrypt(text);
};
