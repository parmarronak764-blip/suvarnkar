import { _mock } from './_mock';

// Mock dealers data
export const MOCK_DEALERS = [
  {
    id: 1,
    dealerCode: 'DLR001',
    dealerName: 'Golden Jewels Pvt Ltd',
    ownerName: 'Rajesh Kumar',
    phone: '9876543210',
    address: 'Shop No. 15, Zaveri Bazaar, Mumbai',
    city: 'Mumbai',
    gstNumber: '27ABCDE1234F1Z5',
    status: 'active',
  },
  {
    id: 2,
    dealerCode: 'DLR002',
    dealerName: 'Silver Star Enterprises',
    ownerName: 'Priya Sharma',
    phone: '9876543211',
    address: 'Plot 45, Gems Market, Jaipur',
    city: 'Jaipur',
    gstNumber: '08FGHIJ5678K2L6',
    status: 'active',
  },
  {
    id: 3,
    dealerCode: 'DLR003',
    dealerName: 'Platinum Palace',
    ownerName: 'Amit Patel',
    phone: '9876543212',
    address: 'Unit 12, Diamond Plaza, Surat',
    city: 'Surat',
    gstNumber: '24MNOPQ9012R3S7',
    status: 'active',
  },
  {
    id: 4,
    dealerCode: 'DLR004',
    dealerName: 'Gemstone Gallery',
    ownerName: 'Neha Gupta',
    phone: '9876543213',
    address: 'Shop 8, Precious Stone Market, Delhi',
    city: 'Delhi',
    gstNumber: '07TUVWX3456Y4Z8',
    status: 'active',
  },
  {
    id: 5,
    dealerCode: 'DLR005',
    dealerName: 'Royal Metals Ltd',
    ownerName: 'Vikram Singh',
    phone: '9876543214',
    address: 'Building 3, Metal Exchange, Kolkata',
    city: 'Kolkata',
    gstNumber: '19ABCDE7890F5G9',
    status: 'active',
  },
];

// Mock categories
export const MOCK_CATEGORIES = [
  { value: 'gold', label: 'Gold', type: 'single' },
  { value: 'silver', label: 'Silver', type: 'single' },
  { value: 'platinum', label: 'Platinum', type: 'single' },
  { value: 'gemstone', label: 'Gemstone', type: 'single' },
  { value: 'gold+platinum', label: 'Gold + Platinum', type: 'multiple' },
  { value: 'gold+silver', label: 'Gold + Silver', type: 'multiple' },
  { value: 'gold+diamond', label: 'Gold + Diamond', type: 'multiple' },
  { value: 'platinum+diamond', label: 'Platinum + Diamond', type: 'multiple' },
];

// Mock payment modes
export const MOCK_PAYMENT_MODES = [
  { value: 'cash', label: 'CASH', icon: 'solar:wallet-money-bold' },
  { value: 'bank', label: 'BANK TRANSFER', icon: 'solar:card-bold' },
  { value: 'upi', label: 'UPI', icon: 'solar:smartphone-bold' },
  { value: 'hdfc', label: 'HDFC', icon: 'solar:card-2-bold' },
  { value: 'cheque', label: 'CHEQUE', icon: 'solar:document-text-bold' },
  { value: 'credit', label: 'CREDIT', icon: 'solar:credit-card-bold' },
];

// Mock products for different categories
export const MOCK_PRODUCTS = {
  gold: [
    { id: 1, name: 'Gold Ring 22K', code: 'GR001', purity: '22K', weight: 5.5 },
    { id: 2, name: 'Gold Chain 18K', code: 'GC001', purity: '18K', weight: 12.3 },
    { id: 3, name: 'Gold Earrings 22K', code: 'GE001', purity: '22K', weight: 8.7 },
    { id: 4, name: 'Gold Bracelet 18K', code: 'GB001', purity: '18K', weight: 15.2 },
    { id: 5, name: 'Gold Pendant 22K', code: 'GP001', purity: '22K', weight: 6.8 },
  ],
  silver: [
    { id: 6, name: 'Silver Ring 925', code: 'SR001', purity: '925', weight: 8.5 },
    { id: 7, name: 'Silver Chain Pure', code: 'SC001', purity: 'Pure', weight: 25.3 },
    { id: 8, name: 'Silver Earrings 925', code: 'SE001', purity: '925', weight: 12.7 },
  ],
  platinum: [
    { id: 9, name: 'Platinum Ring 950', code: 'PR001', purity: '950', weight: 4.2 },
    { id: 10, name: 'Platinum Chain 900', code: 'PC001', purity: '900', weight: 18.5 },
    { id: 11, name: 'Platinum Earrings 950', code: 'PE001', purity: '950', weight: 6.8 },
  ],
  gemstone: [
    { id: 12, name: 'Ruby Gemstone', code: 'RG001', carat: 2.5, clarity: 'VS1' },
    { id: 13, name: 'Emerald Gemstone', code: 'EG001', carat: 1.8, clarity: 'VVS2' },
    { id: 14, name: 'Sapphire Gemstone', code: 'SG001', carat: 3.2, clarity: 'VS2' },
  ],
};

