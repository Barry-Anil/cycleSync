"use client"

import React, { useState, useEffect } from "react"
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
import { useSession } from "next-auth/react"
import { Activity, Badge, Brain, CalendarDays, Pill } from "lucide-react"

interface BasicCycleEntry {
  id: string;
  userId: string;
  date: string;
  endDate: string;
  mood: string | null;
  energy: number | null;
  notes: string | null;
}

interface CollectiveEntry extends BasicCycleEntry {
  bodyChanges: {
    skinCondition: string | null;
    hairCondition: string | null;
    gutHealth: string | null;
    dietCravings: string | null;
  } | null;
  bowelMovements: {
    frequency: number | null;
    consistency: string | null;
  } | null;
  cognitiveAssessment: {
    focus: string | null;
    memory: string | null;
  } | null;
  medications: {
    name: string;
  }[];
}

interface DailyLogForm {
  mood: string;
  energy: number;
  notes: string;
}

const sections = [
  { id: "daily-log", title: "Daily Log", emoji: "📝" },
  { id: "body-changes", title: "Body Changes", emoji: "🧬" },
  { id: "bowel-movement", title: "Bowel Movement", emoji: "💩" },
  { id: "cognitive", title: "Cognitive Assessment", emoji: "🧠" },
  { id: "medication", title: "Medication Log", emoji: "💊" },
] as const

