"use client";

import CountUp from "react-countup";

interface Props {
  value: string | number;
  prefix?: string;
}

export default function AnimatedCounter({ value, prefix = "" }: Props) {
  return (
    <CountUp
      start={0}
      end={Number(value)}
      duration={1.5}
      separator=","
      prefix={prefix}
    />
  );
}
