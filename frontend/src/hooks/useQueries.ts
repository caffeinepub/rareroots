import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Producer, Product, Order, LiveStream, LiveStreamStatus, OrderStatus } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// ─── User Profile ───────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Producers ──────────────────────────────────────────────────────────────

export function useGetAllProducers() {
  const { actor, isFetching } = useActor();

  return useQuery<Producer[]>({
    queryKey: ['producers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProducer(id: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Producer | null>({
    queryKey: ['producer', id],
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
      brandName?: string;
      brandTagline?: string;
      brandLogoBlob?: ExternalBlob | null;
      brandColor?: string;
      voiceStoryBlob?: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateProducer(
        params.name,
        params.region,
        params.bio,
        params.profilePhoto,
        params.brandName ?? '',
        params.brandTagline ?? '',
        params.brandLogoBlob ?? null,
        params.brandColor ?? '',
        params.voiceStoryBlob ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      queryClient.invalidateQueries({ queryKey: ['producer'] });
    },
  });
}

// ─── Products ───────────────────────────────────────────────────────────────

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(id: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', id],
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
    queryKey: ['products', 'producer', producerId],
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
      rarityBadge?: string;
      rarityCountdownEnd?: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateProduct(
        params.id,
        params.title,
        params.description,
        params.price,
        params.region,
        params.stock,
        params.voiceNote,
        params.thumbnail,
        params.rarityBadge ?? '',
        params.rarityCountdownEnd ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export function useGetOrdersByBuyer() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders', 'buyer'],
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
    queryKey: ['orders', 'product', productId],
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
    mutationFn: async (params: { productId: string; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrder(params.productId, params.quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(params.id, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useGetOrder(id: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ['order', id],
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

// ─── Live Streams ────────────────────────────────────────────────────────────

export function useGetAllLiveStreams() {
  const { actor, isFetching } = useActor();

  return useQuery<LiveStream[]>({
    queryKey: ['liveStreams'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLiveStreams();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetLiveStreamsByStatus(status: LiveStreamStatus) {
  const { actor, isFetching } = useActor();

  return useQuery<LiveStream[]>({
    queryKey: ['liveStreams', 'status', status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLiveStreamsByStatus(status);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useGetLiveStreamsByProducer(producerId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<LiveStream[]>({
    queryKey: ['liveStreams', 'producer', producerId],
    queryFn: async () => {
      if (!actor || !producerId) return [];
      return actor.getLiveStreamsByProducer(Principal.fromText(producerId));
    },
    enabled: !!actor && !isFetching && !!producerId,
    refetchInterval: 15000,
  });
}

export function useCreateLiveStream() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { title: string; description: string; startTime: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLiveStream(params.title, params.description, params.startTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveStreams'] });
    },
  });
}

export function useUpdateLiveStreamStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; status: LiveStreamStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLiveStreamStatus(params.id, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveStreams'] });
    },
  });
}

export function useUpdateLiveStreamStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; story: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLiveStreamStory(params.id, params.story);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveStreams'] });
    },
  });
}

// ─── Follow System ───────────────────────────────────────────────────────────

export function useFollowProducer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (producerId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.followProducer(Principal.fromText(producerId));
    },
    onSuccess: (_data, producerId) => {
      queryClient.invalidateQueries({ queryKey: ['followerCount', producerId] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing', producerId] });
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      queryClient.invalidateQueries({ queryKey: ['producer', producerId] });
    },
  });
}

export function useUnfollowProducer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (producerId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unfollowProducer(Principal.fromText(producerId));
    },
    onSuccess: (_data, producerId) => {
      queryClient.invalidateQueries({ queryKey: ['followerCount', producerId] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing', producerId] });
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      queryClient.invalidateQueries({ queryKey: ['producer', producerId] });
    },
  });
}

export function useGetFollowerCount(producerId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['followerCount', producerId],
    queryFn: async () => {
      if (!actor || !producerId) return BigInt(0);
      return actor.getFollowerCount(Principal.fromText(producerId));
    },
    enabled: !!actor && !isFetching && !!producerId,
  });
}

export function useIsFollowing(producerId: string | null, userPrincipal: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isFollowing', producerId, userPrincipal],
    queryFn: async () => {
      if (!actor || !producerId || !userPrincipal) return false;
      return actor.isFollowing(Principal.fromText(producerId), Principal.fromText(userPrincipal));
    },
    enabled: !!actor && !isFetching && !!producerId && !!userPrincipal,
  });
}
