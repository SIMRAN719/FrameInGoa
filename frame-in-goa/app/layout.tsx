import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"FrameInGoa — Hacker House Goa 2026",description:"Create your Hacker House Goa Builder Frame."};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}