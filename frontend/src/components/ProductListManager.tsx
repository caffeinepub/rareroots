import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Product } from '../backend';
import { useDeleteProduct } from '../hooks/useQueries';
import ProductForm from './ProductForm';
import { toast } from 'sonner';

interface ProductListManagerProps {
  products: Product[];
  isLoading: boolean;
}

export default function ProductListManager({ products, isLoading }: ProductListManagerProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const deleteProduct = useDeleteProduct();

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Product deleted.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete product.');
    }
  };

  if (editingProduct) {
    return (
      <div>
        <h3 className="font-serif text-lg font-semibold mb-4">Edit Product</h3>
        <ProductForm
          existingProduct={editingProduct}
          onSuccess={() => setEditingProduct(null)}
          onCancel={() => setEditingProduct(null)}
        />
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div>
        <h3 className="font-serif text-lg font-semibold mb-4">New Product</h3>
        <ProductForm
          onSuccess={() => setShowCreateForm(false)}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        <Button
          size="sm"
          onClick={() => setShowCreateForm(true)}
          className="bg-terracotta hover:bg-terracotta-dark text-primary-foreground border-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-serif text-lg text-foreground mb-1">No products yet</p>
          <p className="text-sm text-muted-foreground mb-4">Start by adding your first product listing.</p>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="bg-terracotta hover:bg-terracotta-dark text-primary-foreground border-0"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const thumbUrl = product.thumbnail?.getDirectURL();
            return (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-terracotta/40 transition-colors">
                <img
                  src={thumbUrl || '/assets/generated/product-placeholder.dim_600x600.png'}
                  alt={product.title}
                  className="h-14 w-14 rounded-lg object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_600x600.png'; }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-semibold text-foreground truncate">{product.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs">{product.region}</Badge>
                    <span className="text-sm text-terracotta font-medium">${Number(product.price).toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">{Number(product.stock)} in stock</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)} className="h-8 w-8">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{product.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(product.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
