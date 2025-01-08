"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { BodyChangeLog } from "./_components/body-change-log"
import { BowelMovementLog } from "./_components/bowel-movement-log"
import { CognitiveAssessment } from "./_components/cognitive-assessment"
import { MedicationLog } from "./_components/medication-log"

interface CycleEntry {
  id: number
  userId: number
  date: string
  endDate: string
  mood: string | null
  energy: number | null
  notes: string | null
}

interface DailyLogForm {
  mood: string
  energy: number
  notes: string
}

const sections = [
  { id: "daily-log", title: "Daily Log", emoji: "📝" },
  { id: "body-changes", title: "Body Changes", emoji: "🧬" },
  { id: "bowel-movement", title: "Bowel Movement", emoji: "💩" },
  { id: "cognitive", title: "Cognitive Assessment", emoji: "🧠" },
  { id: "medication", title: "Medication Log", emoji: "💊" },
] as const

export default function Dashboard() {


  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() + 6)))
  const [currentSection, setCurrentSection] = useState<typeof sections[number]["id"]>("daily-log")
  const [cycleEntries, setCycleEntries] = useState<CycleEntry[]>([])

  const { register, handleSubmit, setValue, watch, reset } = useForm<DailyLogForm>({
    defaultValues: {
      mood: "",
      energy: 3,
      notes: ""
    }
  })


  const handleStartDateChange = (date: Date) => {
    setStartDate(date)
    setEndDate(new Date(new Date(date).setDate(date.getDate() + 6)))
  }

  const onSubmit = async (formData: DailyLogForm) => {

  }

  const nextSection = () => {
    const currentIndex = sections.findIndex(section => section.id === currentSection)
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1].id)
    }
  }

  const renderDailyLog = () => (
    <>
      <CardContent>
        <form id="dailyLogForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mood">Mood</Label>
            <Select onValueChange={(value) => setValue('mood', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="happy">😊 Happy</SelectItem>
                <SelectItem value="neutral">😐 Neutral</SelectItem>
                <SelectItem value="sad">😢 Sad</SelectItem>
                <SelectItem value="anxious">😰 Anxious</SelectItem>
                <SelectItem value="irritable">😠 Irritable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="energy">Energy Level (1-5)</Label>
            <Slider
              id="energy"
              min={1}
              max={5}
              step={1}
              value={[watch('energy')]}
              onValueChange={(value) => setValue('energy', value[0])}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional symptoms or notes"
              {...register('notes')}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          form="dailyLogForm"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save and Continue'}
        </Button>
      </CardFooter>
    </>
  );

  const renderSection = () => {
    switch (currentSection) {
      case "daily-log":
        return renderDailyLog();
      case "body-changes":
        return <BodyChangeLog onComplete={nextSection} />;
      case "bowel-movement":
        return <BowelMovementLog onComplete={nextSection} />;
      case "cognitive":
        return <CognitiveAssessment onComplete={nextSection} />;
      case "medication":
        return <MedicationLog onComplete={nextSection} />;
    }
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-primary">Menstrual Cycle Tracker</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>🗓️ Cycle Dates</CardTitle>
            <CardDescription>Select your cycle start and end dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date: any) => date && handleStartDateChange(date)}
                className="rounded-md border"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date (Calculated)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate.toISOString().split('T')[0]}
                disabled
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {sections.find(s => s.id === currentSection)?.emoji}{" "}
              {sections.find(s => s.id === currentSection)?.title}
            </CardTitle>
            <CardDescription>Track your daily health and symptoms</CardDescription>
          </CardHeader>
          <CardContent>
            <Breadcrumb>
              <BreadcrumbList>
                {sections.map((section, index) => (
                  <BreadcrumbItem key={section.id}>
                    {index > 0 && <BreadcrumbSeparator />}
                    {section.id === currentSection ? (
                      <BreadcrumbPage>{section.emoji} {section.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink onClick={() => setCurrentSection(section.id)}>
                        {section.emoji} {section.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </CardContent>
          {renderSection()}
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>📊 Recent Entries</CardTitle>
          <CardDescription>Your most recent cycle entries</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading entries...</div>
          ) : cycleEntries.length === 0 ? (
            <div className="text-center py-4">No entries yet</div>
          ) : (
            <ul className="space-y-2">
              {cycleEntries.slice(-5).reverse().map((entry) => (
                <li key={entry.id} className="bg-secondary p-4 rounded">
                  <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}</p>
                  <p><strong>Mood:</strong> {entry.mood || 'Not recorded'}</p>
                  <p><strong>Energy:</strong> {entry.energy || 'Not recorded'}</p>
                  {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
