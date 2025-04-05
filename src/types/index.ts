
export type User = {
  id: string;
  name: string;
  avatar?: string;
  preferences: {
    likedChores: string[];
    dislikedChores: string[];
  };
  stats: {
    completedChores: number;
    totalPoints: number;
    streak: number;
  };
};

export type Chore = {
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3; // 1: Easy, 2: Medium, 3: Hard
  frequency: 'daily' | 'weekly' | 'monthly';
  estimatedTime: number; // in minutes
  category: ChoreCategory;
  icon?: string;
};

export type ChoreCategory = 
  | 'kitchen'
  | 'bathroom'
  | 'livingRoom'
  | 'bedroom'
  | 'outdoor'
  | 'pets'
  | 'other';

export type AssignedChore = {
  id: string;
  choreId: string;
  userId: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
};

export type Household = {
  id: string;
  name: string;
  members: User[];
  chores: Chore[];
  assignedChores: AssignedChore[];
};