const RecentEntries = ({ entries }: { entries: CollectiveEntry[] }) => {
  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-secondary p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">
                {new Date(entry.date).toLocaleDateString()}
              </h4>
              <p className="text-sm text-muted-foreground">
                End Date: {new Date(entry.endDate).toLocaleDateString()}
              </p>
            </div>
            {entry.mood && (
              <span className="text-lg">
                {entry.mood === 'happy' ? '😊' : 
                 entry.mood === 'sad' ? '😢' :
                 entry.mood === 'anxious' ? '😰' :
                 entry.mood === 'irritable' ? '😠' : '😐'}
              </span>
            )}
          </div>

          {entry.energy && (
            <div>
              <p className="text-sm font-medium">Energy Level: {entry.energy}/5</p>
            </div>
          )}

          {entry.bodyChanges && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Body Changes:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {entry.bodyChanges.skinCondition && (
                  <p>Skin: {entry.bodyChanges.skinCondition}</p>
                )}
                {entry.bodyChanges.hairCondition && (
                  <p>Hair: {entry.bodyChanges.hairCondition}</p>
                )}
                {entry.bodyChanges.gutHealth && (
                  <p>Gut Health: {entry.bodyChanges.gutHealth}</p>
                )}
                {entry.bodyChanges.dietCravings && (
                  <p>Cravings: {entry.bodyChanges.dietCravings}</p>
                )}
              </div>
            </div>
          )}

          {entry.bowelMovements && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Bowel Movements:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Frequency: {entry.bowelMovements.frequency}x/day</p>
                <p>Consistency: {entry.bowelMovements.consistency}</p>
              </div>
            </div>
          )}

          {entry.cognitiveAssessment && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Cognitive Assessment:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Focus: {entry.cognitiveAssessment.focus}</p>
                <p>Memory: {entry.cognitiveAssessment.memory}</p>
              </div>
            </div>
          )}

          {entry.medications && entry.medications.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Medications:</p>
              <div className="flex flex-wrap gap-2">
                {entry.medications.map((med, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                  >
                    {med.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.notes && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Notes:</p>
              <p className="text-sm">{entry.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


export default function Dashboard() {

  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() + 6)))
  const [currentSection, setCurrentSection] = useState<typeof sections[number]["id"]>("daily-log")
  const [cycleEntries, setCycleEntries] = useState<CollectiveEntry[]>([])
  const [userId, setUserId] = useState<number | null>(null)
  

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

  useEffect(() => {
    const fetchUserId = async () => {
      if (!session?.user?.email) return;
      
      try {
        const userResponse = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user information');
        }
        const userData = await userResponse.json();
        setUserId(userData.id);
      } catch (error) {
        console.error('Error fetching user ID:', error);
        toast.error('Failed to load user information');
      }
    };

    fetchUserId();
  }, [session?.user?.email]);

 const RecentEntries = ({ entries }: { entries: CollectiveEntry[] }) => {
    return (
      <div 
        className="min-h-screen p-6 space-y-4 responsive-bg-size"
        style={{
          backgroundColor: '#ffd6e6',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 20c0 5.523-4.477 10-10 10S-5 25.523-5 20 -0.523 10 5 10s10 4.477 10 10zm70 0c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zM15 90c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zm70 0c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zM35 50c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zm30 0c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zM35 20c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zm30 0c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zM35 90c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zm30 0c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10z' fill='%23ff9ec3' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {entries.map((entry) => (
            <Card 
              key={entry.id} 
              className="p-6 bg-white/90 backdrop-blur-sm hover:shadow-md transition-shadow border-pink-200"
            >
              <div className="space-y-4">
                {/* Header with Date and Mood */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-pink-700">
                      <CalendarDays className="inline-block w-4 h-4 mr-2" />
                      Start Date:{new Date(entry.date).toLocaleDateString()}
                    </h4>
                    <p className="text-sm text-pink-600/70">
                    <CalendarDays className="inline-block w-4 h-4 mr-2" />
                      End Date: {new Date(entry.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  {entry.mood && (
                    <span className="text-2xl" role="img" aria-label={`Mood: ${entry.mood}`}>
                      {entry.mood === 'happy' ? '😊' : 
                       entry.mood === 'sad' ? '😢' :
                       entry.mood === 'anxious' ? '😰' :
                       entry.mood === 'irritable' ? '😠' : '😐'}
                    </span>
                  )}
                </div>
  
                {/* Energy Level */}
                {entry.energy && (
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-pink-600" />
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${
                            i < entry.energy! ? 'bg-pink-500' : 'bg-pink-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
  
                {/* Body Changes */}
                {entry.bodyChanges && (
                  <div className="rounded-lg bg-pink-50/80 p-3 space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2 text-pink-700">
                      <Brain className="w-4 h-4 text-pink-600" />
                      Body Changes:
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(entry.bodyChanges).map(([key, value]) => (
                        value && (
                          <div key={key} className="flex items-start gap-2">
                            <span className="capitalize text-pink-700">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="text-pink-600/70">{value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
  
                {/* Medications */}
                {entry.medications && entry.medications.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2 text-pink-700">
                      <Pill className="w-4 h-4 text-pink-600" />
                      Medications:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {entry.medications.map((med, index) => (
                        <Badge 
                          key={index} 
                          className="bg-pink-100 text-pink-700 hover:bg-pink-200"
                        >
                          {med.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
  
                {/* Notes */}
                {entry.notes && (
                  <div className="border-t border-pink-100 pt-3 mt-3">
                    <p className="text-sm whitespace-pre-wrap text-pink-600/70">
                      {entry.notes}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }



  // Add this useEffect to fetch entries when the component mounts
  useEffect(() => {
    const fetchEntries = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/collective-entries?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch entries');
        }

        const entries = await response.json();

        if (!Array.isArray(entries)) {
          throw new Error('Entries response is not an array');
        }

        // Transform the entries to ensure they match the CollectiveEntry interface
        const collectedEntries: CollectiveEntry[] = entries.map(entry => ({
          id: entry.id,
          userId: entry.userId,
          date: entry.date,
          endDate: entry.endDate,
          mood: entry.mood,
          energy: entry.energy,
          notes: entry.notes,
          bodyChanges: entry.bodyChanges || null,
          bowelMovements: entry.bowelMovements || null,
          cognitiveAssessment: entry.cognitiveAssessment || null,
          medications: entry.medications || []
        }));

        setCycleEntries(collectedEntries);

        if (collectedEntries.length === 0) {
          toast("No entries found yet. Start by adding your first entry!");
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
        toast.error('Failed to load entries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [userId]);

  console.log(cycleEntries[0]?.id, "cycleEntries")

  const onSubmit = async (formData: DailyLogForm) => {
    try {
      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      setIsLoading(true);

      const entryData = {
        userId,
        date: startDate.toISOString(),
        endDate: endDate.toISOString(),
        mood: formData.mood || null,
        energy: formData.energy || null,
        notes: formData.notes || null,
      };

      const response = await fetch('/api/cycle-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Failed to save entry');
      }

      // Fetch the updated collective entries after saving
      const updatedEntriesResponse = await fetch(`/api/collective-entries?userId=${userId}`);
      if (!updatedEntriesResponse.ok) {
        throw new Error('Failed to fetch updated entries');
      }
      const updatedEntries = await updatedEntriesResponse.json();
      setCycleEntries(updatedEntries);

      toast.success('Entry saved successfully');
      nextSection();

    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save entry');
    } finally {
      setIsLoading(false);
    }
  };

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
    const latestEntryId = cycleEntries[0]?.id;
    
    switch (currentSection) {
      case "daily-log":
        return renderDailyLog();
      case "body-changes":
        return <BodyChangeLog onComplete={nextSection} cycleEntryId={latestEntryId} session={session} setCycleEntries={setCycleEntries} />;
      case "bowel-movement":
        return <BowelMovementLog onComplete={nextSection} cycleEntryId={latestEntryId} session={session} setCycleEntries={setCycleEntries} />
      case "cognitive":
        return <CognitiveAssessment onComplete={nextSection} cycleEntryId={latestEntryId} session={session}  setCycleEntries={setCycleEntries}/>;
      case "medication":
        return <MedicationLog onComplete={nextSection} cycleEntryId={latestEntryId} session={session}  setCycleEntries={setCycleEntries} />;
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
                  <React.Fragment key={section.id}>
                    {index > 0 && <BreadcrumbSeparator />} {/* Separator between items */}
                    <BreadcrumbItem>
                      {section.id === currentSection ? (
                        <BreadcrumbPage>
                          {section.emoji} {section.title}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink onClick={() => setCurrentSection(section.id)}>
                          {section.emoji} {section.title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
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
          <CardDescription>Your comprehensive cycle tracking history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading entries...</div>
          ) : !Array.isArray(cycleEntries) || cycleEntries.length === 0 ? (
            <div className="text-center py-4">No entries yet</div>
          ) : (
            <RecentEntries entries={cycleEntries} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
