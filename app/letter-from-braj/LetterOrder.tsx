"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaWhatsapp, FaCopy, FaLock, FaSpinner, FaCheckCircle, FaFeatherAlt } from "react-icons/fa";
import { PACKAGES, LETTER_TYPES, STYLES, WHATSAPP_NUMBER, getPackage, type PackageId } from "./config";

/* ------------------------------------------------------------------ */
/* Types & storage (आपका ओरिजिनल लॉजिक)                               */
/* ------------------------------------------------------------------ */
type Form = {
  name: string; phone: string; email: string; pkg: PackageId; type: string; style: string;
  recipient: string; occasion: string; story: string; address: string; pincode: string;
  consent: boolean; noPublic: boolean; website: string;
};
type Phase = "form" | "paying" | "verifying" | "success";
type Errors = Partial<Record<keyof Form, string>>;
type Stored = { form: Form; orderId?: string; paid?: boolean };

const KEY = "lfb_order_v1";
const EMPTY: Form = {
  name: "", phone: "", email: "", pkg: "vishesh", type: LETTER_TYPES[0].name, style: STYLES[0],
  recipient: "", occasion: "", story: "", address: "", pincode: "", consent: false, noPublic: true, website: "",
};

const read = (): Stored | null => { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
const write = (s: Stored) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
const wipe = () => { try { localStorage.removeItem(KEY); } catch {} };

function validate(f: Form, postal: boolean): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "कृपया अपना नाम लिखें।";
  if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = "कृपया 10 अंकों का सही मोबाइल नंबर लिखें।";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "ईमेल सही नहीं लग रहा।";
  if (f.recipient.trim().length < 2) e.recipient = "बताइए पत्र किसके लिए है।";
  if (f.occasion.trim().length < 2) e.occasion = "अवसर या विषय लिखें।";
  if (f.story.trim().length < 40) e.story = "थोड़ा और विस्तार से बताइए (कम से कम 40 अक्षर)।";
  if (postal && f.address.trim().length < 10) e.address = "डाक के लिए पूरा पता लिखें।";
  if (postal && !/^\d{6}$/.test(f.pincode)) e.pincode = "6 अंकों का पिन कोड लिखें।";
  if (!f.consent) e.consent = "आगे बढ़ने के लिए सहमति ज़रूरी है।";
  return e;
}

function buildMessage(f: Form, orderId: string) {
  const p = getPackage(f.pkg)!;
  return [
    "🙏 राधे-राधे! मैंने 'ब्रज से पत्र' के लिए भुगतान कर दिया है।",
    "",
    `🧾 ऑर्डर नंबर: ${orderId}`,
    `📦 पैकेज: ${p.name} (₹${p.price})`,
    `👤 नाम: ${f.name}`,
    `📱 मोबाइल: ${f.phone}`,
    f.email ? `✉️ ईमेल: ${f.email}` : "",
    `💌 पत्र किसके लिए: ${f.recipient}`,
    `🎉 अवसर/विषय: ${f.occasion}`,
    `🖋️ पत्र का प्रकार: ${f.type}`,
    `🗣️ भाषा: ${f.style}`,
    p.postal ? `🏠 पता: ${f.address}, पिन ${f.pincode}` : "",
    `🔒 सार्वजनिक साझा न करें: ${f.noPublic ? "हाँ" : "नहीं"}`,
    "",
    "📝 मेरे मन के भाव:",
    f.story.trim(),
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
}

const goTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
};

export function PackageButton({ pkg, className, children }: { pkg: PackageId; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => { window.dispatchEvent(new CustomEvent("lfb:select", { detail: pkg })); goTo("order-form"); }}>
      {children}
    </button>
  );
}

