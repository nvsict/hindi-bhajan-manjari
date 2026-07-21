"use client";
import Script from 'next/script';
import { useState } from 'react';

export default function DonateTestPage() {
  const [status, setStatus] = useState("Idle");

  const pay = async () => {
    setStatus("Loading...");
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 101 }),
      });
      const order = await res.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Test Payment",
        handler: function(response: any) {
          setStatus("Success: " + response.razorpay_payment_id);
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setStatus("Error starting payment");
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      <h1>Isolation Test</h1>
      <p>Status: {status}</p>
      <button 
        onClick={pay} 
        style={{ padding: '20px', fontSize: '20px', background: 'blue', color: 'white' }}
      >
        Pay ₹1
      </button>
    </div>
  );
}