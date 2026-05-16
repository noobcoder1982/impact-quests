import * as React from "react"
import { motion } from "framer-motion"
import { PackageIcon as Package, Medicine01Icon as Medical, Target01Icon as Rescue, FlashIcon as Logistics, Home01Icon as Shelter, Search01Icon as Search, FilterIcon as Filter, ArrowRight01Icon as ChevronRight, AlertCircleIcon as Alert, Tick01Icon as Check, AppleIcon as Food, DeliveryTruck01Icon as Truck } from 'hugeicons-react'
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

const inventoryData = {
  "metadata": {
      "last_updated": "2026-04-27T18:25:00Z",
      "warehouse_id": "ODISHA-BHU-01",
      "inventory_manager": "AI_LOGISTICS_HUB"
  },
  "categories": {
      "Medical & Healthcare": {
          "First Aid Kits (Professional)": {"qty": 45, "unit": "kits", "condition": "New", "location": "Medical Bay A1", "status": "Ready"},
          "N95 Respirators (3M)": {"qty": 1200, "unit": "units", "condition": "Sealed", "location": "Medical Bay A2", "status": "Ready"},
          "Portable Oxygen Concentrators": {"qty": 8, "unit": "units", "condition": "Operational", "location": "Medical Bay A1", "status": "Active"},
          "Latex Gloves (Boxes)": {"qty": 250, "unit": "boxes", "condition": "New", "location": "Medical Bay A3", "status": "Ready"},
          "Antiseptic Solution (500ml)": {"qty": 85, "unit": "bottles", "condition": "Good", "location": "Medical Bay A3", "status": "Ready"}
      },
      "Rescue & Tactical": {
          "Heavy Duty Rope (50m)": {"qty": 14, "unit": "coils", "condition": "Operational", "location": "Rescue Rack B1", "status": "Active"},
          "Tactical Flashlights (High-Lumen)": {"qty": 65, "unit": "units", "condition": "Operational", "location": "Rescue Rack B2", "status": "Ready"},
          "Hydraulic Spreader (Jaws of Life)": {"qty": 3, "unit": "units", "condition": "Pristine", "location": "Heavy Equipment Zone", "status": "Ready"},
          "Plasma Cutting Torch": {"qty": 2, "unit": "units", "condition": "Operational", "location": "Heavy Equipment Zone", "status": "Maintenance"},
          "Hazmat Suits (Level A)": {"qty": 12, "unit": "suits", "condition": "Certified", "location": "Sealed Vault S1", "status": "Ready"}
      },
      "Food & Water": {
          "Water Bottles (1L Case)": {"qty": 400, "unit": "cases", "condition": "Fresh", "location": "Sustenance Bay C1", "status": "Ready"},
          "MRE Rations (Vegetarian)": {"qty": 1500, "unit": "packs", "condition": "Fresh", "location": "Sustenance Bay C2", "status": "Ready"},
          "MRE Rations (High Protein)": {"qty": 800, "unit": "packs", "condition": "Fresh", "location": "Sustenance Bay C2", "status": "Ready"},
          "Portable Water Filters": {"qty": 120, "unit": "units", "condition": "New", "location": "Sustenance Bay C1", "status": "Ready"}
      },
      "Logistics & Power": {
          "Solar Power Banks": {"qty": 42, "unit": "units", "condition": "Charged", "location": "Electronics Bin D1", "status": "Ready"},
          "Digital Two-Way Radios": {"qty": 30, "unit": "units", "condition": "Operational", "location": "Electronics Bin D1", "status": "Active"},
          "Satellite Phone (Iridium)": {"qty": 4, "unit": "units", "condition": "Active", "location": "Secure Comms Box", "status": "Ready"},
          "Honda Portable Generator": {"qty": 6, "unit": "units", "condition": "Operational", "location": "Generator Yard", "status": "Ready"}
      }
  },
  "kits": [
    { name: "Flood Recovery Kit", weight: "12kg", items: ["Water Filter x1", "Flashlight x1", "Rope x1", "MRE x10"] },
    { name: "Medical Triage Kit", weight: "18kg", items: ["First Aid Kit x2", "Oxygen Concentrator x1", "Gloves x5", "Antiseptic x2"] }
  ]
};

