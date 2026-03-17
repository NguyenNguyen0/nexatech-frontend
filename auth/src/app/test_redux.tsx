'use client';

import { decrement, increment } from '@/features/counter/counterSlice';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/features/hooks';

export default function TestRedux() {
    const count = useAppSelector((state) => state.counter.value);
    const dispatch = useAppDispatch();

    return (
        <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/50">
            <Button variant="outline" onClick={() => dispatch(decrement())}>
                -
            </Button>

            <span className="text-2xl font-mono w-12 text-center">{count}</span>

            <Button variant="outline" onClick={() => dispatch(increment())}>
                +
            </Button>

            <p className="text-muted-foreground">Redux Toolkit is now setup and working!</p>
        </div>
    );
}