export function StickyOrderBar() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const el = document.getElementById("order-form");
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([en]) => setHidden(en.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div aria-hidden={hidden} className={`fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-orange-200 bg-white/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 ${hidden ? "translate-y-full" : "translate-y-0"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="leading-tight">
          <p className="font-hindi text-xs font-medium text-gray-500">पत्र की शुरुआत</p>
          <p className="font-sans text-lg font-extrabold text-orange-700">₹{PACKAGES[0].price} <span className="font-hindi text-sm font-medium text-gray-500">से</span></p>
        </div>
        <button type="button" tabIndex={hidden ? -1 : 0} onClick={() => goTo("order-form")} className="font-hindi min-h-11 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 text-sm font-bold text-white shadow-lg shadow-orange-600/25 active:scale-95">
          अपना पत्र लिखवाएँ
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Premium Form Field Component                                       */
/* ------------------------------------------------------------------ */
const inputClass = "w-full min-h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 aria-[invalid=true]:border-red-500 aria-[invalid=true]:bg-red-50 font-hindi";

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={`lfb-${id}`} className="mb-2 block text-sm font-bold text-gray-800 font-hindi">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-500 font-hindi font-medium">{hint}</p>}
      {error && <p id={`lfb-${id}-err`} role="alert" className="mt-1.5 text-xs font-bold text-red-600 font-hindi">{error}</p>}
    </div>
  );
}

export default function LetterOrder() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [phase, setPhase] = useState<Phase>("form");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const ready = useRef(false);

  const pkg = getPackage(form.pkg)!;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const verify = useCallback(async (id: string, opts: { silent?: boolean; tries?: number } = {}) => {
    const tries = opts.tries ?? 4;
    setPhase("verifying");
    for (let i = 0; i < tries; i++) {
      try {
        const r = await fetch(`/api/letter/verify?order_id=${encodeURIComponent(id)}`, { cache: "no-store" });
        const d = await r.json();
        if (d.paid) { setOrderId(id); setPhase("success"); return true; }
      } catch {}
      if (i < tries - 1) await new Promise((res) => setTimeout(res, 2000));
    }
    setPhase("form");
    if (!opts.silent) setNotice(`भुगतान की पुष्टि अभी नहीं हो पाई। अगर पैसे कट गए हैं तो घबराइए नहीं — ऑर्डर नंबर ${id} के साथ हमें WhatsApp करें, हम जाँच लेंगे।`);
    return false;
  }, []);

  useEffect(() => {
    const s = read();
    if (s?.form) setForm({ ...EMPTY, ...s.form, website: "" });
    const url = new URLSearchParams(window.location.search);
    const fromUrl = url.get("order_id");
    if (fromUrl) window.history.replaceState(null, "", window.location.pathname + window.location.hash);
    const id = fromUrl || s?.orderId || null;
    ready.current = true;
    if (!id) return;
    setOrderId(id);
    if (s?.paid && !fromUrl) setPhase("success");
    else verify(id, { silent: !fromUrl });
  }, [verify]);

  useEffect(() => {
    if (!ready.current) return;
    write({ form: { ...form, website: "" }, orderId: orderId || undefined, paid: phase === "success" });
  }, [form, orderId, phase]);

  useEffect(() => {
    const h = (e: Event) => { const id = (e as CustomEvent).detail as PackageId; if (getPackage(id)) setForm((f) => ({ ...f, pkg: id })); };
    window.addEventListener("lfb:select", h);
    return () => window.removeEventListener("lfb:select", h);
  }, []);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("");
    const errs = validate(form, pkg.postal);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) { document.getElementById(`lfb-${first}`)?.focus(); return; }
    if (form.website) return;

    setPhase("paying");
    try {
      const res = await fetch("/api/letter/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email, packageId: form.pkg, website: form.website }),
      });
      const d = await res.json();
      if (!res.ok || !d.paymentSessionId) throw new Error(d.error || "ऑर्डर नहीं बन सका।");

      setOrderId(d.orderId);
      write({ form: { ...form, website: "" }, orderId: d.orderId });

      const { load } = await import("@cashfreepayments/cashfree-js");
      const cashfree = await load({ mode: process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" ? "production" : "sandbox" });
      const result: any = await cashfree.checkout({ paymentSessionId: d.paymentSessionId, redirectTarget: "_modal" });

      if (result?.error && !result?.paymentDetails) {
        setNotice(result.error.message || "भुगतान पूरा नहीं हुआ। आप दोबारा कोशिश कर सकते हैं।");
        await verify(d.orderId, { silent: true, tries: 1 }); 
        return;
      }
      await verify(d.orderId);
    } catch (err: any) {
      setPhase("form");
      setNotice(err?.message || "कुछ गड़बड़ हुई। कृपया दोबारा प्रयास करें।");
    }
  };

  const message = orderId ? buildMessage(form, orderId) : "";
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const copy = async () => { try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setNotice("कॉपी नहीं हो सका — कृपया WhatsApp बटन इस्तेमाल करें।"); } };
  const reset = () => { wipe(); setForm(EMPTY); setOrderId(null); setPhase("form"); setNotice(""); setErrors({}); };

  /* ---------------------------- Success Screen ---------------------------- */
  if (phase === "success" && orderId) {
    return (
      <div className="rounded-3xl border border-green-200 bg-gradient-to-b from-green-50 to-white p-8 md:p-12 shadow-2xl shadow-green-900/10" role="status">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6 shadow-inner border-4 border-white">
          <FaCheckCircle className="text-5xl" />
        </div>
        <h3 className="font-hindi mt-2 text-center text-3xl font-black text-gray-900">धन्यवाद {form.name.split(" ")[0]} जी!</h3>
        <p className="font-hindi mt-2 text-center text-lg font-medium text-gray-600">आपका भुगतान सफलतापूर्वक प्राप्त हो गया है।</p>
        <p className="font-sans mt-1 text-center text-sm font-bold text-gray-500 bg-gray-100 inline-block px-4 py-1 rounded-full mx-auto table">Order ID: {orderId}</p>

        <div className="mx-auto mt-10 max-w-xl rounded-2xl bg-orange-50 border border-orange-200 p-6 text-center shadow-sm">
          <p className="font-hindi font-black text-xl text-orange-800 mb-2">बस एक आखिरी कदम!</p>
          <p className="font-hindi text-base text-gray-700 leading-relaxed">नीचे दिए गए बटन पर क्लिक करके अपनी सारी जानकारी और मन के भाव हमें WhatsApp पर भेजें, ताकि हम आपका पत्र लिखना शुरू कर सकें।</p>
        </div>

        <div className="mx-auto mt-8 flex max-w-xl flex-col gap-4">
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="font-hindi flex min-h-[3.5rem] items-center justify-center gap-3 rounded-xl bg-[#25D366] px-8 text-xl font-bold text-white shadow-lg shadow-green-500/30 transition-transform hover:scale-105">
            <FaWhatsapp className="text-3xl" /> WhatsApp पर जानकारी भेजें
          </a>
          <button type="button" onClick={copy} className="font-hindi flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 hover:border-gray-300">
            <FaCopy className="text-gray-400" /> {copied ? "जानकारी कॉपी हो गई ✓" : "अगर WhatsApp न खुले तो यहाँ से कॉपी करें"}
          </button>
        </div>
        <div className="mt-12 text-center">
          <button type="button" onClick={reset} className="font-hindi text-sm font-bold text-gray-500 underline underline-offset-4 hover:text-orange-600 transition-colors">एक और पत्र लिखवाएँ</button>
        </div>
      </div>
    );
  }

  /* ----------------------------- Form Screen ------------------------------ */
  const busy = phase === "paying" || phase === "verifying";
  const err = (k: keyof Form) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `lfb-${k}-err` : undefined });

  return (
    <form onSubmit={pay} noValidate className="relative overflow-hidden rounded-[2.5rem] border border-orange-100 bg-white p-6 shadow-2xl shadow-orange-900/10 sm:p-12">
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-600" />
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
          <FaFeatherAlt className="text-2xl" />
        </div>
        <h3 className="font-hindi text-3xl md:text-4xl font-black text-gray-900 mb-3">अपना पत्र लिखवाएँ</h3>
        <p className="font-hindi text-base md:text-lg text-gray-600 font-medium">नीचे जानकारी भरें और सुरक्षित भुगतान करें।</p>
      </div>

      <fieldset className="mb-10 p-6 bg-gray-50 border border-gray-100 rounded-3xl" disabled={busy}>
        <legend className="font-hindi text-lg font-black text-gray-900 mb-4 px-2">1. अपना पैकेज चुनें</legend>
        <div role="radiogroup" className="grid gap-4 sm:grid-cols-3">
          {PACKAGES.map((p) => (
            <label key={p.id} className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 relative ${form.pkg === p.id ? "border-orange-500 bg-orange-50/50 shadow-md shadow-orange-500/10" : "border-gray-200 bg-white hover:border-orange-300"}`}>
              <input type="radio" name="pkg" value={p.id} checked={form.pkg === p.id} onChange={() => set("pkg", p.id)} className="sr-only" />
              {p.badge && form.pkg !== p.id && <div className="absolute -top-3 left-4 bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">{p.badge}</div>}
              <div className="font-hindi font-bold text-gray-900 text-lg mb-1">{p.name}</div>
              <div className="font-sans text-2xl font-black text-orange-600 mb-2">₹{p.price}</div>
              <div className="font-hindi text-xs text-gray-500 font-medium leading-relaxed">{p.words}<br/>{p.postal ? "स्कैन + डाक डिलीवरी" : "केवल डिजिटल स्कैन"}</div>
              
              {/* Custom Radio Button Indicator */}
              <div className={`absolute top-5 right-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${form.pkg === p.id ? 'border-orange-500' : 'border-gray-300'}`}>
                {form.pkg === p.id && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="px-2">
        <h4 className="font-hindi text-lg font-black text-gray-900 mb-6">2. आपकी जानकारी</h4>
        <fieldset className="grid gap-6 sm:grid-cols-2 mb-10" disabled={busy}>
          <Field id="name" label="आपका शुभ नाम" error={errors.name}>
            <input id="lfb-name" className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" placeholder="जैसे: रोहित शर्मा" {...err("name")} />
          </Field>
          <Field id="phone" label="WhatsApp नंबर" error={errors.phone} hint="भुगतान के बाद हम इसी पर संपर्क करेंगे।">
            <input id="lfb-phone" className={`${inputClass} font-sans`} value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").slice(0, 10))} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10 अंकों का नंबर" maxLength={10} {...err("phone")} />
          </Field>
          <Field id="email" label="ईमेल (वैकल्पिक)" error={errors.email}>
            <input id="lfb-email" className={`${inputClass} font-sans`} value={form.email} onChange={(e) => set("email", e.target.value)} type="email" autoComplete="email" placeholder="name@example.com" {...err("email")} />
          </Field>
        </fieldset>

        <h4 className="font-hindi text-lg font-black text-gray-900 mb-6 border-t border-gray-100 pt-8">3. पत्र की जानकारी</h4>
        <fieldset className="grid gap-6 sm:grid-cols-2" disabled={busy}>
          <Field id="type" label="पत्र का प्रकार">
            <select id="lfb-type" className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value)}>
              {LETTER_TYPES.map((t) => <option key={t.id} value={t.name}>{t.name} — {t.en}</option>)}
            </select>
          </Field>
          <Field id="style" label="भाषा और शैली">
            <select id="lfb-style" className={inputClass} value={form.style} onChange={(e) => set("style", e.target.value)}>
              {STYLES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field id="recipient" label="पत्र किसके लिए है?" error={errors.recipient}>
            <input id="lfb-recipient" className={inputClass} value={form.recipient} onChange={(e) => set("recipient", e.target.value)} placeholder="जैसे: माँ, मित्र, राधा रानी" {...err("recipient")} />
          </Field>
          <Field id="occasion" label="अवसर या विषय" error={errors.occasion}>
            <input id="lfb-occasion" className={inputClass} value={form.occasion} onChange={(e) => set("occasion", e.target.value)} placeholder="जैसे: जन्मदिन, क्षमा, कृतज्ञता" {...err("occasion")} />
          </Field>
          
          <div className="sm:col-span-2">
            <Field id="story" label="अपने मन के भाव बताइए" error={errors.story} hint={`अभी तक ${form.story.trim().length} अक्षर — जितना विस्तार से बताएँगे, पत्र उतना अपना लगेगा।`}>
              <div className="relative rounded-xl border border-gray-200 bg-[#fffdf8] focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all shadow-inner overflow-hidden">
                <textarea
                  id="lfb-story" rows={8} value={form.story} onChange={(e) => set("story", e.target.value)}
                  placeholder="वह याद, वह बात, वह भाव… जो आप इस पत्र में पहुँचाना चाहते हैं। यहाँ खुलकर लिखें।"
                  className="w-full bg-transparent px-5 py-4 text-gray-900 placeholder:text-gray-400 outline-none resize-y font-hindi text-base leading-8"
                  style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(249, 115, 22, 0.1) 31px, rgba(249, 115, 22, 0.1) 32px)", backgroundAttachment: "local" }}
                  {...err("story")}
                />
              </div>
            </Field>
          </div>

          {pkg.postal && (
            <>
              <div className="sm:col-span-2 mt-4 pt-6 border-t border-gray-100">
                <h4 className="font-hindi text-lg font-black text-gray-900 mb-6">4. डिलीवरी का पता</h4>
                <Field id="address" label="डाक का पूरा पता" error={errors.address} hint="मूल पत्र इसी पते पर भेजा जाएगा। डाक शुल्क मूल्य में शामिल है।">
                  <textarea id="lfb-address" rows={3} className={`${inputClass} resize-y leading-relaxed`} value={form.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" placeholder="नाम, मकान/गाँव, मोहल्ला, शहर, ज़िला, राज्य" {...err("address")} />
                </Field>
              </div>
              <Field id="pincode" label="पिन कोड" error={errors.pincode}>
                <input id="lfb-pincode" className={`${inputClass} font-sans`} value={form.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="6 अंक" {...err("pincode")} />
              </Field>
            </>
          )}

          {/* honeypot */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} /></label>
          </div>
        </fieldset>

        <div className="mt-8 space-y-4 rounded-2xl bg-orange-50/50 border border-orange-100 p-5 text-sm text-gray-800">
          <label className="flex cursor-pointer items-start gap-4 group">
            <div className="mt-0.5 relative flex items-center justify-center">
              <input id="lfb-consent" type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="peer h-5 w-5 appearance-none rounded border-2 border-gray-300 checked:border-orange-600 checked:bg-orange-600 transition-all cursor-pointer" aria-invalid={!!errors.consent} />
              <FaCheckCircle className="absolute text-white opacity-0 peer-checked:opacity-100 w-3 h-3 pointer-events-none transition-opacity" />
            </div>
            <span className="font-hindi font-medium select-none group-hover:text-gray-900">मैं समझता/समझती हूँ कि लेखन शुरू होने के बाद रिफ़ंड नहीं होगा, और अपनी निजी कहानी साझा करने की सहमति देता/देती हूँ।</span>
          </label>
          {errors.consent && <p role="alert" className="font-hindi text-xs font-bold text-red-600 ml-9">{errors.consent}</p>}
          
          <label className="flex cursor-pointer items-start gap-4 group">
            <div className="mt-0.5 relative flex items-center justify-center">
              <input type="checkbox" checked={form.noPublic} onChange={(e) => set("noPublic", e.target.checked)} className="peer h-5 w-5 appearance-none rounded border-2 border-gray-300 checked:border-orange-600 checked:bg-orange-600 transition-all cursor-pointer" />
              <FaCheckCircle className="absolute text-white opacity-0 peer-checked:opacity-100 w-3 h-3 pointer-events-none transition-opacity" />
            </div>
            <span className="font-hindi font-medium select-none group-hover:text-gray-900">मेरा पत्र या मेरी कहानी कहीं भी सार्वजनिक रूप से साझा न की जाए।</span>
          </label>
        </div>

        {notice && <p role="alert" className="font-hindi mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{notice}</p>}

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between border-t border-gray-100 pt-8">
          <p className="font-hindi flex items-center gap-2 text-xs font-bold text-gray-500"><FaLock className="shrink-0 text-gray-400" /> सुरक्षित Cashfree भुगतान</p>
          <button type="submit" disabled={busy} className="font-hindi w-full sm:w-auto flex min-h-[3.5rem] items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-10 py-3 text-lg font-black text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-105 disabled:cursor-wait disabled:opacity-70 disabled:hover:scale-100">
            {busy ? <><FaSpinner className="animate-spin" /> {phase === "verifying" ? "भुगतान जाँच रहे हैं…" : "तैयार कर रहे हैं…"}</> : <>₹{pkg.price} का सुरक्षित भुगतान करें</>}
          </button>
        </div>
        <p className="font-hindi mt-3 text-center text-xs font-bold text-orange-500" aria-live="polite">{phase === "verifying" ? "कृपया पेज बंद न करें..." : ""}</p>
      </div>
    </form>
  );
}