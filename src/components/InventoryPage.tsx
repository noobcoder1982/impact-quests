import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PackageIcon as Package,
  Award01Icon as Award,
  FlashIcon as Zap,
  SparklesIcon as Sparkles,
  ShoppingBasket01Icon as ShoppingBag,
  FilterIcon as Filter,
  Search01Icon as Search,
  Tick01Icon as Check,
  Cancel01Icon as X,
  Delete02Icon as Trash2,
  StarIcon as Star,
  CrownIcon as Crown,
  Shield01Icon as Shield,
  Target01Icon as Target,
  FireIcon as Flame,
  EnergyIcon as Battery,
  PaintBoardIcon as Palette,
  BookOpen01Icon as BookOpen
} from "hugeicons-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { apiRequest } from "../lib/api"
import { useNavigate } from "react-router-dom"

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
}

// Rarity color mappings
const rarityColors = {
  common: { bg: "bg-gray-500/10", text: "text-gray-500", border: "border-gray-500/20", glow: "shadow-gray-500/20" },
  uncommon: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20", glow: "shadow-green-500/20" },
  rare: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", glow: "shadow-blue-500/20" },
  epic: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20", glow: "shadow-purple-500/20" },
  legendary: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20", glow: "shadow-yellow-500/20" }
}

// Item type icons
const itemTypeIcons = {
  resource: Package,
  badge: Award,
  consumable: Battery,
  boost: Zap,
  cosmetic: Palette,
  skill: BookOpen
}

interface InventoryItem {
  _id: string
  name: string
  itemType: string
  category: string
  rarity: string
  earnedFrom: string
  earnedAt: string
  usageState: string
  quantity: number
  expiresAt?: string
  metadata?: any
}

