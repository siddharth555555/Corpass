const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const sellers = [
  { name: "Rajesh Patel", loginId: "seller01", email: "rajesh@paperworld.in", mobile: "9876543001", city: "Mumbai", pincode: "400001", company: "PaperWorld India", companyAddr: "Andheri East, Mumbai", gstin: "27AABCP1234A1Z5", products: [
    { name: "A4 Copier Paper 75 GSM", desc: "High-quality 75 GSM A4 copier paper, 500 sheets per ream", cat: "Office Supplies", sub: "Paper & Notebooks", priceType: "FIXED", price: 280, unit: "PACK", ppu: 500, moq: 10, minAmt: 2800, delivery: 3 },
    { name: "Legal Size Ruled Notebooks", desc: "200 page ruled notebooks, legal size for office use", cat: "Office Supplies", sub: "Paper & Notebooks", priceType: "FIXED", price: 65, unit: "PIECE", moq: 50, minAmt: 3250, delivery: 2 },
  ]},
  { name: "Priya Sharma", loginId: "seller02", email: "priya@furnishcorp.in", mobile: "9876543002", city: "Delhi", pincode: "110001", company: "FurnishCorp", companyAddr: "Kirti Nagar, New Delhi", gstin: "07AABCF5678B2Z9", products: [
    { name: "Executive Office Desk", desc: "Engineered wood executive desk with cable management, 150x75cm", cat: "Furniture", sub: "Desks", priceType: "FIXED", price: 18500, unit: "PIECE", moq: 1, minAmt: 18500, delivery: 7 },
    { name: "Ergonomic Mesh Office Chair", desc: "High-back mesh chair with lumbar support and adjustable armrests", cat: "Furniture", sub: "Ergonomic Chairs", priceType: "FIXED", price: 12000, unit: "PIECE", moq: 2, minAmt: 24000, delivery: 5 },
    { name: "4-Drawer Steel Filing Cabinet", desc: "Heavy-duty steel cabinet with anti-tilt mechanism and lock", cat: "Furniture", sub: "Filing Cabinets", priceType: "FIXED", price: 8500, unit: "PIECE", moq: 1, minAmt: 8500, delivery: 7 },
  ]},
  { name: "Amit Verma", loginId: "seller03", email: "amit@giftcraft.in", mobile: "9876543003", city: "Jaipur", pincode: "302001", company: "GiftCraft Studios", companyAddr: "MI Road, Jaipur", gstin: "08AABCG9012C3Z1", products: [
    { name: "Branded Cotton Polo T-Shirts", desc: "Customizable polo t-shirts with company logo embroidery", cat: "Corporate Gifting", sub: "Apparel", priceType: "FIXED", price: 450, unit: "PIECE", moq: 50, minAmt: 22500, delivery: 10 },
    { name: "Insulated Steel Tumbler Set", desc: "Set of 4 double-walled insulated tumblers with company branding", cat: "Corporate Gifting", sub: "Drinkware", priceType: "FIXED", price: 1200, unit: "SET", moq: 25, minAmt: 30000, delivery: 8 },
  ]},
  { name: "Sneha Iyer", loginId: "seller04", email: "sneha@techzone.in", mobile: "9876543004", city: "Bengaluru", pincode: "560001", company: "TechZone Solutions", companyAddr: "Koramangala, Bengaluru", gstin: "29AABCT3456D4Z7", products: [
    { name: "Business Laptop 14-inch i5", desc: "14-inch FHD IPS display, Intel i5 13th Gen, 16GB RAM, 512GB SSD", cat: "IT & Electronics", sub: "Laptops", priceType: "FIXED", price: 52000, unit: "PIECE", moq: 5, minAmt: 260000, delivery: 5 },
    { name: "Wireless Keyboard and Mouse Combo", desc: "Slim wireless keyboard and ergonomic mouse combo, USB receiver", cat: "IT & Electronics", sub: "Peripherals", priceType: "FIXED", price: 1800, unit: "SET", moq: 10, minAmt: 18000, delivery: 3 },
    { name: "24-inch Full HD Monitor", desc: "24-inch IPS display, 75Hz, HDMI & VGA ports, VESA mount", cat: "IT & Electronics", sub: "Monitors", priceType: "FIXED", price: 11500, unit: "PIECE", moq: 3, minAmt: 34500, delivery: 4 },
  ]},
  { name: "Vikram Singh", loginId: "seller05", email: "vikram@freshbite.in", mobile: "9876543005", city: "Kolkata", pincode: "700001", company: "FreshBite Supplies", companyAddr: "Salt Lake, Kolkata", gstin: "19AABCF7890E5Z3", products: [
    { name: "Premium Arabica Coffee Beans", desc: "Roasted Arabica coffee beans from Coorg, 1kg pack", cat: "Pantry & Breakroom", sub: "Coffee & Tea", priceType: "FIXED", price: 850, unit: "KILOGRAM", moq: 5, minAmt: 4250, delivery: 4 },
    { name: "Assorted Biscuit Box", desc: "Mixed variety biscuit box, 24 individual packs", cat: "Pantry & Breakroom", sub: "Snacks", priceType: "FIXED", price: 480, unit: "BOX", ppu: 24, moq: 10, minAmt: 4800, delivery: 3 },
  ]},
  { name: "Meera Gupta", loginId: "seller06", email: "meera@cleanpro.in", mobile: "9876543006", city: "Hyderabad", pincode: "500001", company: "CleanPro Industries", companyAddr: "Banjara Hills, Hyderabad", gstin: "36AABCC1234F6Z8", products: [
    { name: "Multi-Surface Disinfectant 5L", desc: "Hospital-grade multi-surface disinfectant, 5-litre can", cat: "Janitorial & Cleaning", sub: "Cleaning Chemicals", priceType: "FIXED", price: 650, unit: "LITRE", moq: 20, minAmt: 13000, delivery: 3 },
    { name: "Industrial Mop Set with Wringer Bucket", desc: "Commercial-grade mop with stainless steel wringer bucket", cat: "Janitorial & Cleaning", sub: "Mops & Brooms", priceType: "FIXED", price: 2200, unit: "SET", moq: 5, minAmt: 11000, delivery: 4 },
  ]},
  { name: "Arjun Nair", loginId: "seller07", email: "arjun@toolmaster.in", mobile: "9876543007", city: "Chennai", pincode: "600001", company: "ToolMaster India", companyAddr: "T Nagar, Chennai", gstin: "33AABCT5678G7Z2", products: [
    { name: "Cordless Power Drill 18V", desc: "18V lithium-ion cordless drill with 2 batteries and charger", cat: "Industrial Supplies", sub: "Power Tools", priceType: "FIXED", price: 4500, unit: "PIECE", moq: 3, minAmt: 13500, delivery: 5 },
    { name: "Safety Helmet ISI Marked", desc: "ISI marked industrial safety helmet with ratchet adjustment", cat: "Industrial Supplies", sub: "Safety Equipment (PPE)", priceType: "FIXED", price: 350, unit: "PIECE", moq: 50, minAmt: 17500, delivery: 3 },
  ]},
  { name: "Kavita Reddy", loginId: "seller08", email: "kavita@packright.in", mobile: "9876543008", city: "Pune", pincode: "411001", company: "PackRight Solutions", companyAddr: "Hinjewadi, Pune", gstin: "27AABCP9012H8Z6", products: [
    { name: "3-Ply Corrugated Boxes (12x10x8)", desc: "3-ply corrugated shipping boxes, 12x10x8 inches", cat: "Packaging Materials", sub: "Corrugated Boxes", priceType: "FIXED", price: 18, unit: "PIECE", moq: 100, minAmt: 1800, delivery: 4 },
    { name: "Brown BOPP Packing Tape 48mm", desc: "Heavy-duty BOPP packing tape, 48mm x 65m, pack of 6", cat: "Packaging Materials", sub: "Packing Tape", priceType: "FIXED", price: 320, unit: "PACK", ppu: 6, moq: 10, minAmt: 3200, delivery: 2 },
  ]},
  { name: "Suresh Kumar", loginId: "seller09", email: "suresh@printex.in", mobile: "9876543009", city: "Ahmedabad", pincode: "380001", company: "PrintEx Graphics", companyAddr: "CG Road, Ahmedabad", gstin: "24AABCP3456I9Z0", products: [
    { name: "Premium Business Cards (500 pcs)", desc: "350 GSM matte laminated business cards, full color print", cat: "Printing & Signage", sub: "Business Cards", priceType: "FIXED", price: 1200, unit: "PACK", ppu: 500, moq: 2, minAmt: 2400, delivery: 5 },
    { name: "Vinyl Banner 8x4 ft", desc: "Full-color vinyl banner with eyelets, weather-resistant", cat: "Printing & Signage", sub: "Banners & Signs", priceType: "FIXED", price: 900, unit: "PIECE", moq: 3, minAmt: 2700, delivery: 4 },
  ]},
  { name: "Divya Menon", loginId: "seller10", email: "divya@cloudsoft.in", mobile: "9876543010", city: "Bengaluru", pincode: "560034", company: "CloudSoft Technologies", companyAddr: "Whitefield, Bengaluru", gstin: "29AABCC7890J1Z4", products: [
    { name: "Project Management Tool - Annual License", desc: "Cloud-based project management with unlimited users, annual", cat: "Software & SaaS", sub: "Productivity Tools", priceType: "FIXED", price: 45000, unit: "YEAR", moq: 1, minAmt: 45000, delivery: 0, isService: true },
    { name: "Endpoint Security Suite - Per Device", desc: "Enterprise antivirus and threat protection, per device license", cat: "Software & SaaS", sub: "Security Software", priceType: "FIXED", price: 2500, unit: "YEAR", moq: 10, minAmt: 25000, delivery: 0, isService: true },
  ]},
  { name: "Rohit Joshi", loginId: "seller11", email: "rohit@officehub.in", mobile: "9876543011", city: "Lucknow", pincode: "226001", company: "OfficeHub Supplies", companyAddr: "Hazratganj, Lucknow", gstin: "09AABCO1234K2Z8", products: [
    { name: "Gel Ink Pens Box of 50", desc: "Smooth-flow gel ink pens, blue, 0.7mm tip, box of 50", cat: "Office Supplies", sub: "Pens & Writing", priceType: "FIXED", price: 750, unit: "BOX", ppu: 50, moq: 5, minAmt: 3750, delivery: 3 },
    { name: "Desk Organizer 5-Compartment", desc: "Wooden desk organizer with 5 compartments for stationery", cat: "Office Supplies", sub: "Desk Accessories", priceType: "FIXED", price: 550, unit: "PIECE", moq: 10, minAmt: 5500, delivery: 4 },
  ]},
  { name: "Ananya Das", loginId: "seller12", email: "ananya@sitright.in", mobile: "9876543012", city: "Noida", pincode: "201301", company: "SitRight Furniture", companyAddr: "Sector 62, Noida", gstin: "09AABCS5678L3Z2", products: [
    { name: "Conference Table 10-Seater", desc: "Solid wood conference table, 300x120cm, cable management built-in", cat: "Furniture", sub: "Conference Tables", priceType: "CONTACT_FOR_QUOTE", price: 35000, unit: "PIECE", moq: 1, minAmt: 35000, delivery: 14 },
    { name: "Reception Sofa 3-Seater", desc: "Leatherette 3-seater sofa for office reception and lounge areas", cat: "Furniture", sub: "Sofas & Lounge", priceType: "FIXED", price: 22000, unit: "PIECE", moq: 1, minAmt: 22000, delivery: 10 },
  ]},
  { name: "Karthik Rajan", loginId: "seller13", email: "karthik@gadgetgift.in", mobile: "9876543013", city: "Chennai", pincode: "600042", company: "GadgetGift Co", companyAddr: "Anna Nagar, Chennai", gstin: "33AABCG9012M4Z6", products: [
    { name: "Bluetooth Speaker with Logo Print", desc: "Portable Bluetooth speaker with custom company logo printing", cat: "Corporate Gifting", sub: "Tech Gadgets", priceType: "FIXED", price: 1800, unit: "PIECE", moq: 25, minAmt: 45000, delivery: 12 },
    { name: "Diwali Gift Hamper Premium", desc: "Premium Diwali hamper with dry fruits, chocolates & branded packaging", cat: "Corporate Gifting", sub: "Gift Hampers", priceType: "FIXED", price: 2500, unit: "PIECE", moq: 20, minAmt: 50000, delivery: 7 },
  ]},
  { name: "Neha Agarwal", loginId: "seller14", email: "neha@netgear.in", mobile: "9876543014", city: "Gurugram", pincode: "122001", company: "NetGear Solutions", companyAddr: "Cyber City, Gurugram", gstin: "06AABCN3456N5Z0", products: [
    { name: "Enterprise WiFi Access Point", desc: "Dual-band enterprise WiFi 6 access point, ceiling mount", cat: "IT & Electronics", sub: "Networking", priceType: "FIXED", price: 8500, unit: "PIECE", moq: 5, minAmt: 42500, delivery: 5 },
    { name: "Network Laser Printer Color", desc: "Color laser printer with duplex and Ethernet, 30ppm", cat: "IT & Electronics", sub: "Printers & Scanners", priceType: "FIXED", price: 28000, unit: "PIECE", moq: 1, minAmt: 28000, delivery: 4 },
  ]},
  { name: "Sanjay Mishra", loginId: "seller15", email: "sanjay@teacafe.in", mobile: "9876543015", city: "Indore", pincode: "452001", company: "TeaCafe Distributors", companyAddr: "MG Road, Indore", gstin: "23AABCT7890O6Z4", products: [
    { name: "Assam Premium Tea 1kg", desc: "Premium CTC Assam tea, strong and aromatic, 1kg pack", cat: "Pantry & Breakroom", sub: "Coffee & Tea", priceType: "FIXED", price: 420, unit: "KILOGRAM", moq: 10, minAmt: 4200, delivery: 4 },
    { name: "Mineral Water Dispenser Hot & Cold", desc: "Floor-standing water dispenser with hot, cold and normal options", cat: "Pantry & Breakroom", sub: "Appliances", priceType: "FIXED", price: 7500, unit: "PIECE", moq: 1, minAmt: 7500, delivery: 5 },
  ]},
  { name: "Pooja Bhat", loginId: "seller16", email: "pooja@safezone.in", mobile: "9876543016", city: "Nagpur", pincode: "440001", company: "SafeZone Supplies", companyAddr: "Dharampeth, Nagpur", gstin: "27AABCS1234P7Z8", products: [
    { name: "Stainless Steel Hand Tool Kit 25pc", desc: "25-piece chrome vanadium steel hand tool kit in carry case", cat: "Industrial Supplies", sub: "Hand Tools", priceType: "FIXED", price: 3200, unit: "SET", moq: 5, minAmt: 16000, delivery: 4 },
    { name: "Reflective Safety Vest (Pack of 10)", desc: "High-visibility reflective safety vest, EN ISO 20471 Class 2", cat: "Industrial Supplies", sub: "Safety Equipment (PPE)", priceType: "FIXED", price: 1500, unit: "PACK", ppu: 10, moq: 5, minAmt: 7500, delivery: 3 },
  ]},
  { name: "Manish Tiwari", loginId: "seller17", email: "manish@wrapwell.in", mobile: "9876543017", city: "Surat", pincode: "395001", company: "WrapWell Packaging", companyAddr: "Ring Road, Surat", gstin: "24AABCW5678Q8Z2", products: [
    { name: "Bubble Wrap Roll 100m x 1m", desc: "10mm bubble wrap roll, 100 meters x 1 meter", cat: "Packaging Materials", sub: "Bubble Wrap", priceType: "FIXED", price: 1800, unit: "ROLL", moq: 5, minAmt: 9000, delivery: 3 },
    { name: "Kraft Paper Mailers 10x14 inch", desc: "Self-seal kraft paper mailers, 10x14 inches, pack of 50", cat: "Packaging Materials", sub: "Mailers & Envelopes", priceType: "FIXED", price: 650, unit: "PACK", ppu: 50, moq: 10, minAmt: 6500, delivery: 3 },
  ]},
  { name: "Ritu Saxena", loginId: "seller18", email: "ritu@brandprint.in", mobile: "9876543018", city: "Delhi", pincode: "110085", company: "BrandPrint Media", companyAddr: "Pitampura, Delhi", gstin: "07AABCB9012R9Z6", products: [
    { name: "Company Brochure Tri-fold (1000 pcs)", desc: "A4 tri-fold brochure, 170 GSM art paper, full color", cat: "Printing & Signage", sub: "Brochures & Flyers", priceType: "FIXED", price: 8500, unit: "PACK", ppu: 1000, moq: 1, minAmt: 8500, delivery: 7 },
    { name: "Custom Branded Laptop Bags", desc: "15.6-inch padded laptop bag with custom embroidered logo", cat: "Printing & Signage", sub: "Custom Merchandise", priceType: "FIXED", price: 750, unit: "PIECE", moq: 50, minAmt: 37500, delivery: 14 },
  ]},
  { name: "Arun Pillai", loginId: "seller19", email: "arun@bizconsult.in", mobile: "9876543019", city: "Mumbai", pincode: "400051", company: "BizConsult Partners", companyAddr: "BKC, Mumbai", gstin: "27AABCB3456S1Z0", products: [
    { name: "HR Compliance Audit", desc: "Comprehensive HR compliance audit for companies with 50-500 employees", cat: "Professional Services", sub: "Consulting", priceType: "CONTACT_FOR_QUOTE", price: 75000, unit: "PROJECT", moq: 1, minAmt: 75000, delivery: 0, isService: true },
    { name: "GST Filing & Advisory - Monthly", desc: "Monthly GST return filing with advisory for SMEs", cat: "Professional Services", sub: "Accounting & Finance", priceType: "FIXED", price: 5000, unit: "MONTH", moq: 6, minAmt: 30000, delivery: 0, isService: true },
  ]},
  { name: "Lakshmi Rao", loginId: "seller20", email: "lakshmi@sparkcreative.in", mobile: "9876543020", city: "Hyderabad", pincode: "500032", company: "Spark Creative Agency", companyAddr: "Jubilee Hills, Hyderabad", gstin: "36AABCS7890T2Z4", products: [
    { name: "Social Media Management - Monthly", desc: "Complete social media management across 3 platforms", cat: "Professional Services", sub: "Marketing & PR", priceType: "FIXED", price: 25000, unit: "MONTH", moq: 3, minAmt: 75000, delivery: 0, isService: true },
    { name: "Corporate Website Design", desc: "Responsive corporate website design, up to 10 pages with CMS", cat: "Software & SaaS", sub: "Design Software", priceType: "CONTACT_FOR_QUOTE", price: 80000, unit: "PROJECT", moq: 1, minAmt: 80000, delivery: 0, isService: true },
  ]},
];

