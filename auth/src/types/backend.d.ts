// https://bobbyhadz.com/blog/typescript-make-types-global#declare-global-types-in-typescript
export {};

declare global {
    // type của BE
    interface IBackendRes<T> {
        error?: string | string[];
        message: string;
        statusCode: number | string;
        data?: T;
    }

    // kiểu type dùng để fetch dữ liệu
    interface IRequest {
        url: string;
        method: string;
        body?: { [key: string]: any };
        queryParams?: any;
        useCredentials?: boolean;
        headers?: any;
        nextOption?: any;
    }

    // type của BE
    interface IBackendRes<T> {
        error?: string | string[];
        message: string;
        statusCode: number | string;
        data?: T;
    }
}
