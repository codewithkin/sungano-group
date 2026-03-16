"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  DollarSign,
  Package,
  Plus,
  Route,
  Truck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@sungano-group/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@sungano-group/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sungano-group/ui/components/dropdown-menu";
import { Input } from "@sungano-group/ui/components/input";
import { Label } from "@sungano-group/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sungano-group/ui/components/select";
import { Textarea } from "@sungano-group/ui/components/textarea";
import { trpc } from "@/utils/trpc";

type DialogType = "driver" | "truck" | "trailer" | "customer" | "cost" | "trip" | null;

type DialogProps = {
  open: boolean;
  onClose: () => void;
};

function CreateDriverDialog({ open, onClose }: DialogProps) {
  const queryClient = useQueryClient();
  const createDriver = useMutation({
    ...trpc.driver.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.driver.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.driver.stats.queryKey() });
      toast.success("Driver added");
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createDriver.mutate({
      userId: (form.get("userId") as string) || "",
      licenseNumber: (form.get("licenseNumber") as string) || "",
      licenseClass: (form.get("licenseClass") as string) || "",
      licenseExpiry: (form.get("licenseExpiry") as string) || "",
      phoneNumber: (form.get("phoneNumber") as string) || "",
      hireDate: (form.get("hireDate") as string) || "",
      medicalExpiryDate: (form.get("medicalExpiryDate") as string) || undefined,
      emergencyContact: (form.get("emergencyContact") as string) || undefined,
      emergencyPhone: (form.get("emergencyPhone") as string) || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Driver</DialogTitle>
          <DialogDescription>Link an existing user to create a driver profile.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" name="userId" placeholder="Existing user ID" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input id="licenseNumber" name="licenseNumber" placeholder="DL-12345" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseClass">License Class</Label>
              <Input id="licenseClass" name="licenseClass" placeholder="C1, EC" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseExpiry">License Expiry</Label>
              <Input id="licenseExpiry" name="licenseExpiry" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input id="hireDate" name="hireDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" placeholder="+27 000 0000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalExpiryDate">Medical Expiry</Label>
              <Input id="medicalExpiryDate" name="medicalExpiryDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" name="emergencyContact" placeholder="Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Phone</Label>
              <Input id="emergencyPhone" name="emergencyPhone" placeholder="Contact number" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDriver.isPending}>
              {createDriver.isPending ? "Saving..." : "Add Driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateTruckDialog({ open, onClose }: DialogProps) {
  const queryClient = useQueryClient();
  const createTruck = useMutation({
    ...trpc.truck.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.truck.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.truck.stats.queryKey() });
      toast.success("Truck added");
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createTruck.mutate({
      unitNumber: (form.get("unitNumber") as string) || "",
      vin: (form.get("vin") as string) || "",
      make: (form.get("make") as string) || "",
      model: (form.get("model") as string) || "",
      year: Number(form.get("year") || 0),
      licensePlate: (form.get("licensePlate") as string) || "",
      fuelType: (form.get("fuelType") as "DIESEL" | "PETROL" | "LNG" | "ELECTRIC") || "DIESEL",
      tankCapacityLitres: Number(form.get("tankCapacityLitres") || 0),
      mileage: Number(form.get("mileage") || 0),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Truck</DialogTitle>
          <DialogDescription>Capture a new truck for the fleet.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unitNumber">Unit Number</Label>
              <Input id="unitNumber" name="unitNumber" placeholder="TRK-006" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input id="vin" name="vin" placeholder="1FUJGLDR..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input id="make" name="make" placeholder="Freightliner" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" placeholder="Cascadia" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" min="1900" max="2030" placeholder="2024" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input id="licensePlate" name="licensePlate" placeholder="GP-TRK-006" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select name="fuelType" defaultValue="DIESEL">
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIESEL">Diesel</SelectItem>
                  <SelectItem value="PETROL">Petrol</SelectItem>
                  <SelectItem value="LNG">LNG</SelectItem>
                  <SelectItem value="ELECTRIC">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tankCapacityLitres">Tank Capacity (L)</Label>
              <Input id="tankCapacityLitres" name="tankCapacityLitres" type="number" min="0" placeholder="400" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Current Mileage (km)</Label>
              <Input id="mileage" name="mileage" type="number" min="0" placeholder="0" defaultValue="0" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTruck.isPending}>
              {createTruck.isPending ? "Saving..." : "Add Truck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateTrailerDialog({ open, onClose }: DialogProps) {
  const queryClient = useQueryClient();
  const createTrailer = useMutation({
    ...trpc.trailer.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.trailer.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.trailer.stats.queryKey() });
      toast.success("Trailer added");
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createTrailer.mutate({
      unitNumber: (form.get("unitNumber") as string) || "",
      type: (form.get("type") as "FLATBED" | "REEFER" | "DRY_VAN" | "TANKER" | "LOWBED" | "CURTAIN_SIDE" | "CONTAINER") || "FLATBED",
      capacityTonnes: Number(form.get("capacityTonnes") || 0),
      licensePlate: (form.get("licensePlate") as string) || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Trailer</DialogTitle>
          <DialogDescription>Register a trailer and its capacity.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unitNumber">Unit Number</Label>
              <Input id="unitNumber" name="unitNumber" placeholder="TRL-012" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="FLATBED">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLATBED">Flatbed</SelectItem>
                  <SelectItem value="REEFER">Reefer</SelectItem>
                  <SelectItem value="DRY_VAN">Dry Van</SelectItem>
                  <SelectItem value="TANKER">Tanker</SelectItem>
                  <SelectItem value="LOWBED">Lowbed</SelectItem>
                  <SelectItem value="CURTAIN_SIDE">Curtain Side</SelectItem>
                  <SelectItem value="CONTAINER">Container</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacityTonnes">Capacity (tonnes)</Label>
              <Input id="capacityTonnes" name="capacityTonnes" type="number" min="0" step="0.1" placeholder="30" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input id="licensePlate" name="licensePlate" placeholder="GP-TRL-012" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTrailer.isPending}>
              {createTrailer.isPending ? "Saving..." : "Add Trailer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateCustomerDialog({ open, onClose }: DialogProps) {
  const queryClient = useQueryClient();
  const createCustomer = useMutation({
    ...trpc.customer.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.customer.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.customer.stats.queryKey() });
      toast.success("Customer added");
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createCustomer.mutate({
      name: (form.get("name") as string) || "",
      email: (form.get("email") as string) || undefined,
      phone: (form.get("phone") as string) || undefined,
      address: (form.get("address") as string) || undefined,
      city: (form.get("city") as string) || undefined,
      province: (form.get("province") as string) || undefined,
      postalCode: (form.get("postalCode") as string) || undefined,
      notes: (form.get("notes") as string) || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>Capture customer contact and address details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="LogiCorp" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="ops@customer.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="+27 000 0000" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="123 Depot Rd" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="Johannesburg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input id="province" name="province" placeholder="Gauteng" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" placeholder="0001" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Important account details" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? "Saving..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateCostDialog({ open, onClose }: DialogProps) {
  const queryClient = useQueryClient();
  const createExpense = useMutation({
    ...trpc.cost.createExpense.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.cost.expenses.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.cost.summary.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.cost.monthlyCosts.queryKey() });
      toast.success("Cost captured");
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const trips = useQuery(trpc.trip.list.queryOptions({ limit: 100 }));
  const tripOptions = trips.data?.items ?? [];

  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createExpense.mutate({
      category: (form.get("category") as "FUEL" | "TOLLS" | "MAINTENANCE" | "ACCOMMODATION" | "FINES" | "PERMITS" | "OTHER") || "OTHER",
      description: (form.get("description") as string) || "",
      amount: Number(form.get("amount") || 0),
      date: (form.get("date") as string) || today,
      tripId: (form.get("tripId") as string) || undefined,
      receiptUrl: (form.get("receiptUrl") as string) || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Cost</DialogTitle>
          <DialogDescription>Add an expense entry for tracking.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="OTHER">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FUEL">Fuel</SelectItem>
                  <SelectItem value="TOLLS">Tolls</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="ACCOMMODATION">Accommodation</SelectItem>
                  <SelectItem value="FINES">Fines</SelectItem>
                  <SelectItem value="PERMITS">Permits</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={today} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Oil change, toll, etc." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" min="0" step="0.01" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tripId">Trip (optional)</Label>
              <Select
                name="tripId"
                defaultValue=""
                disabled={trips.isLoading || trips.isError || tripOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={trips.isLoading ? "Loading trips..." : tripOptions.length ? "Select trip" : "No trips"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No trip</SelectItem>
                  {tripOptions.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.tripNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="receiptUrl">Receipt URL</Label>
              <Input id="receiptUrl" name="receiptUrl" placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createExpense.isPending}>
              {createExpense.isPending ? "Saving..." : "Log Cost"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateTripDialog({ open, onClose }: DialogProps) {
  const queryClient = useQueryClient();
  const createTrip = useMutation({
    ...trpc.trip.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.trip.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.trip.stats.queryKey() });
      toast.success("Trip planned");
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 30 * 60 * 1000).toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const drivers = useQuery(trpc.driver.list.queryOptions({ limit: 100 }));
  const trucks = useQuery(trpc.truck.list.queryOptions({ limit: 100 }));
  const trailers = useQuery(trpc.trailer.list.queryOptions({ limit: 100 }));

  const driverOptions = drivers.data?.items ?? [];
  const truckOptions = trucks.data?.items ?? [];
  const trailerOptions = trailers.data?.items ?? [];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createTrip.mutate({
      driverId: (form.get("driverId") as string) || "",
      truckId: (form.get("truckId") as string) || "",
      trailerId: (form.get("trailerId") as string) || undefined,
      plannedStartTime: (form.get("plannedStartTime") as string) || defaultStart,
      plannedEndTime: (form.get("plannedEndTime") as string) || defaultEnd,
      plannedDistanceKm: form.get("plannedDistanceKm") ? Number(form.get("plannedDistanceKm")) : undefined,
      notes: (form.get("notes") as string) || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Plan Trip</DialogTitle>
          <DialogDescription>Create a trip with assignments and timing.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="driverId">Driver</Label>
              <Select
                name="driverId"
                required
                disabled={drivers.isLoading || drivers.isError || driverOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={drivers.isLoading ? "Loading drivers..." : driverOptions.length ? "Select driver" : "No drivers"} />
                </SelectTrigger>
                <SelectContent>
                  {driverOptions.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.user?.name ?? "Unassigned"} • {driver.licenseNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="truckId">Truck</Label>
              <Select
                name="truckId"
                required
                disabled={trucks.isLoading || trucks.isError || truckOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={trucks.isLoading ? "Loading trucks..." : truckOptions.length ? "Select truck" : "No trucks"} />
                </SelectTrigger>
                <SelectContent>
                  {truckOptions.map((truck) => (
                    <SelectItem key={truck.id} value={truck.id}>
                      {truck.unitNumber} • {truck.make} {truck.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trailerId">Trailer</Label>
              <Select
                name="trailerId"
                defaultValue=""
                disabled={trailers.isLoading || trailers.isError}
              >
                <SelectTrigger>
                  <SelectValue placeholder={trailers.isLoading ? "Loading trailers..." : trailerOptions.length ? "Select trailer" : "No trailer"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No trailer</SelectItem>
                  {trailerOptions.map((trailer) => (
                    <SelectItem key={trailer.id} value={trailer.id}>
                      {trailer.unitNumber} • {trailer.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plannedDistanceKm">Planned Distance (km)</Label>
              <Input id="plannedDistanceKm" name="plannedDistanceKm" type="number" min="0" step="1" placeholder="600" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plannedStartTime">Start Time</Label>
              <Input id="plannedStartTime" name="plannedStartTime" type="datetime-local" defaultValue={defaultStart} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plannedEndTime">End Time</Label>
              <Input id="plannedEndTime" name="plannedEndTime" type="datetime-local" defaultValue={defaultEnd} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Any special instructions" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTrip.isPending}>
              {createTrip.isPending ? "Planning..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DashboardActions() {
  const [dialog, setDialog] = useState<DialogType>(null);

  const closeDialog = () => setDialog(null);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="size-4" />
            Add new
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Quick create</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setDialog("driver")}>
            <UserRound className="mr-2 size-4" /> Driver
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("truck")}>
            <Truck className="mr-2 size-4" /> Truck
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("trailer")}>
            <Package className="mr-2 size-4" /> Trailer
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("customer")}>
            <Building2 className="mr-2 size-4" /> Customer
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("cost")}>
            <DollarSign className="mr-2 size-4" /> Cost
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="sm" className="gap-2" onClick={() => setDialog("trip")}>
        <Route className="size-4" />
        New Trip
      </Button>

      <CreateDriverDialog open={dialog === "driver"} onClose={closeDialog} />
      <CreateTruckDialog open={dialog === "truck"} onClose={closeDialog} />
      <CreateTrailerDialog open={dialog === "trailer"} onClose={closeDialog} />
      <CreateCustomerDialog open={dialog === "customer"} onClose={closeDialog} />
      <CreateCostDialog open={dialog === "cost"} onClose={closeDialog} />
      <CreateTripDialog open={dialog === "trip"} onClose={closeDialog} />
    </div>
  );
}
