import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StudyCastAppShell } from '@/components/layouts/StudyCastAppShell';

const plans = [
  {
    name: 'Free',
    price: '£0',
    cadence: 'per month',
    description: 'Kick-start your StudyCast journey.',
    cta: 'Start Learning',
    features: [
      '3 podcasts per day',
      'Core AI voices',
      'Dashboard tracking',
      'Textbook library preview',
    ],
  },
  {
    name: 'Pro',
    price: '£9.99',
    cadence: 'per month',
    description: 'Unlimited generation for dedicated learners.',
    cta: 'Upgrade to Pro',
    popular: true,
    features: [
      'Unlimited podcast generation',
      'Premium voice pack',
      'Download & share episodes',
      'Priority AI generation queue',
    ],
  },
  {
    name: 'StudyCast+',
    price: '£19.99',
    cadence: 'per month',
    description: 'Turn your revision into a guided experience.',
    cta: 'Unlock StudyCast+',
    features: [
      'Conversational AI tutor',
      'Textbook playlists & smart queues',
      'Adaptive quizzes after each episode',
      'Weekly progress insights',
    ],
  },
  {
    name: 'Schools',
    price: '£49+',
    cadence: 'per month',
    description: 'Powerful tools built for classrooms and cohorts.',
    cta: 'Talk to Sales',
    features: [
      'Bulk student accounts',
      'Teacher dashboards & analytics',
      'Curriculum-aligned playlists',
      'Dedicated onboarding & support',
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  const handleContact = () => {
    window.location.href = 'mailto:hello@studycast.app';
  };

  return (
    <StudyCastAppShell>
      <header className="border-b border-white/25 bg-white/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <Button
            variant="ghost"
            className="gap-2 rounded-full border border-white/40 bg-white/40 text-slate-800 transition hover:bg-white/60"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/signup')}
            className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 px-5 text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-90"
          >
            Join StudyCast
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl space-y-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/40 px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span>Choose your journey</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-bold text-slate-900 md:text-5xl"
          >
            Pricing built for every student
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base text-slate-600 sm:text-lg"
          >
            Start for free, upgrade when you need more power. Cancel anytime. All plans include secure Supabase Auth and progress tracking.
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card
                className={`h-full rounded-3xl border border-white/30 bg-white/80 shadow-xl shadow-indigo-500/10 backdrop-blur-xl ${
                  plan.popular ? 'ring-2 ring-indigo-400/60' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold text-slate-900">{plan.name}</CardTitle>
                    {plan.popular && <Badge variant="secondary">Most popular</Badge>}
                  </div>
                  <CardDescription className="text-slate-600">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="ml-1 text-sm text-slate-600">{plan.cadence}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-sm text-slate-700">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-indigo-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full rounded-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30 hover:opacity-90'
                        : 'border border-indigo-200 bg-white/60 text-indigo-600 hover:bg-white/80'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => (plan.name === 'Schools' ? handleContact() : navigate('/signup'))}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-slate-600">
          Need a bespoke plan or want to run StudyCast across your department?{' '}
          <Button variant="link" size="sm" className="px-0 text-indigo-600" onClick={handleContact}>
            Reach out to the team →
          </Button>
        </div>
      </main>
    </StudyCastAppShell>
  );
};

export default Pricing;
