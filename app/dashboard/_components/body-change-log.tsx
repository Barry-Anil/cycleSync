import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

interface BodyChanges {
  onComplete: () => void
  cycleEntryId?: any // Added to link with cycle entry
  session: any
}

export const BodyChangeLog = ({onComplete, cycleEntryId, session}: BodyChanges) => {
  const [skinCondition, setSkinCondition] = useState("");
  const [hairCondition, setHairCondition] = useState("");
  const [gutHealth, setGutHealth] = useState("");
  const [dietCravings, setDietCravings] = useState("");

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
  
      // Log the data we're about to send
      const bodyChangeData = {
        cycleEntryId,
        skinCondition: skinCondition || null,
        hairCondition: hairCondition || null,
        gutHealth: gutHealth || null,
        dietCravings: dietCravings || null,
      };
  
      console.log('Submitting body changes:', bodyChangeData);
  
      const response = await fetch('/api/body-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyChangeData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to submit body changes');
      }
  
      toast.success('Body changes saved successfully');
      onComplete();
    } catch (error) {
      console.error('Error submitting body changes:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save body changes');
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>🧬 Body Changes</CardTitle>
        <CardDescription>Log changes in your body condition</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>👩‍🦰 Skin Condition</Label>
          <Select onValueChange={setSkinCondition}>
            <SelectTrigger>
              <SelectValue placeholder="Select skin condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clear">Clear</SelectItem>
              <SelectItem value="dry">Dry</SelectItem>
              <SelectItem value="oily">Oily</SelectItem>
              <SelectItem value="breakout">Breaking Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>💇‍♀️ Hair Condition</Label>
          <Select onValueChange={setHairCondition}>
            <SelectTrigger>
              <SelectValue placeholder="Select hair condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="dry">Dry</SelectItem>
              <SelectItem value="oily">Oily</SelectItem>
              <SelectItem value="brittle">Brittle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>🦠 Gut Health</Label>
          <Select onValueChange={setGutHealth}>
            <SelectTrigger>
              <SelectValue placeholder="Select gut health" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bloated">Bloated</SelectItem>
              <SelectItem value="cramping">Cramping</SelectItem>
              <SelectItem value="nauseous">Nauseous</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>🍽️ Diet Cravings</Label>
          <Textarea 
            placeholder="Enter any food cravings"
            value={dietCravings}
            onChange={(e) => setDietCravings(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit}>Save and Continue</Button>
      </CardFooter>
      </Card>
    </>
  );
};