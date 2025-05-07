'use client'
import { usePathname } from "next/navigation"
import Layout from "./layout"

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const excludedRoutes = ["/signin", "/signup"];
    const shouldExcludeLayout = excludedRoutes.includes(pathname);
    return shouldExcludeLayout ? children : <Layout>{children}</Layout>
}