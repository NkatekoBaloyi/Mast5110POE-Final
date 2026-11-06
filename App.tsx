import React, { useEffect, useMemo, useState } from "react";

/* =========================================================================
   Design tokens + shared styles
========================================================================= */

const COLORS = {
  primary: "#1F4B3F",
  primaryText: "#FFFFFF",
  background: "#FFFFFF",
  surface: "#F7F8F7",
  border: "#D9DCD9",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  errorText: "#B3261E",
  errorBg: "#FCEDEC",
  successBg: "#E6F2EC",
  divider: "#E8E8E4",
} as const;

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const FRAME_STYLE: React.CSSProperties = {
  width: 320,
  minHeight: 640,
  backgroundColor: COLORS.background,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  overflow: "hidden",
  fontFamily: FONT,
  display: "flex",
  flexDirection: "column",
  position: "relative",
};

const inputStyle = (hasError = false): React.CSSProperties => ({
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${hasError ? COLORS.errorText : COLORS.border}`,
  borderRadius: 8,
  padding: 12,
  fontSize: 13.5,
  color: COLORS.textPrimary,
  outline: "none",
  fontFamily: "inherit",
  backgroundColor: COLORS.background,
});

/* =========================================================================
   Domain types + data
========================================================================= */

type Category = "Starters" | "Mains" | "Desserts";
type Course = "Starter" | "Main" | "Dessert";
type FilterOption = "All" | Category;

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imagekeywords: string;
  /** Photo uploaded by the chef (data URL). Falls back to a keyword-based photo. */
  imageUrl?: string;
}

interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: Category;
  imageUrl?: string;
}

interface DishFormValue {
  name: string;
  description: string;
  course: Course;
  price: number;
  imageUrl?: string;
}

interface ToastMessage {
  text: string;
  type: "success" | "error";
}

const CATEGORIES: Category[] = ["Starters", "Mains", "Desserts"];
const COURSES: Course[] = ["Starter", "Main", "Dessert"];
const FILTER_OPTIONS: FilterOption[] = ["All", ...CATEGORIES];

const CATEGORY_TO_COURSE: Record<Category, Course> = { Starters: "Starter", Mains: "Main", Desserts: "Dessert" };
const COURSE_TO_CATEGORY: Record<Course, Category> = { Starter: "Starters", Main: "Mains", Dessert: "Desserts" };

const initialDishes: Dish[] = [
  { id: "1", name: "Garlic Bread", description: "Toasted baguette, herb butter", price: 45, category: "Starters", imagekeywords: "garlic,bread" },
  { id: "2", name: "Caprese Salad", description: "Tomato, mozzarella, basil", price: 60, category: "Starters", imagekeywords: "caprese,salad" },
  { id: "3", name: "Bruschetta", description: "Grilled ciabatta, tomato, basil oil", price: 55, category: "Starters", imagekeywords: "bruschetta" },
  { id: "4", name: "Soup of the Day", description: "Ask your waiter for today's special", price: 50, category: "Starters", imagekeywords: "soup,bowl" },
  { id: "5", name: "Grilled Chicken", description: "Chicken breast, roast veg", price: 180, category: "Mains", imagekeywords: "grilled,chicken" },
  { id: "6", name: "Beef Fillet", description: "250g fillet, chips, sauce", price: 180, category: "Mains", imagekeywords: "beef,steak" },
  { id: "7", name: "Seafood Linguine", description: "Prawns, calamari, white wine sauce", price: 145, category: "Mains", imagekeywords: "seafood,pasta" },
  { id: "8", name: "Margherita Pizza", description: "San marzano tomato, fior di latte", price: 110, category: "Mains", imagekeywords: "margherita,pizza" },
  { id: "9", name: "Vegetable Curry", description: "Seasonal veg, coconut sauce, rice", price: 95, category: "Mains", imagekeywords: "vegetable,curry" },
  { id: "10", name: "Chocolate Fondant", description: "Warm cake, vanilla ice cream", price: 70, category: "Desserts", imagekeywords: "chocolate,fondant" },
  { id: "11", name: "New York Cheesecake", description: "Baked cheesecake, berry compote", price: 65, category: "Desserts", imagekeywords: "cheesecake,berries" },
  { id: "12", name: "Crème Brûlée", description: "Vanilla custard, caramelised sugar", price: 60, category: "Desserts", imagekeywords: "creme,brulee" },
];

/* =========================================================================
   Reusable helpers (pure functions)
========================================================================= */

const formatRand = (amount: number): string => `R ${amount.toFixed(2)}`;

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

interface MenuStats {
  total: number;
  average: number;
  perCourse: Record<Category, number>;
}

/** Single source of truth for every statistic shown in the app. */
const calculateStats = (dishes: Dish[]): MenuStats => {
  const total = dishes.length;
  const sum = dishes.reduce((acc, d) => acc + d.price, 0);
  const perCourse = CATEGORIES.reduce(
    (acc, c) => ({ ...acc, [c]: dishes.filter((d) => d.category === c).length }),
    {} as Record<Category, number>
  );
  return { total, average: total === 0 ? 0 : sum / total, perCourse };
};

/* =========================================================================
   Reusable UI components
========================================================================= */

interface ScreenFrameProps {
  title: string;
  onBack?: () => void;
  toast?: ToastMessage | null;
  children: React.ReactNode;
}

/** Shared frame: status bar, green header, optional back link and toast. */
const ScreenFrame: React.FC<ScreenFrameProps> = ({ title, onBack, toast, children }) => (
  <div style={FRAME_STYLE}>
    <div style={{ backgroundColor: COLORS.primary, color: COLORS.primaryText, fontSize: 12, padding: "6px 16px 0", display: "flex", justifyContent: "space-between" }}>
      {onBack ? (
        <button onClick={onBack} style={{ all: "unset", cursor: "pointer", opacity: 0.9 }}>← Back</button>
      ) : (
        <span />
      )}
      <span>9:41</span>
    </div>
    <div style={{ backgroundColor: COLORS.primary, color: COLORS.primaryText, padding: "12px 20px 20px", fontSize: 20, fontWeight: 700 }}>
      {title}
    </div>
    {toast && (
      <div
        role="status"
        style={{
          margin: "12px 20px 0",
          padding: "10px 12px",
          borderRadius: 8,
          fontSize: 12.5,
          fontWeight: 600,
          backgroundColor: toast.type === "success" ? COLORS.successBg : COLORS.errorBg,
          color: toast.type === "success" ? COLORS.primary : COLORS.errorText,
        }}
      >
        {toast.text}
      </div>
    )}
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "soft" | "danger";
}

const BUTTON_VARIANTS: Record<NonNullable<ButtonProps["variant"]>, React.CSSProperties> = {
  primary: { backgroundColor: COLORS.primary, color: COLORS.primaryText, border: "none" },
  secondary: { backgroundColor: COLORS.background, color: COLORS.textPrimary, border: `1.5px solid ${COLORS.textPrimary}` },
  soft: { backgroundColor: COLORS.surface, color: COLORS.primary, border: `1px solid ${COLORS.border}` },
  danger: { backgroundColor: COLORS.errorText, color: COLORS.primaryText, border: "none" },
};

const Button: React.FC<ButtonProps> = ({ variant = "primary", style, ...props }) => (
  <button
    {...props}
    style={{ width: "100%", borderRadius: 8, padding: "13px 0", fontSize: 14.5, fontWeight: 700, cursor: "pointer", ...BUTTON_VARIANTS[variant], ...style }}
  />
);

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, error, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 6, display: "block" }}>
      {label}
    </label>
    {children}
    {error && <div style={{ fontSize: 11, color: COLORS.errorText, marginTop: 4 }}>{error}</div>}
  </div>
);

interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
}

/** "Add" button that turns into a - 1 + control once a dish is in the order. */
const QuantityStepper: React.FC<QuantityStepperProps> = ({ quantity, onChange }) => {
  const pill: React.CSSProperties = { border: `1px solid ${COLORS.primary}`, borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer", color: COLORS.primary, backgroundColor: COLORS.background };
  const change = (e: React.MouseEvent, next: number) => { e.stopPropagation(); onChange(next); };

  if (quantity === 0) {
    return <button aria-label="Add to order" onClick={(e) => change(e, 1)} style={{ ...pill, padding: "4px 14px" }}>Add</button>;
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
      <button aria-label="Remove one" onClick={(e) => change(e, quantity - 1)} style={{ ...pill, width: 26, height: 26, padding: 0 }}>−</button>
      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 14, textAlign: "center" }}>{quantity}</span>
      <button aria-label="Add one more" onClick={(e) => change(e, quantity + 1)} style={{ ...pill, width: 26, height: 26, padding: 0, backgroundColor: COLORS.primary, color: COLORS.primaryText }}>+</button>
    </div>
  );
};

interface ConfirmDialogProps {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ message, confirmLabel, onConfirm, onCancel }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 10 }}>
    <div role="alertdialog" style={{ backgroundColor: COLORS.background, borderRadius: 12, padding: 20, width: "100%" }}>
      <div style={{ fontSize: 14, color: COLORS.textPrimary, marginBottom: 16, lineHeight: 1.4 }}>{message}</div>
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="secondary" onClick={onCancel} style={{ padding: "10px 0" }}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} style={{ padding: "10px 0" }}>{confirmLabel}</Button>
      </div>
    </div>
  </div>
);

/** Used on the home screen so every statistic is presented the same way. */
const StatsPanel: React.FC<{ stats: MenuStats }> = ({ stats }) => {
  const rows: [string, string][] = [
    ["Total dishes", String(stats.total)],
    ["Average price", formatRand(stats.average)],
    ...CATEGORIES.map((c): [string, string] => [c, String(stats.perCourse[c])]),
  ];
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "6px 16px" }}>
      {rows.map(([label, value], i) => (
        <div
          key={label}
          style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: 13.5, borderTop: i === 0 ? "none" : `1px solid ${COLORS.divider}`, fontWeight: i < 2 ? 700 : 400, color: i < 2 ? COLORS.textPrimary : COLORS.textSecondary }}
        >
          <span>{label}</span>
          <span style={{ color: i < 2 ? COLORS.primary : COLORS.textPrimary }}>{value}</span>
        </div>
      ))}
    </div>
  );
};

/* =========================================================================
   1. Login
========================================================================= */

interface LoginErrors { email?: string; password?: string }

const LoginScreen: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const handleSignIn = () => {
    const next: LoginErrors = {};
    if (!email.trim()) next.email = "Enter your email address";
    else if (!isValidEmail(email.trim())) next.email = "Enter a valid email, like chef@example.com";
    if (!password) next.password = "Enter your password";
    else if (password.length < 6) next.password = "Password must contain at least 6 characters";
    setErrors(next);
    if (Object.keys(next).length === 0) onSuccess();
  };

  return (
    <ScreenFrame title="Sign In">
      <div style={{ padding: "25px 20px", flex: 1 }}>
        <Field label="Email Address" error={errors.email}>
          <input
            type="email"
            placeholder="e.g. chef@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            style={inputStyle(!!errors.email)}
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              style={{ ...inputStyle(!!errors.password), paddingRight: 70 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: COLORS.primary, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        <Button onClick={handleSignIn} style={{ marginBottom: 12 }}>Sign In</Button>
        <Button variant="secondary" onClick={onSuccess}>Create Account</Button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
          <span style={{ fontSize: 11, color: COLORS.textSecondary }}>OR</span>
          <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
        </div>

        <Button variant="soft" onClick={onSuccess} style={{ fontSize: 13, padding: "12px 0" }}>Continue to Menu</Button>
      </div>
    </ScreenFrame>
  );
};

/* =========================================================================
   2. Loading
========================================================================= */

const LoadingScreen: React.FC<{ onFinished: () => void }> = ({ onFinished }) => {
  useEffect(() => {
    const timer = setTimeout(onFinished, 1400);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div style={{ ...FRAME_STYLE, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center", color: COLORS.primaryText }}>
      <div style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryText, color: COLORS.primary, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 28, fontWeight: 800, marginBottom: 20 }}>C</div>
      <div style={{ fontSize: 25, fontWeight: 800, marginBottom: 8 }}>Christoffel's Menu</div>
      <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 35 }}>Personalised culinary experiences</div>
      <div style={{ width: 28, height: 28, border: "3px solid rgba(255,255,255,0.35)", borderTop: "3px solid white", borderRadius: "50%", animation: "chef-spin 1s linear infinite" }} />
      <style>{`@keyframes chef-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

/* =========================================================================
   3. Menu manager (home) with statistics
========================================================================= */

interface MenuManagerScreenProps {
  stats: MenuStats;
  toast: ToastMessage | null;
  onViewMenu: () => void;
  onAddDish: () => void;
}

const MenuManagerScreen: React.FC<MenuManagerScreenProps> = ({ stats, toast, onViewMenu, onAddDish }) => (
  <ScreenFrame title="Christoffel's Menu" toast={toast}>
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.textPrimary }}>Restaurant Menu Manager</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: COLORS.textSecondary }}>Add, edit and review your dishes.</p>
      </div>
      <Button onClick={onViewMenu}>View Menu</Button>
      <Button variant="secondary" onClick={onAddDish}>Add New Dish</Button>
      <StatsPanel stats={stats} />
    </div>
  </ScreenFrame>
);

