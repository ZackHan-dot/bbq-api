import { password_hash } from './bcrypt';

export async function makeNewPass(pass: string) {
  return await password_hash(pass);
}
