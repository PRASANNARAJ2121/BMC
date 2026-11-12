import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  isSeller: z.boolean().optional().default(false),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const AcquisitionWizardStep1Schema = z.object({
  sellerName: z.string().min(2, "Name required"),
  sellerPhone: z.string().min(10, "Valid phone required"),
  sellerEmail: z.string().email("Valid email required"),
  preferredContact: z.enum(["PHONE", "EMAIL", "WHATSAPP"]).default("PHONE"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
});

export const AcquisitionVehicleDetailsSchema = z.object({
  make: z.string().min(1, "Vehicle make is required"),
  model: z.string().min(1, "Vehicle model is required"),
  variant: z.string().optional().default(""),
  year: z.number().int().min(1990).max(2027),
  registrationNumber: z.string().min(5, "Registration number is required"),
  vin: z.string().optional().default(""),
  chassisNumber: z.string().optional().default(""),
  engineNumber: z.string().optional().default(""),
  fuelType: z.enum(["Petrol", "Diesel", "CNG", "Electric", "Hybrid"]),
  transmission: z.enum(["Manual", "Automatic"]),
  odometerKm: z.number().int().nonnegative(),
  ownershipCount: z.number().int().min(1).max(10).default(1),
  registeredOwnerName: z.string().min(2, "Registered owner name required"),
  isCommercial: z.boolean().default(false),
  loanHypothecation: z.boolean().default(false),
  outstandingFinance: z.number().nonnegative().optional().default(0),
  financierName: z.string().optional().default(""),
  knownAccidents: z.boolean().default(false),
  knownDamages: z.string().optional().default(""),
  floodFireDamage: z.boolean().default(false),
  sellerAskingPrice: z.number().positive("Asking price must be greater than 0"),
  exteriorColor: z.string().optional().default(""),
  locationCity: z.string().min(2, "Location city required"),
  locationState: z.string().min(2, "Location state required"),
  preferredInspectionDate: z.string().optional(),
});

export const ServiceAppointmentSchema = z.object({
  customerName: z.string().min(2, "Customer name required"),
  customerPhone: z.string().min(10, "Phone required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  vehicleMake: z.string().min(1, "Make required"),
  vehicleModel: z.string().min(1, "Model required"),
  vehicleRegNumber: z.string().min(4, "Registration number required"),
  serviceCategory: z.enum([
    "GARAGE_GENERAL",
    "ENGINE_TRANSMISSION",
    "ELECTRICALS",
    "ELECTRONICS",
    "AIR_CONDITIONING",
    "INSPECTION",
    "FLEET_MAINTENANCE",
  ]),
  preferredDate: z.string().refine((d) => new Date(d) >= new Date(new Date().setHours(0,0,0,0)), {
    message: "Preferred date cannot be in the past",
  }),
  preferredTimeSlot: z.string().default("09:00 - 11:00"),
  issueDescription: z.string().optional().default(""),
});

export const BuyerEnquirySchema = z.object({
  listingId: z.string().min(1, "Listing ID required"),
  vehicleStockNumber: z.string().min(1, "Stock number required"),
  customerName: z.string().min(2, "Name required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().min(10, "Phone required"),
  message: z.string().optional().default(""),
});

export const TestDriveRequestSchema = z.object({
  listingId: z.string().min(1, "Listing ID required"),
  customerName: z.string().min(2, "Name required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().min(10, "Phone required"),
  preferredDate: z.string().refine((d) => new Date(d) >= new Date(new Date().setHours(0,0,0,0)), {
    message: "Test drive date cannot be in the past",
  }),
  preferredTimeSlot: z.string().default("Morning"),
});

export const VehicleReservationSchema = z.object({
  listingId: z.string().min(1, "Listing ID required"),
  idempotencyKey: z.string().min(8, "Idempotency key required"),
  bookingAmount: z.number().positive().default(10000),
});

