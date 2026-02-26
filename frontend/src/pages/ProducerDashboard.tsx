import { useNavigate } from "@tanstack/react-router";
import Layout from "../components/Layout";
import ProductListManager from "../components/ProductListManager";
import ProducerProfileForm from "../components/ProducerProfileForm";
import ProducerOrderList from "../components/ProducerOrderList";
import LiveSessionForm from "../components/LiveSessionForm";
import {
  useGetCallerUserProfile,
  useGetAllProducers,
  useGetProductsByProducer,
  useGetLiveStreamsByProducer,
} from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Paintbrush, LogOut, Loader2 } from "lucide-react";

export default function ProducerDashboard() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: producers } = useGetAllProducers();

  const principalStr = identity?.getPrincipal().toString() ?? null;
  const myProducer = producers?.find((p) => p.id.toString() === principalStr) ?? null;

  const { data: myProducts = [], isLoading: productsLoading } =
    useGetProductsByProducer(principalStr);
  const { data: liveStreams = [] } = useGetLiveStreamsByProducer(principalStr);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/home" });
  };

  if (!identity) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <h2
            className="font-poppins font-bold text-xl mb-4"
            style={{ color: "#8B4513" }}
          >
            Login Required
          </h2>
          <p
            className="font-roboto text-center mb-6"
            style={{ color: "#666" }}
          >
            Please login to access your producer dashboard
          </p>
          <button
            onClick={() => navigate({ to: "/home" })}
            className="px-8 py-3 rounded-full font-poppins font-semibold text-white"
            style={{ backgroundColor: "#8B4513" }}
          >
            Go Home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1
              className="font-poppins font-bold"
              style={{ fontSize: "22px", color: "#8B4513" }}
            >
              Producer Dashboard
            </h1>
            <p className="font-roboto text-sm" style={{ color: "#666" }}>
              {myProducer?.brandName || userProfile?.name || "Your Brand"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-2 rounded-full font-roboto text-sm border"
            style={{ color: "#666", borderColor: "#ddd" }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Brand Setup CTA */}
        {!myProducer?.brandName && (
          <div
            className="rounded-xl p-4 mb-5 flex items-center justify-between"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,69,19,0.08), rgba(218,165,32,0.12))",
              border: "1.5px dashed #DAA520",
            }}
          >
            <div>
              <p
                className="font-poppins font-bold text-sm"
                style={{ color: "#8B4513" }}
              >
                🎨 Complete Your Brand
              </p>
              <p
                className="font-roboto text-xs mt-1"
                style={{ color: "#666" }}
              >
                Set up your brand identity to attract buyers
              </p>
            </div>
            <button
              onClick={() => navigate({ to: "/brand-setup" })}
              className="px-4 py-2 rounded-full font-poppins font-semibold text-sm text-white shrink-0"
              style={{ backgroundColor: "#228B22" }}
            >
              Setup Brand
            </button>
          </div>
        )}

        {myProducer?.brandName && (
          <div
            className="rounded-xl p-4 mb-5 flex items-center justify-between"
            style={{
              backgroundColor: "white",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div className="flex items-center gap-3">
              {myProducer.brandLogoBlob && (
                <img
                  src={myProducer.brandLogoBlob.getDirectURL()}
                  alt="Brand Logo"
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p
                  className="font-poppins font-bold"
                  style={{ color: "#8B4513" }}
                >
                  {myProducer.brandName}
                </p>
                <p className="font-roboto text-xs" style={{ color: "#666" }}>
                  {myProducer.brandTagline}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate({ to: "/brand-setup" })}
              className="flex items-center gap-1 px-3 py-2 rounded-full font-roboto text-xs border"
              style={{ color: "#DAA520", borderColor: "#DAA520" }}
            >
              <Paintbrush className="w-3 h-3" />
              Edit Brand
            </button>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="profile">
          <TabsList
            className="w-full mb-4"
            style={{ backgroundColor: "rgba(139,69,19,0.08)" }}
          >
            <TabsTrigger value="profile" className="flex-1 text-xs font-poppins">
              Profile
            </TabsTrigger>
            <TabsTrigger value="products" className="flex-1 text-xs font-poppins">
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 text-xs font-poppins">
              Orders
            </TabsTrigger>
            <TabsTrigger value="live" className="flex-1 text-xs font-poppins">
              Live
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProducerProfileForm existing={myProducer} />
          </TabsContent>

          <TabsContent value="products">
            <ProductListManager
              products={myProducts}
              isLoading={productsLoading}
            />
          </TabsContent>

          <TabsContent value="orders">
            <ProducerOrderList products={myProducts} />
          </TabsContent>

          <TabsContent value="live">
            <LiveSessionForm existingStreams={liveStreams} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
