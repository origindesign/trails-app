import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [preact()],
    server: {
        proxy: {
            "/trail-data": {
                target: "https://trails-app-tourismvernon.pantheonsite.io",
                changeOrigin: true,
                secure: false, // Set to true if the target has a valid SSL certificate
            },
        },
    },
});
