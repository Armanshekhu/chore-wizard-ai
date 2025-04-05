
import { User, Household } from "../types";
import { getHousehold, saveHousehold } from "./storage";

// Add a user to the household
export const addUser = (user: User): Household => {
  const household = getHousehold();
  household.members.push(user);
  saveHousehold(household);
  return household;
};
