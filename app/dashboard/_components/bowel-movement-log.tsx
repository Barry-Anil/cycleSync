import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label" // Fixed import
import { useState } from "react"
import { useSession } from "next-auth/react" // Added for user authentication
import { toast } from "sonner" // For error notifications
import { fetchCollectiveEntries } from "@/lib/fetchCollectiveEntries"

interface BowelMovementLogProps {
  onComplete: () => void
  cycleEntryId?: any // Added to link with cycle entry
  session: any
  setCycleEntries : (entries: any[]) => void;
}

export const BowelMovementLog = ({ onComplete, cycleEntryId, session, setCycleEntries }: BowelMovementLogProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [frequency, setFrequency] = useState<number>(0)
  const [consistency, setConsistency] = useState("")

  console.log(session, "session bowel moment")

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      toast.error("You must be logged in to save entries");
      return;
    }
    setIsLoading(true);
  
    try {
      const userResponse = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user information');
      }
      const userData = await userResponse.json();
  
      const payload = {
        userId: userData.id,
        cycleEntryId,
        frequency,
        consistency,
      };
  
      const response = await fetch('/api/bowel-movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit bowel movement log');
      }
  
      await fetchCollectiveEntries(userData.id, setCycleEntries);
      
      toast.success('Bowel movement log saved successfully');
      onComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save bowel movement log');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>💩 Bowel Movement Log</CardTitle>
        <CardDescription>Record your bowel movement frequency and consistency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>🕒 Frequency (per day)</Label>
          <Select onValueChange={(value) => setFrequency(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} time{num !== 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>💧 Consistency</Label>
          <Select onValueChange={setConsistency}>
            <SelectTrigger>
              <SelectValue placeholder="Select consistency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
              <SelectItem value="loose">Loose</SelectItem>
              <SelectItem value="watery">Watery</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save and Continue'}
        </Button>
      </CardFooter>
    </Card>
  )
}