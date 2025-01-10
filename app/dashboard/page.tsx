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
import { Activity, Badge, Brain, CalendarDays, Circle, Heart, Pill } from "lucide-react"

interface BasicCycleEntry {
  id: string;
  userId: string;
  date: string;
  endDate: string;
  mood: string | null;
  energy: number | null;
  notes: string | null;
}
export interface BodyChange {
  id: string;
  cycleEntryId: string;
  skinCondition: string | null;
  hairCondition: string | null;
  gutHealth: string | null;
  dietCravings: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BowelMovement {
  id: string;
  cycleEntryId: string;
  frequency: number;       // how many times
  consistency: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CognitiveAssessment {
  id: string;
  cycleEntryId: string;
  focus: string | null;
  memory: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  cycleEntryId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectiveEntry {
  id: string;
  userId: string;
  date: string;         // e.g. '2025-01-10'
  endDate: string;      // or string | null
  mood: string | null;  // e.g. 'happy', 'sad', 'anxious', 'irritable', etc.
  energy: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  bodyChanges: BodyChange;
  bowelMovements: BowelMovement;
  cognitiveAssessment: CognitiveAssessment;
  medications: Medication;
}


interface DailyLogForm {
  mood: string;
  energy: number;
  notes: string;
}

interface RecentEntriesProps {
  entries: CollectiveEntry[];
}


const sections = [
  { id: "daily-log", title: "Daily Log", emoji: "📝" },
  { id: "body-changes", title: "Body Changes", emoji: "🧬" },
  { id: "bowel-movement", title: "Bowel Movement", emoji: "💩" },
  { id: "cognitive", title: "Cognitive Assessment", emoji: "🧠" },
  { id: "medication", title: "Medication Log", emoji: "💊" },
] as const




export default function Dashboard() {

  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(() => {
    const end = new Date()
    end.setDate(end.getDate() + 7)
    return end
  })
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentSection, setCurrentSection] = useState<typeof sections[number]["id"]>("daily-log")
  const [cycleEntries, setCycleEntries] = useState<CollectiveEntry[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [currentCycleData, setCurrentCycleData] = useState<CollectiveEntry | null>(null)


  const { register, handleSubmit, setValue, watch, reset } = useForm<DailyLogForm>({
    defaultValues: {
      mood: "",
      energy: 3,
      notes: ""
    }
  })



  const handleDateSelection = async (date: Date) => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const formattedDate = date.toISOString().split("T")[0];

      const response = await fetch(
        `/api/cycle-entries/date/${formattedDate}?userId=${userId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch cycle data: ${await response.text()}`);
      }

      const data = await response.json();

      if (!data || !data.date) {
        // No existing cycle entry for the selected date
        setStartDate(date);
        const newEndDate = new Date(date);
        newEndDate.setDate(date.getDate() + 7);
        setEndDate(newEndDate);
        setSelectedDate(date);
        setCurrentCycleData(null);
        setCycleEntries([]); // Clear entries when no data is found

        // Reset form
        reset({
          mood: "",
          energy: 3,
          notes: "",
        });
      } else if (data.date === formattedDate) {
        // Valid cycle entry exists for the exact selected date
        setStartDate(new Date(data.date));
        setEndDate(new Date(data.endDate));
        setSelectedDate(date);
        setCurrentCycleData(data);
        setCycleEntries(data); // Populate entries with current cycle data

        // Populate form with existing data
        reset({
          mood: data.mood || "",
          energy: data.energy || 3,
          notes: data.notes || "",
        });
      } else {
        // Handle any unexpected cases (if needed)
        toast.error("Unexpected response for the selected date");
        setCurrentCycleData(null);
        setCycleEntries([]);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process date selection"
      );
      setCycleEntries([]); // Clear entries on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user ID when session is available
  useEffect(() => {
    const fetchUserId = async () => {
      if (!session?.user?.email) return;
      try {
        const userResponse = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user information');
        const userData = await userResponse.json();
        setUserId(userData.id);
      } catch (error) {
        console.error('Error fetching user ID:', error);
        toast.error('Failed to load user information');
      }
    };
    fetchUserId();
  }, [session?.user?.email]);

  const RecentEntries: React.FC<RecentEntriesProps> = ({ entries }) => {
    if (!entries || entries.length === 0) {
      return (
        <div
          className="min-h-screen p-6 space-y-4 responsive-bg-size"
          style={{
            backgroundColor: "#ffd6e6",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' ... %3E%3C/svg%3E")`,
          }}
        >
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-pink-200">
              <div className="text-center py-8">
                <CalendarDays className="w-12 h-12 mx-auto text-pink-300 mb-4" />
                <h3 className="text-lg font-semibold text-pink-700 mb-2">
                  No Entries Found
                </h3>
                <p className="text-sm text-pink-600/70">
                  There are no entries for the selected date. Start tracking your
                  cycle by adding a new entry.
                </p>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div
        className="p-6 space-y-4 responsive-bg-size"
        style={{
          backgroundColor: "#ffd6e6",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' ... %3E%3C/svg%3E")`,
        }}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {entries.map((entry, i) => (
            /* The key goes on the top-level element we return in .map(...) */
            <Card
              key={i}
              className="p-6 bg-white/90 backdrop-blur-sm hover:shadow-md transition-shadow border-pink-200"
            >
              <div className="space-y-4">
                {/* Header Section */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-pink-700">
                      <CalendarDays className="inline-block w-4 h-4 mr-2" />
                      Start Date: {new Date(entry.date).toLocaleDateString()}
                    </h4>
                    <p className="text-sm text-pink-600/70">
                      <CalendarDays className="inline-block w-4 h-4 mr-2" />
                      End Date: {new Date(entry.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  {entry.mood && (
                    <span
                      className="text-2xl"
                      role="img"
                      aria-label={`Mood: ${entry.mood}`}
                    >
                      {entry.mood === "happy"
                        ? "😊"
                        : entry.mood === "sad"
                          ? "😢"
                          : entry.mood === "anxious"
                            ? "😰"
                            : entry.mood === "irritable"
                              ? "😠"
                              : "😐"}
                    </span>
                  )}
                </div>

                {/* Energy Level */}
                {entry.energy != null && (
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-pink-600" />
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        // It's safe to use `i` here because it's a short, fixed array
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${i < entry.energy! ? "bg-pink-500" : "bg-pink-100"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                  {/* Body Changes */}
                  {entry.bodyChanges && (
                    <div className="rounded-lg bg-pink-50/80 p-3 space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2 text-pink-700">
                        <Heart className="w-4 h-4 text-pink-600" />
                        Body Changes:
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div key={i} className="space-y-1">
                          {entry?.bodyChanges?.skinCondition && (
                            <div className="flex items-start gap-2">
                              <span className="text-pink-700">Skin:</span>
                              <span className="text-pink-600/70 capitalize">
                                {entry.bodyChanges.skinCondition}
                              </span>
                            </div>
                          )}
                          {entry.bodyChanges.hairCondition && (
                            <div className="flex items-start gap-2">
                              <span className="text-pink-700">Hair:</span>
                              <span className="text-pink-600/70 capitalize">
                                {entry.bodyChanges.hairCondition}
                              </span>
                            </div>
                          )}
                          {entry.bodyChanges.gutHealth && (
                            <div className="flex items-start gap-2">
                              <span className="text-pink-700">Gut Health:</span>
                              <span className="text-pink-600/70 capitalize">
                                {entry.bodyChanges.gutHealth}
                              </span>
                            </div>
                          )}
                          {entry.bodyChanges.dietCravings && (
                            <div className="flex items-start gap-2">
                              <span className="text-pink-700">Cravings:</span>
                              <span className="text-pink-600/70">
                                {entry.bodyChanges.dietCravings}
                              </span>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Bowel Movements */}
                  {entry.bowelMovements && (
                    <div className="rounded-lg bg-pink-50/80 p-3 space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2 text-pink-700">
                        <Circle className="w-4 h-4 text-pink-600" />
                        Bowel Movements:
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">

                        <div key={i} className="space-y-1">
                          <div className="flex items-start gap-2">
                            <span className="text-pink-700">Frequency:</span>
                            <span className="text-pink-600/70">
                              {entry?.bowelMovements.frequency} times
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-pink-700">Consistency:</span>
                            <span className="text-pink-600/70 capitalize">
                              {entry?.bowelMovements.consistency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cognitive Assessments */}
                  {entry.cognitiveAssessment && (
                    <div className="rounded-lg bg-pink-50/80 p-3 space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2 text-pink-700">
                        <Brain className="w-4 h-4 text-pink-600" />
                        Cognitive Assessment:
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div key={i} className="space-y-1">
                          <div className="flex items-start gap-2">
                            <span className="text-pink-700">Focus:</span>
                            <span className="text-pink-600/70 capitalize">
                              {entry?.cognitiveAssessment.focus}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-pink-700">Memory:</span>
                            <span className="text-pink-600/70 capitalize">
                              {entry?.cognitiveAssessment.memory}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {entry.medications && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2 text-pink-700">
                        <Pill className="w-4 h-4 text-pink-600" />
                        Medications:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          key={i}
                          className="bg-pink-100 text-pink-700 hover:bg-pink-200"
                        >
                          {entry.medications.name}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes Section */}
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
    );
  };


  // Fetch all entries on component mount
  useEffect(() => {
    const fetchEntries = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/collective-entries?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch entries');

        const entries = await response.json();
        setCycleEntries(entries);
      } catch (error) {
        console.error('Error fetching entries:', error);
        toast.error('Failed to load entries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [userId]);


  console.log(cycleEntries, "cycleEntries")

  const onSubmit = async (formData: DailyLogForm) => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    try {
      setIsLoading(true);

      const entryData = {
        userId,
        date: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString(),
        mood: formData.mood || null,
        energy: formData.energy || null,
        notes: formData.notes || null,
      };

      // Decide method and URL dynamically
      const method = currentCycleData ? "PUT" : "POST";
      const url = currentCycleData
        ? `/api/cycle-entries/${currentCycleData.id}`
        : "/api/cycle-entries";

      // Make the API call
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Failed to save entry: ${errorDetails}`);
      }

      const updatedData = await response.json();
      setCurrentCycleData(updatedData);

      // Fetch all entries to update the list
      const entriesResponse = await fetch(
        `/api/collective-entries?userId=${userId}`
      );
      if (entriesResponse.ok) {
        const entries = await entriesResponse.json();
        setCycleEntries(entries);
      } else {
        setCycleEntries([]); // Ensure it's an empty array if fetching fails
      }

      toast.success("Entry saved successfully");
      nextSection();
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save entry"
      );
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
        return <CognitiveAssessment onComplete={nextSection} cycleEntryId={latestEntryId} session={session} setCycleEntries={setCycleEntries} />;
      case "medication":
        return <MedicationLog onComplete={nextSection} cycleEntryId={latestEntryId} session={session} setCycleEntries={setCycleEntries} />;
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
                onSelect={(date: any) => date && handleDateSelection(date)}
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
