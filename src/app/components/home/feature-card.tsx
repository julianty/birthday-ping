interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
}

export default function FeatureCard({
  emoji,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
      <span className="text-2xl">{emoji}</span>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}
