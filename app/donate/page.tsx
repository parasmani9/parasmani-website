"use client";

import { Navbar } from "@/components/Navbar";
import { Heart, Globe, ShieldCheck, QrCode, Building2, Landmark } from "lucide-react";

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-48 pb-24 text-center">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-6 block">Support Our Vision</span>
            <h1 className="mb-8 text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Support Parasmani
            </h1>
            <p className="text-xl font-light opacity-60 leading-relaxed max-w-2xl mx-auto">
              Parasmani is a non-profit, non-commercial initiative. Your contributions 
              help us keep this oasis running for everyone.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Payment Details */}
            <div className="space-y-8">
              <div className="rounded-lg border border-border-subtle bg-surface p-8 md:p-10">
                <div className="flex items-center gap-4 mb-10 text-primary">
                  <Building2 size={24} />
                  <h3 className="text-xl font-semibold text-foreground">Bank transfer details</h3>
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: "Account Name", value: "Brahma Kumaris Parasmani Retreat Center" },
                    { label: "Bank Name", value: "State Bank of India" },
                    { label: "Account Number", value: "XXXX XXXX XXXX XXXX" },
                    { label: "IFSC Code", value: "SBINXXXXXXX" },
                    { label: "Branch", value: "Lonavala Main Branch" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between border-b border-border-subtle pb-4 last:border-0 transition-all hover:bg-white/40 p-2 rounded-lg">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-40">{item.label}</span>
                      <span className="text-sm font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-primary p-8 text-white shadow-sm md:p-10">
                <p className="mb-4 text-xl font-semibold">Tax benefit (80G)</p>
                <p className="text-sm opacity-80 leading-relaxed font-light">
                  Donations to Brahma Kumaris are exempted under Section 80G of the 
                  Income Tax Act. Official receipts will be generated for all contributions.
                </p>
              </div>
            </div>

            {/* QR Code / App Payment */}
            <div className="rounded-lg border-2 border-primary/20 bg-background p-8 text-center shadow-sm md:p-10">
               <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-10">
                  <QrCode size={40} />
               </div>
               <h3 className="mb-4 text-xl font-semibold text-foreground">UPI payment</h3>
               <p className="text-sm opacity-50 font-light mb-12">Scan the QR code below using any UPI app (GPay, PhonePe, Paytm)</p>
               
               {/* Mock QR Code UI */}
               <div className="aspect-square max-w-[300px] mx-auto bg-white border-8 border-border-subtle rounded-3xl p-6 mb-12 flex items-center justify-center group relative overflow-hidden">
                  <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BK-PARASMANI-MOCK')] bg-contain absolute inset-6 opacity-80 group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border-subtle bg-white font-semibold text-primary shadow-sm">
                       P
                     </div>
                  </div>
               </div>
               
               <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40">Scan to Donate</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
