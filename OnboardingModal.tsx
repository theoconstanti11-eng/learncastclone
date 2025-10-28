import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calculator, FlaskConical, Globe, Languages, BookOpen, Brain, Music, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const subjects = [
  { icon: Calculator, name: 'Mathematics', slug: 'mathematics' },
  { icon: FlaskConical, name: 'Science', slug: 'science' },
  { icon: Globe, name: 'History', slug: 'history' },
  { icon: Languages, name: 'Languages', slug: 'languages' },
  { icon: BookOpen, name: 'Literature', slug: 'literature' },
  { icon: Brain, name: 'Psychology', slug: 'psychology' },
  { icon: Music, name: 'Music', slug: 'music' },
  { icon: Palette, name: 'Art', slug: 'art' },
];

const calculateYearGroup = (age: number): string => {
  if (age <= 11) return 'Year 7 or below';
  if (age === 12) return 'Year 8';
  if (age === 13) return 'Year 9';
  if (age === 14) return 'Year 10';
  if (age === 15) return 'Year 11';
  if (age === 16) return 'Year 12';
  if (age === 17) return 'Year 13';
  return 'University or above';
};

export function OnboardingModal({ open, onClose, userId }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState<number>(16);
  const [yearGroup, setYearGroup] = useState<string>('');
  const [course, setCourse] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAgeChange = (value: string) => {
    const ageNum = parseInt(value);
    setAge(ageNum);
    setYearGroup(calculateYearGroup(ageNum));
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          age,
          year_group: yearGroup,
          course,
          subjects: selectedSubjects,
          has_completed_onboarding: true,
        })
        .eq('id', userId);

      if (error) throw error;

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#22D3EE', '#8B5CF6'],
      });

      toast.success('Awesome! Your profile is all set up 🎉');
      onClose();
    } catch (error: any) {
      toast.error('Failed to save profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !age) {
      toast.error('Please enter your age');
      return;
    }
    if (step === 3 && !course) {
      toast.error('Please select your course');
      return;
    }
    if (step === 4 && selectedSubjects.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }
    
    if (step === 4) {
      handleComplete();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-premium bg-clip-text text-transparent">
            Let's personalize your learning 🎯
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center gap-2 my-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-all ${
                s === step ? 'bg-gradient-premium' : s < step ? 'bg-accent' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 py-4"
          >
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">How old are you?</h3>
                  <p className="text-sm text-muted-foreground">
                    This helps us tailor content to your level
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Select onValueChange={handleAgeChange} defaultValue="16">
                    <SelectTrigger>
                      <SelectValue placeholder="Select your age" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 13 }, (_, i) => i + 11).map((age) => (
                        <SelectItem key={age} value={age.toString()}>
                          {age} years old
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Your Year Group</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on your age, we think you're in...
                  </p>
                </div>
                <div className="bg-gradient-premium/10 border border-primary/20 rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold bg-gradient-premium bg-clip-text text-transparent">
                    {yearGroup || 'Year 12'}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">What course are you doing?</h3>
                  <p className="text-sm text-muted-foreground">
                    Select your current qualification
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select onValueChange={setCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gcse">GCSE</SelectItem>
                      <SelectItem value="igcse">IGCSE</SelectItem>
                      <SelectItem value="a-level">A-Level</SelectItem>
                      <SelectItem value="ib">International Baccalaureate (IB)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Choose your subjects</h3>
                  <p className="text-sm text-muted-foreground">
                    Select all subjects you're studying
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {subjects.map((subject) => {
                    const Icon = subject.icon;
                    const isSelected = selectedSubjects.includes(subject.name);
                    return (
                      <button
                        key={subject.slug}
                        onClick={() => toggleSubject(subject.name)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-glow'
                            : 'border-border hover:border-primary/50 bg-card'
                        }`}
                      >
                        <Icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {subject.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={nextStep}
            disabled={loading}
            className="flex-1 bg-gradient-premium hover:opacity-90 transition-opacity shadow-glow"
          >
            {loading ? 'Saving...' : step === 4 ? 'Complete Setup' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
