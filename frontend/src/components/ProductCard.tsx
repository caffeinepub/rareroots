import { useNavigate } from "@tanstack/react-router";
import type { Product } from "../hooks/useQueries";
import BadgePill from "./BadgePill";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const thumbnailUrl = product.thumbnail
    ? product.thumbnail.getDirectURL()
    : "/assets/generated/product-placeholder.dim_600x600.png";

  const isLowStock = Number(product.stock) > 0 && Number(product.stock) <= 5;
  const isOutOfStock = Number(product.stock) === 0;

  return (
    <button
      onClick={() =>
        navigate({ to: "/products/$productId", params: { productId: product.id } })
      }
      className="text-left group w-full"
    >
      <div className="relative rounded-xl overflow-hidden mb-2 shadow-sm aspect-square">
        <img
          src={thumbnailUrl}
          alt={product.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isOutOfStock ? "opacity-60" : ""
          }`}
        />
        {product.rarityBadge && (
          <div className="absolute top-2 left-2">
            <BadgePill variant="gold" size="sm">
              {product.rarityBadge}
            </BadgePill>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="font-poppins text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-full">
              Sold Out
            </span>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="absolute bottom-2 right-2">
            <BadgePill variant="red" size="sm">
              Only {Number(product.stock)} left
            </BadgePill>
          </div>
        )}
      </div>
      <p className="font-poppins text-xs font-semibold text-earthBrown truncate">
        {product.title}
      </p>
      <p className="font-poppins text-sm font-bold text-forestGreen mt-0.5">
        ₹{Number(product.price).toLocaleString("en-IN")}
      </p>
    </button>
  );
}
