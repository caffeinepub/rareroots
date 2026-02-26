import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Set "mo:core/Set";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  // Access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Approval system
  let approvalState = UserApproval.initState(accessControlState);

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  public type Producer = {
    id : Principal;
    name : Text;
    region : Text;
    bio : Text;
    profilePhoto : ?Storage.ExternalBlob;
    brandName : Text;
    brandTagline : Text;
    brandLogoBlob : ?Storage.ExternalBlob;
    brandColor : Text;
    voiceStoryBlob : ?Storage.ExternalBlob;
    followerCount : Nat;
    verified : Bool;
    whatsApp : Text;
    rarityBadge : Text;
  };

  public type Product = {
    id : Text;
    producerId : Principal;
    title : Text;
    description : Text;
    price : Int;
    region : Text;
    stock : Int;
    voiceNote : ?Storage.ExternalBlob;
    thumbnail : ?Storage.ExternalBlob;
    rarityBadge : Text;
    rarityCountdownEnd : ?Int;
    liveVideoURL : ?Text;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  module OrderStatus {
    public func compare(status1 : OrderStatus, status2 : OrderStatus) : Order.Order {
      switch (status1, status2) {
        case (#pending, #pending) { #equal };
        case (#pending, _) { #less };
        case (#confirmed, #pending) { #greater };
        case (#confirmed, #confirmed) { #equal };
        case (#confirmed, _) { #less };
        case (#shipped, #pending) { #greater };
        case (#shipped, #confirmed) { #greater };
        case (#shipped, #shipped) { #equal };
        case (#shipped, _) { #less };
        case (#delivered, #cancelled) { #greater };
        case (#delivered, #delivered) { #equal };
        case (#delivered, _) { #less };
        case (#cancelled, #cancelled) { #equal };
        case (#cancelled, _) { #greater };
      };
    };
  };

  public type Order = {
    id : Text;
    productId : Text;
    buyer : Principal;
    quantity : Int;
    status : OrderStatus;
    timestamp : Time.Time;
    razorpayPaymentId : ?Text; // New field for Razorpay payment reference
  };

  public type LiveStreamStatus = {
    #scheduled;
    #active;
    #ended;
  };

  public type LiveStream = {
    id : Text;
    producerId : Principal;
    title : Text;
    description : Text;
    status : LiveStreamStatus;
    startTime : Time.Time;
    story : Text;
  };

  module LiveStream {
    public func compareByStartTime(liveStream1 : LiveStream, liveStream2 : LiveStream) : Order.Order {
      Int.compare(liveStream1.startTime, liveStream2.startTime);
    };
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let producers = Map.empty<Principal, Producer>();
  let products = Map.empty<Text, Product>();
  let orders = Map.empty<Text, Order>();
  let liveStreams = Map.empty<Text, LiveStream>();
  let followers = Map.empty<Principal, Set.Set<Principal>>();

  // Approval system functions
  public query ({ caller }) func isCallerApproved() : async Bool {
    // Admins are always approved
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      true;
    } else {
      UserApproval.isApproved(approvalState, caller);
    };
  };

  public shared ({ caller }) func requestApproval() : async () {
    // Only authenticated users (not guests/anonymous) can request approval
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can request approval");
    };
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // User Profile functions (required by frontend)

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Producer CRUD

  public shared ({ caller }) func createOrUpdateProducer(
    name : Text,
    region : Text,
    bio : Text,
    profilePhoto : ?Storage.ExternalBlob,
    brandName : Text,
    brandTagline : Text,
    brandLogoBlob : ?Storage.ExternalBlob,
    brandColor : Text,
    voiceStoryBlob : ?Storage.ExternalBlob,
    whatsApp : Text,
    rarityBadge : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create or update producer. ");
    };

    let existingProducer = switch (producers.get(caller)) {
      case (?p) { p };
      case (null) {
        {
          id = caller;
          name = "";
          region = "";
          bio = "";
          profilePhoto = null;
          brandName = "";
          brandTagline = "";
          brandLogoBlob = null;
          brandColor = "";
          voiceStoryBlob = null;
          followerCount = 0;
          verified = false;
          whatsApp = "";
          rarityBadge = "";
        };
      };
    };

    let updatedProducer : Producer = {
      existingProducer with
      name;
      region;
      bio;
      profilePhoto;
      brandName;
      brandTagline;
      brandLogoBlob;
      brandColor;
      voiceStoryBlob;
      whatsApp;
      rarityBadge;
    };

    producers.add(caller, updatedProducer);
  };

  public query func getProducer(id : Principal) : async Producer {
    switch (producers.get(id)) {
      case (?producer) { producer };
      case (null) { Runtime.trap("Producer does not exist") };
    };
  };

  public query func getAllProducers() : async [Producer] {
    producers.values().toArray();
  };

  public query func getVerifiedProducers() : async [Producer] {
    producers.values().toArray().filter(func(p) { p.verified });
  };

  public shared ({ caller }) func deleteProducer(id : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete producers.");
    };
    if (producers.containsKey(id)) {
      producers.remove(id);
    } else {
      Runtime.trap("Producer does not exist. ");
    };
  };

  public shared ({ caller }) func adminApproveProducer(producerId : Principal) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve producers. ");
    };

    switch (producers.get(producerId)) {
      case (?producer) {
        let updatedProducer = {
          producer with verified = true;
        };
        producers.add(producerId, updatedProducer);
        true;
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func adminRejectProducer(producerId : Principal) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject producers. ");
    };

    switch (producers.get(producerId)) {
      case (?producer) {
        let updatedProducer = {
          producer with verified = false;
        };
        producers.add(producerId, updatedProducer);
        true;
      };
      case (null) { false };
    };
  };

  // Product CRUD

  public shared ({ caller }) func createOrUpdateProduct(
    id : Text,
    title : Text,
    description : Text,
    price : Int,
    region : Text,
    stock : Int,
    voiceNote : ?Storage.ExternalBlob,
    thumbnail : ?Storage.ExternalBlob,
    rarityBadge : Text,
    rarityCountdownEnd : ?Int,
    liveVideoURL : ?Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create or update products.");
    };

    // If product already exists, verify ownership
    switch (products.get(id)) {
      case (?existingProduct) {
        if (existingProduct.producerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the original producer or admins can update this product. ");
        };
      };
      case (null) {};
    };

    let product : Product = {
      id;
      producerId = caller;
      title;
      description;
      price;
      region;
      stock;
      voiceNote;
      thumbnail;
      rarityBadge;
      rarityCountdownEnd;
      liveVideoURL;
    };

    products.add(id, product);
  };

  public query func getProduct(id : Text) : async Product {
    switch (products.get(id)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product does not exist") };
    };
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProductsByProducer(producerId : Principal) : async [Product] {
    if (not producers.containsKey(producerId)) {
      Runtime.trap("Producer does not exist");
    };
    products.values().toArray().filter(func(p) { p.producerId == producerId });
  };

  public query func getProductsByRegion(region : Text) : async [Product] {
    products.values().toArray().filter(func(p) { p.region == region });
  };

  public query func getProductsByPriceRange(minPrice : Int, maxPrice : Int) : async [Product] {
    products.values().toArray().filter(func(p) { p.price >= minPrice and p.price <= maxPrice });
  };

  public query func getProductsInStock() : async [Product] {
    products.values().toArray().filter(func(p) { p.stock > 0 });
  };

  public query func getProductsWithLiveVideo() : async [Product] {
    products.values().toArray().filter(func(p) {
      switch (p.liveVideoURL) {
        case (null) { false };
        case (?url) { url != "" };
      };
    });
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    switch (products.get(id)) {
      case (?product) {
        if (product.producerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the producer or admins can delete a product. ");
        };
        products.remove(id);
      };
      case (null) { Runtime.trap("Product does not exist") };
    };
  };

  // Order CRUD

  public shared ({ caller }) func createOrder(productId : Text, quantity : Int, razorpayPaymentId : ?Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can create orders. ");
    };

    if (quantity <= 0) {
      Runtime.trap("Invalid quantity");
    };

    let product = switch (products.get(productId)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product does not exist") };
    };

    if (quantity > product.stock) { Runtime.trap("Not enough stock available") };

    let now = Time.now();
    let orderId = productId.concat(now.toText());

    let order = {
      id = orderId;
      productId;
      buyer = caller;
      quantity;
      status = #pending;
      timestamp = now;
      razorpayPaymentId; // Store the Razorpay payment reference
    };

    orders.add(orderId, order);

    let updatedProduct = {
      product with stock = product.stock - quantity;
    };
    products.add(productId, updatedProduct);

    orderId;
  };

  public query ({ caller }) func getOrder(id : Text) : async Order {
    switch (orders.get(id)) {
      case (?order) {
        // Only the buyer, the producer of the product, or an admin can view an order
        let product = switch (products.get(order.productId)) {
          case (?p) { p };
          case (null) { Runtime.trap("Product does not exist") };
        };
        if (order.buyer != caller and product.producerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the buyer, the producer, or admins can view this order. ");
        };
        order;
      };
      case (null) { Runtime.trap("Order does not exist") };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders.");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getOrdersByBuyer() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their orders.");
    };
    orders.values().toArray().filter(func(o) { o.buyer == caller });
  };

  public query ({ caller }) func getOrdersByProduct(productId : Text) : async [Order] {
    // Only the producer of the product or an admin can view all orders for a product
    let product = switch (products.get(productId)) {
      case (?p) { p };
      case (null) { Runtime.trap("Product does not exist") };
    };
    if (product.producerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the producer or admins can view orders for this product. ");
    };
    orders.values().toArray().filter(func(o) { o.productId == productId });
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view orders by status. ");
    };
    orders.values().toArray().filter(func(o) { o.status == status });
  };

  public shared ({ caller }) func updateOrderStatus(id : Text, status : OrderStatus) : async () {
    let order = switch (orders.get(id)) {
      case (?order) { order };
      case (null) { Runtime.trap("Order does not exist") };
    };

    let product = switch (products.get(order.productId)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product does not exist") };
    };

    if (product.producerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the producer or admins can update the order status. ");
    };

    let updatedOrder = {
      order with status;
    };
    orders.add(id, updatedOrder);
  };

  public shared ({ caller }) func cancelOrder(id : Text) : async () {
    let order = switch (orders.get(id)) {
      case (?order) { order };
      case (null) { Runtime.trap("Order does not exist") };
    };

    if (order.buyer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the buyer or admins can cancel the order. ");
    };

    let updatedOrder = {
      order with status = #cancelled;
    };
    orders.add(id, updatedOrder);

    let product = switch (products.get(order.productId)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product does not exist") };
    };

    let updatedProduct = {
      product with stock = product.stock + order.quantity;
    };
    products.add(order.productId, updatedProduct);
  };

  // LiveStream CRUD

  public shared ({ caller }) func createLiveStream(title : Text, description : Text, startTime : Time.Time) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create live streams. ");
    };

    let now = Time.now();
    let id = title.concat(now.toText());

    let liveStream : LiveStream = {
      id;
      producerId = caller;
      title;
      description;
      status = #scheduled;
      startTime;
      story = "";
    };

    liveStreams.add(id, liveStream);
    id;
  };

  public query func getLiveStream(id : Text) : async LiveStream {
    switch (liveStreams.get(id)) {
      case (?liveStream) { liveStream };
      case (null) { Runtime.trap("Live stream does not exist") };
    };
  };

  public query func getAllLiveStreams() : async [LiveStream] {
    liveStreams.values().toArray();
  };

  public query func getLiveStreamsByProducer(producerId : Principal) : async [LiveStream] {
    liveStreams.values().toArray().filter(func(ls) { ls.producerId == producerId });
  };

  public query func getLiveStreamsByStatus(status : LiveStreamStatus) : async [LiveStream] {
    liveStreams.values().toArray().filter(func(ls) { ls.status == status }).sort(LiveStream.compareByStartTime);
  };

  public shared ({ caller }) func updateLiveStreamStatus(id : Text, status : LiveStreamStatus) : async () {
    let liveStream = switch (liveStreams.get(id)) {
      case (?liveStream) { liveStream };
      case (null) { Runtime.trap("Live stream does not exist") };
    };

    if (liveStream.producerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the producer or admins can update the live stream. ");
    };

    let updatedLiveStream = {
      liveStream with status;
    };
    liveStreams.add(id, updatedLiveStream);
  };

  public shared ({ caller }) func updateLiveStreamStory(id : Text, story : Text) : async () {
    let liveStream = switch (liveStreams.get(id)) {
      case (?liveStream) { liveStream };
      case (null) { Runtime.trap("Live stream does not exist") };
    };

    if (liveStream.producerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the producer or admins can update the live stream. ");
    };

    let updatedLiveStream = {
      liveStream with story;
    };
    liveStreams.add(id, updatedLiveStream);
  };

  // Helper Functions

  public query func getLiveStreamsByRegions(regions : [Text]) : async [LiveStream] {
    if (regions.size() == 0) { return [] };
    let liveStreamsList = List.empty<LiveStream>();

    for (region in regions.values()) {
      let streams = liveStreams.values().toArray().filter(func(ls) { ls.status == #active and region.compare(ls.title) == #equal });
      for (item in streams.values()) {
        liveStreamsList.add(item);
      };
    };

    liveStreamsList.toArray();
  };

  public query func getVerifiedProducts() : async [Product] {
    products.values().toArray().filter(func(p) {
      switch (producers.get(p.producerId)) {
        case (?producer) { producer.verified };
        case (null) { false };
      };
    });
  };

  public query func getProductsByVerifiedProducer(producerId : Principal) : async [Product] {
    switch (producers.get(producerId)) {
      case (?producer) {
        if (producer.verified) {
          products.values().toArray().filter(func(p) { p.producerId == producerId });
        } else {
          [];
        };
      };
      case (null) { [] };
    };
  };

  public query func getVerifiedProductsByRegion(region : Text) : async [Product] {
    products.values().toArray().filter(func(p) {
      switch (producers.get(p.producerId)) {
        case (?producer) { producer.verified and p.region == region };
        case (null) { false };
      };
    });
  };

  public query func getUniqueRegions() : async [Text] {
    let regionSet = Set.empty<Text>();

    for (product in products.values().toArray().values()) {
      regionSet.add(product.region);
    };

    regionSet.toArray();
  };

  public query func getProducersByRegion(region : Text) : async [Producer] {
    let cleanedRegion = region # "" : Text;
    producers.values().toArray().filter(func(p) { p.region == cleanedRegion });
  };

  public query func getProductsByRarityBadge(rarityBadge : Text) : async [Product] {
    products.values().toArray().filter(func(p) { p.rarityBadge == rarityBadge });
  };

  public query func getProductsByBrandName(brandName : Text) : async [Product] {
    products.values().toArray().filter(func(p) {
      switch (producers.get(p.producerId)) {
        case (?producer) { producer.brandName == brandName };
        case (null) { false };
      };
    });
  };

  public query func getRegionalProductsByProducer(producerId : Principal, region : Text) : async [Product] {
    products.values().toArray().filter(func(p) { p.producerId == producerId and p.region == region });
  };

  public query func getVerifiedProducerProducts(producerId : Principal) : async [Product] {
    switch (producers.get(producerId)) {
      case (?producer) {
        if (producer.verified) {
          products.values().toArray().filter(func(p) { p.producerId == producerId });
        } else {
          [];
        };
      };
      case (null) { [] };
    };
  };

  // Follower System

  public shared ({ caller }) func followProducer(producerId : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can follow producers. ");
    };

    if (not producers.containsKey(producerId)) {
      Runtime.trap("Producer does not exist. ");
    };

    switch (followers.get(producerId)) {
      case (?existingFollowers) {
        if (existingFollowers.contains(caller)) {
          Runtime.trap("You are already following this producer. ");
        };
        let newFollowers = existingFollowers.clone();
        newFollowers.add(caller);
        followers.add(producerId, newFollowers);
      };
      case (null) {
        let newFollowers = Set.singleton(caller);
        followers.add(producerId, newFollowers);
      };
    };

    let producer = switch (producers.get(producerId)) {
      case (?producer) { producer };
      case (null) { Runtime.trap("Producer does not exist") };
    };

    let updatedProducer = {
      producer with followerCount = producer.followerCount + 1;
    };
    producers.add(producerId, updatedProducer);
  };

  public shared ({ caller }) func unfollowProducer(producerId : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can unfollow producers. ");
    };

    if (not producers.containsKey(producerId)) {
      Runtime.trap("Producer does not exist");
    };

    switch (followers.get(producerId)) {
      case (?existingFollowers) {
        if (not existingFollowers.contains(caller)) {
          Runtime.trap("You are not following this producer. ");
        };
        let newFollowers = existingFollowers.clone();
        newFollowers.remove(caller);
        if (newFollowers.isEmpty()) {
          followers.remove(producerId);
        } else {
          followers.add(producerId, newFollowers);
        };
      };
      case (null) { Runtime.trap("You are not following this producer.") };
    };

    let producer = switch (producers.get(producerId)) {
      case (?producer) { producer };
      case (null) { Runtime.trap("Producer does not exist") };
    };

    let updatedProducer = {
      producer with followerCount = if (producer.followerCount > 0) { producer.followerCount - 1 } else { 0 };
    };
    producers.add(producerId, updatedProducer);
  };

  public query func getFollowerCount(producerId : Principal) : async Nat {
    switch (producers.get(producerId)) {
      case (?producer) { producer.followerCount };
      case (null) { Runtime.trap("Producer does not exist") };
    };
  };

  public query func isFollowing(producerId : Principal, user : Principal) : async Bool {
    switch (followers.get(producerId)) {
      case (?followerSet) {
        followerSet.contains(user);
      };
      case (null) { false };
    };
  };
};
