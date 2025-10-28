import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface SubjectCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function SubjectCard({ title, description, icon: Icon, onClick }: SubjectCardProps) {
  return (
    <Card 
      className="bg-gradient-card border-border hover:shadow-glow transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader>
        <div className="mb-2 p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
