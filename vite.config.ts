/// <reference types="vitest" />
import TypeDoc from 'typedoc';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, UserConfig } from 'vite';
import { resolve } from "node:path";
import dts from 'vite-plugin-dts';

const ID = "/react-use-paho-mqtt";
const OUTDIR = `../../dist${ID}`;

// https://vitejs.dev/config/
export default defineConfig(async ({ command, isPreview }): Promise<UserConfig> => {
  const isDemo = process.argv.includes("--demo");
  const isRemote = process.argv.includes("--remote");

  if (isDemo && (isPreview || command === "build")) {
    if (command === "build" && !isPreview) {
      const outputDir = isRemote ? `${OUTDIR}/docs` : "docs"
      const app = await TypeDoc.Application.bootstrapWithPlugins({
        entryPoints: ["lib/index.ts"],
        plugin: ["@mxssfd/typedoc-theme"],
        out: outputDir,
        basePath: isRemote ? `${ID}/docs` : "/",
        theme: "my-theme"

      });
      const project = await app.convert();
      if (project) {
        // Project may not have converted correctly
        // Rendered docs
        await app.generateDocs(project, outputDir);
        // Alternatively generate JSON output
        await app.generateJson(project, outputDir + "/documentation.json");
      }
    }

    return {
      plugins: [react()],
      base: isRemote ? `${ID}/demo` : "/",
      build: {
        emptyOutDir: true,
        outDir: isRemote ? `${OUTDIR}/demo` : undefined,
      }
    }
  }

  return {
    plugins: [react(), dts({ include: ["lib"], exclude: ["lib/__tests__"] })],
    test: {
      environment: "jsdom",
      root: "lib/"
    },
    build: {
      copyPublicDir: false,
      emptyOutDir: true,
      lib: {
        entry: resolve(__dirname, "lib/index.ts"),
        formats: ["es"]
      },
      rollupOptions: {
        external: ["react", 'react/jsx-runtime', "paho-mqtt"],
      }
    },
  }

})
