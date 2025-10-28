import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Headphones, ArrowLeft, User as UserIcon, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { StudyCastAppShell } from '@/components/layouts/StudyCastAppShell';

interface Profile {
  full_name: string | null;
  email: string | null;
  course: string | null;
  year_group: string | null;
  subjects: string[] | null;
  personalized_mode: boolean | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ 
    full_name: '', 
    email: '', 
    course: null, 
    year_group: null, 
    subjects: null,
    personalized_mode: false 
  });
  const [loading, setLoading] = useState(false);

  const courses = ['GCSE', 'IGCSE', 'A-Level', 'IB', 'University', 'Other'];
  const yearGroups = [
    'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 
    'Year 12', 'Year 13',
    'Uni 1st Year', 'Uni 2nd Year', 'Uni 3rd Year', 'Uni 4th Year',
    'Other'
  ];
  const availableSubjects = [
    'Mathematics', 'English', 'Biology', 'Chemistry', 'Physics',
    'Geography', 'History', 'French', 'Spanish', 'Computer Science',
    'Art', 'Music'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, course, year_group, subjects, personalized_mode')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data || { 
        full_name: '', 
        email: user?.email || '', 
        course: null, 
        year_group: null, 
        subjects: null,
        personalized_mode: false 
      });
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setProfile({ 
        full_name: '', 
        email: user?.email || '', 
        course: null, 
        year_group: null, 
        subjects: null,
        personalized_mode: false 
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profile.full_name })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudyProfileUpdate = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          course: profile.course,
          year_group: profile.year_group,
          subjects: profile.subjects,
          personalized_mode: true
        })
        .eq('id', user?.id);

      if (error) throw error;
      setProfile({ ...profile, personalized_mode: true });
      toast.success('✅ Study Profile saved!');
    } catch (error: any) {
      toast.error('Failed to update study profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subject: string) => {
    const currentSubjects = profile.subjects || [];
    if (currentSubjects.includes(subject)) {
      setProfile({ 
        ...profile, 
        subjects: currentSubjects.filter(s => s !== subject) 
      });
    } else {
      setProfile({ 
        ...profile, 
        subjects: [...currentSubjects, subject] 
      });
    }
  };

  return (
    <StudyCastAppShell>
      <header className="border-b border-white/25 bg-white/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="rounded-full border border-white/40 bg-white/50 text-slate-800 hover:bg-white/70"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-white/40 bg-white/60 p-2 shadow-sm">
              <Headphones className="h-5 w-5 text-indigo-500" />
            </div>
            <span className="text-lg font-semibold tracking-wide text-slate-900">Profile</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Profile Settings</h1>
            <p className="mt-2 text-base text-slate-600">Manage your account information</p>
          </div>

          <Card className="rounded-3xl border border-white/30 bg-white/80 shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/40 bg-white/70 p-3">
                  <UserIcon className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">Account Details</CardTitle>
                  <CardDescription className="text-slate-600">
                    Update your personal information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    disabled
                    className="rounded-2xl border border-white/40 bg-white/60 text-slate-700"
                  />
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="rounded-2xl border border-white/40 bg-white/60 text-slate-700"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 px-6 text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-90"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="rounded-full border border-white/40 bg-white/40 text-slate-800 hover:bg-white/60"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-white/30 bg-white/80 shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/40 bg-white/70 p-3">
                  <GraduationCap className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">🎓 Your Study Profile</CardTitle>
                  <CardDescription className="text-slate-600">
                    Personalize your learning experience
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={profile.course || ''}
                  onValueChange={(value) => setProfile({ ...profile, course: value })}
                >
                  <SelectTrigger id="course" className="rounded-2xl border border-white/40 bg-white/60 text-slate-700">
                    <SelectValue placeholder="Select your course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year Group</Label>
                <Select
                  value={profile.year_group || ''}
                  onValueChange={(value) => setProfile({ ...profile, year_group: value })}
                >
                  <SelectTrigger id="year" className="rounded-2xl border border-white/40 bg-white/60 text-slate-700">
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearGroups.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subjects</Label>
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map((subject) => (
                    <Badge
                      key={subject}
                      variant={profile.subjects?.includes(subject) ? "default" : "outline"}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition ${
                        profile.subjects?.includes(subject)
                          ? 'bg-indigo-500/80 text-white hover:bg-indigo-500'
                          : 'border border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                      }`}
                      onClick={() => toggleSubject(subject)}
                    >
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleStudyProfileUpdate}
                disabled={loading || !profile.course || !profile.year_group || !profile.subjects?.length}
                className="w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 px-6 py-3 text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-90"
              >
                {loading ? 'Saving...' : 'Save Study Profile'}
              </Button>

              {profile.personalized_mode && profile.course && profile.year_group && (
                <Card className="rounded-2xl border border-indigo-200 bg-indigo-50/60">
                  <CardContent className="pt-6 text-sm text-slate-700">
                    <p className="font-medium text-slate-900">
                      You're studying <span className="text-indigo-600">{profile.course} {profile.year_group}</span>
                    </p>
                    {profile.subjects && profile.subjects.length > 0 && (
                      <p className="mt-2">Subjects: <span className="font-medium text-slate-900">{profile.subjects.join(', ')}</span></p>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-white/30 bg-white/70 shadow-lg backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Danger Zone</CardTitle>
              <CardDescription className="text-slate-600">Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={signOut} className="rounded-full px-6">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </StudyCastAppShell>
  );
};

export default Profile;
