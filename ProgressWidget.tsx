import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProgressWidget() {
  const [stats, setStats] = useState({
    streak: 3,
    minutesThisWeek: 127,
    totalPodcasts: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data } = await supabase
      .from('podcasts')
      .select('duration, created_at')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      // Calculate streak - consecutive days with podcasts
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streak = 0;
      let currentDate = new Date(today);
      
      // Get unique dates with podcasts
      const podcastDates = new Set(
        data.map(p => {
          const date = new Date(p.created_at);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
      );
      
      // Count consecutive days backwards from today
      while (podcastDates.has(currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      // Calculate minutes this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const thisWeekPodcasts = data.filter(
        p => new Date(p.created_at) > oneWeekAgo
      );
      const minutesThisWeek = thisWeekPodcasts.reduce((acc, p) => acc + (p.duration || 0), 0);

      setStats({
        streak,
        minutesThisWeek,
        totalPodcasts: data.length,
      });
    } else {
      setStats({
        streak: 0,
        minutesThisWeek: 0,
        totalPodcasts: 0,
      });
    }
  };

  const progressPercentage = Math.min((stats.minutesThisWeek / 180) * 100, 100);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="p-6 bg-gradient-card border-primary/20 shadow-glass">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-premium">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Learning Streak</p>
            <p className="text-3xl font-bold bg-gradient-premium bg-clip-text text-transparent">
              {stats.streak} days
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card border-primary/20 shadow-glass">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-accent/20">
            <Clock className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold">{stats.minutesThisWeek} min</p>
          </div>
        </div>
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute h-full bg-gradient-premium rounded-full"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Goal: 180 min/week
        </p>
      </Card>
    </div>
  );
}
