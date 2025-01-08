import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";

export const BowelMovementLog = ({ onComplete }: { onComplete: () => void }) => {
  const [frequency, setFrequency] = useState<number>(0);
  const [consistency, setConsistency] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/bowel-movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frequency,
          consistency,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit bowel movement log');
      onComplete();
    } catch (error) {
      console.error('Error submitting bowel movement log:', error);
    }
  };

  return (
    <>
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
                  {num} times
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
        <Button onClick={handleSubmit}>Save and Continue</Button>
      </CardFooter>
      </Card>
    </>
  );
};