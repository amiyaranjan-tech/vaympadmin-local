import type {
  Seller,
  Product,
  Order,
  User,
  Deal,
  Coupon,
  Event,
  Notification,
  Refund,
} from "@/types";

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Jaipur",
  "Ahmedabad",
  "Goa",
];
const CATEGORIES = ["Clothes", "Accessories", "Footwear"] as const;
const BRANDS = [
  "Nova",
  "Urban Loom",
  "Kōra",
  "Everline",
  "Metro Muse",
  "Threadwork",
  "Indigo & Co",
  "Riverside",
  "Halcyon",
  "Fable",
] as const;

const COLORS = [
  "Black",
  "White",
  "Navy",
  "Beige",
  "Olive",
  "Rust",
  "Sage",
  "Cream",
  "Charcoal",
  "Rose",
] as const;

const MATERIALS = [
  "Cotton",
  "Linen",
  "Denim",
  "Wool",
  "Silk",
  "Polyester",
  "Leather",
  "Rayon",
] as const;

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const NAMES = [
  "Aarav Shah",
  "Ishita Rao",
  "Kabir Menon",
  "Meera Iyer",
  "Rohan Kapoor",
  "Sana Malik",
  "Devan Pillai",
  "Priya Nair",
  "Zoya Khan",
  "Vikram Sethi",
  "Ananya Singh",
  "Rahul Verma",
  "Nisha Patel",
  "Arjun Das",
  "Tara Bose",
  "Yash Reddy",
  "Kiara Joshi",
  "Aditya Menon",
  "Lakshmi R.",
  "Neel Bhatia",
];

const seed = (i: number) => (i * 9301 + 49297) % 233280;
const rand = (i: number, max: number) => Math.floor((seed(i) / 233280) * max);
const pick = <T>(arr: readonly T[], i: number): T => arr[rand(i, arr.length)];
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString();

export const sellers: Seller[] = Array.from({ length: 20 }, (_, i) => ({
  id: `sel_${i + 1}`,
  shopName: `${pick(BRANDS, i)} ${pick(["Studio", "Boutique", "Collective", "Atelier", "House"], i + 3)}`,
  ownerName: pick(NAMES, i),
  email: `owner${i + 1}@vaymp.shop`,
  phone: `+91 9${String(800000000 + i * 12345).slice(0, 9)}`,
  address: `${100 + i} Market Lane`,
  city: pick(CITIES, i),
  gst: `27ABCDE${1000 + i}F1Z5`,
  businessReg: `BR-${2020 + (i % 5)}-${1000 + i}`,
  logo: `https://api.dicebear.com/9.x/shapes/svg?seed=shop${i}`,
  cover: `https://picsum.photos/seed/cover${i}/800/300`,
  status: (["active", "active", "active", "pending", "suspended"] as const)[
    i % 5
  ],
  shopStatus: (
    ["open", "open", "open", "closed", "opening_soon", "closing_soon"] as const
  )[i % 6],
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  workingHours: "10:00 AM – 9:00 PM",
  bank: {
    accountName: pick(NAMES, i),
    accountNumber: `XXXXXX${1000 + i}`,
    ifsc: `HDFC000${1000 + i}`,
  },
  revenue: 50000 + rand(i, 900000),
  orders: 20 + rand(i + 3, 500),
  rating: 3.5 + rand(i, 15) / 10,
  createdAt: daysAgo(rand(i, 400)),
}));

export const SUBCATEGORIES = {
  Clothes: [
    "Upper Wear",
    "Bottom Wear",
    "Ethnic Wear",
    "Dresses",
    "Winter Wear",
    "Sportswear",
    "Innerwear",
    "Nightwear",
  ],

  Accessories: [
    "Bags",
    "Wallets",
    "Belts",
    "Watches",
    "Jewellery",
    "Sunglasses",
    "Caps",
    "Scarves",
  ],

  Footwear: [
    "Sneakers",
    "Casual Shoes",
    "Sports Shoes",
    "Running Shoes",
    "Boots",
    "Sandals",
    "Slippers",
    "Loafers",
    "Heels",
  ],
} as const;

export const GENDERS_LIST = ["men", "women", "kids"] as const;export const STOCK_STATUS_LIST = ["in-stock", "low-stock", "out-of-stock"];

export const DATE_FILTER_LIST = [
  "today",
  "7-days",
  "30-days",
  "3-months",
  "1-year",
];

export const DISCOUNT_FILTER_LIST = ["10", "20", "30", "50"];

