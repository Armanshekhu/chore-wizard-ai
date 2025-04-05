
import { Chore, Household } from "../types";
import { getHousehold, saveHousehold } from "./storage";
import { getChorePoints } from "./utils";

// Add a chore to the household
export const addChore = (chore: Chore): Household => {
  const household = getHousehold();
  household.chores.push(chore);
  saveHousehold(household);
  return household;
};

// Mark a chore as completed
export const completeChore = (choreId: string): Household => {
  const household = getHousehold();
  const chore = household.assignedChores.find(c => c.id === choreId);
  
  if (chore) {
    chore.completed = true;
    chore.completedAt = new Date();
    
    // Update user stats
    const user = household.members.find(u => u.id === chore.userId);
    if (user) {
      user.stats.completedChores += 1;
      user.stats.totalPoints += getChorePoints(household.chores.find(c => c.id === chore.choreId)?.difficulty || 1);
      user.stats.streak += 1;
    }
  }
  
  saveHousehold(household);
  return household;
};
