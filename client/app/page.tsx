"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Users, MapPin, ClipboardCheck } from "lucide-react";
import { BookingData } from "@/types/BookingData";
import { convertToAPIRequest } from "@/helpers/requests";

export default function WhiteLadyBooking() {
  const [formData, setFormData] = useState<BookingData>({
    room: "",
    arrival: "",
    departure: "",
    occupants: 2,
    ages: [29, 20],
  });
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [rates, setRates] = useState<any>(null);

  useEffect(() => {
    const currentAges = [...formData.ages];
    const occupants = formData.occupants;

    if (occupants === 0) {
      setFormData((prev) => ({ ...prev, ages: [] }));
    } else if (occupants > currentAges.length) {
      const newAges = [...currentAges];
      for (let i = currentAges.length; i < occupants; i++) {
        newAges.push(25); // Default age
      }
      setFormData((prev) => ({ ...prev, ages: newAges }));
    } else if (occupants < currentAges.length) {
      setFormData((prev) => ({ ...prev, ages: currentAges.slice(0, occupants) }));
    }
  }, [formData.occupants]);

  const handleAgeChange = (index: number, age: string) => {
    const newAges = [...formData.ages];
    newAges[index] = age === "" ? 0 : Number.parseInt(age);
    setFormData({ ...formData, ages: newAges });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]); // Clear previous errors

    if (formData.occupants > 0) {
      const validAges = formData.ages.every((age) => age > 0 && age <= 120);
      if (!validAges) {
        setErrors(["Please enter valid ages for all occupants (1-120 years)"]);
        return;
      }
    }

    try {
      const payload = convertToAPIRequest(formData);
      console.log("Sent data:", JSON.stringify(payload));

      const response = await fetch("http://localhost:8000/index.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error details:", errorData);
        if (response.status === 422) {
          const validationErrors = errorData.errors
            ? Object.values(errorData.errors).flat() as string[]
            : [errorData.message || "Validation failed"];
          setErrors(validationErrors);
        } else {
          setErrors(["Server error: " + response.statusText]);
        }
        return;
      }

      // Handle success
      const responseData = await response.json();
      console.log("Success:", responseData);
      setRates(responseData.data);
      setShowModal(true);
    } catch (err) {
      setErrors(["Network error: " + (err as Error).message]);
      console.error("Fetch error:", err);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R${(amount / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-primary" />
            <Badge variant="secondary" className="text-sm font-medium">
              Premium Lodge Experience
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            White Lady Lodge
          </h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Experience luxury in the heart of nature. Check availability and pricing for your perfect getaway.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-semibold">Check Availability & Pricing</CardTitle>
              <CardDescription className="text-base">
                Select your preferred dates and room type to view our rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {errors.length > 0 && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                  {errors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Room Selection */}
                <div className="space-y-2">
                  <Label htmlFor="room" className="text-base font-medium">
                    Room Type
                  </Label>
                  <Select value={formData.room} onValueChange={(value) => setFormData({ ...formData, room: value })}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Choose your accommodation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard Room">Standard Room</SelectItem>
                      <SelectItem value="Deluxe Suite">Deluxe Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="arrival" className="text-base font-medium flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Arrival Date
                    </Label>
                    <Input
                      id="arrival"
                      type="date"
                      value={formData.arrival}
                      onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                      className="h-12 text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departure" className="text-base font-medium flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Departure Date
                    </Label>
                    <Input
                      id="departure"
                      type="date"
                      value={formData.departure}
                      onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                      className="h-12 text-base"
                      required
                    />
                  </div>
                </div>

                {/* Occupants */}
                <div className="space-y-2">
                  <Label htmlFor="occupants" className="text-base font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Occupants
                  </Label>
                  <Input
                    id="occupants"
                    type="number"
                    min="0"
                    max="8"
                    value={formData.occupants}
                    onChange={(e) => setFormData({ ...formData, occupants: Number.parseInt(e.target.value) || 0 })}
                    className="h-12 text-base"
                    required
                  />
                </div>

                {formData.occupants > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Ages of Occupants</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Array.from({ length: formData.occupants }, (_, index) => (
                        <div key={index} className="space-y-1">
                          <Label htmlFor={`age-${index}`} className="text-sm text-muted-foreground">
                            Guest {index + 1}
                          </Label>
                          <Input
                            id={`age-${index}`}
                            type="number"
                            min="1"
                            max="120"
                            value={formData.ages[index] || ""}
                            onChange={(e) => handleAgeChange(index, e.target.value)}
                            placeholder="Age"
                            className="h-10 text-base"
                            required
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Please enter the age for each guest (required for pricing)
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200"
                  disabled={
                    !formData.room ||
                    !formData.arrival ||
                    !formData.departure ||
                    (formData.occupants > 0 && formData.ages.some((age) => age <= 0))
                  }
                >
                  Check Availability & Pricing
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="fixed top-4 right-4 z-50">
              <DialogClose>
                <Button type="button" variant="secondary" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md">
                  Close
                </Button>
              </DialogClose>
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                <ClipboardCheck className="h-6 w-6 text-primary" />
                Booking Summary
              </DialogTitle>
              <DialogDescription className="text-base">
                Your reservation details and pricing breakdown
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* Booking Details */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Reservation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Room Type</p>
                      <p className="font-medium capitalize">{formData.room.replace("-", " ")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Occupants</p>
                      <p className="font-medium">
                        {formData.occupants === 0 ? "No occupants" : `${formData.occupants} guests`}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Check-in</p>
                      <p className="font-medium">{formatDate(formData.arrival)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Check-out</p>
                      <p className="font-medium">{formatDate(formData.departure)}</p>
                    </div>
                  </div>
                  {formData.occupants > 0 && (
                    <div>
                      <p className="text-muted-foreground text-sm">Guest Ages</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {formData.ages.map((age, index) => (
                          <Badge key={index} variant="secondary">
                            Guest {index + 1}: {age} years
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Information */}
              {rates && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Pricing Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Location ID</span>
                        <span className="font-mono text-sm">{rates["Location ID"]}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Booking Group</span>
                        <Badge variant="outline">{rates["Booking Group ID"]}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Available Rooms</span>
                        <span className="font-medium">{rates.Rooms} rooms</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Daily Rate</span>
                        <span className="font-medium">{formatCurrency(rates.Legs[0]["Effective Average Daily Rate"])}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Extras Charge</span>
                        <span className="font-medium">{formatCurrency(rates["Extras Charge"])}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Charge</span>
                        <span className="text-primary">{formatCurrency(rates["Total Charge"])}</span>
                      </div>
                    </div>

                    {/* Rate Details */}
                    <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                      <h4 className="font-medium mb-2">Rate Information</h4>
                      <p className="text-sm text-muted-foreground mb-2">{rates.Legs[0]["Special Rate Description"].trim().replace(/^\*\s*/, "")}</p>
                      <p className="text-xs text-muted-foreground">Rate Code: {rates.Legs[0]["Special Rate Code"]}</p>
                    </div>

                    {/* Deposit Information */}
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <h4 className="font-medium text-primary mb-2">Deposit Required</h4>
                      <p className="text-sm">
                        Full payment of <span className="font-semibold">{formatCurrency(rates.Legs[0]["Deposit Breakdown"][0]["Due Amount"])}</span> required
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Modify Search
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90">Proceed to Booking</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}