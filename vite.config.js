import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            vue: "vue/dist/vue.esm-bundler.js",
            "balm-ui-plus": "balm-ui/dist/balm-ui-plus.esm.js",
            "balm-ui-css": "balm-ui/dist/balm-ui.css",
        },
    },
    server: {
        proxy: {
            "/api": {
                target: "http://127.0.0.1:5050",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
            "/echo": {
                target: "ws://127.0.0.1:5050",
                ws: true,
            },
        },
    },
});
