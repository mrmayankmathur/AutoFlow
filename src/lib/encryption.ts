import Cryptr from "cryptr";

const CRYPTR = new Cryptr(process.env.ENCRYPTION_KEY!);

export const encrypt = (text: string) => {
  return CRYPTR.encrypt(text);
};

export const decrypt = (text: string) => {
  return CRYPTR.decrypt(text);
};
