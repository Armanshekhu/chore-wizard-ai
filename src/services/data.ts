
import { Chore, ChoreCategory, User, AssignedChore, Household } from "../types";

// Mock initial users
const mockUsers: User[] = [
  {
    id: "user1",
    name: "Alex Johnson",
    avatar: "https://i.pravatar.cc/150?u=alex",
    preferences: {
      likedChores: ["dishes", "laundry"],
      dislikedChores: ["vacuum", "bathroom"],
    },
    stats: {
      completedChores: 15,
      totalPoints: 145,
      streak: 3,
    },
  },
  {
    id: "user2",
    name: "Sam Taylor",
    avatar: "https://i.pravatar.cc/150?u=sam",
    preferences: {
      likedChores: ["vacuum", "pets"],
      dislikedChores: ["dishes", "bathroom"],
    },
    stats: {
      completedChores: 12,
      totalPoints: 120,
      streak: 2,
    },
  },
  {
    id: "user3",
    name: "Jordan Lee",
    avatar: "https://i.pravatar.cc/150?u=jordan",
    preferences: {
      likedChores: ["bathroom", "outdoor"],
      dislikedChores: ["kitchen", "laundry"],
    },
    stats: {
      completedChores: 18,
      totalPoints: 180,
      streak: 5,
    },
  },
];

// Mock initial chores
const mockChores: Chore[] = [
  {
    id: "chore1",
    name: "Wash dishes",
    description: "Clean all dishes and load/unload dishwasher",
    difficulty: 1,
    frequency: "daily",
    estimatedTime: 20,
    category: "kitchen",
    icon: "utensils",
  },
  {
    id: "chore2",
    name: "Vacuum living room",
    description: "Vacuum the carpet and clean under furniture",
    difficulty: 2,
    frequency: "weekly",
    estimatedTime: 30,
    category: "livingRoom",
    icon: "vacuum",
  },
  {
    id: "chore3",
    name: "Clean bathroom",
    description: "Clean toilet, shower, sink and mirror",
    difficulty: 3,
    frequency: "weekly",
    estimatedTime: 45,
    category: "bathroom",
    icon: "bath",
  },
  {
    id: "chore4",
    name: "Do laundry",
    description: "Wash, dry, fold and put away clothes",
    difficulty: 2,
    frequency: "weekly",
    estimatedTime: 60,
    category: "bedroom",
    icon: "shirt",
  },
  {
    id: "chore5",
    name: "Take out trash",
    description: "Collect trash from all rooms and take to bin",
    difficulty: 1,
    frequency: "daily",
    estimatedTime: 10,
    category: "other",
    icon: "trash",
  },
  {
    id: "chore6",
    name: "Mow lawn",
    description: "Cut grass and edge the lawn",
    difficulty: 3,
    frequency: "weekly",
    estimatedTime: 60,
    category: "outdoor",
    icon: "trees",
  },
  {
    id: "chore7",
    name: "Feed pets",
    description: "Feed all pets and fill water bowls",
    difficulty: 1,
    frequency: "daily",
    estimatedTime: 10,
    category: "pets",
    icon: "pawprint",
  },
];

// Generate assigned chores for the next 7 days
const generateAssignedChores = (): AssignedChore[] => {
  const assignedChores: AssignedChore[] = [];
  const today = new Date();

  mockChores.forEach((chore) => {
    // For each chore, create assignments based on frequency
    if (chore.frequency === "daily") {
      // Assign daily chores for each day
      for (let i = 0; i < 7; i++) {
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + i);

        // Simple round-robin assignment
        const userIndex = i % mockUsers.length;
        assignedChores.push({
          id: `assigned-${chore.id}-${i}`,
          choreId: chore.id,
          userId: mockUsers[userIndex].id,
          dueDate: dueDate,
          completed: i < 2, // First two days are completed
          completedAt: i < 2 ? new Date(dueDate.getTime() - 1000 * 60 * 60 * 2) : undefined,
        });
      }
    } else if (chore.frequency === "weekly") {
      // Assign weekly chores once in the week
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + (Math.floor(Math.random() * 6)));

      // Random assignment
      const userIndex = Math.floor(Math.random() * mockUsers.length);
      assignedChores.push({
        id: `assigned-${chore.id}-week`,
        choreId: chore.id,
        userId: mockUsers[userIndex].id,
        dueDate: dueDate,
        completed: false,
      });
    }
  });

  return assignedChores;
};

// Initial mock household
const mockHousehold: Household = {
  id: "household1",
  name: "Our Home",
  members: mockUsers,
  chores: mockChores,
  assignedChores: generateAssignedChores(),
};

// Local storage keys
const STORAGE_KEYS = {
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
  return mockHousehold;
};

// Save household to local storage
export const saveHousehold = (household: Household): void => {
  localStorage.setItem(STORAGE_KEYS.HOUSEHOLD, JSON.stringify(household));
};

// Add a user to the household
export const addUser = (user: User): Household => {
  const household = getHousehold();
  household.members.push(user);
  saveHousehold(household);
  return household;
};

// Add a chore to the household
export const addChore = (chore: Chore): Household => {
  const household = getHousehold();
  household.chores.push(chore);
  saveHousehold(household);
  return household;
};

// Assign a chore to a user
export const assignChore = (assignedChore: AssignedChore): Household => {
  const household = getHousehold();
  household.assignedChores.push(assignedChore);
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

// Get points based on chore difficulty
export const getChorePoints = (difficulty: number): number => {
  return difficulty * 10;
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
