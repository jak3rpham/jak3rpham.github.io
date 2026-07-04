import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // False positive on this project's useMagnetic/useSpotlight/useLiveWhenVisible
      // hooks, which intentionally return an object bundling a ref alongside plain
      // handlers/values (e.g. `{ ref, style, onMouseMove, onMouseLeave }`). The rule
      // flags reading any sibling property as if it were `ref.current` during render,
      // even though these are ordinary values, not ref reads. Confirmed false positive
      // against react-hooks@7.1.1 for this exact "hook returns { ref, ...rest }" shape.
      "react-hooks/refs": "off",
    },
  },
]);

export default eslintConfig;
