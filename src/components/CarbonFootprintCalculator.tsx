import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Leaf, TrendingDown, Zap, Globe } from "lucide-react";

const CarbonFootprintCalculator = () => {
  const [wasteAmount, setWasteAmount] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [frequency, setFrequency] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculateFootprint = () => {
    if (!wasteAmount || !wasteType || !frequency) return;

    // Carbon footprint factors (kg CO2 per kg waste)
    const factors: { [key: string]: number } = {
      "general": 0.5,
      "organic": 0.3,
      "plastic": 2.1,
      "paper": 0.9,
      "glass": 0.2,
      "metal": 1.8
    };

    // Frequency multipliers (per year)
    const frequencyMultipliers: { [key: string]: number } = {
      "daily": 365,
      "weekly": 52,
      "biweekly": 26,
      "monthly": 12
    };

    const amount = parseFloat(wasteAmount);
    const factor = factors[wasteType] || 0.5;
    const multiplier = frequencyMultipliers[frequency] || 52;

    const annualFootprint = amount * factor * multiplier;
    setResult(annualFootprint);
  };

  const reset = () => {
    setWasteAmount("");
    setWasteType("");
    setFrequency("");
    setResult(null);
  };

  return (
    <section className="py-32 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-scale">
          <div className="inline-flex items-center gap-3 bg-primary/15 border-2 border-primary/30 rounded-full px-8 py-4 mb-10 shadow-card">
            <Globe className="text-primary" size={24} />
            <span className="text-primary font-bold text-base tracking-wide">ENVIRONMENTAL IMPACT</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-foreground mb-8 tracking-tight">
            Carbon Footprint <span className="text-gradient">Calculator</span>
          </h2>
          <p className="text-2xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed">
            Calculate your waste's environmental impact and discover how ARET's services can help reduce your carbon footprint.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Calculator Form */}
            <div className="card-modern shadow-hover hover:scale-105 transition-all duration-500 animate-fade-in-scale">
              <CardHeader>
                <CardTitle className="text-3xl text-gradient flex items-center gap-3 font-black">
                  <Calculator size={28} />
                  Calculate Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <label className="text-base font-bold text-foreground">Weekly Waste Amount (kg)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount in kg"
                    value={wasteAmount}
                    onChange={(e) => setWasteAmount(e.target.value)}
                    className="h-12 text-base border-2 focus:border-primary transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-base font-bold text-foreground">Waste Type</label>
                  <Select value={wasteType} onValueChange={setWasteType}>
                    <SelectTrigger className="h-12 text-base border-2 focus:border-primary">
                      <SelectValue placeholder="Select waste type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Waste</SelectItem>
                      <SelectItem value="organic">Organic Waste</SelectItem>
                      <SelectItem value="plastic">Plastic</SelectItem>
                      <SelectItem value="paper">Paper</SelectItem>
                      <SelectItem value="glass">Glass</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-base font-bold text-foreground">Collection Frequency</label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="h-12 text-base border-2 focus:border-primary">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={calculateFootprint} className="flex-1 btn-modern h-12 text-base font-bold">
                    Calculate Impact
                  </Button>
                  <Button onClick={reset} variant="outline" className="h-12 px-6 border-2 hover:border-primary transition-all duration-300">
                    Reset
                  </Button>
                </div>
              </CardContent>
            </div>

            {/* Results */}
            <div className="card-modern shadow-hover animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="text-3xl text-gradient flex items-center gap-3 font-black">
                  <Leaf size={28} />
                  Your Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result !== null ? (
                  <div className="space-y-8">
                    <div className="text-center p-8 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-2xl border-2 border-primary/20 shadow-card">
                      <div className="text-5xl font-black text-primary mb-3">
                        {result.toFixed(2)} kg
                      </div>
                      <p className="text-lg text-muted-foreground font-medium">CO₂ emissions per year</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-l-4 border-green-500 shadow-card">
                        <TrendingDown className="text-green-600 flex-shrink-0" size={24} />
                        <div>
                          <p className="font-bold text-green-800 dark:text-green-200 text-lg">
                            Potential Reduction with ARET
                          </p>
                          <p className="text-base text-green-600 dark:text-green-300 font-medium">
                            Up to {(result * 0.3).toFixed(2)} kg CO₂ saved annually through our recycling programs
                          </p>
                        </div>
                      </div>

                      <div className="text-base text-muted-foreground space-y-4 p-6 bg-muted/30 rounded-xl">
                        <p className="font-bold text-foreground text-lg flex items-center gap-2">
                          <Zap className="text-primary" size={20} />
                          How we help reduce your footprint:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-6 font-medium">
                          <li>Efficient collection routes reduce transportation emissions</li>
                          <li>Advanced recycling programs divert waste from landfills</li>
                          <li>Proper waste segregation maximizes recycling potential</li>
                          <li>Composting programs for organic waste</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Calculator className="mx-auto h-20 w-20 text-muted-foreground mb-6 opacity-50" />
                    <p className="text-lg text-muted-foreground font-medium">
                      Fill in the form to calculate your carbon footprint
                    </p>
                  </div>
                )}
              </CardContent>
            </div>
          </div>

          {/* Call to Action */}
        </div>
      </div>
    </section>
  );
};

export default CarbonFootprintCalculator;