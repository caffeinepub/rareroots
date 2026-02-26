import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    name: string;
    role: string;
}
export type Time = bigint;
export interface Producer {
    id: Principal;
    bio: string;
    region: string;
    verified: boolean;
    brandLogoBlob?: ExternalBlob;
    rarityBadge: string;
    name: string;
    profilePhoto?: ExternalBlob;
    whatsApp: string;
    voiceStoryBlob?: ExternalBlob;
    brandTagline: string;
    followerCount: bigint;
    brandName: string;
    brandColor: string;
}
export interface Order {
    id: string;
    razorpayPaymentId?: string;
    status: OrderStatus;
    productId: string;
    timestamp: Time;
    quantity: bigint;
    buyer: Principal;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface Product {
    id: string;
    region: string;
    voiceNote?: ExternalBlob;
    title: string;
    rarityBadge: string;
    thumbnail?: ExternalBlob;
    liveVideoURL?: string;
    producerId: Principal;
    description: string;
    stock: bigint;
    rarityCountdownEnd?: bigint;
    price: bigint;
}
export interface LiveStream {
    id: string;
    startTime: Time;
    status: LiveStreamStatus;
    title: string;
    producerId: Principal;
    description: string;
    story: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum LiveStreamStatus {
    scheduled = "scheduled",
    active = "active",
    ended = "ended"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminApproveProducer(producerId: Principal): Promise<boolean>;
    adminRejectProducer(producerId: Principal): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelOrder(id: string): Promise<void>;
    createLiveStream(title: string, description: string, startTime: Time): Promise<string>;
    createOrUpdateProducer(name: string, region: string, bio: string, profilePhoto: ExternalBlob | null, brandName: string, brandTagline: string, brandLogoBlob: ExternalBlob | null, brandColor: string, voiceStoryBlob: ExternalBlob | null, whatsApp: string, rarityBadge: string): Promise<void>;
    createOrUpdateProduct(id: string, title: string, description: string, price: bigint, region: string, stock: bigint, voiceNote: ExternalBlob | null, thumbnail: ExternalBlob | null, rarityBadge: string, rarityCountdownEnd: bigint | null, liveVideoURL: string | null): Promise<void>;
    createOrder(productId: string, quantity: bigint, razorpayPaymentId: string | null): Promise<string>;
    deleteProducer(id: Principal): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    followProducer(producerId: Principal): Promise<void>;
    getAllLiveStreams(): Promise<Array<LiveStream>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducers(): Promise<Array<Producer>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFollowerCount(producerId: Principal): Promise<bigint>;
    getLiveStream(id: string): Promise<LiveStream>;
    getLiveStreamsByProducer(producerId: Principal): Promise<Array<LiveStream>>;
    getLiveStreamsByRegions(regions: Array<string>): Promise<Array<LiveStream>>;
    getLiveStreamsByStatus(status: LiveStreamStatus): Promise<Array<LiveStream>>;
    getOrder(id: string): Promise<Order>;
    getOrdersByBuyer(): Promise<Array<Order>>;
    getOrdersByProduct(productId: string): Promise<Array<Order>>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<Order>>;
    getProducer(id: Principal): Promise<Producer>;
    getProducersByRegion(region: string): Promise<Array<Producer>>;
    getProduct(id: string): Promise<Product>;
    getProductsByBrandName(brandName: string): Promise<Array<Product>>;
    getProductsByPriceRange(minPrice: bigint, maxPrice: bigint): Promise<Array<Product>>;
    getProductsByProducer(producerId: Principal): Promise<Array<Product>>;
    getProductsByRarityBadge(rarityBadge: string): Promise<Array<Product>>;
    getProductsByRegion(region: string): Promise<Array<Product>>;
    getProductsByVerifiedProducer(producerId: Principal): Promise<Array<Product>>;
    getProductsInStock(): Promise<Array<Product>>;
    getProductsWithLiveVideo(): Promise<Array<Product>>;
    getRegionalProductsByProducer(producerId: Principal, region: string): Promise<Array<Product>>;
    getUniqueRegions(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVerifiedProducerProducts(producerId: Principal): Promise<Array<Product>>;
    getVerifiedProducers(): Promise<Array<Producer>>;
    getVerifiedProducts(): Promise<Array<Product>>;
    getVerifiedProductsByRegion(region: string): Promise<Array<Product>>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isFollowing(producerId: Principal, user: Principal): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    unfollowProducer(producerId: Principal): Promise<void>;
    updateLiveStreamStatus(id: string, status: LiveStreamStatus): Promise<void>;
    updateLiveStreamStory(id: string, story: string): Promise<void>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
}
