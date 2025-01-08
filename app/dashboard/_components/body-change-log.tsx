import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export const BodyChangeLog = ({ onComplete }: { onComplete: () => void }) => {
  const [skinCondition, setSkinCondition] = useState("");
  const [hairCondition, setHairCondition] = useState("");
  const [gutHealth, setGutHealth] = useState("");
  const [dietCravings, setDietCravings] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/body-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          skinCondition,
          hairCondition,
          gutHealth,
          dietCravings,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit body changes');
      onComplete();
    } catch (error) {
      console.error('Error submitting body changes:', error);
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