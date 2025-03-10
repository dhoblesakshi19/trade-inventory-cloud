
import React, { useState } from "react";
import Layout from "@/components/Layout";
import BackButton from "@/components/BackButton";
import { useInventory } from "@/context/InventoryContext";
import { exportInventoryToExcel } from "@/utils/excelUtils";
import InventoryTable from "@/components/inventory/InventoryTable";
import InventoryItemForm, { InventoryFormData } from "@/components/inventory/InventoryItemForm";
import EditItemDialog from "@/components/inventory/EditItemDialog";
import SearchAndFilter from "@/components/inventory/SearchAndFilter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const initialFormState: InventoryFormData = {
  name: "",
  category: "",
  quantity: 0,
  unit: "",
  unitPrice: 0,
  threshold: 0,
  notes: "",
};

const Inventory = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<InventoryFormData>(initialFormState);

  // Filter inventory based on search
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form data
  const resetForm = () => {
    setFormData(initialFormState);
  };

  // Handle add item
  const handleAddItem = () => {
    addInventoryItem(formData);
    setShowAddForm(false);
    resetForm();
  };

  // Handle edit item click
  const handleEditClick = (id: string) => {
    const item = inventory.find((item) => item.id === id);
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        threshold: item.threshold,
        notes: item.notes || "",
      });
      setSelectedItem(id);
      setIsEditDialogOpen(true);
    }
  };

  // Handle update item
  const handleUpdateItem = () => {
    if (selectedItem) {
      updateInventoryItem(selectedItem, formData);
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedItem(null);
    }
  };

  // Handle delete item
  const handleDeleteItem = (id: string) => {
    deleteInventoryItem(id);
  };

  // Export inventory to Excel
  const handleExportToExcel = () => {
    exportInventoryToExcel(filteredInventory);
  };

  if (showAddForm) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              className="mr-4" 
              onClick={() => setShowAddForm(false)}
            >
              Back to Inventory
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Add New Item</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>
                Add a new product to your inventory. Fill in all the details below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryItemForm formData={formData} setFormData={setFormData} />
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem}>Add Item</Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BackButton className="mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
              <p className="text-gray-600">Manage your products and stock levels</p>
            </div>
          </div>
          <Button 
            className="bg-brand-600 hover:bg-brand-700"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </div>
        
        <SearchAndFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onExportToExcel={handleExportToExcel}
        />
        
        <InventoryTable 
          inventory={filteredInventory}
          onEditClick={handleEditClick}
          onDeleteItem={handleDeleteItem}
        />
        
        <EditItemDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          formData={formData}
          setFormData={setFormData}
          onUpdateItem={handleUpdateItem}
        />
      </div>
    </Layout>
  );
};

export default Inventory;
