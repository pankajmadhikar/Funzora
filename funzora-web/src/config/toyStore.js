/** Category meta for UI (BeingBoys-style). Map free-text `category` / `subCategory` via enrichProduct. */
export const TOY_CATS = [
  {
    id: "all",
    label: "All Toys",
    icon: "🎁",
    color: "#FF6B35",
    bg: "#FFF0EB",
    grad: "linear-gradient(135deg,#FFD580,#FF9F43)",
    txtColor: "#7A4A00",
  },
  {
    id: "outdoor",
    label: "Outdoor & Active",
    icon: "🌿",
    color: "#2ECC71",
    bg: "#EAFAF1",
    grad: "linear-gradient(135deg,#67E8F9,#3B82F6)",
    txtColor: "#1E3A5F",
  },
  {
    id: "creative",
    label: "Creative & Art",
    icon: "🎨",
    color: "#FF6B35",
    bg: "#FFF0EB",
    grad: "linear-gradient(135deg,#FDE68A,#F59E0B)",
    txtColor: "#78350F",
  },
  {
    id: "sensory",
    label: "Sensory Play",
    icon: "🧠",
    color: "#7B4FFF",
    bg: "#F3EFFF",
    grad: "linear-gradient(135deg,#DDD6FE,#7C3AED)",
    txtColor: "#2D1B69",
  },
  {
    id: "puzzles",
    label: "Puzzles & Games",
    icon: "🧩",
    color: "#E91E96",
    bg: "#FDE8F4",
    grad: "linear-gradient(135deg,#F9A8D4,#EC4899)",
    txtColor: "#831843",
  },
  {
    id: "collect",
    label: "Action & Collect",
    icon: "🦸",
    color: "#00BCD4",
    bg: "#E0F8FB",
    grad: "linear-gradient(135deg,#93C5FD,#2563EB)",
    txtColor: "#1E3A8A",
  },
  {
    id: "learning",
    label: "Learning Fun",
    icon: "📚",
    color: "#F59E0B",
    bg: "#FEF9EC",
    grad: "linear-gradient(135deg,#BAE6FD,#0EA5E9)",
    txtColor: "#0C4A6E",
  },
];

export const FREE_SHIP_AT = 199;
export const SHIPPING_FLAT = 39;

export const getCat = (id) => TOY_CATS.find((c) => c.id === id) || TOY_CATS[0];