/* =========================================================================
   4. Menu list: search, filter, clear
========================================================================= */

type ImageSource = Pick<Dish, "name" | "category" | "imageUrl">;

const keywordsFromName = (name: string): string => name.split(" ").slice(0, 2).join(",");

/* ---- Built-in dish illustrations (inline SVG, work offline, no external images) ---- */

type ArtKey = "bread" | "salad" | "bruschetta" | "soup" | "chicken" | "steak" | "pasta" | "pizza" | "curry" | "fondant" | "cheesecake" | "brulee" | "plate";

const Plate = (
  <>
    <ellipse cx="52" cy="46" rx="31" ry="30" fill="#000000" opacity="0.13" />
    <circle cx="50" cy="40" r="30" fill="url(#plateGrad)" stroke="#D9D9D2" strokeWidth="0.6" />
    <circle cx="50" cy="40" r="23" fill="none" stroke="#E4E4DE" strokeWidth="1.5" />
  </>
);

const ART_BG: Record<ArtKey, string> = {
  bread: "#F3E3C3", salad: "#E6F0DF", bruschetta: "#F6E6CF", soup: "#FBEBD0", chicken: "#EDE6DA", steak: "#EAE3DC", pasta: "#F3EADB",
  pizza: "#F6E3C8", curry: "#FBEFD0", fondant: "#EFE4DC", cheesecake: "#F8E9EE", brulee: "#FBEFD6", plate: "#ECEFEA",
};

