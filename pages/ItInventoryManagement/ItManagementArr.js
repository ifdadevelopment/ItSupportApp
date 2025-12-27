export const subLocationMapping = {
  kalkaji_g33: [
    { key: "lab1", label: "Lab 1", icon: "business-outline" },
    { key: "lab2", label: "Lab 2", icon: "business-outline" },
    { key: "lab3", label: "Lab 3", icon: "business-outline" },
    { key: "counseling", label: "Counseling Cabin", icon: "people-outline" },
    { key: "backend", label: "Backend", icon: "server-outline" },
  ],
  kalkaji_h18: [
    { key: "lab1", label: "Lab 1", icon: "business-outline" },
    { key: "lab2", label: "Lab 2", icon: "business-outline" },
    { key: "lab3", label: "Lab 3", icon: "business-outline" },
  ],
  badarpur: [
    { key: "lab1", label: "Lab 1", icon: "business-outline" },
    { key: "lab2", label: "Lab 2", icon: "business-outline" },
    { key: "lab3", label: "Lab 3", icon: "business-outline" },
    { key: "lab4", label: "Lab 4", icon: "business-outline" },
    { key: "theory", label: "Theory", icon: "school-outline" },
    { key: "ground", label: "Ground Floor", icon: "home-outline" },
  ],
};



export const subCategoryMapping = {
  "input_devices": [
    { label: "Keyboard (Wired)", icon: "keyboard-outline" },
    { label: "Keyboard (Wireless)", icon: "keyboard-outline" },
    { label: "Keyboard (Mechanical)", icon: "keyboard-outline" },
    { label: "Mouse (Wired)", icon: "mouse-outline" },
    { label: "Mouse (Wireless)", icon: "mouse-outline" },
    { label: "Mouse (Gaming)", icon: "mouse-outline" },
    { label: "Mouse (Trackball)", icon: "mouse-outline" },
    { label: "Touchpad", icon: "tablet-outline" },
    { label: "Stylus / Digital Pen", icon: "pencil-outline" },
    { label: "Barcode Scanner", icon: "barcode-outline" }
  ],
  "output_devices": [
    { label: "Monitor (LED)", icon: "tv-outline" },
    { label: "Monitor (LCD)", icon: "tv-outline" },
    { label: "Monitor (Curved)", icon: "tv-outline" },
    { label: "Monitor (4K)", icon: "tv-outline" },
    { label: "Projector", icon: "videocam-outline" },
    { label: "Speakers", icon: "volume-high-outline" },
    { label: "Headphones / Headsets (Wired & Wireless)", icon: "headset-outline" },
    { label: "Printers (Laser)", icon: "print-outline" },
    { label: "Printers (Inkjet)", icon: "print-outline" },
    { label: "Printers (Dot Matrix)", icon: "print-outline" },
    { label: "Plotters", icon: "brush-outline" }
  ],
  "storage_devices": [
    { label: "External Hard Disk", icon: "hardware-chip-outline" },
    { label: "SSD (Portable / External)", icon: "hardware-chip-outline" },
    { label: "Pen Drives / USB Flash Drives", icon: "hardware-chip-outline" },
    { label: "Memory Cards (SD, MicroSD, CF)", icon: "card-outline" },
    { label: "NAS (Network Attached Storage)", icon: "server-outline" },
    { label: "Optical Discs (CD, DVD, Blu-Ray)", icon: "disc-outline" }
  ],
  "networking_accessories": [
    { label: "LAN Cables (Cat5, Cat6, Cat7)", icon: "git-network-outline" },
    { label: "Wi-Fi Routers", icon: "wifi-outline" },
    { label: "Switches", icon: "git-branch-outline" },
    { label: "Hubs", icon: "git-branch-outline" },
    { label: "Modems", icon: "settings-outline" },
    { label: "Access Points", icon: "wifi-outline" },
    { label: "Dongles (Wi-Fi / Data Cards)", icon: "hardware-chip-outline" }
  ],
  "power_connectivity": [
    { label: "UPS (Uninterruptible Power Supply)", icon: "flash-outline" },
    { label: "Power Strips / Extension Boards", icon: "flash-outline" },
    { label: "Surge Protectors", icon: "shield-outline" },
    { label: "Power Cables", icon: "flash-outline" },
    { label: "Adapters (Laptop Charger, Monitor Adapter, Universal Adapter)", icon: "flash-outline" },
    { label: "Docking Stations", icon: "hardware-chip-outline" }
  ],
  "cables_connectors": [
    { label: "HDMI Cables", icon: "switch-outline" },
    { label: "VGA Cables", icon: "switch-outline" },
    { label: "DVI Cables", icon: "switch-outline" },
    { label: "DisplayPort Cables", icon: "switch-outline" },
    { label: "USB Cables (Type-A, Type-B, Type-C, Micro USB)", icon: "usb-outline" },
    { label: "Audio Cables (3.5mm, AUX, RCA)", icon: "headset-outline" },
    { label: "Ethernet Cables", icon: "git-network-outline" },
    { label: "Converter Cables (HDMI to VGA, USB to LAN, etc.)", icon: "swap-horizontal-outline" }
  ],
  "computer_addons": [
    { label: "External DVD Writers", icon: "disc-outline" },
    { label: "Card Readers", icon: "card-outline" },
    { label: "Webcam", icon: "camera-outline" },
    { label: "External Sound Cards", icon: "volume-high-outline" },
    { label: "Joysticks / Game Controllers", icon: "game-controller-outline" }
  ],
  "cooling_maintenance": [
    { label: "Laptop Cooling Pads", icon: "hardware-chip-outline" },
    { label: "External Fans", icon: "hardware-chip-outline" },
    { label: "Cleaning Kits (Air Blower, Screen Cleaner, Wipes)", icon: "brush-outline" }
  ],
  "laptop_pc_accessories": [
    { label: "Laptop Bags / Sleeves", icon: "bag-outline" },
    { label: "Laptop Stands", icon: "hardware-chip-outline" },
    { label: "Screen Guards / Privacy Filters", icon: "eye-off-outline" },
    { label: "Keyboard & Mouse Pads", icon: "keyboard-outline" },
    { label: "Cable Organizers", icon: "git-branch-outline" },
    { label: "Dust Covers (Keyboard, Monitor, CPU)", icon: "brush-outline" }
  ],
  "security_accessories": [
    { label: "Laptop Locks (Kensington Locks)", icon: "lock-closed-outline" },
    { label: "Biometric Devices (Fingerprint Scanners)", icon: "finger-print-outline" },
    { label: "CCTV Accessories", icon: "videocam-outline" }
  ]
};
// ------------------- CATEGORY FIELD GROUPS -------------------
export const DISPLAY_FIELD_KEYS = new Set([
  "manufactureBy",
  "displayTag",
  "department",
  "mainLocation",
  "location",
  "purchaseDate",
  "warrantyExpiry",
  "status",
  "price",
]);

