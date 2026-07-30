"use client";

import CountUp from "react-countup";

interface Props {
  value: number;
  prefix?: string;
}

export default function AnimatedCounter({ value, prefix = "" }: Props) {
  return (
    <CountUp
      start={0}
      end={value}
      duration={1.5}
      separator=","
      prefix={prefix}
    />
  );
}
