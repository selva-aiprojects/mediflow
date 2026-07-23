// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0); return d; };
const daysFromNow = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(0, 0, 0, 0); return d; };
const monthsFromNow = (n: number) => { const d = new Date(); d.setMonth(d.getMonth() + n); d.setHours(0, 0, 0, 0); return d; };

const catNames = ['Antibiotics', 'Pain Relief', 'Vitamins & Supplements', 'Cold & Flu', 'Gastrointestinal', 'Cardiovascular', 'Diabetes', 'Skin Care', 'Respiratory', 'Antiallergic', 'Pediatric', 'Ayurvedic'];

const mfrData = [
  'Cipla Ltd', 'Sun Pharmaceutical Industries Ltd', "Dr. Reddy's Laboratories Ltd",
  'Alembic Pharmaceuticals Ltd', 'Zydus Lifesciences Ltd', 'Lupin Ltd',
  'GlaxoSmithKline Pharmaceuticals Ltd', 'Abbott India Ltd', 'Micro Labs Ltd', 'Alkem Laboratories Ltd',
];

interface MedSeed { brandName: string; genericName: string; strength: string; form: string; schedule: string; hsnCode: string; gstPercent: number; categoryName: string; manufacturerName: string; barcode: string; unitType: string; unitsPerPackage?: number; isPrescriptionRequired?: boolean; minStockLevel: number; maxStockLevel: number; reorderLevel: number; }
const medData: MedSeed[] = [
  { brandName: 'Crocin Advance', genericName: 'Paracetamol', strength: '500mg', form: 'Tablet', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Pain Relief', manufacturerName: 'GlaxoSmithKline Pharmaceuticals Ltd', barcode: '8901234567001', unitType: 'strip', unitsPerPackage: 15, minStockLevel: 50, maxStockLevel: 500, reorderLevel: 100 },
  { brandName: 'Dolo 650', genericName: 'Paracetamol', strength: '650mg', form: 'Tablet', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Pain Relief', manufacturerName: 'Micro Labs Ltd', barcode: '8901234567002', unitType: 'strip', unitsPerPackage: 15, minStockLevel: 50, maxStockLevel: 500, reorderLevel: 100 },
  { brandName: 'Azithral 500', genericName: 'Azithromycin', strength: '500mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Antibiotics', manufacturerName: 'Alembic Pharmaceuticals Ltd', barcode: '8901234567003', unitType: 'strip', unitsPerPackage: 5, isPrescriptionRequired: true, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 50 },
  { brandName: 'Augmentin 625', genericName: 'Amoxicillin + Clavulanic Acid', strength: '625mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Antibiotics', manufacturerName: 'GlaxoSmithKline Pharmaceuticals Ltd', barcode: '8901234567004', unitType: 'strip', unitsPerPackage: 10, isPrescriptionRequired: true, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 50 },
  { brandName: 'Pan 40', genericName: 'Pantoprazole', strength: '40mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Gastrointestinal', manufacturerName: 'Alkem Laboratories Ltd', barcode: '8901234567005', unitType: 'strip', unitsPerPackage: 15, isPrescriptionRequired: true, minStockLevel: 40, maxStockLevel: 300, reorderLevel: 80 },
  { brandName: 'Digene Gel', genericName: 'Simethicone + Mag Hydroxide', strength: '170ml', form: 'Syrup', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Gastrointestinal', manufacturerName: 'Abbott India Ltd', barcode: '8901234567006', unitType: 'bottle', minStockLevel: 20, maxStockLevel: 100, reorderLevel: 40 },
  { brandName: 'Aten 50', genericName: 'Atenolol', strength: '50mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Cardiovascular', manufacturerName: 'Cipla Ltd', barcode: '8901234567007', unitType: 'strip', unitsPerPackage: 30, isPrescriptionRequired: true, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
  { brandName: 'Amlodac 5', genericName: 'Amlodipine', strength: '5mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Cardiovascular', manufacturerName: 'Cipla Ltd', barcode: '8901234567008', unitType: 'strip', unitsPerPackage: 30, isPrescriptionRequired: true, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
  { brandName: 'Glycomet GP 1', genericName: 'Metformin + Glimepiride', strength: '500mg+1mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Diabetes', manufacturerName: 'USV Ltd', barcode: '8901234567009', unitType: 'strip', unitsPerPackage: 15, isPrescriptionRequired: true, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
  { brandName: 'Glimestar 2', genericName: 'Glimepiride', strength: '2mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Diabetes', manufacturerName: 'Alkem Laboratories Ltd', barcode: '8901234567010', unitType: 'strip', unitsPerPackage: 10, isPrescriptionRequired: true, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
  { brandName: 'Cetirizine 10', genericName: 'Cetirizine', strength: '10mg', form: 'Tablet', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Antiallergic', manufacturerName: 'Cipla Ltd', barcode: '8901234567011', unitType: 'strip', unitsPerPackage: 10, minStockLevel: 50, maxStockLevel: 400, reorderLevel: 100 },
  { brandName: 'Allegra 120', genericName: 'Fexofenadine', strength: '120mg', form: 'Tablet', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Antiallergic', manufacturerName: 'Sanofi India Ltd', barcode: '8901234567012', unitType: 'strip', unitsPerPackage: 10, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
  { brandName: 'Becosules', genericName: 'Vitamin B Complex + C', strength: 'Capsule', form: 'Capsule', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Vitamins & Supplements', manufacturerName: 'Pfizer Ltd', barcode: '8901234567013', unitType: 'strip', unitsPerPackage: 30, minStockLevel: 40, maxStockLevel: 300, reorderLevel: 80 },
  { brandName: 'Neurobion Forte', genericName: 'Mecobalamin + Pyridoxine', strength: 'Tablet', form: 'Tablet', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Vitamins & Supplements', manufacturerName: 'Merck Ltd', barcode: '8901234567014', unitType: 'strip', unitsPerPackage: 20, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
  { brandName: 'Shelcal 500', genericName: 'Calcium Carbonate + Vitamin D3', strength: '500mg', form: 'Tablet', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Vitamins & Supplements', manufacturerName: 'Abbott India Ltd', barcode: '8901234567015', unitType: 'strip', unitsPerPackage: 30, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
  { brandName: 'Vicks Action 500', genericName: 'Paracetamol + Phenylephrine', strength: '500mg', form: 'Tablet', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Cold & Flu', manufacturerName: 'Procter & Gamble Health Ltd', barcode: '8901234567016', unitType: 'strip', unitsPerPackage: 12, minStockLevel: 40, maxStockLevel: 300, reorderLevel: 80 },
  { brandName: 'Montair LC', genericName: 'Montelukast + Levocetirizine', strength: '10mg+5mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Respiratory', manufacturerName: 'Cipla Ltd', barcode: '8901234567017', unitType: 'strip', unitsPerPackage: 10, isPrescriptionRequired: true, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
  { brandName: 'Deriphyllin Retard', genericName: 'Theophylline', strength: '150mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Respiratory', manufacturerName: 'Dr. Reddy\'s Laboratories Ltd', barcode: '8901234567018', unitType: 'strip', unitsPerPackage: 30, isPrescriptionRequired: true, minStockLevel: 20, maxStockLevel: 150, reorderLevel: 40 },
  { brandName: 'Betnovate-C', genericName: 'Betamethasone + Clotrimazole', strength: 'Cream', form: 'Cream', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Skin Care', manufacturerName: 'GlaxoSmithKline Pharmaceuticals Ltd', barcode: '8901234567019', unitType: 'tube', minStockLevel: 20, maxStockLevel: 100, reorderLevel: 40 },
  { brandName: 'Candid Cream', genericName: 'Clotrimazole', strength: '1%', form: 'Cream', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Skin Care', manufacturerName: 'Glenmark Pharmaceuticals Ltd', barcode: '8901234567020', unitType: 'tube', minStockLevel: 20, maxStockLevel: 100, reorderLevel: 40 },
  { brandName: 'Combiflam', genericName: 'Ibuprofen + Paracetamol', strength: '400mg+325mg', form: 'Tablet', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Pain Relief', manufacturerName: 'Sanofi India Ltd', barcode: '8901234567021', unitType: 'strip', unitsPerPackage: 15, minStockLevel: 50, maxStockLevel: 500, reorderLevel: 100 },
  { brandName: 'Zifi 200', genericName: 'Cefixime', strength: '200mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Antibiotics', manufacturerName: 'FDC Ltd', barcode: '8901234567022', unitType: 'strip', unitsPerPackage: 10, isPrescriptionRequired: true, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
  { brandName: 'Ondem 4', genericName: 'Ondansetron', strength: '4mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Gastrointestinal', manufacturerName: 'Alkem Laboratories Ltd', barcode: '8901234567023', unitType: 'strip', unitsPerPackage: 10, isPrescriptionRequired: true, minStockLevel: 20, maxStockLevel: 150, reorderLevel: 40 },
  { brandName: 'D-Rise 60K', genericName: 'Vitamin D3', strength: '60000 IU', form: 'Capsule', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Vitamins & Supplements', manufacturerName: 'Alkem Laboratories Ltd', barcode: '8901234567024', unitType: 'strip', unitsPerPackage: 4, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
  { brandName: 'Sporidex AF', genericName: 'Cephalexin', strength: '500mg', form: 'Capsule', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Antibiotics', manufacturerName: 'Cipla Ltd', barcode: '8901234567025', unitType: 'strip', unitsPerPackage: 10, isPrescriptionRequired: true, minStockLevel: 20, maxStockLevel: 150, reorderLevel: 40 },
  { brandName: 'Meftal Spas', genericName: 'Mefenamic Acid + Dicyclomine', strength: '250mg+20mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Pain Relief', manufacturerName: 'Cipla Ltd', barcode: '8901234567026', unitType: 'strip', unitsPerPackage: 10, isPrescriptionRequired: true, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
  { brandName: 'Liv 52', genericName: 'Hepatoprotective Herbal', strength: 'Tablet', form: 'Tablet', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Ayurvedic', manufacturerName: 'Himalaya Wellness Ltd', barcode: '8901234567027', unitType: 'strip', unitsPerPackage: 20, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
  { brandName: 'Sinarest', genericName: 'Paracetamol + Phenylephrine + CP', strength: 'Tablet', form: 'Tablet', schedule: 'OTC', hsnCode: '30049090', gstPercent: 12, categoryName: 'Cold & Flu', manufacturerName: 'Micro Labs Ltd', barcode: '8901234567028', unitType: 'strip', unitsPerPackage: 10, minStockLevel: 40, maxStockLevel: 300, reorderLevel: 80 },
  { brandName: 'Telekast-F', genericName: 'Montelukast + Fexofenadine', strength: '10mg+120mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Respiratory', manufacturerName: 'Cipla Ltd', barcode: '8901234567029', unitType: 'strip', unitsPerPackage: 10, isPrescriptionRequired: true, minStockLevel: 20, maxStockLevel: 150, reorderLevel: 40 },
  { brandName: 'Ecospirin 75', genericName: 'Aspirin', strength: '75mg', form: 'Tablet', schedule: 'H', hsnCode: '30049090', gstPercent: 12, categoryName: 'Cardiovascular', manufacturerName: 'Cipla Ltd', barcode: '8901234567030', unitType: 'strip', unitsPerPackage: 30, isPrescriptionRequired: true, minStockLevel: 30, maxStockLevel: 200, reorderLevel: 60 },
];

const custData = [
  { firstName: 'John', lastName: 'Doe', mobile: '7777777777', gender: 'Male', dateOfBirth: new Date('1985-06-15'), customerCode: 'CUST001' },
  { firstName: 'Anita', lastName: 'Desai', mobile: '7777777778', gender: 'Female', dateOfBirth: new Date('1990-03-22'), customerCode: 'CUST002' },
  { firstName: 'Mohammed', lastName: 'Khan', mobile: '7777777779', gender: 'Male', dateOfBirth: new Date('1978-11-10'), customerCode: 'CUST003' },
  { firstName: 'Sunita', lastName: 'Rao', mobile: '7777777780', gender: 'Female', dateOfBirth: new Date('1995-08-05'), customerCode: 'CUST004' },
  { firstName: 'Vikram', lastName: 'Mehta', mobile: '7777777781', gender: 'Male', dateOfBirth: new Date('1965-12-01'), customerCode: 'CUST005', isCreditAllowed: true, creditLimit: 5000 },
  { firstName: 'Pooja', lastName: 'Singh', mobile: '7777777782', gender: 'Female', dateOfBirth: new Date('1988-04-18'), customerCode: 'CUST006' },
  { firstName: 'Arjun', lastName: 'Nair', mobile: '7777777783', gender: 'Male', dateOfBirth: new Date('1972-09-27'), customerCode: 'CUST007' },
  { firstName: 'Deepa', lastName: 'Iyer', mobile: '7777777784', gender: 'Female', dateOfBirth: new Date('1983-01-30'), customerCode: 'CUST008' },
  { firstName: 'Rahul', lastName: 'Verma', mobile: '7777777785', gender: 'Male', dateOfBirth: new Date('1992-07-14'), customerCode: 'CUST009' },
  { firstName: 'Kavita', lastName: 'Joshi', mobile: '7777777786', gender: 'Female', dateOfBirth: new Date('1980-05-20'), customerCode: 'CUST010', isCreditAllowed: true, creditLimit: 10000 },
];

const docData = [
  { name: 'Dr. Rajan Mehta', speciality: 'General Physician', clinicHospital: 'City Hospital Mumbai', registrationNo: 'MCI-12345', mobile: '9800000001' },
  { name: 'Dr. Sunita Kulkarni', speciality: 'Pediatrician', clinicHospital: "Children's Wellness Clinic", registrationNo: 'MCI-12346', mobile: '9800000002' },
  { name: 'Dr. Alok Banerjee', speciality: 'Cardiologist', clinicHospital: 'Heart Care Centre', registrationNo: 'MCI-12347', mobile: '9800000003' },
  { name: 'Dr. Meera Krishnamurthy', speciality: 'Dermatologist', clinicHospital: 'Skin & Glow Clinic', registrationNo: 'MCI-12348', mobile: '9800000004' },
  { name: 'Dr. Sanjay Kulkarni', speciality: 'Orthopedic Surgeon', clinicHospital: 'Bone & Joint Hospital', registrationNo: 'MCI-12349', mobile: '9800000005' },
  { name: 'Dr. Priya Agarwal', speciality: 'ENT Specialist', clinicHospital: 'ENT Care Clinic', registrationNo: 'MCI-12350', mobile: '9800000006' },
  { name: 'Dr. Vijay Deshmukh', speciality: 'Diabetologist', clinicHospital: 'Diabetes & Endocrine Centre', registrationNo: 'MCI-12351', mobile: '9800000007' },
];

async function main() {
  console.log('Seeding MediFlow Pharmacy database...\n');
  console.log('Cleaning existing data...');
  await prisma.$executeRaw`TRUNCATE TABLE notification_logs, stock_adjustment_items, stock_adjustments, stock_transfer_items, stock_transfers, barcode_labels, daily_summaries, user_sessions, purchase_suggestions, audit_logs, purchase_payments, customer_return_items, customer_returns, supplier_return_items, supplier_returns, goods_receipt_items, goods_receipt_notes, purchase_invoices, purchase_order_items, purchase_orders, sales_items, payments, sales_bills, prescriptions, batches, medicine_suppliers, medicines, racks, categories, manufacturers, suppliers, doctors, customers, users, stores, tenants CASCADE`;

  const tenant = await prisma.tenant.upsert({ where: { subdomain: 'default' }, update: {},
    create: { name: 'MediFlow Pharmacy', subdomain: 'default', schemaName: 'public', gstin: '27AAACT1234F1Z5', drugLicenseNo: 'MH-2024-001234', phone: '022-23456789', email: 'info@mediflowpharmacy.in', addressLine1: '123 Health Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', isActive: true } });
  const store = await prisma.store.upsert({ where: { code: 'HQ' }, update: {},
    create: { code: 'HQ', name: 'MediFlow Main Branch', addressLine1: '123 Health Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', phone: '022-23456789', email: 'store@mediflowpharmacy.in', gstin: '27AAACT1234F1Z5', drugLicenseNo: 'MH-2024-001234', isActive: true, isHeadOffice: true } });
  console.log('Tenant + Store created');

  const ph = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({ where: { email: 'admin@pharmacyos.com' }, update: {},
    create: { storeId: store.id, employeeCode: 'EMP001', firstName: 'Rajesh', lastName: 'Kumar', email: 'admin@pharmacyos.com', phone: '9999999999', passwordHash: ph, role: 'admin', isActive: true } });
  const pm = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({ where: { email: 'manager@pharmacyos.com' }, update: {},
    create: { storeId: store.id, employeeCode: 'EMP003', firstName: 'Priya', lastName: 'Sharma', email: 'manager@pharmacyos.com', phone: '9999999997', passwordHash: pm, role: 'manager', isActive: true } });
  const pp = await bcrypt.hash('pharmacist123', 10);
  const pharmacist = await prisma.user.upsert({ where: { email: 'pharmacist@pharmacyos.com' }, update: {},
    create: { storeId: store.id, employeeCode: 'EMP004', firstName: 'Amit', lastName: 'Patel', email: 'pharmacist@pharmacyos.com', phone: '9999999996', passwordHash: pp, role: 'pharmacist', isActive: true } });
  const pc = await bcrypt.hash('cashier123', 10);
  const cashier = await prisma.user.upsert({ where: { email: 'cashier@pharmacyos.com' }, update: {},
    create: { storeId: store.id, employeeCode: 'EMP002', firstName: 'Neha', lastName: 'Gupta', email: 'cashier@pharmacyos.com', phone: '9999999998', passwordHash: pc, role: 'cashier', isActive: true } });
  console.log('Users: admin, manager, pharmacist, cashier');

  const cats: Record<string, string> = {};
  for (const name of catNames) { const c = await prisma.category.upsert({ where: { name }, update: {}, create: { name } }); cats[name] = c.id; }
  console.log('Categories:', catNames.length);

  const mfrs: Record<string, string> = {};
  for (const name of mfrData) { const m = await prisma.manufacturer.upsert({ where: { name }, update: {}, create: { name, isActive: true } }); mfrs[name] = m.id; }
  console.log('Manufacturers:', mfrData.length);

  async function ensureSupplier(data: any) {
    return prisma.supplier.upsert({ where: { id: data.id }, update: {}, create: { ...data, isActive: true } })
      .catch(() => prisma.supplier.create({ data: { ...data, isActive: true } }));
  }
  const s1 = await ensureSupplier({ id: 'sup-1', companyName: 'MediSupply Distributors Pvt Ltd', contactPerson: 'Ramesh Agarwal', gstin: '27AABCM1234F1Z5', drugLicenseNo: 'MH-DS-001', addressLine1: '45 Drug Market', city: 'Mumbai', state: 'Maharashtra', pincode: '400003', phone: '022-23450001', email: 'orders@medisupply.in', creditDays: 30, leadTimeDays: 2 });
  const s2 = await ensureSupplier({ id: 'sup-2', companyName: 'Bharat Pharma Exports', contactPerson: 'Suresh Jain', gstin: '24AABCB1234G1Z7', drugLicenseNo: 'GJ-PE-002', addressLine1: '12 Pharma Zone', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001', phone: '079-23450002', email: 'info@bharatpharma.in', creditDays: 45, leadTimeDays: 3 });
  const s3 = await ensureSupplier({ id: 'sup-3', companyName: 'Southern Health Distributors', contactPerson: 'Venkatesh Reddy', gstin: '36AABCS1234H1Z9', drugLicenseNo: 'TS-HD-003', addressLine1: '78 Medical Hub', city: 'Hyderabad', state: 'Telangana', pincode: '500001', phone: '040-23450003', email: 'sales@southernhealth.in', creditDays: 30, leadTimeDays: 4 });
  console.log('Suppliers: 3');

  const customers = [];
  for (const c of custData) { const cust = await prisma.customer.upsert({ where: { mobile: c.mobile }, update: {}, create: { storeId: store.id, ...c, isActive: true } }); customers.push(cust); }
  console.log('Customers:', customers.length);

  const doctors = [];
  for (const d of docData) { const doc = await prisma.doctor.create({ data: { ...d, isActive: true } }); doctors.push(doc); }
  console.log('Doctors:', doctors.length);

  const medicines = [];
  for (const m of medData) {
    const med = await prisma.medicine.create({ data: { brandName: m.brandName, genericName: m.genericName, strength: m.strength, form: m.form, schedule: m.schedule, hsnCode: m.hsnCode, gstPercent: m.gstPercent, categoryId: cats[m.categoryName], manufacturerId: mfrs[m.manufacturerName] || mfrs['Cipla Ltd'], barcode: m.barcode, unitType: m.unitType, unitsPerPackage: m.unitsPerPackage, isPrescriptionRequired: m.isPrescriptionRequired || false, isBatchEnabled: true, isExpiryEnabled: true, minStockLevel: m.minStockLevel, maxStockLevel: m.maxStockLevel, reorderLevel: m.reorderLevel, isActive: true } });
    medicines.push(med);
  }
  console.log('Medicines:', medicines.length);

  const allBatches: any[] = [];
  for (let i = 0; i < medicines.length; i++) {
    const med = medicines[i];
    const mrp = Math.round((15 + Math.random() * 385) * 100) / 100;
    const purchasePrice = Math.round(mrp * (0.55 + Math.random() * 0.2) * 100) / 100;
    const gstPct = Number(med.gstPercent);
    const batchNo = `B${String(i + 1).padStart(3, '0')}${String.fromCharCode(65 + (i % 26))}`;
    const expiryDate = monthsFromNow(8 + Math.floor(Math.random() * 24));
    const qty = 50 + Math.floor(Math.random() * 150);
    const supplierRef = i % 3 === 0 ? s1 : i % 3 === 1 ? s2 : s3;
    const batch = await prisma.batch.create({ data: { medicineId: med.id, storeId: store.id, supplierId: supplierRef.id, batchNo, mrp, purchasePrice, sellingPrice: mrp, gstPercent: gstPct, quantity: qty, reservedQuantity: 0, initialQuantity: qty, expiryDate, isActive: true } });
    allBatches.push(batch);
    if (i % 3 === 0) {
      const batchNo2 = `${batchNo}R`;
      const mrp2 = Math.round(mrp * (0.95 + Math.random() * 0.1) * 100) / 100;
      const qty2 = 30 + Math.floor(Math.random() * 70);
      const batch2 = await prisma.batch.create({ data: { medicineId: med.id, storeId: store.id, supplierId: s1.id, batchNo: batchNo2, mrp: mrp2, purchasePrice: Math.round(mrp2 * 0.6 * 100) / 100, sellingPrice: mrp2, gstPercent: gstPct, quantity: qty2, reservedQuantity: 0, initialQuantity: qty2, expiryDate: monthsFromNow(12 + Math.floor(Math.random() * 12)), isActive: true } });
      allBatches.push(batch2);
    }
  }
  console.log('Batches:', allBatches.length);

  const poSpecs = [
    { supplier: s1, medIndices: [0, 1, 4, 10, 12, 15, 20], daysAgo: 15, status: 'received' },
    { supplier: s2, medIndices: [2, 3, 7, 8, 16, 21, 25], daysAgo: 10, status: 'received' },
    { supplier: s3, medIndices: [5, 6, 9, 11, 13, 14, 22, 26, 28], daysAgo: 5, status: 'submitted' },
    { supplier: s1, medIndices: [17, 18, 19, 23, 24, 27, 29], daysAgo: 1, status: 'draft' },
  ];
  const pos = [];
  let poSeq = 1;
  for (const po of poSpecs) {
    const poDate = daysAgo(po.daysAgo);
    const items = po.medIndices.map((mi, idx) => {
      const med = medicines[mi]; const batch = allBatches.find((b) => b.medicineId === med.id);
      const qty = 50 + Math.floor(Math.random() * 100);
      const unitPrice = batch ? Number(batch.purchasePrice) : 50;
      const gst = Number(med.gstPercent);
      const gstAmt = Math.round(qty * unitPrice * gst / 100 * 100) / 100;
      return { medicineId: med.id, itemNo: idx + 1, quantityOrdered: qty, unitPrice, mrp: batch ? Number(batch.mrp) : 80, gstPercent: gst, gstAmount: gstAmt, totalAmount: Math.round(qty * unitPrice * (1 + gst / 100) * 100) / 100 };
    });
    const totalAmount = items.reduce((s, it) => s + Number(it.totalAmount), 0);
    const record = await prisma.purchaseOrder.create({ data: { storeId: store.id, supplierId: po.supplier.id, poNo: `PO-${poDate.getFullYear()}${String(poDate.getMonth() + 1).padStart(2, '0')}-${String(poSeq++).padStart(3, '0')}`, poDate, status: po.status, subtotal: totalAmount, taxAmount: items.reduce((s, it) => s + Number(it.gstAmount), 0), totalAmount, createdBy: manager.id } });
    for (const item of items) { await prisma.purchaseOrderItem.create({ data: { poId: record.id, ...item } }); }
    pos.push(record);
  }
  console.log('Purchase Orders:', pos.length);

  let grnSeq = 1;
  for (let i = 0; i < 2; i++) {
    const po = pos[i]; const poDate = new Date(po.poDate);
    const grnNo = `GRN-${poDate.getFullYear()}${String(poDate.getMonth() + 1).padStart(2, '0')}-${String(grnSeq++).padStart(3, '0')}`;
    const poItems = await prisma.purchaseOrderItem.findMany({ where: { poId: po.id } });
    const grnItems = poItems.map((pi, idx) => ({
      medicineId: pi.medicineId, batchNo: allBatches.find((b) => b.medicineId === pi.medicineId)?.batchNo || `BATCH-${idx}`,
      expiryDate: allBatches.find((b) => b.medicineId === pi.medicineId)?.expiryDate || monthsFromNow(12),
      mrp: pi.mrp || 100, unitPrice: pi.unitPrice, quantity: pi.quantityOrdered,
      gstPercent: pi.gstPercent, gstAmount: pi.gstAmount, totalAmount: pi.totalAmount,
    }));
    const grn = await prisma.goodsReceiptNote.create({ data: { storeId: store.id, poId: po.id, grnNo, grnDate: poDate, invoiceNo: `INV-${po.poNo.replace('PO-', '')}`, invoiceDate: poDate, supplierId: po.supplierId, status: 'verified', totalQuantity: grnItems.reduce((s, it) => s + Number(it.quantity), 0), totalAmount: grnItems.reduce((s, it) => s + Number(it.totalAmount), 0), createdBy: manager.id } });
    for (const gi of grnItems) { await prisma.goodsReceiptItem.create({ data: { grnId: grn.id, ...gi } }); }
  }
  console.log('Goods Receipt Notes: 2');

  for (let i = 0; i < 2; i++) {
    const d = daysAgo(15 - i * 5);
    await prisma.purchaseInvoice.create({ data: { storeId: store.id, supplierId: i === 0 ? s1.id : s2.id, invoiceNo: `PUR-INV-${String(i + 1).padStart(3, '0')}`, invoiceDate: d, dueDate: daysFromNow(i === 0 ? 30 : 45), subtotal: 12000 + Math.random() * 30000, totalAmount: 14000 + Math.random() * 35000, paidAmount: i === 0 ? 15000 : 0, balanceAmount: i === 0 ? 0 : 25000, paymentStatus: i === 0 ? 'paid' : 'unpaid', status: 'verified', createdBy: admin.id } });
  }
  console.log('Purchase Invoices: 2');

  const salesSpecs = [[{ mi: 0, q: 2 }, { mi: 1, q: 1 }, { mi: 10, q: 1 }], [{ mi: 5, q: 1 }, { mi: 12, q: 1 }, { mi: 20, q: 2 }], [{ mi: 15, q: 1 }, { mi: 2, q: 1 }, { mi: 8, q: 1 }], [{ mi: 11, q: 1 }, { mi: 13, q: 1 }, { mi: 4, q: 1 }], [{ mi: 3, q: 1 }, { mi: 6, q: 1 }, { mi: 21, q: 1 }]];
  const payModes = ['cash', 'upi', 'card', 'credit', 'cash'];
  for (let bi = 0; bi < 5; bi++) {
    const bd = daysAgo(bi); const cust = customers[bi % customers.length];
    const items = [];
    for (const spec of salesSpecs[bi]) {
      const med = medicines[spec.mi]; const batch = allBatches.find((b) => b.medicineId === med.id);
      if (!batch) continue;
      const up = Number(batch.sellingPrice); const gst = Number(batch.gstPercent); const q = spec.q;
      const taxable = Math.round(up * q * 100) / 100; const gstAmt = Math.round(taxable * gst / 100 * 100) / 100;
      items.push({ medicineId: med.id, batchId: batch.id, batchNo: batch.batchNo, itemNo: items.length + 1, medicineName: med.brandName, genericName: med.genericName, strength: med.strength, form: med.form, hsnCode: med.hsnCode, quantity: q, unitType: med.unitType, mrp: Number(batch.mrp), unitPrice: up, gstPercent: gst, gstAmount: gstAmt, cgstAmount: Math.round(gstAmt / 2 * 100) / 100, sgstAmount: Math.round(gstAmt / 2 * 100) / 100, taxableAmount: taxable, totalAmount: Math.round(taxable + gstAmt), expiryDate: batch.expiryDate });
    }
    const sub = items.reduce((s, it) => s + Number(it.taxableAmount), 0);
    const gst = items.reduce((s, it) => s + Number(it.gstAmount), 0);
    const total = Math.round(sub + gst);
    const billNoStr = `PH-${bd.getFullYear()}${String(bd.getMonth() + 1).padStart(2, '0')}${String(bd.getDate()).padStart(2, '0')}-${String(bi + 1).padStart(4, '0')}`;
    const pm = payModes[bi];
    const bill = await prisma.salesBill.create({ data: { storeId: store.id, customerId: cust.id, billNo: billNoStr, billDate: bd, billTime: `${8 + bi}:${String(bi * 12).padStart(2, '0')}:00`, subtotal: sub, taxableAmount: sub, gstAmount: gst, cgstAmount: Math.round(gst / 2 * 100) / 100, sgstAmount: Math.round(gst / 2 * 100) / 100, totalAmount: total, paidAmount: pm === 'credit' ? 0 : total, balanceAmount: pm === 'credit' ? total : 0, paymentMode: pm, paymentStatus: pm === 'credit' ? 'pending' : 'paid', isCreditSale: pm === 'credit', createdBy: cashier.id } });
    for (const item of items) { await prisma.salesItem.create({ data: { billId: bill.id, ...item } }); }
  }
  console.log('Sales Bills: 5');

  const firstBill = await prisma.salesBill.findFirst({ where: {}, orderBy: { billDate: 'desc' } });
  if (firstBill) {
    const fi = await prisma.salesItem.findFirst({ where: { billId: firstBill.id } });
    if (fi) {
      const ret = await prisma.customerReturn.create({ data: { storeId: store.id, billId: firstBill.id, returnNo: 'RET-C-001', returnDate: daysAgo(1), reason: 'Side effects reported', status: 'approved', refundAmount: Number(fi.totalAmount), refundMode: 'cash', createdBy: pharmacist.id } });
      await prisma.customerReturnItem.create({ data: { returnId: ret.id, salesItemId: fi.id, medicineId: fi.medicineId, batchId: fi.batchId, quantity: 1, unitPrice: Number(fi.unitPrice), totalAmount: Number(fi.totalAmount), reason: 'Adverse reaction', condition: 'good' } });
    }
  }
  console.log('Customer Returns: 1');

  await prisma.supplierReturn.create({ data: { storeId: store.id, supplierId: s2.id, returnNo: 'RET-S-001', returnDate: daysAgo(2), reason: 'Damaged in transit', status: 'approved', creditAmount: 2500, notes: 'Batch received damaged', createdBy: manager.id } });
  console.log('Supplier Returns: 1');

  const notifData = [
    { type: 'low_stock', title: 'Low Stock Alert', message: 'Deriphyllin Retard 150mg is running low (18 units left)' },
    { type: 'expiry', title: 'Expiry Warning', message: 'Batch B015A of Crocin Advance expires in 45 days' },
    { type: 'low_stock', title: 'Reorder Needed', message: 'Montair LC 10mg+5mg below reorder level (28 units left)' },
    { type: 'purchase', title: 'PO Pending Approval', message: 'PO-202607-004 from MediSupply is awaiting review' },
    { type: 'credit', title: 'Credit Payment Due', message: 'Vikram Mehta (CUST005) has pending credit balance of Rs. 2,350' },
  ];
  for (const n of notifData) { await prisma.notificationLog.create({ data: { storeId: store.id, userId: admin.id, ...n, isRead: false } }); }
  console.log('Notifications:', notifData.length);

  console.log('\n========================================');
  console.log('  SEED COMPLETED SUCCESSFULLY');
  console.log('========================================');
  console.log(`  Medicines:    ${medicines.length}`);
  console.log(`  Batches:      ${allBatches.length}`);
  console.log(`  POs:          ${pos.length} (2 received, 1 submitted, 1 draft)`);
  console.log(`  GRNs:         2 (verified)`);
  console.log(`  Sales Bills:  5 (cash, UPI, card, credit)`);
  console.log(`  Returns:      1 customer + 1 supplier`);
  console.log('========================================');
  console.log('\nLogin credentials:');
  console.log('  Admin:      admin@pharmacyos.com / admin123');
  console.log('  Manager:    manager@pharmacyos.com / manager123');
  console.log('  Pharmacist: pharmacist@pharmacyos.com / pharmacist123');
  console.log('  Cashier:    cashier@pharmacyos.com / cashier123');
}

main().catch((e) => { console.error('Seed failed:', e); process.exit(1); }).finally(() => prisma.$disconnect());
