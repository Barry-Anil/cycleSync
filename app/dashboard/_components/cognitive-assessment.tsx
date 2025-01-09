import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCollectiveEntries } from "@/lib/fetchCollectiveEntries";
import { useState } from "react";
import { toast } from "sonner";

interface CognitiveAssessment {
  onComplete: () => void
  cycleEntryId?: any // Added to link with cycle entry
  session: any
  setCycleEntries : (entries: any[]) => void;
}

export const CognitiveAssessment = ({ onComplete, cycleEntryId, session, setCycleEntries }: CognitiveAssessment) => {
  const [focus, setFocus] = useState("");
  const [memory, setMemory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!cycleEntryId) {
        toast.error('No cycle entry found. Please complete the daily log first.');
        return;
      }
  
      if (!session?.user?.email) {
        toast.error('You must be logged in to save entries');
        return;
      }
  
      setIsSubmitting(true);
  
      const assessmentData = {
        cycleEntryId,
        focus: focus || null,
        memory: memory || null,
      };
  
      const response = await fetch('/api/cognitive-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to submit cognitive assessment');
      }
  
      // Fetch user ID and update collective entries
      const userResponse = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`);
      const userData = await userResponse.json();
      await fetchCollectiveEntries(userData.id, setCycleEntries);
  
      toast.success('Cognitive assessment saved successfully');
      onComplete();
    } catch (error) {
      console.error('Error submitting cognitive assessment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save cognitive assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
     <Card>
      <CardHeader>
        <CardTitle>🧠 Cognitive Assessment</CardTitle>
        <CardDescription>Assess your cognitive abilities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>🎯 Focus Level</Label>
          <Select onValueChange={setFocus}>
            <SelectTrigger>
              <SelectValue placeholder="Select focus level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>🧠 Memory Function</Label>
          <Select onValueChange={setMemory}>
            <SelectTrigger>
              <SelectValue placeholder="Select memory function" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sharp">Sharp</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="forgetful">Forgetful</SelectItem>
              <SelectItem value="foggy">Brain Fog</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit}>Save and Continue</Button>
      </CardFooter>
      </Card>
    </>
  );
};
