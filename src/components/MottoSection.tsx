const MottoSection = () => {
  return (
    <section className="py-20 bg-gradient-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-40 h-40 border-2 border-primary-foreground/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-primary-glow/30 rounded-full animate-bounce-gentle"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-primary-foreground/10 rounded-full animate-float"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* ARET Motto */}
          <div className="animate-fade-in-scale">
            <h2 className="text-5xl md:text-7xl font-black text-primary-foreground mb-6 tracking-tight">
              <span className="text-primary-glow drop-shadow-lg">Motto</span>
            </h2>
            <div className="relative">
              <p className="text-3xl md:text-4xl text-primary-foreground font-bold max-w-4xl mx-auto leading-tight tracking-wide">
                Partnering for sustainable solutions
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-primary-glow rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MottoSection;