const ART: Record<ArtKey, React.ReactNode> = {
  bread: (
    <g transform="rotate(-18 50 40)">
      <rect x="12" y="28" width="76" height="24" rx="12" fill="#C98F43" />
      <rect x="16" y="31" width="68" height="18" rx="9" fill="#F2D494" />
      {[26, 38, 50, 62, 74].map((x) => <circle key={x} cx={x} cy="40" r="2.2" fill="#5E8C4A" />)}
    </g>
  ),
  salad: (
    <>
      {Plate}
      {[[40, 34], [58, 34], [49, 50]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="9" fill="#D9442F" /><circle cx={x} cy={y} r="6" fill="#FBF6EA" /></g>
      ))}
      <ellipse cx="49" cy="40" rx="6" ry="3" fill="#3F8F4A" transform="rotate(30 49 40)" />
      <ellipse cx="38" cy="46" rx="5" ry="2.5" fill="#3F8F4A" transform="rotate(-30 38 46)" />
      <ellipse cx="60" cy="46" rx="5" ry="2.5" fill="#3F8F4A" transform="rotate(20 60 46)" />
    </>
  ),
  bruschetta: (
    <>
      <rect x="10" y="20" width="80" height="38" rx="6" fill="#B07A45" />
      {[16, 40, 64].map((x) => (
        <g key={x}>
          <rect x={x} y="25" width="22" height="28" rx="4" fill="#E2B76E" />
          <rect x={x + 3} y="29" width="16" height="20" rx="3" fill="#D9442F" />
          <circle cx={x + 11} cy="39" r="3" fill="#3F8F4A" />
        </g>
      ))}
    </>
  ),
  soup: (
    <>
      <path d="M20 34h60c0 18-12 30-30 30S20 52 20 34z" fill="#FFFFFF" stroke="#D9D9D2" />
      <ellipse cx="50" cy="34" rx="30" ry="6" fill="#E88B3A" />
      <path d="M40 24c-4-4 4-6 0-11M52 24c-4-4 4-6 0-11M64 24c-4-4 4-6 0-11" stroke="#C9B79A" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  chicken: (
    <>
      {Plate}
      <ellipse cx="46" cy="42" rx="18" ry="11" fill="#C98A4B" transform="rotate(-15 46 42)" />
      <path d="M36 40l8 8M44 36l8 8M52 32l8 8" stroke="#8C5A2B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="68" cy="30" r="5" fill="#E98A2D" />
      <circle cx="30" cy="54" r="4" fill="#4E9A4B" />
      <circle cx="70" cy="50" r="4" fill="#4E9A4B" />
    </>
  ),
  steak: (
    <>
      {Plate}
      <rect x="26" y="28" width="34" height="26" rx="12" fill="#6E2F22" />
      <rect x="31" y="33" width="24" height="16" rx="8" fill="#9C4A35" />
      {[62, 68, 74].map((x) => <rect key={x} x={x} y="30" width="5" height="22" rx="2" fill="#F0C75E" transform={`rotate(10 ${x} 41)`} />)}
    </>
  ),
  pasta: (
    <>
      {Plate}
      <circle cx="48" cy="40" r="14" fill="none" stroke="#F0CE72" strokeWidth="4" />
      <circle cx="48" cy="40" r="8" fill="none" stroke="#E6B955" strokeWidth="4" />
      <circle cx="48" cy="40" r="2.5" fill="#F0CE72" />
      <path d="M62 26c8 0 10 10 3 13" stroke="#F08A62" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M30 54c-6-6 2-14 9-10" stroke="#F08A62" strokeWidth="5" fill="none" strokeLinecap="round" />
    </>
  ),
  pizza: (
    <>
      <circle cx="50" cy="40" r="31" fill="#E3A857" />
      <circle cx="50" cy="40" r="26" fill="#D9452B" />
      {[[40, 32], [58, 36], [46, 50], [62, 50], [34, 46]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill="#F8E7A8" />)}
      <ellipse cx="50" cy="40" rx="5" ry="2.5" fill="#3F8F4A" transform="rotate(25 50 40)" />
      <ellipse cx="40" cy="42" rx="4" ry="2" fill="#3F8F4A" transform="rotate(-25 40 42)" />
      <ellipse cx="58" cy="28" rx="4" ry="2" fill="#3F8F4A" transform="rotate(40 58 28)" />
    </>
  ),
  curry: (
    <>
      <path d="M16 36h68c0 18-14 28-34 28S16 54 16 36z" fill="#FFFFFF" stroke="#D9D9D2" />
      <ellipse cx="50" cy="36" rx="34" ry="7" fill="#E0A030" />
      <circle cx="36" cy="35" r="4" fill="#E9742D" />
      <circle cx="52" cy="38" r="3.5" fill="#4E9A4B" />
      <circle cx="66" cy="34" r="4" fill="#D9442F" />
      <ellipse cx="50" cy="28" rx="13" ry="7" fill="#FFFDF5" stroke="#E4E4DE" />
    </>
  ),
  fondant: (
    <>
      {Plate}
      <path d="M30 52c0-17 8-24 18-24s18 7 18 24z" fill="#5B2E1E" />
      <ellipse cx="48" cy="31" rx="7" ry="3" fill="#8A4A2D" />
      <circle cx="68" cy="38" r="8" fill="#FFF1C9" />
      <path d="M36 54c8 3 20 3 28 0" stroke="#8A4A2D" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  cheesecake: (
    <>
      {Plate}
      <polygon points="26,50 74,50 74,40 26,32" fill="#FBE9B7" />
      <polygon points="26,32 74,40 74,44 26,36" fill="#B0294F" />
      <rect x="26" y="50" width="48" height="5" fill="#B9794A" />
      <circle cx="36" cy="31" r="3.5" fill="#5B2A86" />
      <circle cx="46" cy="32" r="3.5" fill="#D9244F" />
      <circle cx="58" cy="35" r="3.5" fill="#5B2A86" />
    </>
  ),
  brulee: (
    <>
      <path d="M22 38c0 18 10 26 28 26s28-8 28-26z" fill="#FFFFFF" stroke="#D9D9D2" />
      <ellipse cx="50" cy="38" rx="28" ry="9" fill="#FFFFFF" stroke="#D9D9D2" />
      <ellipse cx="50" cy="38" rx="24" ry="7" fill="#E0A63A" />
      <ellipse cx="44" cy="36" rx="8" ry="2" fill="#F4CE7A" />
    </>
  ),
  plate: (
    <>
      {Plate}
      <circle cx="50" cy="40" r="12" fill="#C98A4B" />
      <circle cx="60" cy="35" r="5" fill="#4E9A4B" />
      <path d="M12 22v36M8 22v9M16 22v9" stroke="#9A9A9A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M88 22v36" stroke="#9A9A9A" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
};

/** First matching word in the dish name wins; otherwise the course decides. */
const ART_RULES: [RegExp, ArtKey][] = [
  [/garlic|bread/i, "bread"], [/caprese|salad/i, "salad"], [/bruschetta/i, "bruschetta"], [/soup/i, "soup"],
  [/chicken/i, "chicken"], [/beef|steak|fillet/i, "steak"], [/linguine|pasta|spaghetti|seafood/i, "pasta"],
  [/pizza|margherita/i, "pizza"], [/curry/i, "curry"], [/fondant|chocolate/i, "fondant"],
  [/cheesecake/i, "cheesecake"], [/br.l/i, "brulee"],
];
const CATEGORY_ART: Record<Category, ArtKey> = { Starters: "salad", Mains: "plate", Desserts: "cheesecake" };

const pickArt = (name: string, category: Category): ArtKey =>
  ART_RULES.find(([pattern]) => pattern.test(name))?.[1] ?? CATEGORY_ART[category];

interface DishImageProps {
  dish: ImageSource;
  alt: string;
  width: number | string;
  height: number;
  radius?: number;
}

/** "Crème Brûlée" -> "creme-brulee": the file name looked for in /public/dishes/. */
const photoSlug = (name: string): string =>
  name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Image priority: 1) photo uploaded in the form, 2) real photo file at /dishes/<dish-name>.jpg,
 * 3) built-in illustration. The illustration stays underneath, so a missing file never shows a broken image.
 */
