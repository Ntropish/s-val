import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "SVal",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["vite"],
    },
    target: "esnext",
    minify: false,
  },
  plugins: [dts()],
});
