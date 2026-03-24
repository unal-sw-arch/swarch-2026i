import axios from 'axios';
import type { ErrorResponse } from '../types';

const errorInterceptor = (error: any) => {
    let customError: ErrorResponse = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred.',
    };

    if (error.response?.data && 'code' in error.response.data && 'message' in error.response.data) {
        customError = error.response.data as ErrorResponse;
    } else {
        customError.code = error.code || 'NETWORK_ERROR';
        customError.message = customError.code === 'ERR_NETWORK' || !error.response
            ? 'Lo sentimos, el servicio de pedidos no está disponible ahora'
            : error.message;
    }

    window.dispatchEvent(
        new CustomEvent('api-error', {
            detail: customError,
        })
    );

    return Promise.reject(customError);
};

export const orderApi = axios.create({
    baseURL: import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const trackingApi = axios.create({
    baseURL: import.meta.env.VITE_TRACKING_SERVICE_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Mock Data for OrderApi
const MOCK_MENU_ITEMS = [
    { id: 101, name: 'Classic Burger', description: 'Beef patty with cheddar, lettuce, and tomato', price: 12.99, category: 'Mains', isAvailable: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60' },
    { id: 102, name: 'Vegan Bowl', description: 'Quinoa, roasted tofu, avocado, and tahini dressing', price: 14.50, category: 'Mains', isAvailable: true, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60' },
    { id: 103, name: 'Truffle Fries', description: 'Crispy fries tossed in truffle oil and parmesan', price: 6.99, category: 'Sides', isAvailable: true, image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=500&q=60' },
    { id: 104, name: 'Sold Out Item', description: 'Unavailable at the moment', price: 5.00, category: 'Sides', isAvailable: false },
    { id: 105, name: 'Craft Lemonade', description: 'Fresh squeezed lemons with a hint of mint', price: 4.50, category: 'Beverages', isAvailable: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=60' },
];

let nextOrderId = 1000;

// Request Interceptor to mock backend only for orderApi
orderApi.interceptors.request.use((config) => {
    return Promise.reject({ isMock: true, config });
});

orderApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.isMock) {
            const { config } = error;
            const url = config.url || '';
            const method = config.method?.toLowerCase();

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // MOCK: GET /menus/{menuId}/items
                    if (method === 'get' && url.includes('/menus/') && url.includes('/items')) {
                        return resolve({ data: MOCK_MENU_ITEMS, status: 200 });
                    }

                    // MOCK: POST /orders
                    if (method === 'post' && url.includes('/orders')) {
                        const payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
                        const orderId = nextOrderId++;
                        let total = 0;
                        const confItems = payload.items.map((reqItem: any) => {
                            const product = MOCK_MENU_ITEMS.find(p => p.id === reqItem.menuItemId);
                            const unitPrice = product ? product.price : 10.0;
                            const subtotal = unitPrice * reqItem.quantity;
                            total += subtotal;
                            return {
                                productName: product ? product.name : `Item #${reqItem.menuItemId}`,
                                unitPrice,
                                subtotal,
                                quantity: reqItem.quantity
                            };
                        });
                        return resolve({ data: { orderId, status: 'CREATED', totalAmount: total, items: confItems }, status: 201 });
                    }

                    // MOCK: GET /orders/{orderId}
                    if (method === 'get' && url.includes('/orders/')) {
                        return resolve({ data: { orderId: parseInt(url.split('/').pop() || '1000'), status: 'CREATED', totalAmount: 20.0, items: [] }, status: 200 });
                    }

                    return reject({
                        response: { data: { code: 'NOT_FOUND', message: `Mock route not found: ${method} ${url}` } }
                    });
                }, 500); // 500ms synthetic delay
            });
        }
        return errorInterceptor(error);
    }
);

trackingApi.interceptors.response.use((response) => response, errorInterceptor);
