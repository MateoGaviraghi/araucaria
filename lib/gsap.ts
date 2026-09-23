import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Single registration point for GSAP (docs/02-STACK.md). Import gsap and useGSAP from here, only in
// client components; every animation runs inside useGSAP so it is cleaned up on unmount.
gsap.registerPlugin(useGSAP, DrawSVGPlugin, ScrollTrigger);


export { gsap, ScrollTrigger, useGSAP };