export const products: Product[] = Array.from({ length: 150 }, (_, i) => {
  const category = CATEGORIES[i % CATEGORIES.length];

  const subcategories = SUBCATEGORIES[category];

  const subcategory = subcategories[rand(i + 100, subcategories.length)];

  const gender = pick(["men", "women", "kids"] as const, i);
  const brand = pick(BRANDS, i);

  const selling = 499 + rand(i, 4500);
  const cost = Math.floor(selling * 0.6);
  const discount = 5 + rand(i, 45);
  const discountPrice = Math.floor(selling * (1 - discount / 100));

  const sizes = SIZES.slice(0, 3 + rand(i, 3)).map((size) => ({
    size,
    quantity: 5 + rand(i + size.charCodeAt(0), 40),
  }));

  const stock = sizes.reduce((total, size) => total + size.quantity, 0);

  return {
    id: `prd_${i + 1}`,

    name: `${brand} ${subcategory} ${i + 1}`,
    description:
      "Crafted with premium fabric and precise tailoring for everyday comfort and versatile styling.",

    brand,

    category,

    subcategory,

    gender,

    tags: ["new", "trending", pick(["summer", "winter", "monsoon"], i)],

    sellingPrice: selling,
    costPrice: cost,
    discount,
    discountPrice,

    sizes,

    color: pick(COLORS, i),

    material: pick(MATERIALS, i),

    season: pick(["Summer", "Winter", "Monsoon", "All"], i),

    occasion: pick(["Casual", "Formal", "Party", "Sport"], i),

    pattern: pick(["Solid", "Striped", "Printed", "Checked"], i),

    featured: i % 7 === 0,

    trending: i % 5 === 0,

    newArrival: i % 6 === 0,

    limitedStock: stock < 30,

    bogo: i % 11 === 0,

    images: [
      `https://picsum.photos/seed/prd${i}/600/700`,
      `https://picsum.photos/seed/prd${i}b/600/700`,
    ],

    sellerId: sellers[i % sellers.length].id,

    createdAt: daysAgo(rand(i, 180)),

    stock,

    sold: rand(i + 7, 300),
  };
});

export const users: User[] = Array.from({ length: 100 }, (_, i) => ({
  id: `usr_${i + 1}`,
  name: pick(NAMES, i) + " " + (i + 1),
  email: `user${i + 1}@mail.com`,
  phone: `+91 8${String(800000000 + i * 3421).slice(0, 9)}`,
  avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=user${i}`,
  address: `${10 + i} Palm Street`,
  city: pick(CITIES, i),
  totalSpend: 500 + rand(i, 60000),
  totalOrders: rand(i + 2, 30),
  wishlist: [products[i % products.length].id],
  createdAt: daysAgo(rand(i, 500)),
  status: i % 17 === 0 ? "blocked" : "active",
}));

export const orders: Order[] = Array.from({ length: 50 }, (_, i) => {
  const seller = sellers[i % sellers.length];
  const user = users[i % users.length];
  const items = Array.from({ length: 1 + rand(i, 3) }, (_, j) => {
    const p = products[(i + j) % products.length];
    return {
      productId: p.id,
      productName: p.name,
      qty: 1 + rand(i + j, 3),
      price: p.discountPrice,
    };
  });
  const total = items.reduce((a, b) => a + b.qty * b.price, 0);
  const commission = Math.floor(total * 0.12);
  return {
    id: `ord_${i + 1}`,
    orderNumber: `VYM-${10000 + i}`,
    customerId: user.id,
    customerName: user.name,
    sellerId: seller.id,
    sellerName: seller.shopName,
    items,
    total,
    commission,
    status: (
      ["pending", "processing", "shipped", "delivered", "cancelled"] as const
    )[i % 5],
    paymentStatus: (["paid", "paid", "paid", "pending", "refunded"] as const)[
      i % 5
    ],
    paymentMethod: pick(["UPI", "Card", "COD", "Wallet"], i),
    createdAt: daysAgo(rand(i, 60)),
    timeline: [
      { label: "Order placed", date: daysAgo(rand(i, 60)) },
      { label: "Payment confirmed", date: daysAgo(rand(i, 59)) },
      { label: "Packed", date: daysAgo(rand(i, 58)) },
      { label: "Shipped", date: daysAgo(rand(i, 57)) },
    ],
  };
});

export const deals: Deal[] = Array.from({ length: 30 }, (_, i) => ({
  id: `dl_${i + 1}`,
  title: `${pick(["Weekend", "Monsoon", "Festive", "Flash", "Studio"], i)} ${pick(["Sale", "Drop", "Blowout", "Special"], i)} ${i + 1}`,
  type: (["flat", "percentage", "combo", "bogo"] as const)[i % 4],
  discount: 10 + rand(i, 50),
  category: (["deal", "flash", "festival"] as const)[i % 3],
  sellerId: sellers[i % sellers.length].id,
  startDate: daysAgo(-rand(i, 5)),
  endDate: daysAgo(-rand(i + 1, 30) - 5),
  status: (["active", "scheduled", "expired"] as const)[i % 3],
  banner: `https://picsum.photos/seed/deal${i}/800/300`,
}));

