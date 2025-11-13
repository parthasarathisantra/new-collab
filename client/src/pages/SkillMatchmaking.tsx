import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TeammateSuggestionCard } from "@/components/TeammateSuggestionCard";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Search, Plus, X, Users } from "lucide-react";
import type { TeammateMatch } from "@shared/schema";

export default function SkillMatchmaking() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [projectIdea, setProjectIdea] = useState("");
  const [matches, setMatches] = useState<TeammateMatch[]>([]);
  const [searching, setSearching] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleFindTeammates = async () => {
    if (skills.length === 0) {
      toast({
        title: "Add some skills",
        description: "Please add at least one skill to find teammates",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);

    // Mock teammate matching (will be replaced with real API call)
    setTimeout(() => {
      const mockMatches: TeammateMatch[] = [
        {
          user: {
            id: "user1",
            username: "Sarah Chen",
            email: "sarah@example.com",
            firebaseUid: "uid1",
            skills: ["React", "TypeScript", "Node.js"],
            interests: ["Web Development", "AI"],
            xp: 450,
            level: 5,
            createdAt: new Date(),
          },
          matchPercentage: 92,
          matchingSkills: skills.slice(0, 3),
        },
        {
          user: {
            id: "user2",
            username: "Alex Kumar",
            email: "alex@example.com",
            firebaseUid: "uid2",
            skills: ["Python", "Machine Learning", "Data Science"],
            interests: ["AI", "Research"],
            xp: 680,
            level: 7,
            createdAt: new Date(),
          },
          matchPercentage: 85,
          matchingSkills: skills.slice(0, 2),
        },
        {
          user: {
            id: "user3",
            username: "Jordan Lee",
            email: "jordan@example.com",
            firebaseUid: "uid3",
            skills: ["UI/UX Design", "Figma", "React"],
            interests: ["Design", "Frontend"],
            xp: 320,
            level: 4,
            createdAt: new Date(),
          },
          matchPercentage: 78,
          matchingSkills: skills.slice(0, 1),
        },
      ];

      setMatches(mockMatches);
      setSearching(false);
      
      toast({
        title: "Found teammates!",
        description: `Discovered ${mockMatches.length} potential collaborators`,
      });
    }, 1500);
  };

  const handleConnect = (userId: string) => {
    toast({
      title: "Connection request sent",
      description: "You'll be notified when they respond",
    });
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-chart-1 to-chart-3 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Find Your Perfect Team</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Connect with talented collaborators who share your passion and complement your skills
          </p>
        </motion.div>

        {/* Input Form */}
        <Card className="p-8 mb-12">
          <div className="space-y-6">
            {/* Skills */}
            <div className="space-y-3">
              <Label>Your Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., React, Python, UI Design"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  data-testid="input-skill"
                />
                <Button type="button" onClick={addSkill} data-testid="button-add-skill">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="gap-1" data-testid={`badge-skill-${i}`}>
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover-elevate rounded-full">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <Label>Your Interests</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Web Development, AI, Game Design"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                  data-testid="input-interest"
                />
                <Button type="button" onClick={addInterest} data-testid="button-add-interest">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, i) => (
                    <Badge key={i} variant="secondary" className="gap-1" data-testid={`badge-interest-${i}`}>
                      {interest}
                      <button onClick={() => removeInterest(interest)} className="hover-elevate rounded-full">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Project Idea */}
            <div className="space-y-3">
              <Label htmlFor="projectIdea">Project Idea (Optional)</Label>
              <Textarea
                id="projectIdea"
                placeholder="Describe what you'd like to build..."
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                rows={4}
                data-testid="input-project-idea"
              />
            </div>

            {/* Search Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleFindTeammates}
              disabled={searching}
              data-testid="button-find-teammates"
            >
              <Search className="w-4 h-4 mr-2" />
              {searching ? "Searching..." : "Find Teammates"}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {matches.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Recommended Teammates ({matches.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match, index) => (
                <TeammateSuggestionCard
                  key={match.user.id}
                  match={match}
                  index={index}
                  onConnect={handleConnect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