const DishImage: React.FC<DishImageProps> = ({ dish, alt, width, height, radius = 10 }) => {
  const key = pickArt(dish.name, dish.category);
  const photoSrc = dish.imageUrl ?? `/dishes/${photoSlug(dish.name)}.jpg`;
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setFailed(false); setLoaded(false); }, [photoSrc]);

  return (
    <div style={{ position: "relative", width, height, borderRadius: radius, backgroundColor: ART_BG[key], flexShrink: 0, overflow: "hidden" }}>
      {!dish.imageUrl && (
        <svg viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" role="img" aria-label={alt} style={{ display: "block" }}>
          <defs>
            <radialGradient id="plateGrad" cx="40%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E9E9E3" />
            </radialGradient>
          </defs>
          <rect width="100" height="75" fill={ART_BG[key]} />
          {ART[key]}
        </svg>
      )}
      {!failed && (
        <img
          src={photoSrc}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: loaded ? 1 : 0, transition: "opacity 0.25s" }}
        />
      )}
    </div>
  );
};

interface DishRowProps {
  dish: Dish;
  quantity: number;
  onClick: () => void;
  onQuantityChange: (quantity: number) => void;
}

const DishRow: React.FC<DishRowProps> = ({ dish, quantity, onClick, onQuantityChange }) => (
  <div
    onClick={onClick}
    role="button"
    style={{ display: "flex", alignItems: "center", gap: 12, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12, marginBottom: 10, cursor: "pointer" }}
  >
    <DishImage dish={dish} alt={dish.name} width={56} height={56} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.textPrimary }}>{dish.name}</div>
      <div style={{ fontSize: 12.5, color: COLORS.textSecondary, marginTop: 2 }}>{dish.description}</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary, whiteSpace: "nowrap" }}>{formatRand(dish.price)}</div>
      <QuantityStepper quantity={quantity} onChange={onQuantityChange} />
    </div>
  </div>
);

