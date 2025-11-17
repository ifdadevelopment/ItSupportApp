export const subLocationMapping = {
  "Kalkaji G33": [
    { key: "lab1", label: "Lab 1", icon: "business-outline" },
    { key: "lab2", label: "Lab 2", icon: "business-outline" },
    { key: "lab3", label: "Lab 3", icon: "business-outline" },
    { key: "counseling", label: "Counseling Cabin", icon: "people-outline" },
    { key: "backend", label: "Backend", icon: "server-outline" },
  ],
  "Kalkaji H18": [
    { key: "lab1", label: "Lab 1", icon: "business-outline" },
    { key: "lab2", label: "Lab 2", icon: "business-outline" },
    { key: "lab3", label: "Lab 3", icon: "business-outline" },
  ],
  "Badarpur": [
    { key: "lab1", label: "Lab 1", icon: "business-outline" },
    { key: "lab2", label: "Lab 2", icon: "business-outline" },
    { key: "lab3", label: "Lab 3", icon: "business-outline" },
    { key: "lab4", label: "Lab 4", icon: "business-outline" },
    { key: "theory", label: "Theory", icon: "school-outline" },
    { key: "ground", label: "Ground Floor", icon: "home-outline" },
  ],
};


export const steps = [
  [
    { key: "title", label: "Ticket Title", type: "text", placeholder: "Enter ticket title", icon: "document-text" },
    {
      key: "category", label: "Category", type: "picker", icon: "list", options: [
        { icon: "hardware-chip-outline", label: "Hardware Issue" },
        { icon: "laptop-outline", label: "Software Issue" },
        { icon: "wifi", label: "Network Issue" },
        { icon: "print", label: "Printer Issue" },
        { icon: "mail", label: "Email Issue" },
        { icon: "key", label: "Password Reset" },
        { icon: "add-circle", label: "New Equipment Request" },
        { icon: "download", label: "Software Installation" },
        { icon: "ellipsis-horizontal", label: "Other" },
      ]
    },
    {
      key: "priority", label: "Priority", type: "picker", icon: "flag", options: [
        { icon: "arrow-down", label: "Low" },
        { icon: "remove", label: "Medium" },
        { icon: "flame", label: "High" },
        { icon: "alert-circle", label: "Urgent" },
      ]
    },

    {
      key: "pc",
      label: "Select PC",
      type: "remotePicker",
      icon: "desktop",
    },
  ],
  [

    { key: "description", label: "Description", type: "textarea", placeholder: "Explain your issue", icon: "create" },

    {
      key: "location", label: "Location", type: "picker", icon: "location", options: [
        { key: "Kalkaji G33", label: "Kalkaji G33", icon: "location-outline" },
        { key: "Kalkaji H18", label: "Kalkaji H18", icon: "location-outline" },
        { key: "Badarpur", label: "Badarpur", icon: "location-outline" },
      ]
    },
    {
      key: "assignedTo",
      label: "Assign User",
      type: "remotePicker",
      icon: "person-outline",
    },
    {
      key: "sublocation", label: "Sub Location", type: "picker", icon: "location", options: [
      ],
      required: true
    },
    ,
  ],
];