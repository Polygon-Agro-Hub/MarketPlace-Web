"use client";
import React, { useState } from "react";
import CitySelection from "@/components/registration-components/CitySelection"; 
import SignupForm from "@/components/registration-components/SignupForm";              
import { CityResult } from "@/services/auth-service";      

export default function SignupPage() {
  const [confirmedCity, setConfirmedCity] = useState<CityResult | null>(null);

  const handleCityConfirmed = (city: CityResult) => {
    setConfirmedCity(city);
  };

  // Step 1 — City selection
  if (!confirmedCity) {
    return <CitySelection onCityConfirmed={handleCityConfirmed} />;
  }

  // Step 2 — Registration form (city is passed as a prop so you can pre-fill or store it)
  return <SignupForm selectedCity={confirmedCity} />;
}