export default function InventoryCenter() {
  const [inventory, setInventory] = React.useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState("Medical & Healthcare");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { apiRequest } = await import("../lib/api");
        const res = await apiRequest('/inventory');
        if (res.success) {
          setInventory(res.data);
        }
      } catch (err) {
        console.error("Inventory fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const categoryIcons: any = {
    "Medical & Healthcare": Medical,
    "Rescue & Tactical": Rescue,
    "Food & Water": Food,
    "Logistics & Power": Truck
  };

  const filteredItems = inventory.filter(item => item.category === selectedCategory);
  const totalUnits = inventory.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const readyPercent = inventory.length > 0 ? Math.round((inventory.filter(i => i.status === 'Ready').length / inventory.length) * 100) : 100;

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background font-body text-foreground pb-32 selection:bg-indigo-500/10 h-screen scrollbar-hide">
      <div className="max-w-7xl mx-auto p-10 space-y-12 pt-20">
        
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Inventory Protocol active</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-none">Strategic <span className="text-muted-foreground/20">Inventory</span></h1>
            <p className="text-muted-foreground/60 mt-4 text-lg font-medium max-w-xl">Comprehensive oversight of tactical assets, medical supplies, and sustenance logistics.</p>
          </div>
          <div className="hidden lg:flex gap-4 mb-2">
            <div className="px-6 py-4 rounded-3xl bg-card border border-border shadow-sm text-center min-w-[160px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Warehouse ID</p>
              <p className="text-sm font-black uppercase tracking-widest text-indigo-600">ODISHA-BHU-01</p>
            </div>
            <div className="px-6 py-4 rounded-3xl bg-card border border-border shadow-sm text-center min-w-[160px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Last Update</p>
              <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Real-time</p>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {Object.keys(categoryIcons).map(cat => {
            const Icon = categoryIcons[cat] || Package;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-8 py-5 rounded-[2rem] border transition-all flex items-center gap-4 shrink-0",
                  selectedCategory === cat 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/30" 
                    : "bg-card text-muted-foreground border-border hover:border-indigo-600/50 hover:bg-indigo-600/5"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-black uppercase tracking-widest">{cat}</span>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* Main Inventory List */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-secondary/20 border-b border-border">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Asset Identifier</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Stock Level</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-right">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredItems.map((item: any) => (
                    <motion.tr 
                      layout
                      key={item._id}
                      className="hover:bg-secondary/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <p className="text-[11px] font-black uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground/60 font-medium uppercase mt-1">{item.condition}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-end gap-1">
                          <span className="text-xl font-black uppercase tracking-tighter">{item.quantity}</span>
                          <span className="text-[10px] font-black text-muted-foreground/40 uppercase mb-1">{item.unit}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full",
                          item.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'
                        )}>
                          <div className={cn("h-1.5 w-1.5 rounded-full", item.status === 'Ready' ? 'bg-emerald-500' : 'bg-indigo-500')} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{item.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-secondary px-3 py-1.5 rounded-lg border border-border/60">
                          {item.location}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground/40 italic text-sm">No assets registered in this category.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Kits & Summary */}
          <div className="space-y-10">
            
            {/* Quick Summary Card */}
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-indigo-600/20 transition-all" />
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <Logistics className="h-4 w-4" />
                     </div>
                     <h3 className="text-[11px] font-black tracking-[0.3em] uppercase text-indigo-400">Tactical Summary</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <p className="text-4xl font-black tracking-tighter">{(totalUnits / 1000).toFixed(1)}k</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Total Active Units</p>
                     </div>
                     <div>
                        <p className="text-4xl font-black tracking-tighter text-emerald-400">{readyPercent}%</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Ready condition</p>
                     </div>
                  </div>
                  <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-indigo-600 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                     Export Logistics Manifest
                  </Button>
               </div>
            </div>

            {/* Mission Kits Placeholder - can be wired to backend later */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-2">Mission-Ready Kits</h3>
              <div className="space-y-4">
                  <div className="bg-card border border-border rounded-3xl p-8 hover:border-indigo-600/50 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-tight">Flood Recovery Kit</h4>
                        <p className="text-[10px] text-indigo-600 font-black uppercase mt-1">Estimated Weight: 12kg</p>
                      </div>
                      <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {["Water Filter x1", "Flashlight x1", "Rope x1", "MRE x10"].map(item => (
                         <span key={item} className="px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/60 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{item}</span>
                       ))}
                    </div>
                  </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
