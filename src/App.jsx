// At the top of App.js
import React, { useEffect, useMemo, useState, useRef } from "react";
// import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, UserPlus, LogIn, LogOut, Store, GraduationCap, ShieldCheck, Users2, Package, Plus, CreditCard, CheckCircle, XCircle, Search, Filter, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import "./App.css";

// ---------- Utilities ----------
const LS_KEYS = {
  USERS: "rep_users",
  SESSION: "rep_session",
  PRODUCTS: "rep_products",
  ORDERS: "rep_orders",
  COURSES: "rep_courses",
  TIPS: "rep_tips",
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function load(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

// ---------- Seed demo data on first run ----------
function useBootstrap() {
  useEffect(() => {
    const users = load(LS_KEYS.USERS, null);
    if (!users) {
      const admin = { id: uid("u"), name: "Admin", email: "admin@rep.local", pass: "admin", role: "admin", approved: true, upi: "", phone: "" };
      const mentor = { id: uid("u"), name: "Anita (Mentor)", email: "mentor@rep.local", pass: "mentor", role: "mentor", approved: true, upi: "", phone: "" };
      const seller = { id: uid("u"), name: "Ramesh (Seller)", email: "seller@rep.local", pass: "seller", role: "seller", approved: true, upi: "ramesh@upi", phone: "9876543210", village: "Rampur", category: "Handicrafts" };
      const buyer = { id: uid("u"), name: "Priya (Buyer)", email: "buyer@rep.local", pass: "buyer", role: "buyer", approved: true, upi: "", phone: "" };
      save(LS_KEYS.USERS, [admin, mentor, seller, buyer]);

      const products = [
        { id: uid("p"), sellerId: seller.id, name: "Handwoven Basket", price: 499, stock: 25, image: "https://images.unsplash.com/photo-1582587822871-1b0a1b91d94d?q=80&w=1000&auto=format&fit=crop", desc: "Eco-friendly handwoven bamboo basket.", approved: true, createdAt: Date.now() },
        { id: uid("p"), sellerId: seller.id, name: "Organic Jaggery", price: 199, stock: 40, image: "https://images.unsplash.com/photo-1615486363876-7f9879cdcfd1?q=80&w=1000&auto=format&fit=crop", desc: "Chemical-free jaggery from local farms.", approved: true, createdAt: Date.now() },
      ];
      save(LS_KEYS.PRODUCTS, products);

      const courses = [
        { id: uid("c"), mentorId: mentor.id, title: "Mobile Photography for Products", level: "Beginner", format: "video", url: "https://youtu.be/dQw4w9WgXcQ", summary: "Shoot great photos with a phone to boost sales.", approved: true },
        { id: uid("c"), mentorId: mentor.id, title: "UPI & Digital Payments Basics", level: "Beginner", format: "pdf", url: "https://example.com/payments.pdf", summary: "Set up UPI, QR codes, and handle refunds.", approved: true },
      ];
      save(LS_KEYS.COURSES, courses);

      const tips = [
        { id: uid("t"), mentorId: mentor.id, text: "Use natural light for product photos and include a hand for scale.", createdAt: Date.now() },
      ];
      save(LS_KEYS.TIPS, tips);

      save(LS_KEYS.ORDERS, []);
    }
  }, []);
}

// ---------- Auth Hook ----------
// ---------- Auth Hook ----------
function useAuth() {
  const [session, setSession] = useState(() => load(LS_KEYS.SESSION, null));
  const [users, setUsers] = useState(() => load(LS_KEYS.USERS, []));

  // A ref to track if this is the first render
  const initialRender = useRef(true);

  useEffect(() => {
    // This is the FIX:
    // We check if it's the initial render. If it is, we don't save.
    // This prevents overwriting the data that useBootstrap just created.
    // On any subsequent change to 'users' (like registering a new one), it will save correctly.
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    save(LS_KEYS.USERS, users);
  }, [users]);
  
  useEffect(() => save(LS_KEYS.SESSION, session), [session]);

  const login = (email, pass) => {
    const u = users.find((x) => x.email === email && (x.pass === pass || x.password === pass));
    if (!u) throw new Error("Invalid credentials");
    if (!u.approved) throw new Error("Account not approved by admin yet.");
    setSession({ id: u.id });
  };

  const register = (payload) => {
    if (users.some((u) => u.email === payload.email)) throw new Error("Email already registered");
    const u = { id: uid("u"), approved: payload.role === "buyer", ...payload };
    setUsers((prev) => [...prev, u]);
    // Log in the new user immediately unless they need approval
    if(u.approved) {
      setSession({ id: u.id });
    }
  };
  const logout = () => setSession(null);

  const me = useMemo(() => users.find((u) => u.id === session?.id) || null, [users, session]);

  const updateUser = (id, patch) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  const removeUser = (id) => setUsers((prev) => prev.filter((u) => u.id !== id));

  return { users, me, register, login, logout, updateUser, removeUser };
}

// ---------- Data Hooks ----------
function useProducts() {
  const [products, setProducts] = useState(() => load(LS_KEYS.PRODUCTS, []));
  useEffect(() => save(LS_KEYS.PRODUCTS, products), [products]);
  const addProduct = (p) => setProducts((prev) => [{ id: uid("p"), createdAt: Date.now(), approved: false, ...p }, ...prev]);
  const updateProduct = (id, patch) => setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeProduct = (id) => setProducts((prev) => prev.filter((x) => x.id !== id));
  return { products, addProduct, updateProduct, removeProduct };
}

function useOrders() {
  const [orders, setOrders] = useState(() => load(LS_KEYS.ORDERS, []));
  useEffect(() => save(LS_KEYS.ORDERS, orders), [orders]);
  const placeOrder = (o) => setOrders((prev) => [{ id: uid("o"), createdAt: Date.now(), status: "pending", ...o }, ...prev]);
  const updateOrder = (id, patch) => setOrders((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeOrder = (id) => setOrders((prev) => prev.filter((x) => x.id !== id));
  return { orders, placeOrder, updateOrder, removeOrder };
}

function useCourses() {
  const [courses, setCourses] = useState(() => load(LS_KEYS.COURSES, []));
  useEffect(() => save(LS_KEYS.COURSES, courses), [courses]);
  const addCourse = (c) => setCourses((prev) => [{ id: uid("c"), approved: false, ...c }, ...prev]);
  const updateCourse = (id, patch) => setCourses((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeCourse = (id) => setCourses((prev) => prev.filter((x) => x.id !== id));
  return { courses, addCourse, updateCourse, removeCourse };
}

function useTips() {
  const [tips, setTips] = useState(() => load(LS_KEYS.TIPS, []));
  useEffect(() => save(LS_KEYS.TIPS, tips), [tips]);
  const addTip = (t) => setTips((prev) => [{ id: uid("t"), createdAt: Date.now(), ...t }, ...prev]);
  const removeTip = (id) => setTips((prev) => prev.filter((x) => x.id !== id));
  return { tips, addTip, removeTip };
}

// ---------- UI Primitives ----------
const Section = ({ title, desc, children, actions }) => (
  <Card className="w-full shadow-lg mb-8">
    <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-emerald-100/40 to-teal-100/40 rounded-t">
      <div>
        <CardTitle className="text-xl">{title}</CardTitle>
        {desc && <CardDescription>{desc}</CardDescription>}
      </div>
      {actions}
    </CardHeader>
    <CardContent className="py-6">{children}</CardContent>
  </Card>
);

const Empty = ({ icon: Icon, title, hint }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <Icon className="h-10 w-10 mb-3 text-emerald-400" />
    <div className="font-semibold">{title}</div>
    {hint && <div className="text-sm text-muted-foreground">{hint}</div>}
  </div>
);

// ---------- Landing / Auth ----------
function Landing({ onStart }) {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-emerald-50 to-white">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl w-full">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t">
            <CardTitle className="text-3xl">Rural Entrepreneurship Platform</CardTitle>
            <CardDescription>Direct-to-consumer sales • Courses & mentorship • No middlemen</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6 pt-6">
            <div>
              <Badge variant="secondary" className="mb-2">Why this?</Badge>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>Empowers rural sellers</li>
                <li>Secure direct payments</li>
                <li>Mentor-driven growth</li>
              </ul>
            </div>
            <div>
              <Badge variant="secondary" className="mb-2">Try Demo Accounts</Badge>
              <div className="text-sm space-y-1">
                <div><b>Admin</b>: admin@rep.local / admin</div>
                <div><b>Mentor</b>: mentor@rep.local / mentor</div>
                <div><b>Seller</b>: seller@rep.local / seller</div>
                <div><b>Buyer</b>: buyer@rep.local / buyer</div>
              </div>
            </div>
            <div>
              <Badge variant="secondary" className="mb-2">Get Started</Badge>
              <p className="text-sm mb-3">Register as buyer, seller or mentor. Admin approves accounts.</p>
              <Button onClick={onStart} className="w-full"><LogIn className="mr-2 h-4 w-4"/>Login / Register</Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4"/>Direct payments • Your money, your account</div>
            <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4"/>Free courses for sellers</div>
            <div className="flex items-center gap-2"><Store className="h-4 w-4"/>Authentic rural products</div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

function Auth({ onDone, auth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ role: "buyer" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr("");
    setLoading(true);
    try {
      if (mode === "login") await auth.login(form.email, form.pass);
      else await auth.register(form);
      onDone();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-emerald-50 to-white">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{mode === "login" ? <><LogIn/> Login</> : <><UserPlus/> Register</>}</CardTitle>
          <CardDescription>Access the platform using your role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "register" && (
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input placeholder="Your name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
            </div>
          )}
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input placeholder="you@example.com" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })}/>
          </div>
          <div className="grid gap-2">
            <Label>Password</Label>
            <Input type="password" placeholder="******" value={form.pass || ""} onChange={(e) => setForm({ ...form, pass: e.target.value })}/>
          </div>
          {mode === "register" && (
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue placeholder="Choose role"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {mode === "register" && form.role === "seller" && (
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Village / Town</Label>
                <Input value={form.village || ""} onChange={(e) => setForm({ ...form, village: e.target.value })}/>
              </div>
              <div className="grid gap-2">
                <Label>Product Category</Label>
                <Input placeholder="e.g. Handicrafts" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })}/>
              </div>
              <div className="grid gap-2">
                <Label>UPI ID (for direct payments)</Label>
                <Input placeholder="name@upi" value={form.upi || ""} onChange={(e) => setForm({ ...form, upi: e.target.value })}/>
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input placeholder="10-digit" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })}/>
              </div>
            </div>
          )}
          {err && <div className="text-red-600 text-sm">{err}</div>}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Create account" : "Have an account? Login"}
          </Button>
          <Button onClick={submit} disabled={loading}>{loading ? "..." : mode === "login" ? "Login" : "Register"}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// ---------- Catalog & Cart (Buyer) ----------
function ProductCard({ p, onAdd }) {
  return (
    <Card className="overflow-hidden shadow">
      <img src={p.image || "https://placehold.co/400x200?text=No+Image"} alt={p.name} className="h-40 w-full object-cover bg-gray-100" />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{p.name}</span>
          {p.approved ? <Badge>Approved</Badge> : <Badge variant="destructive">Pending</Badge>}
        </CardTitle>
        <CardDescription>₹ {p.price} • Stock: {p.stock}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground -mt-3">{p.desc}</CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-xs">Seller: {p.sellerName || p.sellerId}</div>
        {onAdd && <Button size="sm" onClick={() => onAdd(p)}><ShoppingCart className="mr-2 h-4 w-4"/>Add</Button>}
      </CardFooter>
    </Card>
  );
}

function BuyerDashboard({ me, users, products, placeOrder }) {
  const [q, setQ] = useState("");
  const [cart, setCart] = useState([]);

  const sellersById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);
  const catalog = useMemo(() => products.filter((p) => p.approved && p.stock > 0).map((p) => ({ ...p, sellerName: sellersById[p.sellerId]?.name || "" })), [products, sellersById]);

  const filtered = useMemo(() => catalog.filter((p) => [p.name, p.desc, p.sellerName].join(" ").toLowerCase().includes(q.toLowerCase())), [catalog, q]);
  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  const addToCart = (p) => {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: Math.min(copy[idx].qty + 1, p.stock) };
        return copy;
      }
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const updateQty = (id, qty) => setCart((prev) => prev.map((x) => (x.id === id ? { ...x, qty } : x)));
  const remove = (id) => setCart((prev) => prev.filter((x) => x.id !== id));

  const checkout = () => {
    if (!cart.length) return;
    const items = cart.map((x) => ({ productId: x.id, qty: x.qty, price: x.price, sellerId: x.sellerId }));
    const bySeller = items.reduce((acc, it) => { (acc[it.sellerId] = acc[it.sellerId] || []).push(it); return acc; }, {});
    Object.entries(bySeller).forEach(([sellerId, items]) => {
      placeOrder({ buyerId: me.id, sellerId, items, amount: items.reduce((s, i) => s + i.price * i.qty, 0), paid: false, paymentMode: "upi" });
    });
    setCart([]);
    alert("Order placed! Proceed to pay each seller directly via UPI on the Orders page.");
  };

  return (
    <div className="space-y-6">
      <Section title="Browse Products" desc="Buy authentic rural products directly from sellers. No middlemen.">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4"/>
            <Input className="pl-8" placeholder="Search products or sellers..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Badge variant="outline">{filtered.length} items</Badge>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map((p) => <ProductCard key={p.id} p={p} onAdd={addToCart} />)}
        </div>
        {!filtered.length && <Empty icon={Package} title="No products found" hint="Try a different search"/>}
      </Section>

      <Section title="Your Cart" desc="Review items and place order.">
        {!cart.length ? <Empty icon={ShoppingCart} title="Cart is empty" hint="Add products from the catalog"/> : (
          <div className="space-y-4">
            {cart.map((it) => (
              <Card key={it.id} className="shadow">
                <CardContent className="flex items-center gap-4 py-4">
                  <img src={it.image || "https://placehold.co/64x64?text=No+Image"} className="h-16 w-16 object-cover rounded bg-gray-100"/>
                  <div className="flex-1">
                    <div className="font-semibold">{it.name}</div>
                    <div className="text-xs text-muted-foreground">₹ {it.price} • Seller: {it.sellerName}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={1} max={99} value={it.qty} onChange={(e) => updateQty(it.id, Math.max(1, Math.min(Number(e.target.value)||1, it.stock)))} className="w-20"/>
                    <Button variant="ghost" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4"/></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex items-center justify-between">
              <div className="text-sm">Subtotal</div>
              <div className="font-semibold">₹ {total}</div>
            </div>
            <Button onClick={checkout}><CreditCard className="mr-2 h-4 w-4"/>Place Order</Button>
          </div>
        )}
      </Section>
    </div>
  );
}

// ---------- Seller Dashboard ----------
function SellerDashboard({ me, products, addProduct, orders, updateOrder, updateProduct, removeProduct, courses, tips }) {
  const myProducts = products.filter((p) => p.sellerId === me.id);
  const myOrders = orders.filter((o) => o.sellerId === me.id);

  const [pf, setPf] = useState({ name: "", price: 0, stock: 0, image: "", desc: "" });

  const add = () => {
    if (!pf.name || !pf.price || !pf.stock) return alert("Fill product name, price and stock");
    addProduct({ ...pf, sellerId: me.id });
    setPf({ name: "", price: 0, stock: 0, image: "", desc: "" });
  };

  return (
    <div className="space-y-6">
      <Section title="Add Product" desc="Create a listing. Admin will approve before it appears to buyers.">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2"><Label>Name</Label><Input value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })}/></div>
          <div className="grid gap-2"><Label>Price (₹)</Label><Input type="number" value={pf.price} onChange={(e) => setPf({ ...pf, price: Number(e.target.value) })}/></div>
          <div className="grid gap-2"><Label>Stock</Label><Input type="number" value={pf.stock} onChange={(e) => setPf({ ...pf, stock: Number(e.target.value) })}/></div>
          <div className="grid gap-2"><Label>Image URL</Label><Input value={pf.image} onChange={(e) => setPf({ ...pf, image: e.target.value })} placeholder="https://..."/></div>
          <div className="md:col-span-2 grid gap-2"><Label>Description</Label><Textarea value={pf.desc} onChange={(e) => setPf({ ...pf, desc: e.target.value })}/></div>
        </div>
        <div className="mt-4">
          <Button onClick={add}><Plus className="mr-2 h-4 w-4"/>Add Product</Button>
        </div>
      </Section>

      <Section title="Your Products" desc="Manage inventory and details.">
        {!myProducts.length ? <Empty icon={Package} title="No products yet" hint="Add your first product"/> : (
          <div className="grid md:grid-cols-3 gap-4">
            {myProducts.map((p) => (
              <Card key={p.id} className="shadow">
                <img src={p.image || "https://placehold.co/400x200?text=No+Image"} className="h-32 w-full object-cover bg-gray-100"/>
                <CardHeader className="pb-1">
                  <CardTitle className="text-lg flex items-center justify-between">{p.name} {p.approved ? <Badge>Approved</Badge> : <Badge variant="destructive">Pending</Badge>}</CardTitle>
                  <CardDescription>₹ {p.price} • Stock {p.stock}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground -mt-2">{p.desc}</CardContent>
                <CardFooter className="flex items-center justify-between">
                  <Button size="sm" variant="outline" onClick={() => updateProduct(p.id, { stock: Math.max(0, p.stock - 1) })}><Edit3 className="h-4 w-4 mr-2"/>-1 stock</Button>
                  <Button size="sm" variant="ghost" onClick={() => removeProduct(p.id)}><Trash2 className="h-4 w-4"/></Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Section title="Orders" desc="Mark as paid when buyer pays to your UPI.">
        {!myOrders.length ? <Empty icon={CreditCard} title="No orders yet"/> : (
          <div className="space-y-3">
            {myOrders.map((o) => (
              <Card key={o.id} className="shadow">
                <CardHeader className="pb-1">
                  <CardTitle className="text-lg">Order {o.id.slice(-6)} • Amount ₹ {o.amount}</CardTitle>
                  <CardDescription>Buyer: {o.buyerId}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm list-disc ml-6">
                    {o.items.map((it, i) => <li key={i}>Product {it.productId} • Qty {it.qty} • ₹ {it.price}</li>)}
                  </ul>
                </CardContent>
                <CardFooter className="flex items-center gap-2">
                  <Badge variant={o.paid ? "default" : "secondary"}>{o.paid ? "Paid" : "Awaiting Payment"}</Badge>
                  {!o.paid && <Button size="sm" onClick={() => updateOrder(o.id, { paid: true, status: "confirmed" })}><CheckCircle className="h-4 w-4 mr-2"/>Mark Paid</Button>}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Section title="Learn & Improve" desc="Courses from mentors to help you grow.">
        {!courses.filter((c) => c.approved).length ? <Empty icon={GraduationCap} title="No courses yet"/> : (
          <div className="grid md:grid-cols-3 gap-4">
            {courses.filter((c) => c.approved).map((c) => (
              <Card key={c.id} className="shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{c.title}</CardTitle>
                  <CardDescription>{c.level} • {c.format.toUpperCase()}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground -mt-2">{c.summary}</CardContent>
                <CardFooter>
                  <a href={c.url} target="_blank" rel="noreferrer"><Button size="sm">Open</Button></a>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {!!tips.length && (
          <div className="mt-6">
            <div className="font-semibold mb-2">Mentor Tips</div>
            <ul className="list-disc ml-6 text-sm space-y-1">
              {tips.map((t) => <li key={t.id}>{t.text}</li>)}
            </ul>
          </div>
        )}
      </Section>

      <Section title="Your UPI Details" desc="Share this with buyers to pay you directly.">
        <div className="text-sm">UPI ID: <span className="font-semibold">{me.upi || "Not set"}</span></div>
      </Section>
    </div>
  );
}

// ---------- Mentor Dashboard ----------
function MentorDashboard({ me, addCourse, courses, removeCourse, tips, addTip }) {
  const [cf, setCf] = useState({ title: "", level: "Beginner", format: "video", url: "", summary: "" });
  const [tf, setTf] = useState("");

  const addC = () => {
    if (!cf.title || !cf.url) return alert("Fill course title and URL");
    addCourse({ ...cf, mentorId: me.id });
    setCf({ title: "", level: "Beginner", format: "video", url: "", summary: "" });
  };
  const addT = () => {
    if (!tf.trim()) return; addTip({ mentorId: me.id, text: tf.trim() }); setTf("");
  };

  return (
    <div className="space-y-6">
      <Section title="Create Course" desc="Upload video/PDF/blog lessons for sellers.">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2"><Label>Title</Label><Input value={cf.title} onChange={(e) => setCf({ ...cf, title: e.target.value })}/></div>
          <div className="grid gap-2"><Label>Level</Label>
            <Select value={cf.level} onValueChange={(v) => setCf({ ...cf, level: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>Format</Label>
            <Select value={cf.format} onValueChange={(v) => setCf({ ...cf, format: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="article">Article</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>URL</Label><Input placeholder="https://" value={cf.url} onChange={(e) => setCf({ ...cf, url: e.target.value })}/></div>
          <div className="md:col-span-2 grid gap-2"><Label>Summary</Label><Textarea value={cf.summary} onChange={(e) => setCf({ ...cf, summary: e.target.value })}/></div>
        </div>
        <div className="mt-4"><Button onClick={addC}><Plus className="mr-2 h-4 w-4"/>Add Course</Button></div>
      </Section>

      <Section title="Your Courses" desc="Admin must approve before visible to sellers.">
        {!courses.filter((c) => c.mentorId === me.id).length ? <Empty icon={GraduationCap} title="No courses yet"/> : (
          <div className="grid md:grid-cols-3 gap-4">
            {courses.filter((c) => c.mentorId === me.id).map((c) => (
              <Card key={c.id} className="shadow">
                <CardHeader className="pb-1">
                  <CardTitle className="text-lg flex items-center justify-between">{c.title} {c.approved ? <Badge>Approved</Badge> : <Badge variant="secondary">Pending</Badge>}</CardTitle>
                  <CardDescription>{c.level} • {c.format.toUpperCase()}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground -mt-2">{c.summary}</CardContent>
                <CardFooter className="flex gap-2">
                  <a href={c.url} target="_blank" rel="noreferrer"><Button size="sm">Open</Button></a>
                  <Button size="sm" variant="ghost" onClick={() => removeCourse(c.id)}><Trash2 className="h-4 w-4"/></Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Section title="Quick Tips" desc="Post bite-sized advice sellers can see.">
        <div className="flex gap-2">
          <Input placeholder="Write a tip..." value={tf} onChange={(e) => setTf(e.target.value)}/>
          <Button onClick={addT}>Post</Button>
        </div>
        <div className="mt-4 space-y-2">
          {tips.map((t) => (
            <div key={t.id} className="text-sm flex items-start gap-2"><Badge variant="outline">Tip</Badge> {t.text}</div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ---------- Admin Dashboard ----------
function AdminDashboard({ users, updateUser, removeUser, products, updateProduct, removeProduct, courses, updateCourse, orders, updateOrder }) {
  const pendingUsers = users.filter((u) => ["seller", "mentor"].includes(u.role) && !u.approved);
  const pendingProducts = products.filter((p) => !p.approved);
  const pendingCourses = courses.filter((c) => !c.approved);

  return (
    <div className="space-y-6">
      <Section title="Pending Approvals" desc="Approve new users, products, and courses">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="shadow">
            <CardHeader><CardTitle>Users</CardTitle><CardDescription>{pendingUsers.length} awaiting</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {!pendingUsers.length && <div className="text-sm">None</div>}
              {pendingUsers.map((u) => (
                <div key={u.id} className="border rounded p-3">
                  <div className="font-semibold">{u.name} • {u.role}</div>
                  {u.role === "seller" && <div className="text-xs text-muted-foreground">{u.village} • {u.category} • UPI: {u.upi || "-"}</div>}
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => updateUser(u.id, { approved: true })}><CheckCircle className="h-4 w-4 mr-2"/>Approve</Button>
                    <Button size="sm" variant="ghost" onClick={() => removeUser(u.id)}><XCircle className="h-4 w-4 mr-2"/>Reject</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow">
            <CardHeader><CardTitle>Products</CardTitle><CardDescription>{pendingProducts.length} awaiting</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {!pendingProducts.length && <div className="text-sm">None</div>}
              {pendingProducts.map((p) => (
                <div key={p.id} className="border rounded p-3">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">₹ {p.price} • Stock {p.stock}</div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => updateProduct(p.id, { approved: true })}><CheckCircle className="h-4 w-4 mr-2"/>Approve</Button>
                    <Button size="sm" variant="ghost" onClick={() => removeProduct(p.id)}><XCircle className="h-4 w-4 mr-2"/>Reject</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow">
            <CardHeader><CardTitle>Courses</CardTitle><CardDescription>{pendingCourses.length} awaiting</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {!pendingCourses.length && <div className="text-sm">None</div>}
              {pendingCourses.map((c) => (
                <div key={c.id} className="border rounded p-3">
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.level} • {c.format}</div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => updateCourse(c.id, { approved: true })}><CheckCircle className="h-4 w-4 mr-2"/>Approve</Button>
                    <Button size="sm" variant="ghost" onClick={() => updateCourse(c.id, { approved: false })}><XCircle className="h-4 w-4 mr-2"/>Keep Pending</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="All Orders" desc="Oversee status and disputes">
        {!orders.length ? <Empty icon={CreditCard} title="No orders"/> : (
          <div className="space-y-3">
            {orders.map((o) => {
              const buyer = users.find((u) => u.id === o.buyerId);
              const seller = users.find((u) => u.id === o.sellerId);
              return (
                <Card key={o.id} className="shadow">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-lg">Order {o.id.slice(-6)} • ₹ {o.amount}</CardTitle>
                    <CardDescription>Buyer: {buyer?.name || o.buyerId} • Seller: {seller?.name || o.sellerId}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge variant={o.paid ? "default" : "secondary"}>{o.paid ? "Paid" : "Unpaid"}</Badge>
                      <Select value={o.status} onValueChange={(v) => updateOrder(o.id, { status: v })}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">pending</SelectItem>
                          <SelectItem value="confirmed">confirmed</SelectItem>
                          <SelectItem value="shipped">shipped</SelectItem>
                          <SelectItem value="delivered">delivered</SelectItem>
                          <SelectItem value="cancelled">cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

// ---------- Orders (Buyer) ----------
function BuyerOrders({ me, orders, users }) {
  const my = orders.filter((o) => o.buyerId === me.id);
  return (
    <Section title="Your Orders" desc="Pay each seller directly via UPI and mark paid.">
      {!my.length ? <Empty icon={CreditCard} title="No orders yet"/> : (
        <div className="space-y-3">
          {my.map((o) => {
            const seller = users.find((u) => u.id === o.sellerId);
            return (
              <Card key={o.id} className="shadow">
                <CardHeader className="pb-1">
                  <CardTitle className="text-lg">Order {o.id.slice(-6)} • Amount ₹ {o.amount}</CardTitle>
                  <CardDescription>Seller: {seller?.name} • UPI: {seller?.upi || "Not available"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm mb-2">Pay using your UPI app to <b>{seller?.upi}</b>. Add order ID in remarks.</div>
                  <ul className="text-sm list-disc ml-6">
                    {o.items.map((it, i) => <li key={i}>Product {it.productId} • Qty {it.qty} • ₹ {it.price}</li>)}
                  </ul>
                </CardContent>
                <CardFooter className="flex items-center gap-2">
                  <Badge variant={o.paid ? "default" : "secondary"}>{o.paid ? "Paid" : "Awaiting Payment"}</Badge>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// ---------- App Shell ----------
function Shell({ me, logout, children, onTab, tab }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6"/>
            <div className="font-semibold">Rural Entrepreneurship</div>
            <Badge variant="outline" className="ml-2">{me.role}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="hidden md:block text-muted-foreground">Welcome, {me.name}</div>
            <Button size="sm" variant="outline" onClick={logout}><LogOut className="mr-2 h-4 w-4"/>Logout</Button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-3 flex flex-wrap gap-2">
          {me.role === "buyer" && (
            <>
              <Button size="sm" variant={tab === "shop" ? "default" : "outline"} onClick={() => onTab("shop")}><Store className="mr-2 h-4 w-4"/>Shop</Button>
              <Button size="sm" variant={tab === "orders" ? "default" : "outline"} onClick={() => onTab("orders")}><CreditCard className="mr-2 h-4 w-4"/>Orders</Button>
            </>
          )}
          {me.role === "seller" && (
            <>
              <Button size="sm" variant={tab === "sell" ? "default" : "outline"} onClick={() => onTab("sell")}><Package className="mr-2 h-4 w-4"/>Products</Button>
              <Button size="sm" variant={tab === "learn" ? "default" : "outline"} onClick={() => onTab("learn")}><GraduationCap className="mr-2 h-4 w-4"/>Learn</Button>
            </>
          )}
          {me.role === "mentor" && (
            <>
              <Button size="sm" variant={tab === "teach" ? "default" : "outline"} onClick={() => onTab("teach")}><GraduationCap className="mr-2 h-4 w-4"/>Courses</Button>
            </>
          )}
          {me.role === "admin" && (
            <>
              <Button size="sm" variant={tab === "admin" ? "default" : "outline"} onClick={() => onTab("admin")}><ShieldCheck className="mr-2 h-4 w-4"/>Admin</Button>
            </>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="border-t text-xs text-center py-6 text-muted-foreground">© {new Date().getFullYear()} Rural Entrepreneurship Platform • Demo MVP</footer>
    </div>
  );
}

export default function App() {
  useBootstrap();
   const auth = useAuth();
  const { products, addProduct, updateProduct, removeProduct } = useProducts();
  const { orders, placeOrder, updateOrder, removeOrder } = useOrders();
  const { courses, addCourse, updateCourse, removeCourse } = useCourses();
  const { tips, addTip, removeTip } = useTips();


  // Fix: default tab for admin
  const getDefaultTab = (role) => {
    if (role === "buyer") return "shop";
    if (role === "seller") return "sell";
    if (role === "mentor") return "teach";
    if (role === "admin") return "admin";
    return "shop";
  };

  const [stage, setStage] = useState("landing");
  const [tab, setTab] = useState("shop");

  useEffect(() => {
    if (auth.me) {
      setStage("app");
      setTab(getDefaultTab(auth.me.role));
    }
  }, [auth.me]);

  if (!auth.me) {
    if (stage === "landing") return <Landing onStart={() => setStage("auth")} />;
    return <Auth onDone={() => setStage("app")} auth={auth} />;
  }

  const me = auth.me;
  if (!me.approved && me.role !== "buyer") {
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-emerald-50 to-white">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardHeader>
            <CardTitle>Account Pending Approval</CardTitle>
            <CardDescription>Admin will verify your details shortly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">You can log out and log back in later. Buyers are auto-approved.</div>
          </CardContent>
          <CardFooter className="justify-center"><Button onClick={auth.logout}><LogOut className="mr-2 h-4 w-4"/>Logout</Button></CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <Shell me={me} logout={auth.logout} onTab={setTab} tab={tab}>
      {me.role === "buyer" && tab === "shop" && (
        <BuyerDashboard me={me} users={auth.users} products={products} placeOrder={placeOrder} />
      )}
      {me.role === "buyer" && tab === "orders" && (
        <BuyerOrders me={me} orders={orders} users={auth.users} />
      )}

      {me.role === "seller" && tab === "sell" && (
        <SellerDashboard me={me} products={products} addProduct={addProduct} orders={orders} updateOrder={updateOrder} updateProduct={updateProduct} removeProduct={removeProduct} courses={courses} tips={tips} />
      )}
      {me.role === "seller" && tab === "learn" && (
        <Section title="Courses for Sellers" desc="Learn skills to promote your business.">
          <div className="grid md:grid-cols-3 gap-4">
            {courses.filter((c) => c.approved).map((c) => (
              <Card key={c.id} className="shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{c.title}</CardTitle>
                  <CardDescription>{c.level} • {c.format.toUpperCase()}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground -mt-2">{c.summary}</CardContent>
                <CardFooter>
                  <a href={c.url} target="_blank" rel="noreferrer"><Button size="sm">Open</Button></a>
                </CardFooter>
              </Card>
            ))}
          </div>
          {!courses.filter((c) => c.approved).length && <Empty icon={GraduationCap} title="No approved courses yet"/>}
        </Section>
      )}

      {me.role === "mentor" && tab === "teach" && (
        <MentorDashboard me={me} addCourse={addCourse} courses={courses} removeCourse={removeCourse} tips={tips} addTip={addTip} />
      )}

      {me.role === "admin" && tab === "admin" && (
        <AdminDashboard users={auth.users} updateUser={auth.updateUser} removeUser={auth.removeUser} products={products} updateProduct={updateProduct} removeProduct={removeProduct} courses={courses} updateCourse={updateCourse} orders={orders} updateOrder={updateOrder} />
      )}
    </Shell>
  );
}
