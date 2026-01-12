'use client'

import React from "react";
import { ThemeProvider as NextThem } from "next-themes";

export function ThemeProvider({children, ...props}: Readonly<React.ComponentProps<typeof NextThem>>){
    return <NextThem {...props}>{children}</NextThem>
}