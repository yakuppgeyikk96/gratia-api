import { UserDoc } from "../../../shared/models";

export interface RegisterUserResult {
  user: UserDoc;
  token: string;
}
