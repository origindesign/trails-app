import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [preact()],
    server: {
        proxy: {
            "/trail-data": {
                target: "https://tov.lndo.site",
                changeOrigin: true,
                secure: false, // Set to true if the target has a valid SSL certificate
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
});
