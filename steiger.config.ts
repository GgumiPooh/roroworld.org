import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ["./src/widgets/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
  {
    files: ["./src/features/**"],
    rules: {
      "fsd/ambiguous-slice-names": "off",
      "fsd/excessive-slicing": "off",
      "fsd/insignificant-slice": "off",
    },
  },
  {
    files: ["./src/entities/**"],
    rules: {
      "fsd/inconsistent-naming": "off",
      "fsd/insignificant-slice": "off",
    },
  },
  {
    files: ["./src/pages/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
]);
