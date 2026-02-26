import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type {
  Producer,
  Product,
  Order,
  LiveStream,
  UserProfile,
  UserApprovalInfo,
} from "../backend";
import {
  OrderStatus,
  LiveStreamStatus,
  ApprovalStatus,
  UserRole,
} from "../backend";
import { ExternalBlob } from "../backend";
import { Principal } from "@dfinity/principal";

export type { Producer, Product, Order, LiveStream, UserProfile, UserApprovalInfo };
export { OrderStatus, LiveStreamStatus, ApprovalStatus, UserRole, ExternalBlob };

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Producers ───────────────────────────────────────────────────────────────

export function useGetAllProducers() {
  const { actor, isFetching } = useActor();

  return useQuery<Producer[]>({
    queryKey: ["producers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVerifiedProducers() {
  const { actor, isFetching } = useActor();

  return useQuery<Producer[]>({
    queryKey: ["verifiedProducers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVerifiedProducers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProducer(id: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Producer | null>({
    queryKey: ["producer", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getProducer(Principal.fromText(id));
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateOrUpdateProducer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      region: string;
      bio: string;
      profilePhoto: ExternalBlob | null;
      brandName: string;
      brandTagline: string;
      brandLogoBlob: ExternalBlob | null;
      brandColor: string;
      voiceStoryBlob: ExternalBlob | null;
      whatsApp: string;
      rarityBadge: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createOrUpdateProducer(
        params.name,
        params.region,
        params.bio,
        params.profilePhoto,
        params.brandName,
        params.brandTagline,
        params.brandLogoBlob,
        params.brandColor,
        params.voiceStoryBlob,
        params.whatsApp,
        params.rarityBadge
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["producers"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedProducers"] });
      queryClient.invalidateQueries({ queryKey: ["producer"] });
    },
  });
}

export function useFollowProducer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (producerId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.followProducer(Principal.fromText(producerId));
    },
    onSuccess: (_data, producerId) => {
      queryClient.invalidateQueries({ queryKey: ["producer", producerId] });
      queryClient.invalidateQueries({ queryKey: ["producers"] });
      queryClient.invalidateQueries({ queryKey: ["isFollowing", producerId] });
    },
  });
}

export function useUnfollowProducer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (producerId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unfollowProducer(Principal.fromText(producerId));
    },
    onSuccess: (_data, producerId) => {
      queryClient.invalidateQueries({ queryKey: ["producer", producerId] });
      queryClient.invalidateQueries({ queryKey: ["producers"] });
      queryClient.invalidateQueries({ queryKey: ["isFollowing", producerId] });
    },
  });
}

export function useIsFollowing(producerId: string | null, userPrincipal: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isFollowing", producerId, userPrincipal],
    queryFn: async () => {
      if (!actor || !producerId || !userPrincipal) return false;
      return actor.isFollowing(
        Principal.fromText(producerId),
        Principal.fromText(userPrincipal)
      );
    },
    enabled: !!actor && !isFetching && !!producerId && !!userPrincipal,
  });
}

// ─── Products ────────────────────────────────────────────────────────────────

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVerifiedProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ["verifiedProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVerifiedProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(id: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getProduct(id);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetProductsByProducer(producerId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ["productsByProducer", producerId],
    queryFn: async () => {
      if (!actor || !producerId) return [];
      return actor.getProductsByProducer(Principal.fromText(producerId));
    },
    enabled: !!actor && !isFetching && !!producerId,
  });
}

export function useCreateOrUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      title: string;
      description: string;
      price: bigint;
      region: string;
      stock: bigint;
      voiceNote: ExternalBlob | null;
      thumbnail: ExternalBlob | null;
      rarityBadge: string;
      rarityCountdownEnd: bigint | null;
      liveVideoURL: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createOrUpdateProduct(
        params.id,
        params.title,
        params.description,
        params.price,
        params.region,
        params.stock,
        params.voiceNote,
        params.thumbnail,
        params.rarityBadge,
        params.rarityCountdownEnd,
        params.liveVideoURL
      );
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["productsByProducer"] });
      queryClient.invalidateQueries({ queryKey: ["product", params.id] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteProduct(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["productsByProducer"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function useGetOrder(id: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getOrder(id);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetOrdersByBuyer() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ["ordersByBuyer"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrdersByBuyer();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrdersByProduct(productId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ["ordersByProduct", productId],
    queryFn: async () => {
      if (!actor || !productId) return [];
      return actor.getOrdersByProduct(productId);
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      productId: string;
      quantity: bigint;
      razorpayPaymentId?: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createOrder(
        params.productId,
        params.quantity,
        params.razorpayPaymentId ?? null
      );
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["ordersByBuyer"] });
      queryClient.invalidateQueries({ queryKey: ["ordersByProduct", params.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["productsByProducer"] });
      queryClient.invalidateQueries({ queryKey: ["product", params.productId] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; status: OrderStatus }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateOrderStatus(params.id, params.status);
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["ordersByBuyer"] });
      queryClient.invalidateQueries({ queryKey: ["ordersByProduct"] });
      queryClient.invalidateQueries({ queryKey: ["order", params.id] });
    },
  });
}

export function useCancelOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.cancelOrder(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["ordersByBuyer"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedProducts"] });
    },
  });
}

// ─── Live Streams ─────────────────────────────────────────────────────────────

export function useGetAllLiveStreams() {
  const { actor, isFetching } = useActor();

  return useQuery<LiveStream[]>({
    queryKey: ["liveStreams"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLiveStreams();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLiveStreamsByStatus(status: LiveStreamStatus) {
  const { actor, isFetching } = useActor();

  return useQuery<LiveStream[]>({
    queryKey: ["liveStreamsByStatus", status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLiveStreamsByStatus(status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLiveStreamsByProducer(producerId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<LiveStream[]>({
    queryKey: ["liveStreamsByProducer", producerId],
    queryFn: async () => {
      if (!actor || !producerId) return [];
      return actor.getLiveStreamsByProducer(Principal.fromText(producerId));
    },
    enabled: !!actor && !isFetching && !!producerId,
  });
}

export function useCreateLiveStream() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      startTime: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createLiveStream(params.title, params.description, params.startTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liveStreams"] });
      queryClient.invalidateQueries({ queryKey: ["liveStreamsByProducer"] });
      queryClient.invalidateQueries({ queryKey: ["liveStreamsByStatus"] });
    },
  });
}

export function useUpdateLiveStreamStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; status: LiveStreamStatus }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateLiveStreamStatus(params.id, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liveStreams"] });
      queryClient.invalidateQueries({ queryKey: ["liveStreamsByProducer"] });
      queryClient.invalidateQueries({ queryKey: ["liveStreamsByStatus"] });
    },
  });
}

export function useUpdateLiveStreamStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; story: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateLiveStreamStory(params.id, params.story);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liveStreams"] });
      queryClient.invalidateQueries({ queryKey: ["liveStreamsByProducer"] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminApproveProducer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (producerId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.adminApproveProducer(Principal.fromText(producerId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["producers"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedProducers"] });
      queryClient.invalidateQueries({ queryKey: ["producer"] });
    },
  });
}

export function useAdminRejectProducer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (producerId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.adminRejectProducer(Principal.fromText(producerId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["producers"] });
      queryClient.invalidateQueries({ queryKey: ["verifiedProducers"] });
      queryClient.invalidateQueries({ queryKey: ["producer"] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ["approvals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}
