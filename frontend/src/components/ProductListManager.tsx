import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "./ProductForm";
import type { Product } from "../hooks/useQueries";
import { useDeleteProduct } from "../hooks/useQueries";
import BadgePill from "./BadgePill";
import { toast } from "sonner";

interface ProductListManagerProps {
  products: Product[];
  isLoading: boolean;
}

export default function ProductListManager({
  products,
  isLoading,
}: ProductListManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const deleteProduct = useDeleteProduct();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={24} className="animate-spin text-earthBrown" />
      </div>
    );
  }

  if (showForm || editingProduct) {
    return (
      <div>
        <h3 className="font-poppins font-semibold text-earthBrown mb-4">
          {editingProduct ? "Edit Product" : "New Product"}
        </h3>
        <ProductForm
          existing={editingProduct}
          onSuccess={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-poppins font-semibold text-earthBrown">
          My Products ({products.length})
        </h3>
        <Button
          onClick={() => setShowForm(true)}
          size="sm"
          className="bg-earthBrown hover:bg-earthBrown/90 text-ivoryCream font-poppins"
        >
          <Plus size={14} className="mr-1" /> Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8 text-earthBrown/50 font-roboto text-sm">
          No products yet. Add your first product!
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const thumbnailUrl = product.thumbnail
              ? product.thumbnail.getDirectURL()
              : "/assets/generated/product-placeholder.dim_600x600.png";

            return (
              <div
                key={product.id}
                className="flex gap-3 p-3 bg-white rounded-xl border border-earthBrown/10 shadow-sm"
              >
                <img
                  src={thumbnailUrl}
                  alt={product.title}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-poppins text-sm font-semibold text-earthBrown truncate">
                    {product.title}
                  </p>
                  <p className="font-roboto text-xs text-earthBrown/60">
                    ₹{Number(product.price).toLocaleString("en-IN")} · Stock:{" "}
                    {Number(product.stock)}
                  </p>
                  {product.rarityBadge && (
                    <div className="mt-1">
                      <BadgePill variant="gold" size="sm">
                        {product.rarityBadge}
                      </BadgePill>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="w-7 h-7 rounded-full border border-earthBrown/20 flex items-center justify-center hover:bg-earthBrown/5 text-earthBrown"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteProduct.isPending}
                    className="w-7 h-7 rounded-full border border-red-200 flex items-center justify-center hover:bg-red-50 text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