async function main() {
  const password = 'Test@1234';
  const hashed = await bcrypt.hash(password, 10);
  
  const creds = [];

  for (const s of sellers) {
    // Create company
    const company = await prisma.company.create({
      data: { name: s.company, address: s.companyAddr, type: 'LLC', employeeCount: '11-50' }
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        name: s.name, loginId: s.loginId, password: hashed, email: s.email,
        mobile: s.mobile, address: s.companyAddr, city: s.city, pincode: s.pincode,
        role: 'SELLER', companyId: company.id
      }
    });

    // Create seller profile
    const sp = await prisma.sellerProfile.create({
      data: { userId: user.id, gstin: s.gstin, deliveryRange: 'SHIPPING_AVAILABLE' }
    });

    // Create products
    for (const p of s.products) {
      await prisma.productCatalog.create({
        data: {
          sellerProfileId: sp.id, name: p.name, description: p.desc,
          category: p.cat, subCategory: p.sub, priceType: p.priceType,
          price: p.price, pricingUnit: p.unit, piecesPerUnit: p.ppu || null,
          isDeliverable: p.isService ? false : true,
          minQtyPurchase: p.moq, minAmountPurchase: p.minAmt,
          deliveryTimeDays: p.delivery
        }
      });
    }

    creds.push(`${s.loginId} | ${password} | ${s.name} | ${s.company} | ${s.city}`);
    console.log(`✅ Created seller: ${s.name} (${s.company}) with ${s.products.length} products`);
  }

  // Write credentials file
  const fs = require('fs');
  const header = 'Login ID | Password | Name | Company | City\n' + '='.repeat(70) + '\n';
  fs.writeFileSync('./seller_credentials.txt', header + creds.join('\n') + '\n');
  console.log('\n📄 Credentials saved to apps/backend/seller_credentials.txt');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
