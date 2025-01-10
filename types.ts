export interface CollectiveEntry {
    id: string;
    date: string;
    endDate: string;
    mood: string | null;
    energy: number | null;
    notes: string | null;
    bodyChanges: {
      skinCondition: string | null;
      hairCondition: string | null;
      gutHealth: string | null;
      dietCravings: string | null;
    } | null;
    bowelMovements: {
      frequency: number | null;
      consistency: string | null;
    } | null;
    cognitiveAssessment: {
      focus: string | null;
      memory: string | null;
    } | null;
    medications: {
      name: string;
    }[];
  }

  