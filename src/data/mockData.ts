export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  isPopular?: boolean;
  rating: number;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface Order {
  id: string;
  items: { dishName: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "rejected";
  customerName: string;
  customerPhone: string;
  address: string;
  createdAt: string;
  riderId?: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  isOnline: boolean;
  currentOrderId?: string;
  totalDeliveries: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  minOrder: number;
  isActive: boolean;
  validUntil: string;
}

export const RESTAURANT = {
  name: "Spice Garden",
  tagline: "Authentic flavors, crafted with love",
  description: "A culinary journey through the rich and diverse flavors of Indian cuisine. Every dish tells a story of tradition, passion, and the finest ingredients.",
  phone: "+91 98765 43210",
  address: "42 MG Road, Bengaluru, Karnataka 560001",
  rating: 4.6,
  reviewCount: 2340,
};

export const CATEGORIES = ["All", "Starters", "Main Course", "Biryani", "Breads", "Desserts"];

export const DISHES: Dish[] = [
  { id: "d1", name: "Paneer Tikka", description: "Marinated cottage cheese grilled to perfection with bell peppers", price: 249, category: "Starters", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop", isVeg: true, isPopular: true, rating: 4.5 },
  { id: "d2", name: "Chicken 65", description: "Spicy deep-fried chicken with curry leaves and red chilies", price: 299, category: "Starters", image: "https://images.unsplash.com/photo-1610057099443-fde6c99db7f6?w=400&h=300&fit=crop", isVeg: false, isPopular: true, rating: 4.7 },
  { id: "d3", name: "Samosa", description: "Crispy pastry filled with spiced potatoes and peas", price: 89, category: "Starters", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", isVeg: true, rating: 4.3 },
  { id: "d4", name: "Butter Chicken", description: "Tender chicken in a rich, creamy tomato-based gravy", price: 349, category: "Main Course", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop", isVeg: false, isPopular: true, rating: 4.8 },
  { id: "d5", name: "Dal Makhani", description: "Slow-cooked black lentils in a buttery, creamy sauce", price: 229, category: "Main Course", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", isVeg: true, isPopular: true, rating: 4.6 },
  { id: "d6", name: "Palak Paneer", description: "Cottage cheese cubes in a smooth spinach gravy", price: 249, category: "Main Course", image: "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=400&h=300&fit=crop", isVeg: true, rating: 4.4 },
  { id: "d7", name: "Chicken Curry", description: "Home-style chicken curry with aromatic spices", price: 299, category: "Main Course", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop", isVeg: false, rating: 4.5 },
  { id: "d8", name: "Mutton Rogan Josh", description: "Kashmiri-style slow-cooked mutton in aromatic gravy", price: 449, category: "Main Course", image: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400&h=300&fit=crop", isVeg: false, rating: 4.7 },
  { id: "d9", name: "Chicken Biryani", description: "Fragrant basmati rice layered with spiced chicken and herbs", price: 329, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", isVeg: false, isPopular: true, rating: 4.9 },
  { id: "d10", name: "Veg Biryani", description: "Aromatic rice with mixed vegetables and whole spices", price: 249, category: "Biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop", isVeg: true, rating: 4.3 },
  { id: "d11", name: "Garlic Naan", description: "Soft tandoor-baked bread with fresh garlic and butter", price: 69, category: "Breads", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop", isVeg: true, rating: 4.4 },
  { id: "d12", name: "Butter Roti", description: "Whole wheat flatbread brushed with butter", price: 39, category: "Breads", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", isVeg: true, rating: 4.2 },
  { id: "d13", name: "Gulab Jamun", description: "Soft milk dumplings soaked in rose-flavored sugar syrup", price: 129, category: "Desserts", image: "https://images.unsplash.com/photo-1666190073498-2a2744491491?w=400&h=300&fit=crop", isVeg: true, isPopular: true, rating: 4.6 },
  { id: "d14", name: "Rasmalai", description: "Delicate cottage cheese patties in sweetened, flavored milk", price: 149, category: "Desserts", image: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&h=300&fit=crop", isVeg: true, rating: 4.5 },
  { id: "d15", name: "Kulfi", description: "Traditional Indian ice cream with pistachios and cardamom", price: 109, category: "Desserts", image: "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400&h=300&fit=crop", isVeg: true, rating: 4.4 },
];

export const INITIAL_ORDERS: Order[] = [
  { id: "ORD001", items: [{ dishName: "Butter Chicken", quantity: 2, price: 349 }, { dishName: "Garlic Naan", quantity: 4, price: 69 }], total: 974, status: "pending", customerName: "Rahul Sharma", customerPhone: "+91 99887 76655", address: "12, 5th Cross, Indiranagar, Bengaluru", createdAt: "2026-03-01T10:30:00" },
  { id: "ORD002", items: [{ dishName: "Chicken Biryani", quantity: 1, price: 329 }, { dishName: "Raita", quantity: 1, price: 49 }], total: 378, status: "preparing", customerName: "Priya Patel", customerPhone: "+91 88776 55443", address: "34, 2nd Main, Koramangala, Bengaluru", createdAt: "2026-03-01T10:15:00", riderId: "r1" },
  { id: "ORD003", items: [{ dishName: "Paneer Tikka", quantity: 1, price: 249 }, { dishName: "Dal Makhani", quantity: 1, price: 229 }, { dishName: "Butter Roti", quantity: 3, price: 39 }], total: 595, status: "out_for_delivery", customerName: "Ankit Verma", customerPhone: "+91 77665 54432", address: "78, HSR Layout, Bengaluru", createdAt: "2026-03-01T09:45:00", riderId: "r2" },
  { id: "ORD004", items: [{ dishName: "Gulab Jamun", quantity: 2, price: 129 }], total: 258, status: "delivered", customerName: "Sneha Iyer", customerPhone: "+91 66554 43321", address: "56, Whitefield, Bengaluru", createdAt: "2026-03-01T08:30:00", riderId: "r3" },
  { id: "ORD005", items: [{ dishName: "Veg Biryani", quantity: 2, price: 249 }, { dishName: "Samosa", quantity: 4, price: 89 }], total: 854, status: "confirmed", customerName: "Vikram Singh", customerPhone: "+91 55443 32210", address: "23, JP Nagar, Bengaluru", createdAt: "2026-03-01T10:45:00" },
];

export const INITIAL_RIDERS: Rider[] = [
  { id: "r1", name: "Arjun Kumar", phone: "+91 99001 12233", isOnline: true, currentOrderId: "ORD002", totalDeliveries: 156 },
  { id: "r2", name: "Mohammed Rafi", phone: "+91 88112 23344", isOnline: true, currentOrderId: "ORD003", totalDeliveries: 234 },
  { id: "r3", name: "Deepak Yadav", phone: "+91 77223 34455", isOnline: false, totalDeliveries: 89 },
  { id: "r4", name: "Suresh Nair", phone: "+91 66334 45566", isOnline: true, totalDeliveries: 312 },
];

export const INITIAL_OFFERS: Offer[] = [
  { id: "off1", title: "Welcome Offer", description: "20% off on your first order", discountPercent: 20, minOrder: 200, isActive: true, validUntil: "2026-04-30" },
  { id: "off2", title: "Weekend Special", description: "15% off on orders above ₹500", discountPercent: 15, minOrder: 500, isActive: true, validUntil: "2026-03-31" },
  { id: "off3", title: "Biryani Fest", description: "Flat 10% off on all biryanis", discountPercent: 10, minOrder: 0, isActive: false, validUntil: "2026-03-15" },
];
