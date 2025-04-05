
import { Household } from "../types";
import { generateInitialHousehold } from "./mockData";

// Local storage keys
export const STORAGE_KEYS = {
  HOUSEHOLD: "chore-wizard-household",
};

// Get data from local storage or use mock data
export const getHousehold = (): Household => {
  const storedHousehold = localStorage.getItem(STORAGE_KEYS.HOUSEHOLD);
  if (storedHousehold) {
    const household = JSON.parse(storedHousehold) as Household;
    
    // Convert string dates back to Date objects
    household.assignedChores.forEach(chore => {
      chore.dueDate = new Date(chore.dueDate);
      if (chore.completedAt) {
        chore.completedAt = new Date(chore.completedAt);
      }
    });
    
    return household;
  }
  return generateInitialHousehold();
};

// Save household to local storage
export const saveHousehold = (household: Household): void => {
  localStorage.setItem(STORAGE_KEYS.HOUSEHOLD, JSON.stringify(household));
};
