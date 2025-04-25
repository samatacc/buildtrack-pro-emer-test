import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { Card } from "./Card";
import { Heading } from "./Heading";
import { Text } from "./Text";

interface FeatureCardProps extends Omit<ComponentProps<"div">, "title"> {
  title: string;
  description: string;
  icon?: string;
  index?: number;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  index = 0,
  className = "",
  ...props
}: FeatureCardProps) {
  return (
    <Card
      withAnimation
      animationDelay={index * 200}
      className={twMerge("h-full", className)}
      {...props}
    >
      {icon && <div className="text-4xl mb-4">{icon}</div>}

      <Heading level="h3" withAnimation={false}>
        {title}
      </Heading>

      <Text withAnimation={false} className="text-gray-600">
        {description}
      </Text>
    </Card>
  );
}