interface MenuListScreenProps {
  items: Dish[];
  quantities: Record<string, number>;
  toast: ToastMessage | null;
  onAddDish: () => void;
  onSelectDish: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onViewOrder: () => void;
  onBack: () => void;
}

const MenuListScreen: React.FC<MenuListScreenProps> = ({ items, quantities, toast, onAddDish, onSelectDish, onQuantityChange, onViewOrder, onBack }) => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");

  const isFiltering = search.trim() !== "" || activeFilter !== "All";
  const clearAll = () => { setSearch(""); setActiveFilter("All"); };

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(
      (d) => (activeFilter === "All" || d.category === activeFilter) && d.name.toLowerCase().includes(query)
    );
  }, [items, search, activeFilter]);

  const visibleCategories = CATEGORIES.filter((c) => filteredItems.some((d) => d.category === c));
  const orderCount = items.reduce((sum, d) => sum + (quantities[d.id] ?? 0), 0);
  const orderTotal = items.reduce((sum, d) => sum + (quantities[d.id] ?? 0) * d.price, 0);

  return (
    <ScreenFrame title="Menu Items" onBack={onBack} toast={toast}>
      <div style={{ padding: "16px 20px 90px", flex: 1, overflowY: "auto" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dishes by name..."
          style={{ ...inputStyle(), padding: "10px 12px", fontSize: 14, marginBottom: 12 }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {FILTER_OPTIONS.map((option) => {
            const active = activeFilter === option;
            return (
              <button
                key={option}
                onClick={() => setActiveFilter(option)}
                style={{ border: `1px solid ${COLORS.primary}`, borderRadius: 999, padding: "5px 14px", fontSize: 12.5, fontWeight: 600, backgroundColor: active ? COLORS.primary : COLORS.background, color: active ? COLORS.primaryText : COLORS.primary, cursor: "pointer" }}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: 12, color: COLORS.textSecondary }}>
          <span>Showing {filteredItems.length} of {items.length} dishes</span>
          {isFiltering && (
            <button onClick={clearAll} style={{ border: "none", background: "none", color: COLORS.primary, fontWeight: 700, fontSize: 12, cursor: "pointer", padding: 0 }}>
              Clear search and filter
            </button>
          )}
        </div>

        {filteredItems.length === 0 && (
          <div style={{ color: COLORS.textSecondary, fontSize: 13 }}>
            {items.length === 0 ? "Your menu is empty. Tap + to add your first dish." : "No dishes match. Try a different name or clear the filter."}
          </div>
        )}

        {visibleCategories.map((category) => (
          <div key={category} style={{ marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: COLORS.textPrimary }}>{category}</h3>
            {filteredItems.filter((d) => d.category === category).map((dish) => (
              <DishRow key={dish.id} dish={dish} quantity={quantities[dish.id] ?? 0} onClick={() => onSelectDish(dish.id)} onQuantityChange={(q) => onQuantityChange(dish.id, q)} />
            ))}
          </div>
        ))}
      </div>

      {orderCount > 0 && (
        <button
          onClick={onViewOrder}
          style={{ position: "absolute", bottom: 20, left: 20, right: 84, height: 52, borderRadius: 26, border: "none", backgroundColor: COLORS.primary, color: COLORS.primaryText, fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 18px" }}
        >
          <span>View order ({orderCount})</span>
          <span>{formatRand(orderTotal)}</span>
        </button>
      )}

      <button
        onClick={onAddDish}
        aria-label="Add new dish"
        style={{ position: "absolute", bottom: 20, right: 20, width: 52, height: 52, borderRadius: "50%", backgroundColor: COLORS.primary, color: COLORS.primaryText, border: "none", fontSize: 24, cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.25)" }}
      >
        +
      </button>
    </ScreenFrame>
  );
};

/* =========================================================================
   5. Dish details (edit / delete with confirmation)
========================================================================= */

interface DishDetailsScreenProps {
  dish: Dish;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onViewReceipt: () => void;
}

const DishDetailsScreen: React.FC<DishDetailsScreenProps> = ({ dish, quantity, onQuantityChange, onEdit, onDelete, onBack, onViewReceipt }) => {
  const [confirming, setConfirming] = useState(false);

  return (
    <ScreenFrame title="Dish Details" onBack={onBack}>
      <div style={{ padding: "20px 20px 24px" }}>
        <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <DishImage dish={dish} alt={dish.name} width="100%" height={150} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 6 }}>{dish.name}</div>
          <div style={{ fontSize: 12.5, color: COLORS.textSecondary }}>Course: {CATEGORY_TO_COURSE[dish.category]}</div>
          <div style={{ fontSize: 12.5, color: COLORS.textSecondary, marginBottom: 10 }}>Price: {formatRand(dish.price)}</div>
          <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.4 }}>
            {dish.description || "No description added."}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Button onClick={onEdit} style={{ padding: "12px 0", fontSize: 14 }}>Edit</Button>
          <Button variant="secondary" onClick={() => setConfirming(true)} style={{ padding: "12px 0", fontSize: 14 }}>Delete</Button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, padding: "10px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{quantity > 0 ? "In your order" : "Add to order"}</span>
          <QuantityStepper quantity={quantity} onChange={onQuantityChange} />
        </div>
        <Button variant="soft" onClick={onViewReceipt} style={{ marginTop: 12, fontSize: 13, padding: "12px 0" }}>View Receipt</Button>
      </div>

      {confirming && (
        <ConfirmDialog
          message={`Delete "${dish.name}" from the menu? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirming(false)}
          onConfirm={onDelete}
        />
      )}
    </ScreenFrame>
  );
};

/* =========================================================================
   6. Add / edit dish
========================================================================= */

interface FormState { name: string; description: string; course: Course | ""; price: string }
interface FormErrors { name?: string; course?: string; price?: string }

interface DishFormScreenProps {
  title: string;
  initialValues?: FormState;
  initialImageUrl?: string;
  /** Names already on the menu (excluding the dish being edited). */
  takenNames: string[];
  onSave: (value: DishFormValue) => void;
  onCancel: () => void;
}

const EMPTY_FORM: FormState = { name: "", description: "", course: "", price: "" };

const DishFormScreen: React.FC<DishFormScreenProps> = ({ title, initialValues = EMPTY_FORM, initialImageUrl, takenNames, onSave, onCancel }) => {
  const [values, setValues] = useState<FormState>(initialValues);
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setValues((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleImageChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setImageError("Please choose an image file (JPG or PNG)"); return; }
    if (file.size > 2 * 1024 * 1024) { setImageError("Image is too large. Choose one under 2 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { setImageUrl(String(reader.result)); setImageError(""); };
    reader.onerror = () => setImageError("Could not read that image. Try another one");
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const next: FormErrors = {};
    const name = values.name.trim();
    const price = Number(values.price);

    if (!name) next.name = "Enter a dish name";
    else if (takenNames.some((n) => n.toLowerCase() === name.toLowerCase())) next.name = "A dish with this name already exists";
    if (!values.course) next.course = "Select a course";
    if (!values.price.trim() || Number.isNaN(price) || price <= 0) next.price = "Enter a price greater than 0, like 120.00";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave({ name, description: values.description.trim(), course: values.course as Course, price, imageUrl });
  };

  return (
    <ScreenFrame title={title} onBack={onCancel}>
      <div style={{ padding: "20px 20px 24px" }}>
        <Field label="Dish Name" error={errors.name}>
          <input type="text" placeholder="e.g. Grilled Chicken" maxLength={40} value={values.name} onChange={(e) => update("name", e.target.value)} style={inputStyle(!!errors.name)} />
        </Field>

        <Field label="Description (optional)">
          <textarea placeholder="Short description of the dish" maxLength={90} rows={3} value={values.description} onChange={(e) => update("description", e.target.value)} style={{ ...inputStyle(), resize: "vertical" }} />
        </Field>

        <Field label="Course" error={errors.course}>
          <select value={values.course} onChange={(e) => update("course", e.target.value as Course)} style={{ ...inputStyle(!!errors.course), color: values.course ? COLORS.textPrimary : "#9A9A9A" }}>
            <option value="" disabled>Select course</option>
            {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Price (R)" error={errors.price}>
          <input type="text" inputMode="decimal" placeholder="e.g. 120.00" value={values.price} onChange={(e) => update("price", e.target.value)} style={inputStyle(!!errors.price)} />
        </Field>

        <Field label="Photo (optional)" error={imageError}>
          {imageUrl ? (
            <div>
              <img src={imageUrl} alt="Dish preview" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, display: "block", marginBottom: 8 }} />
              <Button variant="soft" onClick={() => setImageUrl(undefined)} style={{ padding: "8px 0", fontSize: 12.5 }}>Remove photo</Button>
            </div>
          ) : (
            <>
              <input type="file" accept="image/*" onChange={handleImageChosen} style={{ ...inputStyle(!!imageError), padding: 8, fontSize: 12.5 }} />
              <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>No photo? An illustration matching the dish name is shown automatically.</div>
            </>
          )}
        </Field>

        <Button onClick={handleSave} style={{ marginBottom: 12 }}>Save Menu Item</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </ScreenFrame>
  );
};

/* =========================================================================
   7. Receipt
========================================================================= */

interface ReceiptScreenProps {
  items: ReceiptItem[];
  taxRatePercent?: number;
  onQuantityChange: (id: string, quantity: number) => void;
  onDone: () => void;
  onAddMore: () => void;
  onNewOrder: () => void;
}

const ReceiptScreen: React.FC<ReceiptScreenProps> = ({ items, taxRatePercent = 15, onQuantityChange, onDone, onAddMore, onNewOrder }) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * (taxRatePercent / 100);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const summaryRow = (label: string, value: string): React.ReactNode => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );

  return (
    <ScreenFrame title="Receipt" onBack={onAddMore}>
      <div style={{ padding: "20px 20px 24px", flex: 1 }}>
        <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          {items.length === 0 ? (
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 12, lineHeight: 1.4 }}>
              No dishes selected yet. Go to the menu and tap Add on the dishes you want.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} style={{ borderBottom: `1px solid ${COLORS.divider}`, paddingBottom: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <DishImage dish={item} alt={item.name} width={40} height={40} radius={8} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{item.name}</span>
                  </div>
                  <QuantityStepper quantity={item.quantity} onChange={(q) => onQuantityChange(item.id, q)} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{item.quantity} × {formatRand(item.price)}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary }}>{formatRand(item.price * item.quantity)}</span>
                </div>
              </div>
            ))
          )}
          {summaryRow(`Items (${itemCount})`, formatRand(subtotal))}
          {summaryRow(`VAT (${taxRatePercent}%)`, formatRand(tax))}
          <div style={{ borderTop: `1px solid ${COLORS.border}`, margin: "4px 0 12px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>{formatRand(subtotal + tax)}</span>
          </div>
        </div>
        <Button onClick={onDone} disabled={items.length === 0} style={{ marginBottom: 12, opacity: items.length === 0 ? 0.5 : 1 }}>Done</Button>
        <Button variant="secondary" onClick={onAddMore} style={{ marginBottom: 12 }}>Add More Dishes</Button>
        <Button variant="soft" onClick={onNewOrder} style={{ fontSize: 13, padding: "12px 0" }}>Start New Order</Button>
      </div>
    </ScreenFrame>
  );
};

/* =========================================================================
   App shell: navigation + all menu data changes live here
   Login → Loading → Home ⇄ Menu list ⇄ Dish details ⇄ Add/Edit, Receipt
========================================================================= */

type Screen = "login" | "loading" | "manager" | "menu" | "details" | "form" | "receipt";

const SCREEN_LABELS: Record<Screen, string> = {
  login: "Login", loading: "Loading", manager: "Home", menu: "Menu list", details: "Dish details", form: "Add / edit dish", receipt: "Receipt",
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("login");
  const [dishes, setDishes] = useState<Dish[]>(initialDishes);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  // Dish id -> quantity. The receipt is built from this, so it always matches what was selected.
  const [order, setOrder] = useState<Record<string, number>>({});

  const selectedDish = dishes.find((d) => d.id === selectedDishId) ?? null;
  const editingDish = dishes.find((d) => d.id === editingDishId) ?? null;
  const stats = useMemo(() => calculateStats(dishes), [dishes]);
  // Built from the live menu, so edited names/prices update and deleted dishes drop off.
  const receiptItems: ReceiptItem[] = useMemo(
    () => dishes.filter((d) => (order[d.id] ?? 0) > 0).map((d) => ({ id: d.id, name: d.name, quantity: order[d.id], price: d.price, category: d.category, imageUrl: d.imageUrl })),
    [dishes, order]
  );

  const setQuantity = (id: string, quantity: number) =>
    setOrder((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return quantity > 0 ? { ...rest, [id]: quantity } : rest;
    });

  const clearOrder = () => setOrder({});

  // Messages disappear on their own after a few seconds.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const goTo = (next: Screen) => { setToast(null); setScreen(next); };
  const openForm = (dishId: string | null) => { setEditingDishId(dishId); goTo("form"); };
  const finishLoading = React.useCallback(() => setScreen("manager"), []);

  const handleSaveDish = (values: DishFormValue) => {
    const category = COURSE_TO_CATEGORY[values.course];
    const { name, description, price, imageUrl } = values;

    if (editingDishId) {
      setDishes((prev) => prev.map((d) => (d.id === editingDishId ? { ...d, name, description, price, category, imageUrl, imagekeywords: keywordsFromName(name) } : d)));
    } else {
      const newDish: Dish = { id: String(Date.now()), name, description, price, category, imageUrl, imagekeywords: keywordsFromName(name) };
      setDishes((prev) => [...prev, newDish]);
    }
    setToast({ text: editingDishId ? `"${name}" updated` : `"${name}" added to the menu`, type: "success" });
    setEditingDishId(null);
    setScreen("menu");
  };

  const handleDeleteDish = () => {
    if (!selectedDish) return;
    setDishes((prev) => prev.filter((d) => d.id !== selectedDish.id));
    setQuantity(selectedDish.id, 0);
    setToast({ text: `"${selectedDish.name}" deleted`, type: "success" });
    setSelectedDishId(null);
    setScreen("menu");
  };

  let content: React.ReactNode = null;
  switch (screen) {
    case "login":
      content = <LoginScreen onSuccess={() => goTo("loading")} />;
      break;
    case "loading":
      content = <LoadingScreen onFinished={finishLoading} />;
      break;
    case "manager":
      content = <MenuManagerScreen stats={stats} toast={toast} onViewMenu={() => goTo("menu")} onAddDish={() => openForm(null)} />;
      break;
    case "menu":
      content = (
        <MenuListScreen
          items={dishes}
          quantities={order}
          toast={toast}
          onQuantityChange={setQuantity}
          onViewOrder={() => goTo("receipt")}
          onBack={() => goTo("manager")}
          onAddDish={() => openForm(null)}
          onSelectDish={(id) => { setSelectedDishId(id); goTo("details"); }}
        />
      );
      break;
    case "details":
      content = selectedDish ? (
        <DishDetailsScreen
          dish={selectedDish}
          quantity={order[selectedDish.id] ?? 0}
          onQuantityChange={(q) => setQuantity(selectedDish.id, q)}
          onBack={() => goTo("menu")}
          onEdit={() => openForm(selectedDish.id)}
          onDelete={handleDeleteDish}
          onViewReceipt={() => goTo("receipt")}
        />
      ) : (
        <ScreenFrame title="Dish Details" onBack={() => goTo("menu")}>
          <div style={{ padding: 20, color: COLORS.textSecondary }}>Select a dish from the menu to see its details.</div>
        </ScreenFrame>
      );
      break;
    case "form":
      content = (
        <DishFormScreen
          key={editingDishId ?? "new"}
          title={editingDish ? "Edit Menu Item" : "Add Menu Item"}
          initialImageUrl={editingDish?.imageUrl}
          initialValues={
            editingDish
              ? { name: editingDish.name, description: editingDish.description, course: CATEGORY_TO_COURSE[editingDish.category], price: String(editingDish.price) }
              : undefined
          }
          takenNames={dishes.filter((d) => d.id !== editingDishId).map((d) => d.name)}
          onSave={handleSaveDish}
          onCancel={() => { setEditingDishId(null); goTo("menu"); }}
        />
      );
      break;
    case "receipt":
      content = (
        <ReceiptScreen
          items={receiptItems}
          onQuantityChange={setQuantity}
          onAddMore={() => goTo("menu")}
          onDone={() => { clearOrder(); setScreen("manager"); setToast({ text: "Order complete. Thank you!", type: "success" }); }}
          onNewOrder={() => { clearOrder(); goTo("menu"); }}
        />
      );
      break;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 12px", fontFamily: FONT }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {(Object.entries(SCREEN_LABELS) as [Screen, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => goTo(key)}
            style={{ border: `1px solid ${COLORS.border}`, borderRadius: 999, padding: "5px 12px", fontSize: 11.5, fontWeight: 600, backgroundColor: screen === key ? COLORS.primary : COLORS.surface, color: screen === key ? COLORS.primaryText : COLORS.textSecondary, cursor: "pointer" }}
          >
            {label}
          </button>
        ))}
      </div>
      {content}
    </div>
  );
};

export default App;