// Mock data for products
export const MOCK_PRODUCTS = [
  {
    _id: '1',
    name: 'Product 1',
    price: 360.00,
    description: 'Product description',
    images: ['https://via.placeholder.com/300'],
    specifications: '- 6.7" Display\n- 256GB Storage\n- 12GB RAM',
    discounts: {
      bulk: [
        { quantity: 4, percentage: 20 }, // 20% off on 4 or more
        { quantity: 2, percentage: 15 }  // 15% off on 2-3 items
      ],
      cart: [
        { minAmount: 3999, percentage: 6 } // 6% off on orders above 3999
      ],
      coupons: [
        { 
          code: 'W5FLASH85DEC',
          minAmount: 4000,
          amount: 85,
          type: 'flat'
        }
      ]
    }
  },
  {
    _id: '2',
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    price: 89999,
    images: ['https://via.placeholder.com/300'],
    specifications: '- 15" Display\n- 512GB SSD\n- 16GB RAM',
    discountPercentage: 0,
  },
  // Add more mock products as needed
];

// Mock data for cart
export const MOCK_CART = {
  _id: 'cart1',
  items: [
    {
      _id: 'item1',
      product: MOCK_PRODUCTS[0],
      quantity: 1,
    },
  ],
  subtotal: 74999,
  shippingCost: 99,
  discount: 7499,
  total: 67599,
};

// Mock data for orders
export const MOCK_ORDERS = [
  {
    _id: 'order1',
    userId: 'user_1',
    items: [
      {
        name: 'Smartphone X',
        quantity: 1,
        price: 74999
      }
    ],
    total: 74999,
    status: 'Processing',
    shippingDetails: {
      fullName: 'John Doe',
      address: 'Near sawarkar statue,Main road,kallam',
      city: 'Dharashiv',
      state: 'Maharashtra',
      zipCode: '413507',
      phone: '+91 - 9028262272',
    },
    createdAt: '2024-03-20',
  },
  {
    _id: 'order2',
    userId: 'user_1',
    items: [
      {
        name: 'Laptop Pro',
        quantity: 1,
        price: 89999
      }
    ],
    total: 89999,
    status: 'Delivered',
    shippingDetails: {
      fullName: 'John Doe',
      address: 'Near sawarkar statue,Main road,kallam',
      city: 'Dharashiv',
      state: 'Maharashtra',
      zipCode: '413507',
      phone: '+91 - 9028262272',
    },
    createdAt: '2024-03-15',
  },
  {
    _id: 'order3',
    userId: 'user_1',
    items: [
      {
        name: 'Wireless Earbuds',
        quantity: 2,
        price: 149.99
      }
    ],
    total: 299.98,
    status: 'Cancelled',
    shippingDetails: {
      fullName: 'John Doe',
      address: 'Near sawarkar statue,Main road,kallam',
      city: 'Dharashiv',
      state: 'Maharashtra',
      zipCode: '413507',
      phone: '+91 - 9028262272',
    },
    createdAt: '2024-03-10',
  },
]; 