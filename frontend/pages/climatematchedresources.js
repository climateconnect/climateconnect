import React from 'react';
import ClimatePreferencesRoot from '../src/components/climatepreferences/ClimatePreferencesRoot';
import WideLayout from "../src/components/layouts/WideLayout"

export default function ClimatePreferences() {
  return (
    <WideLayout useFloodStdFont>
      <ClimatePreferencesRoot/>
    </WideLayout>
  )
}