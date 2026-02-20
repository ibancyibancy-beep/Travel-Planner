
export interface Activity {
  id: string;
  time: string;
  description: string;
  location?: string;
  cost?: number;
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

export interface Expense {
  id: string;
  category: 'Food' | 'Transport' | 'Accommodation' | 'Leisure' | 'Other';
  amount: number;
  description: string;
}

export interface DestinationInfo {
  name: string;
  country: string;
  description: string;
  popularAttractions: string[];
  estimatedBudget: {
    low: number;
    high: number;
    currency: string;
  };
  weatherInfo: string;
  suggestedActivities: string[];
  imageUrl?: string;
}

export interface Trip {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  itinerary: DayPlan[];
  expenses: Expense[];
  hotel?: {
    name: string;
    address: string;
    checkIn: string;
    checkOut: string;
  };
  transport?: {
    type: string;
    details: string;
  };
  notes: string;
  aiInsights?: DestinationInfo;
}

export type ViewState = 'landing' | 'explorer' | 'planner' | 'my-trips';
