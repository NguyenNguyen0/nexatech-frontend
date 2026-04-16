import { configureStore } from '@reduxjs/toolkit';
import paymentReducer from './payment/paymentSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            payment: paymentReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
