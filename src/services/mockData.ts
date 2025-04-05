
import { User, Chore, AssignedChore, Household } from "../types";

// Mock initial users
export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Arman Shekhu",
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
    name: "Harshita Rana",
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
    name: "Rakesh Devasi",
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
export const mockChores: Chore[] = [
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

// Generate initial household
export const generateInitialHousehold = (): Household => {
  return {
    id: "household1",
    name: "Our Home",
    members: mockUsers,
    chores: mockChores,
    assignedChores: generateAssignedChores(),
  };
};

// Generate assigned chores for the next 7 days
export const generateAssignedChores = (): AssignedChore[] => {
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