export const coupons: Coupon[] = Array.from({ length: 20 }, (_, i) => ({
  id: `cp_${i + 1}`,
  code: `VAYMP${(i + 10).toString(36).toUpperCase()}${100 + i}`,
  discount: 5 + rand(i, 40),
  maxDiscount: 200 + rand(i, 800),
  minOrder: 500 + rand(i, 2000),
  sellerId: sellers[i % sellers.length].id,
  category: pick(CATEGORIES, i),
  startDate: daysAgo(rand(i, 10)),
  endDate: daysAgo(-rand(i, 30) - 5),
  usageLimit: 100 + rand(i, 900),
  used: rand(i, 100),
  banner: `https://picsum.photos/seed/cp${i}/800/300`,
}));

export const events: Event[] = Array.from({ length: 15 }, (_, i) => ({
  id: `ev_${i + 1}`,
  title: `${pick(["Runway", "Trunk Show", "Meet the Designer", "Pop-Up", "Style Night"], i)} ${i + 1}`,
  description:
    "A curated in-store experience celebrating the season's finest hyperlocal collections.",
  banner: `https://picsum.photos/seed/ev${i}/900/400`,
  startDate: daysAgo(-rand(i, 10)),
  endDate: daysAgo(-rand(i, 20) - 5),
  location:
    pick(CITIES, i) +
    " · " +
    pick(["Bandra", "HSR Layout", "Koregaon Park", "Connaught Place"], i),
  sellerId: sellers[i % sellers.length].id,
  status: (["upcoming", "live", "ended"] as const)[i % 3],
}));

export const notifications: Notification[] = Array.from(
  { length: 25 },
  (_, i) => ({
    id: `nt_${i + 1}`,
    title: pick(
      [
        "New season drop",
        "Flash sale live",
        "Weekend picks",
        "Free delivery weekend",
        "Local designers meet",
      ],
      i,
    ),
    message:
      "Fresh arrivals from your favorite neighborhood stores. Explore now.",
    target: (["platform", "sellers", "users", "city"] as const)[i % 4],
    city: i % 4 === 3 ? pick(CITIES, i) : undefined,
    image: `https://picsum.photos/seed/nt${i}/600/300`,
    ctaLabel: "Explore",
    ctaUrl: "/",
    createdAt: daysAgo(rand(i, 30)),
    status: (["sent", "sent", "scheduled", "draft"] as const)[i % 4],
  }),
);

export const refunds: Refund[] = Array.from({ length: 12 }, (_, i) => {
  const o = orders[(i * 3) % orders.length];
  return {
    id: `rf_${i + 1}`,
    orderId: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    sellerName: o.sellerName,
    amount: Math.floor(o.total * 0.5),
    reason: pick(
      [
        "Size mismatch",
        "Damaged item",
        "Wrong product",
        "Changed mind",
        "Late delivery",
      ],
      i,
    ),
    status: (["pending", "approved", "rejected"] as const)[i % 3],
    createdAt: daysAgo(rand(i, 20)),
    timeline: [
      { label: "Refund requested", date: daysAgo(rand(i, 20)) },
      { label: "Under review", date: daysAgo(rand(i, 18)) },
    ],
  };
});

// Chart data
export const revenueSeries = Array.from({ length: 12 }, (_, i) => ({
  month: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][i],
  revenue: 80000 + rand(i, 220000),
  commission: 10000 + rand(i + 3, 30000),
  orders: 200 + rand(i + 5, 600),
}));

export const categorySales = CATEGORIES.slice(0, 6).map((c, i) => ({
  name: c,
  value: 20 + rand(i, 80),
}));

export const dailyOrders = Array.from({ length: 14 }, (_, i) => ({
  day: `${i + 1}`,
  orders: 20 + rand(i, 120),
}));

export const CITIES_LIST = CITIES;
export const CATEGORIES_LIST = CATEGORIES;
export const BRANDS_LIST = BRANDS;
export const COLORS_LIST = COLORS;
export const MATERIALS_LIST = MATERIALS;
export const SIZES_LIST = SIZES;
export const SUBCATEGORIES_LIST = SUBCATEGORIES;