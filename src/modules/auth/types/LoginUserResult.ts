import { UserDoc } from "../../../shared/models";

export interface LoginUserResult {
  user: UserDoc;
  token: string;
}
