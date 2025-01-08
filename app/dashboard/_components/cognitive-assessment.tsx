import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export const CognitiveAssessment = ({ onComplete }: { onComplete: () => void }) => {
  const [focus, setFocus] = useState("");
  const [memory, setMemory] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/cognitive-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          focus,
          memory,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit cognitive assessment');
      onComplete();
    } catch (error) {
      console.error('Error submitting cognitive assessment:', error);
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