export const COMPUTER_FIELD_KEYS = new Set([
  "manufactureBy",
  "tagNoCpu",
  "macAddress",
  "operatingSystem",
  "software",
  "ram",
  "storage",
  "processor",
  "department",
  "mainLocation",
  "location",
  "purchaseDate",
  "warrantyExpiry",
  "status",
  "domain",
  "price",
]);

export const REQUIRED_FOR_DISPLAY = new Set([
  "manufactureBy",
  "displayTag",
  "mainLocation",
  "location",
]);

export const REQUIRED_FOR_COMPUTERS = new Set([
  "manufactureBy",
  "tagNoCpu",
  "operatingSystem",
  "ram",
  "storage",
  "processor",
  "macAddress",
  "mainLocation",
  "location",
  "domain",
]);


const itInventorySteps = [
  [
    { key: "category", label: "Category", type: "picker", icon: "list", required: true,
      options: [
        { icon: "laptop-outline", label: "Computers", key: "Computers" },
        { icon: "tv-outline", label: "Display", key: "Display" },
      ]
    },
    { key: "manufactureBy", label: "Item Name / Manufacturer", type: "text", placeholder: "Enter item name", icon: "cube", required: true },
    { key: "brand", label: "Brand", type: "text", placeholder: "Enter brand", icon: "pricetag", required: true },
    { key: "model", label: "Model", type: "text", placeholder: "Enter model", icon: "pricetags", required: false },
  ],
  [
    { key: "tagNoCpu", label: "Tag No (CPU)", type: "text", placeholder: "Enter CPU tag no", icon: "desktop-outline", required: true },
    { key: "displayTag", label: "Tag No (Monitor)", type: "text", placeholder: "Enter Monitor tag no", icon: "tv-outline", required: false },
    { key: "ram", label: "RAM", type: "text", placeholder: "Enter RAM", icon: "hardware-chip-outline", required: false },
    {
      key: "status", label: "Status", type: "picker", icon: "alert-circle", options: [
        { icon: "checkmark-circle", label: "available" },
        { icon: "close-circle", label: "in-use" },
        { icon: "build", label: "repair" },
        { icon: "trash", label: "retired" },
      ], required: true
    },
  ],
  [
    { key: "price", label: "Price", type: "number", placeholder: "Enter price", icon: "cash", required: false },
    {
      key: "department",
      label: "Department",
      type: "picker",
      placeholder: "Select Department",
      icon: "business-outline",
      required: true,
      options: [
        { label: "Basic Lab", icon: "business-outline" },
        { label: "Graphic Lab", icon: "business-outline" },
        { label: "Backend", icon: "server-outline" },
        { label: "Counselor", icon: "people-outline" },
        { label: "HR", icon: "people-outline" },
        { label: "Server", icon: "server-outline" },
      ]
    }, {
      key: "mainLocation", label: "Main Location", type: "picker", icon: "location", options: [
        { key: "kalkaji_g33", label: "Kalkaji G33", icon: "location-outline" },
        { key: "kalkaji_h18", label: "Kalkaji H18", icon: "location-outline" },
        { key: "badarpur", label: "Badarpur", icon: "location-outline" },
      ], required: true
    },
    {
      key: "location", label: "Location", type: "picker", icon: "location", options: [
      ], required: true
    },
  ],
  [
    { key: "storage", label: "Storage", type: "text", placeholder: "Enter Storage", icon: "hardware-chip-outline", required: true },
    { key: "processor", label: "Processor", type: "text", placeholder: "Enter Processor", icon: "hardware-chip-outline", required: true },
    { key: "purchaseDate", label: "Purchase Date", type: "date", placeholder: "YYYY-MM-DD", icon: "calendar-outline", required: false },
    { key: "warrantyExpiry", label: "Warranty Expiry", type: "date", placeholder: "YYYY-MM-DD", icon: "calendar-outline", required: false },
  ],
  [
    { key: "macAddress", label: "MAC Address", type: "text", placeholder: "AA:BB:CC:DD:EE:FF", icon: "network-outline", required: true },
    { key: "description", label: "Description / Notes", type: "textarea", placeholder: "Enter description", icon: "create", required: false },
    {
      key: "domain",
      label: "Domain",
      type: "picker",
      placeholder: "Domain",
      icon: "globe-outline",
      required: false,
      options: [
        { label: "ifda.local", icon: "globe-outline" },
        { label: "workgroup", icon: "globe-outline" }
      ]
    },
  ],
];
export const getDynamicItInventorySteps = (category = "Computers") => {
  const selectedSet =
    category === "Display" ? DISPLAY_FIELD_KEYS : COMPUTER_FIELD_KEYS;

  const requiredSet =
    category === "Display" ? REQUIRED_FOR_DISPLAY : REQUIRED_FOR_COMPUTERS;
  const filteredFields = itInventorySteps
    .flat()
    .filter((field) => {
      if (!field.key) return true;
      if (field.key === "category") return true;
      const inDisplay = DISPLAY_FIELD_KEYS.has(field.key);
      const inComputer = COMPUTER_FIELD_KEYS.has(field.key);

      if (inDisplay || inComputer) {
        return selectedSet.has(field.key);
      }
      return true;
    })
    .map((field) => {
      if (!field.key) return field;
      if (requiredSet.has(field.key)) {
        return { ...field, required: true };
      }
      return field;
    });
  const steps = [];
  for (let i = 0; i < filteredFields.length; i += 5) {
    steps.push(filteredFields.slice(i, i + 5));
  }

  return steps;
};

export default itInventorySteps;