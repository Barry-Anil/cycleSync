"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface MedicationLog {
  onComplete: () => void
  cycleEntryId?: any // Added to link with cycle entry
  session: any
}

export const MedicationLog = ({ onComplete, cycleEntryId, session }: MedicationLog) => {
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication("");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!cycleEntryId) {
        toast.error("No cycle entry found. Please complete the daily log first.");
        return;
      }

      if (!session?.user?.email) {
        toast.error("You must be logged in to save entries");
        return;
      }

      if (medications.length === 0) {
        toast.error("Please add at least one medication before submitting");
        return;
      }

      setIsSubmitting(true);

      // Submit each medication individually
      const submissionPromises = medications.map(async (medicationName) => {
        const response = await fetch('/api/medications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cycleEntryId,
            name: medicationName,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || data.details || 'Failed to submit medication');
        }

        return response.json();
      });

      // Wait for all medications to be submitted
      await Promise.all(submissionPromises);
      
      toast.success("Medications logged successfully");
      onComplete();
    } catch (error) {
      console.error('Error submitting medications:', error);
      toast.error(error instanceof Error ? error.message : "Failed to save medications");
    } finally {
      setIsSubmitting(false);
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