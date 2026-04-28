import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './order/orderSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            order: orderReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
