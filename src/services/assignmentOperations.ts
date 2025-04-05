
import { AssignedChore, Household } from "../types";
import { getHousehold, saveHousehold } from "./storage";

// Assign a chore to a user
export const assignChore = (assignedChore: AssignedChore): Household => {
  const household = getHousehold();
  household.assignedChores.push(assignedChore);
  saveHousehold(household);
  return household;
};

// AI-based chore distribution algorithm (simplified version)
export const distributeChores = (): Household => {
  const household = getHousehold();
  const today = new Date();
  
  // Remove upcoming assigned chores
  household.assignedChores = household.assignedChores.filter(chore => {
    const isOld = chore.dueDate < today;
    const isCompleted = chore.completed;
    return isOld || isCompleted;
  });
  
  // Create assignments for the next 7 days
  household.chores.forEach((chore) => {
    // For each chore, create assignments based on frequency
    if (chore.frequency === "daily") {
      // Assign daily chores for each day
      for (let i = 0; i < 7; i++) {
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + i);
        
        // Find best user for this chore
        // In a real AI system, this would use preferences, history, and fairness
        let bestUserId = household.members[0].id;
        
        // Simple algorithm: assign to the user who has done the least chores
        let minChores = Infinity;
        household.members.forEach(user => {
          const userChores = household.assignedChores.filter(c => 
            c.userId === user.id && !c.completed
          ).length;
          
          if (userChores < minChores) {
            minChores = userChores;
            bestUserId = user.id;
          }
          
          // Consider preferences
          if (user.preferences.likedChores.includes(chore.id)) {
            bestUserId = user.id;
          }
        });
        
        // Create the assignment
        household.assignedChores.push({
          id: `assigned-${chore.id}-${Date.now()}-${i}`,
          choreId: chore.id,
          userId: bestUserId,
          dueDate: dueDate,
          completed: false,
        });
      }
    } else if (chore.frequency === "weekly") {
      // Assign weekly chores once in the week
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + (Math.floor(Math.random() * 6)));
      
      // Find best user for this chore
      let bestUserId = household.members[0].id;
      let minWeeklyChores = Infinity;
      
      household.members.forEach(user => {
        const userWeeklyChores = household.assignedChores.filter(c => 
          c.userId === user.id && 
          !c.completed && 
          household.chores.find(hc => hc.id === c.choreId)?.frequency === "weekly"
        ).length;
        
        if (userWeeklyChores < minWeeklyChores) {
          minWeeklyChores = userWeeklyChores;
          bestUserId = user.id;
        }
      });
      
      household.assignedChores.push({
        id: `assigned-${chore.id}-${Date.now()}`,
        choreId: chore.id,
        userId: bestUserId,
        dueDate: dueDate,
        completed: false,
      });
    }
  });
  
  saveHousehold(household);
  return household;
};
