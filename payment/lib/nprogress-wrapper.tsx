'use client';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import React, { Suspense } from 'react';

export default function NProgressWrapper({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Suspense fallback={null}>
                <ProgressBar height="2px" color="#0071e3" options={{ showSpinner: false }} shallowRouting />
            </Suspense>
        </>
    );
}
