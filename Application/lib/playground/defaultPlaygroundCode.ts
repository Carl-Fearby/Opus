export const DEFAULT_PLAYGROUND_CODE = `"use client";

import { useState } from "react";
import { Button } from "opus-react";

export default function Example() {
  const [count, setCount] = useState(0);

  return (
    <Button type="button" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </Button>
  );
}
`;
