"use client";

import { Navbar } from "@/components/Navbar";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Narrative Section */}
      <section className="pt-40 pb-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">Our Story</span>
              <h1 className="mb-8 text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
                Transforming souls, <br />
                like the touchstone
              </h1>
              <div className="space-y-6 text-lg font-light leading-relaxed opacity-80">
                <p>
                  Established by the Brahma Kumaris Mulund Sub Zone, Parasmani takes its name 
                  from the legendary "Philosopher&apos;s Stone." Just as it was believed to turn iron 
                  into gold, our retreat center is a place where mental and emotional states 
                  are transformed through spiritual empowerment.
                </p>
                <p>
                  Spread over 2 acres of serene mountain land in Lonavala, Parasmani is an oasis where time 
                  slows down—offering solace and renewal in nature&apos;s gentle whispers. We help you 
                  rediscover the "Jewel" within: your true, innate spiritual potential.
                </p>
                <p>
                  Guided by the visions of Brahma Baba, we bring people of all backgrounds together 
                  to find balance, harmony, and lasting happiness.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-lg border border-border-subtle shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1512100356956-c1367e394133?auto=format&fit=crop&q=80&w=1200" 
                  alt="Silent Meditation" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 hidden max-w-xs rounded-lg border border-border-subtle bg-surface p-8 shadow-md md:block">
                <p className="mb-2 text-lg font-medium text-primary">
                  &ldquo;Peace is our original religion.&rdquo;
                </p>
                <p className="text-xs tracking-widest uppercase opacity-40 font-bold">— Brahma Kumaris</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Grid */}
      <section className="py-32 bg-surface">
        <div className="container mx-auto px-6">
          <h2 className="mb-16 text-center text-2xl font-semibold text-foreground md:text-3xl">
            Our living philosophy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { t: "Purity", d: "Maintaining cleanliness of thoughts, words and actions." },
              { t: "Peace", d: "Our natural state of being, accessible in silence." },
              { t: "Love", d: "Universal brotherhood without boundaries." },
              { t: "Power", d: "The spiritual strength to overcome challenges." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-1.5 h-12 bg-primary/20 mx-auto mb-6" />
                <h4 className="mb-3 text-xl font-semibold text-foreground">{item.t}</h4>
                <p className="text-sm opacity-60 font-light">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
