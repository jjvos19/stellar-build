import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El binding del contrato está enlazado (pnpm link:) desde ../libs-react,
  // fuera de esta carpeta. Turbopack solo compila archivos dentro de su root,
  // así que el root debe ser la carpeta padre (stellar-build).
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
