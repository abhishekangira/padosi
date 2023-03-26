import { useState } from "react";

export function Hello() {
  const [greetings, setGreetings] = useState<String[]>([]);
  return (
    <div className="bg-red-300">
      <button onClick={() => setGreetings([...greetings, "Hello"])}>Add</button>
      {greetings.map((greeting, i) => (
        <div key={i} className="bg-yellow-200">
          {greeting}
        </div>
      ))}
    </div>
  );
}