// Mock bill types
export const MOCK_BILL_TYPES = [
  { value: 'pure_wt', label: 'Pure Wt / Rs' },
  { value: 'gross_wt', label: 'Gross Wt / Rs' },
  { value: 'per_piece', label: 'Per Piece' },
  { value: 'per_gram', label: 'Per Gram' },
];

// Mock purchase records
export const MOCK_PURCHASES = Array.from({ length: 25 }, (_, index) => {
  const dealer = MOCK_DEALERS[index % MOCK_DEALERS.length];
  const category = MOCK_CATEGORIES[index % MOCK_CATEGORIES.length];
  const paymentMode = MOCK_PAYMENT_MODES[index % MOCK_PAYMENT_MODES.length];

  return {
    id: index + 1,
    billNo: `BILL${String(index + 1).padStart(4, '0')}`,
    receiptNo: `RCP${String(index + 1).padStart(4, '0')}`,
    billDate: _mock.time(index),
    dealer: {
      id: dealer.id,
      dealerCode: dealer.dealerCode,
      dealerName: dealer.dealerName,
      ownerName: dealer.ownerName,
      phone: dealer.phone,
    },
    category: category.value,
    categoryLabel: category.label,
    products: [
      {
        id: 1,
        srNo: 1,
        description: index % 2 === 0 ? 'Gold Ring 22K' : 'Silver Chain Pure',
        subType: index % 2 === 0 ? 'Ring' : 'Chain',
        billType: 'pure_wt',
        pcs: Math.floor(Math.random() * 5) + 1,
        grossWeight: (Math.random() * 20 + 5).toFixed(2),
        lessWeight: (Math.random() * 2).toFixed(2),
        netWeight: (Math.random() * 18 + 3).toFixed(2),
        touch: index % 2 === 0 ? '22K' : '925',
        wastagePercent: (Math.random() * 10 + 5).toFixed(1),
        totalPureWeight: (Math.random() * 15 + 2).toFixed(2),
        mrpRate: (Math.random() * 5000 + 3000).toFixed(0),
        labourRate: (Math.random() * 500 + 200).toFixed(0),
        otherCharges: (Math.random() * 100).toFixed(0),
        taxable: true,
        tax: 'GST 3%',
        amount: (Math.random() * 50000 + 10000).toFixed(0),
      },
    ],
    totals: {
      totalGoldPcs: index % 2 === 0 ? Math.floor(Math.random() * 5) + 1 : 0,
      totalGrossWeight: (Math.random() * 20 + 5).toFixed(2),
      totalLessWeight: (Math.random() * 2).toFixed(2),
      totalNetWeight: (Math.random() * 18 + 3).toFixed(2),
      totalPureWeight: (Math.random() * 15 + 2).toFixed(2),
      totalOtherCharges: (Math.random() * 100).toFixed(0),
      totalTaxable: (Math.random() * 40000 + 8000).toFixed(0),
      totalGoldAmount: (Math.random() * 45000 + 8000).toFixed(0),
      totalPlatNetWeight: category.value.includes('platinum') ? (Math.random() * 10 + 2).toFixed(2) : '0.00',
      totalPlatAmount: category.value.includes('platinum') ? (Math.random() * 25000 + 5000).toFixed(0) : '0.00',
      tcs: '0.10%',
    },
    payment: {
      paymentMode: paymentMode.value,
      paymentModeLabel: paymentMode.label,
      totalAmount: (Math.random() * 50000 + 10000).toFixed(0),
      pendingAmount: (Math.random() * 5000).toFixed(0),
      notes: index % 3 === 0 ? 'Rush order - priority delivery' : '',
    },
    roundOffAmount: (Math.random() * 10 - 5).toFixed(0),
    grandTotal: (Math.random() * 50000 + 10000).toFixed(0),
    status: index % 10 === 0 ? 'pending' : 'completed',
    createdAt: _mock.time(index),
    updatedAt: _mock.time(index),
  };
});

// Mock platinum carat options
export const MOCK_PLATINUM_CARATS = [
  { value: '900', label: '900 Platinum' },
  { value: '950', label: '950 Platinum' },
  { value: 'pure', label: 'Pure Platinum' },
];

// Mock tax options
export const MOCK_TAX_OPTIONS = [
  { value: 'gst_3', label: 'GST 3%' },
  { value: 'gst_5', label: 'GST 5%' },
  { value: 'gst_12', label: 'GST 12%' },
  { value: 'gst_18', label: 'GST 18%' },
  { value: 'cgst_sgst', label: 'CGST + SGST' },
  { value: 'igst', label: 'IGST' },
  { value: 'no_tax', label: 'No Tax' },
];
