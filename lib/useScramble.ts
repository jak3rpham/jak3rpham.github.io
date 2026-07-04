"use client";
import { useRef, useState } from "react";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#";

export function useScramble(finalText: string) {
  const [display, setDisplay] = useState(finalText);
  const [isScrambling, setIsScrambling] = useState(false);
  const scrambling = useRef(false);

  function trigger() {
    if (scrambling.current) return;
    scrambling.current = true;
    setIsScrambling(true);
    const queue = [...finalText].map((ch) => ({
      to: ch,
      start: Math.floor(Math.random() * 8),
      end: Math.floor(Math.random() * 8) + 10,
      char: "",
    }));
    let frame = 0;
    function update() {
      let out = "";
      let done = 0;
      queue.forEach((q) => {
        if (frame >= q.end) {
          done++;
          out += q.to;
        } else if (frame >= q.start) {
          if (q.to === " ") q.char = " ";
          else if (!q.char || Math.random() < 0.28) {
            q.char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
          out += q.char;
        } else {
          out += " ";
        }
      });
      setDisplay(out);
      if (done < queue.length) {
        frame++;
        requestAnimationFrame(update);
      } else {
        setDisplay(finalText);
        scrambling.current = false;
        setIsScrambling(false);
      }
    }
    update();
  }

  return { display, isScrambling, trigger };
}
