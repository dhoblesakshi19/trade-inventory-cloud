
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface InventoryFormData {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  threshold: number;
  notes: string;
}

interface InventoryItemFormProps {
  formData: InventoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<InventoryFormData>>;
}

const InventoryItemForm = ({ formData, setFormData }: InventoryItemFormProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            Item Name<span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter item name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">
            Category<span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rice">Rice</SelectItem>
              <SelectItem value="Wheat">Wheat</SelectItem>
              <SelectItem value="Oil">Oil</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="quantity">
            Initial Stock<span className="text-red-500">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            min="0"
            placeholder="Enter initial stock quantity"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unit">
            Unit<span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="liter">liter</SelectItem>
              <SelectItem value="piece">piece</SelectItem>
              <SelectItem value="bag">bag</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="unitPrice">
            Unit Price (₹)<span className="text-red-500">*</span>
          </Label>
          <Input
            id="unitPrice"
            type="number"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
            min="0"
            step="0.01"
            placeholder="Enter cost price per unit"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="threshold">
            Low Stock Alert Threshold
          </Label>
          <Input
            id="threshold"
            type="number"
            value={formData.threshold}
            onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
            min="0"
            placeholder="10"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Description (Optional)</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Enter item description"
        />
      </div>
    </div>
  );
};

export default InventoryItemForm;
