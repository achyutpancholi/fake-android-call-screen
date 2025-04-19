
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PhoneStyleSelectorProps {
  value: 'android' | 'iphone';
  onChange: (value: 'android' | 'iphone') => void;
}

const PhoneStyleSelector: React.FC<PhoneStyleSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <Label className="text-lg font-semibold mb-2 block">Phone Style</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange as (value: string) => void}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="android" id="android" />
          <Label htmlFor="android">Android</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="iphone" id="iphone" />
          <Label htmlFor="iphone">iPhone</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PhoneStyleSelector;
