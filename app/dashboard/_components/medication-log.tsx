"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export const MedicationLog = ({ onComplete }: { onComplete: () => void }) => {
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication("");
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medications,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit medication log');
      onComplete();
    } catch (error) {
      console.error('Error submitting medication log:', error);
    }
  };

  return (
    <>
      <Card>
      <CardHeader>
        <CardTitle>💊 Medication Log</CardTitle>
        <CardDescription>Log medications that may affect your menstrual cycle</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Add Medication</Label>
          <div className="flex gap-2">
            <Input
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              placeholder="Enter medication name"
            />
            <Button onClick={handleAddMedication} type="button">Add</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Current Medications</Label>
          <ul className="space-y-2">
            {medications.map((med, index) => (
              <li key={index} className="flex justify-between items-center bg-secondary p-2 rounded">
                <span>{med}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMedications(medications.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit}>Complete Log</Button>
      </CardFooter>
    </Card>
    </>
  );
};