export default function InventoryPage() {
  const navigate = useNavigate()
  const [items, setItems] = React.useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = React.useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // Filters
  const [selectedType, setSelectedType] = React.useState<string | null>(null)
  const [selectedRarity, setSelectedRarity] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  
  // Selected item for modal
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null)
  
  // Stats
  const [stats, setStats] = React.useState<any>(null)

  // Fetch inventory
  const fetchInventory = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await apiRequest('/inventory')
      if (res.success) {
        setItems(res.data)
        setFilteredItems(res.data)
      }
    } catch (err: any) {
      console.error("Failed to fetch inventory:", err)
      setError(err.message || "Failed to load inventory")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch stats
  const fetchStats = React.useCallback(async () => {
    try {
      const res = await apiRequest('/inventory/stats')
      if (res.success) {
        setStats(res.data.stats)
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    }
  }, [])

  React.useEffect(() => {
    fetchInventory()
    fetchStats()
  }, [fetchInventory, fetchStats])

  // Apply filters
  React.useEffect(() => {
    let filtered = [...items]
    
    if (selectedType) {
      filtered = filtered.filter(item => item.itemType === selectedType)
    }
    
    if (selectedRarity) {
      filtered = filtered.filter(item => item.rarity === selectedRarity)
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredItems(filtered)
  }, [items, selectedType, selectedRarity, searchQuery])

  // Use item
  const handleUseItem = async (itemId: string) => {
    try {
      const res = await apiRequest(`/inventory/${itemId}/use`, { method: 'PUT' })
      if (res.success) {
        fetchInventory()
        setSelectedItem(null)
      }
    } catch (err: any) {
      alert(err.message || "Failed to use item")
    }
  }

  // Remove item
  const handleRemoveItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to remove this item?")) return
    
    try {
      const res = await apiRequest(`/inventory/${itemId}`, { method: 'DELETE' })
      if (res.success) {
        fetchInventory()
        setSelectedItem(null)
      }
    } catch (err: any) {
      alert(err.message || "Failed to remove item")
    }
  }

  const itemTypes = ['resource', 'badge', 'consumable', 'boost', 'cosmetic', 'skill']
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary']

  return (
    <div className="flex-1 overflow-y-auto bg-background font-body text-foreground pb-32 h-screen scrollbar-hide py-10 px-8">
      <main className="max-w-[1700px] mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-purple-600 text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-lg shadow-purple-600/20"
            >
              <Package className="h-4 w-4" /> Inventory
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground leading-[0.8] mb-4">
              Your <span className="font-display italic font-medium text-purple-600">Collection</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Manage your earned items, badges, and power-ups. Use boosts to enhance your performance.
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              <motion.div {...fadeInUp} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
                <div className="text-2xl font-bold text-foreground">{stats.totalItems}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Items</div>
              </motion.div>
              <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
                <div className="text-2xl font-bold text-green-500">{stats.availableItems}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Available</div>
              </motion.div>
              <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
                <div className="text-2xl font-bold text-blue-500">{stats.byType?.badge || 0}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Badges</div>
              </motion.div>
              <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
                <div className="text-2xl font-bold text-purple-500">{stats.byType?.boost || 0}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Boosts</div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Filters */}
        <motion.div {...fadeInUp} className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Type Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Item Type
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(null)}
                className="rounded-full"
              >
                All
              </Button>
              {itemTypes.map(type => {
                const Icon = itemTypeIcons[type as keyof typeof itemTypeIcons]
                return (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="rounded-full capitalize"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {type}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Rarity Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Star className="h-4 w-4" />
              Rarity
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedRarity === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRarity(null)}
                className="rounded-full"
              >
                All
              </Button>
              {rarities.map(rarity => (
                <Button
                  key={rarity}
                  variant={selectedRarity === rarity ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRarity(rarity)}
                  className={cn(
                    "rounded-full capitalize",
                    selectedRarity === rarity && rarityColors[rarity as keyof typeof rarityColors].text
                  )}
                >
                  {rarity}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <X className="h-24 w-24 text-red-500/30 mb-4" />
            <h3 className="text-xl font-bold mb-2">Error Loading Inventory</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchInventory}>Try Again</Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Package className="h-24 w-24 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {items.length === 0 ? "Your Inventory is Empty" : "No Items Found"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {items.length === 0 
                ? "Complete tasks and achieve milestones to earn items!" 
                : "Try adjusting your filters"}
            </p>
            {items.length === 0 && (
              <Button onClick={() => navigate('/marketplace')}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Tasks
              </Button>
            )}
          </div>
        ) : (
          <motion.div 
            {...fadeInUp}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredItems.map((item, index) => {
              const Icon = itemTypeIcons[item.itemType as keyof typeof itemTypeIcons] || Package
              const colors = rarityColors[item.rarity as keyof typeof rarityColors] || rarityColors.common
              
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "group relative bg-card/50 backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-xl",
                    colors.border,
                    colors.glow
                  )}
                >
                  {/* Rarity Badge */}
                  <div className={cn(
                    "absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                    colors.bg,
                    colors.text
                  )}>
                    {item.rarity}
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                    colors.bg
                  )}>
                    <Icon className={cn("h-8 w-8", colors.text)} />
                  </div>

                  {/* Name & Category */}
                  <h3 className="text-lg font-bold text-foreground mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.category}</p>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{item.itemType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className={cn(
                        "font-medium capitalize",
                        item.usageState === 'available' && "text-green-500",
                        item.usageState === 'in-use' && "text-blue-500",
                        item.usageState === 'consumed' && "text-gray-500",
                        item.usageState === 'expired' && "text-red-500"
                      )}>
                        {item.usageState}
                      </span>
                    </div>
                    {item.quantity > 1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium">{item.quantity}</span>
                      </div>
                    )}
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all pointer-events-none" />
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </main>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-8 max-w-lg w-full space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3",
                    rarityColors[selectedItem.rarity as keyof typeof rarityColors].bg,
                    rarityColors[selectedItem.rarity as keyof typeof rarityColors].text
                  )}>
                    {selectedItem.rarity}
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">{selectedItem.name}</h2>
                  <p className="text-muted-foreground">{selectedItem.category}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Item Type</span>
                  <span className="font-medium capitalize">{selectedItem.itemType}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Earned From</span>
                  <span className="font-medium capitalize">{selectedItem.earnedFrom}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Status</span>
                  <span className={cn(
                    "font-medium capitalize",
                    selectedItem.usageState === 'available' && "text-green-500",
                    selectedItem.usageState === 'in-use' && "text-blue-500",
                    selectedItem.usageState === 'consumed' && "text-gray-500",
                    selectedItem.usageState === 'expired' && "text-red-500"
                  )}>
                    {selectedItem.usageState}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Earned At</span>
                  <span className="font-medium">{new Date(selectedItem.earnedAt).toLocaleDateString()}</span>
                </div>
                {selectedItem.expiresAt && (
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Expires At</span>
                    <span className="font-medium">{new Date(selectedItem.expiresAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Metadata */}
              {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                <div className="bg-background/50 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Additional Info</div>
                  {Object.entries(selectedItem.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {(selectedItem.itemType === 'consumable' || selectedItem.itemType === 'boost') && 
                 selectedItem.usageState === 'available' && (
                  <Button
                    onClick={() => handleUseItem(selectedItem._id)}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Use Item
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleRemoveItem(selectedItem._id)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Made with Bob
