import { toast } from "sonner";

export const fetchCollectiveEntries = async (userId: number, setCycleEntries: (entries: any[]) => void) => {
    try {
      const response = await fetch(`/api/collective-entries?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      const entries = await response.json();
      setCycleEntries(entries);
    } catch (error) {
      console.error('Error fetching collective entries:', error);
      toast.error('Failed to refresh entries');
    }
  };